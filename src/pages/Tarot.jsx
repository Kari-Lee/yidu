import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { TAROT, getSynthesis } from "../data/tarot";

export default function Tarot() {
  const { t } = useTranslation();
  const [pool, setPool] = useState(null);
  const [tarotStep, setTarotStep] = useState("intro");
  const [picked, setPicked] = useState([]);
  const [cards, setCards] = useState(null);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [synthesis, setSynthesis] = useState("");

  const start = () => {
    const shuffled = [...TAROT].sort(() => Math.random() - 0.5).slice(0, 12)
      .map((c) => ({ ...c, reversed: Math.random() > 0.6 }));
    setPool(shuffled); setTarotStep("pick"); setPicked([]); setCards(null); setRevealed([false, false, false]); setSynthesis(getSynthesis());
  };

  const pick = (idx) => {
    if (picked.length >= 3 || picked.includes(idx)) return;
    const np = [...picked, idx];
    setPicked(np);
    if (np.length === 3) {
      const labels = [t("tarot.pick1").split(" · ")[1], t("tarot.pick2").split(" · ")[1], t("tarot.pick3").split(" · ")[1]];
      const descs = ["影响你现在的根源", "你当前的状态与能量", "即将到来的趋势"];
      setCards(np.map((pi, i) => ({ ...pool[pi], pos: labels[i], posDesc: descs[i] })));
      setTarotStep("reveal");
    }
  };

  const reveal = (i) => { const n = [...revealed]; n[i] = true; setRevealed(n); };

  if (tarotStep === "intro") return (
    <div className="animate-fu text-center">
      <div className="rounded-[28px] py-12 px-7 relative overflow-hidden mb-5" style={{ background: "linear-gradient(135deg,#2D2A32,#4A3F5C)", color: C.ink }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%,rgba(196,155,106,.15),transparent 50%),radial-gradient(circle at 70% 60%,rgba(123,107,168,.15),transparent 50%)" }} />
        <div className="text-[72px] mb-4 relative animate-float">🌙</div>
        <div className="font-serif text-[28px] font-bold mb-2 relative">{t("tarot.title")}</div>
        <div className="text-[14px] opacity-70 relative" style={{ lineHeight: 1.7 }}>{t("tarot.desc")}<br />{t("tarot.positions")}</div>
      </div>
      <button onClick={start} className="w-full py-4 rounded-[18px] border-none text-[17px] font-bold cursor-pointer animate-glow"
        style={{ color: C.ink, background: `linear-gradient(135deg,${C.gold},${C.wine})`, boxShadow: `0 8px 30px ${C.wine}30` }}>
        {t("tarot.start")}
      </button>
    </div>
  );

  if (tarotStep === "pick" && pool) return (
    <div>
      <div className="font-serif text-center text-[16px] mb-1.5" style={{ color: C.ink }}>{t("tarot.pickHint")}</div>
      <div className="text-center text-[13px] mb-5" style={{ color: C.sub }}>
        {picked.length === 0 ? t("tarot.pick1") : picked.length === 1 ? t("tarot.pick2") : picked.length === 2 ? t("tarot.pick3") : t("tarot.pickDone")}
      </div>
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {pool.map((_, i) => {
          const isPicked = picked.includes(i);
          const pickOrder = picked.indexOf(i);
          const labels = [t("tarot.pick1").split(" · ")[1], t("tarot.pick2").split(" · ")[1], t("tarot.pick3").split(" · ")[1]];
          return (
            <div key={i} onClick={() => pick(i)} className="transition-all duration-300" style={{ cursor: isPicked || picked.length >= 3 ? "default" : "pointer", opacity: isPicked ? 0.5 : 1, transform: isPicked ? "scale(.92)" : "scale(1)" }}>
              <div className="rounded-2xl py-7 px-3 text-center flex flex-col items-center justify-center min-h-[120px]"
                style={{ background: isPicked ? `linear-gradient(160deg,${C.warm},#F0E6F6)` : "linear-gradient(160deg,#2D2A32,#4A3F5C)", border: isPicked ? `2px solid ${C.gold}` : "2px solid rgba(196,155,106,.2)", boxShadow: isPicked ? "0 4px 16px rgba(196,155,106,.15)" : "0 4px 20px rgba(45,42,50,.12)" }}>
                {!isPicked && <><div className="text-[32px] mb-1.5 opacity-50">🌙</div><div className="text-[10px] tracking-[1px]" style={{ color: C.sub }}>{i + 1}</div></>}
                {isPicked && <><div className="text-[10px] font-bold tracking-[2px]" style={{ color: C.gold }}>{labels[pickOrder]}</div><div className="text-[24px] my-1.5">✦</div><div className="text-[10px]" style={{ color: C.sub }}>已选择</div></>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (tarotStep === "reveal" && cards) return (
    <div>
      <div className="font-serif text-center text-[14px] italic mb-5" style={{ color: C.gold }}>{t("tarot.tapReveal")}</div>
      <div className="flex gap-3 mb-6">
        {cards.map((card, i) => (
          <div key={i} onClick={() => reveal(i)} className="flex-1" style={{ cursor: revealed[i] ? "default" : "pointer" }}>
            <div className="text-center text-[11px] font-bold mb-2 tracking-[2px]" style={{ color: C.gold }}>{card.pos}</div>
            <div className="rounded-[18px] text-center flex flex-col items-center justify-center min-h-[180px] transition-all duration-400"
              style={{ padding: revealed[i] ? "20px 14px" : "28px 14px", background: revealed[i] ? `linear-gradient(160deg,${C.warm},#fff)` : "linear-gradient(160deg,#2D2A32,#4A3F5C)", border: `2px solid ${revealed[i] ? C.gold + "40" : "rgba(196,155,106,.3)"}`, boxShadow: revealed[i] ? "0 8px 30px rgba(45,42,50,.08)" : "0 4px 20px rgba(45,42,50,.15)" }}>
              {!revealed[i] && <><div className="text-[40px] mb-2 opacity-60">🌙</div><div className="font-serif text-[12px] italic" style={{ color: C.sub }}>tap to reveal</div></>}
              {revealed[i] && <><div className="text-[36px] mb-2">{card.icon}</div><div className="font-serif text-[16px] font-bold mb-1" style={{ color: C.ink }}>{card.name}</div><div className="text-[10px] font-bold tracking-[1px]" style={{ color: card.reversed ? C.rose : C.gold }}>{card.reversed ? t("tarot.reversed") : t("tarot.upright")}</div></>}
            </div>
          </div>
        ))}
      </div>

      {revealed.every(Boolean) && (
        <div className="animate-fu">
          <div className="rounded-[20px] p-6 mb-3.5" style={{ ...sec, background: "linear-gradient(135deg,#2D2A32,#4A3F5C)", border: "none", color: C.ink }}>
            <div className="font-serif text-[13px] italic tracking-[2px] mb-2.5" style={{ color: C.gold }}>{t("tarot.synthesis")}</div>
            <div className="text-[15px] opacity-90" style={{ lineHeight: 2 }}>{synthesis}</div>
          </div>
          {cards.map((card, i) => {
            const reading = card.reversed ? card.rev : card.up;
            return (
              <div key={i} style={{ ...sec, marginBottom: 14, overflow: "hidden" }}>
                <div className="flex items-center gap-3.5 mb-4 pb-4" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-[28px] shrink-0" style={{ background: card.reversed ? "linear-gradient(135deg,#FFE3E3,#FFC9C9)" : `linear-gradient(135deg,${C.warm},#FFF3E0)` }}>{card.icon}</div>
                  <div className="flex-1">
                    <div className="font-serif text-[18px] font-bold" style={{ color: C.ink }}>{card.pos} · {card.name}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: C.sub }}>{card.posDesc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold tracking-[1px]" style={{ color: card.reversed ? C.rose : C.gold }}>{card.reversed ? t("tarot.reversed") : t("tarot.upright")}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: C.muted }}>{card.num} · {card.element}</div>
                  </div>
                </div>
                <div className="text-[15px] mb-4" style={{ lineHeight: 2, color: C.ink + "DD" }}>{reading}</div>
                <div className="p-3.5 rounded-[14px] mb-3" style={{ background: card.reversed ? "#FFF5F3" : C.warm, borderLeft: `3px solid ${card.reversed ? C.rose : C.gold}` }}>
                  <div className="text-[12px] font-bold mb-1" style={{ color: card.reversed ? C.rose : C.gold }}>{t("tarot.love")}</div>
                  <div className="font-serif text-[14px] italic" style={{ color: C.ink, lineHeight: 1.7 }}>{card.love}</div>
                </div>
                <div className="flex gap-2.5">
                  <div className="flex-1 p-3 rounded-xl" style={{ background: C.bg }}><div className="text-[10px] font-bold mb-1 tracking-[1px]" style={{ color: C.muted }}>{t("tarot.energy")}</div><div className="text-[12px]" style={{ color: C.sub, lineHeight: 1.5 }}>{card.energy}</div></div>
                  <div className="flex-1 p-3 rounded-xl" style={{ background: C.bg }}><div className="text-[10px] font-bold mb-1 tracking-[1px]" style={{ color: C.muted }}>{t("tarot.timing")}</div><div className="text-[12px]" style={{ color: C.sub, lineHeight: 1.5 }}>{card.timing}</div></div>
                </div>
                <div className="mt-3 p-3.5 rounded-[14px]" style={{ background: `linear-gradient(135deg,${C.warm},#F0E6F6)` }}>
                  <div className="text-[12px] font-bold mb-1" style={{ color: C.plum }}>{t("tarot.action")}</div>
                  <div className="text-[13px]" style={{ color: C.ink + "CC", lineHeight: 1.7 }}>{card.action}</div>
                </div>
              </div>
            );
          })}
          <button onClick={start} className="w-full mt-3.5 py-4 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("tarot.reshuffle")}</button>
        </div>
      )}
    </div>
  );

  return null;
}
