import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';
import { OnboardingProgress } from '@/components/OnboardingProgress';

// Classic theme cream background
const ONBOARDING_BG = '#FEF3E2';
const ONBOARDING_TEXT = '#1E3A8A';

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser } = useUser();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleNext = () => {
    if (selectedCategories.length > 0) {
      updateUser({ selectedCategories });
      router.push('/onboarding/notifications');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: ONBOARDING_BG }]}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={5} totalSteps={6} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: ONBOARDING_TEXT }]}>
          اختر الفئات المفضلة لديك
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: ONBOARDING_TEXT }]}>
          اختر الفئات التي تريد أن تراها في تطبيقك
        </Text>

        {/* Categories List */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: isSelected ? colors.primary : '#FFFFFF',
                    borderColor: isSelected ? colors.primary : '#E5E7EB',
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryName, 
                  { 
                    color: isSelected ? '#FFFFFF' : ONBOARDING_TEXT,
                    fontWeight: isSelected ? '600' : '400',
                  }
                ]}>
                  {category.nameAr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: selectedCategories.length > 0 ? colors.primary : '#D1D5DB' }
          ]}
          onPress={handleNext}
          disabled={selectedCategories.length === 0}
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  categoriesContainer: {
    width: '100%',
    marginBottom: 32,
  },
  categoryCard: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  categoryIcon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 18,
    flex: 1,
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

