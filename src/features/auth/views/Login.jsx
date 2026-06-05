import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, Key, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSelector from '../../../components/language/LanguageSelector';
import AvatarSelector from '../../../components/avatar/AvatarSelector';
import './Login.css';

const AVATARS = [
    { id: 1, name: 'Alegre',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alegre' },
    { id: 2, name: 'Cool',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=sixsevbenbbn' },
    { id: 3, name: 'Divertido', url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=xrlev' },
    { id: 4, name: 'Tímido',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=timidoop' },
    { id: 5, name: 'Loco',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zoe' },
];

const NAME_REGEX   = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/;
const MAX_NAME_LEN = 30;
const MIN_AGE      = 10;
const MAX_AGE      = 110;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName]                     = useState('');
  const [age, setAge]                       = useState('');
  const [nameError, setNameError]           = useState('');
  const [ageError, setAgeError]             = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [pinValues, setPinValues]           = useState(Array(6).fill(''));
  const [codeOpen, setCodeOpen]             = useState(false);

  const ageNum      = parseInt(age, 10);
  const ageValid    = age !== '' && !isNaN(ageNum) && ageNum >= MIN_AGE && ageNum <= MAX_AGE;
  const showAvatars = name.trim().length > 0 && ageValid && !nameError && !ageError;
  const pinComplete = pinValues.every(v => v !== '');
  const canJoin     = showAvatars && codeOpen && pinComplete;
  const canStart    = showAvatars && !canJoin;

  const handleNameChange = (e) => {
    const val = e.target.value;
    if (val.length > MAX_NAME_LEN) return;
    if (!NAME_REGEX.test(val)) {
      setNameError('name_invalid_chars');
      return;
    }
    setNameError('');
    setName(val);
  };

  const handleAgeChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setAge(val);
    if (val === '') { setAgeError(''); return; }
    const num = parseInt(val, 10);
    if (num < MIN_AGE || num > MAX_AGE) {
      setAgeError('age_invalid_range');
    } else {
      setAgeError('');
    }
  };

  const playerState = () => ({
    name:     name.trim(),
    age:      age.trim(),
    avatar:   selectedAvatar.url,
    avatarId: selectedAvatar.id,
  });

  const handleStartGame = () => {
    if (!canStart) return;
    navigate('/game', { state: playerState() });
  };

  const handleJoinSession = () => {
    if (!canJoin) return;
    navigate(`/game?room=${pinValues.join('')}`, { state: playerState() });
  };

  const handlePinChange = (index, value) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return;
    const next = [...pinValues];
    next[index] = value.toUpperCase();
    setPinValues(next);
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinValues[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
  };

  const handlePinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').toUpperCase().slice(0, 6);
    const next = Array(6).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setPinValues(next);
  };

  return (
    <div className="login-container">
      <span className="bg-circle bg-circle--1" />
      <span className="bg-circle bg-circle--2" />
      <span className="bg-circle bg-circle--3" />
      <span className="bg-circle bg-circle--4" />

      <LanguageSelector />

      <motion.div
        className="glass-panel"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Header */}
        <div className="panel-header">
          <h1 className="title">{t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label">{t('candidate_name')}</label>
          <div className={`input-wrapper${nameError ? ' input-wrapper--error' : ''}`}>
            <span className="input-icon"><User size={18} /></span>
            <input
              className="custom-input"
              placeholder={t('candidate_name_placeholder')}
              value={name}
              onChange={handleNameChange}
              maxLength={MAX_NAME_LEN}
              autoComplete="off"
            />
          </div>
          <AnimatePresence>
            {nameError && (
              <motion.span
                className="field-error"
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {t(nameError)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label">{t('age_verification')}</label>
          <div className={`input-wrapper${ageError ? ' input-wrapper--error' : ''}`}>
            <span className="input-icon"><Hash size={18} /></span>
            <input
              className="custom-input"
              type="text"
              inputMode="numeric"
              placeholder={t('age_verification_placeholder')}
              value={age}
              onChange={handleAgeChange}
              maxLength={3}
              autoComplete="off"
            />
          </div>
          <AnimatePresence>
            {ageError && (
              <motion.span
                className="field-error"
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {t(ageError)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar — revealed once name + age are filled */}
        <AnimatePresence>
          {showAvatars && (
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarSelect={setSelectedAvatar}
              t={t}
            />
          )}
        </AnimatePresence>

        {/* "Have a session code?" collapsible section */}
        <AnimatePresence>
          {showAvatars && (
            <motion.div
              className="code-section"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                className={`code-toggle${codeOpen ? ' code-toggle--open' : ''}`}
                onClick={() => setCodeOpen(o => !o)}
              >
                <Key size={14} />
                <span>{t('have_session_code')}</span>
                <motion.span
                  className="code-toggle__chevron"
                  animate={{ rotate: codeOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} />
                </motion.span>
              </button>

              <AnimatePresence>
                {codeOpen && (
                  <motion.div
                    className="code-inputs-wrapper"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="code-inputs-inner">
                      <p className="code-hint">{t('code_hint')}</p>
                      <div className="code-input-container" onPaste={handlePinPaste}>
                        {pinValues.map((val, i) => (
                          <input
                            key={i}
                            id={`pin-${i}`}
                            className="pin-cell"
                            maxLength={1}
                            value={val}
                            onChange={e => handlePinChange(i, e.target.value)}
                            onKeyDown={e => handlePinKeyDown(i, e)}
                            inputMode="text"
                            autoComplete="off"
                          />
                        ))}
                      </div>
                      <motion.button
                        type="button"
                        className={`join-session-button${canJoin ? ' join-session-button--active' : ''}`}
                        disabled={!canJoin}
                        whileTap={canJoin ? { scale: 0.97 } : {}}
                        onClick={handleJoinSession}
                      >
                        {t('join_session')}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Game */}
        <motion.button
          type="button"
          className={`start-game-button${canStart ? '' : ' start-game-button--disabled'}`}
          disabled={!canStart}
          whileTap={canStart ? { scale: 0.97 } : {}}
          onClick={handleStartGame}
        >
          {t('start_game')}
        </motion.button>

        {/* Admin link */}
        <div className="admin-divider" />
        <div className="admin-link">
          <span>{t('admin_prompt')}</span>{' '}
          <Link to="/admin-login">{t('access_panel')}</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
