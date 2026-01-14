import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CandleIcon } from '@/components/CandleIcon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';

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
      router.push('/onboarding/widgets');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Candle Icon */}
        <View style={styles.iconContainer}>
          <CandleIcon size={100} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          الفئات
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.text }]}>
          في "لك"، اخترنا فئات بناءً على تفضيلاتك
        </Text>
        <Text style={[styles.instruction, { color: colors.primary }]}>
          (اضغط على فئة للمتابعة)
        </Text>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: isSelected ? colors.primary : '#E5E7EB',
                    borderWidth: isSelected ? 2 : 1,
                  }
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={[styles.categoryName, { color: colors.text }]}>
                  {category.nameAr}
                </Text>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Next Button */}
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
    padding: 24,
    paddingTop: 60,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryIcon: {
    fontSize: 24,
    textAlign: 'right',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    alignSelf: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

