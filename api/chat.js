module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  // Use custom base URL if set (e.g. for APIYi relay), otherwise default to Anthropic
  const baseUrl = process.env.API_BASE_URL || "https://api.anthropic.com";

  try {
    const { system, message, tab } = req.body;

    const response = await fetch(`${baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: system,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }

    // Extract text content
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
