// ─── MatchService.jsx ─────────────────────────────────────────────────────────
// Capa de servicio para salas/partidas. Toda comunicación con la API aquí.
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminSession } from "../../auth/services/adminAuthService";

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

function authHeaders() {
  const { token } = getAdminSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apiRequest(path, options = {}) {
  const url = `${API_URL}${path.replace(/^\/api/, '')}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data;
}

/** Lista todas las salas. */
export async function fetchMatches() {
  const data = await apiRequest("/api/admin/matches");
  return data.rooms ?? [];
}

/** Crea una sala nueva. */
export async function createMatch(form) {
  const data = await apiRequest("/api/admin/matches", {
    method: "POST",
    body: JSON.stringify(form),
  });
  return data.room;
}

/** Edita una sala existente. */
export async function updateMatch(dbId, form) {
  const data = await apiRequest(`/api/admin/matches/${dbId}`, {
    method: "PUT",
    body: JSON.stringify(form),
  });
  return data.room;
}

/** Elimina una sala. */
export async function deleteMatch(dbId) {
  await apiRequest(`/api/admin/matches/${dbId}`, { method: "DELETE" });
}

/** Alterna estado activa ↔ pausada. */
export async function toggleMatch(dbId) {
  const data = await apiRequest(`/api/admin/matches/${dbId}/toggle`, {
    method: "PATCH",
  });
  return data.room;
}

/** Estadísticas completas de una sala (para MatchHistory). */
export async function fetchMatchStats(dbId) {
  const data = await apiRequest(`/api/admin/matches/${dbId}/stats`);
  return data.room;
}

/** Lista de categorías activas (para el modal de crear/editar). */
export async function fetchCategories() {
  const data = await apiRequest("/api/admin/categories");
  return data.data ?? [];
}

/** Conteo de preguntas verificadas según filtros de sala. */
export async function fetchQuestionCount({ language, filterDiff, difficulty, filterCats, categories }) {
  const params = new URLSearchParams({
    language,
    filterDiff: filterDiff ? "true" : "false",
    difficulty,
    filterCats: filterCats ? "true" : "false",
  });
  if (filterCats && categories.length > 0) {
    categories.forEach((cat) => params.append("categories[]", cat));
  }
  const data = await apiRequest(`/api/admin/matches/question-count?${params}`);
  return data.count ?? 0;
}
