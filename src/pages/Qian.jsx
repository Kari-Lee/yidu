import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { QIAN } from "../data/qian";

export default function Qian() {
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [shaking, setShaking] = useState(false);

  const shake = () => {
    setShaking(true); setResult(null);
    setTimeout(() => {
      setResult(QIAN[Math.floor(Math.random() * QIAN.length)]);
      setShaking(false);
    }, 1500);
  };

  if (shaking) return (
    <div className="text-center py-20 px-5">
      <div className="text-[80px]" style={{ animation: "float .3s ease infinite" }}>🏮</div>
      <div className="text-[15px] mt-5" style={{ color: C.sub }}>{t("qian.shaking")}</div>
    </div>
  );

  if (result) return (
    <div className="animate-fu">
      <div className="rounded-3xl py-9 px-7 text-center relative overflow-hidden mb-4" style={{ background: "linear-gradient(135deg,rgba(45,52,54,.85),rgba(45,52,54,.75))", color: C.ink }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%,rgba(184,151,106,.1),transparent 60%)" }} />
        <div className="text-[12px] tracking-[4px] mb-2 relative" style={{ color: "#BBB" }}>{result.rank}</div>
        <div className="font-serif text-[18px] relative" style={{ lineHeight: 2.2, color: "rgba(255,255,255,.9)" }}>{result.poem}</div>
      </div>
      <div style={sec}><div className="text-[13px] font-bold mb-2" style={{ color: C.gold }}>{t("qian.plain")}</div><div className="text-[15px]" style={{ lineHeight: 2, color: C.ink + "DD" }}>{result.read}</div></div>
      <div style={sec}><div className="text-[13px] font-bold mb-2" style={{ color: C.sage }}>{t("qian.guide")}</div><div className="text-[15px]" style={{ lineHeight: 2, color: C.ink + "DD" }}>{result.guide}</div></div>
      <div className="flex gap-3 mt-4">
        <div className="flex-1 p-4 rounded-2xl" style={{ background: "#F0FFF4", border: "1px solid #C3FAE8" }}><div className="text-[11px] font-bold mb-1.5" style={{ color: C.sage }}>{t("qian.yi")}</div><div className="text-[13px]" style={{ color: C.ink + "CC", lineHeight: 1.7 }}>{result.yi}</div></div>
        <div className="flex-1 p-4 rounded-2xl" style={{ background: "#FFF5F5", border: "1px solid #FFE3E3" }}><div className="text-[11px] font-bold mb-1.5" style={{ color: C.rose }}>{t("qian.ji")}</div><div className="text-[13px]" style={{ color: C.ink + "CC", lineHeight: 1.7 }}>{result.ji}</div></div>
      </div>
      <button onClick={shake} className="w-full mt-4 py-4 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("qian.reshake")}</button>
    </div>
  );

  return (
    <div className="animate-fu text-center">
      <div className="rounded-3xl py-12 px-7 relative overflow-hidden mb-5" style={{ background: "linear-gradient(135deg,rgba(45,52,54,.85),rgba(45,52,54,.75))", color: C.ink }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%,rgba(196,114,127,.1),transparent 50%),radial-gradient(circle at 70% 60%,rgba(184,151,106,.1),transparent 50%)" }} />
        <div className="text-[72px] mb-4 relative animate-float">🏮</div>
        <div className="font-serif text-[28px] font-bold mb-2 relative">{t("qian.title")}</div>
        <div className="text-[14px] opacity-60 relative" style={{ lineHeight: 1.7 }}>{t("qian.desc")}</div>
      </div>
      <button onClick={shake} className="w-full py-4 rounded-[18px] border-none text-[17px] font-bold cursor-pointer animate-glow"
        style={{ color: C.ink, background: `linear-gradient(135deg,${C.gold},${C.rose})`, boxShadow: "0 8px 30px rgba(184,151,106,.2)" }}>
        {t("qian.shake")}
      </button>
    </div>
  );
}
