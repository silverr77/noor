/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Green & Gold theme matching "نور" Islamic branding
const primaryGreen = '#1B5E20'; // Deep Islamic green
const darkGreen = '#0D3D14'; // Darker green
const lightGreen = '#4CAF50'; // Light green
const accentGold = '#C9A961'; // Golden accent (from icon)
const lightGold = '#E8D5A3'; // Light gold
const creamBackground = '#F5F5F0'; // Subtle cream with green tint
const white = '#FFFFFF';
const darkText = '#1A1A1A'; // Almost black for text

export const Colors = {
  light: {
    text: darkText,
    background: creamBackground,
    tint: primaryGreen,
    icon: primaryGreen,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryGreen,
    primary: primaryGreen,
    secondary: accentGold,
    accent: accentGold,
    cardBackground: white,
  },
  dark: {
    text: white,
    background: darkGreen,
    tint: lightGreen,
    icon: accentGold,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: accentGold,
    primary: primaryGreen,
    secondary: accentGold,
    accent: accentGold,
    cardBackground: '#2E5033',
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
