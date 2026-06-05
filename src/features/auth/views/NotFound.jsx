import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../../components/language/LanguageSelector";
import "./NotFound.css";

export default function NotFound() {
  const { t } = useTranslation("translation");
  const navigate = useNavigate();

  return (
    <div className="nf-wrap">
      <LanguageSelector />

      <div className="nf-orb nf-orb--a" />
      <div className="nf-orb nf-orb--b" />

      <div className="nf-card">
        <DotLottieReact
          src={import.meta.env.BASE_URL + "animations/404.json"}
          loop
          autoplay
          style={{ width: 450, height: 450, marginTop: -80, marginBottom: -80 }}
        />

        <h1 className="nf-title">{t("notfound.title")}</h1>
        <p className="nf-msg">{t("notfound.message")}</p>

        <button className="nf-btn" onClick={() => navigate("/", { replace: true })}>
          {t("notfound.back")}
        </button>
      </div>
    </div>
  );
}
