import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ELEMENTS, SHENG, SHENG_DESC, KE, KE_DESC, SAME_DESC, getElement, getZodiacIndex, ZODIAC } from "../data/wuxing";

const S = {
  page: { background: "#0A0A0C", minHeight: "100vh", margin: "-16px -20px", padding: "0 20px 60px", color: "#E8E4DC" },
  hero: { textAlign: "center", padding: "60px 0 40px" },
  zhTitle: { fontSize: 72, fontWeight: 100, letterSpacing: 20, color: "#E8E4DC20", fontFamily: "'Noto Serif SC', serif", display: "block" },
  enTitle: { fontSize: 11, letterSpacing: 8, textTransform: "uppercase", color: "#A08050", display: "block", marginTop: 8 },
  subtitle: { fontSize: 13, color: "#666", marginTop: 16, lineHeight: 1.8, maxWidth: 360, margin: "16px auto 0" },
  card: { background: "#111114", borderRadius: 24, padding: "32px 24px", border: "1px solid #1E1E22" },
  label: { fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: "#A08050", marginBottom: 12, display: "block" },
  inputRow: { display: "flex", gap: 8, marginBottom: 12 },
  input: { flex: 1, background: "#0A0A0C", border: "1px solid #222", borderRadius: 12, padding: "14px 16px", color: "#E8E4DC", fontSize: 16, textAlign: "center", minWidth: 0 },
  btn: { width: "100%", padding: "18px", borderRadius: 16, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 20, letterSpacing: 2, transition: "all .3s" },
  section: { marginTop: 20, padding: "28px 24px", borderRadius: 20, border: "1px solid #1E1E22" },
};

