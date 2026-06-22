import { Buffer } from "node:buffer";
import process from "node:process";

const DEFAULT_APP_ID = "wxe6d3e0de52d068c2";
const TOKEN_SAFETY_MS = 5 * 60 * 1000;
let tokenCache = { value: "", expiresAt: 0 };

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const appId = process.env.WECHAT_APP_ID || DEFAULT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;
    if (!appSecret) throw new HttpError(503, "Mini Program code is not configured");

    const token = await getAccessToken(appId, appSecret);
    const image = await requestMiniProgramCode(token);
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400");
    res.setHeader("Content-Type", "image/png");
    return res.status(200).send(image);
  } catch (err) {
    res.setHeader("Cache-Control", "no-store");
    console.warn("[wxacode]", JSON.stringify({
      status: err.status || 502,
      error: String(err.message || "Mini Program code request failed").slice(0, 300),
    }));
    return res.status(err.status || 502).json({ error: err.message || "Mini Program code request failed" });
  }
}

export async function getAccessToken(appId, appSecret, fetchImpl = fetch, now = Date.now()) {
  if (tokenCache.value && tokenCache.expiresAt > now) return tokenCache.value;

  const params = new URLSearchParams({
    grant_type: "client_credential",
    appid: appId,
    secret: appSecret,
  });
  const response = await fetchImpl(`https://api.weixin.qq.com/cgi-bin/token?${params.toString()}`);
  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new HttpError(502, `WeChat token request failed: ${body.errcode || response.status}`);
  }

  const ttl = Math.max(60, Number(body.expires_in) || 7200) * 1000;
  tokenCache = {
    value: body.access_token,
    expiresAt: now + Math.max(60 * 1000, ttl - TOKEN_SAFETY_MS),
  };
  return tokenCache.value;
}

export async function requestMiniProgramCode(token, fetchImpl = fetch) {
  const response = await fetchImpl(
    `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene: "misread",
        page: "pages/misread/misread",
        check_path: false,
        env_version: "release",
        width: 280,
        auto_color: false,
        line_color: { r: 23, g: 25, b: 28 },
        is_hyaline: true,
      }),
    },
  );
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || contentType.includes("json")) {
    let detail = {};
    try {
      detail = JSON.parse(bytes.toString("utf8"));
    } catch {
      // Non-JSON error bodies fall back to the HTTP status below.
    }
    throw new HttpError(502, `WeChat code request failed: ${detail.errcode || response.status}`);
  }
  return bytes;
}

export function resetTokenCacheForTest() {
  tokenCache = { value: "", expiresAt: 0 };
}
