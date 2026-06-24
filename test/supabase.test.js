import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import {
  feedbackRecordToRow,
  feedbackRowToRecord,
  getSupabaseConfig,
  insertFeedbackRecord,
  listFeedbackRecords,
} from "../server/supabase.js";

test("maps feedback records to Supabase rows and back", () => {
  const record = {
    schemaVersion: 3,
    id: "event-1",
    event: "copy",
    task: "misread",
    mode: "person",
    route: "general",
    weapon: "通知体",
    batchId: "batch_1",
    replyId: "batch_1_0",
    replyIndex: 0,
    promptVersion: "misread_v2",
    verdict: "",
    reason: "",
    title: "低调凡尔赛",
    summary: "可能收到问号",
    source: "你在干嘛",
    sourceHash: "hash",
    text: "正在走审批。",
    clientTs: 1710000000000,
    receivedAt: "2026-06-24T12:00:00.000Z",
  };

  const row = feedbackRecordToRow(record);
  assert.equal(row.received_at, record.receivedAt);
  assert.equal(row.batch_id, record.batchId);
  assert.equal(row.reply_text, record.text);
  assert.deepEqual(feedbackRowToRecord(row), record);
});

test("inserts feedback records through Supabase REST", async () => {
  const originalFetch = globalThis.fetch;
  let request;
  globalThis.fetch = async (url, options) => {
    request = { url, options };
    return new Response("", { status: 201 });
  };

  try {
    await insertFeedbackRecord({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-key",
      table: "yidu_feedback_events",
    }, {
      schemaVersion: 3,
      id: "event-1",
      event: "share",
      task: "predict",
      receivedAt: "2026-06-24T12:00:00.000Z",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(request.url, "https://project.supabase.co/rest/v1/yidu_feedback_events");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers.apikey, "service-key");
  assert.equal(request.options.headers.Authorization, "Bearer service-key");
  assert.equal(request.options.headers.Prefer, "return=minimal");
  assert.equal(JSON.parse(request.options.body).event, "share");
});

test("lists feedback records through Supabase REST", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify([{
    id: "event-2",
    received_at: "2026-06-24T12:00:00.000Z",
    schema_version: 3,
    event: "poster_save",
    task: "quiz",
    title: "安全型",
    reply_text: "依恋测试结果",
    record: {},
  }]), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  try {
    const records = await listFeedbackRecords({
      url: "https://project.supabase.co",
      serviceRoleKey: "service-key",
      table: "yidu_feedback_events",
    }, { days: 7, limit: 100 });
    assert.equal(records.length, 1);
    assert.equal(records[0].task, "quiz");
    assert.equal(records[0].text, "依恋测试结果");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("reads Supabase configuration from environment", () => {
  const original = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_FEEDBACK_TABLE: process.env.SUPABASE_FEEDBACK_TABLE,
  };

  Object.assign(process.env, {
    SUPABASE_URL: "https://project.supabase.co/",
    SUPABASE_SERVICE_ROLE_KEY: "service-key",
    SUPABASE_FEEDBACK_TABLE: "yidu_feedback_events",
  });

  try {
    assert.deepEqual(getSupabaseConfig(), {
      url: "https://project.supabase.co",
      serviceRoleKey: "service-key",
      table: "yidu_feedback_events",
    });
  } finally {
    Object.keys(original).forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
  }
});
