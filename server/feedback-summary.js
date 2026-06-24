import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";

const DEFAULT_FEEDBACK_PREFIX = "yidu-feedback/";
const OSS_TIMEOUT_MS = 10 * 1000;
const CONCURRENCY = 8;
const EVENT_KEYS = ["serve", "copy", "share", "poster_save", "refresh", "rating"];
const TASK_LABELS = {
  misread: "已读乱回",
  quiz: "依恋测试",
  translate: "潜台词",
  check: "发不发",
  reply: "下一句",
  diagnose: "聊天确诊",
  predict: "感情预测",
};

export class FeedbackSummaryError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function requireFeedbackAdmin(req) {
  const expected = process.env.FEEDBACK_ADMIN_TOKEN || "";
  if (!expected) {
    throw new FeedbackSummaryError(503, "Feedback dashboard is not configured");
  }

  const auth = req.headers?.authorization || "";
  const bearer = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
  const queryToken = typeof req.query?.token === "string" ? req.query.token : "";
  const provided = bearer || queryToken;
  if (!safeEqual(provided, expected)) {
    throw new FeedbackSummaryError(401, "Unauthorized");
  }
}

export function normalizeSummaryQuery(query = {}) {
  const days = clampNumber(query.days, 14, 1, 90);
  const limit = clampNumber(query.limit, 5000, 100, 20000);
  return { days, limit };
}

export async function loadFeedbackRecords(config, options = {}) {
  const days = options.days || 14;
  const limit = options.limit || 5000;
  const prefix = normalizePrefix(process.env.OSS_FEEDBACK_PREFIX || DEFAULT_FEEDBACK_PREFIX);
  const prefixes = datePrefixes(days).map((date) => `${prefix}${date}/`);
  const keys = [];

  for (const dayPrefix of prefixes) {
    const dayKeys = await listKeys(config, dayPrefix, Math.max(0, limit - keys.length));
    keys.push(...dayKeys);
    if (keys.length >= limit) break;
  }

  const records = (await mapLimit(keys, CONCURRENCY, (key) => getRecord(config, key))).filter(Boolean);
  return summarizeFeedbackRecords(records, { days, limit, scannedObjects: keys.length });
}

export function summarizeFeedbackRecords(records, meta = {}) {
  const cleanRecords = (records || []).filter((record) => record && typeof record === "object");
  const totals = {
    records: cleanRecords.length,
    copies: 0,
    shares: 0,
    posterSaves: 0,
    ratings: 0,
    positiveRatings: 0,
    negativeRatings: 0,
    engagementEvents: 0,
  };
  const byTask = new Map();
  const byDay = new Map();
  const groups = new Map();
  const recent = [];

  for (const record of cleanRecords) {
    const task = cleanToken(record.task) || "unknown";
    const event = cleanToken(record.event) || "unknown";
    const receivedAt = cleanText(record.receivedAt, 32);
    const day = receivedAt ? receivedAt.slice(0, 10) : "unknown";
    const taskStats = getTaskStats(byTask, task);

    taskStats.total += 1;
    taskStats.events[event] = (taskStats.events[event] || 0) + 1;
    byDay.set(day, (byDay.get(day) || 0) + 1);

    if (event === "copy") totals.copies += 1;
    if (event === "share") totals.shares += 1;
    if (event === "poster_save") totals.posterSaves += 1;
    if (event === "rating") totals.ratings += 1;
    if (record.verdict === "positive") totals.positiveRatings += 1;
    if (record.verdict === "negative") totals.negativeRatings += 1;
    if (event === "copy" || event === "share" || event === "poster_save") {
      totals.engagementEvents += 1;
      taskStats.engagement += 1;
    }

    const mode = cleanToken(record.mode);
    if (mode) taskStats.modes[mode] = (taskStats.modes[mode] || 0) + 1;

    const groupText = cleanText(record.text, 500) || cleanText(record.title, 160) || cleanText(record.summary, 500);
    if (groupText) {
      const groupKey = [task, mode, normalizeText(groupText)].join("|");
      const group = getContentGroup(groups, groupKey, task, mode, groupText);
      group.events[event] = (group.events[event] || 0) + 1;
      group.total += 1;
      if (record.title && !group.title) group.title = cleanText(record.title, 160);
      if (record.summary && !group.summary) group.summary = cleanText(record.summary, 220);
      if (record.source && !group.exampleSource) group.exampleSource = cleanText(record.source, 220);
      if (receivedAt && (!group.lastSeen || receivedAt > group.lastSeen)) group.lastSeen = receivedAt;
    }

    recent.push({
      receivedAt,
      task,
      taskLabel: TASK_LABELS[task] || task,
      event,
      mode,
      title: cleanText(record.title, 120),
      summary: cleanText(record.summary, 180),
      text: cleanText(record.text, 180),
      source: cleanText(record.source, 180),
      verdict: cleanToken(record.verdict),
      reason: cleanToken(record.reason),
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    window: {
      days: meta.days || 14,
      limit: meta.limit || 5000,
      scannedObjects: meta.scannedObjects || cleanRecords.length,
    },
    totals,
    byTask: [...byTask.values()].sort((a, b) => b.engagement - a.engagement || b.total - a.total),
    byDay: [...byDay.entries()].map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day)),
    topContent: [...groups.values()]
      .map((group) => ({
        ...group,
        score: (group.events.copy || 0) * 3 + (group.events.poster_save || 0) * 4 + (group.events.share || 0) * 5 + (group.events.rating || 0),
      }))
      .sort((a, b) => b.score - a.score || b.total - a.total)
      .slice(0, 50),
    recent: recent
      .sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)))
      .slice(0, 80),
  };
}

