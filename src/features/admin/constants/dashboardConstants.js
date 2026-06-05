// ─── DashboardConstants.js ────────────────────────────────────────────────────
// Centraliza todas las constantes del módulo Dashboard.
// ─────────────────────────────────────────────────────────────────────────────

/** Colores de badge por estado de jugador reciente. */
  export const STATUS_BADGE_COLOR = {
    green:  "#d1fae5",
    orange: "#ffedd5",
    red:    "#fee2e2",
  };
  
  /** Opciones de período para el selector del gráfico. */
  export const PERIOD_OPTIONS = ["week", "month"]; // valores que se envían al backend
  
  /** Cuántas categorías mostrar en cada grupo del gráfico. */
  export const CHART_TOP_N = 5;
  
  /** Valores por defecto de métricas mientras cargan los datos reales. */
  export const DEFAULT_METRICS = {
    totalPlayers:      { value: 0, trend: "+0%",    trendDir: "up"     },
    activeMatches:     { value: 0, trend: "+0%",    trendDir: "up"     },
    questionsAsked:    { value: 0, trend: "Estable", trendDir: "stable" },
    questionsToReview: { value: 0, trend: "-0",     trendDir: "down"   },
  };
  
  /** Estado inicial vacío del gráfico de categorías. */
  export const DEFAULT_CHART_DATA = {
    hard:       [],
    easy:       [],
    hardLabels: [],
    easyLabels: [],
  };