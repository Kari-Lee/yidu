import { useState } from "react";
import { C } from "../data/colors";

function getStoredToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("yidu_feedback_token") || "";
}

function setStoredToken(token) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem("yidu_feedback_token", token);
  else window.localStorage.removeItem("yidu_feedback_token");
}

function n(value) {
  return Number(value || 0).toLocaleString("zh-CN");
}

function short(value, length = 72) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function Stat({ label, value, hint }) {
  return (
    <div className="bg-white rounded-[18px] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
      <div className="text-[11px] font-bold tracking-[3px] uppercase mb-2" style={{ color: C.sub }}>{label}</div>
      <div className="text-[28px] font-black" style={{ color: C.ink }}>{value}</div>
      {hint ? <div className="text-[12px] mt-2" style={{ color: C.sub }}>{hint}</div> : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-[20px] p-8 text-center" style={{ color: C.sub, boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
      {message}
    </div>
  );
}

export default function FeedbackDashboard() {
  const [token, setToken] = useState(getStoredToken);
  const [days, setDays] = useState(14);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    setStoredToken(token.trim());
    try {
      const params = new URLSearchParams({ days: String(days), limit: "5000" });
      const response = await fetch(`/api/feedback-summary?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "加载失败");
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setError(err.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  const totals = summary?.totals || {};

  return (
    <div className="animate-fu pb-10">
      <div className="mb-7">
        <div className="text-[11px] font-bold tracking-[5px] uppercase mb-3" style={{ color: C.gold }}>YIDU OPS</div>
        <h1 className="font-serif text-[36px] font-black mb-3" style={{ color: C.ink }}>数据复盘</h1>
        <p className="text-[14px]" style={{ color: C.sub, lineHeight: 1.8 }}>
          看哪些功能被复制、保存、分享，优先判断传播点和结果质量。
        </p>
      </div>

      <div className="bg-white rounded-[22px] p-5 mb-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_120px_140px] gap-3">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="FEEDBACK_ADMIN_TOKEN"
            className="rounded-[14px] border-none px-4 py-3 text-[14px]"
            style={{ background: C.bg, color: C.ink }}
            type="password"
          />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-[14px] border-none px-4 py-3 text-[14px]"
            style={{ background: C.bg, color: C.ink }}
          >
            <option value={7}>近 7 天</option>
            <option value={14}>近 14 天</option>
            <option value={30}>近 30 天</option>
            <option value={90}>近 90 天</option>
          </select>
          <button
            onClick={load}
            disabled={loading || !token.trim()}
            className="rounded-[14px] border-none px-5 py-3 text-[14px] font-black cursor-pointer disabled:opacity-40"
            style={{ background: C.ink, color: "#fff" }}
          >
            {loading ? "读取中" : "刷新数据"}
          </button>
        </div>
        {error ? <div className="text-[13px] mt-3" style={{ color: C.rose }}>{error}</div> : null}
      </div>

      {summary ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Stat label="总事件" value={n(totals.records)} hint={`扫描 ${n(summary.window.scannedObjects)} 个对象`} />
            <Stat label="复制" value={n(totals.copies)} hint="用户明确想带走" />
            <Stat label="保存图" value={n(totals.posterSaves)} hint="社媒传播素材" />
            <Stat label="分享" value={n(totals.shares)} hint="直接外发行为" />
          </div>

          <section className="bg-white rounded-[22px] p-5 mb-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
            <h2 className="text-[17px] font-black mb-4" style={{ color: C.ink }}>功能表现</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead style={{ color: C.sub }}>
                  <tr>
                    <th className="py-2 pr-4">功能</th>
                    <th className="py-2 pr-4">总事件</th>
                    <th className="py-2 pr-4">复制</th>
                    <th className="py-2 pr-4">保存图</th>
                    <th className="py-2 pr-4">分享</th>
                    <th className="py-2 pr-4">互动合计</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.byTask.map((item) => (
                    <tr key={item.task} style={{ borderTop: "1px solid rgba(0,0,0,.05)" }}>
                      <td className="py-3 pr-4 font-bold" style={{ color: C.ink }}>{item.label}</td>
                      <td className="py-3 pr-4">{n(item.total)}</td>
                      <td className="py-3 pr-4">{n(item.events.copy)}</td>
                      <td className="py-3 pr-4">{n(item.events.poster_save)}</td>
                      <td className="py-3 pr-4">{n(item.events.share)}</td>
                      <td className="py-3 pr-4 font-black" style={{ color: C.gold }}>{n(item.engagement)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white rounded-[22px] p-5 mb-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
            <h2 className="text-[17px] font-black mb-4" style={{ color: C.ink }}>可传播结果 Top 50</h2>
            {summary.topContent.length ? (
              <div className="space-y-3">
                {summary.topContent.slice(0, 20).map((item, index) => (
                  <div key={`${item.task}-${index}`} className="rounded-[16px] p-4" style={{ background: C.bg }}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-[12px] font-black" style={{ color: C.gold }}>
                        #{index + 1} {item.taskLabel}{item.mode ? ` · ${item.mode}` : ""}
                      </div>
                      <div className="text-[11px]" style={{ color: C.sub }}>
                        复制 {n(item.events.copy)} / 保存 {n(item.events.poster_save)} / 分享 {n(item.events.share)}
                      </div>
                    </div>
                    <div className="text-[15px] font-bold mb-1" style={{ color: C.ink }}>{short(item.title || item.text, 96)}</div>
                    {item.summary ? <div className="text-[13px]" style={{ color: C.sub, lineHeight: 1.6 }}>{short(item.summary, 120)}</div> : null}
                    {item.exampleSource ? <div className="text-[12px] mt-2" style={{ color: C.muted }}>{short(item.exampleSource, 120)}</div> : null}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="还没有足够的复制、保存或分享事件。" />
            )}
          </section>

          <section className="bg-white rounded-[22px] p-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
            <h2 className="text-[17px] font-black mb-4" style={{ color: C.ink }}>最近事件</h2>
            <div className="space-y-2">
              {summary.recent.slice(0, 30).map((item, index) => (
                <div key={`${item.receivedAt}-${index}`} className="grid grid-cols-[92px_88px_1fr] gap-3 py-3 text-[12px]" style={{ borderTop: index ? "1px solid rgba(0,0,0,.05)" : "none" }}>
                  <div style={{ color: C.sub }}>{String(item.receivedAt || "").slice(5, 16).replace("T", " ")}</div>
                  <div className="font-black" style={{ color: C.gold }}>{item.taskLabel} · {item.event}</div>
                  <div style={{ color: C.ink }}>{short(item.title || item.text || item.summary || item.source, 110)}</div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyState message="输入管理 token 后刷新，读取 OSS 里的反馈数据。" />
      )}
    </div>
  );
}
