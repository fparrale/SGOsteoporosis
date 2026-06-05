// ─── PlayerListConstants.js ───────────────────────────────────────────────────
// Centraliza todas las constantes del módulo de lista de jugadores.
// ─────────────────────────────────────────────────────────────────────────────

/** Colores de punto de estado por valor de `status`. */
  export const STATUS_COLOR = {
    online:  "#22c55e",
    offline: "#94a3b8",
    away:    "#f59e0b",
  };
  
  /** Opciones disponibles de ítems por página. */
  export const PAGE_OPTIONS = [4, 8, 12, 16];
  
  /** Valor por defecto de ítems por página al montar el componente. */
  export const DEFAULT_PER_PAGE = 8;
  
  /** Máximo de páginas contiguas antes de colapsar con "…". */
  export const MAX_INLINE_PAGES = 5;