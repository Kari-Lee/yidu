import { useState } from "react";
import { ZODIAC, TOXIC_COMBOS, HARMONY_COMBOS, getZodiacIndex } from "../data/wuxing";

const S = {
  page: { background: "#0A0A0C", minHeight: "100vh", margin: "-16px -20px", padding: "0 20px 60px", color: "#E8E4DC" },
};

export default function ZodiacMatch() {
  const [you, setYou] = useState(null);
  const [them, setThem] = useState(null);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("you"); // you | them | result

  const selectSign = (idx) => {
    if (step === "you") { setYou(idx); setStep("them"); }
    else if (step === "them") {
      setThem(idx);
      // Find combo
      const toxic = TOXIC_COMBOS.find((c) => (c.a === (step === "you" ? idx : you) && c.b === idx) || (c.b === (step === "you" ? idx : you) && c.a === idx) || (c.a === you && c.b === idx) || (c.b === you && c.a === idx));
      const harmony = HARMONY_COMBOS.find((c) => (c.a === you && c.b === idx) || (c.b === you && c.a === idx));
      setResult({ you: you, them: idx, toxic, harmony });
      setStep("result");
    }
  };

  const reset = () => { setYou(null); setThem(null); setResult(null); setStep("you"); };

  // Grid
  const SignGrid = ({ selected, onSelect, exclude }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
      {ZODIAC.map((z, i) => {
        const isSelected = selected === i;
        const isExcluded = exclude === i;
        return (
          <div key={i} onClick={() => !isExcluded && onSelect(i)}
            style={{
              background: isSelected ? "#A0805020" : "#111114",
              border: isSelected ? "2px solid #A08050" : "2px solid #1E1E22",
              borderRadius: 16, padding: "18px 8px", textAlign: "center",
              cursor: isExcluded ? "default" : "pointer", opacity: isExcluded ? 0.3 : 1,
              transition: "all .2s",
            }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>{z.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "#A08050" : "#888" }}>{z.en}</div>
            <div style={{ fontSize: 9, color: "#444", marginTop: 4 }}>{z.years}</div>
          </div>
        );
      })}
    </div>
  );

  if (step === "result" && result) {
    const youZ = ZODIAC[result.you];
    const themZ = ZODIAC[result.them];
    const combo = result.toxic || result.harmony;
    const isToxic = !!result.toxic;
    const isHarmony = !!result.harmony;

    return (
      <div style={S.page}>
        <div style={{ textAlign: "center", padding: "48px 0 20px" }}>
          <span style={{ fontSize: 10, letterSpacing: 6, color: "#A08050", textTransform: "uppercase" }}>Chinese Zodiac</span>
        </div>

        {/* Matchup header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "20px 0 32px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>{youZ.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#999", marginTop: 8 }}>{youZ.en}</div>
            <div style={{ fontSize: 10, color: "#444" }}>You</div>
          </div>
          <div style={{ fontSize: 28, color: isToxic ? "#C75B3A" : isHarmony ? "#6B9B7A" : "#A08050" }}>
            {isToxic ? "⚡" : isHarmony ? "✦" : "·"}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 52 }}>{themZ.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#999", marginTop: 8 }}>{themZ.en}</div>
            <div style={{ fontSize: 10, color: "#444" }}>Them</div>
          </div>
        </div>

        {combo ? (
          <div>
            {/* Verdict */}
            <div style={{
              textAlign: "center", padding: "32px 24px", borderRadius: 20,
              background: isToxic ? "linear-gradient(180deg, #1A0D0D, #111114)" : "linear-gradient(180deg, #0D1A12, #111114)",
              border: `1px solid ${isToxic ? "#3A1E1E" : "#1E3A22"}`,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{isToxic ? result.toxic.level : "💚"}</div>
              <div style={{
                fontSize: 12, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase",
                color: isToxic ? "#C75B3A" : "#6B9B7A", marginBottom: 16,
              }}>
                {combo.label}
              </div>
              <div style={{ fontSize: 15, lineHeight: 2, color: "#999" }}>{combo.desc}</div>
            </div>

            {/* Advice */}
            <div style={{
              padding: "24px", borderRadius: 16,
              background: "#111114", border: "1px solid #1E1E22",
              borderLeft: `3px solid ${isToxic ? "#C75B3A" : "#6B9B7A"}40`,
            }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#666", textTransform: "uppercase", marginBottom: 10 }}>
                {isToxic ? "Survival guide" : "Why it works"}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.9, color: "#888" }}>{combo.advice || combo.desc}</div>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "32px 24px", borderRadius: 20,
            background: "#111114", border: "1px solid #1E1E22",
          }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🤝</div>
            <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 4, color: "#A08050", textTransform: "uppercase", marginBottom: 16 }}>NEUTRAL GROUND</div>
            <div style={{ fontSize: 14, lineHeight: 2, color: "#888" }}>
              No ancient cosmic beef between {youZ.en} and {themZ.en}. You're not destined soulmates, but you're not destined enemies either. Your story is yours to write — which honestly might be better than any predetermined fate.
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", margin: "28px 0 16px" }}>
          <div style={{ fontSize: 11, color: "#333", letterSpacing: 2 }}>Screenshot & share your result</div>
        </div>

        <button onClick={reset} style={{
          width: "100%", padding: 16, borderRadius: 14, border: "1px solid #1E1E22",
          background: "#111114", color: "#666", fontSize: 14, cursor: "pointer", marginTop: 8,
        }}>Try Another Pair ↻</button>
      </div>
    );
  }

  return (
    <div style={S.page}>
      <div style={{ textAlign: "center", padding: "48px 0 12px" }}>
        <div style={{ fontSize: 72, fontWeight: 100, letterSpacing: 20, color: "#E8E4DC12", fontFamily: "'Noto Serif SC', serif" }}>生肖</div>
        <div style={{ fontSize: 11, letterSpacing: 8, textTransform: "uppercase", color: "#A08050", marginTop: 4 }}>Chinese Zodiac Match</div>
        <p style={{ fontSize: 13, color: "#555", marginTop: 16, lineHeight: 1.8, maxWidth: 340, margin: "16px auto 0" }}>
          The Chinese zodiac has 12 animals in an ancient cycle. Some pairs are cosmically bonded. Others? Cosmically cursed.
        </p>
      </div>

      <div style={{
        padding: "28px 20px", borderRadius: 20, background: "#111114",
        border: "1px solid #1E1E22", marginTop: 28,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 4, textTransform: "uppercase", marginBottom: 16,
          color: step === "you" ? "#A08050" : "#6B9B7A",
        }}>
          {step === "you" ? "① Pick your sign" : "② Pick their sign"}
        </div>

        {step === "them" && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: "#0A0A0C" }}>
            <span style={{ fontSize: 24 }}>{ZODIAC[you].emoji}</span>
            <span style={{ fontSize: 13, color: "#888" }}>You: <strong style={{ color: "#A08050" }}>{ZODIAC[you].en}</strong></span>
            <span onClick={() => { setYou(null); setStep("you"); }} style={{ marginLeft: "auto", fontSize: 12, color: "#444", cursor: "pointer" }}>change</span>
          </div>
        )}

        <SignGrid selected={step === "you" ? you : them} onSelect={selectSign} exclude={step === "them" ? you : null} />
      </div>

      {/* Toxic combos teaser */}
      <div style={{
        marginTop: 20, padding: "24px", borderRadius: 20,
        background: "#111114", border: "1px solid #1E1E22",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#C75B3A", textTransform: "uppercase", marginBottom: 16 }}>☠️ The 6 most toxic combos</div>
        {TOXIC_COMBOS.map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 5 ? "1px solid #1A1A1E" : "none" }}>
            <span style={{ fontSize: 18, width: 40, textAlign: "center" }}>{ZODIAC[c.a].emoji}</span>
            <span style={{ fontSize: 14, color: "#444" }}>×</span>
            <span style={{ fontSize: 18, width: 40, textAlign: "center" }}>{ZODIAC[c.b].emoji}</span>
            <span style={{ fontSize: 12, color: "#666", flex: 1 }}>{ZODIAC[c.a].en} × {ZODIAC[c.b].en}</span>
            <span style={{ fontSize: 10, color: "#C75B3A", fontWeight: 700 }}>{c.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
