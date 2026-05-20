import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C, sec } from "../data/colors";
import { P } from "../data/prompts";
import { useAI } from "../hooks/useAI";
import { useImageUpload, ImageUploader } from "../components/AIInput";
import { ShareBar, LoadingSkeleton } from "../components/Shared";

export default function Predict() {
  const { t } = useTranslation();
  const { step, result: res, loadingMsg, error, submit, reset, goToContext } = useAI();
  const { imgs, imgNames, handleImg, removeImg, clearImgs } = useImageUpload();
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState("");
  const hasInput = text.trim() || imgs.length;

  const handleSubmit = () => {
    if (!hasInput) return;
    if (step === "input") { goToContext(); return; }
    const um = (ctx ? "关系背景：" + ctx + "\n\n" : "") + (text.trim() ? "聊天记录：\n" + text : "请分析这些聊天记录截图");
    submit(P.predict, um, imgs, ["扫描关系轨迹", "模拟未来走向"]);
  };
  const handleReset = () => { reset(); setText(""); setCtx(""); clearImgs(); };

  if (step === "loading") return <LoadingSkeleton message={loadingMsg} />;

  if (step === "result" && res) {
    const bgs = ["#FFF5F3", "#FFF9E6", "#F0FFF4"];
    return (
      <div className="animate-fu">
        <div style={{ ...sec, background: "linear-gradient(135deg,#EDF2FF,#F0E6F6)", border: "none", marginBottom: 14 }}>
          <div className="text-[12px] font-bold mb-1.5" style={{ color: C.gold, letterSpacing: 1 }}>{t("result.stage")}</div>
          <div className="font-serif text-[22px] font-black mb-2" style={{ color: C.ink }}>{res.stage}</div>
          <div className="text-[14px]" style={{ color: C.ink + "CC", lineHeight: 1.8 }}>{res.stage_desc}</div>
        </div>
        <div className="font-serif text-[14px] italic mb-3" style={{ color: C.gold }}>{t("result.timeline")}</div>
        {(res.predictions || []).map((p, i) => (
          <div key={i} className="flex gap-3.5 items-start" style={sec}>
            <div className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center text-[24px] shrink-0" style={{ background: bgs[i] }}>{p.emoji}</div>
            <div className="flex-1">
              <div className="flex justify-between mb-1"><span className="text-[14px] font-extrabold" style={{ color: C.ink }}>{p.time}</span><span className="text-[12px] font-bold" style={{ color: C.sub }}>{p.prob}%</span></div>
              <div className="text-[13px]" style={{ color: C.ink + "CC", lineHeight: 1.7 }}>{p.scene}</div>
            </div>
          </div>
        ))}
        <div style={{ ...sec, background: "#FFF5F3", border: "none" }}><div className="text-[13px] font-extrabold mb-1.5" style={{ color: C.rose }}>{t("result.turningPoint")}</div><div className="text-[14px]" style={{ color: C.ink + "CC", lineHeight: 1.8 }}>{res.turning}</div></div>
        <div className="flex gap-2.5 mt-3.5">
          <div className="flex-1" style={{ ...sec, background: "#F0FFF4", border: "none" }}><div className="text-[12px] font-bold mb-1" style={{ color: C.sage }}>{t("result.best")}</div><div className="text-[13px]" style={{ color: C.ink + "CC" }}>{res.best}</div></div>
          <div className="flex-1" style={{ ...sec, background: "#FFF5F3", border: "none" }}><div className="text-[12px] font-bold mb-1" style={{ color: C.rose }}>{t("result.worst")}</div><div className="text-[13px]" style={{ color: C.ink + "CC" }}>{res.worst}</div></div>
        </div>
        <div style={{ ...sec, background: `linear-gradient(135deg,${C.warm},#F0E6F6)`, border: "none" }}>
          <div className="font-serif text-[14px] font-bold mb-2" style={{ color: C.ink }}>{t("result.todoTitle")}</div>
          <div className="text-[15px] font-semibold" style={{ color: C.ink, lineHeight: 1.9 }}>{res.todo}</div>
        </div>
        <ShareBar />
        <button onClick={handleReset} className="w-full mt-2 py-3.5 rounded-2xl text-[14px] font-semibold cursor-pointer" style={{ background: C.card, color: C.sub, border: `1px solid ${C.line}` }}>{t("actions.retry")}</button>
      </div>
    );
  }

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
        <button onClick={handleSubmit} className="flex-2 py-3.5 rounded-2xl text-[15px] font-bold cursor-pointer border-none" style={{ background: "#5B8FB9", color: C.ink, boxShadow: "0 6px 22px #5B8FB930" }}>{t("actions.predict")}</button>
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
        style={{ color: C.ink, cursor: hasInput ? "pointer" : "default", background: hasInput ? "#5B8FB9" : "#ddd", boxShadow: hasInput ? "0 8px 28px #5B8FB930" : "none" }}>
        {t("actions.predict")}
      </button>
    </div>
  );
}
