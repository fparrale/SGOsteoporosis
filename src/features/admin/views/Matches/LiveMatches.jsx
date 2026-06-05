import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import './LiveMatches.css';
import Loader from "../../../../components/ui/Loader";
import Alert from "../../../../components/ui/Alert";
import {
  Plus, Search, ChevronDown, SlidersHorizontal,
  Users, Languages, Pencil, Trash2,
  Pause, Play, Lock, X, Globe, CheckSquare, Square,
  Copy, Check, BarChart, RefreshCw, Clock, Heart, AlertTriangle, Zap,
} from "lucide-react";

import {
  fetchMatches, createMatch, updateMatch,
  deleteMatch, toggleMatch, fetchCategories, fetchQuestionCount,
} from "../../services/MatchService";
import { fetchTournamentConfig } from "../../services/GameConfigService";

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIFFICULTIES_KEYS = ["very_easy", "easy", "intermediate", "hard", "very_hard"];

const statusStyle = {
  activa:     { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  pausada:    { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  finalizada: { bg: "#f8fafc", color: "#64748b", dot: "#94a3b8" },
};

const LANG_LIST = ["Español", "English"];

const GLOBAL_LIVES_DISPLAY = {
  lives_unlimited:      "∞",
  lives_one_hard:       "1",
  lives_two:            "2",
  lives_three_standard: "3",
  lives_five_easy:      "5",
};

const EMPTY_FORM = {
  name: "", desc: "", maxPlayers: 32, language: "Español",
  filterCats: false, categories: [], filterDiff: false, difficulty: "intermediate",
  questionsOverride: null, timeOverride: null, livesOverride: null,
};

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function CopyableID({ id, pin, isFinished }) {
  const { t } = useTranslation("room");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (isFinished) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`lm-card-id${copied ? " copied" : ""}`}
      onClick={handleCopy}
      disabled={isFinished}
      title={isFinished ? "" : `Código: #${id} · Click para copiar`}
    >
      #{id}
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

function StatusBadge({ status }) {
  const { t } = useTranslation("room");
  const s = statusStyle[status] || statusStyle["finalizada"];
  return (
    <span className="lm-status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="lm-status-dot" style={{ background: s.dot }} />
      {t(`status_${status}`)}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function RoomModal({ room, categoriesList, globalConfig, onClose, onSave, saving }) {
  const { t } = useTranslation("room");
  const isEdit = Boolean(room?.dbId);
  const [form, setForm] = useState(room ? { ...EMPTY_FORM, ...room } : { ...EMPTY_FORM });
  const [qCount, setQCount]   = useState(null);
  const [qLoading, setQLd]    = useState(false);

  const DIFFICULTIES = DIFFICULTIES_KEYS.map((key) => ({
    key,
    label: t(`difficulty_${key}`),
  }));

  // ── Conteo de preguntas disponibles (idioma siempre aplicado + filtros opcionales)
  useEffect(() => {
    const tid = setTimeout(async () => {
      setQLd(true);
      try {
        const count = await fetchQuestionCount({
          language:   form.language,
          filterDiff: form.filterDiff,
          difficulty: form.difficulty,
          filterCats: form.filterCats,
          categories: form.categories,
        });
        setQCount(count);
      } catch {
        setQCount(null);
      } finally {
        setQLd(false);
      }
    }, 450);
    return () => clearTimeout(tid);
  }, [form.language, form.filterDiff, form.difficulty, form.filterCats, form.categories]);

  const effectiveQuestions =
    form.questionsOverride !== null && form.questionsOverride !== ""
      ? (parseInt(form.questionsOverride) || 10)
      : (globalConfig?.questions ?? 10);

  // Bloquea guardar cuando las preguntas verificadas son insuficientes
  const isBlocked = !qLoading && qCount !== null && qCount < effectiveQuestions;

  const globalLivesHint = globalConfig
    ? (GLOBAL_LIVES_DISPLAY[globalConfig.lives] ?? "3")
    : "3";

  const toggleCat = (cat) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));

  const toggleAllCats = (on) =>
    setForm((f) => ({
      ...f,
      categories: on ? categoriesList.map((c) => c.nombre) : [],
    }));

  // Convierte el form a payload limpio para el backend
  const buildPayload = () => ({
    ...form,
    questionsOverride: form.questionsOverride !== "" && form.questionsOverride !== null
      ? parseInt(form.questionsOverride) : null,
    timeOverride: form.timeOverride !== "" && form.timeOverride !== null
      ? parseInt(form.timeOverride) : null,
    livesOverride: form.livesOverride !== "" && form.livesOverride !== null
      ? parseInt(form.livesOverride) : null,
  });

  return (
    <div className="lm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lm-modal">
        <div className="lm-modal-header">
          <span className="lm-modal-title">
            {isEdit ? t("modal_edit_title") : t("modal_new_title")}
          </span>
          <button className="lm-modal-close" onClick={onClose}><X size={17} /></button>
        </div>

        <div className="lm-modal-body">

          {/* ── Nombre ─────────────────────────────────────────── */}
          <div className="lm-field">
            <label className="lm-field-label">{t("modal_name_label")}</label>
            <input
              className="lm-input"
              placeholder={t("modal_name_placeholder")}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* ── Descripción ─────────────────────────────────────── */}
          <div className="lm-field">
            <label className="lm-field-label">
              {t("modal_description_label")}{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                {t("modal_description_optional_label")}
              </span>
            </label>
            <textarea
              className="lm-textarea"
              placeholder={t("modal_description_placeholder")}
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
            />
          </div>

          {/* ── Max jugadores + Idioma ──────────────────────────── */}
          <div className="lm-row-2">
            <div className="lm-field">
              <label className="lm-field-label">{t("modal_max_players_label")}</label>
              <div className="lm-num-wrap">
                <span className="lm-num-icon"><Users size={15} /></span>
                <input
                  className="lm-num-input"
                  type="number" min={2} max={50}
                  value={form.maxPlayers}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 2;
                    setForm({ ...form, maxPlayers: Math.max(2, Math.min(50, v)) });
                  }}
                />
              </div>
              <span className="lm-field-hint">{t("modal_max_players_range")}</span>
            </div>
            <div className="lm-field">
              <label className="lm-field-label">{t("modal_language_label")}</label>
              <div className="lm-input-icon-wrap">
                <span className="lm-input-icon-left"><Globe size={15} /></span>
                <select
                  className="lm-field-sel"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  {LANG_LIST.map((l) => <option key={l}>{l}</option>)}
                </select>
                <span className="lm-input-icon-right"><ChevronDown size={14} /></span>
              </div>
            </div>
          </div>

          {/* ── Separador — Configuración propia de la sala ─────── */}
          <div className="lm-section-sep">
            <span className="lm-section-sep-title">{t("modal_game_config_title")}</span>
            <span className="lm-section-sep-hint">{t("modal_game_config_subtitle")}</span>
          </div>

          {/* ── Overrides: preguntas + tiempo ──────────────────── */}
          <div className="lm-row-2">
            <div className="lm-field">
              <label className="lm-field-label">
                <Clock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {t("modal_questions_label")}
              </label>
              <input
                className="lm-input"
                type="number" min={4} max={90}
                placeholder={`${t("modal_global_hint", { value: globalConfig?.questions ?? 10 })}`}
                value={form.questionsOverride ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, questionsOverride: v === "" ? null : v }));
                }}
              />
              <span className="lm-field-hint">{t("modal_questions_range")}</span>
            </div>
            <div className="lm-field">
              <label className="lm-field-label">
                <Clock size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
                {t("modal_time_label")}
              </label>
              <input
                className="lm-input"
                type="number" min={5} max={120}
                placeholder={`${t("modal_global_hint", { value: `${globalConfig?.timePerQ ?? 30}s` })}`}
                value={form.timeOverride ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, timeOverride: v === "" ? null : v }));
                }}
              />
              <span className="lm-field-hint">{t("modal_seconds_range")}</span>
            </div>
          </div>

          {/* ── Override: vidas ─────────────────────────────────── */}
          <div className="lm-field">
            <label className="lm-field-label">
              <Heart size={13} style={{ marginRight: 5, verticalAlign: "middle" }} />
              {t("modal_lives_label")}
            </label>
            <div className="lm-input-icon-wrap">
              <select
                className="lm-field-sel"
                value={form.livesOverride?.toString() ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, livesOverride: v === "" ? null : parseInt(v) }));
                }}
              >
                <option value="">{t("modal_lives_use_global")} ({globalLivesHint})</option>
                <option value="0">∞ {t("modal_lives_unlimited")}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
              </select>
              <span className="lm-input-icon-right"><ChevronDown size={14} /></span>
            </div>
          </div>

          {/* ── Separador — Filtros ─────────────────────────────── */}
          <div className="lm-section-sep">
            <span className="lm-section-sep-title">{t("modal_filters_title")}</span>
            <span className="lm-section-sep-hint">{t("modal_filters_subtitle")}</span>
          </div>

          {/* ── Filtro por categorías ───────────────────────────── */}
          <div className="lm-field">
            <div className="lm-toggle-row">
              <div>
                <div className="lm-toggle-title">{t("modal_filter_by_categories_title")}</div>
                <div className="lm-toggle-sub">{t("modal_filter_by_categories_subtitle")}</div>
              </div>
              <label className="lm-switch">
                <input
                  type="checkbox"
                  checked={form.filterCats}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setForm((f) => ({ ...f, filterCats: on }));
                    toggleAllCats(e.target.checked);
                  }}
                />
                <div className="lm-sw-track" />
                <div className="lm-sw-thumb" />
              </label>
            </div>
            <div className={`lm-cats-grid${!form.filterCats ? " disabled" : ""}`}>
              {categoriesList.map((cat) => {
                const isSelected = form.categories.includes(cat.nombre);
                return (
                  <button
                    key={cat.id}
                    className={`lm-cat-btn${isSelected && form.filterCats ? " selected" : ""}`}
                    onClick={() => toggleCat(cat.nombre)}
                    disabled={!form.filterCats}
                  >
                    {isSelected && form.filterCats
                      ? <CheckSquare size={14} />
                      : <Square size={14} style={{ color: "#cbd5e1" }} />}
                    {cat.nombre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Filtro por dificultad ───────────────────────────── */}
          <div className="lm-field">
            <div className="lm-toggle-row">
              <div>
                <div className="lm-toggle-title">{t("modal_filter_by_difficulty_title")}</div>
                <div className="lm-toggle-sub">
                  {form.filterDiff
                    ? t("modal_filter_by_difficulty_subtitle")
                    : t("modal_gamification_mode_subtitle")}
                </div>
              </div>
              <label className="lm-switch">
                <input
                  type="checkbox"
                  checked={form.filterDiff}
                  onChange={(e) => setForm({ ...form, filterDiff: e.target.checked })}
                />
                <div className="lm-sw-track" />
                <div className="lm-sw-thumb" />
              </label>
            </div>
            {form.filterDiff ? (
              <div className="lm-diff-pills">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    className={`lm-diff-pill${form.difficulty === d.key ? " selected" : ""}`}
                    onClick={() => setForm({ ...form, difficulty: d.key })}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="lm-gamif-badge">
                <div className="lm-gamif-badge-title">
                  <Zap size={14} style={{ flexShrink: 0 }} />
                  {t("modal_gamification_badge_title")}
                </div>
                <p className="lm-gamif-badge-desc">{t("modal_gamification_badge_desc")}</p>
                {(() => {
                  const thr = Math.max(1, Math.ceil(effectiveQuestions / 5));
                  return (
                    <div className="lm-gamif-tiers">
                      <span className="lm-gamif-tier t0">{t("modal_gamification_tier_0")}</span>
                      <span className="lm-gamif-tier t1">{t("modal_gamification_tier_1", { from: thr + 1 })}</span>
                      <span className="lm-gamif-tier t2">{t("modal_gamification_tier_2", { from: thr * 2 + 1 })}</span>
                      <span className="lm-gamif-tier t3">{t("modal_gamification_tier_3", { from: thr * 3 + 1 })}</span>
                      <span className="lm-gamif-tier t4">{t("modal_gamification_tier_4", { from: thr * 4 + 1 })}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ── Indicador de preguntas disponibles (siempre filtra por idioma) ── */}
          {(qCount !== null || qLoading) && (
            <div className={`lm-q-count ${
              qLoading
                ? "checking"
                : qCount < effectiveQuestions
                ? "warning"
                : "ok"
            }`}>
              {qLoading ? (
                <span>{t("modal_q_count_checking")}</span>
              ) : qCount < effectiveQuestions ? (
                <>
                  <AlertTriangle size={14} />
                  <span>{t("modal_q_count_warning", { count: qCount, needed: effectiveQuestions })}</span>
                </>
              ) : (
                <span>{t("modal_q_count_ok", { count: qCount })}</span>
              )}
            </div>
          )}

        </div>{/* fin lm-modal-body */}

        <div className="lm-modal-footer">
          <button className="lm-btn-cancel" onClick={onClose} disabled={saving}>
            {t("modal_cancel_button")}
          </button>
          <button
            className={`lm-btn-save${isBlocked ? " blocked" : ""}`}
            disabled={saving || !form.name.trim() || isBlocked}
            title={isBlocked ? t("modal_q_count_block_hint") : ""}
            onClick={() => onSave(buildPayload())}
          >
            {saving
              ? t("saving") || "Guardando…"
              : isEdit ? t("modal_save_button") : t("modal_create_button")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function LiveMatches() {
  const { t } = useTranslation("room");
  const navigate = useNavigate();

  const [rooms,        setRooms]      = useState([]);
  const [categories,   setCategories] = useState([]);
  const [globalConfig, setGlobal]     = useState(null);
  const [loading,      setLoading]    = useState(true);
  const [saving,       setSaving]     = useState(false);
  const [search,       setSearch]     = useState("");
  const [statusFilter, setStatus]     = useState("all_states");
  const [langFilter,   setLang]       = useState("any");
  const [modal,        setModal]      = useState(null);

  const STATUS_OPTIONS = [
    { key: "all_states", label: t("all_states") },
    { key: "activa",     label: t("status_activa") },
    { key: "pausada",    label: t("status_pausada") },
    { key: "finalizada", label: t("status_finalizada") },
  ];

  const LANGUAGE_OPTIONS = [
    { key: "any",     label: t("any_language") },
    { key: "Español", label: "Español" },
    { key: "English", label: "English" },
  ];

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([fetchMatches(), fetchCategories(), fetchTournamentConfig()])
      .then(([r, c, cfg]) => { setRooms(r); setCategories(c); setGlobal(cfg); })
      .catch((e) => Alert.error(t("alert_room_error_load")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = rooms.filter((r) => {
    const q   = search.toLowerCase();
    const ms  = r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    const mst = statusFilter === "all_states" || r.status === statusFilter;
    const ml  = langFilter   === "any"        || r.language === langFilter;
    return ms && mst && ml;
  });

  const handleTogglePause = async (dbId) => {
    try {
      const updated = await toggleMatch(dbId);
      setRooms((prev) => prev.map((r) => r.dbId === dbId ? updated : r));
      const isPaused = updated.status === "pausada";
      Alert.success(t(isPaused ? "alert_room_paused" : "alert_room_resumed"));
    } catch (e) { Alert.error(t("alert_room_error_toggle")); }
  };

  const handleDelete = async (dbId) => {
    try {
      await deleteMatch(dbId);
      setRooms((prev) => prev.filter((r) => r.dbId !== dbId));
      Alert.success(t("alert_room_deleted"));
    } catch (e) { Alert.error(t("alert_room_error_delete")); }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        const updated = await updateMatch(modal.room.dbId, form);
        setRooms((prev) => prev.map((r) => r.dbId === modal.room.dbId ? updated : r));
        Alert.success(t("alert_room_updated"));
      } else {
        const created = await createMatch(form);
        setRooms((prev) => [created, ...prev]);
        Alert.success(t("alert_room_created"));
      }
      setModal(null);
    } catch (e) {
      Alert.error(t("alert_room_error_save"));
    } finally {
      setSaving(false);
    }
  };

  const goToStats = (dbId) => navigate(`/admin/matches/history?roomId=${dbId}`);

  if (loading) return <Loader loading content={t("loading")} />;

  return (
    <>
      <div className="lm-root">
        <div className="lm-inner">

          {/* Top bar */}
          <div className="lm-topbar">
            <div>
              <h1 className="lm-title">{t("title")}</h1>
              <p className="lm-sub">{t("subtitle")}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="lm-new-btn" style={{ background: "#f1f5f9", color: "#475569" }} onClick={load} title="Recargar">
                <RefreshCw size={15} />
              </button>
              <button className="lm-new-btn" onClick={() => setModal({ mode: "new" })}>
                <Plus size={16} /> {t("new_room_button")}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="lm-filters">
            <div className="lm-search-box">
              <Search size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input
                placeholder={t("search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="lm-sel-wrap">
              <select className="lm-sel" value={statusFilter} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <span className="lm-sel-icon"><ChevronDown size={14} /></span>
            </div>
            <div className="lm-sel-wrap">
              <select className="lm-sel" value={langFilter} onChange={(e) => setLang(e.target.value)}>
                {LANGUAGE_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <span className="lm-sel-icon"><ChevronDown size={14} /></span>
            </div>
            <button className="lm-filter-icon-btn"><SlidersHorizontal size={16} /></button>
          </div>

          {/* Grid */}
          <div className="lm-grid">
            {filtered.map((room) => {
              const isFinished = room.status === "finalizada";
              const isPaused   = room.status === "pausada";
              return (
                <div key={room.dbId} className={`lm-card${isFinished ? " finalizada" : ""}`}>
                  <div className="lm-card-top">
                    <CopyableID id={room.id} pin={room.pin} isFinished={isFinished} />
                    <StatusBadge status={room.status} />
                  </div>

                  <div className="lm-card-name">{room.name}</div>
                  <div className="lm-card-desc">{room.desc}</div>

                  <div className="lm-card-meta">
                    <div className="lm-meta-item">
                      <Users size={14} />
                      {room.currentPlayers}/{room.maxPlayers} {t("players_label") || "jugadores"}
                    </div>
                    <div className="lm-meta-item">
                      <Languages size={14} /> {room.language}
                    </div>
                  </div>

                  {room.categories.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {room.categories.slice(0, 3).map((c) => (
                        <span key={c} style={{ fontSize: 11, background: "#eff6ff", color: "#3b82f6", borderRadius: 99, padding: "2px 8px", fontWeight: 600 }}>
                          {c}
                        </span>
                      ))}
                      {room.categories.length > 3 && (
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>+{room.categories.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="lm-card-footer">
                    <div className="lm-footer-actions">
                      <button
                        className="lm-icon-btn"
                        onClick={() => setModal({ mode: "edit", room })}
                        disabled={isFinished}
                        title={t("edit_button")}
                      ><Pencil size={14} /></button>
                      <button
                        className="lm-icon-btn stats-icon"
                        onClick={() => goToStats(room.dbId)}
                        title={t("stats_button")}
                      ><BarChart size={14} /></button>
                      <button
                        className="lm-icon-btn del"
                        onClick={() => handleDelete(room.dbId)}
                        title={t("delete_button")}
                      ><Trash2 size={14} /></button>
                    </div>

                    {isFinished ? (
                      <span className="lm-action-btn finished-label">
                        <Lock size={14} /> {t("status_finalizada")}
                      </span>
                    ) : isPaused ? (
                      <button className="lm-action-btn resume" onClick={() => handleTogglePause(room.dbId)}>
                        <Play size={14} /> {t("resume_button")}
                      </button>
                    ) : (
                      <button className="lm-action-btn pause" onClick={() => handleTogglePause(room.dbId)}>
                        <Pause size={14} /> {t("pause_button")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Placeholder nueva sala */}
            <div className="lm-card-new" onClick={() => setModal({ mode: "new" })}>
              <div className="lm-card-new-circle"><Plus size={20} /></div>
              <div className="lm-card-new-label">{t("new_room_placeholder_title")}</div>
              <div className="lm-card-new-sub">{t("new_room_placeholder_subtitle")}</div>
            </div>
          </div>

        </div>
      </div>

      {modal && (
        <RoomModal
          room={modal.mode === "edit" ? modal.room : null}
          categoriesList={categories}
          globalConfig={globalConfig}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </>
  );
}
