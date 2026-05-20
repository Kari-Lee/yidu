import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { TI } from "../data/quiz";
import { P } from "../data/prompts";
import { useAI } from "../hooks/useAI";
import { useImageUpload, ImageUploader } from "../components/AIInput";
import { TCard, ShareBar, LoadingSkeleton } from "../components/Shared";

export default function Diagnose() {
  const { t } = useTranslation();
  const { step, result: res, loadingMsg, error, submit, reset, goToContext } = useAI();
  const { imgs, imgNames, handleImg, removeImg, clearImgs } = useImageUpload();
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState("");
  const hasInput = text.trim() || imgs.length;

  const handleSubmit = () => {
    if (!hasInput) return;
    if (step === "input") { goToContext(); return; }
    const um = (ctx ? "关系背景：" + ctx + "\n\n" : "") + (text.trim() ? "聊天记录：\n" + text : "请分析这些聊天记录截图中的对话内容");
    submit(P.diagnose, um, imgs, ["扫描互动模式", "分析依恋信号", "生成双人报告"]);
  };

  const handleReset = () => { reset(); setText(""); setCtx(""); clearImgs(); };

  if (step === "loading") return <LoadingSkeleton message={loadingMsg} />;

  if (step === "result" && res) return (
    <div className="animate-fu">
      <div className="flex gap-3 mb-3.5"><TCard type={res.user_type} label={"你：" + res.user_label} small /><TCard type={res.partner_type} label={"Ta：" + res.partner_label} small /></div>
      <div style={{ ...sec, background: `linear-gradient(135deg,${C.warm},#F0E6F6)`, border: "none" }}><div className="font-serif text-[14px] font-bold mb-2" style={{ color: C.ink }}>{t("result.interaction")}</div><div className="text-[15px]" style={{ lineHeight: 1.9, color: C.ink + "DD" }}>{res.match}</div></div>
      <div style={sec}>
        <div className="flex justify-between"><span className="text-[13px] font-bold" style={{ color: C.sub }}>{t("result.confidence")}</span><span className="text-[24px] font-black" style={{ color: C.wine }}>{res.confidence}%</span></div>
        <div className="h-[5px] rounded-full overflow-hidden mt-2.5" style={{ background: C.line }}><div className="h-full rounded-full" style={{ width: res.confidence + "%", background: `linear-gradient(90deg,${C.wine},${C.plum})` }} /></div>
      </div>
      <div style={{ ...sec, padding: 24 }}>
        <div className="text-[13px] font-bold mb-3.5" style={{ color: C.sub }}>{t("result.signals")}</div>
        {(res.signals || []).map((s, i) => (
          <div key={i} className="flex gap-3 py-3" style={{ borderBottom: i < 2 ? `1px solid ${C.line}` : "none" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0" style={{ background: s.who === "用户" ? "#FFF5F3" : "#F0F6FA" }}>{s.icon}</div>
            <div className="flex-1">
              <div className="text-[12px] mb-0.5" style={{ color: C.sub }}>{s.who}</div>
              <div className="font-serif text-[14px] font-bold mb-1" style={{ color: C.ink }}>{"「" + s.msg + "」"}</div>
              <div className="text-[13px]" style={{ color: C.sub }}>{"→ " + s.meaning}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ ...sec, background: (TI[res.user_type] || TI.secure).bg, border: "none" }}><div className="font-serif text-[14px] font-bold mb-2" style={{ color: C.ink }}>{t("result.forYou")}</div><div className="text-[14px]" style={{ lineHeight: 1.9, color: C.ink + "DD" }}>{res.user_advice}</div></div>
      <div style={{ ...sec, background: (TI[res.partner_type] || TI.secure).bg, border: "none" }}><div className="font-serif text-[14px] font-bold mb-2" style={{ color: C.ink }}>{t("result.forThem")}</div><div className="text-[14px]" style={{ lineHeight: 1.9, color: C.ink + "DD" }}>{res.partner_advice}</div></div>
      <ShareBar />
      <button onClick={handleReset} className="w-full mt-2 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("actions.retry")}</button>
    </div>
  );

  if (step === "context") return (
    <div className="animate-fu-fast">
      <div className="rounded-3xl p-7" style={{ background: C.card, boxShadow: "0 2px 16px rgba(45,42,50,.04)", border: `1px solid ${C.line}` }}>
        <div className="font-serif text-[22px] font-bold mb-2" style={{ color: C.ink }}>{t("input.context")}</div>
        <div className="text-[13px] mb-5" style={{ color: C.sub }}>{t("input.contextHint")}</div>
        <textarea className="w-full p-3.5 bg-transparent border-none resize-none outline-none text-[15px]" style={{ color: C.ink, borderTop: `1px solid ${C.line}`, lineHeight: 1.9 }}
          rows={3} placeholder={t("input.contextPlaceholder")} value={ctx} onChange={(e) => setCtx(e.target.value)} />
      </div>
      <div className="flex gap-2.5 mt-3.5">
        <button onClick={() => reset()} className="flex-1 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("input.goBack")}</button>
        <button onClick={handleSubmit} className="flex-2 py-3.5 rounded-2xl text-[15px] font-bold cursor-pointer border-none" style={{ background: C.wine, color: C.ink, boxShadow: `0 6px 22px ${C.wine}30` }}>{t("actions.diagnose")}</button>
      </div>
    </div>
  );

  return (
    <div className="animate-fu-fast">
      {error && <div className="p-3.5 rounded-[14px] mb-3.5 text-[13px]" style={{ background: "#FFF5F5", color: C.rose, border: "1px solid #FFE3E3" }}>{error}</div>}
      <div className="rounded-3xl p-6" style={{ background: C.card, boxShadow: "0 2px 16px rgba(45,42,50,.04)", border: `1px solid ${C.line}` }}>
        <ImageUploader imgs={imgs} imgNames={imgNames} handleImg={handleImg} removeImg={removeImg} />
        <textarea className="w-full p-3.5 bg-transparent border-none resize-none outline-none text-[15px]" style={{ color: C.ink, lineHeight: 1.9 }}
          rows={7} placeholder={t("input.pastePlaceholder")} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <button onClick={handleSubmit} disabled={!hasInput} className="w-full mt-4 py-4 rounded-[18px] border-none text-[16px] font-bold transition-all"
        style={{ color: C.ink, cursor: hasInput ? "pointer" : "default", background: hasInput ? C.wine : "#ddd", boxShadow: hasInput ? `0 8px 28px ${C.wine}30` : "none" }}>
        {t("actions.diagnose")}
      </button>
    </div>
  );
}
