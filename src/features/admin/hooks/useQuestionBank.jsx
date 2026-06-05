// ─────────────────────────────────────────────
//  hooks/useQuestionBank.jsx
//  Toda la lógica, estados y handlers.
//  El componente View solo consume este hook.
// ─────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Alert from '../../../components/ui/Alert';
import { PAGE_SIZE, DB_TO_DIFF, DB_TO_STATUS, DIFF_TO_DB, STATUS_TO_DB } from "../constants/questionBankConstants";
import { fetchCategories, generateQuestions, fetchQuestions, fetchQuestion, updateQuestion, deleteQuestion, fetchGenerationLog } from "../services/IAConfigServices.jsx";

// Convierte una fila de la BD al shape que usa el componente
function mapQuestion(q) {
  return {
    id:                   q.id,
    text:                 q.pregunta,
    category:             q.categoria_nombre ?? "",
    category_id:          q.categoria_id,
    difficulty:           DB_TO_DIFF[q.dificultad]  ?? "difficulty_basic",
    status:               DB_TO_STATUS[q.estado]    ?? "status_draft",
    idioma:               q.idioma                  ?? "es",
    explanationCorrect:   q.explicacion_correcta    ?? "",
    explanationIncorrect: q.explicacion_incorrecta  ?? "",
    sourceRef:            q.fuente_referencia       ?? "",
  };
}

// Convierte fila con opciones al shape completo que usan los modales
function mapFullQuestion(q) {
  const opciones = q.opciones ?? [];
  const options = opciones.map(o => o.texto_opcion);
  const correctOption = opciones.findIndex(o => Number(o.es_correcta) === 1);
  return {
    ...mapQuestion(q),
    options,
    correctOption: correctOption === -1 ? 0 : correctOption,
  };
}

