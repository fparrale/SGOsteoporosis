// ─── useDashboard.jsx ─────────────────────────────────────────────────────────
// Hook que encapsula todo el estado, efectos y lógica derivada del Dashboard.
// El componente (Vista) solo consume lo que este hook expone.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { getAdminSession }     from "../../auth/services/adminAuthService";
import { useQuestionBank }     from "./useQuestionBank";
import {
  DEFAULT_METRICS,
  DEFAULT_CHART_DATA,
  CHART_TOP_N,
  PERIOD_OPTIONS,
} from "../constants/dashboardConstants";
import { fetchDashboardMetrics, getAvatarUrl } from "../services/DashboardService";

export function useDashboard() {
  const navigate = useNavigate();

  // Nombre del admin leído del JWT (sin round-trip extra)
  const { admin } = getAdminSession();
  const adminName = admin?.nombre ?? admin?.rol ?? "";

  const [period,      setPeriod]      = useState(PERIOD_OPTIONS[0]); // 'week' | 'month'
  const [categoriaId, setCategoriaId] = useState(null);             // null = todas
  const [categorias,  setCategorias]  = useState([]);               // lista para el dropdown
  const [metrics,     setMetrics]     = useState(DEFAULT_METRICS);
  const [chartData,   setChartData]   = useState(DEFAULT_CHART_DATA);
  const [players,     setPlayers]     = useState([]);

  const { stats: questionStats, questions } = useQuestionBank();

  const buildDashboard = useCallback(async () => {
    // ── Métricas en tiempo real desde la BD ───────────────────────────────
    let totalPlayers  = 0;
    let activeMatches = 0;
    let recentPlayers = [];

    let hardCats = [];
    let easyCats = [];

    try {
      const data = await fetchDashboardMetrics(period, categoriaId);
      totalPlayers  = data.totalPlayers  ?? 0;
      activeMatches = data.activeMatches ?? 0;
      recentPlayers = (data.recentPlayers ?? []).map((p) => ({
        ...p,
        avatarUrl: getAvatarUrl(p.seed),
      }));
      hardCats = data.hardCategories ?? [];
      easyCats = data.easyCategories ?? [];
      setCategorias(data.categorias ?? []);
    } catch {
      // Deja los valores en 0 si la petición falla
    }

    setMetrics({
      totalPlayers: {
        value:    totalPlayers,
        trend:    "+0%",
        trendDir: "stable",
      },
      activeMatches: {
        value:    activeMatches,
        trend:    activeMatches > 0 ? "En vivo" : "Sin partidas",
        trendDir: activeMatches > 0 ? "up" : "stable",
      },
      questionsAsked: {
        value:    questionStats.totalQuestions,
        trend:    "Estable",
        trendDir: "stable",
      },
      questionsToReview: {
        value:    questionStats.unverifiedCount,
        trend:    `-${questionStats.unverifiedCount > 0 ? 1 : 0}`,
        trendDir: "down",
      },
    });

    setPlayers(recentPlayers);

    // ── Gráfico: rendimiento real por categoría desde el backend ─────────
    if (hardCats.length > 0 || easyCats.length > 0) {
      // Difíciles: invertir (100 - precisión) → menor acierto = barra más alta
      const hardInverted = hardCats.map(c => 100 - c.precision_promedio);
      const maxHard = Math.max(...hardInverted, 1);
      const maxEasy = Math.max(...easyCats.map(c => c.precision_promedio), 1);

      setChartData({
        // pct = porcentaje real que se muestra encima de cada barra
        hard: hardInverted.map((v, i) => ({
          value: Math.round((v / maxHard) * 100),
          pct:   Math.round(100 - hardCats[i].precision_promedio), // % de fallos
        })),
        easy: easyCats.map(c => ({
          value: Math.round((c.precision_promedio / maxEasy) * 100),
          pct:   Math.round(c.precision_promedio),                 // % de aciertos
        })),
        hardLabels: hardCats.map(c => c.categoria),
        easyLabels: easyCats.map(c => c.categoria),
      });
    } else {
      // Fallback: sin datos de juego aún, mostrar distribución de preguntas
      const categoryCounts = questions.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {});
      const sorted = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a);
      const top    = sorted.slice(0, CHART_TOP_N);
      const bottom = sorted.slice(-CHART_TOP_N).reverse();
      const maxHard = top.length    > 0 ? Math.max(...top.map(([, v])    => v)) : 1;
      const maxEasy = bottom.length > 0 ? Math.max(...bottom.map(([, v]) => v)) : 1;
      setChartData({
        hard:       top.map(([, v])    => ({ value: Math.round((v / maxHard) * 100) })),
        easy:       bottom.map(([, v]) => ({ value: Math.round((v / maxEasy) * 100) })),
        hardLabels: top.map(([k])      => k),
        easyLabels: bottom.map(([k])   => k),
      });
    }
  }, [period, categoriaId, questionStats, questions]);

  useEffect(() => {
    buildDashboard();
  }, [buildDashboard]);

  return {
    adminName,
    period,      setPeriod,
    categoriaId, setCategoriaId,
    categorias,
    periodOptions: PERIOD_OPTIONS,
    metrics,
    chartData,
    players,
    navigate,
  };
}
