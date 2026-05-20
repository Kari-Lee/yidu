export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  // Adapter: pick provider based on env var
  const provider = process.env.AI_PROVIDER || "qwen"; // "qwen" | "claude" | "openai"

  try {
    const body = req.body;
    let text = "";

    if (provider === "claude") {
      text = await callClaude(apiKey, body);
    } else if (provider === "openai") {
      text = await callOpenAI(apiKey, body, process.env.API_BASE_URL || "https://api.openai.com/v1");
    } else {
      text = await callQwen(apiKey, body, process.env.API_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1");
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}

// Qwen (China mainland)
async function callQwen(apiKey, body, baseUrl) {
  const messages = [];
  if (body.system) messages.push({ role: "system", content: body.system });
  if (body.images?.length > 0) {
    const userContent = [{ type: "text", text: body.message || "请仔细分析这些聊天记录截图中的对话内容" }];
    body.images.forEach((img) => userContent.push({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + img } }));
    messages.push({ role: "user", content: userContent });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: process.env.AI_MODEL || "qwen-vl-max-latest", max_tokens: 16000, messages, enable_thinking: false }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.choices?.[0]?.message?.content || "";
}

// Claude (overseas)
async function callClaude(apiKey, body) {
  const messages = [];
  if (body.images?.length > 0) {
    const content = [{ type: "text", text: body.message || "Please analyze these chat screenshots" }];
    body.images.forEach((img) => content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: img } }));
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 16000,
      system: body.system || "",
      messages,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.content?.map((c) => c.text || "").join("") || "";
}

// OpenAI-compatible (fallback)
async function callOpenAI(apiKey, body, baseUrl) {
  const messages = [];
  if (body.system) messages.push({ role: "system", content: body.system });
  if (body.images?.length > 0) {
    const content = [{ type: "text", text: body.message || "Please analyze these chat screenshots" }];
    body.images.forEach((img) => content.push({ type: "image_url", image_url: { url: "data:image/jpeg;base64," + img } }));
    messages.push({ role: "user", content });
  } else {
    messages.push({ role: "user", content: body.message });
  }

  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model: process.env.AI_MODEL || "gpt-4o", max_tokens: 16000, messages }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data.choices?.[0]?.message?.content || "";
}
