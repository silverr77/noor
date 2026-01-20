/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Gold theme matching "نور" (Light) branding
const primaryGold = '#D4AF37'; // Classic gold
const darkGold = '#B8860B'; // Dark goldenrod
const lightGold = '#F5D06E'; // Light gold
const creamBackground = '#FEF7ED'; // Warm cream background
const white = '#FFFFFF';
const darkBrown = '#5D4E37'; // Dark brown for text

export const Colors = {
  light: {
    text: darkBrown,
    background: creamBackground,
    tint: primaryGold,
    icon: primaryGold,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryGold,
    primary: primaryGold,
    secondary: lightGold,
    accent: darkBrown,
    cardBackground: white,
  },
  dark: {
    text: white,
    background: darkGold,
    tint: lightGold,
    icon: lightGold,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: lightGold,
    primary: primaryGold,
    secondary: lightGold,
    accent: white,
    cardBackground: '#8B7355',
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
