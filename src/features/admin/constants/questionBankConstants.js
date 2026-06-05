// ─────────────────────────────────────────────
//  constants/questionBankConstants.js
//  Todas las constantes de QuestionBank
// ─────────────────────────────────────────────

export const CATEGORIES = [
    "Salud y Bienestar",
    "Salud Ósea",
    "Prevención",
    "Concientización",
    "Aprender",
  ];
  
  export const DIFFICULTIES_KEYS = [
    "difficulty_very_easy",
    "difficulty_easy",
    "difficulty_basic",
    "difficulty_intermediate",
    "difficulty_advanced",
  ];
  
  export const LANGUAGES = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ];
  
  export const OPTION_LABELS = ["A", "B", "C", "D"];

export const PAGE_SIZE = 10;

// ── Mapeos BD ↔ frontend ──────────────────────────────────────────────────────
// dificultad (BD enum → clave i18n frontend)
export const DB_TO_DIFF = {
  muy_facil:   "difficulty_very_easy",
  facil:       "difficulty_easy",
  intermedio:  "difficulty_basic",
  dificil:     "difficulty_intermediate",
  muy_dificil: "difficulty_advanced",
};

export const DIFF_TO_DB = {
  difficulty_very_easy:    "muy_facil",
  difficulty_easy:         "facil",
  difficulty_basic:        "intermedio",
  difficulty_intermediate: "dificil",
  difficulty_advanced:     "muy_dificil",
};

// estado (BD enum → clave i18n frontend)
export const DB_TO_STATUS = {
  borrador:   "status_draft",
  verificada: "status_verified",
  archivada:  "status_unverified",
};

export const STATUS_TO_DB = {
  status_draft:       "borrador",
  status_verified:    "verificada",
  status_unverified:  "archivada",
};