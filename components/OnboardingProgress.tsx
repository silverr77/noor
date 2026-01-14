import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

const onboardingSteps = [
  'welcome',
  'name',
  'age',
  'gender',
  'relationship',
  'familiarity',
  'categories',
  'widgets',
  'complete',
];

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
      {/* Skip Button */}
      {showSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.text }]}>تخطي</Text>
        </TouchableOpacity>
      )}
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
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
        <Text style={[styles.progressText, { color: colors.text }]}>
          {currentStep} / {totalSteps}
        </Text>
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
    alignSelf: 'flex-end',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 50,
    textAlign: 'left',
  },
});

