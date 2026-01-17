import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NameScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [name, setName] = useState('');

  const handleNext = () => {
    if (name.trim()) {
      updateUser({ name: name.trim() });
      router.push('/onboarding/age');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={1} totalSteps={7} showSkip={false} />
      
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          ما اسمك؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          أود أن أعرفك أكثر!
        </Text>

        {/* Input */}
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.primary,
            color: colors.text 
          }]}
          placeholder="أدخل اسمك"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          autoFocus
          textAlign="right"
        />
      </View>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: name.trim() ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>التالي</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
  input: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 18,
    marginBottom: 24,
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

