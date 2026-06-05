import { LogOut, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../../../components/language/LanguageSelector';
import { clearAdminSession } from '../../auth/services/adminAuthService';
import { C } from '../constants/constants';

function Header({ onMenuClick }) {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin-login', { replace: true });
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: C.white, borderBottom: `1px solid ${C.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', padding: '0 16px', height: 64, width: '100%', minWidth: 0 }}>
      {/* Lado izquierdo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 1, minWidth: 0, overflow: 'hidden' }}>

        <h1 className="header-title" style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          {t('title')}
        </h1>
      </div>

      {/* Espaciador */}
      <div style={{ flexGrow: 1 }} />

      {/* Lado derecho */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Selector de idioma antes del logout para que logout quede siempre a la derecha */}
        <LanguageSelector variant="inline" />

        {/* Cerrar sesión */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.red, color: 'white', fontWeight: 600, fontSize: 13,
          borderRadius: 8,
          padding: '9px 14px',  // en móvil quedará solo el ícono con este padding
          cursor: 'pointer', border: 'none',
          whiteSpace: 'nowrap', flexShrink: 0
        }}>
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span className="logout-text">{t('logout')}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;