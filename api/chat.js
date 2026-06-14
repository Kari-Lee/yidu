import { getOssConfig, signObjectReadUrl, validateObjectKeys } from "../server/oss.js";

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 10;
const MAX_MESSAGE_CHARS = 12000;
const MAX_SYSTEM_CHARS = 6000;
const MAX_IMAGES = 12;
const MAX_IMAGE_BASE64_CHARS = 2 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BASE64_CHARS = 3.9 * 1024 * 1024;
const UPSTREAM_TIMEOUT_MS = 100 * 1000;
const MAX_OUTPUT_TOKENS = 1100;
const VISION_MAX_PIXELS = 1600 * 960;
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
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const provider = process.env.AI_PROVIDER || "qwen";
  const startedAt = Date.now();
  const ip = getClientIp(req);

  try {
    enforceRateLimit(ip);
    const body = validateBody(req.body || {});
    let text = "";

    if (provider === "claude") {
      text = await callClaude(apiKey, body);
    } else if (provider === "openai") {
      text = await callOpenAI(apiKey, body, process.env.API_BASE_URL || "https://api.openai.com/v1");
    } else {
      text = await callQwen(apiKey, body, process.env.API_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1");
    }

    logRequest("ok", { ip, provider, body, startedAt });
    return res.status(200).json({ text });
  } catch (err) {
    const status = err.status || 500;
    logRequest("error", { ip, provider, body: req.body || {}, startedAt, error: err.message, status });
    return res.status(status).json({ error: err.message || "Internal error" });
  }
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
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
  if (bucket.count > RATE_LIMIT) throw new HttpError(429, "分析太频繁了，稍等一下再试");
}

function pruneRateBuckets(now) {
  for (const [ip, bucket] of rateBuckets.entries()) {
    if (now > bucket.resetAt + RATE_WINDOW_MS) rateBuckets.delete(ip);
  }
}

function validateBody(body) {
  const system = typeof body.system === "string" ? body.system : "";
  const message = typeof body.message === "string" ? body.message : "";
  const images = Array.isArray(body.images) ? body.images : [];
  const rawImageKeys = Array.isArray(body.imageKeys) ? body.imageKeys : [];

  if (!message.trim() && images.length === 0 && rawImageKeys.length === 0) {
    throw new HttpError(400, "请输入聊天内容或上传截图");
  }
  if (system.length > MAX_SYSTEM_CHARS) throw new HttpError(413, "系统提示太长");
  if (message.length > MAX_MESSAGE_CHARS) throw new HttpError(413, "聊天内容太长，请删减后再试");
  if (images.length + rawImageKeys.length > MAX_IMAGES) {
    throw new HttpError(413, "本次截图数量异常，请重新选择");
  }

  let totalImageChars = 0;
  const cleanImages = images.map((img) => {
    if (typeof img !== "string") throw new HttpError(400, "图片格式异常");
    const clean = stripDataUrl(img);
    if (!isLikelyBase64(clean)) throw new HttpError(400, "图片格式异常");
    if (clean.length > MAX_IMAGE_BASE64_CHARS) throw new HttpError(413, "截图优化没有完成，请重新提交");
    totalImageChars += clean.length;
    return clean;
  });
  if (totalImageChars > MAX_TOTAL_IMAGE_BASE64_CHARS) throw new HttpError(413, "截图优化没有完成，请重新提交");

  let imageKeys = [];
  if (rawImageKeys.length) {
    const ossConfig = getOssConfig();
    if (!ossConfig) throw new HttpError(503, "图片服务暂时不可用，请稍后重试");
    try {
      imageKeys = validateObjectKeys(rawImageKeys, ossConfig, MAX_IMAGES);
    } catch (err) {
      throw new HttpError(400, err.message || "截图地址异常");
    }
  }

  return {
    system,
    message,
    images: cleanImages,
    imageKeys,
    clientMeta: normalizeClientMeta(body.clientMeta),
  };
}

function normalizeClientMeta(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return {
    imageTransport: cleanMetaValue(value.imageTransport, 32),
    uploadFallbackCode: cleanMetaValue(value.uploadFallbackCode, 48),
    uploadFallbackDetail: cleanMetaValue(value.uploadFallbackDetail, 180),
    task: value.task === "misread" ? "misread" : "",
  };
}

function cleanMetaValue(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").slice(0, maxLength);
}

function stripDataUrl(value) {
  const marker = "base64,";
  const idx = value.indexOf(marker);
  const raw = idx === -1 ? value : value.slice(idx + marker.length);
  return raw.replace(/\s/g, "");
}

function isLikelyBase64(value) {
  return value.length > 0 && /^[A-Za-z0-9+/=\s_-]+$/.test(value);
}

