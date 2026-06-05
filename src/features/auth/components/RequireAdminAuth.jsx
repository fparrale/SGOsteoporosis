import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { isAdminSessionValid } from '../services/adminAuthService';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Cierre de sesión entre pestañas: si otra pestaña elimina el token, redirigir aquí también
    const onStorage = (e) => {
      if (e.key === 'admin_token' && !e.newValue) {
        window.location.replace('/admin-login');
      }
    };
    // Re-validar al volver al tab (token puede haber expirado mientras estaba inactivo)
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !isAdminSessionValid()) {
        window.location.replace('/admin-login');
      }
    };
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  if (!isAdminSessionValid()) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
  return children;
}