export default function Elements() {
  const [d1, setD1] = useState({ y: "", m: "", d: "" });
  const [d2, setD2] = useState({ y: "", m: "", d: "" });
  const [result, setResult] = useState(null);

  const ready = d1.y?.length === 4 && d1.m && d1.d && d2.y?.length === 4 && d2.m && d2.d;

  const calculate = () => {
    if (!ready) return;
    const e1 = getElement(+d1.y, +d1.m, +d1.d);
    const e2 = getElement(+d2.y, +d2.m, +d2.d);
    const z1 = getZodiacIndex(+d1.y);
    const z2 = getZodiacIndex(+d2.y);

    let relationship = "neutral";
    let relDesc = null;
    const zh1 = e1.zh, zh2 = e2.zh;

    if (zh1 === zh2) {
      relationship = "same";
      relDesc = { en: `Both ${ELEMENTS[zh1].en}`, desc: SAME_DESC[zh1] };
    } else if (SHENG[zh1] === zh2) {
      relationship = "you_feed_them";
      relDesc = SHENG_DESC[`${zh1}→${zh2}`];
    } else if (SHENG[zh2] === zh1) {
      relationship = "they_feed_you";
      relDesc = SHENG_DESC[`${zh2}→${zh1}`];
    } else if (KE[zh1] === zh2) {
      relationship = "you_overcome_them";
      relDesc = KE_DESC[`${zh1}→${zh2}`];
    } else if (KE[zh2] === zh1) {
      relationship = "they_overcome_you";
      relDesc = KE_DESC[`${zh2}→${zh1}`];
    }

    // Score
    let score = 60;
    if (relationship === "same") score = 70;
    if (relationship.includes("feed")) score = 85;
    if (relationship.includes("overcome")) score = 35;

    setResult({ e1, e2, z1, z2, relationship, relDesc, score });
  };

  const DateInput = ({ label, d, setD }) => (
    <div style={{ marginBottom: 20 }}>
      <span style={S.label}>{label}</span>
      <div style={S.inputRow}>
        <input style={S.input} type="tel" inputMode="numeric" placeholder="Year" maxLength={4} value={d.y} onChange={(e) => setD({ ...d, y: e.target.value })} />
        <input style={{ ...S.input, flex: 0.6 }} type="tel" inputMode="numeric" placeholder="Mo" maxLength={2} value={d.m} onChange={(e) => setD({ ...d, m: e.target.value })} />
        <input style={{ ...S.input, flex: 0.6 }} type="tel" inputMode="numeric" placeholder="Day" maxLength={2} value={d.d} onChange={(e) => setD({ ...d, d: e.target.value })} />
      </div>
    </div>
  );

  if (result) {
    const el1 = ELEMENTS[result.e1.zh];
    const el2 = ELEMENTS[result.e2.zh];
    const z1 = ZODIAC[result.z1];
    const z2 = ZODIAC[result.z2];
    const isHarmony = result.relationship.includes("feed") || result.relationship === "same";

    return (
      <div style={S.page}>
        <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
          <span style={{ fontSize: 10, letterSpacing: 6, color: "#A08050", textTransform: "uppercase" }}>Five Elements Reading</span>
        </div>

        {/* Element cards */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[{ el: el1, label: "You", zodiac: z1 }, { el: el2, label: "Them", zodiac: z2 }].map((p, i) => (
            <div key={i} style={{ flex: 1, background: p.el.bg, borderRadius: 20, padding: "28px 18px", textAlign: "center", border: `1px solid ${p.el.color}20` }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: "#666", textTransform: "uppercase", marginBottom: 12 }}>{p.label}</div>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{p.el.emoji}</div>
              <div style={{ fontSize: 36, fontWeight: 100, color: p.el.color + "30", fontFamily: "'Noto Serif SC', serif" }}>{p.el.symbol}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: p.el.color, marginTop: 4, fontFamily: "'Playfair Display', serif" }}>{p.el.en}</div>
              <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>{p.zodiac.emoji} {p.zodiac.en}</div>
            </div>
          ))}
        </div>

        {/* Relationship */}
        <div style={{ ...S.section, background: isHarmony ? "#0D1A12" : "#1A0D0D", borderColor: isHarmony ? "#1E3A22" : "#3A1E1E", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>{isHarmony ? "✦" : "⚡"}</div>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 3, color: isHarmony ? "#6B9B7A" : "#C75B3A", textTransform: "uppercase", marginBottom: 12 }}>
            {result.relDesc?.en || "Neutral Pairing"}
          </div>
          <div style={{ fontSize: 14, lineHeight: 2, color: "#999" }}>
            {result.relDesc?.desc || "Your elements don't directly interact — which means you have space to define your own dynamic. No cosmic advantage, no cosmic baggage."}
          </div>
        </div>

        {/* Individual elements */}
        {[{ el: el1, label: "Your element" }, { el: el2, label: "Their element" }].map((p, i) => (
          <div key={i} style={{ ...S.section, background: "#111114" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #1E1E22" }}>
              <span style={{ fontSize: 28 }}>{p.el.emoji}</span>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 3, color: "#666", textTransform: "uppercase" }}>{p.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: p.el.color, fontFamily: "'Playfair Display', serif" }}>{p.el.en}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {p.el.traits.map((t, j) => (
                <span key={j} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 20, background: p.el.color + "15", color: p.el.color, border: `1px solid ${p.el.color}20` }}>{t}</span>
              ))}
            </div>
            <div style={{ fontSize: 14, lineHeight: 2, color: "#999", marginBottom: 16 }}>{p.el.loveStyle}</div>
            <div style={{ padding: "16px 18px", borderRadius: 14, background: "#0A0A0C", borderLeft: `3px solid ${p.el.color}40` }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>Shadow side</div>
              <div style={{ fontSize: 13, lineHeight: 1.8, color: "#777" }}>{p.el.shadow}</div>
            </div>
          </div>
        ))}

        {/* Share prompt */}
        <div style={{ textAlign: "center", margin: "32px 0 20px" }}>
          <div style={{ fontSize: 11, color: "#444", letterSpacing: 2 }}>Screenshot & share your reading</div>
        </div>

        <button onClick={() => setResult(null)} style={{ ...S.btn, background: "#1E1E22", color: "#666" }}>New Reading ↻</button>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <span style={S.zhTitle}>五行</span>
        <span style={S.enTitle}>Five Elements Love Match</span>
        <p style={S.subtitle}>An ancient Chinese system that maps the universe into five forces — Wood, Fire, Earth, Metal, Water. Your birth date reveals which element shapes your love style.</p>
      </div>

      {/* Element preview */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 36 }}>
        {Object.values(ELEMENTS).map((el) => (
          <div key={el.en} style={{ textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: el.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 6px" }}>{el.emoji}</div>
            <div style={{ fontSize: 9, letterSpacing: 1, color: "#555" }}>{el.en}</div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <DateInput label="Your birthday" d={d1} setD={setD1} />
        <DateInput label="Their birthday" d={d2} setD={setD2} />
        <button onClick={calculate} disabled={!ready} style={{ ...S.btn, background: ready ? "linear-gradient(135deg, #A08050, #C4A06A)" : "#1E1E22", color: ready ? "#0A0A0C" : "#444" }}>
          Reveal Your Elements ✦
        </button>
      </div>

      {/* Cycle explanation */}
      <div style={{ ...S.section, background: "#111114" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#A08050", textTransform: "uppercase", marginBottom: 16 }}>How it works</div>
        <div style={{ fontSize: 13, lineHeight: 2, color: "#666" }}>
          In Chinese cosmology, everything is made of five elements locked in an eternal cycle. Some elements <span style={{ color: "#6B9B7A" }}>nourish</span> each other — Wood feeds Fire, Fire creates Earth. Others <span style={{ color: "#C75B3A" }}>clash</span> — Water extinguishes Fire, Metal chops Wood. Your relationship lives somewhere in this cycle.
        </div>
      </div>
    </div>
  );
}
