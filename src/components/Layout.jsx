import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { C } from "../data/colors";

export default function Layout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const toggleLang = () => {
    const next = i18n.language === "zh" ? "en" : "zh";
    i18n.changeLanguage(next);
    localStorage.setItem("yidu-lang", next);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="pt-14 pb-4 px-5 max-w-[500px] lg:max-w-[720px] mx-auto">
        <div className="flex items-start justify-between">
          <div onClick={() => navigate("/")} className="cursor-pointer text-center flex-1">
            <div className="text-[9px] font-bold tracking-[6px] mb-3.5" style={{ color: C.gold }}>
              {t("brandSub")}
            </div>
            <h1 className="font-serif leading-none" style={{ fontSize: 48, fontWeight: 900, color: C.ink, letterSpacing: 10 }}>
              {t("brand")}
            </h1>
            <div className="mx-auto my-3.5 rounded-sm" style={{ width: 24, height: 1.5, background: C.gold }} />
            <p className="text-[11px] tracking-[3px]" style={{ color: C.sub }}>{t("tagline")}</p>
          </div>
          <button onClick={toggleLang} className="text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer shrink-0 mt-1"
            style={{ color: C.gold, borderColor: C.line, background: C.card }}>
            {i18n.language === "zh" ? "EN" : "中文"}
          </button>
        </div>
        {!isHome && (
          <div className="mt-5">
            <span onClick={() => navigate("/")} className="text-[12px] font-semibold cursor-pointer inline-flex items-center gap-1.5" style={{ color: C.gold }}>
              {t("back")}
            </span>
          </div>
        )}
      </div>
      <div className="px-5 max-w-[500px] lg:max-w-[720px] mx-auto">
        <Outlet />
      </div>
      <div className="text-center pt-15 pb-8 px-5">
        <div className="text-[10px] tracking-[4px] mb-2" style={{ color: "#CCC" }}>YIDU</div>
        <span onClick={() => navigate("/privacy")} className="text-[10px] cursor-pointer" style={{ color: "#CCC" }}>
          {i18n.language === "zh" ? "隐私政策" : "Privacy"}
        </span>
      </div>
    </div>
  );
}
