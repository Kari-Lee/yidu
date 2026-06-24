import { getOssConfig } from "../server/oss.js";
import { getSupabaseConfig, listFeedbackRecords } from "../server/supabase.js";
import {
  FeedbackSummaryError,
  loadFeedbackRecords,
  normalizeSummaryQuery,
  requireFeedbackAdmin,
  summarizeFeedbackRecords,
} from "../server/feedback-summary.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    requireFeedbackAdmin(req);
    const query = normalizeSummaryQuery(req.query || {});
    const supabaseConfig = getSupabaseConfig();
    if (supabaseConfig) {
      const records = await listFeedbackRecords(supabaseConfig, query);
      const summary = summarizeFeedbackRecords(records, {
        ...query,
        scannedObjects: records.length,
        storage: "supabase",
      });
      return res.status(200).json(summary);
    }

    const config = getOssConfig();
    if (!config) throw new FeedbackSummaryError(503, "Feedback storage is not configured");
    const summary = await loadFeedbackRecords(config, { ...query, storage: "oss" });
    return res.status(200).json(summary);
  } catch (err) {
    console.warn("[feedback-summary]", JSON.stringify({
      status: err.status || 500,
      error: String(err.message || "Internal error").slice(0, 300),
    }));
    return res.status(err.status || 500).json({ error: err.message || "Internal error" });
  }
}
