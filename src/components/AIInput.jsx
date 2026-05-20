import { useState } from "react";
import { useTranslation } from "react-i18next";
import { C } from "../data/colors";
import { TI } from "../data/quiz";

export function useImageUpload() {
  const [imgs, setImgs] = useState([]);
  const [imgNames, setImgNames] = useState([]);

  const handleImg = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach((f) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > 1200) { h = h * (1200 / w); w = 1200; }
        if (h > 1200) { w = w * (1200 / h); h = 1200; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.6).split(",")[1];
        setImgs((prev) => [...prev, compressed]);
        setImgNames((prev) => [...prev, f.name]);
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(f);
    });
  };

  const removeImg = (i) => {
    setImgs((p) => p.filter((_, j) => j !== i));
    setImgNames((p) => p.filter((_, j) => j !== i));
  };

  const clearImgs = () => { setImgs([]); setImgNames([]); };

  return { imgs, imgNames, handleImg, removeImg, clearImgs };
}

export function ImageUploader({ imgs, imgNames, handleImg, removeImg }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4">
      <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed cursor-pointer text-[14px] font-semibold transition-all"
        style={{ borderColor: imgs.length ? C.sage + "80" : C.line, color: imgs.length ? C.sage : C.muted, background: imgs.length ? "#F0FFF4" : C.bg }}>
        <span className="text-[22px]">{imgs.length ? "📎" : "📷"}</span>
        {imgs.length ? imgs.length + t("input.uploadDone") : t("input.uploadHint")}
        <input type="file" accept="image/*" multiple onChange={handleImg} className="hidden" />
      </label>
      {imgs.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-2">
          {imgNames.map((name, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1" style={{ background: "#F0FFF4", color: C.sage }}>
              📷 {name.length > 15 ? name.slice(0, 15) + "..." : name}
              <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImg(i); }} className="cursor-pointer text-[14px] ml-0.5" style={{ color: "#ccc" }}>×</span>
            </span>
          ))}
        </div>
      )}
      <div className="text-center text-[12px] my-3" style={{ color: C.muted }}>{t("input.or")}</div>
    </div>
  );
}

export function PartnerTypeSelector({ pType, setPType }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4">
      <div className="font-serif text-[15px] font-bold mb-3" style={{ color: C.ink }}>{t("input.partnerType")}</div>
      <div className="flex gap-2 flex-wrap">
        {["avoidant", "anxious", "secure", "disorganized"].map((k) => (
          <button key={k} onClick={() => setPType(k)} className="px-3.5 py-2 rounded-[14px] text-[13px] font-semibold cursor-pointer"
            style={{ border: pType === k ? `2px solid ${TI[k].color}` : `2px solid ${C.line}`, background: pType === k ? TI[k].bg : C.card, color: pType === k ? TI[k].color : C.sub }}>
            {TI[k].emoji} {TI[k].label}
          </button>
        ))}
      </div>
    </div>
  );
}
