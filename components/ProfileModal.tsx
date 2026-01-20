import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import Animated, { 
  SlideInDown, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationsModal } from './NotificationsModal';

const APP_VERSION = '1.0.0';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Days of the week in Arabic (starting from Saturday for Arabic calendar)
const DAYS_AR = ['س', 'أ', 'إ', 'ث', 'أ', 'خ', 'ج'];
const DAYS_FULL = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  themeAccentColor?: string;
  onOpenThemes?: () => void;
  onOpenCategories?: () => void;
}

// Get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'صباح الخير';
  } else if (hour >= 12 && hour < 17) {
    return 'مساء الخير';
  } else if (hour >= 17 && hour < 21) {
    return 'مساء النور';
  } else {
    return 'مساء الخير';
  }
};

export function ProfileModal({ 
  visible, 
  onClose, 
  themeAccentColor,
  onOpenThemes,
  onOpenCategories,
}: ProfileModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user, resetOnboarding } = useUser();
  
  // Streak state
  const [streakDays, setStreakDays] = useState<number[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  
  // Notifications modal state
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  
  // About modal state
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  // Use theme accent color if provided, otherwise use default primary
  const accentColor = themeAccentColor || colors.primary;

  // Share app with friends
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'جرّب تطبيق نور - أذكار وأدعية المسلم ✨\nتطبيق رائع للأذكار والأدعية والحكم اليومية\n\nحمّله الآن!',
        title: 'نور - أذكار وأدعية المسلم',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Load streak data when modal opens
  useEffect(() => {
    if (visible) {
      loadStreakData();
      recordVisit();
    }
  }, [visible]);

  const loadStreakData = async () => {
    try {
      const data = await AsyncStorage.getItem('weeklyStreak');
      if (data) {
        const parsed = JSON.parse(data);
        const weekStart = getWeekStart();
        
        // Check if it's a new week
        if (parsed.weekStart !== weekStart) {
          // Reset for new week
          const newData = { weekStart, days: [], count: 0 };
          await AsyncStorage.setItem('weeklyStreak', JSON.stringify(newData));
          setStreakDays([]);
          setStreakCount(0);
        } else {
          setStreakDays(parsed.days || []);
          setStreakCount(parsed.days?.length || 0);
        }
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const recordVisit = async () => {
    try {
      const today = new Date();
      const dayOfWeek = (today.getDay() + 1) % 7; // Shift to start from Saturday
      const weekStart = getWeekStart();
      
      const data = await AsyncStorage.getItem('weeklyStreak');
      let parsed = data ? JSON.parse(data) : { weekStart, days: [] };
      
      // Reset if new week
      if (parsed.weekStart !== weekStart) {
        parsed = { weekStart, days: [] };
      }
      
      // Add today if not already recorded
      if (!parsed.days.includes(dayOfWeek)) {
        parsed.days.push(dayOfWeek);
        await AsyncStorage.setItem('weeklyStreak', JSON.stringify(parsed));
        setStreakDays(parsed.days);
        setStreakCount(parsed.days.length);
      }
    } catch (error) {
      console.error('Error recording visit:', error);
    }
  };

  const getWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = (day + 1) % 7; // Days since Saturday
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - diff);
    return weekStart.toISOString().split('T')[0];
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
        runOnJS(onClose)();
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
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
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
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title - Centered */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleFixed}>الإعدادات</Text>
            </View>

            {/* Streak Section */}
            <View style={styles.streakSection}>
              <Text style={styles.streakTitle}>تقدمك الأسبوعي</Text>
              <View style={styles.streakContainer}>
                <View style={styles.streakCountContainer}>
                  <Text style={[styles.streakNumber, { color: accentColor }]}>{streakCount}</Text>
                  <Text style={styles.streakLabel}>أيام</Text>
                </View>
                <View style={styles.weekDaysContainer}>
                  {DAYS_AR.map((day, index) => {
                    const isActive = streakDays.includes(index);
                    const isToday = index === (new Date().getDay() + 1) % 7;
                    return (
                      <View key={index} style={styles.dayColumn}>
                        <Text style={styles.dayLabel}>{day}</Text>
                        <View
                          style={[
                            styles.dayCircle,
                            isActive && { backgroundColor: accentColor },
                            isToday && !isActive && styles.todayCircle,
                          ]}
                        >
                          {isActive && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* User Info - RTL: Avatar on right, text on left */}
            <View style={styles.section}>
              <View style={styles.userInfo}>
                <View style={styles.userTextContainer}>
                  <Text style={styles.userNameFixed}>
                    {getGreeting()} 👋
                  </Text>
                </View>
                <View style={[styles.avatarFixed, { backgroundColor: accentColor }]}>
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleFixed}>
                الإعدادات
              </Text>
              
              {/* Notifications */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => setShowNotificationsModal(true)}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabelFixed}>
                    الإشعارات
                  </Text>
                  <Ionicons name="notifications-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>

              {/* Themes */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => {
                  onClose();
                  onOpenThemes?.();
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabelFixed}>
                    الخلفيات
                  </Text>
                  <Ionicons name="color-palette-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>

              {/* Categories */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => {
                  onClose();
                  onOpenCategories?.();
                }}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabelFixed}>
                    الفئات
                  </Text>
                  <Ionicons name="grid-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Share & About Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitleFixed}>
                المزيد
              </Text>

              {/* Share App */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={handleShareApp}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabelFixed}>
                    شارك التطبيق مع أصدقائك
                  </Text>
                  <Ionicons name="share-social-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>

              {/* About */}
              <TouchableOpacity 
                style={styles.settingRow}
                onPress={() => setShowAboutModal(true)}
              >
                <Ionicons name="chevron-back" size={20} color="#6B7280" />
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabelFixed}>
                    حول التطبيق
                  </Text>
                  <Ionicons name="information-circle-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>

              {/* Dev Mode: Reset Tour */}
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={async () => {
                    await AsyncStorage.removeItem('hasSeenTour');
                    onClose();
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#6B7280" />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabelFixed, { color: '#F59E0B' }]}>
                      إعادة جولة التعريف (Dev Mode)
                    </Text>
                    <Ionicons name="help-circle-outline" size={20} color="#F59E0B" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Dev Mode: Reset Onboarding */}
              {__DEV__ && (
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => {
                    resetOnboarding();
                    onClose();
                    router.replace('/onboarding/welcome');
                  }}
                >
                  <Ionicons name="chevron-back" size={20} color="#6B7280" />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabelFixed, { color: '#EF4444' }]}>
                      إعادة تشغيل التعريف (Dev Mode)
                    </Text>
                    <Ionicons name="refresh-outline" size={20} color="#EF4444" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

          </Animated.View>
        </GestureDetector>
      </View>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        accentColor={accentColor}
      />

      {/* About Modal */}
      <Modal
        visible={showAboutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.aboutOverlay}>
          <View style={styles.aboutContainer}>
            {/* App Icon */}
            <View style={[styles.aboutAppIcon, { backgroundColor: accentColor }]}>
              <Text style={styles.aboutAppIconText}>🕯️</Text>
            </View>

            {/* App Name */}
            <Text style={styles.aboutAppName}>نور</Text>
            <Text style={styles.aboutAppTagline}>أذكار وأدعية المسلم</Text>
            <Text style={styles.aboutVersion}>الإصدار {APP_VERSION}</Text>

            {/* Description */}
            <Text style={styles.aboutDescription}>
              تطبيق نور يقدم لك مجموعة مختارة من الأذكار والأدعية والحكم اليومية لتنير يومك وتقربك من الله.
            </Text>

            {/* Features */}
            <View style={styles.aboutFeatures}>
              <View style={styles.aboutFeatureItem}>
                <Ionicons name="heart" size={20} color={accentColor} />
                <Text style={styles.aboutFeatureText}>أذكار وأدعية متنوعة</Text>
              </View>
              <View style={styles.aboutFeatureItem}>
                <Ionicons name="notifications" size={20} color={accentColor} />
                <Text style={styles.aboutFeatureText}>تذكيرات يومية</Text>
              </View>
              <View style={styles.aboutFeatureItem}>
                <Ionicons name="color-palette" size={20} color={accentColor} />
                <Text style={styles.aboutFeatureText}>خلفيات جميلة</Text>
              </View>
              <View style={styles.aboutFeatureItem}>
                <Ionicons name="share-social" size={20} color={accentColor} />
                <Text style={styles.aboutFeatureText}>مشاركة الاقتباسات</Text>
              </View>
            </View>

            {/* Made with love */}
            <Text style={styles.aboutMadeWith}>
              صُنع بـ ❤️ لنشر النور والخير
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.aboutCloseButton, { backgroundColor: accentColor }]}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.aboutCloseButtonText}>حسناً</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#F5F5F5',
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'right',
  },
  titleFixed: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1E3A8A',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Streak styles
  streakSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'right',
    marginBottom: 16,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakCountContainer: {
    alignItems: 'center',
    paddingRight: 20,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#6B7280',
    backgroundColor: 'transparent',
  },
  section: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
  },
  userTextContainer: {
    alignItems: 'flex-end',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFixed: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  userNameFixed: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#1E3A8A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  sectionTitleFixed: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
    color: '#1E3A8A',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    textAlign: 'right',
  },
  settingLabelFixed: {
    fontSize: 16,
    textAlign: 'right',
    color: '#1E3A8A',
  },
  // About Modal Styles
  aboutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  aboutContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  aboutAppIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutAppIconText: {
    fontSize: 40,
  },
  aboutAppName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  aboutAppTagline: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  aboutFeatures: {
    width: '100%',
    marginBottom: 20,
  },
  aboutFeatureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  aboutFeatureText: {
    fontSize: 14,
    color: '#1E3A8A',
    flex: 1,
    textAlign: 'right',
  },
  aboutMadeWith: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  aboutCloseButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  aboutCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

