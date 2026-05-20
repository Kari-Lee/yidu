import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { C, sec } from "../data/colors";
import { QUIZ, TI, calcQuiz } from "../data/quiz";
import { TCard, ShareBar } from "../components/Shared";

export default function Quiz() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [qi, setQi] = useState(0);
  const [qa, setQa] = useState([]);
  const [qr, setQr] = useState(null);
  const [pk, setPk] = useState(-1);

  const ansQ = (i) => {
    setPk(i);
    setTimeout(() => {
      const n = [...qa, i];
      setQa(n);
      setPk(-1);
      if (qi < QUIZ.length - 1) setQi(qi + 1);
      else setQr(calcQuiz(n));
    }, 250);
  };

  if (qr) {
    return (
      <div className="animate-fu">
        <TCard type={qr.type} />
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {TI[qr.type].traits.map((tr, i) => (
            <span key={i} className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold" style={{ background: TI[qr.type].bg, color: C.ink + "CC", border: `1px solid ${C.line}` }}>#{tr}</span>
          ))}
        </div>
        <div style={sec}><div className="font-serif text-[14px] font-bold mb-2.5" style={{ color: C.ink }}>{t("quiz.yourProfile")}</div><div className="text-[15px]" style={{ lineHeight: 2, color: C.ink + "DD" }}>{TI[qr.type].detail}</div></div>
        <div style={sec}>
          <div className="text-[13px] font-bold mb-3.5" style={{ color: C.sub }}>{t("quiz.scores")}</div>
          {Object.keys(qr.scores).map((k) => {
            const pct = Math.round((qr.scores[k] / QUIZ.length) * 100);
            return (
              <div key={k} className="flex items-center gap-2.5 mb-3">
                <span className="text-[18px] w-[26px]">{TI[k].emoji}</span>
                <span className="text-[13px] w-[50px] font-semibold" style={{ color: C.sub }}>{TI[k].label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: C.line }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: pct + "%", background: TI[k].grad }} />
                </div>
                <span className="text-[14px] font-bold w-9 text-right" style={{ color: TI[k].color }}>{pct}%</span>
              </div>
            );
          })}
        </div>
        <div style={{ ...sec, background: TI[qr.type].bg, border: "none" }}>
          <div className="font-serif text-[14px] font-bold mb-2.5" style={{ color: C.ink }}>{t("quiz.advice")}</div>
          <div className="text-[15px]" style={{ lineHeight: 2, color: C.ink + "DD" }}>{TI[qr.type].advice}</div>
        </div>
        <ShareBar />
        <div className="flex gap-2.5 mt-2">
          <button onClick={() => { setQi(0); setQa([]); setQr(null); }} className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("quiz.retest")}</button>
          <button onClick={() => navigate("/diagnose")} className="flex-1 py-3.5 rounded-2xl text-[14px] font-bold cursor-pointer border-none" style={{ background: C.wine, color: C.ink, boxShadow: `0 4px 16px ${C.wine}30` }}>{t("quiz.continue")}</button>
        </div>
      </div>
    );
  }

  return (
    <div key={qi} className="animate-fu-fast">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-3">
          {qi > 0 && <button onClick={() => { setQi(qi - 1); setQa(qa.slice(0, -1)); setPk(-1); }} className="px-3.5 py-1.5 rounded-[10px] text-[13px] font-bold cursor-pointer" style={{ background: C.warm, color: C.wine, border: `1px solid ${C.line}` }}>{t("quiz.prev")}</button>}
          <span className="font-serif text-[14px] font-bold" style={{ color: C.gold }}>Q{qi + 1}</span>
        </div>
        <span className="text-[12px]" style={{ color: C.muted }}>{qi + 1}/{QUIZ.length}</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden mb-6" style={{ background: C.line }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: ((qi + 1) / QUIZ.length) * 100 + "%", background: `linear-gradient(90deg,${C.gold},${C.wine})` }} />
      </div>
      <div className="rounded-3xl p-7" style={{ background: C.card, boxShadow: "0 2px 20px rgba(0,0,0,.04)", border: `1px solid ${C.line}` }}>
        <div className="font-serif text-[20px] font-bold mb-6" style={{ color: C.ink, lineHeight: 1.6 }}>{QUIZ[qi].q}</div>
        {QUIZ[qi].a.map((a, i) => {
          const on = pk === i;
          return (
            <button key={i} onClick={() => ansQ(i)} className="w-full py-4 px-5 mb-2.5 rounded-2xl text-left cursor-pointer text-[14px] font-medium transition-all" style={{ border: on ? `2px solid ${C.gold}` : `2px solid ${C.line}`, background: on ? C.gold + "12" : C.bg, color: on ? C.gold : C.ink, lineHeight: 1.6 }}>
              <span className="inline-flex w-6 h-6 rounded-lg items-center justify-center text-[11px] font-extrabold mr-3 align-middle" style={{ background: on ? C.gold : C.muted + "40", color: on ? "#fff" : C.sub }}>{String.fromCharCode(65 + i)}</span>{a}
            </button>
          );
        })}
      </div>
    </div>
  );
}
