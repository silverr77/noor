// Widget configuration for iOS and Android
// Note: Full widget implementation requires native code
// This file provides the structure for widget setup

export interface WidgetConfig {
  name: string;
  size: 'small' | 'medium' | 'large';
  updateInterval: number; // in minutes
}

export const widgetConfigs: WidgetConfig[] = [
  {
    name: 'أذكار اليوم',
    size: 'small',
    updateInterval: 60, // Update every hour
  },
  {
    name: 'أذكار اليوم (كبير)',
    size: 'medium',
    updateInterval: 60,
  },
];

// Widget data provider
export function getWidgetData() {
  // This would fetch the current quote/do3aa for the widget
  // In a real implementation, this would use AsyncStorage or a backend
  return {
    text: 'اللهم إني أسألك العفو والعافية في الدنيا والآخرة',
    translation: 'O Allah, I ask You for pardon and well-being in this life and the next',
  };
}

// Instructions for widget setup:
// 1. For iOS: Create a Widget Extension using Xcode
// 2. For Android: Use App Widgets API
// 3. Configure widget to display daily quotes from AsyncStorage
// 4. Set up background refresh to update widget content

