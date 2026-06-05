// ─── IAConfiguration.jsx ──────────────────────────────────────────────────────
// Vista pura: consume el hook y renderiza. Cero lógica de negocio aquí.

import { useTranslation } from "react-i18next";
import {
  Save, Info, Pencil, RotateCcw,
} from "lucide-react";

import { useIAConfig } from "../../hooks/useIAConfig";
import Loader from "../../../../components/ui/Loader";
import "./IAConfiguration.css";

export default function IAConfiguration() {
  const { t } = useTranslation("iaconfig");

  const {
    iaModels,
    handleSelectModel,
    prompt,
    setPrompt,
    isEditingPrompt,
    temperature,
    setTemperature,
    hasChanges,
    isLoading,
    temperatureSliderBg,
    resolvedLevel,
    handleEditPrompt,
    handleSavePrompt,
    handleSave,
    handleReset,
  } = useIAConfig();

  if (isLoading) return <Loader loading content={t("loading")} />;

  return (
    <div className="cia-root">
      <div className="cia-inner">

        {/* ── Header ── */}
        <div className="cia-header">
          <h1 className="cia-title">{t("title")}</h1>
          <p className="cia-subtitle">{t("subtitle")}</p>
        </div>

        <div className="cia-grid">

          {/* ────────── COLUMNA IZQUIERDA ────────── */}
          <div className="cia-left">

            {/* Proveedores */}
            <div className="cia-card">
              <h2 className="cia-card-title">{t("models_title")}</h2>
              <p className="cia-card-sub">{t("models_subtitle")}</p>
              <div className="cia-divider" />

              <div className="cia-providers">
                {iaModels.length === 0 && (
                  <p style={{ color: "#94a3b8", textAlign: "center", padding: "16px 0", fontSize: 13 }}>
                    {t("models_empty")}
                  </p>
                )}
                {iaModels.map((m) => (
                  <div
                    key={m.id}
                    className={["cia-provider", m.es_seleccionado ? "selected" : ""].join(" ").trim()}
                  >
                    <div className="cia-provider-left">
                      <div className={`cia-dot${m.es_seleccionado ? " on" : ""}`} />
                      <div>
                        <div className="cia-provider-name">{m.nombre}</div>
                        <div className="cia-provider-model">
                          {m.proveedor}{m.version_modelo ? ` · ${m.version_modelo}` : ""}
                        </div>
                      </div>
                    </div>
                    {m.es_seleccionado ? (
                      <span className="cia-badge cia-badge-on">
                        {t("provider_connected")}
                      </span>
                    ) : (
                      <button
                        className="cia-use-btn"
                        onClick={() => handleSelectModel(m.id)}
                      >
                        {t("provider_use")}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="cia-card-sub" style={{ textAlign: "center", paddingTop: "20px", marginBottom: 0 }}>
                {t("models_note")}
              </p>
            </div>

            {/* Prompt */}
            <div className="cia-card">
              <div className="cia-card-header">
                <div>
                  <h2 className="cia-card-title">{t("prompt_title")}</h2>
                  <p className="cia-card-sub" style={{ marginBottom: 0 }}>{t("prompt_subtitle")}</p>
                </div>
                <button
                  className={`cia-edit-btn ${isEditingPrompt ? "save" : "edit"}`}
                  onClick={isEditingPrompt ? handleSavePrompt : handleEditPrompt}
                >
                  {isEditingPrompt ? <Save size={14} /> : <Pencil size={14} />}
                  {isEditingPrompt ? t("prompt_save_button") : t("prompt_edit_button")}
                </button>
              </div>

              <div className="cia-vars-row">
                <span className="cia-vars-label">{t("prompt_vars_label")}</span>
                {["{cantidad}", "{categoria}", "{dificultad}", "{idioma}"].map((v) => (
                  <code key={v} className="cia-var-chip">{v}</code>
                ))}
              </div>

              <div style={{ padding: isEditingPrompt ? "12px 0 0" : "0" }}>
                <textarea
                  className="cia-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  readOnly={!isEditingPrompt}
                  rows={isEditingPrompt ? 8 : 5}
                />
              </div>
            </div>

            {/* Temperatura */}
            <div className="cia-card">
              <h2 className="cia-card-title">{t("evaluation_title")}</h2>
              <p className="cia-card-sub">{t("evaluation_subtitle")}</p>
              <div className="cia-divider" />

              <div className="cia-temp-row">
                <span className="cia-temp-label">{t("generation_temperature")}</span>
                <span className="cia-temp-value">{temperature.toFixed(2)}</span>
              </div>

              <input
                type="range" min="0" max="1" step="0.01"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="cia-slider"
                style={{ background: temperatureSliderBg }}
              />

              <div className="cia-slider-labels">
                <span>{t("slider_precise")}</span>
                <span>{t("slider_balanced")}</span>
                <span>{t("slider_creative")}</span>
              </div>

              <div className="cia-level-box">
                <div className="cia-level-head">
                  <span>{t("level_box_level")}</span>
                  <span>{t("level_box_desc")}</span>
                </div>
                <div className="cia-level-row">
                  <span>{resolvedLevel.label}</span>
                  <span>{resolvedLevel.desc}</span>
                </div>
              </div>

              <div className="cia-param-note">
                <Info size={13} />
                <span>{t("param_note")}</span>
              </div>
            </div>
          </div>

          {/* ────────── COLUMNA DERECHA ────────── */}
          <div className="cia-right">

            {/* Card azul: tips de configuración */}
            <div className="cia-pro">
              <div className="cia-pro-label">{t("ia_insight_label")}</div>
              <div className="cia-pro-title">{t("ia_insight_title")}</div>
              <p className="cia-pro-text">{t("ia_insight_text")}</p>
            </div>

            {/* Card blanco: modelos gratuitos */}
            <div className="cia-free-card">
              <div className="cia-free-label">{t("free_models_label")}</div>
              <div className="cia-free-title">{t("free_models_title")}</div>
              <div className="cia-free-chips">
                <span className="cia-free-chip gemini">Gemini · Google</span>
                <span className="cia-free-chip deepseek">DeepSeek · High-Flyer</span>
              </div>
              <p className="cia-free-text">{t("free_models_text")}</p>
            </div>

          </div>

        </div>

        {/* ── Barra de acciones (solo si hay cambios) ── */}
        <div className={`cia-action-bar${hasChanges ? " visible" : ""}`}>
          <span className="cia-action-hint">{t("unsaved_changes")}</span>
          <div className="cia-action-btns">
            <button className="cia-reset-btn" onClick={handleReset}>
              <RotateCcw size={15} />
              {t("reset_button")}
            </button>
            <button className="cia-save-btn" onClick={handleSave}>
              <Save size={16} />
              {t("save_button")}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}