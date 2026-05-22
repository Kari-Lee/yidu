import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { C } from "../data/colors";
import { getDailyQuote } from "../data/quotes";
import { TI } from "../data/quiz";

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const daily = getDailyQuote();

  const hoverOn = (e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,.08)"; };
  const hoverOff = (e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,.04)"; };

  return (
    <div className="animate-fu">
      {/* Hero CTA */}
      <button onClick={() => navigate("/quiz")} className="w-full bg-white rounded-3xl p-7 border-none cursor-pointer text-left mb-5 relative overflow-hidden transition-all"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,.04)" }} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
        <div className="absolute top-0 left-0 w-1 h-full rounded-l" style={{ background: C.gold }} />
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[4px] uppercase mb-3.5" style={{ color: C.gold }}>{t("home.startHere")}</div>
            <div className="font-serif text-[26px] font-black mb-2" style={{ color: C.ink, lineHeight: 1.3 }}>{t("home.quizTitle")}</div>
            <div className="text-[13px]" style={{ color: C.sub, lineHeight: 1.7 }}>{t("home.quizDesc")}</div>
          </div>
          <div className="text-[52px] animate-float shrink-0 ml-4">🧪</div>
        </div>
      </button>

      {/* Daily quote */}
      <div className="bg-white rounded-[20px] p-5 mb-5" style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}>
        <div className="font-serif text-[14px] italic" style={{ color: C.ink + "BB", lineHeight: 2 }}>{"\u201C"}{daily}{"\u201D"}</div>
        <div className="text-[9px] font-bold tracking-[4px] uppercase mt-2.5" style={{ color: C.gold }}>{t("home.dailyQuote")}</div>
      </div>

      {/* Main tools 2x2 */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {[
          { path: "/diagnose", icon: "🩺", l: t("home.diagnose"), s: t("home.diagnoseDesc") },
          { path: "/translate", icon: "🔮", l: t("home.translate"), s: t("home.translateDesc") },
        ].map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="bg-white rounded-[22px] py-7 px-4 border-none cursor-pointer text-center transition-all"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,.04)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,.04)"; }}>
            <div className="text-[36px] mb-3">{item.icon}</div>
            <div className="text-[15px] font-bold mb-1" style={{ color: C.ink }}>{item.l}</div>
            <div className="text-[11px]" style={{ color: C.sub }}>{item.s}</div>
          </button>
        ))}
      </div>

      {/* Secondary tools 3-col */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { path: "/check", icon: "💊", l: t("home.check"), s: t("home.checkDesc") },
          { path: "/predict", icon: "🔭", l: t("home.predict"), s: t("home.predictDesc") },
          { path: "/tarot", icon: "🌙", l: t("home.tarot"), s: t("home.tarotDesc") },
        ].map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className="bg-white rounded-[18px] pt-5 pb-4 px-2.5 border-none cursor-pointer text-center transition-all"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,.03)" }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
            <div className="text-[28px] mb-2">{item.icon}</div>
            <div className="text-[13px] font-bold" style={{ color: C.ink }}>{item.l}</div>
            <div className="text-[10px] mt-1" style={{ color: C.muted }}>{item.s}</div>
          </button>
        ))}
      </div>

      {/* Mystical section */}
      <div className="bg-white rounded-3xl p-6 mb-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.04)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-[3px] h-4 rounded-sm" style={{ background: C.gold }} />
          <span className="text-[11px] font-bold tracking-[4px] uppercase" style={{ color: C.gold }}>{t("home.mystical")}</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { path: "/qian", icon: "🏮", l: t("home.qian") },
            { path: "/bazi", icon: "💫", l: t("home.bazi") },
            { path: "/fortune", icon: "🌙", l: t("home.fortune") },
          ].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="rounded-2xl pt-4 pb-3.5 px-2 border-none cursor-pointer text-center transition-all"
              style={{ background: C.bg }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "#EDF4FA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = C.bg; }}>
              <div className="text-[26px] mb-2">{item.icon}</div>
              <div className="text-[12px] font-bold" style={{ color: C.ink }}>{item.l}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Chinese Mysticism - overseas features */}
      <div className="rounded-3xl p-6 mb-6" style={{ background: "#0A0A0C", boxShadow: "0 4px 24px rgba(0,0,0,.1)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-[3px] h-4 rounded-sm" style={{ background: "#A08050" }} />
          <span className="text-[11px] font-bold tracking-[4px] uppercase" style={{ color: "#A08050" }}>Chinese Mysticism</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { path: "/elements", icon: "🌿", l: "Five Elements", desc: "Wood · Fire · Earth · Metal · Water", gradient: "linear-gradient(135deg, #1A2F22, #111114)" },
            { path: "/zodiac", icon: "🐉", l: "Zodiac Match", desc: "12 animals · toxic or soulmate?", gradient: "linear-gradient(135deg, #1A0D0D, #111114)" },
          ].map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className="rounded-2xl pt-5 pb-4 px-3 border-none cursor-pointer text-left transition-all"
              style={{ background: item.gradient, border: "1px solid #1E1E22" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}>
              <div className="text-[32px] mb-2">{item.icon}</div>
              <div className="text-[14px] font-bold mb-1" style={{ color: "#E8E4DC" }}>{item.l}</div>
              <div className="text-[10px]" style={{ color: "#555" }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Attachment styles info */}
      <div className="bg-white rounded-3xl p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,.04)" }}>
        <div className="text-[11px] tracking-[4px] uppercase font-semibold mb-4" style={{ color: C.sub }}>{t("home.styles")}</div>
        {Object.keys(TI).map((k, i) => (
          <div key={k} className="flex items-center gap-3.5 py-3" style={{ borderBottom: i < 3 ? `1px solid rgba(0,0,0,.04)` : "none" }}>
            <span className="text-[22px]">{TI[k].emoji}</span>
            <span className="font-serif text-[14px] font-bold w-[50px]" style={{ color: TI[k].color }}>{TI[k].label}</span>
            <span className="text-[12px] flex-1" style={{ color: C.sub }}>{TI[k].desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
