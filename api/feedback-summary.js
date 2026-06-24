import { getOssConfig } from "../server/oss.js";
import {
  FeedbackSummaryError,
  loadFeedbackRecords,
  normalizeSummaryQuery,
  requireFeedbackAdmin,
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
    const config = getOssConfig();
    if (!config) throw new FeedbackSummaryError(503, "OSS is not configured");
    const summary = await loadFeedbackRecords(config, normalizeSummaryQuery(req.query || {}));
    return res.status(200).json(summary);
  } catch (err) {
    console.warn("[feedback-summary]", JSON.stringify({
      status: err.status || 500,
      error: String(err.message || "Internal error").slice(0, 300),
    }));
    return res.status(err.status || 500).json({ error: err.message || "Internal error" });
  }
}
