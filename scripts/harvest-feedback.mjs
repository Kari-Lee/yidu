/**
 * 取库：把 OSS 里攒的「复制/分享反馈」聚合成一份金句榜。
 *
 * 链路上游：小程序复制/分享 → api/feedback.js → OSS  yidu-feedback/YYYYMMDD/{uuid}.json
 * 本脚本：列举该前缀 → 拉下所有 JSON → 按「mode + 回复文本」聚合 → 按复制数排序
 *         → 输出 feedback-gold.json（被真实用户验证过的金句，可人工审、可喂进语料库）。
 *
 * 用法（需要和线上同一套 OSS 只读/读写凭证）：
 *   OSS_ACCESS_KEY_ID=... OSS_ACCESS_KEY_SECRET=... OSS_BUCKET=... OSS_ENDPOINT=... \
 *   node scripts/harvest-feedback.mjs            # 生成 feedback-gold.json + 打印 Top 5
 *   node scripts/harvest-feedback.mjs --print    # 终端列出 Top 20 完整文本（不用开 json）
 *   node scripts/harvest-feedback.mjs --print --top=50   # 自定义打印条数
 *
 * 可选 env：
 *   OSS_FEEDBACK_PREFIX   反馈前缀（默认 yidu-feedback/，需与 api/feedback.js 一致）
 *   FEEDBACK_MIN_COPIES   入榜最低复制数（默认 1）
 *   FEEDBACK_TOP_N        榜单条数上限（默认 500）
 *   FEEDBACK_GOLD_OUT     输出路径（默认 feedback-gold.json）
 *
 * 只读 OSS，不改任何线上数据。
 */

import crypto from "node:crypto";
import process from "node:process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getOssConfig } from "../server/oss.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT = resolve(ROOT, process.env.FEEDBACK_GOLD_OUT || "feedback-gold.json");
const PREFIX = normalizePrefix(process.env.OSS_FEEDBACK_PREFIX || "yidu-feedback/");
const MIN_COPIES = Number(process.env.FEEDBACK_MIN_COPIES || 1);
const TOP_N = Number(process.env.FEEDBACK_TOP_N || 500);
const OSS_TIMEOUT_MS = 10 * 1000;
const CONCURRENCY = 8;
const ARGS = process.argv.slice(2);
const PRINT_EXTENDED = ARGS.includes("--print");
const PRINT_TOP = (function () {
  const a = ARGS.find((x) => x.startsWith("--top="));
  if (a) return Math.max(1, Number(a.slice(6)) || 0);
  return PRINT_EXTENDED ? 20 : 5;
})();

function normalizePrefix(value) {
  return String(value || "").replace(/^\/+/, "").replace(/\/+$/, "") + "/";
}

