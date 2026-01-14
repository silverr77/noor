import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { registerForPushNotificationsAsync, scheduleDailyNotification } from '@/services/notifications';

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
    // Set up notifications when component mounts
    registerForPushNotificationsAsync();
    scheduleDailyNotification();
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
    await updateUser({
      notificationSettings: {
        count: notificationCount,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      
      {/* Progress Bar */}
      <OnboardingProgress currentStep={7} totalSteps={7} showSkip={true} />
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          احصل على أذكار طوال اليوم
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          أخبرني متى تريد أن تسمع مني
        </Text>

        {/* Notification Preview */}
        <View style={styles.previewContainer}>
          <View style={[styles.notificationCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="flame-outline" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>أذكار</Text>
              <Text style={styles.notificationTime}>الآن</Text>
            </View>
            <Text style={[styles.notificationText, { color: colors.text }]}>
              حتى أصغر شعلة يمكنها إضاءة أغمق غرفة
            </Text>
          </View>
        </View>

        {/* Notification Count */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>كم مرة</Text>
          <View style={styles.countContainer}>
            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: colors.cardBackground }]}
              onPress={decrementCount}
            >
              <Ionicons name="remove" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.countText, { color: colors.text }]}>
              {notificationCount}x
            </Text>
            <TouchableOpacity
              style={[styles.countButton, { backgroundColor: colors.cardBackground }]}
              onPress={incrementCount}
            >
              <Ionicons name="add" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>ابدأ من</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setShowStartTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(startTime)}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>ينتهي في</Text>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colors.cardBackground }]}
            onPress={() => setShowEndTimePicker(true)}
          >
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(endTime)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <Text style={[styles.summary, { color: colors.text }]}>
          ستحصل على {notificationCount} إشعارات يومياً بين {formatTime(startTime)} و {formatTime(endTime)}
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

      {/* Time Pickers */}
      {showStartTimePicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(false)}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, { color: colors.primary }]}>تم</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setStartTime(selectedTime);
                }
              }}
              style={styles.picker}
            />
          </View>
        )}

        {showEndTimePicker && (
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(false)}
                style={styles.pickerButton}
              >
                <Text style={[styles.pickerButtonText, { color: colors.primary }]}>تم</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={endTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(event, selectedTime) => {
                if (selectedTime) {
                  setEndTime(selectedTime);
                }
              }}
              style={styles.picker}
            />
          </View>
        )}
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
    flexDirection: 'row',
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
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  notificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
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
  pickerContainer: {
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    width: '100%',
    height: 200,
  },
});

