// ─── DashboardService.js ──────────────────────────────────────────────────────
// Capa de servicio: toda la comunicación externa vive aquí.
// El hook y el componente nunca deben llamar fetch directamente.
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminSession } from "../../auth/services/adminAuthService";

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/** Base URL de la API de avatares DiceBear. */
const DICEBEAR_BASE = "https://api.dicebear.com/9.x/fun-emoji/svg";

/**
 * Genera la URL del avatar para un seed dado.
 *
 * @param {string} seed
 * @returns {string}
 */
export function getAvatarUrl(seed) {
  return `${DICEBEAR_BASE}?seed=${encodeURIComponent(seed)}`;
}

/**
 * Obtiene métricas del dashboard desde el backend.
 *
 * @param {string}      period      - 'week' | 'month'
 * @param {number|null} categoriaId - ID de categoría para filtrar, o null para todas
 * @returns {Promise<object>}
 */
export async function fetchDashboardMetrics(period = 'week', categoriaId = null) {
  const { token } = getAdminSession();

  const params = new URLSearchParams({ period });
  if (categoriaId !== null) params.append('categoria_id', String(categoriaId));

  const response = await fetch(`${API_URL}/admin/dashboard?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}
