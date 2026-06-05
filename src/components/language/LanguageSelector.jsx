import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import './LanguageSelector.css';

const LanguageSelector = ({ variant = 'fixed' }) => {
  const { i18n } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  return (
    <motion.div 
      className={`language-selector ${variant === 'inline' ? 'language-selector--inline' : ''}`}
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1 }}
    >
      <div className="relative">
        <button onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="language-button">
          <Globe size={18} />
          <span className="uppercase tracking-wider text-xs">{i18n.language}</span>
        </button>
        {isLangDropdownOpen && (
          <motion.div 
            className="language-dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button onClick={() => changeLanguage('en')} className="language-option">English</button>
            <button onClick={() => changeLanguage('es')} className="language-option">Español</button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default LanguageSelector;