import { useState, useEffect, useCallback } from "react";
import { UserPlus, Eye, EyeOff, X, UserCheck, UserX, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchAdmins, createAdmin, toggleAdmin } from "../../services/SuperAdminServices";
import Alert from "../../../../components/ui/Alert";
import Loader from "../../../../components/ui/Loader";
import "./GestionAdmins.css";
import "./saModal.css";

const ROL_COLORS = {
  Administrador:      "badge--admin",
  Superadministrador: "badge--superadmin",
  Auditor:            "badge--auditor",
  Dev:                "badge--dev",
};

export default function GestionAdmins() {
  const { t } = useTranslation("admin");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "Administrador",
  });

  const ROLES = ["Administrador", "Superadministrador", "Auditor", "Dev"];

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdmins();
      setAdmins(data);
    } catch (err) {
      Alert.error(err.message);
      console.error("Error cargando admins:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const passChecks = {
    length: form.password.length >= 7,
    upper: /[A-Z]/.test(form.password),
    symbol: /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?`~]/.test(form.password),
  };
  const passScore = Object.values(passChecks).filter(Boolean).length;
  const passValid = passScore === 3;

  const openCreate = () => {
    setForm({ nombre: "", email: "", password: "", rol: "Administrador" });
    setShowPass(false);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.email.trim()) {
      Alert.warning(t("sa_admins_err_name_email"));
      return;
    }
    if (!form.password.trim()) {
      Alert.warning(t("sa_admins_err_password"));
      return;
    }
    if (!passValid) {
      Alert.warning(t("sa_admins_err_pass_strength"));
      return;
    }

    setSaving(true);

    try {
      await createAdmin({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
        rol: form.rol,
      });
      Alert.success(t("sa_admins_success_created"));
      setShowForm(false);
      await loadAdmins();
    } catch (err) {
      console.error("Error guardando admin:", err);
      Alert.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, nombre, estaActivo) => {
    const accion = estaActivo ? "desactivar" : "activar";
    if (!window.confirm(`¿${accion.charAt(0).toUpperCase() + accion.slice(1)} a "${nombre}"?`)) return;
    try {
      await toggleAdmin(id);
      Alert.success(t(estaActivo ? "sa_admins_success_deactivated" : "sa_admins_success_activated"));
      await loadAdmins();
    } catch (err) {
      console.error("Error cambiando estado:", err);
      Alert.error(err.message);
    }
  };

  if (loading) return <Loader loading content={t("sa_admins_loading")} />;

  return (
    <div className="gestion-admins">
      <div className="gestion-admins__header">
        <div>
          <h1 className="gestion-admins__title">{t("sa_admins_title")}</h1>
          <p className="gestion-admins__subtitle">{t("sa_admins_subtitle")}</p>
        </div>
        <button className="btn--primary" onClick={openCreate}>
          <UserPlus size={16} /> {t("sa_admins_new_btn")}
        </button>
      </div>

      <div className="card card--nopad">
        <div className="table-scroll">
        <table className="table-admins">
          <thead>
            <tr>
              <th className="col-id">{t("sa_admins_col_id")}</th>
              <th>{t("sa_admins_col_name")}</th>
              <th>{t("sa_admins_col_email")}</th>
              <th className="col-center">{t("sa_admins_col_role")}</th>
              <th>{t("sa_admins_col_status")}</th>
              <th>{t("sa_admins_col_last_login")}</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
                  {t("sa_admins_empty")}
                </td>
              </tr>
            )}
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="cell-id">{a.id}</td>
                <td>
                  <div className="nombre-con-avatar">
                    <div className="admin-avatar">
                      {a.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="cell-nombre">{a.nombre}</span>
                  </div>
                </td>
                <td className="cell-email">{a.email}</td>
                <td className="col-center">
                  <span className={`badge ${ROL_COLORS[a.rol] || "badge--admin"}`}>
                    {a.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${Boolean(a.esta_activo) ? "badge--activo" : "badge--inactivo"}`}>
                    {Boolean(a.esta_activo) ? t("sa_admins_status_active") : t("sa_admins_status_inactive")}
                  </span>
                </td>
                <td className="cell-fecha">{a.ultimo_login ?? "—"}</td>
                <td>
                  <div className="acciones-cell">
                    <button
                      className={`btn-accion ${Boolean(a.esta_activo) ? "btn-accion--deactivate" : "btn-accion--activate"}`}
                      onClick={() => handleToggle(a.id, a.nombre, Boolean(a.esta_activo))}
                      title={Boolean(a.esta_activo) ? t("sa_admins_btn_deactivate") : t("sa_admins_btn_activate")}
                    >
                      {Boolean(a.esta_activo) ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showForm && (
        <div className="sa-overlay" onClick={closeForm}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>

            <div className="sa-modal-header">
              <div className="sa-modal-header-left">
                <div className="sa-modal-icon">
                  <UserPlus size={18} />
                </div>
                <h2 className="sa-modal-title">{t("sa_admins_modal_create_title")}</h2>
              </div>
              <button className="sa-modal-close" onClick={closeForm} disabled={saving}>
                <X size={16} />
              </button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-form-fields">
                <div className="sa-field">
                  <label>{t("sa_admins_label_name")}</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej. Ana García"
                  />
                </div>
                <div className="sa-field">
                  <label>{t("sa_admins_label_email")}</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="ana@gameapp.com"
                  />
                </div>
                <div className="sa-field">
                  <label>{t("sa_admins_label_password")}</label>
                  <div className="sa-pass-wrap">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="sa-pass-toggle"
                      onClick={() => setShowPass((v) => !v)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password.length > 0 && (
                    <div className="sa-pass-strength">
                      <div className="sa-strength-bar">
                        <div className={`sa-strength-seg ${passScore >= 1 ? "seg--1" : ""}`} />
                        <div className={`sa-strength-seg ${passScore >= 2 ? "seg--2" : ""}`} />
                        <div className={`sa-strength-seg ${passScore >= 3 ? "seg--3" : ""}`} />
                      </div>
                      <div className="sa-pass-rules">
                        <span className={passChecks.length ? "rule--ok" : "rule--fail"}>
                          <Check size={9} /> {t("sa_admins_pass_check_length")}
                        </span>
                        <span className={passChecks.upper ? "rule--ok" : "rule--fail"}>
                          <Check size={9} /> {t("sa_admins_pass_check_upper")}
                        </span>
                        <span className={passChecks.symbol ? "rule--ok" : "rule--fail"}>
                          <Check size={9} /> {t("sa_admins_pass_check_symbol")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="sa-field">
                  <label>{t("sa_admins_label_role")}</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm((p) => ({ ...p, rol: e.target.value }))}
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="sa-modal-actions">
              <button className="sa-btn-cancel" onClick={closeForm} disabled={saving}>
                {t("sa_admins_btn_cancel")}
              </button>
              <button className="sa-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? t("sa_admins_saving") : t("sa_admins_btn_create")}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
