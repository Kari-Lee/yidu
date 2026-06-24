import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";
import {
  normalizeSummaryQuery,
  requireFeedbackAdmin,
  summarizeFeedbackRecords,
} from "../server/feedback-summary.js";

test("summarizes feedback records by task and engagement", () => {
  const summary = summarizeFeedbackRecords([
    {
      schemaVersion: 3,
      event: "copy",
      task: "misread",
      mode: "person",
      title: "低调凡尔赛",
      text: "今天外卖多送了一双筷子，我没退。",
      receivedAt: "2026-06-24T01:00:00.000Z",
    },
    {
      schemaVersion: 3,
      event: "poster_save",
      task: "predict",
      title: "暧昧期",
      summary: "关系进入拉扯期",
      text: "关系走向图",
      receivedAt: "2026-06-24T02:00:00.000Z",
    },
    {
      schemaVersion: 3,
      event: "share",
      task: "predict",
      title: "暧昧期",
      summary: "关系进入拉扯期",
      text: "关系走向图",
      receivedAt: "2026-06-24T03:00:00.000Z",
    },
  ], { days: 7, limit: 100, scannedObjects: 3 });

  assert.equal(summary.totals.records, 3);
  assert.equal(summary.totals.copies, 1);
  assert.equal(summary.totals.shares, 1);
  assert.equal(summary.totals.posterSaves, 1);
  assert.equal(summary.byTask[0].task, "predict");
  assert.equal(summary.byTask[0].engagement, 2);
  assert.equal(summary.topContent[0].task, "predict");
  assert.equal(summary.topContent[0].events.share, 1);
  assert.equal(summary.topContent[0].events.poster_save, 1);
});

test("normalizes summary query bounds", () => {
  assert.deepEqual(normalizeSummaryQuery({ days: "0", limit: "20" }), { days: 1, limit: 100 });
  assert.deepEqual(normalizeSummaryQuery({ days: "200", limit: "999999" }), { days: 90, limit: 20000 });
});

test("requires feedback admin token", () => {
  const previous = process.env.FEEDBACK_ADMIN_TOKEN;
  process.env.FEEDBACK_ADMIN_TOKEN = "secret-token";

  try {
    assert.doesNotThrow(() => requireFeedbackAdmin({
      headers: { authorization: "Bearer secret-token" },
      query: {},
    }));
    assert.throws(() => requireFeedbackAdmin({
      headers: { authorization: "Bearer wrong" },
      query: {},
    }), /Unauthorized/);
  } finally {
    if (previous === undefined) delete process.env.FEEDBACK_ADMIN_TOKEN;
    else process.env.FEEDBACK_ADMIN_TOKEN = previous;
  }
});
