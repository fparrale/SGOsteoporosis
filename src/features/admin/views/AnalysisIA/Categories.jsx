import { useTranslation }  from "react-i18next";
import { Plus, Search, ArrowUpDown, Pencil, Trash2, Sparkles, Lightbulb, FileText, BookOpen } from "lucide-react";
import './Categories.css';
import { useCategories }   from "../../hooks/useCategories";    // ← toda la lógica
import { ICON_MAP }        from "../../constants/categoriesConstants"; // ← solo el mapa de íconos
import {
  CategoryFormModal, SuggestionsModal,
  ConfirmModal, ConfirmDeleteModal,
} from "../../modals/ModalCategories";

export default function GestionCategorias() {
  const { t } = useTranslation("categories");
  const {
    filtered, search, setSearch, sortOrder, setSortOrder,
    sugerencias, agregadas, loadingSug,
    form, setForm, editTarget,
    showModal, setShowModal,
    showSugModal, setShowSugModal,
    showConfirmModal, setShowConfirmModal,
    showDeleteModal, setShowDeleteModal,
    itemToAdd, itemToDelete,
    openNew, openEdit, handleSave,
    askDelete, confirmDelete,
    handleAgregar, confirmAgregar, handleNuevaSugerencia,
  } = useCategories();

  return (
    <>
      <div className="gc-root">
        <div className="gc-inner">

          {/* Header */}
          <div className="gc-header">
            <div className="gc-header-text">
              <h1 className="gc-title">{t("title")}</h1>
              <p className="gc-subtitle">{t("subtitle")}</p>
            </div>
            <div className="gc-header-actions">
              <button className="gc-sug-btn" onClick={() => setShowSugModal(true)}>
                <Sparkles size={15} /> <span>{t("sug_button")}</span>
              </button>
              <button className="gc-new-btn" onClick={openNew}>
                <Plus size={16} /> <span>{t("new_button")}</span>
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="gc-search-wrap">
            <Search size={16} className="gc-search-icon" />
            <input
              className="gc-search-input"
              placeholder={t("search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="gc-divider-v" />
            <ArrowUpDown size={14} className="gc-search-icon" style={{ flexShrink: 0 }} />
            <select
              className="gc-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="none">{t("sort_none")}</option>
              <option value="desc">{t("sort_desc")}</option>
              <option value="asc">{t("sort_asc")}</option>
            </select>
          </div>

          {/* Lista */}
          <div className="gc-list-wrap">
            <div className="gc-list">
              {filtered.length === 0 ? (
                <div className="gc-empty">{t("empty_state")}</div>
              ) : (
                filtered.map((cat) => {
                  const Icon = ICON_MAP[cat.icon] || BookOpen;
                  return (
                    <div key={cat.id} className="gc-row">
                      <div className="gc-row-icon"><Icon size={20} /></div>
                      <div className="gc-row-info">
                        <div className="gc-row-name">{cat.name}</div>
                        <div className="gc-row-id"><FileText size={11} /> ID: {cat.id}</div>
                        {cat.description && <div className="gc-row-desc">{cat.description}</div>}
                      </div>
                      <div className="gc-row-count">
                        <span className="gc-count-num">{cat.questions}</span>
                        <span className="gc-count-label">{t("questions_label")}</span>
                      </div>
                      <div className="gc-row-actions">
                        <button className="gc-action-btn edit" onClick={() => openEdit(cat)}><Pencil size={14} /></button>
                        <button className="gc-action-btn del"  onClick={() => askDelete(cat)}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tip cards */}
          <div className="gc-bottom">
            <div className="gc-tip-card dark">
              <div className="gc-tip-icon"><Sparkles size={18} /></div>
              <div>
                <div className="gc-tip-label">{t("tip_ia_title")}</div>
                <div className="gc-tip-title">{t("tip_ia_subtitle")}</div>
                <p className="gc-tip-text">{t("tip_ia_text")}</p>
              </div>
            </div>
            <div className="gc-tip-card light">
              <div className="gc-tip-icon"><Lightbulb size={18} /></div>
              <div>
                <div className="gc-tip-label">{t("tip_pro_title")}</div>
                <div className="gc-tip-title">{t("tip_pro_subtitle")}</div>
                <p className="gc-tip-text">{t("tip_pro_text")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showModal && (
        <CategoryFormModal editTarget={editTarget} form={form} setForm={setForm}
          onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
      {showSugModal && (
        <SuggestionsModal sugerencias={sugerencias} agregadas={agregadas} loadingSug={loadingSug}
          onAgregar={handleAgregar} onNuevaSugerencia={handleNuevaSugerencia}
          onClose={() => setShowSugModal(false)} />
      )}
      {showConfirmModal && (
        <ConfirmModal itemToAdd={itemToAdd} onConfirm={confirmAgregar}
          onClose={() => { setShowConfirmModal(false); }} />
      )}
      {showDeleteModal && (
        <ConfirmDeleteModal itemToDelete={itemToDelete} onConfirm={confirmDelete}
          onClose={() => { setShowDeleteModal(false); }} />
      )}
    </>
  );
}