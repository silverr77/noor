import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';

// Classic theme cream background
const ONBOARDING_BG = '#FEF7ED';
const ONBOARDING_TEXT = '#5D4E37';

const genders = [
  { value: 'female', label: 'أنثى' },
  { value: 'male', label: 'ذكر' },
];

export default function GenderScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [selectedGender, setSelectedGender] = useState<string>('');

  const handleNext = () => {
    if (selectedGender) {
      updateUser({ gender: selectedGender as any });
      router.push('/onboarding/relationship');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: ONBOARDING_BG }]}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={2} totalSteps={6} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: ONBOARDING_TEXT }]}>
          كيف تعرّف نفسك؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: ONBOARDING_TEXT }]}>
          ساعدني في تخصيص رحلتك
        </Text>

        {/* Gender Options */}
        <View style={styles.optionsContainer}>
          {genders.map((gender) => (
            <TouchableOpacity
              key={gender.value}
              style={[
                styles.option,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: selectedGender === gender.value ? colors.primary : '#E5E7EB',
                  borderWidth: selectedGender === gender.value ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedGender(gender.value)}
            >
              <Text style={[styles.optionText, { color: ONBOARDING_TEXT }]}>
                {gender.label}
              </Text>
              <View style={[
                styles.radio,
                { borderColor: selectedGender === gender.value ? colors.primary : '#D1D5DB' }
              ]}>
                {selectedGender === gender.value && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: selectedGender ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!selectedGender}
        >
          <Text style={styles.buttonText}>التالي</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 100, // Extra padding for fixed button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#6B7280',
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 18,
    textAlign: 'right',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

