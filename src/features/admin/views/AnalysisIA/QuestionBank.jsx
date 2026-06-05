// ─────────────────────────────────────────────
//  views/Analytics/QuestionBank.jsx
//  Solo JSX / render. Cero lógica de negocio.
//  Toda la lógica vive en useQuestionBank.jsx
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileEdit,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Zap, Eye, Pencil,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { DIFFICULTIES_KEYS, LANGUAGES } from "../../constants/questionBankConstants";
import { useQuestionBank } from "../../hooks/useQuestionBank";
import { downloadCSVTemplate } from "../../services/IAConfigServices";
import { useCSVImport } from "../../hooks/useCSVImport";
import {
  BulkDeleteConfirmModal,
  DeleteConfirmModal,
  EditModal,
  GenerateModal,
  StatusToggle,
  ViewModal,
} from "../../modals/ModalQuestionBank";
import { catIcon, diffColor } from "../../services/Questionbankservices.jsx";
import "./QuestionBank.css";

function timeAgo(t, dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return t("log_just_now");
  if (diff < 3600)  return t("log_minutes_ago", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("log_hours_ago",   { n: Math.floor(diff / 3600) });
  return t("log_days_ago", { n: Math.floor(diff / 86400) });
}

const MAX_VISIBLE = 6;

function CategoryDropdown({ value, onChange, categories, allLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selectedLabel = value === "all_categories"
    ? allLabel
    : (categories.find(c => c.nombre === value)?.nombre ?? allLabel);

  return (
    <div className="bp-cat-drop" ref={ref}>
      <button
        className="bp-cat-drop-btn"
        onClick={() => setOpen(o => !o)}
        type="button"
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={12} className={`bp-cat-drop-chevron${open ? " open" : ""}`} />
      </button>
      {open && (
        <div
          className="bp-cat-drop-list"
          style={{ maxHeight: `${MAX_VISIBLE * 38}px` }}
        >
          <div
            className={`bp-cat-drop-opt${value === "all_categories" ? " active" : ""}`}
            onClick={() => { onChange("all_categories"); setOpen(false); }}
          >
            {allLabel}
          </div>
          {categories.map(c => (
            <div
              key={c.id}
              className={`bp-cat-drop-opt${value === c.nombre ? " active" : ""}`}
              onClick={() => { onChange(c.nombre); setOpen(false); }}
            >
              {c.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BancoPreguntas() {
  const { t: tCsv } = useTranslation("iaconfig");

  const {
    t,
    stats,
    paged,
    totalCount,
    safePage,
    totalPages,
    isAllVisibleSelected,
    selectedIds,
    search,        setSearch,
    category,      setCategory,
    difficulty,    setDifficulty,
    statusFilter,  setStatusFilter,
    languageFilter, setLanguageFilter,
    goPage,
    pageNums,
    isGenerateModalOpen,  setGenerateModalOpen,
    isGenerating,
    generateError,        setGenerateError,
    editQuestion,         setEditQuestion,
    viewQuestion,         setViewQuestion,
    questionToDelete,     setQuestionToDelete,
    dbCategories,
    generationLog,
    isBulkDeleteModalOpen, setBulkDeleteModalOpen,
    openView, openEdit,
    handleGenerate,
    handleSave,
    handleDelete,
    handleStatusCycle,
    handleSelection,
    handleSelectAll,
    handleBulkVerify,
    handleBulkPend,
    handleBulkDelete,
    confirmBulkDelete,
    loadQuestions,
    loadGenerationLog,
  } = useQuestionBank();

  const {
    isUploading,
    importResult,
    handleCSVUpload,
    handleResetImport,
  } = useCSVImport({ onImportSuccess: loadQuestions });

  return (
    <>
      <div className="bp-root">
        <div className="bp-inner">

          {/* ── Header ── */}
          <div className="bp-header">
            <div>
              <h1 className="bp-title">{t("title")}</h1>
              <p className="bp-subtitle">{t("subtitle")}</p>
            </div>
            <button className="bp-gen-btn" onClick={() => setGenerateModalOpen(true)}>
              <Plus size={16} /> {t("generate_button")}
            </button>
          </div>

          {/* ── Stats Grid ── */}
          <div className="bp-stats">
            <div className="bp-stat">
              <div className="bp-stat-header">
                <span className="bp-stat-label">{t("stats_total")}</span>
                <span
                  className="bp-stat-badge"
                  style={{
                    background: stats.growthPercentage > 0 ? "#e0fbe0" : "#fee2e2",
                    color:      stats.growthPercentage > 0 ? "#16a34a" : "#b91c1c",
                  }}
                >
                  {stats.growthPercentage > 0
                    ? `+${stats.growthPercentage}%`
                    : `${stats.growthPercentage}%`}
                </span>
              </div>
              <div className="bp-stat-value">{stats.totalQuestions}</div>
            </div>

            <div className="bp-stat">
              <div className="bp-stat-header">
                <span className="bp-stat-label">{t("stats_verified")}</span>
                <span className="bp-stat-icon verified"><ShieldCheck size={20} /></span>
              </div>
              <div className="bp-stat-value">{stats.verifiedCount}</div>
              <div className="bp-stat-bar-track">
                <div
                  className="bp-stat-bar-fill"
                  style={{ width: `${stats.verifiedPercentage}%`, backgroundColor: "#16a34a" }}
                />
              </div>
            </div>

            <div className="bp-stat">
              <div className="bp-stat-header">
                <span className="bp-stat-label">{t("stats_drafts")}</span>
                <span className="bp-stat-icon"><FileEdit size={20} /></span>
              </div>
              <div className="bp-stat-value">{stats.draftCount}</div>
            </div>

            <div className="bp-stat">
              <div className="bp-stat-header">
                <span className="bp-stat-label">{t("stats_unverified")}</span>
                <span className="bp-stat-icon alert"><AlertCircle size={20} /></span>
              </div>
              <div className="bp-stat-value">{stats.unverifiedCount}</div>
            </div>
          </div>

          {/* ── Toolbar de Filtros ── */}
          <div className="bp-toolbar">
            <div className="bp-toolbar-top">
              <div className="bp-search-label">{t("toolbar_search_label")}</div>
            </div>
            <div className="bp-search-row">
              <div className="bp-search-box">
                <Search size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
                <input
                  placeholder={t("toolbar_search_placeholder")}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); }}
                />
              </div>
              <div className="bp-selects">
                <div className="bp-sel-group">
                  <span className="bp-sel-label">{t("toolbar_category_label")}</span>
                  <CategoryDropdown
                    value={category}
                    onChange={setCategory}
                    categories={dbCategories}
                    allLabel={t("all_categories")}
                  />
                </div>
                <div className="bp-sel-group">
                  <span className="bp-sel-label">{t("toolbar_difficulty_label")}</span>
                  <select
                    className="bp-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="all_difficulties">{t("all_difficulties")}</option>
                    {DIFFICULTIES_KEYS.map(d => <option key={d} value={d}>{t(d)}</option>)}
                  </select>
                </div>
                <div className="bp-sel-group">
                  <span className="bp-sel-label">{t("toolbar_status_label")}</span>
                  <select
                    className="bp-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all_statuses">{t("all_statuses")}</option>
                    <option value="status_verified">{t("status_verified")}</option>
                    <option value="status_unverified">{t("status_unverified")}</option>
                    <option value="status_draft">{t("status_draft")}</option>
                  </select>
                </div>
                <div className="bp-sel-group">
                  <span className="bp-sel-label">{t("toolbar_language_label")}</span>
                  <select
                    className="bp-select"
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                  >
                    <option value="all_languages">{t("all_languages")}</option>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bulk Actions Panel ── */}
          {selectedIds.length > 0 && (
            <div className="bp-bulk-actions">
              <span className="bp-bulk-count">{t("bulk_selected", { count: selectedIds.length })}</span>
              <div className="bp-bulk-buttons">
                <button onClick={handleBulkVerify} className="verify">
                  <ShieldCheck size={14} /> {t("bulk_verify")}
                </button>
                <div className="bp-divider" />
                <button onClick={handleBulkPend} className="pend">
                  <ShieldAlert size={14} /> {t("bulk_pend")}
                </button>
                <button onClick={handleBulkDelete} className="danger">
                  <Trash2 size={14} /> {t("bulk_delete")}
                </button>
              </div>
            </div>
          )}

          {/* ── Table ── */}
          <div className="bp-table-card">
            <div className="bp-table-scroll-container">
                <table>
                    <thead>
                        <tr>
                        <th className="bp-th check">
                            <input type="checkbox" onChange={handleSelectAll} checked={isAllVisibleSelected} />
                        </th>
                        <th className="bp-th">{t("table_header_id")}</th>
                        <th className="bp-th">{t("table_header_question")}</th>
                        <th className="bp-th">{t("table_header_category")}</th>
                        <th className="bp-th">{t("table_header_difficulty")}</th>
                        <th className="bp-th status">{t("table_header_status")}</th>
                        <th className="bp-th actions">{t("table_header_actions")}</th>
                        </tr>
                    </thead>
                    <tbody className="bp-tbody">
                        {paged.length === 0 ? (
                        <tr className="bp-tr">
                            <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                            {t("table_empty_state")}
                            </td>
                        </tr>
                        ) : paged.map((q) => {
                        const ds         = diffColor(t(q.difficulty), t);
                        const isSelected = selectedIds.includes(q.id);
                        return (
                            <tr key={q.id} className={`bp-tr${isSelected ? " selected" : ""}`}>
                            <td className="bp-td check">
                                <input type="checkbox" checked={isSelected} onChange={() => handleSelection(q.id)} />
                            </td>
                            <td className="bp-td"><span className="bp-q-num">{q.id}</span></td>
                            <td className="bp-td"><div className="bp-q-text">{q.text}</div></td>
                            <td className="bp-td">
                                <span className="bp-cat">{catIcon(q.category)} {q.category}</span>
                            </td>
                            <td className="bp-td">
                                <span className="bp-diff-badge" style={{ background: ds.bg, color: ds.color }}>
                                {t(q.difficulty)}
                                </span>
                            </td>
                            <td className="bp-td status">
                                <StatusToggle statusKey={q.status} onClick={() => handleStatusCycle(q.id)} t={t} />
                            </td>
                            <td className="bp-td">
                                <div className="bp-actions">
                                <button className="bp-act-btn view"  onClick={() => openView(q)}   title={t("action_view")}>
                                    <Eye size={14} />
                                </button>
                                <button className="bp-act-btn edit"  onClick={() => openEdit(q)}   title={t("action_edit")}>
                                    <Pencil size={14} />
                                </button>
                                <button className="bp-act-btn del"   onClick={() => setQuestionToDelete(q)} title={t("action_delete")}>
                                    <Trash2 size={14} />
                                </button>
                                </div>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>
            {/* ── Paginación ── */}
            <div className="bp-pag-row">
                <span className="bp-pag-info">
                    {t("pagination_info", {
                    start: totalCount === 0 ? 0 : (safePage - 1) * 10 + 1,
                    end:   Math.min(safePage * 10, totalCount),
                    total: totalCount,
                    })}
                </span>
                <div className="bp-pages">
                    <button className="bp-page-btn nav" onClick={() => goPage(safePage - 1)} disabled={safePage === 1}>
                    <ChevronLeft size={15} />
                    </button>
                    {pageNums().map((n, i) =>
                    n === "..." ? (
                        <span key={i} className="bp-page-dots">…</span>
                    ) : (
                        <button
                        key={i}
                        className={`bp-page-btn num${n === safePage ? " active" : ""}`}
                        onClick={() => goPage(n)}
                        >
                        {n}
                        </button>
                    )
                    )}
                    <button className="bp-page-btn nav" onClick={() => goPage(safePage + 1)} disabled={safePage === totalPages}>
                    <ChevronRight size={15} />
                    </button>
                </div>
            </div>
          </div>

          {/* ── Bottom: Log de Generación e Insights ── */}
          <div className="bp-bottom">
            <div className="bp-card">
              <div className="bp-card-header">
                <span className="bp-card-title">{t("recent_title")}</span>
                <button
                  className="bp-card-refresh"
                  onClick={loadGenerationLog}
                  title={t("refresh") ?? "Actualizar"}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              {generationLog.length === 0 ? (
                <div className="bp-recent-empty">{t("log_empty")}</div>
              ) : generationLog.map((r) => {
                const isCSV = r.type === "CSV";
                return (
                  <div key={r.id} className="bp-recent-item">
                    <div className="bp-recent-left">
                      <div className="bp-recent-icon" style={{ background: isCSV ? "#f0fdf422" : "#3b6cf822" }}>
                        {isCSV
                          ? <FileSpreadsheet size={17} style={{ color: "#16a34a" }} />
                          : <Zap size={17} style={{ color: "#3b6cf8" }} />
                        }
                      </div>
                      <div>
                        <div className="bp-recent-label">
                          {isCSV ? (r.archivo_nombre ?? "—") : (r.categoria_nombre ?? "—")}
                        </div>
                        <div className="bp-recent-sub">
                          {t("log_questions_generated", { count: r.preguntas_generadas })}
                          {" · "}{r.idioma?.toUpperCase()}
                          {isCSV && " · CSV"}
                        </div>
                      </div>
                    </div>
                    <div className="bp-recent-time">{timeAgo(t, r.fecha_generacion)}</div>
                  </div>
                );
              })}
            </div>

            <div className="bp-csv-card">
              <h2 className="bp-csv-title">{tCsv("csv_import_title")}</h2>
              <p className="bp-csv-sub">{tCsv("csv_import_subtitle")}</p>

              <div
                className={`bp-csv-drop${isUploading ? " loading" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isUploading) handleCSVUpload(e.dataTransfer.files[0]);
                }}
              >
                {isUploading ? (
                  <div className="bp-csv-uploading">
                    <div className="bp-csv-spinner" />
                    <span>Importando...</span>
                  </div>
                ) : (
                  <>
                    <div className="bp-csv-drop-icon"><Upload size={22} /></div>
                    <div className="bp-csv-drop-title">{tCsv("csv_dropzone_title")}</div>
                    <div className="bp-csv-drop-hint">{tCsv("csv_dropzone_hint")}</div>
                    <label className="bp-csv-select-btn">
                      {tCsv("csv_select_file")}
                      <input
                        type="file"
                        accept=".csv"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) { handleCSVUpload(file); e.target.value = ""; }
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              {importResult && (
                <div className={`bp-csv-result${importResult.importadas === 0 ? " error" : ""}`}>
                  <div className="bp-csv-result-left">
                    <FileSpreadsheet size={16} />
                    <div>
                      <div className="bp-csv-result-name">{importResult.fileName}</div>
                      <div className="bp-csv-result-meta">
                        {importResult.importadas} pregunta{importResult.importadas !== 1 ? "s" : ""} importada{importResult.importadas !== 1 ? "s" : ""}
                        {importResult.errores > 0 && ` · ${importResult.errores} error${importResult.errores !== 1 ? "es" : ""}`}
                      </div>
                    </div>
                  </div>
                  <button className="bp-csv-result-close" onClick={handleResetImport} title="Cerrar">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Consejo Pro ── */}
          <div className="bp-csv-pro bp-pro-standalone">
            <div className="bp-csv-pro-title">{tCsv("pro_tip_title")}</div>
            <p className="bp-csv-pro-text">{tCsv("pro_tip_text")}</p>
            <div className="bp-csv-format-label">{tCsv("csv_format_label")}</div>
            <div className="bp-csv-format-code">
              pregunta, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, categoria, dificultad, idioma, explicacion_correcta, explicacion_incorrecta
            </div>
            <div className="bp-csv-format-hint">{tCsv("csv_format_hint")}</div>
            <button className="bp-csv-download-btn" onClick={downloadCSVTemplate}>
              <Download size={14} /> {tCsv("pro_tip_link")}
            </button>
          </div>

        </div>
      </div>

      {/* ── Modales ── */}
      <DeleteConfirmModal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={() => handleDelete(questionToDelete.id)}
        t={t}
      />
      <BulkDeleteConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        t={t}
      />
      <GenerateModal
        isOpen={isGenerateModalOpen}
        onClose={() => { setGenerateModalOpen(false); setGenerateError(null); }}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        generateError={generateError}
        categories={dbCategories}
        t={t}
      />
      <EditModal
        isOpen={!!editQuestion}
        question={editQuestion}
        onClose={() => setEditQuestion(null)}
        onSave={handleSave}
        dbCategories={dbCategories}
        t={t}
      />
      <ViewModal
        isOpen={!!viewQuestion}
        question={viewQuestion}
        onClose={() => setViewQuestion(null)}
        t={t}
      />
    </>
  );
}
