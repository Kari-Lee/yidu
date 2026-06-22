import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import process from "node:process";
import test from "node:test";
import {
  default as wxacodeHandler,
  getAccessToken,
  requestMiniProgramCode,
  resetTokenCacheForTest,
} from "../api/wxacode.js";

test("requests and caches a WeChat access token", async () => {
  resetTokenCacheForTest();
  let calls = 0;
  const fetchImpl = async (url) => {
    calls += 1;
    assert.match(url, /appid=test-app/);
    assert.match(url, /secret=test-secret/);
    return new Response(JSON.stringify({ access_token: "token-1", expires_in: 7200 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const first = await getAccessToken("test-app", "test-secret", fetchImpl, 1000);
  const second = await getAccessToken("test-app", "test-secret", fetchImpl, 2000);
  assert.equal(first, "token-1");
  assert.equal(second, "token-1");
  assert.equal(calls, 1);
});

test("requests the release misread page code", async () => {
  let request;
  const png = Buffer.from([137, 80, 78, 71]);
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return new Response(png, { status: 200, headers: { "Content-Type": "image/png" } });
  };

  const result = await requestMiniProgramCode("token-2", fetchImpl);
  const body = JSON.parse(request.options.body);
  assert.match(request.url, /getwxacodeunlimit/);
  assert.equal(body.page, "pages/misread/misread");
  assert.equal(body.env_version, "release");
  assert.deepEqual(result, png);
});

test("returns the generated PNG from the API handler", async () => {
  resetTokenCacheForTest();
  const originalFetch = globalThis.fetch;
  const originalSecret = process.env.WECHAT_APP_SECRET;
  const originalAppId = process.env.WECHAT_APP_ID;
  const png = Buffer.from([137, 80, 78, 71]);
  let call = 0;
  globalThis.fetch = async () => {
    call += 1;
    if (call === 1) {
      return new Response(JSON.stringify({ access_token: "token-3", expires_in: 7200 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(png, { status: 200, headers: { "Content-Type": "image/png" } });
  };
  process.env.WECHAT_APP_ID = "test-app";
  process.env.WECHAT_APP_SECRET = "test-secret";

  const response = createMockResponse();
  try {
    await wxacodeHandler({ method: "GET" }, response);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("WECHAT_APP_ID", originalAppId);
    restoreEnv("WECHAT_APP_SECRET", originalSecret);
  }

  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "image/png");
  assert.deepEqual(response.body, png);
});

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    send(value) { this.body = value; return this; },
  };
}

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name];
  else process.env[name] = value;
}
