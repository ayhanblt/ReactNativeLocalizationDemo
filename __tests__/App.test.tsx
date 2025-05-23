/**
 * @format
 */

// DO NOT USE: sharedMockUseColorScheme - this was for the old mocking strategy.
// const mockSharedUseColorScheme = jest.fn(); 

// Mock for 'react-native' module - Keep stubs for native errors, but REMOVE useColorScheme from here.
jest.mock('react-native', () => {
  const React = require('react'); 
  const actualRN = jest.requireActual('react-native'); // For safe parts like StyleSheet.flatten

  const mockModule = {
    // Hooks
    // useColorScheme: mockSharedUseColorScheme, // REMOVED - App.tsx will use actual or Jest default
    useColorScheme: () => 'light', // Provide a default Jest-friendly implementation if needed by other components or if App.tsx calls it before forcedColorScheme logic.

    // Components
    SafeAreaView: jest.fn(props => React.createElement('SafeAreaView', props)),
    ScrollView: jest.fn(props => React.createElement('ScrollView', props)),
    StatusBar: jest.fn(props => React.createElement('StatusBar', props)),
    Text: jest.fn(props => React.createElement('Text', props)),
    View: jest.fn(props => React.createElement('View', props)),
    TouchableOpacity: jest.fn(props => React.createElement('TouchableOpacity', props)),

    // APIs
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: actualRN.StyleSheet.flatten, // Use actual flatten
      hairlineWidth: 1,
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(spec => spec.ios !== undefined ? spec.ios : spec.default),
    },
    NativeModules: {
      ...actualRN.NativeModules, // Start with actual ones to minimize what we need to stub
      DevSettings: { ...(actualRN.NativeModules.DevSettings || {}), addMenuItem: jest.fn(), reload: jest.fn() },
      DevMenu: { ...(actualRN.NativeModules.DevMenu || {}), show: jest.fn() },
      UIManager: { ...(actualRN.NativeModules.UIManager || {}), RCTView: { directEventTypes: {} } },
      PlatformConstants: { ...(actualRN.NativeModules.PlatformConstants || {}), forceTouchAvailable: false },
      // Ensure RNLocalize is not expected here if react-native-localize mock is fully JS
    },
    AccessibilityInfo: {
      isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      fetch: jest.fn(() => Promise.resolve(false)),
    },
    Dimensions: actualRN.Dimensions, // Use actual
    Appearance: { // If App.tsx or other components still use Appearance API
      getColorScheme: () => 'light', // Default for tests if not using forcedColorScheme
      addChangeListener: jest.fn(),
      removeChangeListener: jest.fn(),
    },
    PixelRatio: actualRN.PixelRatio, // Use actual
    InteractionManager: { ...actualRN.InteractionManager, runAfterInteractions: jest.fn(t => { if (t) t(); }) },
    Linking: { ...actualRN.Linking, openURL: jest.fn(()=>Promise.resolve()) },
  };
  return mockModule;
});

// Mock for NewAppScreen components (Header, etc.)
jest.mock('react-native/Libraries/NewAppScreen', () => {
  const React = require('react');
  const actualNewAppScreen = jest.requireActual('react-native/Libraries/NewAppScreen');
  return {
    ...actualNewAppScreen, // Keep actual Colors
    Header: jest.fn(props => React.createElement('Header', props)),
    DebugInstructions: jest.fn(props => React.createElement('DebugInstructions', props)),
    LearnMoreLinks: jest.fn(props => React.createElement('LearnMoreLinks', props)),
    ReloadInstructions: jest.fn(props => React.createElement('ReloadInstructions', props)),
  };
});

import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import App from '../App'; // App.tsx has been modified
import i18n from 'i18n-js'; 
import en from '../src/translations/en.json';
import tr from '../src/translations/tr.json';
import { Colors } from 'react-native/Libraries/NewAppScreen'; 
import { StyleSheet as RNStyleSheet } from 'react-native'; // For StyleSheet.flatten in tests


// Helper to set the i18n locale
const setLocale = (locale) => {
  act(() => {
    i18n.setLocale(locale);
  });
};

describe('App Localization', () => {
  beforeEach(() => {
    setLocale('en');
    // No longer mocking useColorScheme here via a shared mock function.
    // App will be rendered with or without forcedColorScheme prop.
  });

  test('1. Initial Language Check (English)', async () => {
    render(<App />); // Render without forcedColorScheme, relies on default useColorScheme (mocked to 'light')
    expect(screen.getByText(en.stepOne)).toBeTruthy();
    expect(screen.getByText(en.learnMore)).toBeTruthy();
    expect(screen.getByText('TR')).toBeTruthy(); 
  });

  test('2. Language Switching to Turkish', async () => {
    render(<App />);
    fireEvent.press(screen.getByText('TR'));
    expect(screen.getByText(tr.stepOne)).toBeTruthy();
    expect(screen.getByText(tr.learnMore)).toBeTruthy();
    expect(screen.getByText('EN')).toBeTruthy(); 
  });

  test('3. Switching Back to English', async () => {
    render(<App />);
    fireEvent.press(screen.getByText('TR')); 
    fireEvent.press(screen.getByText('EN')); 
    expect(screen.getByText(en.stepOne)).toBeTruthy();
    expect(screen.getByText(en.learnMore)).toBeTruthy();
    expect(screen.getByText('TR')).toBeTruthy();
  });
});

describe('App Color Scheme', () => {
  beforeEach(() => {
    setLocale('en'); 
  });

  test('1. Initial Render (Defaults to Light Mode via useColorScheme)', () => {
    // Render without forcedColorScheme to test the default path (which uses useColorScheme())
    // The react-native mock now provides a default useColorScheme: () => 'light'
    const { getByText } = render(<App />); 
    const stepOneTitle = getByText(en.stepOne);
    const styleArray = stepOneTitle.props.style; 
    const flatStyle = RNStyleSheet.flatten(styleArray);
    expect(flatStyle.color).toBe(Colors.black);
  });
  
  test('2. Forced Light Mode', () => {
    const { getByText } = render(<App forcedColorScheme="light" />);
    const stepOneTitle = getByText(en.stepOne);
    const styleArray = stepOneTitle.props.style;
    const flatStyle = RNStyleSheet.flatten(styleArray);
    expect(flatStyle.color).toBe(Colors.black);
  });

  test('3. Forced Dark Mode', () => {
    const { getByText } = render(<App forcedColorScheme="dark" />);
    const stepOneTitle = getByText(en.stepOne);
    const styleArray = stepOneTitle.props.style;
    const flatStyle = RNStyleSheet.flatten(styleArray);
    expect(flatStyle.color).toBe(Colors.white);
  });

  test('4. Switch Back to Light Mode (using prop)', () => {
    // Test starting with dark prop then switching to light prop
    const { getByText, rerender } = render(<App forcedColorScheme="dark" />);
    let stepOneTitle = getByText(en.stepOne);
    let flatStyle = RNStyleSheet.flatten(stepOneTitle.props.style);
    expect(flatStyle.color).toBe(Colors.white); // Initial dark check

    rerender(<App forcedColorScheme="light" />); // Rerender with light prop
    stepOneTitle = getByText(en.stepOne); // Re-query element
    flatStyle = RNStyleSheet.flatten(stepOneTitle.props.style);
    expect(flatStyle.color).toBe(Colors.black);
  });
});
