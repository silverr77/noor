import React, { useState, useEffect } from 'react';
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
import { categories } from '@/data/categories';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, updateUser } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    user?.selectedCategories || []
  );

  useEffect(() => {
    if (user?.selectedCategories) {
      setSelectedCategories(user.selectedCategories);
    }
  }, [user]);

  const toggleCategory = async (categoryId: string) => {
    const updated = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(updated);
    updateUser({ selectedCategories: updated });
    
    try {
      await AsyncStorage.setItem('selectedCategories', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>الإعدادات</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1E3A8A" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.section}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user?.name || 'المستخدم'}
                  </Text>
                  <Text style={[styles.userSubtext, { color: colors.text }]}>
                    {user?.age || 'غير محدد'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                الإشعارات
              </Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    تفعيل الإشعارات اليومية
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#D1D5DB', true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Categories Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                الفئات المفضلة
              </Text>
              <Text style={[styles.sectionDescription, { color: colors.text }]}>
                اختر الفئات التي تريد رؤيتها في أذكارك اليومية
              </Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.background,
                          borderColor: isSelected ? colors.primary : '#E5E7EB',
                        },
                      ]}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text,
                          },
                        ]}
                      >
                        {category.nameAr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Other Settings */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                إعدادات أخرى
              </Text>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="language-outline" size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    اللغة
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="moon-outline" size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    الوضع الليلي
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    حول التطبيق
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text} />
              </TouchableOpacity>
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
    maxHeight: '90%',
    marginTop: 60,
    flex: 1,
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
    gap: 16,
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
  },
  userSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
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
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

