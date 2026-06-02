import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { calcBazi, baziCompat } from "../data/bazi";

export default function Bazi() {
  const { t } = useTranslation();
  const [calType, setCalType] = useState("solar");
  const [d1, setD1] = useState({ y: "", m: "", d: "" });
  const [d2, setD2] = useState({ y: "", m: "", d: "" });
  const [result, setResult] = useState(null);

  const doBazi = () => {
    const b1 = calcBazi(parseInt(d1.y), parseInt(d1.m), parseInt(d1.d));
    const b2 = calcBazi(parseInt(d2.y), parseInt(d2.m), parseInt(d2.d));
    setResult(baziCompat(b1, b2));
  };

  const ready = d1.y && d1.m && d1.d && d2.y && d2.m && d2.d;

  const DateInput = ({ item }) => (
    <div className="p-5 rounded-[20px] mb-3" style={{ background: C.card, boxShadow: "0 2px 20px rgba(26,31,54,.04)", border: `1px solid ${C.line}` }}>
      <div className="text-[14px] font-bold mb-3" style={{ color: C.ink }}>{item.label}</div>
      <div className="flex gap-2">
        {[{ k: "y", ph: t("bazi.year"), flex: 2 }, { k: "m", ph: t("bazi.month"), flex: 1 }, { k: "d", ph: t("bazi.day"), flex: 1 }].map((f) => (
          <input key={f.k} type="tel" inputMode="numeric" pattern="[0-9]*" placeholder={f.ph}
            value={item.date[f.k]} onChange={(e) => item.setDate({ ...item.date, [f.k]: e.target.value })}
            className="min-w-0 p-3 rounded-xl text-center text-[15px]"
            style={{ flex: f.flex, border: `1px solid ${C.line}`, color: C.ink, background: C.warm }} />
        ))}
      </div>
    </div>
  );

  if (result) return (
    <div className="animate-fu">
      <div className="rounded-3xl py-9 px-6 text-center relative overflow-hidden mb-4" style={{ background: "linear-gradient(135deg,rgba(45,52,54,.85),rgba(45,52,54,.75))", color: C.ink }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 30%,rgba(184,151,106,.12),transparent 60%)" }} />
        <div className="text-[12px] tracking-[3px] mb-3 relative" style={{ color: C.gold }}>{t("bazi.score")}</div>
        <div className="font-serif text-[56px] font-black relative" style={{ color: C.ink }}>{result.score}<span className="text-[20px]">%</span></div>
        <div className="font-serif text-[22px] font-bold mt-2 relative" style={{ color: C.gold }}>{result.info.type}</div>
      </div>
      <div className="flex gap-3 mb-4">
        {[{ label: t("bazi.you"), gz: result.gz1, w: result.w1, sx: result.sx1 }, { label: t("bazi.them"), gz: result.gz2, w: result.w2, sx: result.sx2 }].map((p, i) => (
          <div key={i} className="flex-1 text-center" style={{ ...sec, marginTop: 0 }}>
            <div className="text-[11px] mb-1.5" style={{ color: C.muted }}>{p.label}</div>
            <div className="font-serif text-[20px] font-bold" style={{ color: C.ink }}>{p.gz}</div>
            <div className="text-[12px] mt-1" style={{ color: C.sub }}>{p.w}命 · {p.sx}年</div>
          </div>
        ))}
        <div className="flex items-center"><span className="text-[24px]" style={{ color: C.gold }}>❤️</span></div>
      </div>
      <div style={sec}><div className="text-[15px]" style={{ lineHeight: 2, color: C.ink + "DD" }}>{result.info.desc}</div></div>
      <button onClick={() => setResult(null)} className="w-full mt-4 py-4 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("bazi.retry")}</button>
    </div>
  );

  return (
    <div className="animate-fu">
      <div className="text-center mb-5">
        <div className="text-[48px] mb-3" style={{ lineHeight: 1.4 }}>💫</div>
        <div className="font-serif text-[24px] font-bold mb-1.5" style={{ color: C.ink }}>{t("bazi.title")}</div>
        <div className="text-[13px] mb-4" style={{ color: C.sub }}>{t("bazi.desc")}</div>
        <div className="inline-flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
          {["solar", "lunar"].map((ct) => (
            <button key={ct} onClick={() => setCalType(ct)} className="px-5 py-2 text-[13px] font-semibold border-none cursor-pointer"
              style={{ background: calType === ct ? C.wine : "#fff", color: calType === ct ? "#fff" : C.sub }}>{t(`bazi.${ct}`)}</button>
          ))}
        </div>
      </div>
      <DateInput item={{ label: t("bazi.yourBday"), date: d1, setDate: setD1 }} />
      <DateInput item={{ label: t("bazi.theirBday"), date: d2, setDate: setD2 }} />
      <button onClick={doBazi} disabled={!ready} className="w-full mt-2 py-4 rounded-[18px] text-[16px] font-bold border-none cursor-pointer"
        style={{ color: C.ink, background: ready ? C.wine : "#ddd", boxShadow: ready ? "0 8px 28px rgba(44,62,107,.15)" : "none" }}>
        {t("bazi.submit")}
      </button>
    </div>
  );
}
