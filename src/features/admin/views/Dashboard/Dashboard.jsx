// ─── Dashboard.jsx (Vista) ────────────────────────────────────────────────────
// Responsabilidad única: renderizar la UI.
// Toda la lógica vive en useDashboard; las constantes en DashboardConstants.
// Los sub-componentes (MetricCard, BarChart, Avatar, Badge) también viven aquí
// porque son exclusivos de esta vista y no tienen estado propio.
// ─────────────────────────────────────────────────────────────────────────────

import {
  Users, Gamepad2, HelpCircle, ClipboardList, Trophy,
  TrendingUp, TrendingDown, Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { C }                  from "../../constants/constants";
import { STATUS_BADGE_COLOR } from "../../constants/dashboardConstants";
import { useDashboard }       from "../../hooks/useDashboard";
import "./Dashboard.css";

// ─── Sub-componentes de presentación pura ─────────────────────────────────────

const Avatar = ({ avatarUrl, name, size = 40 }) => {
  const initials = (name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div
      className="avatar"
      style={{ width: size, height: size, position: "relative" }}
    >
      <div
        className="avatar-initials"
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: size * 0.38, fontWeight: 700, color: "#fff",
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
          borderRadius: "50%",
          userSelect: "none",
        }}
      >
        {initials}
      </div>
      <img
        src={avatarUrl}
        alt={name}
        style={{ position: "relative", zIndex: 1 }}
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
};

const Badge = ({ color }) => (
  <span style={{
    display: "inline-block", width: 20, height: 8,
    background: STATUS_BADGE_COLOR[color] ?? "transparent",
    borderRadius: 4,
  }} />
);

const MetricCard = ({ icon: Icon, iconBg, iconColor, label, value, trend, trendDir }) => (
  <div style={{ background: C.white, borderRadius: 12, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
        <Icon size={22} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 2, color: trendDir === "up" ? C.emerald : trendDir === "down" ? C.red : "#64748b" }}>
        {trend}
        {trendDir === "up"   && <TrendingUp   size={12} />}
        {trendDir === "down" && <TrendingDown  size={12} />}
      </span>
    </div>
    <p style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.06em", color: C.outline, textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
    <h3 style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary }}>{value}</h3>
  </div>
);

