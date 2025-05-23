export const findBestAvailableLanguage = jest.fn(() => ({
  languageTag: 'en',
  isRTL: false,
}));

export const getLocales = jest.fn(() => [
  { languageTag: 'en', isRTL: false },
  { languageTag: 'tr', isRTL: false },
]);

export const addEventListener = jest.fn();
export const removeEventListener = jest.fn();

export default {
  findBestAvailableLanguage,
  getLocales,
  addEventListener,
  removeEventListener,
};
