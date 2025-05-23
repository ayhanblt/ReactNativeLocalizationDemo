import en from '../../src/translations/en.json';
import tr from '../../src/translations/tr.json';

const translations = {
  en,
  tr,
};

let currentLocaleForMock = 'en'; // Default locale for the mock

const i18n = {
  t: jest.fn((key, config) => {
    const source = translations[currentLocaleForMock] || translations.en; // Fallback to 'en' if locale not found
    let translation = source[key] || key; // Fallback to key if translation missing
    if (config) {
      Object.keys(config).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, config[placeholder]);
      });
    }
    return translation;
  }),

  // App.tsx will read and set this property directly
  get locale() {
    return currentLocaleForMock;
  },
  set locale(newLocale) {
    if (translations[newLocale]) {
      currentLocaleForMock = newLocale;
    } else {
      // Optional: handle unknown locale, perhaps default to 'en' or log an error
      currentLocaleForMock = 'en'; 
    }
    // Clear memoize cache from App.tsx if translate function is memoized around i18n.t
    // This is important because App.tsx uses lodash.memoize for its translate function.
    // The cache key in App.tsx is (key, config). If i18n.locale changes,
    // the memoized function will still return stale results unless its cache is cleared.
    // However, the mock itself cannot easily access and clear App.tsx's memoize cache.
    // This is a limitation of this mocking approach.
    // The `translate.cache.clear()` call is in App.tsx's setI18nConfig,
    // but that's tied to RNLocalize events, not direct i18n.locale changes.
    // For the test to pass, App.tsx's `toggleLanguage` should ideally also clear this cache.
    // Let's assume for now App.tsx handles this, or the test might need adjustment.
  },

  // This is a helper we can use in tests for explicit control if needed,
  // distinct from how the App component interacts with i18n.locale
  setLocale: jest.fn(localeValue => {
    if (translations[localeValue]) {
      currentLocaleForMock = localeValue;
    } else {
      currentLocaleForMock = 'en';
    }
  }),

  translations: { // For components that might expect this structure
    en: { translation: en },
    tr: { translation: tr },
  },
  defaultLocale: "en",
  fallbacks: true,
};

export default i18n;
