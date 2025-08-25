// src/i18n.js
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Importar recursos iniciales
import ar from "./locales/ar/translation.json";
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import hi from "./locales/hi/translation.json";
import it from "./locales/it/translation.json";
import ja from "./locales/ja/translation.json";
import ko from "./locales/ko/translation.json";
import pt from "./locales/pt/translation.json";
import ru from "./locales/ru/translation.json";
import zh from "./locales/zh/translation.json";

// Detectar idioma del dispositivo

const resources = {
  ar: { translation: ar },
  de: { translation: de },
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  hi: { translation: hi },
  it: { translation: it },
  ja: { translation: ja },
  ko: { translation: ko },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
};

let systemLanguage = "en";

try {
  if (Localization.locale) {
    systemLanguage = Localization.locale.split("-")[0];
  } else if (Localization.getLocales) {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      systemLanguage = locales[0].languageCode;
    }
  }
} catch (e) {
  console.warn("🌍 Error detectando idioma, fallback en 'en'", e);
}

if (!Object.keys(resources).includes(systemLanguage)) {
  systemLanguage = "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: systemLanguage,  // idioma inicial
  fallbackLng: "en",
  compatibilityJSON: "v3", // recomendado en RN
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

console.log("🌍 Idioma detectado:", systemLanguage);

export default i18n;
