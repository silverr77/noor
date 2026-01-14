import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';

const timeOptions = [
  { value: '5', label: '5 دقائق', minutes: 5 },
  { value: '10', label: '10 دقائق', minutes: 10 },
  { value: '15', label: '15 دقيقة', minutes: 15 },
  { value: '20', label: '20 دقيقة', minutes: 20 },
  { value: '30', label: '30 دقيقة', minutes: 30 },
  { value: '30+', label: 'أكثر من 30 دقيقة', minutes: 45 },
];

export default function RelationshipScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [selectedTime, setSelectedTime] = useState<string>('');

  const handleNext = () => {
    if (selectedTime) {
      updateUser({ dailyTimeEstimate: selectedTime });
      router.push('/onboarding/benefits');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={4} totalSteps={7} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          كم وقت تقدر تقضيه في التطبيق يومياً؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          اختر الوقت المناسب لك
        </Text>

        {/* Time Options */}
        <View style={styles.optionsContainer}>
          {timeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: selectedTime === option.value ? colors.primary : colors.cardBackground,
                  borderColor: selectedTime === option.value ? colors.primary : '#E5E7EB',
                  borderWidth: selectedTime === option.value ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedTime(option.value)}
            >
              <Text style={[
                styles.optionText,
                { 
                  color: selectedTime === option.value ? '#FFFFFF' : colors.text,
                  fontWeight: selectedTime === option.value ? '600' : '400',
                }
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: selectedTime ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!selectedTime}
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
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  optionText: {
    fontSize: 20,
    textAlign: 'center',
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

