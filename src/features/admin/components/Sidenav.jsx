import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Gamepad2, ChevronDown, ChevronLeft, ChevronRight, User, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clearAdminSession, getAdminSession } from '../../auth/services/adminAuthService';
import { C, NAV, SUPERADMIN_NAV } from '../constants/constants';

/**
 * Sidenav — mismo componente para Admin y Superadmin.
 * Prop `rol` controla:
 *   - Qué ítems se muestran (NAV vs SUPERADMIN_NAV)
 *   - El color del sidebar (C.navy vs C.superNavy)
 *   - El acento de hover/activo (azul vs violeta)
 */
function Sidebar({ mobileOpen, onClose, collapsed, onToggleCollapse, rol }) {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const userMenuRef = useRef(null);

  const isSuperAdmin = rol === 'Superadministrador';
  const navItems     = isSuperAdmin ? SUPERADMIN_NAV : NAV;

  // Colores según rol
  const sidebarBg    = isSuperAdmin ? '#1a0f2e' : C.navy;
  const accentRGB    = isSuperAdmin ? '124,58,237'  : '59,130,246';
  const accentBorder = isSuperAdmin ? '#a78bfa'     : '#60a5fa';
  const avatarBg     = isSuperAdmin ? 'rgba(167,139,250,0.2)' : 'rgba(96,165,250,0.2)';
  const avatarColor  = isSuperAdmin ? '#a78bfa'     : '#60a5fa';

  // Datos del usuario logueado
  const { admin } = getAdminSession();
  const adminInitials = admin?.nombre
    ? admin.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin-login', { replace: true });
  };

  const toggleMenu = (label) => {
    if (collapsed) return;
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    if (mobileOpen) onClose();
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sW = collapsed ? 72 : 260;

  // ── Estilos compartidos ────────────────────────────────────
  const itemBase = (isActive, isSuperItem = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: collapsed ? 0 : 12,
    justifyContent: collapsed ? 'center' : 'flex-start',
    padding: collapsed ? '10px 0' : '10px 12px',
    borderRadius: 8,
    background: isActive ? `rgba(${accentRGB},0.2)` : 'transparent',
    borderLeft: isActive ? `3px solid ${accentBorder}` : '3px solid transparent',
    color: isActive ? 'white' : isSuperItem ? accentBorder : 'rgba(203,213,225,0.85)',
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'background 0.15s',
  });

  const renderNavItem = (item) => {
    const { icon: Icon, label, children, path, superAdminOnly } = item;
    const hasChildren = children && children.length > 0;
    const isActive = location.pathname === path ||
      (hasChildren && children.some(c => location.pathname.startsWith(c.path)));
    const isOpen = hasChildren && (!!openMenus[label] || isActive);

    if (hasChildren) {
      return (
        <div key={label}>
          <div
            onClick={() => toggleMenu(label)}
            title={collapsed ? t(label) : undefined}
            style={{
              ...itemBase(isActive && !path, superAdminOnly),
              background: isActive && !path ? `rgba(${accentRGB},0.2)` : 'transparent',
              borderLeft: '3px solid transparent',
            }}
            onMouseEnter={e => { if (!isActive || path) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isActive && !path ? `rgba(${accentRGB},0.2)` : 'transparent'; }}
          >
            <Icon size={18} style={{ flexShrink: 0, color: superAdminOnly ? accentBorder : undefined }} />
            {!collapsed && (
              <>
                <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{t(label)}</span>
                <ChevronDown
                  size={15}
                  style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.6 }}
                />
              </>
            )}
          </div>

          {!collapsed && (
            <div style={{ maxHeight: isOpen ? `${children.length * 44}px` : '0px', overflow: 'hidden', transition: 'max-height 0.25s ease' }}>
              {children.map(({ icon: SubIcon, label: sub, path: subPath }) => {
                const isSubActive = location.pathname === subPath || (
                  location.pathname.startsWith(subPath + '/') &&
                  !children.some(
                    c => c.path !== subPath &&
                         c.path.length > subPath.length &&
                         (location.pathname === c.path || location.pathname.startsWith(c.path + '/'))
                  )
                );
                return (
                  <Link
                    key={sub}
                    to={subPath}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px 8px 42px',
                      fontSize: 13, fontWeight: 400,
                      color: isSubActive ? 'white' : 'rgba(148,163,184,0.9)',
                      textDecoration: 'none', borderRadius: 6,
                      background: isSubActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (!isSubActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { if (!isSubActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <SubIcon size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                    {t(sub)}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={label}
        to={path}
        title={collapsed ? t(label) : undefined}
        style={itemBase(isActive, superAdminOnly)}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <Icon size={18} style={{ flexShrink: 0, color: superAdminOnly ? accentBorder : undefined }} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{t(label)}</span>
            {superAdminOnly && (
              <span style={{
                fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                background: `rgba(${accentRGB},0.3)`, color: accentBorder,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>SA</span>
            )}
          </>
        )}
      </Link>
    );
  };

  // Índice donde empiezan los ítems superAdminOnly (para dibujar el divisor)
  const superStartIndex = navItems.findIndex(i => i.superAdminOnly);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99 }}
        />
      )}
      <aside
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: sW,
          background: sidebarBg, display: 'flex', flexDirection: 'column',
          zIndex: 100, transition: 'width 0.25s ease, transform 0.3s ease',
          overflow: 'visible',
        }}
      >
        {/* ── Logo ── */}
        <Link to="/admin" style={{ textDecoration: 'none' }}>
          <div style={{
            padding: '18px 16px', display: 'flex', alignItems: 'center',
            gap: collapsed ? 0 : 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            minHeight: 64,
          }}>
            <Gamepad2 size={26} color="white" style={{ flexShrink: 0 }} />
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                  {t('app_name')}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
                  background: `rgba(${accentRGB},0.25)`, color: accentBorder,
                  letterSpacing: '0.06em', textTransform: 'uppercase', alignSelf: 'flex-start',
                }}>
                  {isSuperAdmin ? 'Super Admin' : 'Admin Panel'}
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* ── Nav ── */}
        <nav style={{
          flex: 1, padding: '0 8px', display: 'flex',
          flexDirection: 'column', gap: 2,
          overflowY: 'auto', overflowX: 'hidden',
        }}>
          {navItems.map((item, idx) => (
            <div key={item.label}>
              {/* Divisor antes del primer ítem superAdminOnly */}
              {isSuperAdmin && idx === superStartIndex && (
                <div style={{
                  margin: collapsed ? '10px 0' : '10px 4px',
                  borderTop: '1px solid rgba(167,139,250,0.2)',
                  paddingTop: 10,
                }}>
                  {!collapsed && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: 'rgba(167,139,250,0.6)',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      paddingLeft: 12, display: 'block', marginBottom: 6,
                    }}>
                      Superadmin
                    </span>
                  )}
                </div>
              )}
              {renderNavItem(item)}
            </div>
          ))}
        </nav>

        {/* ── Botón colapsar ── */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? t('tooltip_expand') : t('tooltip_collapse')}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'rgba(203,213,225,0.8)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* ── User menu ── */}
        <div ref={userMenuRef} style={{
          position: 'relative',
          padding: '14px 8px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: collapsed ? '100%' : 8,
              right: collapsed ? 'auto' : 8,
              marginLeft: collapsed ? 8 : 0,
              minWidth: 160,
              background: sidebarBg,
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.25)',
              padding: '6px',
              zIndex: 110,
            }}>
              <Link to="/admin/profile" style={{ textDecoration: 'none' }}>
                <button
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '10px 12px', borderRadius: 6, color: '#d1d5db', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <User size={16} /> {t('user_menu_profile')}
                </button>
              </Link>
              <button
                onClick={handleLogout}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '10px 12px', borderRadius: 6, color: '#f87171', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <LogOut size={16} /> {t('logout')}
              </button>
            </div>
          )}

          <button
            onClick={() => setUserMenuOpen(v => !v)}
            style={{
              background: 'none', border: 'none', width: '100%',
              display: 'flex', alignItems: 'center',
              gap: collapsed ? 0 : 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0 8px' : '0 12px',
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: avatarBg, color: avatarColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 13,
            }}>
              {adminInitials}
            </div>
            {!collapsed && (
              <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                <p style={{ color: 'white', fontWeight: 600, fontSize: 13, margin: 0, whiteSpace: 'nowrap' }}>
                  {admin?.nombre ?? t('admin_name')}
                </p>
                <p style={{ color: '#94a3b8', fontSize: 11, margin: 0 }}>{rol}</p>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;