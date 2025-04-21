/**
 *
 * @format
 */

import type { JSX } from 'react';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import * as RNLocalize from 'react-native-localize';
import i18n from 'i18n-js';
import memoize from 'lodash.memoize';

// Import translations
import en from './src/translations/en.json';
import tr from './src/translations/tr.json';

const translationGetters = {
  en: () => en,
  tr: () => tr,
};

const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const setI18nConfig = () => {
  const fallback = { languageTag: 'en' };
  const { languageTag } =
    RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    fallback;

  translate.cache.clear();
  i18n.translations = { [languageTag]: translationGetters[languageTag]() };
  i18n.locale = languageTag;
};

function Section({children, title}: {children: React.ReactNode; title: string}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentLocale, setCurrentLocale] = React.useState<string>('en');

  React.useEffect(() => {
    setI18nConfig();
    setCurrentLocale(i18n.locale);
    RNLocalize.addEventListener('change', handleLocalizationChange);
    return () => {
      RNLocalize.removeEventListener('change', handleLocalizationChange);
    };
  }, []);

  const handleLocalizationChange = React.useCallback(() => {
    setI18nConfig();
    setCurrentLocale(i18n.locale);
  }, []);

  const toggleLanguage = React.useCallback(() => {
    const newLocale = currentLocale === 'en' ? 'tr' : 'en';
    i18n.locale = newLocale;
    setCurrentLocale(newLocale);
  }, [currentLocale]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const safePadding = 24;

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View style={{paddingRight: safePadding}}>
          <Header />
          <TouchableOpacity 
            style={styles.languageButton} 
            onPress={toggleLanguage}
          >
            <Text style={styles.languageButtonText}>
              {currentLocale === 'en' ? 'TR' : 'EN'}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            paddingHorizontal: safePadding,
            paddingBottom: safePadding,
          }}>
          <Section title={translate('stepOne')}>
            {translate('editFile', { file: 'App.tsx' })}
          </Section>
          <Section title={translate('seeChanges')}>
            <ReloadInstructions />
          </Section>
          <Section title={translate('debug')}>
            <DebugInstructions />
          </Section>
          <Section title={translate('learnMore')}>
            {translate('readDocs')}
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  languageButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: Colors.lighter,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Colors.dark,
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
});

export default App;
