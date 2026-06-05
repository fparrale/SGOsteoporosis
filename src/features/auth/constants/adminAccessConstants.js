/**
 * Reglas de navegación por rol dentro de `/admin`.
 *
 * Clave `_default`: roles sin entrada explícita → acceso completo al panel.
 *
 * IMPORTANTE: Superadministrador tiene acceso a TODO incluyendo /admin/superadmin/*.
 * Los demás roles (Administrador, Dev, _default) también acceden a /admin/* pero
 * RoleRouteGuard con allowedRoles={['Superadministrador']} bloquea /superadmin/* en las rutas.
 */
export const ROLE_ROUTE_RULES = {
  Auditor: {
    allowedPrefixes: ['/admin/auditoria'],
    defaultRedirect: '/admin/auditoria',
  },
  _default: {
    allowedPrefixes: ['/admin'],
    defaultRedirect: '/admin',
  },
};

/**
 * Prefijo de rutas exclusivas del superadmin.
 * RoleRouteGuard lo usa en Modo 2 (allowedRoles) — no necesitas tocarlo.
 */
export const SUPERADMIN_ONLY_PREFIX = '/admin/superadmin';