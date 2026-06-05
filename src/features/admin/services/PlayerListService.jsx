// ─── PlayerListService.jsx ────────────────────────────────────────────────────
// Capa de servicio: toda comunicación con la API de jugadores vive aquí.
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminSession } from "../../auth/services/adminAuthService";

const DICEBEAR_BASE = "https://api.dicebear.com/9.x/fun-emoji/svg";

export function getAvatarUrl(seed) {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`;
}

function authHeaders() {
  const { token } = getAdminSession();
  return { Authorization: `Bearer ${token}` };
}

async function apiGet(url) {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Lista todos los jugadores activos.
 * @param {string} [search]
 * @returns {Promise<Array<{ id, name, age, seed, status }>>}
 */
export async function fetchPlayers(search = "") {
  const qs  = search ? `?search=${encodeURIComponent(search)}` : "";
  const data = await apiGet(`/api/admin/players${qs}`);
  return data.players ?? [];
}

/**
 * Estadísticas completas de un jugador.
 * @param {number|string} playerId  — ID numérico del jugador
 */
export async function fetchPlayerStats(playerId) {
  const data = await apiGet(`/api/admin/players/${playerId}/stats`);
  return data;
}

/**
 * Historial de sesiones de un jugador.
 * @param {number|string} playerId
 * @returns {Promise<Array>}
 */
export async function fetchPlayerSessions(playerId) {
  const data = await apiGet(`/api/admin/players/${playerId}/sessions`);
  return data.sessions ?? [];
}

/**
 * Top 10 del leaderboard.
 * @returns {Promise<Array>}
 */
export async function fetchLeaderboard() {
  const data = await apiGet("/api/admin/leaderboard");
  return data.leaderboard ?? [];
}
