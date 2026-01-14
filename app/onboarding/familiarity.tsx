import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';

const familiarityOptions = [
  { value: 'new', label: 'هذا جديد بالنسبة لي' },
  { value: 'occasional', label: 'استخدمتها أحياناً' },
  { value: 'regular', label: 'أستخدمها بانتظام' },
];

export default function FamiliarityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser } = useUser();
  const [selectedFamiliarity, setSelectedFamiliarity] = useState<string>('');

  const handleNext = () => {
    if (selectedFamiliarity) {
      updateUser({ familiarity: selectedFamiliarity as any });
      router.push('/onboarding/categories');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={5} totalSteps={9} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          ما مدى معرفتك بالأذكار، {user?.name}؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          ستتم تخصيص تجربتك لتطابق مستواك
        </Text>

        {/* Familiarity Options */}
        <View style={styles.optionsContainer}>
          {familiarityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selectedFamiliarity === option.value ? colors.primary : '#E5E7EB',
                  borderWidth: selectedFamiliarity === option.value ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedFamiliarity(option.value)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {option.label}
              </Text>
              <View style={[
                styles.radio,
                { borderColor: selectedFamiliarity === option.value ? colors.primary : '#D1D5DB' }
              ]}>
                {selectedFamiliarity === option.value && (
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
            { backgroundColor: selectedFamiliarity ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!selectedFamiliarity}
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

