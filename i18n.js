// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";

// Importar recursos iniciales
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

// Detectar idioma del dispositivo
const locales = RNLocalize.getLocales();
const systemLanguage = Array.isArray(locales) && locales.length > 0
  ? locales[0].languageCode
  : "en";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: systemLanguage,  // idioma inicial
    fallbackLng: "en",
    compatibilityJSON: "v3", // recomendado en RN
    interpolation: { escapeValue: false },
  });

export default i18n;
