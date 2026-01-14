import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { UserProvider, useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Enable RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboardingGroup = segments[0] === 'onboarding';

    if (!user?.hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace('/onboarding/welcome');
    } else if (user?.hasCompletedOnboarding && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutNav />
    </UserProvider>
  );
}
