import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Share } from 'react-native';
import { Quote } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

interface SwipeableCardProps {
  quote: Quote;
  onSwipe: () => void;
  onLike: (id: string) => void;
  index: number;
}

export function SwipeableCard({ quote, onSwipe, onLike, index }: SwipeableCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLiked, setIsLiked] = useState(quote.isLiked);

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Reset card position on mount
  useEffect(() => {
    translateY.value = 0;
    opacity.value = 1;
  }, [quote.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(quote.id);
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow upward swipes (negative translationY)
      if (event.translationY < 0) {
        translateY.value = event.translationY;
        opacity.value = 1 + event.translationY / 500; // Fade out as swiping up
      }
    })
    .onEnd((event) => {
      const threshold = SCREEN_HEIGHT / 4; // Swipe up threshold
      if (event.translationY < -threshold) {
        // Swipe up completed
        translateY.value = withSpring(-SCREEN_HEIGHT);
        opacity.value = withSpring(0);
        runOnJS(onSwipe)();
      } else {
        // Return to original position
        translateY.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  // Double tap gesture for like - should work alongside pan
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(handleLike)();
    });

  // Use Simultaneous so both gestures can work - pan for swipe, double tap for like
  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${quote.text}\n\n${quote.translation || ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Only show the top card (index 0), hide others
  if (index !== 0) {
    return null;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <Text style={[styles.quoteText, { color: colors.text }]}>
              {quote.text}
            </Text>
            {quote.translation && (
              <Text style={[styles.translationText, { color: colors.text }]}>
                {quote.translation}
              </Text>
            )}
            
            {/* Actions right below the quote */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLike}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? '#EF4444' : colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

interface SwipeIndicatorProps {
  visible: boolean;
}

export function SwipeIndicator({ visible }: SwipeIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!visible) return null;

  return (
    <View style={indicatorStyles.container}>
      <View style={indicatorStyles.indicator}>
        <Ionicons name="chevron-up-outline" size={20} color={colors.primary} />
        <Text style={[indicatorStyles.text, { color: colors.primary }]}>اسحب للأعلى</Text>
      </View>
    </View>
  );
}

const indicatorStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});


const styles = StyleSheet.create({
  card: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    alignSelf: 'center',
    top: 0,
    left: 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 100, // Space for swipe indicator
    justifyContent: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  quoteText: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 42,
    marginBottom: 16,
  },
  translationText: {
    fontSize: 18,
    textAlign: 'right',
    lineHeight: 28,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    marginTop: 32,
    paddingVertical: 16,
  },
  actionButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

