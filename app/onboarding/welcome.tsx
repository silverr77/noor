import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CandleIcon } from '@/components/CandleIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Candle Icon */}
      <View style={styles.iconContainer}>
        <CandleIcon size={140} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        مرحباً، أنا أذكار!
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: colors.text }]}>
        أنا هنا لإضاءة يومك
      </Text>

      {/* Description */}
      <Text style={[styles.description, { color: colors.text }]}>
        لنبدأ رحلتك إلى الذكر مع تذكيرات يومية لطيفة تساعدك على البقاء حاضراً
      </Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/onboarding/name')}
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
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
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

