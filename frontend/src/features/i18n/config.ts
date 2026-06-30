import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'
import ar from './locales/ar.json'
import hi from './locales/hi.json'
import ko from './locales/ko.json'

const defaultLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language.split('-')[0] : 'en'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      ja: { translation: ja },
      zh: { translation: zh },
      ar: { translation: ar },
      hi: { translation: hi },
      ko: { translation: ko },
    },
    lng: typeof localStorage !== 'undefined' ? (localStorage.getItem('bridgeai-language') || defaultLang) : defaultLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'bridgeai-language',
    },
  })

export default i18n
