module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  var baseUrl = process.env.API_BASE_URL || "https://api.minimaxi.com/anthropic";

  try {
    var body = req.body;

    var response = await fetch(baseUrl + "/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "MiniMax-M2.5",
        max_tokens: 2048,
        system: body.system || "",
        messages: [{ role: "user", content: body.message }],
      }),
    });

    var data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: JSON.stringify(data) });
    }

    var text = "";
    if (data.content) {
      for (var i = 0; i < data.content.length; i++) {
        if (data.content[i].type === "text") {
          text += data.content[i].text;
        }
      }
    }

    return res.status(200).json({ text: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
