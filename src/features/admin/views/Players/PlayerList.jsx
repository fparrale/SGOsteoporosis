// --- PlayerList.jsx (Vista) ---------------------------------------------------
// Responsabilidad única: renderizar la UI.
// Toda la lógica vive en usePlayerList; las constantes en PlayerListConstants.
// -----------------------------------------------------------------------------

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import "./PlayerList.css";
import { usePlayerList }           from "../../hooks/usePlayerList";
import Loader from "../../../../components/ui/Loader";
import { STATUS_COLOR, PAGE_OPTIONS } from "../../constants/playerListConstants";

export default function PlayerList() {
  const { t } = useTranslation(["admin", "player"]);
  const navigate = useNavigate();
  const {
    search,
    safePage,
    perPage,
    visible,
    filtered,
    totalPlayers,
    totalPages,
    pageNums,
    loading,
    error,
    onSearch,
    onGoPage,
    onPerPage,
    onRefresh,
  } = usePlayerList();

  const goToProfile = (playerId) => {
    navigate(`/admin/players/profiles/${playerId}`);
  };

  if (loading) return <Loader loading content={t("player:loading")} />;

  if (error) {
    return (
      <div className="pl-root">
        <div className="pl-inner">
          <div className="pl-empty" style={{ color: "#ef4444" }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="pl-root">
      <div className="pl-inner">

        {/* -- Top bar ----------------------------------------------------- */}
        <div className="pl-topbar">
          <div>
            <div className="pl-page-title">{t("admin:nav_sub_player_list")}</div>
            <p className="pl-page-sub">{t("player:subtitle")}</p>
          </div>

          <div className="pl-topbar-right">
            <div className="pl-search-box">
              <Search size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input
                placeholder={t("player:search_placeholder")}
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            <button
              className="lb-refresh-btn"
              onClick={onRefresh}
              disabled={loading}
              title={t("player:lb_refresh")}
            >
              <RefreshCw size={15} className={loading ? "lb-spin" : ""} />
            </button>
            <div className="pl-count-badge">
              {t("player:player_count", { count: filtered.length, total: totalPlayers })}
            </div>
          </div>
        </div>

        {/* -- Grid de jugadores ------------------------------------------- */}
        <div className="pl-grid">
          {visible.length === 0 ? (
            <div className="pl-empty">{t("player:no_players_found")}</div>
          ) : (
            visible.map((player) => (
              <div className="pl-card" key={player.id}>
                <div className="pl-avatar-wrap">
                  <div className="pl-avatar">
                    <img
                      src={player.avatarUrl}
                      alt={player.name}
                      loading="lazy"
                    />
                  </div>
                  <span
                    className="pl-status-dot"
                    style={{ background: STATUS_COLOR[player.status] }}
                  />
                </div>

                <div className="pl-name">{player.name}</div>
                <div className="pl-meta">
                  <span className="pl-meta-id">ID: {player.id}</span>
                  <span className="pl-meta-age">
                    {player.age} {t("player:years")}
                  </span>
                </div>

                <button
                  className="pl-stats-btn"
                  onClick={() => goToProfile(player.id)}
                >
                  <BarChart2 size={15} />
                  {t("player:view_stats")}
                </button>
              </div>
            ))
          )}
        </div>

        {/* -- Barra de paginación ----------------------------------------- */}
        <div className="pl-pag-bar">
          <div className="pl-pages">
            <button
              className="pl-page-btn"
              onClick={() => onGoPage(safePage - 1)}
              disabled={safePage === 1}
            >
              <ChevronLeft size={16} />
            </button>

            {pageNums.map((n, i) =>
              n === "..." ? (
                <span key={i} className="pl-page-dots">…</span>
              ) : (
                <button
                  key={i}
                  className={`pl-page-btn${n === safePage ? " active" : ""}`}
                  onClick={() => onGoPage(n)}
                >
                  {n}
                </button>
              ),
            )}

            <button
              className="pl-page-btn"
              onClick={() => onGoPage(safePage + 1)}
              disabled={safePage === totalPages}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="pl-per-page">
            <span>{t("player:show")}:</span>
            <div className="pl-per-select-wrap">
              <select
                className="pl-per-select"
                value={perPage}
                onChange={(e) => onPerPage(Number(e.target.value))}
              >
                {PAGE_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {t("player:per_page", { count: o })}
                  </option>
                ))}
              </select>
              <span className="pl-per-icon"><ChevronDown size={14} /></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
