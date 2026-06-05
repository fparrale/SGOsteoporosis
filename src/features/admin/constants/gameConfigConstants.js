// ─── GameConfigConstants.js ───────────────────────────────────────────────────
// Centraliza todas las constantes del módulo de configuración de torneos.
// Importar desde aquí; nunca hardcodear valores en componentes ni en el hook.
// ─────────────────────────────────────────────────────────────────────────────

export const DIFFICULTIES = [
    "difficulty_all",
    "difficulty_very_easy",
    "difficulty_easy",
    "difficulty_medium",
    "difficulty_hard",
    "difficulty_very_hard",
  ];
  
  export const LIVES_OPTIONS = [
    "lives_one_hard",
    "lives_two",
    "lives_three_standard",
    "lives_five_easy",
    "lives_unlimited",
  ];
  
  export const LANGUAGES = ["Español", "English"];
  
  export const QUESTIONS_MIN = 4;
  export const QUESTIONS_MAX = 90;
  
  export const TIME_MIN = 5;   // segundos
  export const TIME_MAX = 120; // segundos
  
  /** Valores por defecto que se usan al inicializar y al hacer "Discard". */
  export const DEFAULTS = {
    questions:  10,
    timePerQ:   30,
    random:     true,
    difficulty: "difficulty_all",
    lives:      "lives_three_standard",
    language:   "Español",
  };