import { useState, useEffect, useCallback } from "react";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchSuperGameConfig, saveSuperGameConfig } from "../../services/SuperAdminServices";
import Alert from "../../../../components/ui/Alert";
import Loader from "../../../../components/ui/Loader";
import "./ConfigGeneral.css";

const DIFICULTADES = [
  { key: "puntos_muy_facil",   labelKey: "difficulty_very_easy", color: "#16a34a", border: "#16a34a30", bg: "#16a34a08" },
  { key: "puntos_facil",       labelKey: "difficulty_easy",      color: "#65a30d", border: "#65a30d30", bg: "#65a30d08" },
  { key: "puntos_intermedio",  labelKey: "difficulty_medium",    color: "#d97706", border: "#d9770630", bg: "#d9770608" },
  { key: "puntos_dificil",     labelKey: "difficulty_hard",      color: "#ea580c", border: "#ea580c30", bg: "#ea580c08" },
  { key: "puntos_muy_dificil", labelKey: "difficulty_very_hard", color: "#dc2626", border: "#dc262630", bg: "#dc262608" },
];

export default function ConfigGeneral() {
  const { t } = useTranslation("admin");
  const [loading, setLoad] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cfg, setCfg] = useState({
    preguntas_por_partida: 10,
    tiempo_por_pregunta: 30,
    vidas: 3,
    aleatoriedad_categorias: true,
    idioma_default: "es",
    puntos_muy_facil: 5,
    puntos_facil: 10,
    puntos_intermedio: 20,
    puntos_dificil: 35,
    puntos_muy_dificil: 50,
  });

  const loadConfig = useCallback(async () => {
    setLoad(true);
    try {
      const data = await fetchSuperGameConfig();
      if (data) {
        setCfg({
          preguntas_por_partida: data.preguntas_por_partida ?? 10,
          tiempo_por_pregunta: data.tiempo_por_pregunta ?? 30,
          vidas: data.vidas ?? 3,
          aleatoriedad_categorias: data.aleatoriedad_categorias ?? true,
          idioma_default: data.idioma_default ?? "es",
          puntos_muy_facil: data.puntos_muy_facil ?? 5,
          puntos_facil: data.puntos_facil ?? 10,
          puntos_intermedio: data.puntos_intermedio ?? 20,
          puntos_dificil: data.puntos_dificil ?? 35,
          puntos_muy_dificil: data.puntos_muy_dificil ?? 50,
        });
      }
    } catch (err) {
      console.error("Error cargando config:", err);
      Alert.error(err.message);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSuperGameConfig(cfg);
      setSaved(true);
      Alert.success(t("sa_config_success_saved"));
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error guardando config:", err);
      Alert.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setCfg((p) => ({ ...p, [key]: val }));

  if (loading) return <Loader loading content={t("sa_config_loading")} />;

  return (
    <div className="config-general">
      <div className="config-general__header">
        <h1>{t("sa_config_title")}</h1>
        <p>{t("sa_config_subtitle")}</p>
      </div>

      <div className="card">
        <h2>{t("sa_config_params_title")}</h2>
        <div className="params-grid">
          <div className="form-group">
            <label className="form-label">{t("sa_config_questions_label")}</label>
            <input
              type="number"
              className="form-input"
              min={4}
              max={90}
              value={cfg.preguntas_por_partida}
              onChange={(e) => set("preguntas_por_partida", Math.min(90, Math.max(4, parseInt(e.target.value) || 4)))}
            />
            <p className="form-hint">{t("sa_config_questions_hint")}</p>
          </div>
          <div className="form-group">
            <label className="form-label">{t("sa_config_time_label")}</label>
            <input
              type="number"
              className="form-input"
              min={5}
              max={120}
              value={cfg.tiempo_por_pregunta}
              onChange={(e) => set("tiempo_por_pregunta", Math.min(120, Math.max(5, parseInt(e.target.value) || 5)))}
            />
            <p className="form-hint">{t("sa_config_time_hint")}</p>
          </div>
          <div className="form-group">
            <label className="form-label">{t("sa_config_lives_label")}</label>
            <select
              className="form-input"
              value={cfg.vidas}
              onChange={(e) => set("vidas", parseInt(e.target.value))}
            >
              <option value={1}>{t("lives_one_hard")}</option>
              <option value={2}>{t("lives_two")}</option>
              <option value={3}>{t("lives_three_standard")}</option>
              <option value={5}>{t("lives_five_easy")}</option>
              <option value={0}>{t("lives_unlimited")}</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">{t("sa_config_language_label")}</label>
            <select
              className="form-input"
              value={cfg.idioma_default}
              onChange={(e) => set("idioma_default", e.target.value)}
            >
              <option value="es">{t("language_spanish")}</option>
              <option value="en">{t("language_english")}</option>
            </select>
          </div>
        </div>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="aleatorio"
            checked={cfg.aleatoriedad_categorias}
            onChange={(e) => set("aleatoriedad_categorias", e.target.checked)}
          />
          <label htmlFor="aleatorio">{t("sa_config_random_label")}</label>
        </div>
      </div>

      <div className="card">
        <h2>{t("sa_config_difficulty_title")}</h2>
        <div className="dificultades-grid">
          {DIFICULTADES.map(({ key, labelKey, color, border, bg }) => (
            <div
              key={key}
              className="dificultad-card"
              style={{ border: `1px solid ${border}`, background: bg }}
            >
              <p className="dificultad-card__label" style={{ color }}>
                {t(labelKey)}
              </p>
              <div className="dificultad-card__input-group">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={cfg[key]}
                  onChange={(e) => set(key, parseInt(e.target.value))}
                  className="dificultad-card__input"
                  style={{ color, borderColor: `${color}40`, border: `1px solid ${color}40` }}
                />
                <span className="dificultad-card__pts">{t("sa_config_pts")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="btn-guardar-wrapper">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`btn-save ${saved ? "btn-save--saved" : "btn-save--idle"}`}
        >
          <Save size={16} />{" "}
          {saved ? t("sa_config_btn_saved") : saving ? t("sa_config_btn_saving") : t("sa_config_btn_idle")}
        </button>
      </div>
    </div>
  );
}
