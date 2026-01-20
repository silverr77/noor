import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Animation values
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  
  const bottomTitleOpacity = useSharedValue(0);
  const bottomTitleTranslateY = useSharedValue(30);
  const bottomSubtitleOpacity = useSharedValue(0);
  const bottomSubtitleTranslateY = useSharedValue(30);
  const descriptionOpacity = useSharedValue(0);
  const descriptionTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(30);
  const buttonScale = useSharedValue(1);

  // Sparkle animations
  const sparkle1Opacity = useSharedValue(0);
  const sparkle2Opacity = useSharedValue(0);
  const sparkle3Opacity = useSharedValue(0);
  const sparkle1Y = useSharedValue(0);
  const sparkle2Y = useSharedValue(0);
  const sparkle3Y = useSharedValue(0);

  // Glow animation
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Title animation - scale up with bounce
    titleScale.value = withDelay(
      200,
      withSpring(1, { damping: 8, stiffness: 100 })
    );
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Subtitle animation
    subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
    subtitleTranslateY.value = withDelay(
      500,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // Bottom section staggered animations
    bottomTitleOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    bottomTitleTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    bottomSubtitleOpacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    bottomSubtitleTranslateY.value = withDelay(
      1000,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    descriptionOpacity.value = withDelay(1200, withTiming(1, { duration: 500 }));
    descriptionTranslateY.value = withDelay(
      1200,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    buttonOpacity.value = withDelay(1400, withTiming(1, { duration: 500 }));
    buttonTranslateY.value = withDelay(
      1400,
      withSpring(0, { damping: 12, stiffness: 100 })
    );

    // Button pulse animation
    buttonScale.value = withDelay(
      2000,
      withRepeat(
        withSequence(
          withTiming(1.03, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      )
    );

    // Sparkle animations
    sparkle1Opacity.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.2, { duration: 1500 })
        ),
        -1,
        true
      )
    );
    sparkle1Y.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        true
      )
    );

    sparkle2Opacity.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800 }),
          withTiming(0.2, { duration: 1800 })
        ),
        -1,
        true
      )
    );
    sparkle2Y.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 2200 }),
          withTiming(0, { duration: 2200 })
        ),
        -1,
        true
      )
    );

    sparkle3Opacity.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0.2, { duration: 2000 })
        ),
        -1,
        true
      )
    );
    sparkle3Y.value = withDelay(
      1200,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: 1800 }),
          withTiming(0, { duration: 1800 })
        ),
        -1,
        true
      )
    );

    // Glow animation
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const bottomTitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomTitleOpacity.value,
    transform: [{ translateY: bottomTitleTranslateY.value }],
  }));

  const bottomSubtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomSubtitleOpacity.value,
    transform: [{ translateY: bottomSubtitleTranslateY.value }],
  }));

  const descriptionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
    transform: [{ translateY: descriptionTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { translateY: buttonTranslateY.value },
      { scale: buttonScale.value },
    ],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    opacity: sparkle1Opacity.value,
    transform: [{ translateY: sparkle1Y.value }],
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    opacity: sparkle2Opacity.value,
    transform: [{ translateY: sparkle2Y.value }],
  }));

  const sparkle3Style = useAnimatedStyle(() => ({
    opacity: sparkle3Opacity.value,
    transform: [{ translateY: sparkle3Y.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Half - Gold Background */}
      <View style={styles.topSection}>
        {/* Glow Effect */}
        <Animated.View style={[styles.glowCircle, glowStyle]} />
        
        {/* Sparkles */}
        <Animated.Text style={[styles.sparkle, styles.sparkle1, sparkle1Style]}>✦</Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkle2, sparkle2Style]}>✧</Animated.Text>
        <Animated.Text style={[styles.sparkle, styles.sparkle3, sparkle3Style]}>✦</Animated.Text>
        
        <View style={styles.topContent}>
          <Animated.Text style={[styles.appTitle, titleAnimatedStyle]}>نور</Animated.Text>
          <Animated.Text style={[styles.appSubtitle, subtitleAnimatedStyle]}>
            أذكار وأدعية المسلم
          </Animated.Text>
        </View>
        
        {/* Curved Divider */}
        <Svg
          style={styles.curve}
          width={SCREEN_WIDTH}
          height={60}
          viewBox={`0 0 ${SCREEN_WIDTH} 60`}
        >
          <Path
            d={`M 0 0 Q ${SCREEN_WIDTH / 2} 40 ${SCREEN_WIDTH} 0 L ${SCREEN_WIDTH} 60 L 0 60 Z`}
            fill="#E8F5E9"
          />
        </Svg>
      </View>

      {/* Bottom Half - Cream Background */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomContent}>
          {/* Title */}
          <Animated.Text style={[styles.title, bottomTitleAnimatedStyle]}>
            مرحباً بك في نور
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, bottomSubtitleAnimatedStyle]}>
            نورٌ لقلبك كل يوم
          </Animated.Text>

          {/* Description */}
          <Animated.Text style={[styles.description, descriptionAnimatedStyle]}>
            اجعل يومك مليئاً بالبركة والسكينة مع تذكيرات يومية بالأذكار والأدعية
          </Animated.Text>

          {/* CTA Button */}
          <AnimatedTouchableOpacity
            style={[styles.button, buttonAnimatedStyle]}
            onPress={() => router.push('/onboarding/benefits')}
          >
            <Text style={styles.buttonText}>ابدأ الآن</Text>
          </AnimatedTouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  topSection: {
    flex: 0.6,
    backgroundColor: '#1B5E20',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowCircle: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sparkle1: {
    top: '20%',
    left: '15%',
    fontSize: 28,
  },
  sparkle2: {
    top: '25%',
    right: '20%',
    fontSize: 20,
  },
  sparkle3: {
    bottom: '35%',
    left: '25%',
    fontSize: 22,
  },
  topContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  appTitle: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.95,
  },
  curve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 60,
  },
  bottomSection: {
    flex: 0.4,
    backgroundColor: '#E8F5E9',
    marginTop: -1,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1B5E20',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1B5E20',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1B5E20',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1B5E20',
    minWidth: 200,
    shadowColor: '#0D3D14',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
