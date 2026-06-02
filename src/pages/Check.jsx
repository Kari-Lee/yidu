import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { TI } from "../data/quiz";
import { P } from "../data/prompts";
import { useAI } from "../hooks/useAI";
import { PartnerTypeSelector } from "../components/AIInput";
import { ShareBar, LoadingSkeleton } from "../components/Shared";

export default function Check() {
  const { t } = useTranslation();
  const { step, result: res, loadingMsg, error, submit, reset } = useAI();
  const [text, setText] = useState("");
  const [pType, setPType] = useState("");
  const hasInput = text.trim();

  const handleSubmit = () => {
    if (!hasInput) return;
    submit(P.check, "对方类型：" + (pType ? TI[pType].label : "未知") + "\n\n我想发：" + text, null, ["评估杀伤力", "模拟Ta反应"]);
  };
  const handleReset = () => { reset(); setText(""); };

  if (step === "loading") return <LoadingSkeleton message={loadingMsg} />;

  if (step === "result" && res) return (
    <div className="animate-fu">
      <div style={{ ...sec, padding: 24 }}>
        <div className="text-center py-8 px-5 mb-5 rounded-[22px]" style={{ background: res.danger ? "linear-gradient(135deg,#FFF5F3,#FFE3E3)" : "linear-gradient(135deg,#F0FFF4,#D3F9D8)" }}>
          <div className="text-[52px] mb-2.5">{res.danger ? "🚨" : "✅"}</div>
          <div className="font-serif text-[38px] font-black" style={{ color: res.danger ? "#C4616C" : C.sage }}>{res.verdict}</div>
        </div>
        {res.type_note && <div className="p-3.5 rounded-[14px] mb-4 text-[14px]" style={{ background: C.warm, color: C.ink + "CC", lineHeight: 1.8 }}><span className="font-bold">🎯 </span>{res.type_note}</div>}
        {res.danger && (
          <div>
            <div className="flex gap-2.5 mb-3.5">
              <div className="flex-1 p-4 rounded-[14px]" style={{ background: "#FFF5F3" }}>
                <div className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>{t("result.willTrigger")}</div>
                <div className="text-[13px] font-extrabold" style={{ color: C.rose }}>{res.trigger}</div>
              </div>
              <div className="flex-1 p-4 rounded-[14px]" style={{ background: C.warm }}>
                <div className="text-[11px] font-bold mb-1" style={{ color: C.muted }}>{t("result.theyWill")}</div>
                <div className="text-[13px]" style={{ color: C.ink + "CC" }}>{res.prediction}</div>
              </div>
            </div>
            <div className="p-5 rounded-[18px]" style={{ background: "linear-gradient(135deg,#F0FFF4,#E6FCF5)", border: "2px solid #C3FAE8" }}>
              <div className="text-[12px] font-extrabold mb-2" style={{ color: C.sage }}>{t("result.alternative")}</div>
              <div className="font-serif text-[17px] font-bold mb-1.5" style={{ color: C.ink }}>{"「" + res.alternative + "」"}</div>
              <div className="text-[12px]" style={{ color: C.sub }}>{"→ " + res.reason}</div>
            </div>
          </div>
        )}
        {!res.danger && <div className="p-4 rounded-[14px] text-[14px]" style={{ background: "#F0FFF4", color: C.ink + "CC", lineHeight: 1.8 }}>{res.reason}</div>}
      </div>
      <ShareBar />
      <button onClick={handleReset} className="w-full mt-2 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("actions.retry")}</button>
    </div>
  );

  return (
    <div className="animate-fu-fast">
      {error && <div className="p-3.5 rounded-[14px] mb-3.5 text-[13px]" style={{ background: "#FFF5F5", color: C.rose, border: "1px solid #FFE3E3" }}>{error}</div>}
      <div className="rounded-3xl p-6" style={{ background: C.card, boxShadow: "0 2px 16px rgba(45,42,50,.04)", border: `1px solid ${C.line}` }}>
        <PartnerTypeSelector pType={pType} setPType={setPType} />
        <textarea className="w-full p-3.5 bg-transparent border-none resize-none outline-none text-[15px]" style={{ color: C.ink, lineHeight: 1.9 }}
          rows={4} placeholder={t("input.checkPlaceholder")} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button onClick={handleSubmit} disabled={!hasInput} className="w-full mt-4 py-4 rounded-[18px] border-none text-[16px] font-bold transition-all"
        style={{ color: C.ink, cursor: hasInput ? "pointer" : "default", background: hasInput ? C.sage : "#ddd", boxShadow: hasInput ? `0 8px 28px ${C.sage}30` : "none" }}>
        {t("actions.check")}
      </button>
    </div>
  );
}