export function useQuestionBank() {
  const { t } = useTranslation("question");

  // ── Estado principal ──────────────────────
  const [questions,    setQuestions]    = useState([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [stats,        setStats]        = useState({
    totalQuestions: 0, verifiedCount: 0, draftCount: 0,
    unverifiedCount: 0, verifiedPercentage: 0, growthPercentage: 0,
  });
  const [loading,      setLoading]      = useState(false);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("all_categories");
  const [difficulty,   setDifficulty]   = useState("all_difficulties");
  const [statusFilter, setStatusFilter] = useState("all_statuses");
  const [languageFilter, setLanguageFilter] = useState("all_languages");
  const [page,         setPage]         = useState(1);
  const [selectedIds,  setSelectedIds]  = useState([]);

  // ── Búsqueda con debounce (400 ms) ───────
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Categorías desde BD ───────────────────
  const [dbCategories, setDbCategories] = useState([]);
  useEffect(() => {
    fetchCategories().then(setDbCategories).catch(() => {});
  }, []);

  // ── Log de generación IA ──────────────────
  const [generationLog, setGenerationLog] = useState([]);
  const loadGenerationLog = useCallback(async () => {
    fetchGenerationLog().then(setGenerationLog).catch(() => {});
  }, []);
  useEffect(() => { loadGenerationLog(); }, [loadGenerationLog]);

  // ── Estado de modales ─────────────────────
  const [isGenerateModalOpen,   setGenerateModalOpen]   = useState(false);
  const [isGenerating,          setGenerating]          = useState(false);
  const [generateError,         setGenerateError]       = useState(null);
  const [editQuestion,          setEditQuestion]        = useState(null);
  const [viewQuestion,          setViewQuestion]        = useState(null);
  const [questionToDelete,      setQuestionToDelete]    = useState(null);
  const [isBulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // ── Carga server-side (paginada + filtrada) ──
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const catId = category !== "all_categories"
        ? dbCategories.find(c => c.nombre === category)?.id
        : undefined;

      const result = await fetchQuestions({
        page,
        limit: PAGE_SIZE,
        ...(debouncedSearch                        ? { search:       debouncedSearch }                   : {}),
        ...(catId                                  ? { categoria_id: catId }                             : {}),
        ...(difficulty    !== "all_difficulties"   ? { dificultad:   DIFF_TO_DB[difficulty] }            : {}),
        ...(statusFilter  !== "all_statuses"       ? { estado:       STATUS_TO_DB[statusFilter] }        : {}),
        ...(languageFilter !== "all_languages"     ? { idioma:       languageFilter }                    : {}),
      });

      setQuestions((result.data ?? []).map(mapQuestion));
      setTotalCount(result.total ?? 0);

      const s = result.stats ?? {};
      setStats({
        totalQuestions:     s.total      ?? 0,
        verifiedCount:      s.verified   ?? 0,
        draftCount:         s.draft      ?? 0,
        unverifiedCount:    s.unverified ?? 0,
        verifiedPercentage: s.total > 0 ? (s.verified / s.total) * 100 : 0,
        growthPercentage:   0,
      });
    } catch {
      Alert.error(t("alert_load_error"));
    } finally {
      setLoading(false);
    }
  }, [t, page, debouncedSearch, category, difficulty, statusFilter, languageFilter, dbCategories]);

  // Dispara la carga cuando cambia cualquier parámetro
  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  // Resetea a página 1 cuando cambia cualquier filtro (no la página misma)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, difficulty, statusFilter, languageFilter]);

  // ── Paginación ────────────────────────────
  const totalPages           = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage             = Math.min(page, totalPages);
  // paged = questions (ya vienen paginadas del servidor)
  const paged                = questions;
  const isAllVisibleSelected = paged.length > 0 && paged.every(q => selectedIds.includes(q.id));

  const goPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const pageNums = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [1];
    if (safePage > 3) pages.push("...");
    for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  // ── Handlers de generación IA ─────────────
  const handleGenerate = useCallback(async ({ selectedCategory, selectedDifficulty, quantity, language }) => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateQuestions({
        categoria_id: selectedCategory,
        dificultad:   DIFF_TO_DB[selectedDifficulty] ?? selectedDifficulty,
        cantidad:     quantity,
        idioma:       language,
      });
      setGenerateModalOpen(false);
      setGenerateError(null);
      if (result.errores > 0 && result.preguntas_generadas === 0) {
        Alert.error(t("alert_generated_error"));
      } else if (result.errores > 0) {
        Alert.warning(t("alert_generated_partial", { count: result.preguntas_generadas, errors: result.errores }));
      } else {
        Alert.success(t("alert_generated_success", { count: result.preguntas_generadas }));
      }
      await loadQuestions();
      await loadGenerationLog();
    } catch (e) {
      const msg = e.message ?? "";
      const isTokenError = msg.includes("truncada") || msg.includes("max_tokens");
      setGenerateError({ type: isTokenError ? "token" : "generic", message: msg });
    } finally {
      setGenerating(false);
    }
  }, [t, loadQuestions, loadGenerationLog]);

  const openView = async (q) => {
    try {
      const full = await fetchQuestion(q.id);
      setViewQuestion(mapFullQuestion(full));
    } catch {
      Alert.error(t("alert_load_error"));
    }
  };

  const openEdit = async (q) => {
    try {
      const full = await fetchQuestion(q.id);
      setEditQuestion(mapFullQuestion(full));
    } catch {
      Alert.error(t("alert_load_error"));
    }
  };

  const handleSave = async (updated) => {
    try {
      const opciones = (updated.options ?? []).map((texto, idx) => ({
        texto_opcion: texto,
        es_correcta:  idx === updated.correctOption,
      }));
      await updateQuestion(updated.id, {
        pregunta:               updated.text,
        dificultad:             DIFF_TO_DB[updated.difficulty]  ?? "intermedio",
        estado:                 STATUS_TO_DB[updated.status]    ?? "borrador",
        idioma:                 updated.idioma                  ?? "es",
        explicacion_correcta:   updated.explanationCorrect      ?? null,
        explicacion_incorrecta: updated.explanationIncorrect    ?? null,
        fuente_referencia:      updated.sourceRef               ?? null,
        opciones,
      });
      setQuestions(prev => prev.map(q => q.id === updated.id ? {
        ...q,
        text:                 updated.text,
        difficulty:           updated.difficulty,
        status:               updated.status,
        explanationCorrect:   updated.explanationCorrect,
        explanationIncorrect: updated.explanationIncorrect,
      } : q));
      setEditQuestion(null);
      Alert.success(t("alert_saved_success"));
    } catch (e) {
      Alert.error(e.message ?? t("alert_save_error"));
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      setTotalCount(prev => Math.max(0, prev - 1));
      setQuestionToDelete(null);
      Alert.success(t("alert_deleted_success"));
    } catch (e) {
      Alert.error(e.message ?? t("alert_delete_error"));
    }
  };

  const handleStatusCycle = useCallback(async (id) => {
    const statusOrder = ["status_draft", "status_unverified", "status_verified"];
    const q = questions.find(q => q.id === id);
    if (!q) return;

    const nextIndex  = (statusOrder.indexOf(q.status) + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    // Optimistic update
    setQuestions(qs => qs.map(qq => qq.id === id ? { ...qq, status: nextStatus } : qq));

    try {
      await updateQuestion(id, {
        pregunta:               q.text,
        dificultad:             DIFF_TO_DB[q.difficulty]  ?? "intermedio",
        estado:                 STATUS_TO_DB[nextStatus],
        idioma:                 q.idioma                  ?? "es",
        explicacion_correcta:   q.explanationCorrect      ?? null,
        explicacion_incorrecta: q.explanationIncorrect    ?? null,
        fuente_referencia:      q.sourceRef               ?? null,
      });
    } catch {
      setQuestions(qs => qs.map(qq => qq.id === id ? { ...qq, status: q.status } : qq));
      Alert.error(t("alert_status_error"));
      return;
    }

    const key = {
      status_verified:   "alert_status_verified",
      status_unverified: "alert_status_unverified",
      status_draft:      "alert_status_draft",
    }[nextStatus];
    if (key) Alert.success(t(key));
  }, [questions, t]);

  // ── Selección y bulk actions ──────────────
  const handleSelection = (id) =>
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);

  const handleSelectAll = (e) =>
    setSelectedIds(e.target.checked ? paged.map(q => q.id) : []);

  const handleBulkVerify = async () => {
    try {
      await Promise.all(
        selectedIds.map(id => {
          const q = questions.find(q => q.id === id);
          return updateQuestion(id, {
            pregunta:               q.text,
            dificultad:             DIFF_TO_DB[q.difficulty]  ?? "intermedio",
            estado:                 "verificada",
            idioma:                 q.idioma                  ?? "es",
            explicacion_correcta:   q.explanationCorrect      ?? null,
            explicacion_incorrecta: q.explanationIncorrect    ?? null,
            fuente_referencia:      q.sourceRef               ?? null,
          });
        })
      );
      setQuestions(qs => qs.map(q => selectedIds.includes(q.id) ? { ...q, status: "status_verified" } : q));
      setSelectedIds([]);
      Alert.success(t("alert_bulk_verified_success"));
    } catch (e) {
      Alert.error(e.message ?? t("alert_save_error"));
    }
  };

  const handleBulkPend = async () => {
    try {
      await Promise.all(
        selectedIds.map(id => {
          const q = questions.find(q => q.id === id);
          return updateQuestion(id, {
            pregunta:               q.text,
            dificultad:             DIFF_TO_DB[q.difficulty]  ?? "intermedio",
            estado:                 "archivada",
            idioma:                 q.idioma                  ?? "es",
            explicacion_correcta:   q.explanationCorrect      ?? null,
            explicacion_incorrecta: q.explanationIncorrect    ?? null,
            fuente_referencia:      q.sourceRef               ?? null,
          });
        })
      );
      setQuestions(qs => qs.map(q => selectedIds.includes(q.id) ? { ...q, status: "status_unverified" } : q));
      setSelectedIds([]);
      Alert.warning(t("alert_bulk_pend_warning"));
    } catch (e) {
      Alert.error(e.message ?? t("alert_save_error"));
    }
  };

  const handleBulkDelete = () => setBulkDeleteModalOpen(true);

  const confirmBulkDelete = async () => {
    const draftIds = selectedIds.filter(
      id => questions.find(q => q.id === id)?.status === "status_draft"
    );
    try {
      await Promise.all(draftIds.map(id => deleteQuestion(id)));
      setQuestions(qs => qs.filter(q => !draftIds.includes(q.id)));
      setTotalCount(prev => Math.max(0, prev - draftIds.length));
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      Alert.success(t("alert_bulk_deleted_success"));
    } catch (e) {
      Alert.error(e.message ?? t("alert_delete_error"));
    }
  };

  // ── API pública del hook ──────────────────
  return {
    t,
    loading,
    // datos
    dbCategories,
    generationLog,
    questions,
    stats,
    totalCount,
    paged,
    totalPages,
    safePage,
    isAllVisibleSelected,
    selectedIds,
    // filtros
    search,        setSearch,
    category,      setCategory,
    difficulty,    setDifficulty,
    statusFilter,  setStatusFilter,
    languageFilter, setLanguageFilter,
    // paginación
    goPage,
    pageNums,
    // modales
    isGenerateModalOpen,  setGenerateModalOpen,
    isGenerating,
    generateError,        setGenerateError,
    editQuestion,         setEditQuestion,
    viewQuestion,         setViewQuestion,
    questionToDelete,     setQuestionToDelete,
    isBulkDeleteModalOpen, setBulkDeleteModalOpen,
    // carga
    loadQuestions,
    loadGenerationLog,
    // handlers
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
  };
}
