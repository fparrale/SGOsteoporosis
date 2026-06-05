// ─────────────────────────────────────────────────────────────
//  constants/adminLoginConstants.js
//  Todas las constantes estáticas del módulo AdminLogin
// ─────────────────────────────────────────────────────────────

/** Base URL de la API (sin barra final) */
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

/**
 * Rutas de destino según el rol del administrador.
 * Si el rol no está en esta tabla, el fallback es '/admin'.
 */
export const ROLE_ROUTES = {
  Dev:                '/admin',
  Superadministrador: '/admin',
  Administrador:      '/admin',
  Auditor:            '/admin/auditoria',
};

/**
 * Variantes de animación para los mensajes de error de campo.
 * Se reutilizan en el banner de error de API y en cada field-error.
 */
export const errorVariants = {
  initial: { opacity: 0, y: -4, height: 0 },
  animate: {
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -4,
    height: 0,
    transition: { duration: 0.15 },
  },
};

/** Tiempo (ms) de espera antes de mostrar el Loader de pantalla completa */
export const LOADER_DELAY_MS = 400;

/** Tiempo (ms) que se mantiene el estado "loginOk" antes de navegar */
export const NAVIGATE_DELAY_MS = 800;