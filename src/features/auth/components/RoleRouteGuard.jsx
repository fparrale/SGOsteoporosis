import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getAdminSession } from '../services/adminAuthService';
import { ROLE_ROUTE_RULES } from '../constants/adminAccessConstants';

/**
 * RoleRouteGuard — dos modos de uso:
 *
 * MODO 1 — Sin props (igual que antes):
 *   Verifica si la ruta actual está permitida para el rol del usuario
 *   según ROLE_ROUTE_RULES. Redirige al defaultRedirect si no está permitida.
 *
 *   <RoleRouteGuard />
 *
 * MODO 2 — Con allowedRoles (nuevo):
 *   Actúa como wrapper de rutas hijas. Solo deja pasar a los roles
 *   especificados en el array. Redirige a /admin si el rol no está permitido.
 *   Úsalo en AdminRoutes como elemento padre de un grupo de rutas protegidas.
 *
 *   <RoleRouteGuard allowedRoles={['Superadministrador']} />
 *     <Route path="superadmin/admins" element={<GestionAdmins />} />
 *   </RoleRouteGuard>
 */
export default function RoleRouteGuard({ allowedRoles }) {
  const location = useLocation();
  const { admin } = getAdminSession();
  const rol = admin?.rol ?? '';

  // ── MODO 2: lista explícita de roles permitidos ────────────
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(rol)) {
      // Redirige al dashboard del admin si intenta acceder sin permiso
      return <Navigate to="/admin" replace />;
    }
    return <Outlet />;
  }

  // ── MODO 1: lógica original por prefijos ──────────────────
  const rules = ROLE_ROUTE_RULES[rol] ?? ROLE_ROUTE_RULES._default;
  const path = location.pathname;
  const allowed = rules.allowedPrefixes.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );

  if (!allowed) {
    return <Navigate to={rules.defaultRedirect} replace />;
  }

  return <Outlet />;
}