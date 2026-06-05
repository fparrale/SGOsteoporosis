// ─────────────────────────────────────────────
//  modals/ModalQuestionBank.jsx
//  Solo componentes de UI para los modales.
//  Constantes viven en questionBankConstants.js
//  Helpers viven en questionBankService.js
// ─────────────────────────────────────────────

import {
    AlertTriangle,
    Bone,
    BookOpen,
    CheckCircle,
    Clock,
    Eye,
    FileEdit,
    FileSignature,
    HeartPulse,
    Loader,
    Megaphone,
    Pencil,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    X,
    XCircle,
  } from "lucide-react";
  import { useState } from "react";
  import {
    CATEGORIES,
    DIFFICULTIES_KEYS,
    LANGUAGES,
    OPTION_LABELS,
  } from "../constants/questionBankConstants";
  import { diffColor, statusStyle, catIcon } from "../services/Questionbankservices";
  
  // Re-exportamos los helpers para que QuestionBank.jsx
  // los siga importando desde este mismo archivo sin romper nada.
  export { diffColor, statusStyle, catIcon, CATEGORIES, DIFFICULTIES_KEYS };
  
  // ── StatusToggle ──────────────────────────────
  export const StatusToggle = ({ statusKey, onClick, t }) => {
    const statusMap = {
      [t("status_verified")]:   { Icon: ShieldCheck,   color: "#16a34a", bgColor: "#f0fdf4", label: t("status_verified") },
      [t("status_unverified")]: { Icon: ShieldAlert,   color: "#d97706", bgColor: "#fffbeb", label: t("status_unverified") },
      [t("status_draft")]:      { Icon: FileSignature, color: "#64748b", bgColor: "#f8fafc", label: t("status_draft") },
    };
    const current = statusMap[t(statusKey)] || statusMap[t("status_draft")];
  
    return (
      <button className="bp-status-toggle" onClick={onClick} title={current.label}>
        <div
          className="bp-status-badge-icon"
          style={{ borderColor: current.color, backgroundColor: current.bgColor }}
        >
          <current.Icon size={16} style={{ color: current.color }} />
        </div>
      </button>
    );
  };
  
  // ── DeleteConfirmModal ────────────────────────
  export function DeleteConfirmModal({ isOpen, onClose, onConfirm, t }) {
    if (!isOpen) return null;
    return (
      <div className="bp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bp-modal" style={{ maxWidth: 410 }} onClick={(e) => e.stopPropagation()}>
          <div className="bp-modal-header" style={{ background: "white", borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bp-modal-icon-wrap" style={{ background: "#fff1f1", color: "#ef4444" }}>
                <Trash2 size={15} />
              </div>
              <h2 className="bp-modal-title">{t("delete_modal_title")}</h2>
            </div>
            <button className="bp-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="bp-modal-content">
            <p style={{ lineHeight: 1.6, color: "#475569" }}>{t("delete_modal_text")}</p>
          </div>
          <div className="bp-modal-actions">
            <button className="bp-btn-cancel" onClick={onClose}>{t("modal_cancel")}</button>
            <button className="bp-btn-primary" onClick={onConfirm} style={{ background: "#dc2626" }}>
              {t("delete_modal_confirm")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ── BulkDeleteConfirmModal ────────────────────
  export function BulkDeleteConfirmModal({ isOpen, onClose, onConfirm, t }) {
    if (!isOpen) return null;
    return (
      <div className="bp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bp-modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
          <div className="bp-modal-header" style={{ borderBottom: "1px solid #f1f5f9", background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bp-modal-icon-wrap" style={{ background: "#fff1f1", color: "#ef4444" }}>
                <Trash2 size={15} />
              </div>
              <h2 className="bp-modal-title">{t("bulk_delete_modal_title")}</h2>
            </div>
            <button className="bp-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="bp-modal-content">
            <p style={{ lineHeight: 1.6, color: "#475569" }}>{t("bulk_delete_modal_text")}</p>
          </div>
          <div className="bp-modal-actions">
            <button className="bp-btn-cancel" onClick={onClose}>{t("modal_cancel")}</button>
            <button className="bp-btn-primary" onClick={onConfirm} style={{ background: "#dc2626" }}>
              {t("bulk_delete_modal_confirm")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ── GenerateModal ─────────────────────────────
  export function GenerateModal({ isOpen, onClose, onGenerate, isGenerating, generateError, categories = [], t }) {
    const [selectedCategory,   setSelectedCategory]   = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [quantity,           setQuantity]           = useState(1);
    const [language,           setLanguage]           = useState("es");

    if (!isOpen) return null;

    return (
      <div className="bp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
          <div className="bp-modal-header">
            <div>
              <h2 className="bp-modal-title">{t("generate_modal_title")}</h2>
              <p className="bp-modal-subtitle">{t("generate_modal_subtitle")}</p>
            </div>
            <button className="bp-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="bp-modal-content">

            {generateError && (
              <div className={`bp-generate-error-banner ${generateError.type === "token" ? "bp-generate-error-banner--token" : "bp-generate-error-banner--generic"}`}>
                <div className="bp-generate-error-icon">
                  <AlertTriangle size={18} />
                </div>
                <div className="bp-generate-error-body">
                  <span className="bp-generate-error-title">
                    {generateError.type === "token"
                      ? t("generate_error_token_title")
                      : t("generate_error_generic_title")}
                  </span>
                  <span className="bp-generate-error-desc">
                    {generateError.type === "token"
                      ? t("generate_error_token_desc")
                      : t("generate_error_generic_desc")}
                  </span>
                  {generateError.message && (
                    <span className="bp-generate-error-detail">
                      {generateError.message}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="bp-field">
              <label>{t("toolbar_category_label")}</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">{t("modal_select_category")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="bp-field">
              <label>{t("toolbar_difficulty_label")}</label>
              <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="">{t("modal_select_difficulty")}</option>
                {DIFFICULTIES_KEYS.map((d) => (
                  <option key={d} value={d}>{t(d)}</option>
                ))}
              </select>
            </div>
            <div className="bp-field-grid">
              <div className="bp-field" style={{ marginBottom: 0 }}>
                <label>{t("modal_question_amount")}</label>
                <input
                  type="number"
                  min={1}
                  max={75}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(75, Math.max(1, Number(e.target.value))))}
                />
                <p className="bp-field-hint">{t("modal_quantity_hint")}</p>
              </div>
              <div className="bp-field" style={{ marginBottom: 0 }}>
                <label>{t("modal_language")}</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bp-modal-actions">
            <button className="bp-btn-cancel" onClick={onClose}>{t("modal_cancel")}</button>
            <button
              className="bp-btn-primary"
              onClick={() => onGenerate({ selectedCategory, selectedDifficulty, quantity, language })}
              disabled={isGenerating || !selectedCategory || !selectedDifficulty}
              style={{
                opacity: (!selectedCategory || !selectedDifficulty) ? 0.5 : 1,
                cursor: (!selectedCategory || !selectedDifficulty) ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating
                ? <><Loader size={16} className="spinner" /> {t("generate_modal_generating_button")}</>
                : t("generate_modal_button")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ── EditModal ─────────────────────────────────
  export function EditModal({ isOpen, question, onClose, onSave, dbCategories = [], t }) {
    const [form, setForm] = useState(question ? { ...question } : null);
  
    if (isOpen && question && (!form || form.id !== question.id)) {
      setForm({ ...question });
    }
    if (!isOpen || !form) return null;
  
    const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
    const updateOption = (idx, val) => {
      const opts = [...form.options];
      opts[idx] = val;
      update("options", opts);
    };
  
    return (
      <div className="bp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bp-modal bp-modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="bp-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bp-modal-icon-wrap">
                <Pencil size={15} />
              </div>
              <div>
                <h2 className="bp-modal-title">{t("modal_edit_question")}</h2>
                <p className="bp-modal-subtitle" style={{ fontFamily: "monospace", fontSize: 12 }}>
                  ID: {form.id}
                </p>
              </div>
            </div>
            <button className="bp-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="bp-modal-content">
            <div className="bp-field">
              <label>{t("modal_question_statement")}</label>
              <textarea
                className="bp-textarea"
                value={form.text}
                onChange={(e) => update("text", e.target.value)}
                rows={3}
              />
            </div>
            <div className="bp-field-grid">
              <div className="bp-field" style={{ marginBottom: 0 }}>
                <label>{t("modal_category")}</label>
                <select value={form.category_id} onChange={(e) => update("category_id", Number(e.target.value))}>
                  {dbCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="bp-field" style={{ marginBottom: 0 }}>
                <label>{t("modal_difficulty")}</label>
                <select value={form.difficulty} onChange={(e) => update("difficulty", e.target.value)}>
                  {DIFFICULTIES_KEYS.map((d) => (
                    <option key={d} value={d}>{t(d)}</option>
                  ))}
                </select>
              </div>
              <div className="bp-field" style={{ marginBottom: 0 }}>
                <label>{t("modal_language")}</label>
                <select value={form.idioma || "es"} onChange={(e) => update("idioma", e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bp-section-label">
              <span>{t("modal_answer_options")}</span>
              <span className="bp-section-hint">{t("modal_select_correct_option")}</span>
            </div>
            <div className="bp-options-grid">
              {OPTION_LABELS.map((label, idx) => (
                <div
                  key={idx}
                  className={`bp-option-card${form.correctOption === idx ? " correct" : ""}`}
                  onClick={() => update("correctOption", idx)}
                >
                  <div className="bp-option-top">
                    <div className={`bp-option-radio${form.correctOption === idx ? " active" : ""}`}>
                      {form.correctOption === idx && <div className="bp-option-radio-dot" />}
                    </div>
                    <span className="bp-option-label">{label}</span>
                  </div>
                  <input
                    className="bp-option-input"
                    value={form.options[idx] || ""}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`${t("modal_option_placeholder")} ${label}`}
                  />
                </div>
              ))}
            </div>
            <div className="bp-section-label" style={{ marginTop: 18 }}>
              <span>{t("modal_optional_explanations")}</span>
            </div>
            <div className="bp-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a" }}>
                <CheckCircle size={14} style={{ color: "#16a34a" }} />
                {t("modal_when_player_succeeds")}
              </label>
              <textarea
                className="bp-textarea"
                rows={2}
                value={form.explanationCorrect || ""}
                onChange={(e) => update("explanationCorrect", e.target.value)}
              />
            </div>
            <div className="bp-field">
              <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626" }}>
                <XCircle size={14} style={{ color: "#dc2626" }} />
                {t("modal_when_player_fails")}
              </label>
              <textarea
                className="bp-textarea"
                rows={2}
                value={form.explanationIncorrect || ""}
                onChange={(e) => update("explanationIncorrect", e.target.value)}
              />
            </div>
            <div className="bp-modal-warning">
              ⚠️ {t("modal_verify_question_reminder")}
            </div>
          </div>
          <div className="bp-modal-actions">
            <button className="bp-btn-cancel" onClick={onClose}>{t("modal_cancel")}</button>
            <button className="bp-btn-primary" onClick={() => onSave(form)}>
              <Pencil size={14} /> {t("modal_save_changes")}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // ── ViewModal ─────────────────────────────────
  export function ViewModal({ isOpen, question, onClose, t }) {
    if (!isOpen || !question) return null;
  
    const ss = statusStyle(t(question.status), t);
    const ds = diffColor(t(question.difficulty), t);
  
    const statusIcon = {
      [t("status_verified")]:   <CheckCircle size={15} style={{ color: "#16a34a" }} />,
      [t("status_unverified")]: <Clock size={15}       style={{ color: "#d97706" }} />,
      [t("status_draft")]:      <FileEdit size={15}    style={{ color: "#94a3b8" }} />,
    }[t(question.status)];
  
    return (
      <div className="bp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bp-modal bp-modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="bp-modal-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="bp-modal-icon-wrap view">
                <Eye size={15} />
              </div>
              <div>
                <h2 className="bp-modal-title">{t("modal_view_question")}</h2>
                <p className="bp-modal-subtitle" style={{ fontFamily: "monospace", fontSize: 12 }}>
                  ID: {question.id}
                </p>
              </div>
            </div>
            <button className="bp-modal-close" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="bp-modal-content">
            <div className="bp-view-status-banner" style={{ background: ss.bg, borderColor: ss.dot + "55" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {statusIcon}
                <span style={{ fontWeight: 700, color: ss.color, fontSize: 14 }}>{t(question.status)}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span className="bp-diff-badge" style={{ background: ds.bg, color: ds.color, fontSize: 12 }}>
                  {t(question.difficulty)}
                </span>
                <span className="bp-cat" style={{ fontSize: 12 }}>
                  {catIcon(question.category)} {question.category}
                </span>
              </div>
            </div>
            <div className="bp-field" style={{ marginTop: 16 }}>
              <label>{t("modal_question_statement")}</label>
              <div className="bp-view-text">{question.text}</div>
            </div>
            <div className="bp-section-label">
              <span>{t("modal_answer_options")}</span>
            </div>
            <div className="bp-options-grid">
              {OPTION_LABELS.map((label, idx) => (
                <div
                  key={idx}
                  className={`bp-option-card readonly${question.correctOption === idx ? " correct" : ""}`}
                >
                  <div className="bp-option-top">
                    <div className={`bp-option-radio${question.correctOption === idx ? " active" : ""}`}>
                      {question.correctOption === idx && <div className="bp-option-radio-dot" />}
                    </div>
                    <span className="bp-option-label">{label}</span>
                  </div>
                  <div className="bp-option-view-text">{question.options[idx] || "—"}</div>
                </div>
              ))}
            </div>
            {(question.explanationCorrect || question.explanationIncorrect) && (
              <>
                <div className="bp-section-label" style={{ marginTop: 18 }}>
                  <span>{t("modal_optional_explanations")}</span>
                </div>
                {question.explanationCorrect && (
                  <div className="bp-view-explanation correct">
                    <CheckCircle size={14} />
                    <div>
                      <div className="bp-view-expl-label">{t("modal_when_player_succeeds")}</div>
                      <div className="bp-view-expl-text">{question.explanationCorrect}</div>
                    </div>
                  </div>
                )}
                {question.explanationIncorrect && (
                  <div className="bp-view-explanation wrong">
                    <XCircle size={14} />
                    <div>
                      <div className="bp-view-expl-label">{t("modal_when_player_fails")}</div>
                      <div className="bp-view-expl-text">{question.explanationIncorrect}</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="bp-modal-actions">
            <button className="bp-btn-cancel" onClick={onClose}>{t("modal_close")}</button>
          </div>
        </div>
      </div>
    );
  }