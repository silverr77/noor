import { ProfileModal } from '@/components/ProfileModal';
import { SwipeableCard, SwipeIndicator } from '@/components/SwipeableCard';
import { Colors } from '@/constants/theme';
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
  const [quotes, setQuotes] = useState<Quote[]>(sampleQuotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    loadLikedQuotes();
  }, []);

  const loadLikedQuotes = async () => {
    try {
      const liked = await AsyncStorage.getItem('likedQuotes');
      if (liked) {
        const likedIds = JSON.parse(liked);
        setQuotes(prev =>
          prev.map(q => ({ ...q, isLiked: likedIds.includes(q.id) }))
        );
      }
    } catch (error) {
      console.error('Error loading liked quotes:', error);
    }
  };

  const handleSwipeUp = () => {
    // Small delay to allow animation to complete
    setTimeout(() => {
      if (currentIndex < quotes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Reset to beginning or load more quotes
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleSwipeDown = () => {
    // Small delay to allow animation to complete
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 300);
  };

  const handleLike = async (quoteId: string) => {
    const updatedQuotes = quotes.map(q =>
      q.id === quoteId ? { ...q, isLiked: !q.isLiked } : q
    );
    setQuotes(updatedQuotes);

    const likedIds = updatedQuotes.filter(q => q.isLiked).map(q => q.id);

    try {
      await AsyncStorage.setItem('likedQuotes', JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error saving liked quotes:', error);
    }
  };

  const currentQuote = quotes[currentIndex];
  
  // Get category info for current quote
  const currentCategory = categories.find(c => c.id === currentQuote?.category);
  const categoryName = currentCategory?.nameAr || 'عام';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header} pointerEvents="box-none">
        {/* Grid Button - Left */}
        <TouchableOpacity
          style={styles.gridButton}
          activeOpacity={0.7}
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
        {currentQuote && (
          <SwipeableCard
            key={currentQuote.id}
            quote={currentQuote}
            onSwipeUp={handleSwipeUp}
            onSwipeDown={handleSwipeDown}
            onLike={handleLike}
            index={0}
            canGoBack={currentIndex > 0}
          />
        )}
      </View>

      {/* Swipe Indicator - Fixed at bottom of screen */}
      <View style={styles.swipeIndicatorContainer}>
        <SwipeIndicator 
          visible={currentIndex < quotes.length} 
          quoteId={currentQuote?.id || ''} 
        />
      </View>

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
});
