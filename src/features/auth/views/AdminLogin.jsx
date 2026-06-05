// ─────────────────────────────────────────────────────────────
//  views/AdminLogin.jsx   ← VISTA PURA (solo renderiza)
//  No contiene lógica de negocio ni llamadas a la API.
//  Todo viene del hook useAdminLogin (Controller).
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { lazy, Suspense } from 'react';
import { Link }                    from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation }          from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Shield, Loader } from 'lucide-react';

import LanguageSelector  from '../../../components/language/LanguageSelector';
import AppLoader         from '../../../components/ui/Loader';
const RecuperarPassword = lazy(() => import('../modals/RecuperarPassword'));

import { useAdminLogin }   from '../hook/useAdminLogin';
import { errorVariants }   from '../constants/adminLoginConstants';

import './AdminLogin.css';

// ─────────────────────────────────────────────────────────────
const AdminLogin = () => {
  const { t } = useTranslation(['admin', 'alert']);

  // ── Toda la lógica viene del hook (Controller) ────────────
  const {
    email, password,
    showPassword, rememberMe, isModalOpen,
    errors, apiError,
    isVerifying, showFullLoader, loginOk,
    handleEmailChange, handlePasswordChange,
    handleLogin, togglePassword, toggleRememberMe,
    openModal, closeModal,
  } = useAdminLogin();

  // ── Loader pantalla completa (solo tras login exitoso lento) ─
  if (showFullLoader) {
    return (
      <AppLoader
        loading={true}
        content={t('accessing_panel', {
          ns: 'admin',
          defaultValue: 'Cargando.....',
        })}
      />
    );
  }

  // ── Vista principal ───────────────────────────────────────
  return (
    <div className="admin-login-container">
      {/* Círculos decorativos del fondo */}
      <span className="bg-circle bg-circle--1" />
      <span className="bg-circle bg-circle--2" />
      <span className="bg-circle bg-circle--3" />
      <span className="bg-circle bg-circle--4" />

      <LanguageSelector />

      {/* ── Panel principal (glass card) ── */}
      <motion.div
        className={`admin-glass-panel${loginOk ? ' panel--success' : ''}`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="panel-header">
          <div className="title-container">
            <Shield size={36} className="header-shield-icon" fill="currentColor" />
            <h1 className="login-title">{t('admin_login_title')}</h1>
          </div>
          <div className="subtitle-container">
            <p className="login-subtitle">{t('admin_login_subtitle')}</p>
          </div>
        </div>

        {/* Formulario */}
        <form className="login-form" onSubmit={handleLogin} noValidate>

          {/* Banner de error de API */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                className="api-error-banner"
                variants={errorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                role="alert"
              >
                <span className="api-error-icon">⚠</span>
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Campo: Email ── */}
          <div className={`form-group${errors.email ? ' form-group--error' : ''}`}>
            <label className="form-label">{t('email')}</label>

            <div className={`input-wrapper${errors.email ? ' input-wrapper--error' : ''}`}>
              <span className="input-icon"><Mail size={18} /></span>
              <input
                className="custom-input"
                type="email"
                placeholder="name@institution.edu"
                value={email}
                onChange={handleEmailChange}
                disabled={isVerifying || loginOk}
                autoComplete="email"
              />
            </div>

            <AnimatePresence>
              {errors.email && (
                <motion.span
                  className="field-error"
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {t(errors.email, { ns: 'alert' })}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ── Campo: Contraseña ── */}
          <div className={`form-group${errors.password ? ' form-group--error' : ''}`}>
            <label className="form-label">{t('access_password')}</label>

            <div className={`input-wrapper${errors.password ? ' input-wrapper--error' : ''}`}>
              <span className="input-icon"><Lock size={18} /></span>
              <input
                className="custom-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="············"
                value={password}
                onChange={handlePasswordChange}
                disabled={isVerifying || loginOk}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePassword}
                tabIndex={-1}
                aria-label={
                  showPassword
                    ? t('hide_password', { defaultValue: 'Ocultar contraseña' })
                    : t('show_password', { defaultValue: 'Mostrar contraseña' })
                }
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {errors.password && (
                <motion.span
                  className="field-error"
                  variants={errorVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {t(errors.password, { ns: 'alert' })}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* ── Recordarme ── */}
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={toggleRememberMe}
              disabled={isVerifying || loginOk}
            />
            <span>{t('remember_me', { defaultValue: 'Recordarme' })}</span>
          </label>

          {/* ── Botón de submit ── */}
          <button
            type="submit"
            className={[
              'access-button',
              loginOk      ? 'access-button--success'   : '',
              isVerifying  ? 'access-button--verifying' : '',
            ].join(' ').trim()}
            disabled={isVerifying || loginOk}
          >
            <AnimatePresence mode="wait">
              {loginOk ? (
                <motion.span
                  key="ok"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  ✓ {t('access_granted', { defaultValue: 'Acceso concedido' })}
                </motion.span>

              ) : isVerifying ? (
                <motion.span
                  key="verifying"
                  className="btn-verifying"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader size={16} className="btn-spinner" />
                  {t('verifying', { defaultValue: 'Verificando...' })}
                </motion.span>

              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {t('access_admin_panel')}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Forgot password */}
          <span
            className="forgot-password-link forgot-password-link--center"
            onClick={openModal}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openModal()}
          >
            {t('forgot_password')}
          </span>

          {/* Botón de volver */}
          <div className="back-divider" />
          <div className="back-link">
            <span>{t('not_admin_prompt')}</span>{' '}
            <Link to="/">{t('back_to_game')}</Link>
          </div>

        </form>
      </motion.div>

      {/* ── Badge de seguridad ── */}
      <motion.div
        className="security-badge"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Shield size={20} className="shield-icon" />
        <div className="security-text">
          <span>{t('security_protocol')}</span>
          <strong>{t('iso_certified')}</strong>
        </div>
      </motion.div>

      {/* ── Modal recuperar contraseña ── */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <RecuperarPassword open={isModalOpen} onClose={closeModal} />
        </Suspense>
      )}
    </div>
  );
};

export default AdminLogin;
