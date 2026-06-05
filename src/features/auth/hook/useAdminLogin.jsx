import { useState }        from 'react';
import { useNavigate }     from 'react-router-dom';
import { useTranslation }  from 'react-i18next';
import Alert               from '../../../components/ui/Alert';
 
import { validateAdminForm }          from '../../../utils/validation';
import { loginAdmin, saveAdminSession, getAdminSession } from '../services/adminAuthService';
import {
  ROLE_ROUTES,
  LOADER_DELAY_MS,
  NAVIGATE_DELAY_MS,
} from '../constants/adminLoginConstants';
 
/**
 * useAdminLogin
 *
 * Encapsula todo el estado y la lógica del formulario de login.
 * El componente de vista solo consume lo que este hook expone.
 *
 * @returns {object} Estado y handlers listos para conectar a la vista
 */
export function useAdminLogin() {
  const { t }    = useTranslation(['admin', 'alert']);
  const navigate = useNavigate();
 
  // ── Estado del formulario ──────────────────────────────────
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
 
  // ── Estado de UI ──────────────────────────────────────────
  const [showPassword,    setShowPassword]    = useState(false);
  const [rememberMe,      setRememberMe]      = useState(false);
  const [isModalOpen,     setIsModalOpen]     = useState(false);
  const [errors,          setErrors]          = useState({});
  const [apiError,        setApiError]        = useState('');
  const [isVerifying,     setIsVerifying]     = useState(false);   // spinner en botón
  const [showFullLoader,  setShowFullLoader]  = useState(false);   // loader pantalla completa
  const [loginOk,         setLoginOk]         = useState(false);   // estado éxito
 
  // ── Handlers de UI simples ────────────────────────────────
  const openModal  = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const togglePassword  = () => setShowPassword(prev => !prev);
  const toggleRememberMe = () => setRememberMe(prev => !prev);
 
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: '' }));
    setApiError('');
  };
 
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrors(prev => ({ ...prev, password: '' }));
    setApiError('');
  };
 
  // ── Lógica principal de login ─────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
 
    // 1. Validación local
    const validationErrors = validateAdminForm({ email, password });
    setErrors(validationErrors);
    setApiError('');
    if (Object.keys(validationErrors).length > 0) return;
 
    setIsVerifying(true);
    let loaderTimer = null;
 
    try {
      const startTime = Date.now();
 
      // 2. Llamada al servicio (sin saber cómo funciona fetch internamente)
      const { ok, data } = await loginAdmin({ email, password });
 
      // 3. Respuesta con error del servidor
      if (!ok || !data?.token) {
        setIsVerifying(false);
        const serverMsg = data?.error || data?.message;
        const msg = serverMsg || t('admin_login_error', { ns: 'alert', defaultValue: 'Credenciales inválidas. Intente de nuevo.' });
        setApiError(msg);
        Alert.error(msg);
        return;
      }
 
      // 4. Login exitoso → lógica de Loader con delay
      const elapsed = Date.now() - startTime;
 
      if (elapsed >= LOADER_DELAY_MS) {
        setShowFullLoader(true);
      } else {
        loaderTimer = setTimeout(
          () => setShowFullLoader(true),
          LOADER_DELAY_MS - elapsed
        );
      }
 
      // 5. Solo persistimos el JWT (sin duplicar perfil en localStorage)
      saveAdminSession({ token: data.token });

      setLoginOk(true);
      setIsVerifying(false);

      // 6. Navegar tras animación
      setTimeout(() => {
        clearTimeout(loaderTimer);
        Alert.success(t('admin_login_success', { ns: 'alert' }));
        const { admin } = getAdminSession();
        const destino = ROLE_ROUTES[admin?.rol] || '/admin';
        navigate(destino, { replace: true });
      }, NAVIGATE_DELAY_MS);
 
    } catch (networkError) {
      console.error('Error de red:', networkError);
      clearTimeout(loaderTimer);
      setIsVerifying(false);
      setApiError(
        t('network_error', { ns: 'alert'}));}
  };
 
  // ── API pública del hook ──────────────────────────────────
  return {
    // Estado del formulario
    email,
    password,
    // Estado de UI
    showPassword,
    rememberMe,
    isModalOpen,
    errors,
    apiError,
    isVerifying,
    showFullLoader,
    loginOk,
    // Handlers
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    togglePassword,
    toggleRememberMe,
    openModal,
    closeModal,
  };
}