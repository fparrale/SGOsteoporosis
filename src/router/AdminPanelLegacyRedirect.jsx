import { Navigate, useLocation } from 'react-router-dom';

/** Compatibilidad con enlaces antiguos `/admin-panel/...` → `/admin/...` */
export default function AdminPanelLegacyRedirect() {
  const loc = useLocation();
  const path = loc.pathname.replace(/^\/admin-panel/, '/admin') || '/admin';
  const to = `${path}${loc.search}${loc.hash}`;
  return <Navigate to={to} replace />;
}
