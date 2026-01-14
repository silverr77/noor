import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CandleIcon } from '@/components/CandleIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { registerForPushNotificationsAsync, scheduleDailyNotification } from '@/services/notifications';

export default function CompleteScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { completeOnboarding } = useUser();

  useEffect(() => {
    registerForPushNotificationsAsync();
    scheduleDailyNotification();
  }, []);

  const handleComplete = () => {
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Candle Icon */}
      <View style={styles.iconContainer}>
        <CandleIcon size={120} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        هذا كل شيء مني!
      </Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.text }]}>
        استمتع بأذكارك، وسأراك مرة أخرى من خلال الإشعارات 👋
      </Text>

      {/* Instruction */}
      <Text style={[styles.instruction, { color: colors.text }]}>
        (اضغط للمتابعة)
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>ابدأ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

