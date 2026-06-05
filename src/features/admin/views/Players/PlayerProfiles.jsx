import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  Zap,
  BarChart3,
  TrendingUp,
  Award,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

import "./PlayerProfiles.css";
import {
  getAvatarUrl,
  fetchPlayerStats,
  fetchPlayerSessions,
} from "../../services/PlayerListService";
import Loader from "../../../../components/ui/Loader";

const CAT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

const STAT_ICONS = {
  sessions:  { icon: Activity,  bg: "#eff4ff", color: "#1d4ed8" },
  streak:    { icon: Zap,       bg: "#fefce8", color: "#a16207" },
  bestScore: { icon: Trophy,    bg: "#fefce8", color: "#a16207" },
  avgScore:  { icon: TrendingUp,bg: "#ecfdf5", color: "#059669" },
  accuracy:  { icon: Target,    bg: "#f0fdf4", color: "#166534" },
  avgTime:   { icon: Clock,     bg: "#fff7ed", color: "#c2410c" },
  correct:   { icon: Award,     bg: "#f0fdf4", color: "#166534" },
  incorrect: { icon: BarChart3, bg: "#fef2f2", color: "#991b1b" },
};

function formatTime(seconds) {
  if (!seconds && seconds !== 0) return "—";
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  return `${seconds.toFixed(1)}s`;
}

