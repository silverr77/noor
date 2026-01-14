/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Purple theme matching the logo
const primaryPurple = '#8B5CF6'; // Main purple
const darkPurple = '#6D28D9'; // Darker purple
const lightPurple = '#A78BFA'; // Lighter purple
const creamBackground = '#FEF3E2'; // Cream/beige background
const white = '#FFFFFF';
const darkBlue = '#1E3A8A'; // Dark blue for text/outlines

export const Colors = {
  light: {
    text: darkBlue,
    background: creamBackground,
    tint: primaryPurple,
    icon: primaryPurple,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryPurple,
    primary: primaryPurple,
    secondary: lightPurple,
    accent: darkBlue,
    cardBackground: white,
  },
  dark: {
    text: white,
    background: darkPurple,
    tint: lightPurple,
    icon: lightPurple,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: lightPurple,
    primary: primaryPurple,
    secondary: lightPurple,
    accent: white,
    cardBackground: '#7C3AED',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
