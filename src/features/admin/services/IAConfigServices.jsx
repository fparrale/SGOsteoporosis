// ─── IAConfigServices.jsx — API configuración IA ─────────────────────────────

import { API_URL } from "../../auth/constants/adminLoginConstants";
import { handleSessionExpired } from "../../auth/services/adminAuthService";

const AUTH_HEADER = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("admin_token")
    ? { Authorization: `Bearer ${localStorage.getItem("admin_token")}` }
    : {}),
});

function handleUnauthorized(response, body) {
  if (handleSessionExpired(response, body)) {
    throw new Error(body?.error ?? "No autorizado");
  }
}

/**
 * @returns {Promise<object|null>} forma UI o null si falla
 */
export async function fetchIAConfig() {
  const response = await fetch(`${API_URL}/admin/ia-config`, {
    method: "GET",
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
    console.error("[IAConfig] fetch", body.error ?? response.status);
    return null;
  }

  if (!body.config) return null;

  const c = body.config;
  return {
    provider: c.provider,
    model: c.model,
    prompt: c.prompt,
    temperature: Number(c.temperature),
    api_key_gemini_set: Boolean(c.api_key_gemini_set),
    api_key_openai_set: Boolean(c.api_key_openai_set),
    ollama_base_url: c.ollama_base_url ?? "",
  };
}

/**
 * @param {{ prompt: string, temperature: number }} fields
 */
export async function saveIAConfig(fields) {
  const payload = {
    prompt: fields.prompt,
    temperature: fields.temperature,
  };

  const response = await fetch(`${API_URL}/admin/ia-config`, {
    method: "PUT",
    headers: AUTH_HEADER(),
    body: JSON.stringify(payload),
  });

  let body = {};
  try {
    body = await response.json();
  } catch {
    body = {};
  }

  if (!response.ok) {
    handleUnauthorized(response, body);
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  if (!body.config) {
    throw new Error("Respuesta sin config");
  }

  const c = body.config;
  return {
    provider: c.provider,
    model: c.model,
    prompt: c.prompt,
    temperature: Number(c.temperature),
    api_key_gemini_set: Boolean(c.api_key_gemini_set),
    api_key_openai_set: Boolean(c.api_key_openai_set),
    ollama_base_url: c.ollama_base_url ?? "",
  };
}

/**
 * GET admin/ia-models — lista los modelos de la BD sin exponer API keys.
 * Accesible a cualquier rol admin.
 * @returns {Promise<Array>}
 */
export async function fetchAdminIAModels() {
  const response = await fetch(`${API_URL}/admin/ia-models`, {
    method: "GET",
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
    console.error("[IAConfig] fetchAdminIAModels", body.error ?? response.status);
    return [];
  }

  return body.data ?? [];
}

/**
 * PUT admin/ia-models/:id/select — selecciona el modelo activo.
 * @param {number} id
 */
export async function selectAdminIAModel(id) {
  const response = await fetch(`${API_URL}/admin/ia-models/${id}/select`, {
    method: "PUT",
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body;
}

/**
 * GET admin/categories — categorías activas para el modal de generación.
 * @returns {Promise<Array<{id, codigo, nombre, descripcion, icono}>>}
 */
export async function fetchCategories() {
  const response = await fetch(`${API_URL}/admin/categories`, {
    method: "GET",
    headers: AUTH_HEADER(),
  });

  let body = {};
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    handleUnauthorized(response, body);
    console.error("[IAConfig] fetchCategories", body.error ?? response.status);
    return [];
  }

  return body.data ?? [];
}

/**
 * POST admin/ia/generate — genera preguntas con IA y las guarda en BD.
 * @param {{ categoria_id: number, dificultad: string, cantidad: number, idioma: string }} params
 * @returns {Promise<{ preguntas_generadas: number, errores: number, ids: number[] }>}
 */
export async function generateQuestions(params) {
  const response = await fetch(`${API_URL}/admin/ia/generate`, {
    method: "POST",
    headers: AUTH_HEADER(),
    body: JSON.stringify(params),
  });

  let body = {};
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    handleUnauthorized(response, body);
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body;
}

/**
 * GET admin/ia/suggest?idioma=es|en — devuelve las sugerencias guardadas en BD filtradas por idioma.
 * @param {'es'|'en'} [idioma]
 * @returns {Promise<Array<{id, nombre, descripcion, icono}>>}
 */
export async function fetchStoredSuggestions(idioma) {
  const qs = idioma ? `?idioma=${idioma}` : '';
  const response = await fetch(`${API_URL}/admin/ia/suggest${qs}`, {
    method: 'GET',
    headers: AUTH_HEADER(),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) {
    handleUnauthorized(response, body);
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }
  return body.data ?? [];
}

/**
 * POST admin/ia/suggest — sugerencias de categorías con IA.
 * @param {{ tema: string, idioma: string }} params
 * @returns {Promise<Array<{id, nombre, descripcion, icono}>>}
 */
export async function suggestCategories(params) {
  const response = await fetch(`${API_URL}/admin/ia/suggest`, {
    method: "POST",
    headers: AUTH_HEADER(),
    body: JSON.stringify(params),
  });

  let body = {};
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    handleUnauthorized(response, body);
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data ?? [];
}

// ─── CATEGORÍAS CRUD ─────────────────────────────────────────────────────────

/**
 * GET admin/categories — lista con conteo de preguntas (para la vista Categories).
 * @returns {Promise<Array<{id, codigo, nombre, descripcion, icono, question_count}>>}
 */
export async function fetchCategoriesWithCount() {
  const response = await fetch(`${API_URL}/admin/categories`, {
    method: 'GET',
    headers: AUTH_HEADER(),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body.data ?? [];
}

/**
 * POST admin/categories — crear categoría.
 * @param {{ nombre: string, descripcion?: string, icono?: string }} data
 */
export async function createCategory(data) {
  const response = await fetch(`${API_URL}/admin/categories`, {
    method: 'POST',
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body.data;
}

/**
 * PUT admin/categories/:id — actualizar categoría.
 * @param {number} id
 * @param {{ nombre: string, descripcion?: string, icono?: string }} data
 */
export async function updateCategory(id, data) {
  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'PUT',
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body.data;
}

/**
 * DELETE admin/categories/:id — soft-delete categoría.
 * @param {number} id
 */
export async function deleteCategory(id) {
  const response = await fetch(`${API_URL}/admin/categories/${id}`, {
    method: 'DELETE',
    headers: AUTH_HEADER(),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body;
}

// ─── PREGUNTAS CRUD ───────────────────────────────────────────────────────────

/**
 * GET admin/questions — todas las preguntas con filtros opcionales.
 * @param {{ search?: string, categoria_id?: number, dificultad?: string }} params
 * @returns {Promise<Array>}
 */
export async function fetchQuestion(id) {
  const response = await fetch(`${API_URL}/admin/questions/${id}`, { method: 'GET', headers: AUTH_HEADER() });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body.data;
}

export async function fetchQuestions(params = {}) {
  const qs = new URLSearchParams();
  if (params.page)         qs.set('page',         params.page);
  if (params.limit)        qs.set('limit',        params.limit);
  if (params.search)       qs.set('search',       params.search);
  if (params.categoria_id) qs.set('categoria_id', params.categoria_id);
  if (params.dificultad)   qs.set('dificultad',   params.dificultad);
  if (params.estado)       qs.set('estado',       params.estado);
  if (params.idioma)       qs.set('idioma',       params.idioma);

  const url = `${API_URL}/admin/questions${qs.toString() ? '?' + qs.toString() : ''}`;
  const response = await fetch(url, { method: 'GET', headers: AUTH_HEADER() });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return { data: body.data ?? [], total: body.total ?? 0, stats: body.stats ?? {} };
}

/**
 * PUT admin/questions/:id — actualizar pregunta.
 * @param {number} id
 * @param {{ pregunta, dificultad, estado, explicacion_correcta?, explicacion_incorrecta?, fuente_referencia? }} data
 */
export async function updateQuestion(id, data) {
  const response = await fetch(`${API_URL}/admin/questions/${id}`, {
    method: 'PUT',
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body;
}

/**
 * DELETE admin/questions/:id — eliminar pregunta.
 * @param {number} id
 */
export async function deleteQuestion(id) {
  const response = await fetch(`${API_URL}/admin/questions/${id}`, {
    method: 'DELETE',
    headers: AUTH_HEADER(),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) { handleUnauthorized(response, body); throw new Error(body.error ?? `HTTP ${response.status}`); }
  return body;
}

/**
 * GET admin/ia/generation-log — historial de lotes de preguntas generadas por IA.
 * @returns {Promise<Array<{id, preguntas_generadas, preguntas_solicitadas, idioma, modelo_utilizado, created_at, categoria_nombre}>>}
 */
export async function fetchGenerationLog() {
  const response = await fetch(`${API_URL}/admin/ia/generation-log`, {
    method: 'GET',
    headers: AUTH_HEADER(),
  });
  let body = {};
  try { body = await response.json(); } catch { body = {}; }
  if (!response.ok) {
    handleUnauthorized(response, body);
    return [];
  }
  return body.data ?? [];
}

export function downloadCSVTemplate() {
  const BOM = '﻿';
  const header = 'pregunta,opcion_a,opcion_b,opcion_c,opcion_d,respuesta_correcta,categoria,dificultad,idioma,explicacion_correcta,explicacion_incorrecta';
  const blob = new Blob([`${BOM}${header}\n`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_preguntas.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function uploadCSVQuestions(file) {
  const formData = new FormData();
  formData.append('archivo', file);

  const headers = {};
  const token = localStorage.getItem("admin_token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/admin/questions/import-csv`, {
    method: 'POST',
    headers,
    body: formData,
  });

  let body = {};
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    handleUnauthorized(response, body);
    return { ok: false, error: body.error ?? `HTTP ${response.status}` };
  }

  return { ok: true, importadas: body.importadas ?? 0, errores: body.errores ?? 0 };
}
