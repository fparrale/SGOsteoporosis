import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Info, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchSuperIAConfig, saveSuperIAConfig } from "../../services/SuperAdminServices";
import Alert from "../../../../components/ui/Alert";
import Loader from "../../../../components/ui/Loader";
import "./IAPrompts.css";

const VARS_SISTEMA     = ["{cantidad}", "{categoria}", "{dificultad}", "{idioma}"];
const VARS_SUGERENCIAS = ["{tema}", "{idioma}"];

export default function IAPrompts() {
  const { t } = useTranslation("admin");
  const [loading, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [promptSistema, setSistema] = useState("");
  const [promptSugerencias, setSug] = useState("");
  const [temperatura, setTemp] = useState(0.5);
  const [maxTokens, setTokens] = useState(2000);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTema, setPreviewTema] = useState("osteoporosis");
  const [previewIdioma, setPreviewIdioma] = useState("es");
  const textareaRefSistema = useRef(null);
  const textareaRef = useRef(null);

  const loadConfig = useCallback(async () => {
    setLoad(true);
    try {
      const data = await fetchSuperIAConfig();
      if (data) {
        setSistema(data.prompt_sistema ?? "");
        setSug(data.prompt_sugerencias ?? "");
        setTemp(Number(data.temperatura ?? 0.5));
        setTokens(Number(data.max_tokens ?? 2000));
      }
    } catch (err) {
      console.error("Error cargando config IA:", err);
      Alert.error(err.message);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const insertVar = (ref, setter, currentValue, varName) => {
    const el = ref.current;
    if (!el) {
      setter((prev) => prev + varName);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = currentValue.slice(0, start) + varName + currentValue.slice(end);
    setter(newVal);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + varName.length;
      el.focus();
    }, 0);
  };

  const resolvedPrompt = promptSugerencias
    .replace(/\{tema\}/g, previewTema || "{tema}")
    .replace(/\{idioma\}/g, previewIdioma || "{idioma}");

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSuperIAConfig({
        prompt_sistema: promptSistema,
        prompt_sugerencias: promptSugerencias,
        temperatura,
        max_tokens: maxTokens,
      });
      setSaved(true);
      Alert.success(t("sa_prompts_success_saved"));
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error guardando config IA:", err);
      Alert.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader loading content={t("sa_config_loading")} />;

  return (
    <div className="ia-prompts">
      <div className="ia-prompts__header">
        <h1>{t("sa_prompts_title")}</h1>
        <p>{t("sa_prompts_subtitle")}</p>
      </div>

      <div className="info-permisos">
        <Info size={16} style={{ marginTop: 1, flexShrink: 0 }} />
        <div>
          <strong>prompt_sistema</strong> {t("sa_prompts_info")}<br />
          <strong>prompt_sugerencias</strong> {t("sa_prompts_info_superadmin")}
        </div>
      </div>

      {/* ── Prompt Sistema ── */}
      <div className="card">
        <div className="prompt-card-header">
          <div>
            <h2>{t("sa_prompts_sistema_title")}</h2>
            <p className="card__desc">{t("sa_prompts_sistema_desc")}</p>
          </div>
        </div>

        <div className="vars-row">
          <span className="vars-label">{t("sa_prompts_vars_label")}</span>
          {VARS_SISTEMA.map((v) => (
            <code
              key={v}
              className="var-chip var-chip--clickable"
              onClick={() => insertVar(textareaRefSistema, setSistema, promptSistema, v)}
              title={t("sa_prompts_chip_hint")}
            >
              {v}
            </code>
          ))}
        </div>

        <textarea
          ref={textareaRefSistema}
          className="textarea-prompt"
          value={promptSistema}
          onChange={(e) => setSistema(e.target.value)}
          placeholder={t("sa_prompts_sistema_placeholder")}
        />
      </div>

      {/* ── Prompt Sugerencias ── */}
      <div className="card">
        <div className="prompt-card-header">
          <div>
            <h2>{t("sa_prompts_card_title")}</h2>
            <p className="card__desc">{t("sa_prompts_card_desc")}</p>
          </div>
          <button
            type="button"
            className={`btn-preview-toggle ${showPreview ? "btn-preview-toggle--active" : ""}`}
            onClick={() => setShowPreview((v) => !v)}
          >
            <Eye size={14} />
            {t("sa_prompts_btn_preview")}
          </button>
        </div>

        <div className="vars-row">
          <span className="vars-label">{t("sa_prompts_vars_label")}</span>
          {VARS_SUGERENCIAS.map((v) => (
            <code
              key={v}
              className="var-chip var-chip--clickable"
              onClick={() => insertVar(textareaRef, setSug, promptSugerencias, v)}
              title={t("sa_prompts_chip_hint")}
            >
              {v}
            </code>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          className="textarea-prompt"
          value={promptSugerencias}
          onChange={(e) => setSug(e.target.value)}
          placeholder={t("sa_prompts_placeholder")}
        />
      </div>

      {showPreview && (
        <div className="card card--preview">
          <h2>{t("sa_prompts_preview_title")}</h2>
          <p className="card__desc">{t("sa_prompts_preview_desc")}</p>

          <div className="preview-inputs">
            <div className="preview-field">
              <label><code>{"{tema}"}</code></label>
              <input
                value={previewTema}
                onChange={(e) => setPreviewTema(e.target.value)}
                placeholder="osteoporosis"
              />
            </div>
            <div className="preview-field">
              <label><code>{"{idioma}"}</code></label>
              <select value={previewIdioma} onChange={(e) => setPreviewIdioma(e.target.value)}>
                <option value="es">es — Español</option>
                <option value="en">en — English</option>
              </select>
            </div>
          </div>

          <div className="preview-result">
            <span className="preview-result__label">{t("sa_prompts_preview_result")}</span>
            <pre className="preview-result__text">{resolvedPrompt || t("sa_prompts_preview_empty")}</pre>
          </div>
        </div>
      )}

      <div className="card">
        <h2>{t("sa_prompts_params_title")}</h2>
        <div className="params-grid">
          <div className="param-group">
            <label>{t("sa_prompts_temp_label")} <strong>{temperatura}</strong></label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperatura}
              onChange={(e) => setTemp(parseFloat(e.target.value))}
              className="range-input"
            />
            <p className="param-hint">{t("sa_prompts_temp_hint")}</p>
          </div>
          <div className="param-group">
            <label>{t("sa_prompts_tokens_label")}</label>
            <input
              type="number"
              className="form-input"
              min={500}
              max={8000}
              value={maxTokens}
              onChange={(e) => setTokens(parseInt(e.target.value))}
            />
            <p className="param-hint">{t("sa_prompts_tokens_hint")}</p>
          </div>
        </div>
      </div>

      <div className="btn-guardar-wrapper">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-save ${saved ? "btn-save--saved" : saving ? "btn-save--saving" : "btn-save--idle"}`}
        >
          <Save size={16} />{" "}
          {saved ? t("sa_prompts_btn_saved") : saving ? t("sa_prompts_btn_saving") : t("sa_prompts_btn_idle")}
        </button>
      </div>
    </div>
  );
}
