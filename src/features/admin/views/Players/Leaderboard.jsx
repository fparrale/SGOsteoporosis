import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Trophy, Award, Target, Clock, TrendingUp, BarChart2, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "./Leaderboard.css";
import { fetchLeaderboard, getAvatarUrl } from "../../services/PlayerListService";
import Loader from "../../../../components/ui/Loader";

const BAR_COLORS = [
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #94a3b8, #64748b)",
  "linear-gradient(135deg, #b45309, #92400e)",
  "linear-gradient(135deg, #3b82f6, #2563eb)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  "linear-gradient(135deg, #ec4899, #db2777)",
  "linear-gradient(135deg, #f97316, #ea580c)",
  "linear-gradient(135deg, #14b8a6, #0d9488)",
  "linear-gradient(135deg, #6366f1, #4f46e5)",
];

function getMaxScore(players) {
  if (!players || players.length === 0) return 1;
  return Math.max(...players.map((p) => p.puntajeMaximo || 0), 1);
}

export default function Leaderboard() {
  const { t } = useTranslation(["admin", "player"]);
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLeaderboard()
      .then((data) => { setPlayers(data || []); })
      .catch((err) => {
        console.error("Error loading leaderboard:", err);
        setError(err.message || t("player:lb_load_error"));
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const goToProfile = (playerId) => {
    navigate(`/admin/players/profiles/${playerId}`);
  };

  if (loading) return <Loader loading content={t("player:loading")} />;

  if (error) {
    return (
      <div className="lb-root">
        <div className="lb-inner">
          <div className="lb-error">{error}</div>
        </div>
      </div>
    );
  }

  const top10 = players.slice(0, 10);
  const maxScore = getMaxScore(top10);

  const chartData = top10.map((p) => ({
    name: p.name?.split(" ")[0] || `#${p.id}`,
    fullName: p.name,
    high_score: p.puntajeMaximo ?? 0,
    sesiones: p.totalSesiones ?? 0,
  }));

  return (
    <div className="lb-root">
      <div className="lb-inner">

        <div className="lb-topbar">
          <div>
            <div className="lb-page-title">
              <Trophy size={24} color="#f59e0b" />
              {t("admin:nav_sub_leaderboard")}
            </div>
            <p className="lb-page-sub">{t("player:lb_subtitle")}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="lb-update-badge">
              <TrendingUp size={14} style={{ marginRight: 6 }} />
              {t("player:lb_update_live")}
            </div>
            <button
              className="lb-refresh-btn"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={loading}
              title={t("player:lb_refresh")}
            >
              <RefreshCw size={15} className={loading ? "lb-spin" : ""} />
              {t("player:lb_refresh")}
            </button>
          </div>
        </div>

        {top10.length === 0 && (
          <div className="lb-chart-container" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Trophy size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: "#94a3b8", margin: "0 0 8px" }}>
              {t("player:lb_empty_title")}
            </p>
            <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0 }}>
              {t("player:lb_empty_sub")}
            </p>
          </div>
        )}

        {chartData.length > 0 && (
          <div className="lb-chart-container" style={{ marginBottom: 28 }}>
            <div className="lb-chart-title">
              <BarChart2 size={18} color="#f59e0b" />
              {t("player:lb_barchart_title")}
            </div>
            <p className="lb-chart-sub">
              {t("player:lb_barchart_sub")}
            </p>
            <div style={{ overflowX: "auto", width: "100%" }}>
              <div style={{ margin: "0 auto", width: "fit-content" }}>
              <BarChart
                width={700}
                height={320}
                data={chartData}
                margin={{ top: 10, right: 50, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                  label={{ value: t("player:lb_col_player", "Jugador"), position: "insideBottom", offset: -48, fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  label={{ value: t("player:pp_stat_best_score", "Puntaje"), angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#34d399", fontSize: 11 }}
                  allowDecimals={false}
                  label={{ value: t("player:lb_col_sessions", "Sesiones"), angle: 90, position: "insideRight", fill: "#34d399", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59, 108, 248, 0.06)" }}
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                  contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Legend wrapperStyle={{ paddingTop: 8, fontSize: 13 }} />
                <Bar yAxisId="left"  name={t("player:lb_col_best_score")} dataKey="high_score" fill="#818cf8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar yAxisId="right" name={t("player:lb_col_sessions")}   dataKey="sesiones"   fill="#34d399" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
              </div>
            </div>
          </div>
        )}

        <div className="lb-chart-container">
          <div className="lb-chart-title">
            <Award size={18} color="#f59e0b" />
            {t("player:lb_chart_title")}
          </div>
          <p className="lb-chart-sub">{t("player:lb_chart_sub")}</p>

          {top10.map((player, idx) => {
            const pct = maxScore > 0 ? (player.puntajeMaximo / maxScore) * 100 : 0;
            const rankClass =
              idx === 0 ? "lb-rank-gold" :
              idx === 1 ? "lb-rank-silver" :
              idx === 2 ? "lb-rank-bronze" : "lb-rank-rest";

            return (
              <div
                key={player.id || idx}
                className="lb-bar-row"
                onClick={() => goToProfile(player.id)}
                title={t("player:lb_player_tooltip")}
              >
                <div className={`lb-rank-badge ${rankClass}`}>{idx + 1}</div>

                <div className="lb-player-info">
                  <div className="lb-avatar-sm">
                    <img src={getAvatarUrl(player.seed)} alt={player.name} />
                  </div>
                  <div className="lb-player-name">{player.name}</div>
                </div>

                <div className="lb-bar-track">
                  <div
                    className="lb-bar-fill"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      background: BAR_COLORS[idx] || BAR_COLORS[BAR_COLORS.length - 1],
                    }}
                  >
                    {pct > 15 ? player.puntajeMaximo?.toLocaleString() : ""}
                  </div>
                </div>

                <div className="lb-player-stats">
                  <span>
                    <Target size={12} />
                    <strong>{player.precision != null ? `${player.precision}%` : "—"}</strong>
                  </span>
                  <span>
                    <Clock size={12} />
                    <strong>{player.totalSesiones ?? 0}</strong> {t("player:lb_sessions_label")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lb-list-container">
          <div className="lb-list-title">
            <TrendingUp size={18} />
            {t("player:lb_list_title")}
          </div>

          <div style={{ overflowX: "auto" }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("player:lb_col_player")}</th>
                <th>{t("player:lb_col_age")}</th>
                <th>{t("player:lb_col_best_score")}</th>
                <th>{t("player:lb_col_precision")}</th>
                <th>{t("player:lb_col_sessions")}</th>
                <th>{t("player:lb_col_best_streak")}</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((player, idx) => (
                <tr
                  key={player.id || idx}
                  onClick={() => goToProfile(player.id)}
                  title={t("player:lb_player_tooltip")}
                >
                  <td style={{ fontWeight: 800, color: idx < 3 ? "#f59e0b" : "#64748b" }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div className="lb-td-player">
                      <div className="lb-td-avatar">
                        <img src={getAvatarUrl(player.seed)} alt={player.name} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{player.name}</span>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>
                        ID: {player.id}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: "#64748b" }}>
                    {player.age != null ? `${player.age} ${t("player:pp_years")}` : "—"}
                  </td>
                  <td style={{ fontWeight: 700, color: "#0f1f5c" }}>
                    {player.puntajeMaximo?.toLocaleString() ?? "—"}
                  </td>
                  <td>
                    <span style={{
                      background: (player.precision ?? 0) >= 70 ? "#dcfce7" : (player.precision ?? 0) >= 40 ? "#fef9c3" : "#fee2e2",
                      color: (player.precision ?? 0) >= 70 ? "#166534" : (player.precision ?? 0) >= 40 ? "#92400e" : "#991b1b",
                      padding: "2px 10px", borderRadius: 99, fontWeight: 600, fontSize: 12,
                    }}>
                      {player.precision != null ? `${player.precision}%` : "—"}
                    </span>
                  </td>
                  <td>{player.totalSesiones ?? 0}</td>
                  <td style={{ fontWeight: 600 }}>{player.mejorRacha ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

      </div>
    </div>
  );
}
