import { useState, useEffect, useCallback } from "react";
import { BarChart2, Users, Target, Trophy, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { fetchGlobalStats } from "../../services/SuperAdminServices";
import Loader from "../../../../components/ui/Loader";
import "./GlobalStats.css";

const SALA_PAGE_SIZE = 5;
const TOP_PAGE_SIZE  = 12;

export default function GlobalStats() {
  const { t } = useTranslation("admin");
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState(null);
  const [salaPage, setSalaPage] = useState(1);
  const [topPage,  setTopPage]  = useState(1);

  const loadStats = useCallback(async () => {
    setLoad(true);
    setError(null);
    try {
      const data = await fetchGlobalStats();
      setStats(data);
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
      setError(err.message);
    } finally {
      setLoad(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const MetricCard = ({ icon: Icon, label, value, iconClass }) => (
    <div className="metric-card">
      <div className={`metric-card__icon ${iconClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="metric-card__value">{value}</p>
        <p className="metric-card__label">{label}</p>
      </div>
    </div>
  );

  if (loading) return <Loader loading content={t("sa_stats_loading")} />;

  return (
    <div className="global-stats">
      <div className="global-stats__header">
        <div>
          <h1>{t("sa_stats_title")}</h1>
          <p>{t("sa_stats_subtitle")}</p>
        </div>
        <button
          className="gs-refresh-btn"
          onClick={loadStats}
          disabled={loading}
          title={t("sa_stats_refresh")}
        >
          <RefreshCw size={15} className={loading ? "gs-spin" : ""} />
          {t("sa_stats_refresh")}
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#991b1b" }}>
          {error}
        </div>
      )}

      {stats && stats.totales && (
        <>
          <div className="metrics-grid">
            <MetricCard
              icon={Users}
              label={t("sa_stats_metric_players")}
              value={stats.totales.total_jugadores?.toLocaleString() ?? 0}
              iconClass="metric-card__icon--purple"
            />
            <MetricCard
              icon={BarChart2}
              label={t("sa_stats_metric_rooms")}
              value={stats.totales.total_sesiones ?? 0}
              iconClass="metric-card__icon--blue"
            />
            <MetricCard
              icon={Target}
              label={t("sa_stats_metric_answers")}
              value={stats.totales.total_respuestas?.toLocaleString() ?? 0}
              iconClass="metric-card__icon--green"
            />
            <MetricCard
              icon={Trophy}
              label={t("sa_stats_metric_accuracy")}
              value={stats.totales.precision_global ? `${stats.totales.precision_global}%` : "N/A"}
              iconClass="metric-card__icon--yellow"
            />
          </div>

          <div className="stats-columns">
            <div className="card">
              {(() => {
                const jugadores   = stats.top_jugadores ?? [];
                const totalTopPgs = Math.ceil(jugadores.length / TOP_PAGE_SIZE);
                const visibleTop  = jugadores.slice((topPage - 1) * TOP_PAGE_SIZE, topPage * TOP_PAGE_SIZE);
                const globalOffset = (topPage - 1) * TOP_PAGE_SIZE;
                return (
                  <>
                    <div className="sala-card__header">
                      <h2>{t("sa_stats_top_title")}</h2>
                      {jugadores.length > 0 && (
                        <span className="sala-card__total">{jugadores.length} {t("sa_stats_players_count")}</span>
                      )}
                    </div>
                    {jugadores.length > 0 ? (
                      <>
                        <div className="top-list">
                          {visibleTop.map((j, i) => {
                            const globalIdx = globalOffset + i;
                            return (
                              <div key={j.nombre_jugador ?? globalIdx} className="top-item">
                                <span className={`top-item__rank ${globalIdx < 3 ? "top-item__rank--top3" : "top-item__rank--rest"}`}>
                                  {globalIdx + 1}
                                </span>
                                <div className="top-item__info">
                                  <p className="top-item__name">{j.nombre_jugador}</p>
                                  <p className="top-item__detail">
                                    {j.total_sesiones} {t("sa_stats_sessions")} | {j.precision}% {t("sa_stats_precision")}
                                  </p>
                                </div>
                                <span className="top-item__score">
                                  {j.puntaje_total?.toLocaleString() ?? 0} pts
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {totalTopPgs > 1 && (
                          <div className="sala-pagination">
                            <button
                              className="sala-pagination__btn"
                              disabled={topPage === 1}
                              onClick={() => setTopPage(p => p - 1)}
                            >
                              <ChevronLeft size={15} />
                            </button>
                            <span className="sala-pagination__info">
                              {topPage} / {totalTopPgs}
                            </span>
                            <button
                              className="sala-pagination__btn"
                              disabled={topPage === totalTopPgs}
                              onClick={() => setTopPage(p => p + 1)}
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("sa_stats_no_players")}</p>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="card">
              {(() => {
                const salas = stats.por_sala ?? [];
                const totalPages = Math.ceil(salas.length / SALA_PAGE_SIZE);
                const visible = salas.slice((salaPage - 1) * SALA_PAGE_SIZE, salaPage * SALA_PAGE_SIZE);
                return (
                  <>
                    <div className="sala-card__header">
                      <h2>{t("sa_stats_by_room")}</h2>
                      {salas.length > 0 && (
                        <span className="sala-card__total">{salas.length} salas</span>
                      )}
                    </div>
                    {salas.length > 0 ? (
                      <>
                        <div className="sala-list">
                          {visible.map((s, i) => (
                            <div
                              key={s.id ?? s.nombre ?? i}
                              className="sala-item sala-item--clickable"
                              onClick={() => navigate(`/admin/matches/history?roomId=${s.id}`)}
                              title="Ver estadísticas detalladas"
                            >
                              <div className="sala-item__header">
                                <p className="sala-item__name">{s.nombre}</p>
                                <div className="sala-item__header-right">
                                  <span className="sala-item__players">{s.jugadores} {t("sa_stats_players_count")}</span>
                                  <ExternalLink size={13} className="sala-item__link-icon" />
                                </div>
                              </div>
                              <div className="sala-item__stats">
                                <span className="sala-item__stat">
                                  {t("sa_stats_room_precision")} <strong>{s.precision ?? "N/A"}%</strong>
                                </span>
                                <span className="sala-item__stat">
                                  {t("sa_stats_room_avg_score")} <strong>{s.puntaje_promedio ?? 0}</strong>
                                </span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-bar__fill" style={{ width: `${s.precision ?? 0}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="sala-pagination">
                            <button
                              className="sala-pagination__btn"
                              disabled={salaPage === 1}
                              onClick={() => setSalaPage(p => p - 1)}
                            >
                              <ChevronLeft size={15} />
                            </button>
                            <span className="sala-pagination__info">
                              {salaPage} / {totalPages}
                            </span>
                            <button
                              className="sala-pagination__btn"
                              disabled={salaPage === totalPages}
                              onClick={() => setSalaPage(p => p + 1)}
                            >
                              <ChevronRight size={15} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("sa_stats_no_rooms")}</p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </>
      )}

      {!stats && !loading && (
        <p style={{ color: "#64748b", padding: 24 }}>{t("sa_stats_no_data")}</p>
      )}
    </div>
  );
}
