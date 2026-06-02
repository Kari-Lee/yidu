import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C } from "../data/colors";
import { calcFortune } from "../data/fortune";

export default function Fortune() {
  const { t } = useTranslation();
  const [calType, setCalType] = useState("solar");
  const [fYear, setFYear] = useState("");
  const [fMonth, setFMonth] = useState("");
  const [fDay, setFDay] = useState("");
  const [result, setResult] = useState(null);

  const ready = fMonth && fDay;

  if (result) return (
    <div className="animate-fu">
      <div className="rounded-3xl py-9 px-6 text-center relative overflow-hidden mb-4" style={{ background: "linear-gradient(135deg,rgba(45,52,54,.85),rgba(45,52,54,.75))", color: C.ink }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%,rgba(184,151,106,.1),transparent 60%)" }} />
        <div className="text-[12px] tracking-[3px] mb-3 relative" style={{ color: C.gold }}>{t("fortune.heading")}</div>
        <div className="text-[32px] relative" style={{ letterSpacing: 6 }}>
          {Array(result.stars).fill(null).map((_, i) => <span key={i}>⭐</span>)}
          {Array(5 - result.stars).fill(null).map((_, i) => <span key={i} className="opacity-20">⭐</span>)}
        </div>
        <div className="flex gap-2 justify-center flex-wrap mt-3.5 relative">
          {result.kw.map((k, i) => <span key={i} className="px-3.5 py-1 rounded-full text-[13px]" style={{ background: "rgba(255,255,255,.1)", color: C.ink + "CC" }}>#{k}</span>)}
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        {[{ label: t("qian.yi"), color: C.sage, content: result.yi }, { label: t("qian.ji"), color: C.rose, content: result.ji }].map((item, i) => (
          <div key={i} className="flex-1 p-4 rounded-[18px]" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="text-[11px] font-bold mb-1.5" style={{ color: item.color }}>{item.label}</div>
            <div className="text-[13px]" style={{ color: C.ink + "CC", lineHeight: 1.7 }}>{item.content}</div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-[18px] mb-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="text-[11px] font-bold mb-1.5" style={{ color: C.gold }}>{t("fortune.luckyColor")}</div>
        <div className="text-[14px]" style={{ color: C.ink + "DD", lineHeight: 1.7 }}>{result.color}</div>
      </div>
      <div className="p-5 rounded-[18px] mb-4" style={{ background: `linear-gradient(135deg,${C.warm},#F0E6F6)` }}>
        <div className="text-[15px] font-medium" style={{ color: C.ink, lineHeight: 2 }}>💬 {result.msg}</div>
      </div>
      <button onClick={() => setResult(null)} className="w-full py-4 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("fortune.retry")}</button>
    </div>
  );

  return (
    <div className="animate-fu text-center">
      <div className="text-[48px] mb-5 pt-2.5">🌙</div>
      <div className="font-serif text-[24px] font-bold mb-1.5" style={{ color: C.ink }}>{t("fortune.title")}</div>
      <div className="text-[13px] mb-4" style={{ color: C.sub }}>{t("fortune.desc")}</div>
      <div className="inline-flex rounded-xl overflow-hidden mb-5" style={{ border: `1px solid ${C.line}` }}>
        {["solar", "lunar"].map((ct) => (
          <button key={ct} onClick={() => setCalType(ct)} className="px-5 py-2 text-[13px] font-semibold border-none cursor-pointer"
            style={{ background: calType === ct ? C.wine : "#fff", color: calType === ct ? "#fff" : C.sub }}>{t(`fortune.${ct}`)}</button>
        ))}
      </div>
      <div className="flex gap-2.5 max-w-[300px] mx-auto mb-5">
        <input type="tel" inputMode="numeric" placeholder={t("bazi.year")} value={fYear} onChange={(e) => setFYear(e.target.value)} className="min-w-0 p-3.5 rounded-[14px] text-center text-[16px]" style={{ flex: 2, border: `1px solid ${C.line}`, color: C.ink, background: C.warm }} />
        <input type="tel" inputMode="numeric" placeholder={t("bazi.month")} value={fMonth} onChange={(e) => setFMonth(e.target.value)} className="min-w-0 p-3.5 rounded-[14px] text-center text-[16px]" style={{ flex: 1, border: `1px solid ${C.line}`, color: C.ink, background: C.warm }} />
        <input type="tel" inputMode="numeric" placeholder={t("bazi.day")} value={fDay} onChange={(e) => setFDay(e.target.value)} className="min-w-0 p-3.5 rounded-[14px] text-center text-[16px]" style={{ flex: 1, border: `1px solid ${C.line}`, color: C.ink, background: C.warm }} />
      </div>
      <button onClick={() => setResult(calcFortune(parseInt(fMonth), parseInt(fDay)))} disabled={!ready}
        className="w-full py-4 rounded-[18px] border-none text-[16px] font-bold cursor-pointer"
        style={{ color: C.ink, background: ready ? C.wine : "#ddd", boxShadow: ready ? "0 8px 28px rgba(44,62,107,.15)" : "none" }}>
        {t("fortune.submit")}
      </button>
    </div>
  );
}
