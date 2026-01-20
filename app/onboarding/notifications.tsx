import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { requestNotificationPermissions, scheduleNotifications, sendTestNotification } from '@/services/notifications';

// Green theme - matches نور branding
const ONBOARDING_BG = '#F5F5F0';
const ONBOARDING_TEXT = '#1B5E20';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updateUser, completeOnboarding } = useUser();
  const [notificationCount, setNotificationCount] = useState(3);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  React.useEffect(() => {
    // Request notification permissions when screen loads
    requestNotificationPermissions();
  }, []);

  // Set default times
  React.useEffect(() => {
    const defaultStart = new Date();
    defaultStart.setHours(9, 0, 0, 0);
    const defaultEnd = new Date();
    defaultEnd.setHours(22, 0, 0, 0);
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleNext = async () => {
    // Save notification settings
    const notificationSettings = {
      enabled: true,
      count: notificationCount,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    
    await updateUser({ notificationSettings });
    
    // Also save to AsyncStorage for the notification service
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    await AsyncStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    // Schedule notifications with user settings
    await scheduleNotifications();
    
    // Send a test notification to confirm setup
    await sendTestNotification();
    
    await completeOnboarding();
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  const incrementCount = () => {
    if (notificationCount < 10) {
      setNotificationCount(notificationCount + 1);
    }
  };

  const decrementCount = () => {
    if (notificationCount > 1) {
      setNotificationCount(notificationCount - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: ONBOARDING_BG }]}>
      <StatusBar style="dark" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={3} totalSteps={3} showSkip={false} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: ONBOARDING_TEXT }]}>
          تذكيرات يومية
        </Text>
        <Text style={[styles.subtitle, { color: ONBOARDING_TEXT }]}>
          اختر أوقات التذكير المناسبة لك
        </Text>

        {/* Notification Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.notificationCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="flame-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.appName, { color: ONBOARDING_TEXT }]}>نور</Text>
              <Text style={styles.notificationTime}>الآن</Text>
            </View>
<Text style={[styles.notificationText, { color: ONBOARDING_TEXT }]}>
            "ألا بذكر الله تطمئن القلوب" 💚
          </Text>
          </View>
        </View>

        {/* Notification Count */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: ONBOARDING_TEXT }]}>عدد التذكيرات</Text>
          <View style={styles.countContainer}>
            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: '#FFFFFF' }]}
              onPress={decrementCount}
            >
              <Ionicons name="remove" size={20} color={ONBOARDING_TEXT} />
            </TouchableOpacity>
            <Text style={[styles.countText, { color: ONBOARDING_TEXT }]}>
              {notificationCount}x
            </Text>
            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: '#FFFFFF' }]}
              onPress={incrementCount}
            >
              <Ionicons name="add" size={20} color={ONBOARDING_TEXT} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: ONBOARDING_TEXT }]}>من الساعة</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: ONBOARDING_TEXT }]}>
              {formatTime(startTime)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: ONBOARDING_TEXT }]}>إلى الساعة</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: '#FFFFFF' }]}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: ONBOARDING_TEXT }]}>
              {formatTime(endTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <Text style={[styles.summary, { color: ONBOARDING_TEXT }]}>
          سيصلك {notificationCount} تذكير{notificationCount > 2 ? 'ات' : ''} يومياً من {formatTime(startTime)} إلى {formatTime(endTime)}
        </Text>

      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>ابدأ</Text>
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal - Start Time */}
      <Modal
        visible={showStartTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStartTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowStartTimePicker(false)} 
          />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>وقت البداية</Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(false)}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, { color: colors.primary }]}>تم</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={startTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                themeVariant="light"
                textColor="#1B5E20"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setStartTime(selectedTime);
                  }
                }}
                style={styles.picker}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal - End Time */}
      <Modal
        visible={showEndTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setShowEndTimePicker(false)} 
          />
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>وقت النهاية</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(false)}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, { color: colors.primary }]}>تم</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={endTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                themeVariant="light"
                textColor="#1B5E20"
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setEndTime(selectedTime);
                  }
                }}
                style={styles.picker}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 100, // Extra padding for fixed button
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  notificationCard: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right', // RTL text
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right', // RTL text
  },
  section: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right', // RTL text
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 20,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  summary: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  pickerHeader: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerWrapper: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  picker: {
    width: 300,
    height: 216,
    backgroundColor: '#FFFFFF',
  },
});

