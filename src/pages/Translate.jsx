import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { P } from "../data/prompts";
import { useAI } from "../hooks/useAI";
import { ShareBar, LoadingSkeleton } from "../components/Shared";

export default function Translate() {
  const { t } = useTranslation();
  const { step, result: res, loadingMsg, error, submit, reset } = useAI();
  const [text, setText] = useState("");
  const hasInput = text.trim();

  const handleSubmit = () => {
    if (!hasInput) return;
    submit(P.translate, "Ta说的话：\n" + text, null, ["解码潜台词", "翻译真实意图"]);
  };

  const handleReset = () => { reset(); setText(""); };

  if (step === "loading") return <LoadingSkeleton message={loadingMsg} />;

  if (step === "result" && res) {
    const colors = [C.rose, "#E6A817", C.plum];
    return (
      <div className="animate-fu">
        {(res.translations || []).map((tr, ti) => (
          <div key={ti} style={{ ...sec, marginBottom: 14 }}>
            <div className="p-3.5 rounded-[14px] mb-4" style={{ background: C.warm, borderLeft: `3px solid ${C.plum}` }}>
              <div className="text-[11px] font-bold mb-0.5" style={{ color: C.sub }}>Ta说</div>
              <div className="font-serif text-[17px] font-bold" style={{ color: C.ink }}>{"「" + tr.original + "」"}</div>
            </div>
            <div className="font-serif text-[17px] font-bold mb-3.5" style={{ color: C.plum }}>{tr.verdict}</div>
            {(tr.possibilities || []).map((p, i) => (
              <div key={i} className="flex gap-2.5 py-2.5" style={{ opacity: i === 0 ? 1 : 0.55, borderBottom: i < 2 ? `1px solid ${C.line}` : "none" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0" style={{ background: colors[i] + "18", color: colors[i] }}>{p.label}</div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold" style={{ color: C.ink }}>{p.meaning} <span className="text-[11px]" style={{ color: C.sub }}>{p.percent}%</span></div>
                  <div className="text-[12px]" style={{ color: C.sub }}>{p.reason}</div>
                </div>
              </div>
            ))}
            <div className="mt-3 p-2.5 rounded-xl text-[13px]" style={{ background: "#FFF5F3" }}>
              <span className="font-extrabold" style={{ color: C.rose }}>{t("result.mostLikely")}{tr.most_likely}</span>{" "}
              <span style={{ color: C.sub }}>{tr.why}</span>
            </div>
          </div>
        ))}
        <ShareBar />
        <button onClick={handleReset} className="w-full py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("actions.retry")}</button>
      </div>
    );
  }

  return (
    <div className="animate-fu-fast">
      {error && <div className="p-3.5 rounded-[14px] mb-3.5 text-[13px]" style={{ background: "#FFF5F5", color: C.rose, border: "1px solid #FFE3E3" }}>{error}</div>}
      <div className="rounded-3xl p-6" style={{ background: C.card, boxShadow: "0 2px 16px rgba(45,42,50,.04)", border: `1px solid ${C.line}` }}>
        <textarea className="w-full p-3.5 bg-transparent border-none resize-none outline-none text-[15px]" style={{ color: C.ink, lineHeight: 1.9 }}
          rows={4} placeholder={t("input.translatePlaceholder")} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button onClick={handleSubmit} disabled={!hasInput} className="w-full mt-4 py-4 rounded-[18px] border-none text-[16px] font-bold transition-all"
        style={{ color: C.ink, cursor: hasInput ? "pointer" : "default", background: hasInput ? C.plum : "#ddd", boxShadow: hasInput ? `0 8px 28px ${C.plum}30` : "none" }}>
        {t("actions.translate")}
      </button>
    </div>
  );
}