async function listKeys(config, prefix, limit) {
  const keys = [];
  let marker = "";
  while (keys.length < limit) {
    const qs = new URLSearchParams({ prefix, "max-keys": String(Math.min(1000, limit - keys.length)) });
    if (marker) qs.set("marker", marker);
    const xml = await ossGet(config, `/?${qs.toString()}`, `/${config.bucket}/`);
    const pageKeys = [...xml.matchAll(/<Key>([^<]*)<\/Key>/g)]
      .map((match) => decodeXml(match[1]))
      .filter((key) => key.endsWith(".json"));
    keys.push(...pageKeys);
    const truncated = /<IsTruncated>\s*true\s*<\/IsTruncated>/i.test(xml);
    if (!truncated) break;
    const nextMarker = (xml.match(/<NextMarker>([^<]*)<\/NextMarker>/) || [])[1];
    marker = nextMarker ? decodeXml(nextMarker) : (pageKeys[pageKeys.length - 1] || "");
    if (!marker) break;
  }
  return keys.slice(0, limit);
}

async function getRecord(config, key) {
  try {
    const text = await ossGet(config, `/${encodeObjectKey(key)}`, `/${config.bucket}/${key}`);
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function ossGet(config, pathAndQuery, canonicalResource) {
  const date = new Date().toUTCString();
  const stringToSign = `GET\n\n\n${date}\n${canonicalResource}`;
  const signature = crypto.createHmac("sha1", config.accessKeySecret).update(stringToSign).digest("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OSS_TIMEOUT_MS);
  try {
    const response = await fetch(`${config.host}${pathAndQuery}`, {
      method: "GET",
      headers: { Authorization: `OSS ${config.accessKeyId}:${signature}`, Date: date },
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OSS GET failed (${response.status}): ${detail.slice(0, 240)}`);
    }
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const output = new Array(items.length);
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      output[current] = await fn(items[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

function getTaskStats(map, task) {
  let value = map.get(task);
  if (!value) {
    value = {
      task,
      label: TASK_LABELS[task] || task,
      total: 0,
      engagement: 0,
      events: Object.fromEntries(EVENT_KEYS.map((key) => [key, 0])),
      modes: {},
    };
    map.set(task, value);
  }
  return value;
}

function getContentGroup(map, key, task, mode, text) {
  let value = map.get(key);
  if (!value) {
    value = {
      task,
      taskLabel: TASK_LABELS[task] || task,
      mode,
      title: "",
      summary: "",
      text,
      exampleSource: "",
      events: {},
      total: 0,
      lastSeen: "",
    };
    map.set(key, value);
  }
  return value;
}

function safeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}

function datePrefixes(days) {
  const dates = [];
  const now = new Date();
  for (let offset = 0; offset < days; offset += 1) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - offset));
    dates.push(`${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`);
  }
  return dates;
}

function normalizePrefix(value) {
  return String(value || "").replace(/^\/+/, "").replace(/\/+$/, "") + "/";
}

function encodeObjectKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function decodeXml(value) {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, maxLength);
}

function cleanToken(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：""''（）《》【】,.!?;:'"()[\]{}<>~`·…—_-]/g, "");
}
