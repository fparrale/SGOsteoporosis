import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, FileSpreadsheet, FileText,
  Users, Target, Trophy, BarChart3, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, ChevronDown, Search,
  Star, Medal, Zap, PieChart, Clock, Loader2,
} from "lucide-react";
import { exportPDF, exportExcel } from "./exportReporte";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart as RechartsPie, Pie, Cell, Legend,
} from "recharts";
import "./MatchHistory.css";
import Loader from "../../../../components/ui/Loader";

import { fetchMatchStats } from "../../services/MatchService";

const CAT_COLORS = ["#7c8ef8", "#a78bfa", "#34d399", "#fb923c", "#f43f5e", "#06b6d4"];


// ─── Subcomponentes ───────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, trend, color }) {
  return (
    <div className="rm-card">
      <div className="rm-card__icon" style={{ background: `${color}15`, color }}>
        <Icon size={20} />
      </div>
      <div className="rm-card__body">
        <span className="rm-card__label">{label}</span>
        <span className="rm-card__value">{value}</span>
        {sub && <span className="rm-card__sub">{sub}</span>}
        {trend !== undefined && (
          <span className={`rm-card__trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function CategoryBar({ name, precision, totalQuestions, correctAnswers }) {
  return (
    <div className="rm-cat-bar">
      <div className="rm-cat-bar__info">
        <span className="rm-cat-bar__name">{name}</span>
        <span className="rm-cat-bar__stat">
          {correctAnswers}/{totalQuestions} · {precision}%
        </span>
      </div>
      <div className="rm-cat-bar__track">
        <div className="rm-cat-bar__fill" style={{ width: `${precision}%` }} />
      </div>
    </div>
  );
}

function PlayerRow({ player, rank }) {
  const getMedal = (r) => {
    if (r === 1) return <Medal size={16} color="#f59e0b" />;
    if (r === 2) return <Medal size={16} color="#94a3b8" />;
    if (r === 3) return <Medal size={16} color="#cd7f32" />;
    return <span className="rm-table__rank">{r}</span>;
  };

  const formatTime = (s) => {
    if (!s && s !== 0) return "—";
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return min > 0 ? `${min}m ${sec.toFixed(0)}s` : `${Number(s).toFixed(1)}s`;
  };

  return (
    <tr className="rm-table__row">
      <td className="rm-table__cell rm-table__cell--rank">{getMedal(rank)}</td>
      <td className="rm-table__cell rm-table__cell--name">
        <div className="rm-player-avatar">{player.name.charAt(0)}</div>
        {player.name}
      </td>
      <td className="rm-table__cell">{player.sessions}</td>
      <td className="rm-table__cell">{player.responses}</td>
      <td className="rm-table__cell">
        <span className={`rm-precision-badge ${player.precision >= 80 ? "high" : player.precision >= 60 ? "mid" : "low"}`}>
          {player.precision}%
        </span>
      </td>
      <td className="rm-table__cell">{player.avgScore}</td>
      <td className="rm-table__cell rm-table__cell--max">{player.maxScore}</td>
      <td className="rm-table__cell rm-table__cell--time">
        <Clock size={12} className="rm-time-icon" /> {formatTime(player.avgTime)}
      </td>
    </tr>
  );
}

function QuestionRow({ question, index, isEasy }) {
  const { t } = useTranslation("room");

  const getDiffIcon = (diff) => {
    if (diff === "hard" || diff === "very_hard")   return <Zap size={13} color="#ef4444" />;
    if (diff === "intermediate")                    return <Zap size={13} color="#f59e0b" />;
    return <Zap size={13} color="#22c55e" />;
  };

  const correctRate    = 100 - question.errorRate;
  const correctAnswers = question.totalAttempts - question.incorrectAttempts;

  return (
    <div className={`rm-question-item ${isEasy ? "rm-question-item--easy" : ""}`}>
      <div className="rm-question-item__rank">#{index + 1}</div>
      <div className="rm-question-item__body">
        <div className="rm-question-item__text">
          {question.text}
          <span className="rm-question-item__cat">{question.category}</span>
          {getDiffIcon(question.difficulty)}
        </div>
        <div className="rm-question-item__bar">
          <div className="rm-question-item__bar-track">
            <div
              className={`rm-question-item__bar-fill ${isEasy ? "rm-question-item__bar-fill--success" : ""}`}
              style={{ width: `${isEasy ? Math.min(correctRate, 100) : Math.min(question.errorRate, 100)}%` }}
            />
          </div>
          <span className="rm-question-item__bar-label">
            {isEasy
              ? `${correctRate}% ${t("stats_q_hit")} (${correctAnswers}/${question.totalAttempts})`
              : `${question.errorRate}% ${t("stats_q_error")} (${question.incorrectAttempts}/${question.totalAttempts})`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function MatchHistory() {
  const { t, i18n } = useTranslation("room");
  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [room,          setRoom]         = useState(null);
  const [loading,       setLoading]      = useState(false);
  const [error,         setError]        = useState(null);
  const [activeTab,     setActiveTab]    = useState("overview");
  const [searchPlayer,  setSearchPlayer] = useState("");
  const [sortBy,        setSortBy]       = useState("precision");
  const [exporting,     setExporting]    = useState(null); // "pdf" | "excel" | null

  useEffect(() => {
    if (!roomId) { navigate("/admin/matches/live"); return; }
    setLoading(true);
    fetchMatchStats(roomId)
      .then(setRoom)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [roomId]);

  const sortedPlayers = useMemo(() => {
    if (!room) return [];
    const f = room.players.filter((p) =>
      p.name.toLowerCase().includes(searchPlayer.toLowerCase())
    );
    return [...f].sort((a, b) => {
      switch (sortBy) {
        case "avgScore":  return b.avgScore  - a.avgScore;
        case "maxScore":  return b.maxScore  - a.maxScore;
        case "sessions":  return b.sessions  - a.sessions;
        default:          return b.precision - a.precision;
      }
    });
  }, [room, searchPlayer, sortBy]);

  const sortedQuestions  = useMemo(() => room ? [...room.questions].sort((a, b) => b.errorRate - a.errorRate) : [], [room]);
  const easiestQuestions = useMemo(() => room ? [...room.questions].sort((a, b) => a.errorRate - b.errorRate) : [], [room]);

  if (loading) return <Loader loading content={t("loading")} />;

  if (error || !room) {
    return (
      <div className="rm-root"><div className="rm-inner">
        <button className="rm-back-btn" onClick={() => navigate("/admin/matches/live")} style={{ marginBottom: 20 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ color: "#dc2626", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "16px 20px" }}>
          {error || "Sala no encontrada"}
        </div>
      </div></div>
    );
  }

  const bestPlayer = sortedPlayers[0] ?? null;
  const bestCat    = room.categories[0] ?? null;
  const hardestQ   = sortedQuestions[0] ?? null;
  const easiestQ   = easiestQuestions[0] ?? null;

  return (
    <div className="rm-root">
      <div className="rm-inner">

        {/* ── Header ── */}
        <div className="rm-header">
          <button className="rm-back-btn" onClick={() => navigate("/admin/matches/live")}>
            <ArrowLeft size={18} />
          </button>
          <div className="rm-header__info">
            <div className="rm-header__top">
              <h1 className="rm-header__title">{t("stats_title", { name: room.name })}</h1>
              <div className="rm-header__code">#{room.id}</div>
            </div>
            <p className="rm-header__subtitle">{t("stats_subtitle")}</p>
          </div>
          <div className="rm-header__actions">
            <button
              className="rm-btn rm-btn--outline"
              disabled={exporting !== null}
              onClick={() => {
                setExporting("pdf");
                try { exportPDF(room, lang); } finally { setExporting(null); }
              }}
            >
              {exporting === "pdf"
                ? <Loader2 size={15} className="rm-spin" />
                : <FileText size={15} />}
              {t("stats_export_pdf")}
            </button>
            <button
              className="rm-btn rm-btn--outline"
              disabled={exporting !== null}
              onClick={async () => {
                setExporting("excel");
                try { await exportExcel(room, lang); } finally { setExporting(null); }
              }}
            >
              {exporting === "excel"
                ? <Loader2 size={15} className="rm-spin" />
                : <FileSpreadsheet size={15} />}
              {t("stats_export_excel")}
            </button>
          </div>
        </div>

        {/* ── Metric Cards ── */}
        <div className="rm-metrics">
          <MetricCard icon={Users}    label={t("stats_total_players")}    value={room.totalPlayers}             color="#7c3aed" />
          <MetricCard icon={Target}   label={t("stats_total_sessions")}   value={room.totalSessions}            color="#0ea5e9" />
          <MetricCard icon={BarChart3}label={t("stats_total_responses")}  value={room.totalResponses}           color="#10b981" />
          <MetricCard icon={Trophy}   label={t("stats_avg_precision")}    value={`${room.avgPrecision}%`}       color="#f59e0b" />
          <MetricCard icon={Star}     label={t("stats_max_score")}        value={room.maxScore.toLocaleString()} sub={t("stats_max_score_points")} color="#ef4444" />
        </div>

        {/* ── Tabs ── */}
        <div className="rm-tabs">
          <button className={`rm-tab ${activeTab === "overview"  ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            <PieChart size={16} /> {t("stats_tab_overview")}
          </button>
          <button className={`rm-tab ${activeTab === "players"   ? "active" : ""}`} onClick={() => setActiveTab("players")}>
            <Users size={16} /> {t("stats_tab_players")}
          </button>
          <button className={`rm-tab ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>
            <AlertTriangle size={16} /> {t("stats_tab_questions")}
          </button>
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === "overview" && (
          <div className="rm-panel">
            {room.categories.length > 0 ? (
              <div className="rm-charts-row">
                <div className="rm-chart-card">
                  <h4 className="rm-chart-title">{t("stats_chart_cat_dist")}</h4>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ margin: "0 auto", width: "fit-content" }}>
                    <RechartsPie width={460} height={210}>
                      <Pie
                        data={room.categories.map((c) => ({ name: c.name, value: c.totalQuestions }))}
                        dataKey="value" nameKey="name"
                        innerRadius={55} outerRadius={82} paddingAngle={3}
                      >
                        {room.categories.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                    </RechartsPie>
                    </div>
                  </div>
                </div>
                <div className="rm-chart-card">
                  <h4 className="rm-chart-title">{t("stats_chart_cat_prec")}</h4>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ margin: "0 auto", width: "fit-content" }}>
                    <BarChart width={460} height={210} data={room.categories} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip formatter={(v) => [`${v}%`, t("stats_precision")]} />
                      <Bar dataKey="precision" radius={[6, 6, 0, 0]}>
                        {room.categories.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>
                {t("stats_no_data") || "Sin datos de respuestas aún"}
              </div>
            )}

            {room.categories.length > 0 && (
              <div className="rm-categories-section">
                <h3 className="rm-section-title">{t("stats_categories_title")}</h3>
                <p className="rm-section-desc">{t("stats_categories_subtitle")}</p>
                <div className="rm-categories">
                  {room.categories.map((cat) => <CategoryBar key={cat.name} {...cat} />)}
                </div>
              </div>
            )}

            {(bestPlayer || bestCat || hardestQ || easiestQ) && (
              <div className="rm-quick-stats">
                <h3 className="rm-section-title">{t("stats_quick_insights")}</h3>
                <div className="rm-insights-grid">
                  {easiestQ && (
                    <div className="rm-insight-card rm-insight-card--success">
                      <CheckCircle size={18} />
                      <div>
                        <span className="rm-insight-card__label">{t("stats_easiest_question")}</span>
                        <span className="rm-insight-card__value">{easiestQ.text}</span>
                        <span className="rm-insight-card__sub">{t("stats_error_rate")}: {easiestQ.errorRate}%</span>
                      </div>
                    </div>
                  )}
                  {hardestQ && (
                    <div className="rm-insight-card rm-insight-card--danger">
                      <AlertTriangle size={18} />
                      <div>
                        <span className="rm-insight-card__label">{t("stats_hardest_question")}</span>
                        <span className="rm-insight-card__value">{hardestQ.text}</span>
                        <span className="rm-insight-card__sub">{t("stats_error_rate")}: {hardestQ.errorRate}%</span>
                      </div>
                    </div>
                  )}
                  {bestPlayer && (
                    <div className="rm-insight-card rm-insight-card--info">
                      <Medal size={18} />
                      <div>
                        <span className="rm-insight-card__label">{t("stats_best_player")}</span>
                        <span className="rm-insight-card__value">{bestPlayer.name}</span>
                        <span className="rm-insight-card__sub">{bestPlayer.precision}% {t("stats_precision")} · {bestPlayer.maxScore} pts</span>
                      </div>
                    </div>
                  )}
                  {bestCat && (
                    <div className="rm-insight-card rm-insight-card--warning">
                      <TrendingUp size={18} />
                      <div>
                        <span className="rm-insight-card__label">{t("stats_best_category")}</span>
                        <span className="rm-insight-card__value">{bestCat.name}</span>
                        <span className="rm-insight-card__sub">{bestCat.precision}% {t("stats_precision")}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Players ── */}
        {activeTab === "players" && (
          <div className="rm-panel">
            {sortedPlayers.length > 0 ? (
              <>
                <div className="rm-chart-card rm-chart-card--full">
                  <h4 className="rm-chart-title">{t("stats_chart_player_perf")}</h4>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ margin: "0 auto", width: "fit-content" }}>
                    <BarChart
                      width={700} height={220}
                      data={sortedPlayers.slice(0, 10).map((p) => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name, precision: p.precision }))}
                      margin={{ top: 4, right: 12, bottom: 40, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                      <Tooltip formatter={(v) => [`${v}%`, t("stats_precision")]} />
                      <Bar dataKey="precision" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                    </BarChart>
                    </div>
                  </div>
                </div>

                <div className="rm-toolbar">
                  <div className="rm-search-box">
                    <Search size={15} color="#94a3b8" />
                    <input placeholder={t("stats_search_player")} value={searchPlayer} onChange={(e) => setSearchPlayer(e.target.value)} />
                  </div>
                  <div className="rm-sort-wrap">
                    <span className="rm-sort-label">{t("stats_sort_by")}:</span>
                    <select className="rm-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="precision">{t("stats_precision")}</option>
                      <option value="avgScore">{t("stats_avg_score")}</option>
                      <option value="maxScore">{t("stats_max_score")}</option>
                      <option value="sessions">{t("stats_sessions")}</option>
                    </select>
                    <ChevronDown size={14} className="rm-sort-chevron" />
                  </div>
                </div>

                <div className="rm-table-wrapper">
                  <table className="rm-table">
                    <thead>
                      <tr>
                        <th className="rm-table__th">{t("stats_table_rank")}</th>
                        <th className="rm-table__th">{t("stats_table_player")}</th>
                        <th className="rm-table__th">{t("stats_table_sessions")}</th>
                        <th className="rm-table__th">{t("stats_table_responses")}</th>
                        <th className="rm-table__th">{t("stats_table_precision")}</th>
                        <th className="rm-table__th">{t("stats_table_avg_score")}</th>
                        <th className="rm-table__th">{t("stats_table_max_score")}</th>
                        <th className="rm-table__th">{t("stats_table_avg_time")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlayers.map((player, i) => (
                        <PlayerRow key={player.name} player={player} rank={i + 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                {t("stats_no_data") || "Sin jugadores en esta sala aún"}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Questions ── */}
        {activeTab === "questions" && (
          <div className="rm-panel">
            {sortedQuestions.length > 0 ? (
              <>
                <div className="rm-chart-card rm-chart-card--full">
                  <h4 className="rm-chart-title">{t("stats_chart_top5_errors")}</h4>
                  <div style={{ overflowX: "auto", width: "100%" }}>
                    <div style={{ margin: "0 auto", width: "fit-content" }}>
                    <BarChart
                      width={660} height={220}
                      layout="vertical"
                      data={sortedQuestions.slice(0, 5).map((q) => ({
                        name: q.text.length > 42 ? q.text.slice(0, 42) + "…" : q.text,
                        error: q.errorRate,
                      }))}
                      margin={{ top: 4, right: 36, bottom: 4, left: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" width={200} tick={{ fontSize: 11, fill: "#334155" }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v) => [`${v}%`, t("stats_error_rate")]} />
                      <Bar dataKey="error" fill="#ef4444" radius={[0, 6, 6, 0]} />
                    </BarChart>
                    </div>
                  </div>
                </div>

                <div className="rm-questions-section">
                  <div>
                    <h3 className="rm-section-title">
                      <AlertTriangle size={18} className="rm-section-icon rm-section-icon--danger" />
                      {t("stats_ranking_title")}
                    </h3>
                    <p className="rm-section-desc">{t("stats_ranking_subtitle")}</p>
                  </div>
                  <div className="rm-questions-list">
                    {sortedQuestions.map((q, i) => <QuestionRow key={`hard-${i}`} question={q} index={i} />)}
                  </div>
                </div>

                <div className="rm-questions-section">
                  <div>
                    <h3 className="rm-section-title">
                      <CheckCircle size={18} className="rm-section-icon rm-section-icon--success" />
                      {t("stats_easiest_ranking_title")}
                    </h3>
                    <p className="rm-section-desc">{t("stats_easiest_ranking_subtitle")}</p>
                  </div>
                  <div className="rm-questions-list">
                    {easiestQuestions.map((q, i) => <QuestionRow key={`easy-${i}`} question={q} index={i} isEasy />)}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                {t("stats_no_data") || "Sin preguntas respondidas en esta sala aún"}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
