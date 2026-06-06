import { createUploadPolicy, getOssConfig } from "../server/oss.js";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 20;
const rateBuckets = new Map();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    enforceRateLimit(getClientIp(req));
    const config = getOssConfig();
    if (!config) {
      return res.status(503).json({ error: "OSS upload is not configured" });
    }
    return res.status(200).json(createUploadPolicy(config));
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Internal error" });
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function enforceRateLimit(ip) {
  const now = Date.now();
  const bucket = rateBuckets.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + RATE_WINDOW_MS;
  }
  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  if (bucket.count > RATE_LIMIT) {
    const error = new Error("请求太频繁，请稍后重试");
    error.status = 429;
    throw error;
  }
}
