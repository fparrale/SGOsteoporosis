// ─── SuperAdminServices.jsx — API para exclusivas del Superadministrador ────

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

// ═══════════════════════════════════════════════════════════════
// MODELOS IA
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/ia-models
 * Lista todos los modelos de IA registrados.
 * El backend oculta la api_key real y solo indica si existe.
 */
export async function fetchIAModels() {
  const response = await fetch(`${API_URL}/superadmin/ia-models`, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data ?? [];
}

/**
 * POST /api/superadmin/ia-models
 * Crea un nuevo modelo de IA.
 */
export async function createIAModel(data) {
  const response = await fetch(`${API_URL}/superadmin/ia-models`, {
    method: "POST",
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
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
 * PUT /api/superadmin/ia-models/:id
 * Actualiza un modelo de IA existente.
 */
export async function updateIAModel(id, data) {
  const response = await fetch(`${API_URL}/superadmin/ia-models/${id}`, {
    method: "PUT",
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
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
 * DELETE /api/superadmin/ia-models/:id
 * Elimina un modelo de IA (no puede eliminar el seleccionado).
 */
export async function deleteIAModel(id) {
  const response = await fetch(`${API_URL}/superadmin/ia-models/${id}`, {
    method: "DELETE",
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
 * PUT /api/superadmin/ia-models/:id/select
 * Selecciona un modelo como activo (desactiva el resto automáticamente).
 */
export async function selectIAModel(id) {
  const response = await fetch(`${API_URL}/superadmin/ia-models/${id}/select`, {
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

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE ADMINS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/admins
 * Lista todos los administradores.
 */
export async function fetchAdmins() {
  const response = await fetch(`${API_URL}/superadmin/admins`, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data ?? [];
}

/**
 * POST /api/superadmin/admins
 * Crea un nuevo administrador.
 */
export async function createAdmin(data) {
  const response = await fetch(`${API_URL}/superadmin/admins`, {
    method: "POST",
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
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
 * PATCH /api/superadmin/admins/:id
 * Alterna el estado activo/inactivo del administrador.
 */
export async function toggleAdmin(id) {
  const response = await fetch(`${API_URL}/superadmin/admins/${id}`, {
    method: "PATCH",
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

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN IA (superadmin)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/ia-config
 */
export async function fetchSuperIAConfig() {
  const response = await fetch(`${API_URL}/superadmin/ia-config`, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data;
}

/**
 * PUT /api/superadmin/ia-config
 */
export async function saveSuperIAConfig(data) {
  const response = await fetch(`${API_URL}/superadmin/ia-config`, {
    method: "PUT",
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
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

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN JUEGO (superadmin)
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/game-config
 */
export async function fetchSuperGameConfig() {
  const response = await fetch(`${API_URL}/superadmin/game-config`, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data;
}

/**
 * PUT /api/superadmin/game-config
 */
export async function saveSuperGameConfig(data) {
  const response = await fetch(`${API_URL}/superadmin/game-config`, {
    method: "PUT",
    headers: AUTH_HEADER(),
    body: JSON.stringify(data),
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

// ═══════════════════════════════════════════════════════════════
// LOGS DEL SISTEMA
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/logs?rol=&accion=&limit=50&offset=0
 */
export async function fetchLogs(filters = {}) {
  const params = new URLSearchParams();
  if (filters.rol) params.set("rol", filters.rol);
  if (filters.accion) params.set("accion", filters.accion);
  if (filters.limit) params.set("limit", filters.limit);
  if (filters.offset) params.set("offset", filters.offset);

  const qs = params.toString();
  const url = `${API_URL}/superadmin/logs${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body.data ?? [];
}

// ═══════════════════════════════════════════════════════════════
// ESTADÍSTICAS GLOBALES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/superadmin/global-stats
 */
export async function fetchGlobalStats() {
  const response = await fetch(`${API_URL}/superadmin/global-stats`, {
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
    throw new Error(body.error ?? `HTTP ${response.status}`);
  }

  return body;
}