function logRequest(level, data) {
  const body = data.body || {};
  const images = Array.isArray(body.images) ? body.images : [];
  console[level === "ok" ? "log" : "warn"]("[chat]", JSON.stringify({
    level,
    ip: maskIp(data.ip),
    provider: data.provider,
    status: data.status || 200,
    durationMs: Date.now() - data.startedAt,
    messageChars: typeof body.message === "string" ? body.message.length : 0,
    imageCount: images.length,
    imageKeyCount: Array.isArray(body.imageKeys) ? body.imageKeys.length : 0,
    imageChars: images.reduce((sum, img) => sum + (typeof img === "string" ? img.length : 0), 0),
    imageTransport: body.clientMeta?.imageTransport || undefined,
    task: body.clientMeta?.task || undefined,
    uploadFallbackCode: body.clientMeta?.uploadFallbackCode || undefined,
    uploadFallbackDetail: body.clientMeta?.uploadFallbackDetail || undefined,
    error: data.error || undefined,
  }));
}

function maskIp(ip) {
  if (!ip || ip === "unknown") return "unknown";
  if (ip.includes(".")) return ip.split(".").slice(0, 3).concat("x").join(".");
  if (ip.includes(":")) return ip.split(":").slice(0, 3).concat("x").join(":");
  return "masked";
}

async function callQwen(apiKey, body, baseUrl) {
  const messages = [];
  const imageUrls = getSignedImageUrls(body);
  if (body.system) messages.push({ role: "system", content: body.system });
  if (body.images?.length > 0 || imageUrls.length > 0) {
    const userContent = [{ type: "text", text: body.message || "请仔细分析这些聊天记录截图中的对话内容" }];
    body.images.forEach((img) => userContent.push({
      type: "image_url",
      image_url: { url: "data:image/jpeg;base64," + img },
      max_pixels: VISION_MAX_PIXELS,
    }));
    imageUrls.forEach((url) => userContent.push({
      type: "image_url",
      image_url: { url },
      max_pixels: VISION_MAX_PIXELS,
    }));
    messages.push({ role: "user", content: userContent });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const hasImages = body.images?.length > 0 || imageUrls.length > 0;
  const isMisread = body.clientMeta?.task === "misread";
  const model = hasImages
    ? (process.env.AI_VISION_MODEL || "qwen3-vl-flash")
    : isMisread
      ? (process.env.AI_MISREAD_MODEL || "qwen-plus")
      : (process.env.AI_TEXT_MODEL || process.env.AI_MODEL || "qwen3-vl-plus-2025-09-23");
  const response = await fetchWithTimeout(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({
      model,
      max_tokens: isMisread ? 750 : MAX_OUTPUT_TOKENS,
      messages,
      enable_thinking: false,
    }),
  });
  const data = await readJson(response);
  if (!response.ok) throw upstreamError(response.status, data);
  return data.choices?.[0]?.message?.content || "";
}

async function callClaude(apiKey, body) {
  if (body.imageKeys?.length) {
    throw new HttpError(503, "当前图片服务配置不支持 Claude");
  }
  const messages = [];
  if (body.images?.length > 0) {
    const content = [{ type: "text", text: body.message || "Please analyze these chat screenshots" }];
    body.images.forEach((img) => content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } }));
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: MAX_OUTPUT_TOKENS,
      system: body.system || "",
      messages,
    }),
  });
  const data = await readJson(response);
  if (!response.ok) throw upstreamError(response.status, data);
  return data.content?.map((c) => c.text || "").join("") || "";
}

async function callOpenAI(apiKey, body, baseUrl) {
  const messages = [];
  const imageUrls = getSignedImageUrls(body);
  if (body.system) messages.push({ role: "system", content: body.system });
  if (body.images?.length > 0 || imageUrls.length > 0) {
    const content = [{ type: "text", text: body.message || "Please analyze these chat screenshots" }];
    body.images.forEach((img) => content.push({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + img } }));
    imageUrls.forEach((url) => content.push({ type: "image_url", image_url: { url } }));
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const response = await fetchWithTimeout(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o", max_tokens: MAX_OUTPUT_TOKENS, messages }),
  });
  const data = await readJson(response);
  if (!response.ok) throw upstreamError(response.status, data);
  return data.choices?.[0]?.message?.content || "";
}

function getSignedImageUrls(body) {
  if (!body.imageKeys?.length) return [];
  const config = getOssConfig();
  if (!config) throw new HttpError(503, "图片服务暂时不可用，请稍后重试");
  return body.imageKeys.map((key) => signObjectReadUrl(config, key));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new HttpError(504, "这次分析超时了，请直接重试");
    }
    throw new HttpError(502, "AI服务连接失败，请稍后重试");
  } finally {
    clearTimeout(timer);
  }
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 500) };
  }
}

function upstreamError(status, data) {
  if (status === 429) return new HttpError(429, "AI服务繁忙，请稍等一下再试");
  if (status === 413) return new HttpError(413, "截图优化没有完成，请重新提交");
  const detail = data?.error?.message || data?.message || "";
  console.warn("[chat-upstream]", JSON.stringify({ status, detail: String(detail).slice(0, 500) }));
  return new HttpError(502, "AI服务暂时不稳定，请稍后重试");
}
