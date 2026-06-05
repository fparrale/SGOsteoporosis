import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, X, Send, Loader, Lock, Eye, EyeOff } from 'lucide-react';
import Alert from '../../../components/ui/Alert';
import { API_URL } from '../constants/adminLoginConstants';
import './RecuperarPassword.css';

const RESEND_COOLDOWN = 90; // segundos (1:30)
const MAX_RESENDS     = 3;

const fmt = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;

const RecuperarPassword = ({ open, onClose }) => {
  const { t, i18n } = useTranslation('admin');

  // ── paso actual: 1=email  2=código  3=contraseña  4=éxito ─────
  const [step, setStep] = useState(1);

  // paso 1
  const [email,      setEmail]      = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSending,  setIsSending]  = useState(false);

  // paso 2 — OTP
  const [codeDigits,    setCodeDigits]    = useState(['', '', '', '', '', '']);
  const [codeError,     setCodeError]     = useState('');
  const [isVerifying,   setIsVerifying]   = useState(false);
  const [countdown,     setCountdown]     = useState(RESEND_COOLDOWN);
  const [resendCount,   setResendCount]   = useState(0);
  const [resendBlocked, setResendBlocked] = useState(false);
  const [isResending,   setIsResending]   = useState(false);
  const codeRefs = useRef([]);

  // paso 3
  const [newPassword,         setNewPassword]         = useState('');
  const [confirmPassword,     setConfirmPassword]     = useState('');
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError,       setPasswordError]       = useState('');
  const [isResetting,         setIsResetting]         = useState(false);

  // código como string para las llamadas API
  const codeStr = codeDigits.join('');

  // ── Contador de reenvío ───────────────────────────────────────
  useEffect(() => {
    if (step !== 2 || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setEmail(''); setEmailError('');
    setCodeDigits(['', '', '', '', '', '']); setCodeError('');
    setCountdown(RESEND_COOLDOWN);
    setResendCount(0); setResendBlocked(false);
    setNewPassword(''); setConfirmPassword('');
    setPasswordError('');
    setShowPassword(false); setShowConfirmPassword(false);
    onClose();
  };

  // ── OTP input handlers ────────────────────────────────────────
  const handleDigitChange = (i, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...codeDigits];
    next[i]     = digit;
    setCodeDigits(next);
    setCodeError('');
    if (digit && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handleDigitKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !codeDigits[i] && i > 0) {
      codeRefs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && i > 0) codeRefs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next   = Array.from({ length: 6 }, (_, k) => pasted[k] || '');
    setCodeDigits(next);
    codeRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Paso 1 — enviar código ────────────────────────────────────
  const sendCode = async () => {
    if (!email.trim()) {
      setEmailError(t('email_required', { defaultValue: 'El correo es obligatorio.' }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError(t('email_invalid', { defaultValue: 'Ingresa un correo válido.' }));
      return;
    }
    setIsSending(true);
    setEmailError('');
    try {
      const res  = await fetch(`${API_URL}/auth/recover-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), lang: i18n.language }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        Alert.success(t('recovery_email_sent', { defaultValue: '¡Código enviado! Revisa tu bandeja.' }));
        setCountdown(RESEND_COOLDOWN);
        setResendCount(0);
        setResendBlocked(false);
        setStep(2);
        setTimeout(() => codeRefs.current[0]?.focus(), 100);
      } else {
        const errMap = {
          404: t('email_not_found',   { defaultValue: 'El correo no está registrado en el sistema.' }),
          403: t('account_disabled',  { defaultValue: 'Tu cuenta está desactivada.' }),
          429: t('too_many_attempts', { defaultValue: 'Demasiados intentos. Espera antes de intentar de nuevo.' }),
        };
        setEmailError(errMap[res.status] || data.error || t('recovery_error', { defaultValue: 'No se pudo enviar el correo.' }));
      }
    } catch {
      setEmailError(t('network_error', { defaultValue: 'Error de conexión con el servidor.' }));
    } finally {
      setIsSending(false);
    }
  };

  // ── Paso 2 — reenviar código ──────────────────────────────────
  const resendCode = async () => {
    const nextCount = resendCount + 1;
    if (nextCount > MAX_RESENDS) { setResendBlocked(true); return; }
    setIsResending(true);
    setCodeError('');
    try {
      const res  = await fetch(`${API_URL}/auth/recover-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), lang: i18n.language }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResendCount(nextCount);
        if (nextCount >= MAX_RESENDS) {
          setResendBlocked(true);
        } else {
          setCountdown(RESEND_COOLDOWN);
          setCodeDigits(['', '', '', '', '', '']);
          setTimeout(() => codeRefs.current[0]?.focus(), 100);
        }
        Alert.success(t('recovery_email_sent', { defaultValue: '¡Código reenviado!' }));
      } else {
        if (res.status === 429 || nextCount >= MAX_RESENDS) setResendBlocked(true);
        setCodeError(data.error || t('too_many_attempts', { defaultValue: 'Demasiados intentos.' }));
      }
    } catch {
      setCodeError(t('network_error', { defaultValue: 'Error de conexión.' }));
    } finally {
      setIsResending(false);
    }
  };

  // ── Paso 2 — verificar código ─────────────────────────────────
  const verifyCode = async () => {
    if (codeStr.length !== 6) {
      setCodeError(t('code_required', { defaultValue: 'Ingresa el código de 6 dígitos.' }));
      return;
    }
    setIsVerifying(true);
    setCodeError('');
    try {
      const res  = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: codeStr }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep(3);
      } else {
        setCodeError(
          res.status === 429
            ? t('too_many_attempts', { defaultValue: 'Demasiados intentos. Espera antes de intentar de nuevo.' })
            : data.error || t('reset_error', { defaultValue: 'Código inválido o expirado.' })
        );
      }
    } catch {
      setCodeError(t('network_error', { defaultValue: 'Error de conexión.' }));
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Paso 3 — cambiar contraseña ───────────────────────────────
  const resetPassword = async () => {
    if (!newPassword) {
      setPasswordError(t('password_required', { defaultValue: 'La contraseña es obligatoria.' }));
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError(t('password_min_length', { defaultValue: 'La contraseña debe tener al menos 8 caracteres.' }));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords_no_match', { defaultValue: 'Las contraseñas no coinciden.' }));
      return;
    }
    setIsResetting(true);
    setPasswordError('');
    try {
      const res  = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: codeStr, password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep(4);
      } else {
        setPasswordError(
          res.status === 429
            ? t('too_many_attempts', { defaultValue: 'Demasiados intentos.' })
            : data.error || t('reset_error', { defaultValue: 'Código inválido o expirado.' })
        );
      }
    } catch {
      setPasswordError(t('network_error', { defaultValue: 'Error de conexión.' }));
    } finally {
      setIsResetting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────
  return (
    <div className="gc-overlay" onClick={handleOverlayClick}>
      <div className="gc-modal gc-modal--sm">

        {/* Header */}
        <div className="gc-modal-header">
          <span className="gc-modal-title">{t('recover_password_title')}</span>
          <button className="gc-modal-close" onClick={handleClose}>
            <X size={16} />
          </button>
        </div>

        {/* ── Paso 1: correo ── */}
        {step === 1 && (
          <>
            <p className="gc-modal-text" style={{ marginBottom: '20px' }}>
              {t('recover_password_subtitle')}
            </p>
            <div className="gc-field">
              <label>{t('form_email_label')}</label>
              <div className={`rp-input-wrapper${emailError ? ' rp-wrapper--error' : ''}`}>
                <span className="rp-input-icon"><Mail size={16} /></span>
                <input
                  className="rp-input"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  disabled={isSending}
                  autoComplete="email"
                  onKeyDown={(e) => e.key === 'Enter' && sendCode()}
                />
              </div>
              {emailError && <span className="rp-field-error">{emailError}</span>}
            </div>
            <div className="gc-modal-actions">
              <button className="gc-btn-cancel" onClick={handleClose} disabled={isSending}>
                {t('categories_modal_cancel_button', { defaultValue: 'Cancelar' })}
              </button>
              <button className="gc-btn-save rp-send-btn" onClick={sendCode} disabled={isSending}>
                {isSending
                  ? <><Loader size={14} className="btn-spinner" /> {t('sending', { defaultValue: 'Enviando...' })}</>
                  : <><Send size={14} /> {t('send_code_button')}</>
                }
              </button>
            </div>
          </>
        )}

        {/* ── Paso 2: código OTP ── */}
        {step === 2 && (
          <>
            <p className="gc-modal-text" style={{ marginBottom: '20px' }}>
              {t('step_enter_code', { defaultValue: 'Ingresa el código de 6 dígitos que enviamos a tu correo.' })}
            </p>

            {/* 6 cajitas OTP */}
            <div className="rp-otp-container">
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (codeRefs.current[i] = el)}
                  className={`rp-otp-box${digit ? ' rp-otp-box--filled' : ''}${codeError ? ' rp-otp-box--error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  disabled={isVerifying}
                  autoComplete="off"
                />
              ))}
            </div>
            {codeError && <span className="rp-field-error" style={{ textAlign: 'center', display: 'block', marginTop: '6px' }}>{codeError}</span>}

            {/* Contador / reenviar */}
            <div className="rp-resend-area">
              {resendBlocked ? (
                <p className="rp-blocked-msg">
                  {t('resend_blocked', { defaultValue: 'Demasiados intentos. Intenta en 15 minutos.' })}
                </p>
              ) : countdown > 0 ? (
                <div className="rp-countdown-badge">
                  <span>{t('resend_in', { time: fmt(countdown), defaultValue: `Reenviar en ${fmt(countdown)}` })}</span>
                </div>
              ) : (
                <button className="rp-resend-btn" onClick={resendCode} disabled={isResending}>
                  {isResending
                    ? <><Loader size={12} className="btn-spinner" /> {t('sending', { defaultValue: 'Enviando...' })}</>
                    : t('resend_code_button', { defaultValue: 'Reenviar código' })
                  }
                </button>
              )}
            </div>

            <div className="gc-modal-actions">
              <button className="gc-btn-cancel" onClick={() => setStep(1)} disabled={isVerifying}>
                {t('back', { defaultValue: 'Volver' })}
              </button>
              <button
                className="gc-btn-save rp-send-btn"
                onClick={verifyCode}
                disabled={isVerifying || codeStr.length < 6}
              >
                {isVerifying
                  ? <><Loader size={14} className="btn-spinner" /> {t('verifying', { defaultValue: 'Verificando...' })}</>
                  : t('verify_code_button', { defaultValue: 'Verificar Código' })
                }
              </button>
            </div>
          </>
        )}

        {/* ── Paso 3: nueva contraseña ── */}
        {step === 3 && (
          <>
            <p className="gc-modal-text" style={{ marginBottom: '20px' }}>
              {t('step_new_password', { defaultValue: 'El código es válido. Ahora elige tu nueva contraseña.' })}
            </p>

            <div className="gc-field">
              <label>{t('new_password_label', { defaultValue: 'Nueva contraseña' })}</label>
              <div className={`rp-input-wrapper${passwordError ? ' rp-wrapper--error' : ''}`}>
                <span className="rp-input-icon"><Lock size={16} /></span>
                <input
                  className="rp-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                  disabled={isResetting}
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye-btn" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="gc-field">
              <label>{t('confirm_password_label', { defaultValue: 'Confirmar contraseña' })}</label>
              <div className={`rp-input-wrapper${passwordError ? ' rp-wrapper--error' : ''}`}>
                <span className="rp-input-icon"><Lock size={16} /></span>
                <input
                  className="rp-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  disabled={isResetting}
                  autoComplete="new-password"
                />
                <button type="button" className="rp-eye-btn" onClick={() => setShowConfirmPassword((v) => !v)} tabIndex={-1}>
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && <span className="rp-field-error">{passwordError}</span>}
            </div>

            <div className="gc-modal-actions">
              <button className="gc-btn-cancel" onClick={() => setStep(2)} disabled={isResetting}>
                {t('back', { defaultValue: 'Volver' })}
              </button>
              <button className="gc-btn-save rp-send-btn" onClick={resetPassword} disabled={isResetting}>
                {isResetting
                  ? <><Loader size={14} className="btn-spinner" /> {t('sending', { defaultValue: 'Guardando...' })}</>
                  : t('reset_password_button', { defaultValue: 'Restablecer Contraseña' })
                }
              </button>
            </div>
          </>
        )}

        {/* ── Paso 4: éxito ── */}
        {step === 4 && (
          <>
            <p className="gc-modal-text" style={{ marginBottom: '20px' }}>
              {t('reset_success_msg', { defaultValue: '¡Contraseña actualizada correctamente! Ya puedes iniciar sesión.' })}
            </p>
            <div className="gc-modal-actions">
              <button className="gc-btn-save" onClick={handleClose}>
                {t('close', { defaultValue: 'Cerrar' })}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default RecuperarPassword;
