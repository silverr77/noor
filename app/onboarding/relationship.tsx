import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CandleIcon } from '@/components/CandleIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';

const relationshipStatuses = [
  'أعزب ومفتوح للتواصل',
  'معقد',
  'أعزب بسعادة',
  'في علاقة سعيدة',
  'أمر بفترة انفصال',
  'غير مهتم بهذا الموضوع',
];

export default function RelationshipScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const handleNext = () => {
    if (selectedStatus) {
      updateUser({ relationshipStatus: selectedStatus });
      router.push('/onboarding/familiarity');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Candle Icon */}
        <View style={styles.iconContainer}>
          <CandleIcon size={120} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          ما هي حالة علاقتك؟
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          اختر ما يصفك بشكل أفضل
        </Text>

        {/* Status Options */}
        <View style={styles.optionsContainer}>
          {relationshipStatuses.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.option,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: selectedStatus === status ? colors.primary : '#E5E7EB',
                  borderWidth: selectedStatus === status ? 2 : 1,
                }
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {status}
              </Text>
              <View style={[
                styles.radio,
                { borderColor: selectedStatus === status ? colors.primary : '#D1D5DB' }
              ]}>
                {selectedStatus === status && (
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
            { backgroundColor: selectedStatus ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={!selectedStatus}
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
  iconContainer: {
    marginBottom: 32,
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

