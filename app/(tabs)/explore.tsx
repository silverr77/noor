import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { categories } from '@/data/categories';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          الفئات
        </Text>
        
        <Text style={[styles.description, { color: colors.text }]}>
          اختر من فئات مختلفة من الأذكار لتطابق مزاجك واحتياجاتك
        </Text>

        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary,
                }
              ]}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {category.nameAr}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 32,
    lineHeight: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
