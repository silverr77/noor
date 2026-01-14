import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];

export default function AgeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [selectedAge, setSelectedAge] = useState<string>('');

  const handleNext = () => {
    if (selectedAge) {
      updateUser({ age: selectedAge });
      router.push('/onboarding/gender');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={2} totalSteps={9} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          كم عمرك؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          هذا يساعدني في تخصيص تجربتك
        </Text>

        {/* Age Options */}
        <View style={styles.optionsContainer}>
          {ageRanges.map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.option,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selectedAge === age ? colors.primary : '#E5E7EB',
                  borderWidth: selectedAge === age ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedAge(age)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {age}
              </Text>
              <View style={[
                styles.radio,
                { borderColor: selectedAge === age ? colors.primary : '#D1D5DB' }
              ]}>
                {selectedAge === age && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: selectedAge ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!selectedAge}
        >
          <Text style={styles.buttonText}>التالي</Text>
        </TouchableOpacity>
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 18,
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

