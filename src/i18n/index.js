import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import es from './es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en.translation,
        alert: en.alert,
        admin: en.admin,
        room: en.room,
        player: en.player,
        question: en.question,
        iaconfig: en.iaconfig,
        categories: en.categories,
        general: en.general,
        game: en.game,
      },
      es: {
        translation: es.translation,
        alert: es.alert,
        admin: es.admin,
        room: es.room,
        player: es.player,
        question: es.question,
        iaconfig: es.iaconfig,
        categories: es.categories,
        general: es.general,
        game: es.game,
      }
    },
    fallbackLng: 'en',
    ns: ['translation', 'alert', 'admin', 'player', 'question', 'iaconfig',
       'categories', 'room', 'general', 'game'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;