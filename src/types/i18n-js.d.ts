import { I18n } from 'i18n-js';

declare module 'i18n-js' {
  interface I18nJS extends I18n {
    locale: string;
    translations: Record<string, any>;
  }
  
  const i18n: I18nJS;
  export default i18n;
}
