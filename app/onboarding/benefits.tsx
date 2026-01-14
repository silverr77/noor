import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';

const benefits = [
  {
    icon: '🧘',
    title: 'تقليل التوتر',
    description: 'لحظات تأملية طوال اليوم تساعدك على البقاء هادئاً وإدارة القلق',
  },
  {
    icon: '✨',
    title: 'زيادة الإيجابية',
    description: 'التذكيرات اليومية تحول تفكيرك نحو الامتنان والتفاؤل',
  },
  {
    icon: '🎯',
    title: 'تحقيق أهدافك',
    description: 'الكلام الإيجابي مع النفس يعزز قدراتك ويحفزك على العمل',
  },
];

export default function BenefitsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={5} totalSteps={7} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          فوائد الأذكار اليومية
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          {benefits.map((benefit, index) => (
            <View
              key={index}
              style={[
                styles.benefitCard,
                { backgroundColor: colors.cardBackground }
              ]}
            >
              <Text style={styles.benefitIcon}>{benefit.icon}</Text>
              <View style={styles.benefitContent}>
                <Text style={[styles.benefitTitle, { color: colors.text }]}>
                  {benefit.title}
                </Text>
                <Text style={[styles.benefitDescription, { color: colors.text }]}>
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
          onPress={() => router.push('/onboarding/notifications')}
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
    marginBottom: 32,
  },
  benefitsContainer: {
    flex: 1,
    gap: 16,
    marginBottom: 32,
  },
  benefitCard: {
    flexDirection: 'row',
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
  },
  benefitDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
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

