import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Onboarding theme colors
const ONBOARDING_TEXT = '#1E3A8A';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function OnboardingProgress({ 
  currentStep, 
  totalSteps, 
  showSkip = false,
  onSkip 
}: OnboardingProgressProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const progress = (currentStep / totalSteps) * 100;

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Default: skip to main app (completes onboarding)
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Skip Button - Left side for RTL */}
      {showSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: ONBOARDING_TEXT }]}>تخطي</Text>
        </TouchableOpacity>
      )}
      
      {/* Progress Bar - RTL layout */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: ONBOARDING_TEXT }]}>
          {currentStep} / {totalSteps}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: 'rgba(30, 58, 138, 0.2)' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    alignSelf: 'flex-start', // Left side for RTL
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    transform: [{ scaleX: -1 }], // Fill from right to left
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'right', // RTL text alignment
  },
});

