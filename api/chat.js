module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });
  var baseUrl = process.env.API_BASE_URL || "https://api.apiyi.com";

  try {
    var body = req.body;
    var messages = [];
    if (body.system) messages.push({ role: "system", content: body.system });

    if (body.images && body.images.length > 0) {
      var userContent = [];
      body.images.forEach(function(img) {
        userContent.push({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + img } });
      });
      userContent.push({ type: "text", text: body.message || "请分析这些聊天记录截图" });
      messages.push({ role: "user", content: userContent });
    } else {
      messages.push({ role: "user", content: body.message });
    }

    var response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        max_tokens: 2048,
        messages: messages,
      }),
    });

    var data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: JSON.stringify(data) });

    var text = "";
    if (data.choices && data.choices[0] && data.choices[0].message) {
      text = data.choices[0].message.content;
    }
    return res.status(200).json({ text: text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
