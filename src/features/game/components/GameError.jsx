import { Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../../../components/language/LanguageSelector";
import "./GameError.css";

const STARS = [
  { size: 3,  top: "8%",  left: "12%", dur: "2.4s", delay: "0s"   },
  { size: 4,  top: "18%", left: "78%", dur: "3.1s", delay: "0.5s" },
  { size: 2,  top: "30%", left: "5%",  dur: "2.8s", delay: "0.9s" },
  { size: 5,  top: "55%", left: "88%", dur: "2.0s", delay: "0.2s" },
  { size: 3,  top: "72%", left: "15%", dur: "3.5s", delay: "0.7s" },
  { size: 4,  top: "82%", left: "65%", dur: "2.6s", delay: "1.1s" },
  { size: 2,  top: "42%", left: "93%", dur: "3.0s", delay: "0.4s" },
  { size: 3,  top: "90%", left: "40%", dur: "2.2s", delay: "1.3s" },
  { size: 4,  top: "14%", left: "52%", dur: "3.8s", delay: "0.6s" },
  { size: 2,  top: "65%", left: "48%", dur: "2.9s", delay: "0.3s" },
];

export default function GameError({ message, onBack }) {
  const { t } = useTranslation("game");
  return (
    <div className="ge-wrap">
      <LanguageSelector />

      {/* Orbes de fondo */}
      <div className="ge-orb ge-orb--a" />
      <div className="ge-orb ge-orb--b" />

      {/* Estrellas */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="ge-star"
          style={{
            width:  s.size,
            height: s.size,
            top:    s.top,
            left:   s.left,
            "--dur":   s.dur,
            "--delay": s.delay,
          }}
        />
      ))}

      <div className="ge-card">
        {/* Robot animado */}
        <div className="ge-robot">
          <div className="ge-robot__antenna" />
          <div className="ge-robot__head">
            <div className="ge-robot__eye" />
            <div className="ge-robot__eye ge-robot__eye--right" />
            <div className="ge-robot__mouth" />
          </div>
          <div className="ge-robot__body" />
          <div className="ge-robot__legs">
            <div className="ge-robot__leg" />
            <div className="ge-robot__leg" />
          </div>
        </div>

        <h2 className="ge-title">{t("error_title")}</h2>
        <p className="ge-msg">{message}</p>

        <button className="ge-btn" onClick={onBack}>
          <Home size={16} />
          {t("error_back")}
        </button>
      </div>
    </div>
  );
}
