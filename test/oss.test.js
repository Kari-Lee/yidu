import assert from "node:assert/strict";
import test from "node:test";
import { putJsonObject } from "../server/oss.js";

test("signs and uploads one JSON object to OSS", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response("", { status: 200 });
  };

  try {
    await putJsonObject({
      accessKeyId: "test-id",
      accessKeySecret: "test-secret",
      bucket: "private-bucket",
      endpoint: "oss-cn-hangzhou.aliyuncs.com",
      host: "https://private-bucket.oss-cn-hangzhou.aliyuncs.com",
      prefix: "yidu-temp/",
    }, "yidu-feedback/20260614/event.json", { ok: true });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(
    request.url,
    "https://private-bucket.oss-cn-hangzhou.aliyuncs.com/yidu-feedback/20260614/event.json",
  );
  assert.equal(request.options.method, "PUT");
  assert.match(request.options.headers.Authorization, /^OSS test-id:/);
  assert.match(request.options.headers["Content-MD5"], /^[A-Za-z0-9+/=]+$/);
  assert.equal(request.options.headers["Content-Type"], "application/json; charset=utf-8");
  assert.equal(request.options.body.toString("utf8"), '{"ok":true}');
});
