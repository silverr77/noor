import { AdCard } from '@/components/AdCard';
import { CategoriesModal } from '@/components/CategoriesModal';
import { ProfileModal } from '@/components/ProfileModal';
import { SwipeableCard, SwipeIndicator } from '@/components/SwipeableCard';
import { getThemeById, Theme, ThemesModal } from '@/components/ThemesModal';
import { TourGuide, useTourGuide } from '@/components/TourGuide';
import { Colors } from '@/constants/theme';
import { useUser } from '@/context/UserContext';
import { categories } from '@/data/categories';
import { sampleQuotes } from '@/data/quotes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeAds } from '@/services/ads';
import { Quote } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

// Fisher-Yates shuffle algorithm for randomizing quotes
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useUser();
  
  const [quotes, setQuotes] = useState<Quote[]>(sampleQuotes);
  const [customQuotes, setCustomQuotes] = useState<Quote[]>([]);
  const [shuffledQuotes, setShuffledQuotes] = useState<Quote[]>([]); // Shuffled quotes for the session
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMyQuotes, setShowMyQuotes] = useState(false);
  const [likedCount, setLikedCount] = useState(0);
  const [themesModalVisible, setThemesModalVisible] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState('classic');
  const [currentTheme, setCurrentTheme] = useState<Theme>(getThemeById('classic'));
  
  // Tour guide
  const { showTour, completeTour } = useTourGuide();
  
  // Ad tracking - improved strategy
  const [swipeCount, setSwipeCount] = useState(0);
  const [showingAd, setShowingAd] = useState(false);
  const [sessionAdCount, setSessionAdCount] = useState(0);
  
  // Ad configuration
  const AD_FREQUENCY = 6; // Show ad every 6 swipes (was 3)
  const FIRST_AD_DELAY = 4; // Don't show ad until user has swiped at least 4 times
  const MAX_ADS_PER_SESSION = 5; // Limit ads per session to avoid frustration

  useEffect(() => {
    loadLikedQuotes();
    loadCustomQuotes();
    loadSavedTheme();
    
    // Preload interstitial ads
    initializeAds();
    
    // Load selected categories from user context
    if (user?.selectedCategories && user.selectedCategories.length > 0) {
      setSelectedCategories(user.selectedCategories);
    }
  }, [user?.selectedCategories]);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme) {
        setCurrentThemeId(savedTheme);
        setCurrentTheme(getThemeById(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentThemeId(themeId);
    setCurrentTheme(getThemeById(themeId));
  };

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
      // If currently showing an ad, move to next quote after ad
      if (showingAd) {
        setShowingAd(false);
        setSessionAdCount(prev => prev + 1);
        if (currentIndex < filteredQuotes.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
        return;
      }
      
      // Increment swipe count
      const newSwipeCount = swipeCount + 1;
      setSwipeCount(newSwipeCount);
      
      // Check if it's time to show an ad (improved logic)
      const shouldShowAd = 
        newSwipeCount >= FIRST_AD_DELAY && // Wait for user to engage first
        newSwipeCount % AD_FREQUENCY === 0 && // Show at frequency intervals
        sessionAdCount < MAX_ADS_PER_SESSION; // Don't exceed session limit
      
      if (shouldShowAd) {
        setShowingAd(true);
        return;
      }
      
      // Normal quote navigation
      if (currentIndex < filteredQuotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSwipeDown = () => {
    setTimeout(() => {
      // If showing an ad, dismiss it and go back
      if (showingAd) {
        setShowingAd(false);
        return;
      }
      
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

  // Get filtered quotes based on selections (not shuffled - used for comparison)
  const getFilteredQuotesRaw = (): Quote[] => {
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

  // Create a shuffle key that only changes when categories/filters change
  // NOT when quotes are liked/unliked
  const shuffleKey = `${selectedCategories.sort().join(',')}-${showFavorites}-${showMyQuotes}`;
  
  // Shuffle quotes ONLY when filters change or on first load
  // Using shuffleKey ensures we don't reshuffle when liking quotes
  useEffect(() => {
    const rawQuotes = getFilteredQuotesRaw();
    const shuffled = shuffleArray(rawQuotes);
    setShuffledQuotes(shuffled);
    setCurrentIndex(0); // Reset to beginning when filters change
  }, [shuffleKey]); // Only depends on filter changes, not quote state changes

  // Update shuffled quotes when quote data changes (for liked state) WITHOUT reshuffling
  useEffect(() => {
    if (shuffledQuotes.length > 0) {
      // Update liked states without changing order
      const updatedShuffled = shuffledQuotes.map(sq => {
        const updated = [...quotes, ...customQuotes].find(q => q.id === sq.id);
        return updated || sq;
      }).filter(sq => {
        // Keep quote only if it still matches current filters
        const allCurrentQuotes = [...quotes, ...customQuotes];
        return allCurrentQuotes.some(q => q.id === sq.id);
      });
      setShuffledQuotes(updatedShuffled);
    }
  }, [quotes, customQuotes]);

  // Use shuffled quotes for display
  const filteredQuotes = shuffledQuotes;
  const currentQuote = filteredQuotes[currentIndex];

  // Get display category name - shows the current quote's category
  const getDisplayCategoryName = () => {
    // If showing an ad, show "إعلان"
    if (showingAd) return 'إعلان';
    
    if (!currentQuote) return 'عام';
    
    // Check if it's a custom quote
    if (currentQuote.id.startsWith('custom-')) {
      return 'اقتباساتي';
    }
    
    // Check if it's a liked quote being shown in favorites view
    if (showFavorites && currentQuote.isLiked) {
      // Still show the actual category of the quote
    }
    
    // Find the category name
    const cat = categories.find(c => c.id === currentQuote.category);
    return cat?.nameAr || 'عام';
  };
  const categoryName = getDisplayCategoryName();

  // Calculate total liked count (from both regular and custom quotes)
  const totalLikedCount = likedCount + customQuotes.filter(q => q.isLiked).length;

  // Determine status bar style based on theme
  // Classic theme (no image) = dark status bar (dark text on light background)
  // Image themes = light status bar (white text on dark images)
  const statusBarStyle: 'light' | 'dark' = currentTheme.image ? 'light' : 'dark';

  // Check if using classic theme (solid background)
  const isClassicTheme = !currentTheme.image;

  return (
    <View style={[styles.container, isClassicTheme && { backgroundColor: currentTheme.backgroundColor }]}>
      {/* Background Image - only for image themes */}
      {currentTheme.image && (
        <>
        <Image
            source={currentTheme.image} 
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          {/* Dark overlay for better text readability */}
          <View style={styles.backgroundOverlay} />
        </>
      )}
      <StatusBar style={statusBarStyle} />

      {/* Header */}
      <View style={styles.header} pointerEvents="box-none">
        {/* Grid Button - Left */}
        <TouchableOpacity
          style={[styles.gridButton, { backgroundColor: currentTheme.headerBgColor }]}
          activeOpacity={0.7}
          onPress={() => setCategoriesModalVisible(true)}
        >
          <Ionicons name="grid-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Category Tag - Center */}
        <View style={[styles.categoryTag, { backgroundColor: currentTheme.headerBgColor }]}>
          <Text style={styles.categoryTagText}>{categoryName}</Text>
        </View>

        {/* Profile Button - Right */}
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: currentTheme.headerBgColor }]}
          onPress={() => setProfileModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {showingAd ? (
          // Show Ad Card
          <AdCard
            key="ad-card"
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            canGoBack={true}
            textColor={currentTheme.textColor}
            accentColor={currentTheme.accentColor}
          />
        ) : currentQuote ? (
          <SwipeableCard
            key={currentQuote.id}
            quote={currentQuote}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onLike={handleLike}
            index={0}
            canGoBack={currentIndex > 0}
            textColor={currentTheme.textColor}
            accentColor={currentTheme.accentColor}
            themeImage={currentTheme.image}
            themeBackgroundColor={currentTheme.backgroundColor}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={currentTheme.accentColor} />
            <Text style={[styles.emptyStateText, { color: currentTheme.textColor }]}>
              {showMyQuotes 
                ? 'لا توجد اقتباسات خاصة بعد\nأضف اقتباسك الأول!'
                : showFavorites
                  ? 'لا توجد اقتباسات مفضلة بعد'
                  : 'لا توجد اقتباسات في هذه الفئة'}
            </Text>
            {showMyQuotes && (
              <TouchableOpacity
                style={[styles.addQuoteButton, { backgroundColor: currentTheme.accentColor }]}
                onPress={() => setCategoriesModalVisible(true)}
              >
                <Text style={styles.addQuoteButtonText}>أضف اقتباس</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Bottom Area - Swipe Indicator and Theme Button */}
      <View style={styles.bottomArea}>
        {/* Swipe Indicator */}
        {(currentQuote || showingAd) && (
          <View style={styles.swipeIndicatorContainer}>
            <SwipeIndicator 
              visible={filteredQuotes.length > 1 || showingAd} 
              quoteId={showingAd ? 'ad-card' : (currentQuote?.id || '')} 
              accentColor={currentTheme.accentColor}
            />
          </View>
        )}

        {/* Theme Button */}
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: currentTheme.headerBgColor }]}
          onPress={() => setThemesModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="color-palette-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

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
        themeAccentColor={currentTheme.accentColor}
      />

      {/* Profile Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        themeAccentColor={currentTheme.accentColor}
        onOpenThemes={() => setThemesModalVisible(true)}
        onOpenCategories={() => setCategoriesModalVisible(true)}
      />

      {/* Themes Modal */}
      <ThemesModal
        visible={themesModalVisible}
        onClose={() => setThemesModalVisible(false)}
        currentTheme={currentThemeId}
        onThemeChange={handleThemeChange}
      />

      {/* Tour Guide - shows after first onboarding */}
      <TourGuide
        visible={showTour}
        onComplete={completeTour}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 0,
    zIndex: 1000,
    position: 'relative',
  },
  gridButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  swipeIndicatorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
