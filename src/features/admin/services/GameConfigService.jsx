// ─── GameConfigService.jsx — API configuración global del juego ──────────────

import { API_URL } from '../../auth/constants/adminLoginConstants';
import { handleSessionExpired } from '../../auth/services/adminAuthService';

const AUTH_HEADER = () => ({
  'Content-Type': 'application/json',
  ...(localStorage.getItem('admin_token')
    ? { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    : {}),
});

function handleUnauthorized(response, body) {
  if (handleSessionExpired(response, body)) {
    throw new Error(body?.error ?? 'No autorizado');
  }
}

/** UI i18n keys → valores ENUM en BD */
const DIFF_UI_TO_DB = {
  difficulty_all: 'todas',
  difficulty_very_easy: 'muy_facil',
  difficulty_easy: 'facil',
  difficulty_medium: 'intermedio',
  difficulty_hard: 'dificil',
  difficulty_very_hard: 'muy_dificil',
};

const DIFF_DB_TO_UI = Object.fromEntries(
  Object.entries(DIFF_UI_TO_DB).map(([k, v]) => [v, k])
);

const LIVES_UI_TO_DB = {
  lives_unlimited: 0,
  lives_one_hard: 1,
  lives_two: 2,
  lives_three_standard: 3,
  lives_five_easy: 5,
};

function livesDbToUi(vidas) {
  const m = {
    0: 'lives_unlimited',
    1: 'lives_one_hard',
    2: 'lives_two',
    3: 'lives_three_standard',
    5: 'lives_five_easy',
  };
  return m[vidas] ?? 'lives_three_standard';
}

const LANG_UI_TO_DB = { Español: 'es', English: 'en' };
const LANG_DB_TO_UI = { es: 'Español', en: 'English' };

/**
 * Normaliza respuesta GET a la forma que usa `useGameConfig` (campos de la vista).
 */
export function mapConfigToUi(config) {
  return {
    questions: config.preguntas_por_partida,
    timePerQ: config.tiempo_por_pregunta,
    random: !!config.aleatoriedad_categorias,
    difficulty:
      DIFF_DB_TO_UI[config.distribucion_dificultad] ?? 'difficulty_all',
    lives: livesDbToUi(Number(config.vidas)),
    language: LANG_DB_TO_UI[config.idioma_default] ?? 'Español',
  };
}

function mapUiToApi(fields) {
  return {
    preguntas_por_partida: fields.questions,
    tiempo_por_pregunta: fields.timePerQ,
    aleatoriedad_categorias: fields.random,
    distribucion_dificultad: DIFF_UI_TO_DB[fields.difficulty] ?? 'todas',
    vidas: LIVES_UI_TO_DB[fields.lives] ?? 3,
    idioma_default: LANG_UI_TO_DB[fields.language] ?? 'es',
  };
}

/**
 * @returns {Promise<object>} objeto en forma UI (mapConfigToUi)
 */
export async function fetchTournamentConfig() {
  const response = await fetch(`${API_URL}/admin/game-config`, {
    method: 'GET',
    headers: AUTH_HEADER(),
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    handleUnauthorized(response, body);
    const msg = body.error ?? `HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (!body.config) {
    throw new Error('Respuesta sin config');
  }

  return mapConfigToUi(body.config);
}

/**
 * @param {object} fields — mismo shape que expone useGameConfig (fields)
 * @returns {Promise<object>} config guardada en forma UI
 */
export async function saveTournamentConfig(fields) {
  const response = await fetch(`${API_URL}/admin/game-config`, {
    method: 'PUT',
    headers: AUTH_HEADER(),
    body: JSON.stringify(mapUiToApi(fields)),
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    handleUnauthorized(response, body);
    const msg = body.error ?? `HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (!body.config) {
    throw new Error('Respuesta sin config');
  }

  return mapConfigToUi(body.config);
}
