import 'i18n-js';

declare module 'i18n-js' {
  interface I18n {
    locale: string;
    translations: { [key: string]: any };
  }
}
