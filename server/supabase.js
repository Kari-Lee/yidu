import process from "node:process";

const DEFAULT_FEEDBACK_TABLE = "yidu_feedback_events";
const SUPABASE_TIMEOUT_MS = 10 * 1000;

export function getSupabaseConfig() {
  const url = normalizeSupabaseUrl(process.env.SUPABASE_URL || "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = normalizeTableName(process.env.SUPABASE_FEEDBACK_TABLE || DEFAULT_FEEDBACK_TABLE);

  if (!url || !serviceRoleKey || !table) return null;
  return { url, serviceRoleKey, table };
}

export async function insertFeedbackRecord(config, record) {
  const response = await supabaseFetch(config, `/${config.table}`, {
    method: "POST",
    headers: { "Prefer": "return=minimal" },
    body: JSON.stringify(feedbackRecordToRow(record)),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase insert failed (${response.status}): ${detail.slice(0, 240)}`);
  }
}

export async function listFeedbackRecords(config, options = {}) {
  const days = Number(options.days || 14);
  const limit = Number(options.limit || 5000);
  const since = new Date(Date.now() - Math.max(0, days - 1) * 24 * 60 * 60 * 1000).toISOString();
  const params = new URLSearchParams({
    select: [
      "id",
      "received_at",
      "schema_version",
      "event",
      "task",
      "mode",
      "route",
      "weapon",
      "batch_id",
      "reply_id",
      "reply_index",
      "prompt_version",
      "verdict",
      "reason",
      "title",
      "summary",
      "source_text",
      "source_hash",
      "reply_text",
      "client_ts",
      "record",
    ].join(","),
    received_at: `gte.${since}`,
    order: "received_at.desc",
    limit: String(Math.max(100, Math.min(20000, limit))),
  });
  const response = await supabaseFetch(config, `/${config.table}?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase read failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(feedbackRowToRecord) : [];
}

export function feedbackRecordToRow(record) {
  return {
    id: record.id,
    received_at: record.receivedAt,
    schema_version: record.schemaVersion,
    event: record.event,
    task: record.task,
    mode: record.mode,
    route: record.route,
    weapon: record.weapon,
    batch_id: record.batchId,
    reply_id: record.replyId,
    reply_index: record.replyIndex,
    prompt_version: record.promptVersion,
    verdict: record.verdict,
    reason: record.reason,
    title: record.title,
    summary: record.summary,
    source_text: record.source,
    source_hash: record.sourceHash,
    reply_text: record.text,
    client_ts: record.clientTs,
    record,
  };
}

export function feedbackRowToRecord(row) {
  const nested = row.record && typeof row.record === "object" ? row.record : {};
  return {
    ...nested,
    schemaVersion: row.schema_version ?? nested.schemaVersion,
    id: row.id || nested.id,
    event: row.event || nested.event,
    task: row.task || nested.task,
    mode: row.mode || nested.mode || "",
    route: row.route || nested.route || "",
    weapon: row.weapon || nested.weapon || "",
    batchId: row.batch_id || nested.batchId || "",
    replyId: row.reply_id || nested.replyId || "",
    replyIndex: row.reply_index ?? nested.replyIndex ?? null,
    promptVersion: row.prompt_version || nested.promptVersion || "",
    verdict: row.verdict || nested.verdict || "",
    reason: row.reason || nested.reason || "",
    title: row.title || nested.title || "",
    summary: row.summary || nested.summary || "",
    source: row.source_text || nested.source || "",
    sourceHash: row.source_hash || nested.sourceHash || "",
    text: row.reply_text || nested.text || "",
    clientTs: row.client_ts ?? nested.clientTs ?? null,
    receivedAt: row.received_at || nested.receivedAt || "",
  };
}

async function supabaseFetch(config, path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
  try {
    return await fetch(`${config.url}/rest/v1${path}`, {
      ...options,
      headers: {
        "apikey": config.serviceRoleKey,
        "Authorization": `Bearer ${config.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw new Error("Supabase request timed out", { cause: err });
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeSupabaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeTableName(value) {
  const table = String(value || "").trim();
  return /^[A-Za-z_][A-Za-z0-9_]{0,62}$/.test(table) ? table : "";
}
