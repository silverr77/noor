import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    SlideInRight,
    SlideOutRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { 
    requestNotificationPermissions, 
    scheduleNotifications, 
    cancelAllNotifications,
    sendTestNotification,
    checkNotificationPermissions 
} from '@/services/notifications';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  accentColor: string;
}

export function NotificationsModal({ visible, onClose, accentColor }: NotificationsModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  const [startTime, setStartTime] = useState(new Date(2024, 0, 1, 8, 0));
  const [endTime, setEndTime] = useState(new Date(2024, 0, 1, 22, 0));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      loadNotificationSettings();
    }
  }, [visible]);

  const loadNotificationSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationCount(parsed.count || 3);
        setNotificationsEnabled(parsed.enabled !== false);
        if (parsed.startTime) {
          setStartTime(new Date(parsed.startTime));
        }
        if (parsed.endTime) {
          setEndTime(new Date(parsed.endTime));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveNotificationSettings = async (settings: {
    count?: number;
    enabled?: boolean;
    startTime?: Date;
    endTime?: Date;
  }) => {
    try {
      const current = await AsyncStorage.getItem('notificationSettings');
      const parsed = current ? JSON.parse(current) : {};
      const updated = { ...parsed, ...settings };
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      // Request permissions when enabling
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        // Permission denied, keep toggle off
        return;
      }
      setNotificationsEnabled(true);
      await saveNotificationSettings({ enabled: true });
      // Schedule notifications with current settings
      await scheduleNotifications();
      // Send test notification to confirm it works
      await sendTestNotification();
    } else {
      setNotificationsEnabled(false);
      await saveNotificationSettings({ enabled: false });
      // Cancel all notifications
      await cancelAllNotifications();
    }
  };

  const handleCountChange = async (delta: number) => {
    const newCount = Math.max(1, Math.min(10, notificationCount + delta));
    setNotificationCount(newCount);
    await saveNotificationSettings({ count: newCount });
    // Reschedule notifications with new count
    if (notificationsEnabled) {
      await scheduleNotifications();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Swipe to close gesture (swipe right to close)
  const translateX = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 0) {
        translateX.value = event.translationX;
      }
    })
    .onEnd((event) => {
      if (event.translationX > 100 || event.velocityX > 500) {
        runOnJS(onClose)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
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
            entering={SlideInRight.springify()}
            exiting={SlideOutRight.springify()}
            style={[styles.modalContent, animatedStyle]}
          >
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Ionicons name="chevron-forward" size={24} color={accentColor} />
                <Text style={[styles.backButtonText, { color: accentColor }]}>رجوع</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>الإشعارات</Text>
                <Ionicons name="notifications" size={32} color={accentColor} />
              </View>

              {/* Preview Card */}
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={[styles.previewIcon, { backgroundColor: accentColor }]}>
                    <Text style={styles.previewIconText}>🕯️</Text>
                  </View>
                  <View style={styles.previewTextContainer}>
                    <Text style={styles.previewAppName}>أذكار</Text>
                    <Text style={styles.previewTime}>الآن</Text>
                  </View>
                </View>
                <Text style={styles.previewMessage}>
                  حان وقت الذكر والدعاء 🤲
                </Text>
              </View>

              {/* Enable/Disable Toggle */}
              <View style={styles.settingSection}>
                <View style={styles.settingRow}>
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={handleNotificationToggle}
                    trackColor={{ false: '#D1D5DB', true: accentColor }}
                    thumbColor="#FFFFFF"
                  />
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>تفعيل الإشعارات اليومية</Text>
                    <Ionicons name="notifications-outline" size={20} color={accentColor} />
                  </View>
                </View>
              </View>

              {/* Notification Count */}
              {notificationsEnabled && (
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>عدد الإشعارات يومياً</Text>
                  <View style={styles.countRow}>
                    <TouchableOpacity
                      style={[styles.countButton, { backgroundColor: accentColor }]}
                      onPress={() => handleCountChange(-1)}
                    >
                      <Ionicons name="remove" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.countText}>{notificationCount}</Text>
                    <TouchableOpacity
                      style={[styles.countButton, { backgroundColor: accentColor }]}
                      onPress={() => handleCountChange(1)}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Time Range */}
              {notificationsEnabled && (
                <View style={styles.settingSection}>
                  <Text style={styles.sectionTitle}>وقت الإشعارات</Text>
                  
                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowStartPicker(true)}
                    >
                      <Text style={styles.timeLabel}>من</Text>
                      <Text style={[styles.timeValue, { color: accentColor }]}>{formatTime(startTime)}</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowEndPicker(true)}
                    >
                      <Text style={styles.timeLabel}>إلى</Text>
                      <Text style={[styles.timeValue, { color: accentColor }]}>{formatTime(endTime)}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.summaryText}>
                    سيتم إرسال {notificationCount} إشعارات يومياً بين {formatTime(startTime)} و {formatTime(endTime)}
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Time Pickers */}
            {showStartPicker && (
              <Modal transparent visible={showStartPicker} animationType="fade">
                <View style={styles.pickerModal}>
                  <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => setShowStartPicker(false)}>
                        <Text style={[styles.pickerDone, { color: accentColor }]}>تم</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerTitle}>وقت البداية</Text>
                    </View>
                    <DateTimePicker
                      value={startTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={async (event, date) => {
                        if (date) {
                          setStartTime(date);
                          await saveNotificationSettings({ startTime: date });
                          // Reschedule notifications with new time
                          if (notificationsEnabled) {
                            await scheduleNotifications();
                          }
                        }
                        if (Platform.OS === 'android') {
                          setShowStartPicker(false);
                        }
                      }}
                      themeVariant="light"
                      textColor="#1E3A8A"
                      style={{ width: 300, height: 216 }}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {showEndPicker && (
              <Modal transparent visible={showEndPicker} animationType="fade">
                <View style={styles.pickerModal}>
                  <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                      <TouchableOpacity onPress={() => setShowEndPicker(false)}>
                        <Text style={[styles.pickerDone, { color: accentColor }]}>تم</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerTitle}>وقت النهاية</Text>
                    </View>
                    <DateTimePicker
                      value={endTime}
                      mode="time"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={async (event, date) => {
                        if (date) {
                          setEndTime(date);
                          await saveNotificationSettings({ endTime: date });
                          // Reschedule notifications with new time
                          if (notificationsEnabled) {
                            await scheduleNotifications();
                          }
                        }
                        if (Platform.OS === 'android') {
                          setShowEndPicker(false);
                        }
                      }}
                      themeVariant="light"
                      textColor="#1E3A8A"
                      style={{ width: 300, height: 216 }}
                    />
                  </View>
                </View>
              </Modal>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
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
  modalContent: {
    backgroundColor: '#FEF7ED',
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewIconText: {
    fontSize: 20,
  },
  previewTextContainer: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewAppName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  previewTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  previewMessage: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'right',
    lineHeight: 22,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'right',
    marginBottom: 16,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  countButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    minWidth: 50,
    textAlign: 'center',
  },
  timeRow: {
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  pickerModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  pickerHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  pickerDone: {
    fontSize: 16,
    fontWeight: '600',
  },
});

