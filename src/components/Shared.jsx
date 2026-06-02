import { useTranslation } from "react-i18next";
import { C } from "../data/colors";
import { TI } from "../data/quiz";

export function Dots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="inline-block w-[7px] h-[7px] rounded-full"
          style={{ background: `linear-gradient(135deg,${C.wine},${C.plum})`, animation: `bounce .9s ease ${i * 0.15}s infinite` }} />
      ))}
    </span>
  );
}

export function TCard({ type, label, small }) {
  const t = TI[type] || TI.secure;
  return (
    <div className="relative overflow-hidden text-center"
      style={{ background: t.grad, borderRadius: small ? 20 : 28, padding: small ? "24px 18px 20px" : "48px 28px 40px", color: C.ink, flex: small ? 1 : undefined }}>
      <div className="absolute -top-15 -right-15 w-[200px] h-[200px] rounded-full bg-white/60" />
      <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] rounded-full bg-white/5" />
      <div className="relative animate-float" style={{ fontSize: small ? 40 : 72, marginBottom: small ? 8 : 16 }}>{t.emoji}</div>
      {!small && <div className="relative font-serif italic" style={{ fontSize: 12, letterSpacing: 6, opacity: 0.6, marginBottom: 12 }}>your attachment style</div>}
      <div className="relative font-serif" style={{ fontSize: small ? 22 : 44, fontWeight: 900, marginBottom: small ? 4 : 10 }}>{label || t.label}</div>
      <div className="relative" style={{ fontSize: small ? 12 : 16, opacity: 0.8 }}>{t.desc}</div>
    </div>
  );
}

export function ShareBar() {
  const { t } = useTranslation();
  return (
    <div className="text-center my-4">
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] cursor-pointer"
        style={{ background: `linear-gradient(135deg,${C.gold}15,${C.plum}15)`, color: C.sub }}
        onClick={() => {
          if (navigator.share) navigator.share({ title: "已读 Yidu", url: "https://yidu.click" }).catch(() => {});
          else if (navigator.clipboard) navigator.clipboard.writeText("https://yidu.click").then(() => alert(t("share.copied")));
        }}>{t("share.button")}</div>
      <div className="text-[11px] mt-2" style={{ color: C.muted }}>{t("share.hint")}</div>
    </div>
  );
}

export function LoadingSkeleton({ message }) {
  return (
    <div className="animate-fu">
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full"
          style={{ background: C.card, boxShadow: "0 4px 24px rgba(45,42,50,.06)", border: `1px solid ${C.line}` }}>
          <Dots />
          <span className="text-[13px] font-medium" style={{ color: C.sub }}>{message}</span>
        </div>
      </div>
      <div className="opacity-50">
        <div className="flex gap-3 mb-3.5">
          {[1, 2].map((i) => <div key={i} className="flex-1 h-[140px] rounded-[20px] animate-shimmer" style={{ background: `linear-gradient(90deg,${C.line},${C.warm},${C.line})` }} />)}
        </div>
        <div className="h-20 rounded-[20px] animate-shimmer mb-3.5" style={{ background: `linear-gradient(90deg,${C.line},${C.warm},${C.line})` }} />
        <div className="h-[120px] rounded-[20px] animate-shimmer" style={{ background: `linear-gradient(90deg,${C.line},${C.warm},${C.line})` }} />
      </div>
    </div>
  );
}
