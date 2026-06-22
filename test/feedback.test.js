import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import {
  createFeedbackRecord,
  default as feedbackHandler,
  redactSensitiveText,
  validateFeedback,
} from "../api/feedback.js";

test("validates a copy event and normalizes optional fields", () => {
  const value = validateFeedback({
    event: "copy",
    task: "misread",
    mode: "crush",
    route: "crush_general<script>",
    weapon: " 推拉 ",
    source: "你在干嘛",
    text: "在等你的下一条工作指示。",
    ts: 123.9,
  });

  assert.deepEqual(value, {
    event: "copy",
    mode: "crush",
    route: "crush_generalscript",
    weapon: "推拉",
    batchId: "",
    replyId: "",
    replyIndex: null,
    promptVersion: "",
    verdict: "",
    reason: "",
    source: "你在干嘛",
    text: "在等你的下一条工作指示。",
    ts: 123,
  });
});

test("validates a negative rating with reply identity", () => {
  const value = validateFeedback({
    event: "rating",
    task: "misread",
    mode: "person",
    batchId: "batch_123",
    replyId: "batch_123_1",
    replyIndex: 1,
    promptVersion: "misread_v2",
    verdict: "negative",
    reason: "awkward",
    source: "今天打算做什么",
    text: "先提交立项申请。",
    ts: 456,
  });

  assert.equal(value.event, "rating");
  assert.equal(value.batchId, "batch_123");
  assert.equal(value.replyIndex, 1);
  assert.equal(value.verdict, "negative");
  assert.equal(value.reason, "awkward");
});

test("validates serve and refresh events for the same batch", () => {
  const served = validateFeedback({
    event: "serve",
    task: "misread",
    mode: "crush",
    batchId: "batch_456",
    replyId: "batch_456_0",
    replyIndex: 0,
    source: "在吗",
    text: "在，正在走审批。",
  });
  const refreshed = validateFeedback({
    event: "refresh",
    task: "misread",
    mode: "crush",
    batchId: "batch_456",
    source: "在吗",
  });

  assert.equal(served.replyIndex, 0);
  assert.equal(refreshed.event, "refresh");
  assert.equal(refreshed.batchId, "batch_456");
});

test("rejects a rating with an incompatible reason", () => {
  assert.throws(
    () => validateFeedback({
      event: "rating",
      task: "misread",
      mode: "person",
      batchId: "batch_123",
      replyId: "batch_123_0",
      replyIndex: 0,
      verdict: "positive",
      reason: "awkward",
      source: "你好",
      text: "你好",
    }),
    /can_send reason/,
  );
});

test("rejects incomplete copy feedback", () => {
  assert.throws(
    () => validateFeedback({
      event: "copy",
      task: "misread",
      mode: "person",
      source: "你好",
    }),
    /requires source and text/,
  );
});

test("redacts common personal identifiers", () => {
  const redacted = redactSensitiveText(
    "电话 13812345678，邮箱 hi@example.com，微信号: abc_12345，见 https://example.com/a，@张三",
    500,
  );

  assert.equal(
    redacted,
    "电话 [手机号]，邮箱 [邮箱]，[账号]，见 [链接]，[用户]",
  );
});

test("creates a persistence record without client-supplied extra fields", () => {
  const record = createFeedbackRecord({
    event: "share",
    task: "misread",
    mode: "person",
    source: "联系我 13900001111",
    text: "should be accepted but not required",
    admin: true,
    ts: 1710000000000,
  }, new Date("2026-06-14T12:00:00.000Z"));

  assert.equal(record.schemaVersion, 2);
  assert.equal(record.event, "share");
  assert.equal(record.source, "联系我 [手机号]");
  assert.equal(record.receivedAt, "2026-06-14T12:00:00.000Z");
  assert.equal(record.admin, undefined);
  assert.match(record.id, /^[0-9a-f-]{36}$/);
  assert.match(record.sourceHash, /^[0-9a-f]{64}$/);
});

test("accepts a feedback request and persists it through OSS", async () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID,
    OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET,
    OSS_BUCKET: process.env.OSS_BUCKET,
    OSS_ENDPOINT: process.env.OSS_ENDPOINT,
    OSS_FEEDBACK_PREFIX: process.env.OSS_FEEDBACK_PREFIX,
  };
  let uploadedUrl = "";

  Object.assign(process.env, {
    OSS_ACCESS_KEY_ID: "test-id",
    OSS_ACCESS_KEY_SECRET: "test-secret",
    OSS_BUCKET: "private-bucket",
    OSS_ENDPOINT: "oss-cn-hangzhou.aliyuncs.com",
    OSS_FEEDBACK_PREFIX: "test-feedback/",
  });
  globalThis.fetch = async (url) => {
    uploadedUrl = url;
    return new Response("", { status: 200 });
  };

  const response = createMockResponse();
  try {
    await feedbackHandler({
      method: "POST",
      headers: {},
      socket: { remoteAddress: "127.0.0.1" },
      body: {
        event: "copy",
        task: "misread",
        mode: "person",
        route: "general",
        weapon: "通知体",
        source: "怎么办",
        text: "请在三个工作日内提交材料。",
        ts: Date.now(),
      },
    }, response);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv(originalEnv);
  }

  assert.equal(response.statusCode, 202);
  assert.deepEqual(response.body, { ok: true });
  assert.match(uploadedUrl, /\/test-feedback\/\d{8}\/[0-9a-f-]{36}\.json$/);
});

function createMockResponse() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
    end() {
      return this;
    },
  };
}

function restoreEnv(values) {
  Object.keys(values).forEach((key) => {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  });
}
