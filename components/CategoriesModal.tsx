import { Colors } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Quote } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MyQuotesManager } from './MyQuotesManager';

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
  themeAccentColor?: string;
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
  themeAccentColor,
}: CategoriesModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Use theme accent color if provided, otherwise use default primary
  const accentColor = themeAccentColor || colors.primary;
  const { user, updateUser } = useUser();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [showAddQuote, setShowAddQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [showQuotesManager, setShowQuotesManager] = useState(false);

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

  const handleQuotesManagerChange = (quotes: Quote[]) => {
    setCustomQuotes(quotes);
    onCustomQuotesChange(quotes);
  };

  // Swipe to close gesture
  const translateY = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(handleClose)();
      }
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

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
        <GestureDetector gesture={panGesture}>
          <Animated.View
            entering={SlideInDown.springify()}
            exiting={SlideOutDown.springify()}
            style={[styles.modalContent, animatedStyle]}
          >
            {/* Drag Handle */}
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title with Icon */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleFixed}>الفئات</Text>
            </View>

            {/* Create My Own Quote Button */}
            <TouchableOpacity
              style={[styles.createMixButtonLight, { backgroundColor: accentColor }]}
              onPress={() => setShowAddQuote(true)}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.createMixText}>أضف اقتباسك الخاص</Text>
            </TouchableOpacity>

            {/* Add Quote Form */}
            {showAddQuote && (
              <View style={styles.addQuoteForm}>
                <TextInput
                  style={styles.quoteInputLight}
                  placeholder="اكتب اقتباسك هنا..."
                  placeholderTextColor="#9CA3AF"
                  value={newQuoteText}
                  onChangeText={setNewQuoteText}
                  multiline
                  textAlign="right"
                />
                <View style={styles.addQuoteButtons}>
                  <TouchableOpacity
                    style={[styles.addQuoteBtn, { backgroundColor: accentColor }]}
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
            <Text style={styles.sectionTitleFixed}>الأكثر شيوعاً</Text>
            <View style={styles.categoriesGrid}>
              {/* My Own Quotes */}
              <View style={styles.categoryCardWrapper}>
                <TouchableOpacity
                  style={[
                    styles.categoryCard,
                    styles.categoryCardFull,
                    styles.categoryCardLight,
                    showMyQuotes && [styles.categoryCardSelected, { borderColor: accentColor }],
                  ]}
                  onPress={() => onToggleMyQuotes(!showMyQuotes)}
                >
                  <Text style={styles.categoryNameDark}>اقتباساتي</Text>
                  <Text style={styles.categoryCountDark}>{customQuotes.length} اقتباس</Text>
                  <Ionicons name="pencil" size={20} color="#F97316" />
                  {showMyQuotes && (
                    <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
                {/* Settings button to manage quotes */}
                <TouchableOpacity
                  style={styles.manageBtnLight}
                  onPress={() => setShowQuotesManager(true)}
                >
                  <Ionicons name="settings-outline" size={14} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Favorites */}
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  styles.categoryCardLight,
                  showFavorites && [styles.categoryCardSelected, { borderColor: accentColor }],
                ]}
                onPress={() => onToggleFavorites(!showFavorites)}
              >
                <Text style={styles.categoryNameDark}>المفضلة</Text>
                <Text style={styles.categoryCountDark}>{likedCount} اقتباس</Text>
                <Ionicons name="heart" size={20} color="#EF4444" />
                {showFavorites && (
                  <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Categories Section */}
            <Text style={styles.sectionTitleFixed}>لك</Text>
            <Text style={styles.sectionSubtitleFixed}>اختر فئة أو أكثر</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      styles.categoryCardLight,
                      isSelected && [styles.categoryCardSelected, { borderColor: accentColor }],
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Text style={styles.categoryNameDark}>{category.nameAr}</Text>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: accentColor }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* My Quotes Manager Modal */}
      <MyQuotesManager
        visible={showQuotesManager}
        onClose={() => setShowQuotesManager(false)}
        onQuotesChange={handleQuotesManagerChange}
        accentColor={accentColor}
      />
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
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  modalContent: {
    backgroundColor: '#F5F5F0',
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
  titleFixed: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E3A8A',
    marginBottom: 8,
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
  createMixButtonLight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: '#93C5FD',
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
  quoteInputLight: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    color: '#1E3A8A',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  sectionTitleFixed: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
    color: '#1E3A8A',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'right',
    opacity: 0.7,
  },
  sectionSubtitleFixed: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'right',
    opacity: 0.7,
    color: '#1E3A8A',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
    justifyContent: 'flex-end',
  },
  categoryCardWrapper: {
    width: '47%',
    position: 'relative',
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
  categoryCardLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCardSelected: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#F5F3FF',
  },
  categoryCardFull: {
    width: '100%',
  },
  manageBtn: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageBtnLight: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  categoryNameDark: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    color: '#1E3A8A',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  categoryCountDark: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    color: '#6B7280',
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
