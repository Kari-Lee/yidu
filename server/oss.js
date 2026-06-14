import crypto from "node:crypto";
import { Buffer } from "node:buffer";
import process from "node:process";

const DEFAULT_PREFIX = "yidu-temp/";
const DEFAULT_POLICY_TTL_SECONDS = 5 * 60;
const DEFAULT_READ_TTL_SECONDS = 10 * 60;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const OSS_REQUEST_TIMEOUT_MS = 8 * 1000;

export function getOssConfig() {
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID || "";
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET || "";
  const bucket = process.env.OSS_BUCKET || "";
  const endpoint = normalizeEndpoint(process.env.OSS_ENDPOINT || "");
  const prefix = normalizePrefix(process.env.OSS_OBJECT_PREFIX || DEFAULT_PREFIX);

  if (!accessKeyId || !accessKeySecret || !bucket || !endpoint) return null;

  return {
    accessKeyId,
    accessKeySecret,
    bucket,
    endpoint,
    host: `https://${bucket}.${endpoint}`,
    prefix,
  };
}

export function createUploadPolicy(config, ttlSeconds = DEFAULT_POLICY_TTL_SECONDS) {
  const expireAt = Date.now() + ttlSeconds * 1000;
  const sessionPrefix = `${config.prefix}${utcDatePath()}/${randomId()}/`;
  const policyDocument = {
    expiration: new Date(expireAt).toISOString(),
    conditions: [
      { bucket: config.bucket },
      ["content-length-range", 1, MAX_UPLOAD_BYTES],
      ["starts-with", "$key", sessionPrefix],
      ["eq", "$success_action_status", "200"],
    ],
  };
  const policy = Buffer.from(JSON.stringify(policyDocument)).toString("base64");
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(policy)
    .digest("base64");

  return {
    host: config.host,
    prefix: sessionPrefix,
    accessKeyId: config.accessKeyId,
    policy,
    signature,
    expireAt,
  };
}

export function validateObjectKeys(keys, config, maxImages = 12) {
  if (!Array.isArray(keys)) return [];
  if (keys.length > maxImages) throw new Error("截图数量异常");

  return keys.map((key) => {
    if (
      typeof key !== "string" ||
      !key.startsWith(config.prefix) ||
      key.length > 240 ||
      !/^[A-Za-z0-9/_\-.]+$/.test(key)
    ) {
      throw new Error("截图地址异常");
    }
    return key;
  });
}

export function signObjectReadUrl(config, key, ttlSeconds = DEFAULT_READ_TTL_SECONDS) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const resource = `/${config.bucket}/${key}`;
  const stringToSign = `GET\n\n\n${expires}\n${resource}`;
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(stringToSign)
    .digest("base64");

  const query = new URLSearchParams({
    OSSAccessKeyId: config.accessKeyId,
    Expires: String(expires),
    Signature: signature,
  });
  return `${config.host}/${encodeObjectKey(key)}?${query.toString()}`;
}

export async function putJsonObject(config, key, value) {
  const body = Buffer.from(JSON.stringify(value), "utf8");
  const contentType = "application/json; charset=utf-8";
  const contentMd5 = crypto.createHash("md5").update(body).digest("base64");
  const date = new Date().toUTCString();
  const resource = `/${config.bucket}/${key}`;
  const stringToSign = `PUT\n${contentMd5}\n${contentType}\n${date}\n${resource}`;
  const signature = crypto
    .createHmac("sha1", config.accessKeySecret)
    .update(stringToSign)
    .digest("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OSS_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.host}/${encodeObjectKey(key)}`, {
      method: "PUT",
      headers: {
        Authorization: `OSS ${config.accessKeyId}:${signature}`,
        "Content-MD5": contentMd5,
        "Content-Type": contentType,
        Date: date,
      },
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`OSS write failed (${response.status}): ${detail.slice(0, 240)}`);
    }
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("OSS write timed out", { cause: err });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeEndpoint(value) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function normalizePrefix(value) {
  const cleaned = value.replace(/^\/+/, "").replace(/\/+$/, "");
  return `${cleaned || DEFAULT_PREFIX.replace(/\/$/, "")}/`;
}

function encodeObjectKey(key) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function utcDatePath() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function randomId() {
  return crypto.randomBytes(12).toString("hex");
}
