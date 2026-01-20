import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  position: 'top' | 'center' | 'bottom';
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'مرحباً بك في نور!',
    description: 'دعنا نأخذك في جولة سريعة للتعرف على التطبيق',
    icon: 'sparkles',
    position: 'center',
  },
  {
    id: 'swipe',
    title: 'اسحب لاكتشاف المزيد',
    description: 'اسحب للأعلى أو للأسفل للتنقل بين الأذكار والأقوال',
    icon: 'swap-vertical',
    position: 'center',
  },
  {
    id: 'double-tap',
    title: 'أضف للمفضلة',
    description: 'انقر مرتين على الشاشة لإضافة الاقتباس للمفضلة',
    icon: 'heart',
    position: 'center',
  },
  {
    id: 'categories',
    title: 'الفئات',
    description: 'اضغط هنا لاختيار الفئات المفضلة لديك وإضافة اقتباساتك الخاصة',
    icon: 'grid',
    position: 'center',
  },
  {
    id: 'profile',
    title: 'الإعدادات',
    description: 'اضغط هنا للوصول للإعدادات والإشعارات ومتابعة تقدمك',
    icon: 'person',
    position: 'center',
  },
  {
    id: 'themes',
    title: 'الخلفيات',
    description: 'غيّر خلفية التطبيق لتناسب ذوقك',
    icon: 'color-palette',
    position: 'center',
  },
  {
    id: 'share',
    title: 'شارك مع أحبابك',
    description: 'شارك الأذكار والأقوال مع أصدقائك وعائلتك',
    icon: 'share-social',
    position: 'center',
  },
  {
    id: 'done',
    title: 'أنت جاهز!',
    description: 'استمتع برحلتك مع نور وابقَ على صلة بذكر الله',
    icon: 'checkmark-circle',
    position: 'center',
  },
];

interface TourGuideProps {
  visible: boolean;
  onComplete: () => void;
}

export function TourGuide({ visible, onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const pulseScale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  useEffect(() => {
    if (visible) {
      fadeIn.value = withTiming(1, { duration: 300 });
      
      // Pulse animation for the icon
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      fadeIn.value = withTiming(0, { duration: 150 }, () => {
        fadeIn.value = withTiming(1, { duration: 300 });
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('hasSeenTour', 'true');
    } catch (error) {
      console.error('Error saving tour status:', error);
    }
    onComplete();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const getPositionStyle = () => {
    switch (step.position) {
      case 'top':
        return styles.tooltipTop;
      case 'bottom':
        return styles.tooltipBottom;
      default:
        return styles.tooltipCenter;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {tourSteps.length}
          </Text>
        </View>

        {/* Tooltip Card */}
        <Animated.View style={[styles.tooltipContainer, getPositionStyle(), fadeStyle]}>
          <View style={styles.tooltip}>
            {/* Icon */}
            <Animated.View style={[styles.iconContainer, pulseStyle]}>
              <View style={styles.iconBg}>
                <Ionicons name={step.icon} size={40} color="#D4AF37" />
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>{step.title}</Text>

            {/* Description */}
            <Text style={styles.description}>{step.description}</Text>

            {/* Dots Indicator */}
            <View style={styles.dotsContainer}>
              {tourSteps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentStep && styles.dotActive,
                    index < currentStep && styles.dotCompleted,
                  ]}
                />
              ))}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setCurrentStep(currentStep - 1)}
                >
                  <Ionicons name="arrow-forward" size={20} color="#5D4E37" />
                  <Text style={styles.backButtonText}>السابق</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.nextButton, isLastStep && styles.doneButton]}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>
                  {isLastStep ? 'ابدأ الآن' : 'التالي'}
                </Text>
                {!isLastStep && (
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Hook to check if tour should be shown
// TEMPORARILY DISABLED - set TOUR_ENABLED to true to re-enable
const TOUR_ENABLED = false;

export const useTourGuide = () => {
  const [showTour, setShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (TOUR_ENABLED) {
      checkTourStatus();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkTourStatus = async () => {
    try {
      const hasSeenTour = await AsyncStorage.getItem('hasSeenTour');
      if (hasSeenTour !== 'true') {
        // Small delay to let the main screen render first
        setTimeout(() => {
          setShowTour(true);
        }, 500);
      }
    } catch (error) {
      console.error('Error checking tour status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTour = () => {
    setShowTour(false);
  };

  const resetTour = async () => {
    if (!TOUR_ENABLED) return;
    try {
      await AsyncStorage.removeItem('hasSeenTour');
      setShowTour(true);
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  return { showTour, completeTour, resetTour, isLoading };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  tooltipContainer: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 360,
    overflow: 'hidden',
  },
  tooltipTop: {
    marginTop: SCREEN_HEIGHT * 0.15,
  },
  tooltipCenter: {
    // Default centered
  },
  tooltipBottom: {
    marginTop: SCREEN_HEIGHT * 0.3,
  },
  tooltip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5D4E37',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#8B7355',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#D4AF37',
  },
  dotCompleted: {
    backgroundColor: '#D4AF37',
  },
  buttonsContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#5D4E37',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#B8860B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  doneButton: {
    paddingHorizontal: 40,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

