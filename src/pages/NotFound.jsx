import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { C } from "../data/colors";

export default function NotFound() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isZh = i18n.language === "zh";

  return (
    <div className="animate-fu text-center py-16">
      <div className="text-[72px] mb-4 animate-float">🌀</div>
      <div className="font-serif text-[32px] font-bold mb-2" style={{ color: C.ink }}>404</div>
      <div className="text-[15px] mb-8" style={{ color: C.sub }}>
        {isZh ? "这个页面已读不回了" : "This page left you on read"}
      </div>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 rounded-2xl text-[15px] font-bold border-none cursor-pointer"
        style={{ background: C.wine, color: "#fff", boxShadow: `0 4px 16px ${C.wine}30` }}
      >
        {isZh ? "回到首页" : "Go Home"}
      </button>
    </div>
  );
}
