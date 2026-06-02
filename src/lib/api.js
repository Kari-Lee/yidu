const MAX_RETRIES = 2;

function parseAIResponse(raw) {
  if (!raw) throw new Error("AI没有返回内容");

  // Strip thinking tags
  raw = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (raw.indexOf("<think>") !== -1) {
    raw = raw.substring(0, raw.indexOf("<think>")).trim();
  }
  raw = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  // Try direct parse
  try { return JSON.parse(raw); } catch (_) { /* continue */ }

  // Try extracting JSON object
  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) {
    try { return JSON.parse(raw.substring(first, last + 1)); } catch (_) { /* continue */ }
  }

  // Try extracting JSON array
  const firstA = raw.indexOf("[");
  const lastA = raw.lastIndexOf("]");
  if (firstA !== -1 && lastA > firstA) {
    try { return JSON.parse(raw.substring(firstA, lastA + 1)); } catch (_) { /* continue */ }
  }

  // Try cleaning control characters
  if (first !== -1 && last > first) {
    const cleaned = raw.substring(first, last + 1).replace(/[\x00-\x1f]/g, (c) => {
      if (c === "\n") return "\\n";
      if (c === "\r") return "\\r";
      if (c === "\t") return "\\t";
      return "";
    });
    try { return JSON.parse(cleaned); } catch (_) { /* continue */ }
  }

  // Fallback: return raw text
  if (first === -1 && raw.length > 10) {
    return { text: raw, fallback: true };
  }

  throw new Error("AI返回格式异常");
}

export async function callAI(sys, message, images) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const body = { system: sys, message };
      if (images?.length > 0) body.images = images;

      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "API error");

      return parseAIResponse(d.text || "");
    } catch (err) {
      if (attempt >= MAX_RETRIES) throw err;
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}
