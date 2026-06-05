import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidenav from '../components/Sidenav';
import Header from '../components/Header';
import RoleRouteGuard from '../../auth/components/RoleRouteGuard';
import { C } from '../constants/constants';
import { Home, Users, BrainCircuit, Menu, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAdminSession } from '../../auth/services/adminAuthService';
import './AdminLayout.css';

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useTranslation('admin');
  const location = useLocation();

  // Obtenemos el rol real del usuario logueado
  const { admin } = getAdminSession();
  const rol = admin?.rol ?? 'Administrador';
  const isSuperAdmin = rol === 'Superadministrador';

  const sW = collapsed ? 72 : 260;

  const NAV_ITEMS = isSuperAdmin
    ? [
        { icon: Menu,        labelKey: 'nav_mobile_menu',         action: () => setMobileOpen(true) },
        { icon: Home,        labelKey: 'nav_mobile_home',         path: '/admin' },
        { icon: ShieldCheck, labelKey: 'nav_mobile_superadmin',   path: '/admin/superadmin/admins' },
        { icon: BrainCircuit,labelKey: 'nav_mobile_ia_analysis',  path: '/admin/analysis/ia-configuration' },
      ]
    : [
        { icon: Menu,        labelKey: 'nav_mobile_menu',         action: () => setMobileOpen(true) },
        { icon: Home,        labelKey: 'nav_mobile_home',         path: '/admin' },
        { icon: Users,       labelKey: 'nav_mobile_players',      path: '/admin/players/leaderboard' },
        { icon: BrainCircuit,labelKey: 'nav_mobile_ia_analysis',  path: '/admin/analysis/ia-configuration' },
      ];

  return (
    // data-role se usa en CSS para cambiar los colores del tema
    <div className="admin-root" data-role={isSuperAdmin ? 'superadmin' : 'admin'}>
      <Sidenav
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(v => !v)}
        rol={rol}
      />

      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <div className="main-content" style={{ '--sidebar-width': `${sW}px` }}>
        <Header onMenuClick={() => setMobileOpen(true)} rol={rol} />
        <main className="main-inner">
          <RoleRouteGuard />
        </main>
      </div>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ icon: Icon, labelKey, path, action }) => {
          if (action) {
            return (
              <button key={labelKey} onClick={action} className="bottom-nav-item">
                <Icon size={20} />
                <span>{t(labelKey)}</span>
              </button>
            );
          }
          const isActive = location.pathname === path;
          return (
            <Link
              key={labelKey}
              to={path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}