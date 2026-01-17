import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useUser } from '@/context/UserContext';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  themeAccentColor?: string;
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

export function ProfileModal({ visible, onClose, themeAccentColor }: ProfileModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user, resetOnboarding } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Use theme accent color if provided, otherwise use default primary
  const accentColor = themeAccentColor || colors.primary;

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
        <Animated.View
          entering={SlideInDown.springify()}
          exiting={SlideOutDown.springify()}
          style={styles.modalContent}
        >
          {/* Header - RTL: Title on right, X on left */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
            <Text style={styles.title}>الإعدادات</Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info - RTL: Avatar on right, text on left */}
            <View style={styles.section}>
              <View style={styles.userInfo}>
                <View style={styles.userTextContainer}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {getGreeting()}، {user?.name || 'المستخدم'}
                  </Text>
                </View>
                <View style={[styles.avatar, { backgroundColor: accentColor }]}>
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                الإشعارات
              </Text>
              <View style={styles.settingRow}>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: accentColor }}
                  thumbColor="#FFFFFF"
                />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    تفعيل الإشعارات اليومية
                  </Text>
                  <Ionicons name="notifications-outline" size={20} color={accentColor} />
                </View>
              </View>
            </View>

            {/* Other Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                إعدادات أخرى
              </Text>
              <TouchableOpacity style={styles.settingRow}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    اللغة
                  </Text>
                  <Ionicons name="language-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    الوضع الليلي
                  </Text>
                  <Ionicons name="moon-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow}>
                <Ionicons name="chevron-back" size={20} color={colors.text} />
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    حول التطبيق
                  </Text>
                  <Ionicons name="information-circle-outline" size={20} color={accentColor} />
                </View>
              </TouchableOpacity>

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
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: '#EF4444' }]}>
                      إعادة تشغيل التعريف (Dev Mode)
                    </Text>
                    <Ionicons name="refresh-outline" size={20} color="#EF4444" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>

        </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    textAlign: 'right',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
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
  notificationConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 35,
    textAlign: 'center',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    lineHeight: 18,
  },
});
