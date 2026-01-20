import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';

// Classic theme cream background
const ONBOARDING_BG = '#FEF3E2';
const ONBOARDING_TEXT = '#1E3A8A';

const benefits = [
  {
    icon: '🤲',
    title: 'راحة البال والسكينة',
    description: 'الأذكار تملأ قلبك بالطمأنينة وتبعد عنك الهموم والقلق',
  },
  {
    icon: '💎',
    title: 'تقوية الإيمان',
    description: 'المداومة على ذكر الله تزيد إيمانك وتقربك من الله عز وجل',
  },
  {
    icon: '🛡️',
    title: 'حماية وبركة',
    description: 'الأذكار حصن للمسلم تحميه وتجلب البركة في يومه',
  },
];

export default function BenefitsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: ONBOARDING_BG }]}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={1} totalSteps={3} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: ONBOARDING_TEXT }]}>
          لماذا أذكار؟
        </Text>
        
        <Text style={[styles.subtitle, { color: ONBOARDING_TEXT }]}>
          فوائد المداومة على الذكر
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitCard,
                { backgroundColor: '#FFFFFF' }
              ]}
            >
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: ONBOARDING_TEXT }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDescription, { color: ONBOARDING_TEXT }]}>
                  {benefit.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/onboarding/categories')}
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
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding for fixed button
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  benefitsContainer: {
    flex: 1,
    gap: 16,
    marginBottom: 32,
  },
  benefitCard: {
    flexDirection: 'row-reverse', // RTL layout
    padding: 20,
    borderRadius: 16,
    gap: 16,
    alignItems: 'flex-start',
  },
  benefitIcon: {
    fontSize: 40,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right', // RTL text
  },
  benefitDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    textAlign: 'right', // RTL text
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

