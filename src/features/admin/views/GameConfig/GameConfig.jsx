// ─── GameConfig.jsx (Vista) ───────────────────────────────────────────────────
// Responsabilidad única: renderizar la UI.
// Toda la lógica vive en useGameConfig; las constantes en GameConfigConstants.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from "react-i18next";
import {
  Swords, Sparkles, Settings2, Minus, Plus,
  Clock, Heart, Flag, Save, ChevronDown, RotateCcw,
} from "lucide-react";

import "./GameConfig.css";
import AppLoader from "../../../../components/ui/Loader";
import { useGameConfig }                  from "../../hooks/useGameConfig";
import { DIFFICULTIES, LIVES_OPTIONS, LANGUAGES } from "../../constants/gameConfigConstants";

export default function GameConfig() {
  const { t } = useTranslation("admin");
  const { fields, setters, helpers, isDirty, isLoading, handleSave, handleDiscard } = useGameConfig();

  if (isLoading) {
    return (
      <div className="tg-root">
        <AppLoader loading content={t("tournaments_loading")} />
      </div>
    );
  }

  const { questions, timePerQ, random, difficulty, lives, language } = fields;
  const { clampQuestions, setTimePerQ, toggleRandom, setDifficulty, setLives, setLanguage } = setters;
  const { sliderBg } = helpers;

  return (
    <div className="tg-root">
      <div className="tg-inner">

        {/* ── Encabezado ────────────────────────────────────────────────── */}
        <div className="tg-page-header">
          <div className="tg-page-title">{t("tournaments_page_title")}</div>
          <p className="tg-page-sub">{t("tournaments_page_subtitle")}</p>
        </div>

        {/* ── Card 1 — Reglas ───────────────────────────────────────────── */}
        <div className="tg-card">
          <div className="tg-card-header">
            <div className="tg-card-icon"><Swords size={18} /></div>
            <span className="tg-card-title">{t("tournaments_rules_title")}</span>
          </div>

          <div className="tg-row-2">
            {/* Preguntas por partida */}
            <div>
              <div className="tg-field-label">
                {t("tournaments_questions_per_game_label")}
                <span className="tg-field-badge">{t("tournaments_questions_range")}</span>
              </div>
              <div className="tg-num-wrap">
                <button className="tg-num-btn" onClick={() => clampQuestions(questions - 1)}>
                  <Minus size={16} />
                </button>
                <div className="tg-num-divider" />
                <input
                  className="tg-num-val"
                  type="number"
                  value={questions}
                  min={4}
                  max={90}
                  onChange={(e) => clampQuestions(parseInt(e.target.value) || 4)}
                />
                <div className="tg-num-divider" />
                <button className="tg-num-btn" onClick={() => clampQuestions(questions + 1)}>
                  <Plus size={16} />
                </button>
              </div>
              <p className="tg-field-note">{t("tournaments_questions_note")}</p>
            </div>

            {/* Tiempo por pregunta */}
            <div>
              <div className="tg-slider-header">
                <span className="tg-field-label" style={{ marginBottom: 0 }}>
                  {t("tournaments_time_label")}
                </span>
                <button className="tg-slider-time-btn">
                  <Clock size={13} /> {t("tournaments_seconds")}
                </button>
              </div>
              <div className="tg-slider-val">{timePerQ}s</div>
              <input
                type="range"
                className="tg-slider"
                min={5}
                max={120}
                step={1}
                value={timePerQ}
                onChange={(e) => setTimePerQ(parseInt(e.target.value))}
                style={{ background: sliderBg }}
              />
              <p className="tg-field-note">{t("tournaments_time_note")}</p>
            </div>
          </div>
        </div>

        {/* ── Card 2 — Dinámica ─────────────────────────────────────────── */}
        <div className="tg-card">
          <div className="tg-card-header">
            <div className="tg-card-icon"><Sparkles size={18} /></div>
            <span className="tg-card-title">{t("tournaments_dynamics_title")}</span>
          </div>

          {/* Toggle aleatorio */}
          <div className="tg-toggle-row">
            <div className="tg-toggle-info">
              <div className="tg-toggle-title">{t("tournaments_random_toggle_title")}</div>
              <p className="tg-toggle-sub">{t("tournaments_random_toggle_subtitle")}</p>
            </div>
            <label className="tg-switch">
              <input type="checkbox" checked={random} onChange={toggleRandom} />
              <div className="tg-switch-track" />
              <div className="tg-switch-thumb" />
            </label>
          </div>

          {/* Dificultad */}
          <div>
            <div className="tg-diff-label">{t("tournaments_difficulty_label")}</div>
            <div className="tg-diff-select-wrap">
              <select
                className="tg-diff-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={random}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{t(d)}</option>
                ))}
              </select>
              <span className="tg-diff-select-icon"><ChevronDown size={16} /></span>
            </div>
          </div>
        </div>

        {/* ── Card 3 — Sistema ──────────────────────────────────────────── */}
        <div className="tg-card">
          <div className="tg-card-header">
            <div className="tg-card-icon"><Settings2 size={18} /></div>
            <span className="tg-card-title">{t("tournaments_system_title")}</span>
          </div>

          <div className="tg-sys-row">
            {/* Vidas */}
            <div>
              <div className="tg-diff-label">{t("tournaments_lives_label")}</div>
              <div className="tg-select-wrap">
                <span className="tg-select-left-icon"><Heart size={15} /></span>
                <select
                  className="tg-select"
                  value={lives}
                  onChange={(e) => setLives(e.target.value)}
                >
                  {LIVES_OPTIONS.map((l) => (
                    <option key={l} value={l}>{t(l)}</option>
                  ))}
                </select>
                <span className="tg-select-right-icon"><ChevronDown size={15} /></span>
              </div>
            </div>

            {/* Idioma */}
            <div>
              <div className="tg-diff-label">{t("tournaments_language_label")}</div>
              <div className="tg-lang-wrap">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    className={`tg-lang-btn${language === lang ? " active" : ""}`}
                    onClick={() => setLanguage(lang)}
                  >
                    <Flag size={14} /> {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer — solo visible si hay cambios ──────────────────────── */}
        {isDirty && (
          <div className="tg-footer tg-footer--visible">
            <button className="tg-discard-btn" onClick={handleDiscard}>
              <RotateCcw size={15} />
              {t("tournaments_reset_button")}
            </button>
            <button className="tg-save-btn" onClick={handleSave}>
              <Save size={16} />
              {t("tournaments_save_button")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}