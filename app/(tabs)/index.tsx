import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SwipeableCard, SwipeIndicator } from '@/components/SwipeableCard';
import { ProfileModal } from '@/components/ProfileModal';
import { sampleQuotes } from '@/data/quotes';
import { Quote } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [quotes, setQuotes] = useState<Quote[]>(sampleQuotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
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
        setLikedCount(likedIds.length);
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
    setLikedCount(likedIds.length);

    try {
      await AsyncStorage.setItem('likedQuotes', JSON.stringify(likedIds));
    } catch (error) {
      console.error('Error saving liked quotes:', error);
    }
  };

  const currentQuote = quotes[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header} pointerEvents="box-none">
        <View style={styles.likesContainer} pointerEvents="none">
          <Ionicons name="heart" size={16} color={colors.primary} />
          <Text style={[styles.likesText, { color: colors.text }]}>
            {likedCount}/5
          </Text>
          <View style={[styles.progressBar, { backgroundColor: '#E5E7EB' }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(likedCount / 5) * 100}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setProfileModalVisible(true)}
            activeOpacity={0.7}
            pointerEvents="auto"
          >
            <Ionicons name="person-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1000,
    position: 'relative',
  },
  headerRight: {
    width: 44,
    height: 44,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
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
