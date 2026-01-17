import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quote } from '@/types';

interface CategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoriesChange: (categoryIds: string[]) => void;
  onCustomQuotesChange: (quotes: Quote[]) => void;
  likedCount: number;
  showFavorites: boolean;
  onToggleFavorites: (show: boolean) => void;
  showMyQuotes: boolean;
  onToggleMyQuotes: (show: boolean) => void;
}

export function CategoriesModal({ 
  visible, 
  onClose, 
  onCategoriesChange,
  onCustomQuotesChange,
  likedCount,
  showFavorites,
  onToggleFavorites,
  showMyQuotes,
  onToggleMyQuotes,
}: CategoriesModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser } = useUser();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');

  // Load selected categories from user context when modal opens
  useEffect(() => {
    if (visible) {
      // Load from user context (saved during onboarding)
      if (user?.selectedCategories && user.selectedCategories.length > 0) {
        setSelectedCategories(user.selectedCategories);
      }
      loadCustomQuotes();
    }
  }, [visible, user?.selectedCategories]);

  const loadCustomQuotes = async () => {
    try {
      const saved = await AsyncStorage.getItem('customQuotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Handle mixed format (strings and Quote objects)
        const quotes: Quote[] = Array.isArray(parsed) 
          ? parsed.map((item: string | Quote, index: number) => {
              if (typeof item === 'string') {
                return {
                  id: `custom-legacy-${index}`,
                  text: item,
                  category: 'my-quotes',
                  isLiked: false,
                  date: new Date().toISOString(),
                };
              }
              return item as Quote;
            }).filter((q): q is Quote => q !== null && 'text' in q)
          : [];
        setCustomQuotes(quotes);
        onCustomQuotesChange(quotes);
      } else {
        setCustomQuotes([]);
      }
    } catch (error) {
      console.error('Error loading custom quotes:', error);
    }
  };

  // Toggle category selection (multi-select)
  const toggleCategory = async (categoryId: string) => {
    let newSelection: string[];
    
    if (selectedCategories.includes(categoryId)) {
      newSelection = selectedCategories.filter(id => id !== categoryId);
    } else {
      newSelection = [...selectedCategories, categoryId];
    }
    
    setSelectedCategories(newSelection);
    
    // Save to user context
    await updateUser({ selectedCategories: newSelection });
    
    // Notify parent
    onCategoriesChange(newSelection);
  };

  const handleAddQuote = async () => {
    if (newQuoteText.trim()) {
      const newQuote: Quote = {
        id: `custom-${Date.now()}`,
        text: newQuoteText.trim(),
        category: 'my-quotes',
        isLiked: false,
        date: new Date().toISOString(),
      };
      
      // First load existing quotes from storage to avoid overwriting
      let existingQuotes: Quote[] = [];
      try {
        const saved = await AsyncStorage.getItem('customQuotes');
        if (saved) {
          existingQuotes = JSON.parse(saved) as Quote[];
        }
      } catch (error) {
        console.error('Error loading existing quotes:', error);
      }
      
      const updatedQuotes = [...existingQuotes, newQuote];
      setCustomQuotes(updatedQuotes);
      
      try {
        await AsyncStorage.setItem('customQuotes', JSON.stringify(updatedQuotes));
        // Notify parent immediately
        onCustomQuotesChange(updatedQuotes);
        console.log('Quote saved successfully:', newQuote.text);
      } catch (error) {
        console.error('Error saving custom quote:', error);
      }
      
      setNewQuoteText('');
      setShowAddQuote(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.modalContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title with Icon */}
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>الفئات</Text>
              <Text style={styles.candleIcon}>🕯️</Text>
            </View>

            {/* Create My Own Quote Button */}
            <TouchableOpacity
              style={[styles.createMixButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddQuote(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.createMixText}>أضف اقتباسك الخاص</Text>
            </TouchableOpacity>

            {/* Add Quote Form */}
            {showAddQuote && (
              <View style={styles.addQuoteForm}>
                <TextInput
                  style={[styles.quoteInput, { backgroundColor: colors.cardBackground, color: colors.text }]}
                  placeholder="اكتب اقتباسك هنا..."
                  placeholderTextColor="#9CA3AF"
                  value={newQuoteText}
                  onChangeText={setNewQuoteText}
                  multiline
                  textAlign="right"
                />
                <View style={styles.addQuoteButtons}>
                  <TouchableOpacity
                    style={[styles.addQuoteBtn, { backgroundColor: colors.primary }]}
                    onPress={handleAddQuote}
                  >
                    <Text style={styles.addQuoteBtnText}>إضافة</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addQuoteBtn, { backgroundColor: '#E5E7EB' }]}
                    onPress={() => setShowAddQuote(false)}
                  >
                    <Text style={[styles.addQuoteBtnText, { color: colors.text }]}>إلغاء</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Special Filters Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>الأكثر شيوعاً</Text>
            <View style={styles.categoriesGrid}>
              {/* My Own Quotes */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: showMyQuotes ? colors.primary : 'transparent',
                    borderWidth: showMyQuotes ? 2 : 0,
                  }
                ]}
                onPress={() => onToggleMyQuotes(!showMyQuotes)}
              >
                <Text style={[styles.categoryName, { color: colors.text }]}>اقتباساتي</Text>
                <Text style={[styles.categoryCount, { color: colors.text }]}>{customQuotes.length} اقتباس</Text>
                <Ionicons name="pencil" size={20} color="#F97316" />
                {showMyQuotes && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Favorites */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: colors.cardBackground,
                    borderColor: showFavorites ? colors.primary : 'transparent',
                    borderWidth: showFavorites ? 2 : 0,
                  }
                ]}
                onPress={() => onToggleFavorites(!showFavorites)}
              >
                <Text style={[styles.categoryName, { color: colors.text }]}>المفضلة</Text>
                <Text style={[styles.categoryCount, { color: colors.text }]}>{likedCount} اقتباس</Text>
                <Ionicons name="heart" size={20} color="#EF4444" />
                {showFavorites && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Categories Section */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>لك</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.text }]}>اختر فئة أو أكثر</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      { 
                        backgroundColor: colors.cardBackground,
                        borderColor: isSelected ? colors.primary : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                      }
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={[styles.categoryName, { color: colors.text }]}>{category.nameAr}</Text>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Selected count indicator */}
            {selectedCategories.length > 0 && (
              <View style={styles.selectedIndicator}>
                <Text style={[styles.selectedText, { color: colors.primary }]}>
                  {selectedCategories.length} فئات مختارة
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FEF7ED',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  candleIcon: {
    fontSize: 48,
  },
  createMixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    marginBottom: 32,
  },
  createMixText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addQuoteForm: {
    marginBottom: 24,
    gap: 12,
  },
  quoteInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addQuoteButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  addQuoteBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addQuoteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'right',
    opacity: 0.7,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'flex-end',
  },
  categoryCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-end',
    minHeight: 100,
    justifyContent: 'space-between',
    position: 'relative',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginTop: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 32,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
