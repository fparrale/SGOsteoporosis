import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, CheckCircle, Eye, EyeOff, Cpu, X, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchIAModels, createIAModel, updateIAModel, deleteIAModel, selectIAModel } from "../../services/SuperAdminServices";
import Alert from "../../../../components/ui/Alert";
import Loader from "../../../../components/ui/Loader";
import "./ModelosIA.css";
import "./saModal.css";

const PROV_CLASS = {
  google:    "badge-proveedor--google",
  openai:    "badge-proveedor--openai",
  ollama:    "badge-proveedor--ollama",
  anthropic: "badge-proveedor--anthropic",
};

export default function ModelosIA() {
  const { t } = useTranslation("admin");
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [clearKey, setClearKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    proveedor: "google",
    version_modelo: "",
    api_key: "",
    api_url: "",
    prompt_override: "",
  });

  const PROVEEDORES = ["google", "openai", "ollama", "anthropic"];

  const loadModelos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchIAModels();
      setModelos(data);
    } catch (err) {
      Alert.error(err.message);
      console.error("Error cargando modelos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModelos();
  }, [loadModelos]);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ nombre: "", proveedor: "google", version_modelo: "", api_key: "", api_url: "", prompt_override: "" });
    setShowKey(false);
    setClearKey(false);
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditTarget(m);
    setForm({
      nombre: m.nombre,
      proveedor: m.proveedor,
      version_modelo: m.version_modelo ?? "",
      api_key: "",
      api_url: m.api_url ?? "",
      prompt_override: m.prompt_override ?? "",
    });
    setShowKey(false);
    setClearKey(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  const handleSelect = async (id) => {
    try {
      await selectIAModel(id);
      Alert.success(t("sa_models_success_selected"));
      await loadModelos();
    } catch (err) {
      console.error("Error al seleccionar modelo:", err);
      Alert.error(err.message);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;
    try {
      await deleteIAModel(id);
      Alert.success(t("sa_models_success_deleted"));
      await loadModelos();
    } catch (err) {
      console.error("Error al eliminar modelo:", err);
      Alert.error(err.message);
    }
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      Alert.warning(t("sa_models_err_name_required"));
      return;
    }

    setSaving(true);

    try {
      const data = {
        nombre: form.nombre.trim(),
        proveedor: form.proveedor,
        version_modelo: form.version_modelo.trim() || undefined,
        api_url: form.api_url.trim() || undefined,
        prompt_override: form.prompt_override.trim() || undefined,
      };

      if (clearKey) {
        data.clear_api_key = true;
      } else if (form.api_key.trim()) {
        data.api_key = form.api_key.trim();
      }

      if (editTarget) {
        await updateIAModel(editTarget.id, data);
        Alert.success(t("sa_models_success_updated"));
      } else {
        await createIAModel(data);
        Alert.success(t("sa_models_success_created"));
      }

      setShowForm(false);
      await loadModelos();
    } catch (err) {
      console.error("Error guardando modelo:", err);
      Alert.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader loading content={t("sa_models_loading")} />;

  return (
    <div className="modelos-ia">
      <div className="modelos-ia__header">
        <div>
          <h1 className="modelos-ia__title">{t("sa_models_title")}</h1>
          <p className="modelos-ia__subtitle">{t("sa_models_subtitle")}</p>
        </div>
        <button className="btn--primary" onClick={openCreate}>
          <Plus size={16} /> {t("sa_models_add_btn")}
        </button>
      </div>

      <div className="aviso-seguridad">
        <Lock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{t("sa_models_security_notice")}</span>
      </div>

      <div className="modelos-grid">
        {modelos.length === 0 && !loading && (
          <p style={{ color: "#64748b", gridColumn: "1 / -1", textAlign: "center", padding: 32 }}>
            {t("sa_models_empty")}
          </p>
        )}
        {modelos.map((m) => {
          const activo = Boolean(m.es_seleccionado);
          return (
            <div key={m.id} className={`card-modelo ${activo ? "card-modelo--activo" : ""}`}>
              {activo && <span className="badge-activo">{t("sa_models_badge_active")}</span>}
              <div className="modelo-header">
                <div className="modelo-icono">
                  <Cpu size={20} color="#7c3aed" />
                </div>
                <div>
                  <p className="modelo-nombre">{m.nombre}</p>
                  <p className="modelo-version">{m.version_modelo ?? t("sa_models_no_version")}</p>
                </div>
              </div>
              <div className="modelo-tags">
                <span className={`badge-proveedor ${PROV_CLASS[m.proveedor] ?? "badge-proveedor--default"}`}>
                  {m.proveedor}
                </span>
                <span className={`badge-key ${m.api_key_guardada ? "badge-key--ok" : "badge-key--missing"}`}>
                  {m.api_key_guardada ? t("sa_models_badge_key_ok") : t("sa_models_badge_no_key")}
                </span>
              </div>
              <div className="modelo-acciones">
                {!activo && (
                  <button className="btn-seleccionar" onClick={() => handleSelect(m.id)}>
                    <CheckCircle size={14} /> {t("sa_models_btn_use")}
                  </button>
                )}
                <button className="btn-accion btn-accion--edit" onClick={() => openEdit(m)}>
                  <Pencil size={14} />
                </button>
                <button className="btn-accion btn-accion--delete" onClick={() => handleDelete(m.id, m.nombre)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="sa-overlay" onClick={closeForm}>
          <div className="sa-modal sa-modal--lg" onClick={(e) => e.stopPropagation()}>

            <div className="sa-modal-header">
              <div className="sa-modal-header-left">
                <div className="sa-modal-icon">
                  {editTarget ? <Pencil size={18} /> : <Plus size={18} />}
                </div>
                <h2 className="sa-modal-title">
                  {editTarget ? t("sa_models_modal_edit_title") : t("sa_models_modal_create_title")}
                </h2>
              </div>
              <button className="sa-modal-close" onClick={closeForm} disabled={saving}>
                <X size={16} />
              </button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-form-fields">
                <div className="sa-form-grid-2">
                  <div className="sa-field">
                    <label>{t("sa_models_label_name")}</label>
                    <input
                      value={form.nombre}
                      onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                      placeholder="Gemini Flash"
                    />
                  </div>
                  <div className="sa-field">
                    <label>{t("sa_models_label_provider")}</label>
                    <input
                      list="proveedores-list"
                      value={form.proveedor}
                      onChange={(e) => setForm((p) => ({ ...p, proveedor: e.target.value }))}
                      placeholder="google, openai, ollama..."
                      autoComplete="off"
                    />
                    <datalist id="proveedores-list">
                      {PROVEEDORES.map((p) => <option key={p} value={p} />)}
                    </datalist>
                  </div>
                </div>
                <div className="sa-field">
                  <label>{t("sa_models_label_version")}</label>
                  <input
                    value={form.version_modelo}
                    onChange={(e) => setForm((p) => ({ ...p, version_modelo: e.target.value }))}
                    placeholder="gemini-1.5-flash"
                  />
                </div>
                <div className="sa-field">
                  <label>
                    {t("sa_models_label_api_key")}{" "}
                    {editTarget && !clearKey && (
                      <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                        {t("sa_models_label_api_key_hint")}
                      </span>
                    )}
                  </label>
                  {!clearKey && (
                    <div className="sa-pass-wrap">
                      <input
                        style={showKey ? {} : { fontFamily: "monospace" }}
                        type={showKey ? "text" : "password"}
                        value={form.api_key}
                        onChange={(e) => setForm((p) => ({ ...p, api_key: e.target.value }))}
                        placeholder={editTarget ? "****************" : "sk-..."}
                      />
                      <button
                        type="button"
                        className="sa-pass-toggle"
                        onClick={() => setShowKey((v) => !v)}
                      >
                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                  {editTarget && editTarget.api_key_guardada && (
                    <label className="clear-key-check">
                      <input
                        type="checkbox"
                        checked={clearKey}
                        onChange={(e) => {
                          setClearKey(e.target.checked);
                          if (e.target.checked) setForm((p) => ({ ...p, api_key: "" }));
                        }}
                      />
                      {t("sa_models_clear_api_key")}
                    </label>
                  )}
                </div>
                {form.proveedor === "ollama" && (
                  <div className="sa-field">
                    <label>{t("sa_models_label_server_url")}</label>
                    <input
                      value={form.api_url}
                      onChange={(e) => setForm((p) => ({ ...p, api_url: e.target.value }))}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                )}
                <div className="sa-field">
                  <label>
                    {t("sa_models_label_prompt_override")}{" "}
                    <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                      {t("sa_models_label_prompt_override_hint")}
                    </span>
                  </label>
                  <textarea
                    style={{ fontFamily: "monospace" }}
                    value={form.prompt_override}
                    onChange={(e) => setForm((p) => ({ ...p, prompt_override: e.target.value }))}
                    placeholder={t("sa_models_placeholder_prompt_override")}
                  />
                </div>
              </div>
            </div>

            <div className="sa-modal-actions">
              <button className="sa-btn-cancel" onClick={closeForm} disabled={saving}>
                {t("sa_models_btn_cancel")}
              </button>
              <button className="sa-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? t("sa_admins_saving") : editTarget ? t("sa_models_btn_save") : t("sa_models_btn_add")}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