export default function PlayerProfiles() {
  const { t } = useTranslation(["admin", "player"]);
  const { playerId } = useParams();
  const navigate = useNavigate();

  const [player,    setPlayer]    = useState(null);
  const [stats,     setStats]     = useState(null);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [selSession,setSelSession]= useState("");
  const [refreshKey,setRefreshKey]= useState(0);


  const DIFF_LABELS = {
    muy_facil:   t("player:pp_diff_very_easy"),
    facil:       t("player:pp_diff_easy"),
    intermedio:  t("player:pp_diff_medium"),
    dificil:     t("player:pp_diff_hard"),
    muy_dificil: t("player:pp_diff_very_hard"),
  };

  useEffect(() => {
    if (!playerId) {
      navigate("/admin/players");
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      fetchPlayerStats(playerId),
      fetchPlayerSessions(playerId),
    ])
      .then(([playerData, sessionData]) => {
        setPlayer(playerData);
        setStats(playerData.stats || {});
        setSessions(sessionData || []);
        if (sessionData && sessionData.length > 0) {
          setSelSession(String(sessionData[0].sessionNumber));
        }
      })
      .catch((err) => {
        console.error("Error loading player data:", err);
        setError(err.message || t("player:pp_not_found"));
      })
      .finally(() => setLoading(false));
  }, [playerId, refreshKey]);

  const selectedSession = useMemo(
    () => sessions.find((s) => String(s.sessionNumber) === selSession),
    [sessions, selSession],
  );

  if (loading) {
    return <Loader loading content={t("player:loading")} />;
  }

  if (error) {
    return (
      <div className="pp-root">
        <div className="pp-inner">
          <div className="pp-error">{error}</div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="pp-root">
        <div className="pp-inner">
          <div className="pp-error">{t("player:pp_not_found")}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pp-root">
      <div className="pp-inner">

        <div className="pp-topbar">
          <div className="pp-topbar-left">
            <button className="pp-back-btn" onClick={() => navigate("/admin/players")}>
              <ArrowLeft size={16} />
              {t("player:pp_back")}
            </button>
            <div>
              <div className="pp-page-title">{t("admin:nav_sub_player_profiles")}</div>
              <p className="pp-page-sub">{t("player:pp_subtitle")}</p>
            </div>
          </div>
          <button
            className="lb-refresh-btn"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
            title={t("player:pp_refresh")}
          >
            <RefreshCw size={15} className={loading ? "lb-spin" : ""} />
            {t("player:pp_refresh")}
          </button>
        </div>

        <div className="pp-player-header">
          <div className="pp-ph-avatar">
            <img src={getAvatarUrl(player.seed)} alt={player.name} />
          </div>
          <div className="pp-ph-info">
            <h2>{player.name}</h2>
            <div className="pp-ph-meta">
              <span className="pp-ph-badge">#{player.id}</span>
              <span>{player.age} {t("player:pp_years")}</span>
              <span className="pp-ph-rank">
                {t("player:pp_rank")} #{stats.rank || "—"} · {t("player:pp_avg_difficulty")}:{" "}
                {DIFF_LABELS[stats.dificultadPromedio] || "—"}
              </span>
            </div>
          </div>
        </div>

        <RenderStatsGrid stats={stats} />

        <ScoreProgressionChart sessions={sessions} />

        <CategoryRadarChart categories={stats.porCategoria || []} />

        <AvgDifficultyCard value={stats.dificultadPromedioNum} />

        <CategoryPerformanceChart categories={stats.porCategoria || []} />

        <div className="pp-two-col">
          <AccuracyBreakdown stats={stats} />
          <ResponseTimeBreakdown stats={stats} />
        </div>

        <SessionHistory
          sessions={sessions}
          selSession={selSession}
          onSelectSession={setSelSession}
          selectedSession={selectedSession}
        />

      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponentes
// ---------------------------------------------------------------------------

function RenderStatsGrid({ stats }) {
  const { t } = useTranslation("player");

  const items = [
    { key: "sessions",  label: t("pp_stat_sessions"),  value: stats.totalSesiones ?? "—" },
    { key: "streak",    label: t("pp_stat_streak"),    value: `${stats.mejorRacha ?? "—"}` },
    { key: "bestScore", label: t("pp_stat_best_score"),value: stats.puntajeMaximo ?? "—" },
    { key: "avgScore",  label: t("pp_stat_avg_score"), value: stats.puntajePromedio ?? "—" },
    { key: "accuracy",  label: t("pp_stat_accuracy"),  value: stats.precision != null ? `${stats.precision}%` : "—" },
    { key: "avgTime",   label: t("pp_stat_avg_time"),  value: formatTime(stats.tiempoPromedio) },
    { key: "correct",   label: t("pp_stat_correct"),   value: stats.totalCorrectas ?? "—" },
    { key: "incorrect", label: t("pp_stat_incorrect"), value: stats.totalIncorrectas ?? "—" },
  ];

  return (
    <div className="pp-stats-grid">
      {items.map(({ key, label, value }) => {
        const meta = STAT_ICONS[key];
        const Icon = meta?.icon || Activity;
        return (
          <div className="pp-stat-card" key={key}>
            <div
              className="pp-stat-icon"
              style={{ background: meta?.bg || "#f1f5f9", color: meta?.color || "#64748b" }}
            >
              <Icon size={20} />
            </div>
            <div className="pp-stat-value">{value}</div>
            <div className="pp-stat-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function ScoreProgressionChart({ sessions }) {
  const { t } = useTranslation("player");
  const wrapRef    = useRef(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setContainerW(el.offsetWidth);
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!sessions || sessions.length === 0) return null;

  // Orden cronológico para que el gráfico muestre la progresión de izquierda a derecha
  const data = [...sessions].reverse().map((s, idx) => ({
    label: `S${idx + 1}`,
    score: s.puntuacion,
    fecha: s.fecha,
    aciertos: s.aciertos,
    total: s.totalPreguntas,
    precision: s.precision,
  }));

  const maxScore = Math.max(...data.map(d => d.score), 1);
  const chartW   = Math.max(containerW || 320, data.length * 64);

  return (
    <div className="pp-category-chart" style={{ marginBottom: 28 }}>
      <div className="pp-section-title">
        <Trophy size={18} />
        {t("pp_score_progression_title")}
      </div>
      <div ref={wrapRef} style={{ overflowX: "auto", width: "100%" }}>
        {containerW > 0 && (
          <BarChart data={data} width={chartW} height={220} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => [`${value} pts`, t("pp_stat_best_score")]}
              labelFormatter={(label, payload) => {
                const d = payload?.[0]?.payload;
                return d ? `${d.fecha} · ${d.aciertos}/${d.total} ${t("pp_stat_correct").toLowerCase()} · ${d.precision}%` : label;
              }}
              contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
            />
            <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={56}>
              {data.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.score === maxScore ? "#22c55e" : "#818cf8"}
                  fillOpacity={0.82}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </div>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#22c55e", display: "inline-block" }} />
          {t("pp_score_best_label")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#818cf8", display: "inline-block" }} />
          {t("pp_score_other_label")}
        </div>
      </div>
    </div>
  );
}

function CategoryRadarChart({ categories }) {
  const { t } = useTranslation("player");

  if (!categories || categories.length === 0) return null;

  const data = categories.map((cat) => ({
    subject: cat.categoriaNombre || "—",
    precision: cat.precision ?? 0,
  }));

  return (
    <div className="pp-category-chart" style={{ marginBottom: 20 }}>
      <div className="pp-section-title">
        <TrendingUp size={18} />
        {t("pp_cat_radar_title")}
      </div>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <div style={{ margin: "0 auto", width: "fit-content" }}>
        <RadarChart width={560} height={340} cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            tickCount={6}
          />
          <Radar
            name={t("pp_cat_radar_legend")}
            dataKey="precision"
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.35}
            dot={{ r: 4, fill: "#818cf8" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, t("pp_cat_radar_legend")]}
            contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
          />
        </RadarChart>
        </div>
      </div>
    </div>
  );
}

function AvgDifficultyCard({ value }) {
  const { t } = useTranslation("player");
  if (value == null) return null;
  const pct = Math.round((value / 5) * 100);

  return (
    <div className="pp-card-box" style={{ marginBottom: 28 }}>
      <div className="pp-section-title">
        <BarChart3 size={18} />
        {t("pp_avg_diff_title")}
      </div>
      <div className="pp-avg-diff-label">{t("pp_avg_diff_level")}</div>
      <div className="pp-avg-diff-value">{value.toFixed(2)} / 5.00</div>
      <div className="pp-avg-diff-track">
        <div className="pp-avg-diff-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CategoryPerformanceChart({ categories }) {
  const { t } = useTranslation("player");

  if (!categories || categories.length === 0) {
    return (
      <div className="pp-category-chart">
        <div className="pp-section-title">
          <BarChart3 size={18} />
          {t("pp_cat_title")}
        </div>
        <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 }}>
          {t("pp_cat_no_data")}
        </p>
      </div>
    );
  }

  return (
    <div className="pp-category-chart">
      <div className="pp-section-title">
        <BarChart3 size={18} />
        {t("pp_cat_title")}
      </div>

      {categories.map((cat, idx) => {
        const pct = cat.precision ?? 0;
        const color = CAT_COLORS[idx % CAT_COLORS.length];
        const failed = cat.totalIncorrectas ?? 0;

        return (
          <div className="pp-cat-bar-row" key={cat.categoriaId || idx}>
            <div className="pp-cat-name">{cat.categoriaNombre || "—"}</div>
            <div className="pp-cat-bar-track">
              <div
                className="pp-cat-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              >
                {pct >= 20 ? `${pct}%` : ""}
              </div>
            </div>
            <div className="pp-cat-pct">
              {pct}% - {failed} {t("pp_cat_failures")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AccuracyBreakdown({ stats }) {
  const { t } = useTranslation("player");

  const correct   = stats.totalCorrectas ?? 0;
  const incorrect = stats.totalIncorrectas ?? 0;
  const noResp    = stats.totalSinRespuesta ?? 0;
  const total     = correct + incorrect + noResp;
  const pctOk     = total > 0 ? Math.round((correct / total) * 100) : 0;
  const pctBad    = total > 0 ? Math.round((incorrect / total) * 100) : 0;
  const pctMiss   = total > 0 ? Math.round((noResp / total) * 100) : 0;

  return (
    <div className="pp-card-box">
      <div className="pp-section-title">
        <Target size={18} />
        {t("pp_accuracy_title")}
      </div>

      <div
        style={{
          height: 32, borderRadius: 99, overflow: "hidden",
          display: "flex", marginBottom: 14, background: "#f1f5f9",
        }}
      >
        {correct > 0 && (
          <div style={{
            flex: correct, background: "#22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 40,
          }}>
            {`${correct} ${t("pp_correct_bar")}`}
          </div>
        )}
        {incorrect > 0 && (
          <div style={{
            flex: incorrect, background: "#ef4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 40,
          }}>
            {`${incorrect} ${t("pp_incorrect_bar")}`}
          </div>
        )}
        {noResp > 0 && (
          <div style={{
            flex: noResp, background: "#f59e0b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#fff", minWidth: 40,
          }}>
            {`${noResp} ${t("pp_no_resp_bar")}`}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#16a34a" }}>{pctOk}%</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{t("pp_correct_label")}</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#dc2626" }}>{pctBad}%</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{t("pp_incorrect_label")}</div>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#d97706" }}>{pctMiss}%</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{t("pp_no_answer_label")}</div>
        </div>
      </div>
    </div>
  );
}

function ResponseTimeBreakdown({ stats }) {
  const { t } = useTranslation("player");
  const respuestas = stats.respuestasConTiempo || [];

  return (
    <div className="pp-card-box">
      <div className="pp-section-title">
        <Clock size={18} />
        {t("pp_time_title")}
      </div>

      {respuestas.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 }}>
          {t("pp_time_no_data")}
        </p>
      ) : (
        <div style={{ maxHeight: 300, overflowY: "auto", overflowX: "auto", width: "100%" }}>
          <table className="pp-answers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("pp_col_question")}</th>
                <th>{t("pp_col_time")}</th>
                <th>{t("pp_col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {respuestas.map((r, idx) => (
                <tr key={r.id || idx}>
                  <td style={{ color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.preguntaTexto || "—"}
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatTime(r.tiempoRespuesta)}</td>
                  <td>
                    <span className={
                      r.esCorrecta ? "pp-status-correct"
                        : r.sinRespuesta ? "pp-status-timeout"
                        : "pp-status-incorrect"
                    }>
                      {r.esCorrecta
                        ? t("pp_status_correct")
                        : r.sinRespuesta
                          ? t("pp_status_timeout")
                          : t("pp_status_incorrect")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SessionHistory({ sessions, selSession, onSelectSession, selectedSession }) {
  const { t } = useTranslation("player");

  return (
    <div className="pp-card-box">
      <div className="pp-section-title">
        <Activity size={18} />
        {t("pp_session_title")}
      </div>

      {sessions.length > 0 && (
        <div className="pp-session-selector">
          <label htmlFor="session-select">{t("pp_session_label")}</label>
          <select
            id="session-select"
            className="pp-session-select"
            value={selSession}
            onChange={(e) => onSelectSession(e.target.value)}
          >
            {sessions.map((s) => (
              <option key={s.sessionNumber} value={String(s.sessionNumber)}>
                #{s.sessionNumber} · {s.fecha || "—"} ({s.puntuacion} pts · {s.aciertos}/{s.totalPreguntas} {t("pp_stat_correct").toLowerCase()})
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedSession && (
        <div className="pp-session-summary">
          <div className="pp-ss-item">
            <div className="pp-ss-value">#{selectedSession.sessionNumber}</div>
            <div className="pp-ss-label">{t("pp_session_label").replace(":", "")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">{selectedSession.fecha || "—"}</div>
            <div className="pp-ss-label">{t("pp_session_date")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">{selectedSession.hora || "—"}</div>
            <div className="pp-ss-label">{t("pp_session_time")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">{selectedSession.puntuacion ?? "—"}</div>
            <div className="pp-ss-label">{t("pp_session_score")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">
              {selectedSession.aciertos ?? "—"}/{selectedSession.totalPreguntas ?? "—"}
            </div>
            <div className="pp-ss-label">{t("pp_session_hits_total")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">
              {selectedSession.precision != null ? `${selectedSession.precision}%` : "—"}
            </div>
            <div className="pp-ss-label">{t("pp_session_precision")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">{selectedSession.horaInicio || "—"}</div>
            <div className="pp-ss-label">{t("pp_session_start")}</div>
          </div>
          <div className="pp-ss-item">
            <div className="pp-ss-value">{selectedSession.duracion || "—"}</div>
            <div className="pp-ss-label">{t("pp_session_duration")}</div>
          </div>
        </div>
      )}

      {selectedSession && selectedSession.respuestas && selectedSession.respuestas.length > 0 ? (
        <div style={{ maxHeight: 420, overflowY: "auto", overflowX: "auto", width: "100%" }}>
          <table className="pp-answers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("pp_col_question")}</th>
                <th>{t("pp_col_answer")}</th>
                <th>{t("pp_col_result")}</th>
                <th>{t("pp_col_time")}</th>
                <th>{t("pp_col_feedback")}</th>
              </tr>
            </thead>
            <tbody>
              {selectedSession.respuestas.map((r, idx) => (
                <tr key={r.id || idx}>
                  <td style={{ color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.preguntaTexto || "—"}
                  </td>
                  <td>{r.opcionElegida || "—"}</td>
                  <td>
                    <span className={
                      r.esCorrecta ? "pp-status-correct"
                        : r.sinRespuesta ? "pp-status-timeout"
                        : "pp-status-incorrect"
                    }>
                      {r.esCorrecta
                        ? t("pp_status_correct_icon")
                        : r.sinRespuesta
                          ? t("pp_status_timeout_icon")
                          : t("pp_status_incorrect_icon")}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatTime(r.tiempoRespuesta)}</td>
                  <td style={{ maxWidth: 200 }}>
                    {r.esCorrecta && r.feedbackCorrecto && (
                      <div className="pp-feedback-correct">{r.feedbackCorrecto}</div>
                    )}
                    {!r.esCorrecta && r.feedbackIncorrecto && (
                      <div className="pp-feedback-incorrect">{r.feedbackIncorrecto}</div>
                    )}
                    {!r.feedbackCorrecto && !r.feedbackIncorrecto && (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>{t("pp_no_feedback")}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedSession ? (
        <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 20 }}>
          {t("pp_session_no_data")}
        </p>
      ) : null}
    </div>
  );
}
