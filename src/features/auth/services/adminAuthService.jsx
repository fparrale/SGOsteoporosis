// ─────────────────────────────────────────────────────────────
//  services/adminAuthService.js
//  Capa de acceso a datos: toda comunicación con la API REST
// ─────────────────────────────────────────────────────────────

import { API_URL } from '../constants/adminLoginConstants';

/**
 * Realiza el login de un administrador contra la API.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ ok: boolean, data: object }>}
 *   - ok   → true si el servidor devolvió 2xx
 *   - data → cuerpo JSON de la respuesta
 * @throws {Error} Si ocurre un fallo de red (sin respuesta del servidor)
 */
export async function loginAdmin({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), password }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {
      error: 'El servidor devolvió una respuesta no válida (no JSON).',
    };
  }

  return { ok: response.ok, status: response.status, data };
}

/**
 * Decodifica el payload de un JWT (solo lectura en cliente; no valida firma).
 *
 * @param {string} token
 * @returns {object|null} claims (incluye iat/exp si el backend los envía)
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(pad);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Persiste solo el JWT. No guardamos email/nombre/rol en otra clave de localStorage
 * (evita duplicar datos sensibles; el riesgo XSS sigue afectando al token: mitigar con cookies httpOnly si lo exige auditoría).
 *
 * @param {{ token: string }} payload
 */
export function saveAdminSession({ token }) {
  localStorage.setItem('admin_token', token);
  localStorage.removeItem('admin_info');
}

/**
 * Elimina la sesión del administrador del localStorage.
 */
export function clearAdminSession() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_info');
}

/**
 * Evalúa la respuesta de fetch y, si indica sesión inválida (401) o cuenta
 * desactivada (403), limpia la sesión y redirige al login.
 *
 * @param {Response} response
 * @param {{ error?: string }} body  — cuerpo JSON ya parseado
 * @returns {boolean} true si se forzó el cierre de sesión
 */
export function handleSessionExpired(response, body) {
  const forceLogout =
    response.status === 401 ||
    (response.status === 403 &&
      ['Cuenta desactivada', 'Acceso revocado', 'Cuenta no encontrada'].includes(body?.error ?? ''));

  if (forceLogout) {
    clearAdminSession();
    window.location.href = '/admin-login';
    return true;
  }
  return false;
}

/**
 * @returns {boolean} true si hay token y el JWT no está vencido (claim `exp`).
 */
export function isAdminSessionValid() {
  const token = localStorage.getItem('admin_token');
  if (!token) return false;
  const claims = decodeJwtPayload(token);
  if (!claims) return false;
  if (typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now()) {
    clearAdminSession();
    return false;
  }
  return true;
}

/**
 * Token persistido + claims mínimos leídos del JWT (sin segunda copia en localStorage).
 *
 * @returns {{ token: string|null, admin: { id: number, rol: string }|null }}
 */
export function getAdminSession() {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return { token: null, admin: null };
  }
  const claims = decodeJwtPayload(token);
  if (!claims || claims.id == null) {
    return { token, admin: null };
  }
  const admin = {
    id:     claims.id,
    rol:    claims.rol    ?? '',
    nombre: claims.nombre ?? '',
  };
  return { token, admin };
}