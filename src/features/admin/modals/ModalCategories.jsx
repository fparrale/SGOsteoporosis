import { useTranslation } from "react-i18next";
import { X, Plus, Check, RefreshCw, AlertCircle, Sparkles, BookOpen,
         HeartPulse, Bone, Shield, Megaphone, Trash2 } from "lucide-react";

const ICON_MAP = {
  heart_pulse: HeartPulse,
  bone:        Bone,
  shield:      Shield,
  megaphone:   Megaphone,
  book:        BookOpen,
};

// ─────────────────────────────────────────────
// 1. Modal: Nueva / Editar Categoría
// ─────────────────────────────────────────────
export function CategoryFormModal({ editTarget, form, setForm, onSave, onClose }) {
  const { t } = useTranslation('categories');

  return (
    <div className="gc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gc-modal">
        <div className="gc-modal-header">
          <span className="gc-modal-title">
            {editTarget ? t('modal_edit_title') : t('modal_new_title')}
          </span>
          <button className="gc-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="gc-field">
          <label>{t('modal_name_label')}</label>
          <input
            placeholder="Ej: Salud Ósea"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="gc-field">
          <label>{t('modal_icon_label')}</label>
          <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
            <option value="heart_pulse">Salud/Bienestar</option>
            <option value="bone">Salud Ósea</option>
            <option value="shield">Prevención</option>
            <option value="megaphone">Concientización</option>
            <option value="book">Aprender</option>
          </select>
        </div>

        <div className="gc-field">
          <label>{t('modal_des_label')}</label>
          <textarea
            placeholder="Ej: Conceptos clave sobre densidad ósea y prevención..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="gc-modal-actions">
          <button className="gc-btn-cancel" onClick={onClose}>
            {t('modal_cancel_button')}
          </button>
          <button className="gc-btn-save" onClick={onSave}>
            {editTarget ? t('modal_save_button') : t('modal_create_button')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 2. Modal: Sugerencias IA
// ─────────────────────────────────────────────
export function SuggestionsModal({ sugerencias, agregadas, loadingSug, onAgregar, onNuevaSugerencia, onClose }) {
  const { t } = useTranslation('categories');

  return (
    <div className="gc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gc-modal gc-modal--sug">
        <div className="gc-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} style={{ color: "#4f46e5" }} />
            <span className="gc-modal-title">{t('sug_modal_title')}</span>
          </div>
          <button className="gc-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="gc-sug-list">
          {loadingSug ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8" }}>
              <RefreshCw size={20} style={{ animation: "spin 1s linear infinite", marginBottom: 8 }} />
              <div>{t('sug_loading')}</div>
            </div>
          ) : sugerencias.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94a3b8" }}>
              <Sparkles size={24} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div>{t('sug_empty_hint')}</div>
            </div>
          ) : sugerencias.map((sug, idx) => {
            const done = agregadas.includes(idx);
            const Icon = ICON_MAP[sug.icon] || BookOpen;
            return (
              <div key={sug.id ?? idx} className={`sug-row${done ? " sug-row--done" : ""}`}>
                <div className="sug-icon-wrap"><Icon size={16} className="sug-icon" /></div>
                <div className="sug-info">
                  <div className="sug-nombre">{sug.nombre}</div>
                  <div className="sug-desc">{sug.descripcion}</div>
                </div>
                <button
                  onClick={() => onAgregar(sug, idx)}
                  disabled={done}
                  className={`sug-add-btn${done ? " sug-add-btn--done" : ""}`}
                >
                  {done
                    ? <><Check size={12} /> {t('sug_added_button')}</>
                    : <><Plus size={12} /> {t('sug_add_button')}</>
                  }
                </button>
              </div>
            );
          })}
        </div>

        <div className="gc-modal-actions gc-modal-actions--between">
          <button
            className="gc-btn-cancel gc-btn-cancel--flex"
            onClick={onNuevaSugerencia}
            disabled={loadingSug}
          >
            <RefreshCw size={13} style={loadingSug ? { animation: "spin 1s linear infinite" } : {}} />
            {t('sug_new_button')}
          </button>
          <button className="gc-btn-save" onClick={onClose}>
            {t('sug_done_button')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. Modal: Confirmación
// ─────────────────────────────────────────────
export function ConfirmModal({ itemToAdd, onConfirm, onClose }) {
  const { t } = useTranslation('categories');

  return (
    <div className="gc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="gc-modal gc-modal--sm">
        <div className="gc-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={20} style={{ color: "#f59e0b" }} />
            <span className="gc-modal-title">{t('confirm_title')}</span>
          </div>
          <button className="gc-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <p className="gc-modal-text">
          {t('confirm_text_pre')} <strong>"{itemToAdd?.sug.nombre}"</strong> {t('confirm_text_post')}
        </p>

        <div className="gc-modal-actions">
          <button className="gc-btn-cancel" onClick={onClose}>
            {t('confirm_cancel')}
          </button>
          <button className="gc-btn-save" onClick={onConfirm}>
            {t('confirm_accept')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 3. Modal: Eliminar
// ─────────────────────────────────────────────

export function ConfirmDeleteModal({ itemToDelete, onConfirm, onClose }) {
    const { t } = useTranslation('categories');
  
    return (
      <div className="gc-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="gc-modal gc-modal--sm">
          <div className="gc-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Trash2 size={20} style={{ color: "#ef4444" }} />
              <span className="gc-modal-title">{t('delete_title')}</span>
            </div>
            <button className="gc-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <p className="gc-modal-text">
            {t('delete_text_pre')} <strong>"{itemToDelete?.name}"</strong> {t('delete_text_post')}
          </p>
          <div className="gc-modal-actions">
            <button className="gc-btn-cancel" onClick={onClose}>{t('confirm_cancel')}</button>
            <button className="gc-btn-delete" onClick={onConfirm}>{t('delete_confirm_button')}</button>
          </div>
        </div>
      </div>
    );
}