function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// 与 server/oss.js putJsonObject 同款 V1 签名，这里只做 GET
async function ossGet(config, pathAndQuery, canonicalResource) {
  const date = new Date().toUTCString();
  const stringToSign = `GET\n\n\n${date}\n${canonicalResource}`;
  const signature = crypto.createHmac("sha1", config.accessKeySecret).update(stringToSign).digest("base64");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OSS_TIMEOUT_MS);
  try {
    const res = await fetch(`${config.host}${pathAndQuery}`, {
      method: "GET",
      headers: { Authorization: `OSS ${config.accessKeyId}:${signature}`, Date: date },
      signal: controller.signal,
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`OSS GET ${res.status}: ${detail.slice(0, 200)}`);
    }
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function listKeys(config) {
  const keys = [];
  let marker = "";
  for (let page = 0; page < 100000; page++) {
    const qs = new URLSearchParams({ prefix: PREFIX, "max-keys": "1000" });
    if (marker) qs.set("marker", marker);
    // ListObjects（GET Bucket）的 V1 规范化资源就是 /{bucket}/，prefix/marker 不参与签名
    const xml = await ossGet(config, `/?${qs.toString()}`, `/${config.bucket}/`);
    const pageKeys = [...xml.matchAll(/<Key>([^<]*)<\/Key>/g)].map((m) => decodeXml(m[1]));
    pageKeys.forEach((k) => { if (k.endsWith(".json")) keys.push(k); });
    const truncated = /<IsTruncated>\s*true\s*<\/IsTruncated>/i.test(xml);
    if (!truncated) break;
    const next = (xml.match(/<NextMarker>([^<]*)<\/NextMarker>/) || [])[1];
    marker = next ? decodeXml(next) : (pageKeys[pageKeys.length - 1] || "");
    if (!marker) break;
    process.stdout.write(`  已列举 ${keys.length} 条…\r`);
  }
  return keys;
}

async function getRecord(config, key) {
  try {
    // key 内只含 [A-Za-z0-9/_.-]，encodeURI 不动斜杠，签名用原始 key
    const text = await ossGet(config, `/${encodeURI(key)}`, `/${config.bucket}/${key}`);
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：""''（）《》【】,.!?;:'"()[\]{}<>~`·…—_-]/g, "");
}

async function main() {
  const config = getOssConfig();
  if (!config) {
    console.error("❌ OSS 未配置：需要 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET / OSS_ENDPOINT");
    process.exit(1);
  }
  console.log(`列举 OSS 前缀 ${PREFIX} …`);
  const keys = await listKeys(config);
  console.log(`\n共 ${keys.length} 条反馈对象，开始拉取…`);
  const records = (await mapLimit(keys, CONCURRENCY, (k) => getRecord(config, k))).filter(Boolean);

  const groups = new Map();
  for (const r of records) {
    if (!r || !r.text) continue;
    const mode = r.mode || "";
    const gkey = mode + "|" + normalizeText(r.text);
    let g = groups.get(gkey);
    if (!g) {
      g = {
        mode, text: r.text, copyCount: 0, shareCount: 0,
        routes: new Set(), weapons: new Set(), sources: new Set(),
        exampleSource: r.source || "", firstSeen: r.receivedAt || "", lastSeen: r.receivedAt || ""
      };
      groups.set(gkey, g);
    }
    if (r.event === "copy") g.copyCount += 1;
    else if (r.event === "share") g.shareCount += 1;
    if (r.route) g.routes.add(r.route);
    if (r.weapon) g.weapons.add(r.weapon);
    if (r.sourceHash) g.sources.add(r.sourceHash);
    if (!g.exampleSource && r.source) g.exampleSource = r.source;
    if (r.receivedAt && (!g.firstSeen || r.receivedAt < g.firstSeen)) g.firstSeen = r.receivedAt;
    if (r.receivedAt && r.receivedAt > g.lastSeen) g.lastSeen = r.receivedAt;
  }

  const gold = [...groups.values()]
    .filter((g) => g.copyCount >= MIN_COPIES)
    .map((g) => ({
      mode: g.mode,
      text: g.text,
      copyCount: g.copyCount,
      shareCount: g.shareCount,
      distinctSources: g.sources.size,
      routes: [...g.routes],
      weapons: [...g.weapons],
      exampleSource: g.exampleSource,
      firstSeen: g.firstSeen,
      lastSeen: g.lastSeen,
    }))
    .sort((a, b) => b.copyCount - a.copyCount || b.distinctSources - a.distinctSources)
    .slice(0, TOP_N);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRecords: records.length,
    totalGroups: groups.size,
    minCopies: MIN_COPIES,
    gold,
  }, null, 2) + "\n");

  console.log(`✅ 完成：${records.length} 条反馈 → ${groups.size} 个去重回复 → 入榜 ${gold.length} 条 → ${OUT}`);
  if (gold.length) {
    const shown = gold.slice(0, PRINT_TOP);
    console.log(`\n金句榜 Top ${shown.length}（按复制数）：`);
    shown.forEach((g, i) => {
      const rank = String(i + 1).padStart(2, " ");
      const head = `复制${g.copyCount}·${g.distinctSources}人·${g.mode}` + (g.routes[0] ? `·${g.routes[0]}` : "");
      const body = PRINT_EXTENDED ? g.text : g.text.slice(0, 40);
      console.log(`  ${rank}. [${head}] ${body}`);
    });
  }
}

main().catch((e) => {
  console.error("harvest 失败：", e.message);
  process.exit(1);
});
