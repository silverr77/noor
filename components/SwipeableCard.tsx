import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Quote } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import ViewShot from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.6;

// Swipe settings - more sensitive like Instagram
const SWIPE_THRESHOLD = 80; // Distance in pixels to trigger swipe
const VELOCITY_THRESHOLD = 500; // Velocity to trigger swipe even with small movement

interface SwipeableCardProps {
  quote: Quote;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onLike: (id: string) => void;
  index: number;
  canGoBack: boolean;
  canSwipe?: boolean; // Whether swiping is enabled (false when only 1 quote)
  textColor?: string;
  accentColor?: string;
  themeImage?: ImageSourcePropType;
  themeBackgroundColor?: string;
}

export function SwipeableCard({ 
  quote, 
  onSwipeUp, 
  onSwipeDown, 
  onLike, 
  index, 
  canGoBack, 
  canSwipe = true, // Default to true for backward compatibility
  textColor, 
  accentColor,
  themeImage,
  themeBackgroundColor,
}: SwipeableCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLiked, setIsLiked] = useState(quote.isLiked);
  const viewShotRef = useRef<ViewShot>(null);
  
  // Use theme colors if provided, otherwise use default colors
  const quoteTextColor = textColor || colors.text;
  const quoteAccentColor = accentColor || colors.primary;

  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Sync isLiked state with quote prop
  useEffect(() => {
    setIsLiked(quote.isLiked);
  }, [quote.isLiked]);

  // Reset card position on mount
  useEffect(() => {
    translateY.value = 0;
    opacity.value = 1;
  }, [quote.id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike(quote.id);
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture?.();
        if (uri) {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            await Sharing.shareAsync(uri, {
              mimeType: 'image/png',
              dialogTitle: 'شارك الاقتباس',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(canSwipe) // Disable swiping when only 1 quote
    .onUpdate((event) => {
      // Allow upward swipes (negative translationY)
      if (event.translationY < 0) {
        // Apply some resistance for smoother feel
        translateY.value = event.translationY * 0.8;
        opacity.value = 1 + event.translationY / 400;
      }
      // Allow downward swipes only if can go back (positive translationY)
      else if (event.translationY > 0 && canGoBack) {
        translateY.value = event.translationY * 0.8;
        opacity.value = 1 - event.translationY / 400;
      }
    })
    .onEnd((event) => {
      const distance = Math.abs(event.translationY);
      const velocity = Math.abs(event.velocityY);
      
      // Trigger swipe if: distance > threshold OR velocity is high enough
      const shouldSwipeUp = event.translationY < 0 && 
        (distance > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD);
      const shouldSwipeDown = event.translationY > 0 && canGoBack && 
        (distance > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD);
      
      if (shouldSwipeUp) {
        // Swipe up completed - go to next with smooth animation
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onSwipeUp)();
      } else if (shouldSwipeDown) {
        // Swipe down completed - go to previous
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onSwipeDown)();
      } else {
        // Return to original position with spring bounce
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(1);
      }
    });

  // Double tap gesture for like
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(300)
    .onEnd(() => {
      runOnJS(handleLike)();
    });

  // Combine gestures - both can work simultaneously
  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  // Only show the top card (index 0), hide others
  if (index !== 0) {
    return null;
  }

  return (
    <>
      {/* Hidden ViewShot for capturing share image */}
      <View style={styles.hiddenCapture}>
        <ViewShot 
          ref={viewShotRef} 
          options={{ format: 'png', quality: 1 }}
          style={styles.shareImageContainer}
        >
          {/* Background */}
          {themeImage ? (
            <Image source={themeImage} style={styles.shareBackground} resizeMode="cover" />
          ) : (
            <View style={[styles.shareBackground, { backgroundColor: themeBackgroundColor || '#FEF3E2' }]} />
          )}
          
          {/* Quote Content */}
          <View style={styles.shareContent}>
            <Text style={[styles.shareQuoteText, { color: quoteTextColor }]}>
              {quote.text}
            </Text>
            {quote.translation && (
              <Text style={[styles.shareTranslationText, { color: quoteTextColor }]}>
                {quote.translation}
              </Text>
            )}
          </View>

          {/* App Branding at bottom */}
          <View style={styles.shareBranding}>
            <Text style={[styles.shareAppName, { color: quoteTextColor }]}>نور</Text>
            <Text style={[styles.shareAppTagline, { color: quoteTextColor }]}>أذكار وأدعية المسلم</Text>
          </View>
        </ViewShot>
      </View>

      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.card,
            animatedStyle,
          ]}
        >
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={[styles.quoteText, { color: quoteTextColor, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }]}>
                {quote.text}
              </Text>
              {quote.translation && (
                <Text style={[styles.translationText, { color: quoteTextColor, textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }]}>
                  {quote.translation}
                </Text>
              )}
              
              {/* Actions - Like and Share */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-outline" size={28} color={quoteAccentColor} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleLike}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isLiked ? 'heart' : 'heart-outline'}
                    size={28}
                    color={isLiked ? '#EF4444' : quoteAccentColor}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </>
  );
}

interface SwipeIndicatorProps {
  visible: boolean;
  quoteId: string; // Used to reset the timer when quote changes
  accentColor?: string;
}

export function SwipeIndicator({ visible, quoteId, accentColor }: SwipeIndicatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showIndicator, setShowIndicator] = useState(false);
  const [currentQuoteId, setCurrentQuoteId] = useState(quoteId);
  
  const indicatorColor = accentColor || colors.primary;
  
  // Animation values
  const translateY = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  // Start animation when indicator becomes visible
  useEffect(() => {
    if (showIndicator) {
      // Fade in
      indicatorOpacity.value = withTiming(1, { duration: 300 });
      // Start jumping animation
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1, // Infinite repeat
        false
      );
    }
  }, [showIndicator]);

  // Handle quote change - reset timer but keep indicator if already showing
  useEffect(() => {
    // If quote changed, reset the timer
    if (quoteId !== currentQuoteId) {
      setCurrentQuoteId(quoteId);
      setShowIndicator(false);
      indicatorOpacity.value = 0;
      translateY.value = 0;
    }

    if (!visible) {
      setShowIndicator(false);
      return;
    }

    // Show indicator after delay
    const timer = setTimeout(() => {
      setShowIndicator(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [quoteId, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: indicatorOpacity.value,
  }));

  if (!showIndicator) return null;

  return (
    <Animated.View style={[indicatorStyles.container, animatedStyle]}>
      <View style={indicatorStyles.indicator}>
        <Ionicons name="chevron-up-outline" size={20} color={indicatorColor} />
        <Text style={[indicatorStyles.text, { color: indicatorColor }]}>اسحب للأعلى</Text>
      </View>
    </Animated.View>
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
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    marginTop: 32,
    paddingVertical: 16,
  },
  actionButton: {
    padding: 12,
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Share image styles
  hiddenCapture: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  shareImageContainer: {
    width: 1080, // Instagram story width
    height: 1920, // Instagram story height
    overflow: 'hidden',
  },
  shareBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shareContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 80,
    paddingTop: 200,
    paddingBottom: 300,
  },
  shareQuoteText: {
    fontSize: 64,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 96,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  shareTranslationText: {
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 54,
    marginTop: 40,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  shareBranding: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shareAppName: {
    fontSize: 48,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  shareAppTagline: {
    fontSize: 28,
    marginTop: 8,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
