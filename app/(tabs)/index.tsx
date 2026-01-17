import { CategoriesModal } from '@/components/CategoriesModal';
import { ProfileModal } from '@/components/ProfileModal';
import { SwipeableCard, SwipeIndicator } from '@/components/SwipeableCard';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';
import { sampleQuotes } from '@/data/quotes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Quote } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useUser();
  
  const [quotes, setQuotes] = useState<Quote[]>(sampleQuotes);
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyQuotes, setShowMyQuotes] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

  useEffect(() => {
    loadLikedQuotes();
    loadCustomQuotes();
    
    // Load selected categories from user context
    if (user?.selectedCategories && user.selectedCategories.length > 0) {
      setSelectedCategories(user.selectedCategories);
    }
  }, [user?.selectedCategories]);

  // Reload custom quotes when modal closes
  useEffect(() => {
    if (!categoriesModalVisible) {
      loadCustomQuotes();
    }
  }, [categoriesModalVisible]);

  // Reload custom quotes when switching to my quotes view
  useEffect(() => {
    if (showMyQuotes) {
      loadCustomQuotes();
    }
  }, [showMyQuotes]);

  const loadLikedQuotes = async () => {
    try {
      const liked = await AsyncStorage.getItem('likedQuotes');
      if (liked) {
        const likedIds = JSON.parse(liked);
        setQuotes(prev =>
          prev.map(q => ({ ...q, isLiked: likedIds.includes(q.id) }))
        );
        setLikedCount(likedIds.length);
      }
    } catch (error) {
      console.error('Error loading liked quotes:', error);
    }
  };

  const loadCustomQuotes = async () => {
    try {
      const saved = await AsyncStorage.getItem('customQuotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        if (Array.isArray(parsed)) {
          // Handle mixed format: some items might be strings, others Quote objects
          const parsedQuotes: Quote[] = parsed.map((item: string | Quote, index: number) => {
            if (typeof item === 'string') {
              // Convert plain string to Quote object
              return {
                id: `custom-legacy-${index}-${Date.now()}`,
                text: item,
                category: 'my-quotes',
                isLiked: false,
                date: new Date().toISOString(),
              };
            } else if (item && typeof item === 'object' && 'text' in item) {
              // Already a Quote object
              return item as Quote;
            } else {
              // Unknown format, skip
              return null;
            }
          }).filter((q): q is Quote => q !== null);
          
          setCustomQuotes(parsedQuotes);
          
          // Also save in proper format to fix storage
          await AsyncStorage.setItem('customQuotes', JSON.stringify(parsedQuotes));
        } else {
          setCustomQuotes([]);
        }
      } else {
        setCustomQuotes([]);
      }
    } catch (error) {
      console.error('Error loading custom quotes:', error);
      setCustomQuotes([]);
    }
  };

  const handleSwipeUp = () => {
    setTimeout(() => {
      if (currentIndex < filteredQuotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSwipeDown = () => {
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 300);
  };

  const handleLike = async (quoteId: string) => {
    // Check if it's a custom quote
    const isCustomQuote = quoteId.startsWith('custom-');
    
    if (isCustomQuote) {
      const updatedCustomQuotes = customQuotes.map(q =>
        q.id === quoteId ? { ...q, isLiked: !q.isLiked } : q
      );
      setCustomQuotes(updatedCustomQuotes);
      await AsyncStorage.setItem('customQuotes', JSON.stringify(updatedCustomQuotes));
    } else {
      const updatedQuotes = quotes.map(q =>
        q.id === quoteId ? { ...q, isLiked: !q.isLiked } : q
      );
      setQuotes(updatedQuotes);
      
      const likedIds = updatedQuotes.filter(q => q.isLiked).map(q => q.id);
      setLikedCount(likedIds.length);
      await AsyncStorage.setItem('likedQuotes', JSON.stringify(likedIds));
    }
  };

  const handleCategoriesChange = (categoryIds: string[]) => {
    setSelectedCategories(categoryIds);
    setCurrentIndex(0);
  };

  const handleCustomQuotesChange = (newCustomQuotes: Quote[]) => {
    setCustomQuotes(newCustomQuotes);
  };

  const handleToggleFavorites = (show: boolean) => {
    setShowFavorites(show);
    setCurrentIndex(0);
  };

  const handleToggleMyQuotes = (show: boolean) => {
    setShowMyQuotes(show);
    setCurrentIndex(0);
  };

  // Get filtered quotes based on selections
  // Combines all selected sources: favorites, my quotes, and categories
  const getFilteredQuotes = (): Quote[] => {
    const hasAnySelection = showFavorites || showMyQuotes || selectedCategories.length > 0;
    
    // If no selections, show all regular quotes
    if (!hasAnySelection) {
      return quotes;
    }
    
    let result: Quote[] = [];
    
    // Add favorites if selected
    if (showFavorites) {
      const allQuotes = [...quotes, ...customQuotes];
      const likedQuotes = allQuotes.filter(q => q.isLiked);
      result = [...result, ...likedQuotes];
    }
    
    // Add my quotes if selected
    if (showMyQuotes) {
      // Add custom quotes that aren't already included (from favorites)
      const newQuotes = customQuotes.filter(q => !result.some(r => r.id === q.id));
      result = [...result, ...newQuotes];
    }
    
    // Add quotes from selected categories
    if (selectedCategories.length > 0) {
      const categoryQuotes = quotes.filter(q => selectedCategories.includes(q.category));
      // Add only quotes that aren't already included
      const newQuotes = categoryQuotes.filter(q => !result.some(r => r.id === q.id));
      result = [...result, ...newQuotes];
    }
    
    return result;
  };

  const filteredQuotes = getFilteredQuotes();
  const currentQuote = filteredQuotes[currentIndex];

  // Get display category name - shows combined selections
  const getDisplayCategoryName = () => {
    const parts: string[] = [];
    
    if (showFavorites) parts.push('المفضلة');
    if (showMyQuotes) parts.push('اقتباساتي');
    
    if (selectedCategories.length === 1) {
      const cat = categories.find(c => c.id === selectedCategories[0]);
      if (cat) parts.push(cat.nameAr);
    } else if (selectedCategories.length > 1) {
      parts.push(`${selectedCategories.length} فئات`);
    }
    
    if (parts.length === 0) return 'عام';
    if (parts.length === 1) return parts[0];
    return `${parts.length} مختارة`;
  };
  const categoryName = getDisplayCategoryName();

  // Calculate total liked count (from both regular and custom quotes)
  const totalLikedCount = likedCount + customQuotes.filter(q => q.isLiked).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header} pointerEvents="box-none">
        {/* Grid Button - Left */}
        <TouchableOpacity
          style={styles.gridButton}
          activeOpacity={0.7}
          onPress={() => setCategoriesModalVisible(true)}
        >
          <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Category Tag - Center */}
        <View style={[styles.categoryTag, { backgroundColor: colors.primary }]}>
          <Text style={styles.categoryTagText}>{categoryName}</Text>
        </View>

        {/* Profile Button - Right */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => setProfileModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {currentQuote ? (
          <SwipeableCard
            key={currentQuote.id}
            quote={currentQuote}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onLike={handleLike}
            index={0}
            canGoBack={currentIndex > 0}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.primary} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              {showMyQuotes 
                ? 'لا توجد اقتباسات خاصة بعد\nأضف اقتباسك الأول!'
                : showFavorites
                  ? 'لا توجد اقتباسات مفضلة بعد'
                  : 'لا توجد اقتباسات في هذه الفئة'}
            </Text>
            {showMyQuotes && (
              <TouchableOpacity
                style={[styles.addQuoteButton, { backgroundColor: colors.primary }]}
                onPress={() => setCategoriesModalVisible(true)}
              >
                <Text style={styles.addQuoteButtonText}>أضف اقتباس</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Swipe Indicator - Fixed at bottom of screen */}
      {currentQuote && (
        <View style={styles.swipeIndicatorContainer}>
          <SwipeIndicator 
            visible={currentIndex < filteredQuotes.length - 1} 
            quoteId={currentQuote?.id || ''} 
          />
        </View>
      )}

      {/* Categories Modal */}
      <CategoriesModal
        visible={categoriesModalVisible}
        onClose={() => setCategoriesModalVisible(false)}
        onCategoriesChange={handleCategoriesChange}
        onCustomQuotesChange={handleCustomQuotesChange}
        likedCount={totalLikedCount}
        showFavorites={showFavorites}
        onToggleFavorites={handleToggleFavorites}
        showMyQuotes={showMyQuotes}
        onToggleMyQuotes={handleToggleMyQuotes}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    zIndex: 1000,
    position: 'relative',
  },
  gridButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  swipeIndicatorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 28,
    opacity: 0.7,
  },
  addQuoteButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  addQuoteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