const BarChart = ({ bars, accent }) => (
  <div style={{ display: "flex", gap: 8, height: 220, padding: "0 4px" }}>
    {bars.map((b, i) => {
      const opacity = Math.max(0.35, 1 - i * 0.13);
      return (
        <div
          key={i}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}
        >
          {b.pct !== undefined && (
            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, lineHeight: 1 }}>
              {b.pct}%
            </span>
          )}
          <div
            style={{ width: "100%", height: `${b.value * 1.85}px`, background: accent, opacity, borderRadius: "4px 4px 0 0", cursor: "default", transition: "height 0.3s ease-out, opacity 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = String(opacity))}
          />
        </div>
      );
    })}
  </div>
);

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Dashboard() {
  const { t } = useTranslation(["admin"]);
  const {
    adminName,
    period, setPeriod, periodOptions,
    categoriaId, setCategoriaId, categorias,
    metrics, chartData,
    players, navigate,
  } = useDashboard();

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden", borderRadius: 16, background: C.navy, padding: "32px 36px", marginBottom: 24 }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "30%", height: "100%", opacity: 0.06, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {t("hero_greeting_prefix")}{adminName}{t("hero_greeting_suffix")}
          </h2>
          <p style={{ color: "#8293b8", fontSize: 15, maxWidth: 560, lineHeight: 1.6 }}>{t("hero_status")}</p>
        </div>
      </section>

      {/* ── Métricas ──────────────────────────────────────────────────────── */}
      <div className="metric-grid">
        <MetricCard icon={Users}         iconBg="#eff6ff" iconColor="#3b82f6" label={t("metric_total_players")}      {...metrics.totalPlayers}      />
        <MetricCard icon={Gamepad2}      iconBg="#fff7ed" iconColor={C.orange} label={t("metric_active_matches")}    {...metrics.activeMatches}     />
        <MetricCard icon={HelpCircle}    iconBg="#f0fdf4" iconColor="#16a34a"  label={t("metric_questions_asked")}   {...metrics.questionsAsked}    />
        <MetricCard icon={ClipboardList} iconBg="#fef2f2" iconColor={C.red}    label={t("metric_questions_to_review")} {...metrics.questionsToReview} />
      </div>

      {/* ── Gráficos + Top Players ─────────────────────────────────────────── */}
      <div className="chart-section">

        {/* Gráfico de categorías */}
        <div style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{t("chart_title")}</h4>
              <p style={{ fontSize: 14, color: C.outline, marginTop: 2 }}>{t("chart_subtitle")}</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ background: "#f1f5f9", borderRadius: 8, padding: 4, display: "flex" }}>
                {periodOptions.map((key) => (
                  <button
                    key={key}
                    onClick={() => setPeriod(key)}
                    style={{ padding: "4px 12px", fontSize: 12, fontWeight: 700, borderRadius: 6, border: "none", cursor: "pointer", background: period === key ? "white" : "transparent", color: period === key ? C.textPrimary : C.outline, boxShadow: period === key ? "0 1px 2px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}
                  >
                    {t(`period_${key}`)}
                  </button>
                ))}
              </div>
              <select
                value={categoriaId ?? ""}
                onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 600, color: C.outline, cursor: "pointer" }}
              >
                <option value="">{t("filter_button")}</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="chart-inner">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: C.outline, textTransform: "uppercase", marginBottom: 12 }}>
                {categoriaId ? t("chart_fail_rate") : t("chart_hard_top5")}
              </p>
              <BarChart bars={chartData.hard} accent="#ef4444" />
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "stretch", marginTop: 8, gap: "8px" }}>
                {chartData.hardLabels.map((l, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.outline, fontWeight: 600, wordBreak: "break-word", lineHeight: "1.1" }}>{l}</span>)}
              </div>
            </div>
            <div style={{ width: 1, background: "#f1f5f9" }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: C.outline, textTransform: "uppercase", marginBottom: 12 }}>
                {categoriaId ? t("chart_success_rate") : t("chart_easy_top5")}
              </p>
              <BarChart bars={chartData.easy} accent={C.emerald} />
              <div style={{ display: "flex", justifyContent: "space-around", alignItems: "stretch", marginTop: 8, gap: "8px" }}>
                {chartData.easyLabels.map((l, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.outline, fontWeight: 600, wordBreak: "break-word", lineHeight: "1.1" }}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>

        {/* Card Top Players */}
        <div style={{ background: C.navy, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden", position: "relative", boxShadow: "0 4px 20px rgba(26,43,75,0.3)" }}>
          <div style={{ position: "absolute", top: -32, right: -32, width: 128, height: 128, background: C.red, opacity: 0.12, borderRadius: "50%", filter: "blur(40px)" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
              <Trophy size={28} color="white" />
            </div>
            <h4 style={{ color: "white", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{t("top_players_title")}</h4>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>{t("top_players_subtitle")}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 14px", marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.emerald }} />
              <span style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{t("top_players_status")}</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/players/leaderboard")}
            style={{ width: "100%", background: "white", color: C.navy, border: "none", borderRadius: 12, padding: "12px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", position: "relative", zIndex: 1 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {t("top_players_cta")}
          </button>
        </div>
      </div>

      {/* ── Tabla de jugadores recientes ──────────────────────────────────── */}
      <section style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary }}>{t("recent_players_title")}</h4>
          <button onClick={() => navigate("/admin/players")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 700, fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer" }}>
            {t("view_all")}
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {[t("table_header_account_id"), t("table_header_player"), t("table_header_ia_status"), t("table_header_last_connection"), t("table_header_action")].map((h) => (
                  <th key={h} style={{ padding: "10px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: C.outline, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr
                  key={i}
                  style={{ borderTop: `1px solid ${C.border}`, transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 700, color: C.textPrimary }}>#{p.id}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <Avatar avatarUrl={p.avatarUrl} name={p.name} />
                      <p style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary }}>{p.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: "14px 24px", fontSize: 14, fontWeight: 600, color: C.outline }}>{p.score ?? "—"} pts</td>
                  <td style={{ padding: "14px 24px", fontSize: 14, color: C.outline }}>{p.lastSeen}</td>
                  <td style={{ padding: "14px 24px" }}>
                    <button onClick={() => navigate(`/admin/players/profiles/${p.id}`)} style={{ background: "none", border: "none", cursor: "pointer", color: C.outline, padding: 4 }}>
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}