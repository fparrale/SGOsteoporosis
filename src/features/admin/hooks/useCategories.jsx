import { useCallback, useEffect, useState } from "react";
import { useTranslation }                   from "react-i18next";
import Alert                                from "../../../components/ui/Alert";
import { filterCategories, validateCategoryForm } from "../services/CategoriesServices.jsx";
import {
  fetchCategoriesWithCount,
  createCategory,
  updateCategory,
  deleteCategory,
  suggestCategories,
  fetchStoredSuggestions,
} from "../services/IAConfigServices.jsx";

const EMPTY_FORM = { name: "", icon: "heart_pulse", description: "" };

// Convierte una fila de BD al shape que usa la vista
function mapCategory(c) {
  return {
    id:          c.id,
    codigo:      c.codigo ?? "",
    name:        c.nombre,
    icon:        c.icono  ?? "book",
    description: c.descripcion ?? "",
    questions:   Number(c.question_count ?? 0),
  };
}

export function useCategories() {
  const { t, i18n } = useTranslation("categories");

  // ── Estado principal ────────────────────────────────────────────────────
  const [categories, setCategories]             = useState([]);
  const [loading,    setLoading]                = useState(false);
  const [search,     setSearch]                 = useState("");
  const [sortOrder,  setSortOrder]              = useState("none");

  // Sugerencias IA: arranca vacío, se carga desde BD
  const [sugerencias, setSugerencias]           = useState([]);
  const [loadingSug,  setLoadingSug]            = useState(false);
  const [agregadas,   setAgregadas]             = useState([]);

  // ── Estado de UI (modales y formulario) ─────────────────────────────────
  const [showModal,        setShowModal]        = useState(false);
  const [showSugModal,     setShowSugModal]     = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [editTarget,       setEditTarget]       = useState(null);
  const [form,             setForm]             = useState(EMPTY_FORM);
  const [itemToAdd,        setItemToAdd]        = useState(null);
  const [itemToDelete,     setItemToDelete]     = useState(null);

  // ── Derivados ───────────────────────────────────────────────────────────
  const filteredBase = filterCategories(categories, search);
  const filtered = sortOrder === "none"
    ? filteredBase
    : [...filteredBase].sort((a, b) =>
        sortOrder === "desc" ? b.questions - a.questions : a.questions - b.questions
      );

  // ── Carga inicial desde BD ──────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchCategoriesWithCount();
      setCategories(rows.map(mapCategory));
    } catch {
      Alert.error(t("alert_load_error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // ── Carga de sugerencias desde BD (filtrada por idioma activo) ─────────
  const loadSuggestions = useCallback(async () => {
    setLoadingSug(true);
    try {
      const idioma = i18n.language?.startsWith("en") ? "en" : "es";
      const rows = await fetchStoredSuggestions(idioma);
      setSugerencias(rows);
      setAgregadas([]); // Los índices anteriores ya no aplican al cambiar el listado
    } catch {
      // silently fail — la lista simplemente queda vacía
    } finally {
      setLoadingSug(false);
    }
  }, [i18n.language]); // Se re-ejecuta cuando cambia el idioma

  useEffect(() => { loadSuggestions(); }, [loadSuggestions]);

  // ── Handlers: categoría manual ──────────────────────────────────────────
  const openNew = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat.id);
    setForm({ name: cat.name, icon: cat.icon, description: cat.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    const { valid, errorKey } = validateCategoryForm(form);
    if (!valid) { Alert.warning(t(errorKey)); return; }

    const payload = { nombre: form.name, descripcion: form.description, icono: form.icon };

    try {
      if (editTarget) {
        const saved = await updateCategory(editTarget, payload);
        setCategories(prev => prev.map(c =>
          c.id === editTarget ? { ...c, name: saved.nombre, icon: saved.icono, description: saved.descripcion ?? "" } : c
        ));
        Alert.success(t("alert_updated", { name: form.name }));
      } else {
        const saved = await createCategory(payload);
        setCategories(prev => [...prev, mapCategory({ ...saved, question_count: 0 })]);
        Alert.success(t("alert_created", { name: form.name }));
      }
      setShowModal(false);
    } catch (e) {
      Alert.error(e.message ?? t("alert_save_error"));
    }
  };

  const askDelete = (cat) => {
    setItemToDelete(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(itemToDelete.id);
      setCategories(prev => prev.filter(c => c.id !== itemToDelete.id));
      Alert.success(t("alert_deleted", { name: itemToDelete.name }));
    } catch (e) {
      Alert.error(e.message ?? t("alert_delete_error"));
    }
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // ── Handlers: sugerencias IA ────────────────────────────────────────────
  const handleAgregar = (sug, idx) => {
    if (agregadas.includes(idx)) return;
    setItemToAdd({ sug, idx });
    setShowConfirmModal(true);
  };

  const confirmAgregar = async () => {
    if (!itemToAdd) return;
    const { sug, idx } = itemToAdd;

    try {
      const saved = await createCategory({
        nombre:      sug.nombre,
        descripcion: sug.descripcion,
        icono:       sug.icono,
      });
      setAgregadas(prev => [...prev, idx]);
      setCategories(prev => [...prev, mapCategory({ ...saved, question_count: 0 })]);
      Alert.success(t("alert_sug_added", { name: sug.nombre }));
    } catch (e) {
      Alert.error(e.message ?? t("alert_save_error"));
    }

    setShowConfirmModal(false);
    setItemToAdd(null);
  };

  // Llama a la IA para generar nuevas sugerencias y las guarda en BD
  const handleNuevaSugerencia = async () => {
    if (loadingSug) return;
    setLoadingSug(true);
    try {
      const idioma = i18n.language?.startsWith("en") ? "en" : "es";
      const tema   = idioma === "en"
        ? "Osteoporosis prevention bone health education"
        : "Osteoporosis prevención salud ósea educación";
      const result = await suggestCategories({ tema, idioma });
      if (result.length > 0) {
        setSugerencias(result);
        setAgregadas([]);
        Alert.success(t("alert_suggestions_refreshed"));
      } else {
        Alert.warning(t("alert_no_more_suggestions"));
      }
    } catch (e) {
      Alert.error(e.message ?? t("alert_suggestions_error"));
    } finally {
      setLoadingSug(false);
    }
  };

  // ── API pública del hook ─────────────────────────────────────────────────
  return {
    // estado
    categories, filtered, search, setSearch, sortOrder, setSortOrder, loading,
    sugerencias, agregadas, loadingSug,
    form, setForm, editTarget,
    showModal, setShowModal,
    showSugModal, setShowSugModal,
    showConfirmModal, setShowConfirmModal,
    showDeleteModal, setShowDeleteModal,
    itemToAdd, itemToDelete,
    // handlers
    openNew, openEdit, handleSave,
    askDelete, confirmDelete,
    handleAgregar, confirmAgregar, handleNuevaSugerencia,
  };
}
