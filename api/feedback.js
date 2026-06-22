import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";
import { getOssConfig, putJsonObject } from "../server/oss.js";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;
const MAX_BODY_BYTES = 12 * 1024;
const MAX_SOURCE_CHARS = 1200;
const MAX_REPLY_CHARS = 500;
const FEEDBACK_PREFIX = "yidu-feedback/";
const EVENTS = new Set(["serve", "copy", "share", "refresh", "rating"]);
const RATING_REASONS = new Set([
  "can_send",
  "awkward",
  "missed_context",
  "too_offensive",
  "wrong_mode",
]);
const rateBuckets = new Map();

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    enforceBodySize(req);
    enforceRateLimit(getClientIp(req));
    const config = getOssConfig();
    if (!config) throw new HttpError(503, "Feedback storage is not configured");

    const record = createFeedbackRecord(req.body || {});
    const key = createObjectKey(record.id, record.receivedAt);
    await putJsonObject(config, key, record);
    return res.status(202).json({ ok: true });
  } catch (err) {
    console.warn("[feedback]", JSON.stringify({
      status: err.status || 500,
      error: String(err.message || "Internal error").slice(0, 300),
    }));
    return res.status(err.status || 500).json({ error: err.message || "Internal error" });
  }
}

export function createFeedbackRecord(body, now = new Date()) {
  const clean = validateFeedback(body);
  const receivedAt = now.toISOString();
  const source = redactSensitiveText(clean.source, MAX_SOURCE_CHARS);
  const text = redactSensitiveText(clean.text, MAX_REPLY_CHARS);

  return {
    schemaVersion: 2,
    id: crypto.randomUUID(),
    event: clean.event,
    task: "misread",
    mode: clean.mode,
    route: clean.route,
    weapon: clean.weapon,
    batchId: clean.batchId,
    replyId: clean.replyId,
    replyIndex: clean.replyIndex,
    promptVersion: clean.promptVersion,
    verdict: clean.verdict,
    reason: clean.reason,
    source,
    sourceHash: source ? hashSource(source) : "",
    text,
    clientTs: clean.ts,
    receivedAt,
  };
}

export function validateFeedback(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Invalid feedback payload");
  }

  const event = typeof body.event === "string" && EVENTS.has(body.event) ? body.event : "";
  if (!event) throw new HttpError(400, "Invalid feedback event");
  if (body.task !== "misread") throw new HttpError(400, "Invalid feedback task");

  const mode = body.mode === "person" || body.mode === "crush" ? body.mode : "";
  if (!mode) throw new HttpError(400, "Invalid feedback mode");

  const source = cleanText(body.source, MAX_SOURCE_CHARS);
  const text = cleanText(body.text, MAX_REPLY_CHARS);
  if (["serve", "copy", "rating"].includes(event) && (!source || !text)) {
    throw new HttpError(400, `${event} feedback requires source and text`);
  }

  const batchId = cleanToken(body.batchId, 64);
  const replyId = cleanToken(body.replyId, 72);
  const replyIndex = normalizeReplyIndex(body.replyIndex);
  const promptVersion = cleanToken(body.promptVersion, 48);
  const verdict = body.verdict === "positive" || body.verdict === "negative" ? body.verdict : "";
  const reason = typeof body.reason === "string" && RATING_REASONS.has(body.reason) ? body.reason : "";

  if (["serve", "rating", "refresh"].includes(event) && !batchId) {
    throw new HttpError(400, `${event} feedback requires batchId`);
  }
  if (["serve", "rating"].includes(event) && (!replyId || replyIndex === null)) {
    throw new HttpError(400, `${event} feedback requires reply identity`);
  }
  if (event === "rating" && (!verdict || !reason)) {
    throw new HttpError(400, "Rating feedback requires verdict and reason");
  }
  if (event === "rating" && verdict === "positive" && reason !== "can_send") {
    throw new HttpError(400, "Positive rating requires can_send reason");
  }
  if (event === "rating" && verdict === "negative" && reason === "can_send") {
    throw new HttpError(400, "Negative rating requires a rejection reason");
  }

  return {
    event,
    mode,
    route: cleanToken(body.route, 48),
    weapon: cleanText(body.weapon, 40),
    batchId,
    replyId,
    replyIndex,
    promptVersion,
    verdict,
    reason,
    source,
    text,
    ts: normalizeTimestamp(body.ts),
  };
}

export function redactSensitiveText(value, maxLength) {
  return cleanText(value, maxLength)
    .replace(/https?:\/\/[!-~]+/gi, (match) => {
      const trailing = match.match(/[,.!?]+$/);
      return `[链接]${trailing ? trailing[0] : ""}`;
    })
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[邮箱]")
    .replace(/(?:\+?86[-\s]?)?1[3-9]\d{9}/g, "[手机号]")
    .replace(/\b\d{15,19}\b/g, "[长号码]")
    .replace(/(?:微信|wx|wechat|QQ|扣扣)(?:号|号码|ID|id)?\s*[:：]?\s*[A-Za-z0-9_-]{5,}/gi, "[账号]")
    .replace(/@[^\s，。！？,.!?]{2,24}/g, "[用户]");
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return stripControlCharacters(value)
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function stripControlCharacters(value) {
  return Array.from(value).filter((character) => {
    const code = character.charCodeAt(0);
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
  }).join("");
}

function cleanToken(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, maxLength);
}

function normalizeTimestamp(value) {
  const ts = Number(value);
  if (!Number.isFinite(ts) || ts <= 0) return null;
  return Math.floor(ts);
}

function normalizeReplyIndex(value) {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index > 20) return null;
  return index;
}

function hashSource(source) {
  const secret = process.env.FEEDBACK_HASH_SECRET || process.env.OSS_ACCESS_KEY_SECRET || "yidu-feedback";
  return crypto.createHmac("sha256", secret).update(source).digest("hex");
}

function createObjectKey(id, receivedAt) {
  const prefix = normalizePrefix(process.env.OSS_FEEDBACK_PREFIX || FEEDBACK_PREFIX);
  const date = receivedAt.slice(0, 10).replace(/-/g, "");
  return `${prefix}${date}/${id}.json`;
}

function normalizePrefix(value) {
  const cleaned = String(value || "").replace(/^\/+/, "").replace(/\/+$/, "");
  return `${cleaned || FEEDBACK_PREFIX.replace(/\/$/, "")}/`;
}

function enforceBodySize(req) {
  const rawLength = Number(req.headers?.["content-length"] || 0);
  if (rawLength > MAX_BODY_BYTES) throw new HttpError(413, "Feedback payload is too large");
  if (!rawLength) {
    const estimated = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
    if (estimated > MAX_BODY_BYTES) throw new HttpError(413, "Feedback payload is too large");
  }
}

function getClientIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function enforceRateLimit(ip) {
  const now = Date.now();
  pruneRateBuckets(now);
  const bucket = rateBuckets.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  if (bucket.count > RATE_LIMIT) throw new HttpError(429, "Too many feedback events");
}

function pruneRateBuckets(now) {
  for (const [ip, bucket] of rateBuckets.entries()) {
    if (now > bucket.resetAt + RATE_WINDOW_MS) rateBuckets.delete(ip);
  }
}
