import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 500;

// Dynamic import for AdMob - only works in development builds, not Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let useForeground: any = null;
let isAdMobAvailable = false;

try {
  const admob = require('react-native-google-mobile-ads');
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
  useForeground = admob.useForeground;
  isAdMobAvailable = true;
} catch (e) {
  // AdMob not available (running in Expo Go)
  console.log('AdMob not available - using placeholder ads');
  isAdMobAvailable = false;
}

interface AdCardProps {
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  canGoBack: boolean;
  textColor?: string;
  accentColor?: string;
}

// Test ad unit IDs - Replace with your real ad unit IDs in production
const getAdUnitId = () => {
  if (!isAdMobAvailable || !TestIds) return '';
  return __DEV__ 
    ? TestIds.ADAPTIVE_BANNER 
    : Platform.select({
        ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS ad unit ID
        android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android ad unit ID
      }) || TestIds.ADAPTIVE_BANNER;
};

export function AdCard({ 
  onSwipeUp, 
  onSwipeDown, 
  canGoBack,
  textColor = '#1E3A8A',
  accentColor = '#8B5CF6',
}: AdCardProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(!isAdMobAvailable);

  // Required for iOS to refresh ads when app comes to foreground
  // Only call if available
  if (isAdMobAvailable && useForeground) {
    useForeground();
  }

  const handleSwipeUp = () => {
    onSwipeUp();
  };

  const handleSwipeDown = () => {
    if (canGoBack) {
      onSwipeDown();
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Add resistance when going the wrong direction
      const dragResistance = 0.5;
      
      if (event.translationY < 0) {
        // Swiping up - always allowed
        translateY.value = event.translationY * dragResistance;
      } else if (canGoBack) {
        // Swiping down - only if can go back
        translateY.value = event.translationY * dragResistance;
      }
    })
    .onEnd((event) => {
      const shouldSwipeUp = 
        event.translationY < -SWIPE_THRESHOLD || 
        event.velocityY < -VELOCITY_THRESHOLD;
      
      const shouldSwipeDown = 
        canGoBack && 
        (event.translationY > SWIPE_THRESHOLD || 
         event.velocityY > VELOCITY_THRESHOLD);

      if (shouldSwipeUp) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipeUp)();
        });
      } else if (shouldSwipeDown) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipeDown)();
        });
      } else {
        // Spring back to original position
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Reset animation when component appears
  useEffect(() => {
    translateY.value = 0;
    opacity.value = 1;
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.contentContainer}>
          {/* Ad Label */}
          <View style={[styles.adLabelContainer, { backgroundColor: accentColor + '20' }]}>
            <Text style={[styles.adLabel, { color: accentColor }]}>إعلان</Text>
          </View>

          {/* Ad Container */}
          <View style={styles.adContainer}>
            {!adError && isAdMobAvailable && BannerAd ? (
              <BannerAd
                unitId={getAdUnitId()}
                size={BannerAdSize.MEDIUM_RECTANGLE}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => {
                  console.log('Ad loaded');
                  setAdLoaded(true);
                }}
                onAdFailedToLoad={(error: any) => {
                  console.log('Ad failed to load:', error);
                  setAdError(true);
                }}
              />
            ) : (
              // Fallback when ad fails to load or AdMob not available (Expo Go)
              <View style={[styles.fallbackAd, { borderColor: accentColor + '40' }]}>
                <Text style={[styles.fallbackIcon]}>📢</Text>
                <Text style={[styles.fallbackText, { color: textColor }]}>
                  {isAdMobAvailable ? 'استمر في القراءة' : 'مساحة إعلانية'}
                </Text>
                <Text style={[styles.fallbackSubtext, { color: textColor + '80' }]}>
                  {isAdMobAvailable ? 'اسحب للمتابعة' : 'اسحب للمتابعة ↑'}
                </Text>
                {!isAdMobAvailable && (
                  <Text style={[styles.devNote, { color: accentColor }]}>
                    (الإعلانات تعمل في Development Build)
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <Text style={[styles.swipeHintText, { color: textColor + '60' }]}>
              ↑ اسحب للمتابعة ↑
            </Text>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 140,
    paddingBottom: 120,
  },
  adLabelContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  adLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  adContainer: {
    width: SCREEN_WIDTH - 40,
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  fallbackAd: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  fallbackText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 16,
  },
  swipeHint: {
    marginTop: 30,
  },
  swipeHintText: {
    fontSize: 14,
    fontWeight: '500',
  },
  devNote: {
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
  },
});

