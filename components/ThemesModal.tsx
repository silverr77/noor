import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeAds, showInterstitialAd, showRewardedAd } from '@/services/ads';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageSourcePropType,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2;

export interface Theme {
  id: string;
  name: string;
  nameAr: string;
  textColor: string;
  accentColor: string;
  headerBgColor: string; // Background color for header buttons
  backgroundColor?: string; // Solid background color (for classic theme)
  image?: ImageSourcePropType; // Optional - not used for classic theme
}

// Available themes with background images
export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    nameAr: 'كلاسيكي',
    textColor: '#1B5E20', // Deep Islamic green - matches نور theme
    accentColor: '#2E7D32', // Medium green accent - matches نور branding
    headerBgColor: '#1B5E20', // Islamic green header
    backgroundColor: '#E8F5E9', // Very light mint green background
  },
  {
    id: 'sky',
    name: 'Sky',
    nameAr: 'السماء',
    textColor: '#FFFFFF',
    accentColor: '#93C5FD',
    headerBgColor: 'rgba(30, 58, 138, 0.7)', // Dark blue
    image: require('@/assets/bg/sky.png'),
  },
  {
    id: 'desert',
    name: 'Desert',
    nameAr: 'الصحراء',
    textColor: '#FFFFFF',
    accentColor: '#FCD34D',
    headerBgColor: 'rgba(120, 53, 15, 0.7)', // Dark brown/orange
    image: require('@/assets/bg/desert.png'),
  },
  {
    id: 'forest',
    name: 'Forest',
    nameAr: 'الغابة',
    textColor: '#FFFFFF',
    accentColor: '#4ADE80',
    headerBgColor: 'rgba(20, 83, 45, 0.7)', // Dark green
    image: require('@/assets/bg/forest.png'),
  },
  {
    id: 'horse',
    name: 'Horse',
    nameAr: 'الحصان',
    textColor: '#FFFFFF',
    accentColor: '#FCA5A5',
    headerBgColor: 'rgba(30, 41, 59, 0.7)', // Dark slate
    image: require('@/assets/bg/horse.png'),
  },
  {
    id: 'ice',
    name: 'Ice',
    nameAr: 'الجليد',
    textColor: '#FFFFFF',
    accentColor: '#22D3EE',
    headerBgColor: 'rgba(30, 58, 138, 0.7)', // Dark blue
    image: require('@/assets/bg/ice.png'),
  },
  {
    id: 'mecca',
    name: 'Mecca',
    nameAr: 'مكة المكرمة',
    textColor: '#FFFFFF',
    accentColor: '#D4AF37', // Gold color matching the Kaaba's golden elements
    headerBgColor: 'rgba(30, 30, 30, 0.8)', // Dark overlay
    image: require('@/assets/bg/maka.jpg'),
  },
];

interface ThemesModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemesModal({ visible, onClose, currentTheme, onThemeChange }: ThemesModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  // Get the accent color from the selected theme
  const currentThemeData = themes.find(t => t.id === selectedTheme) || themes[0];
  const accentColor = currentThemeData.accentColor;

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme, visible]);

  const handleSelectTheme = async (themeId: string) => {
    // Don't do anything if selecting the same theme
    if (themeId === selectedTheme) {
      onClose();
      return;
    }
    
    setSelectedTheme(themeId);
    onThemeChange(themeId);
    
    try {
      await AsyncStorage.setItem('selectedTheme', themeId);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
    
    // Close modal first
    onClose();
    
    // Show interstitial ad after theme change
    setTimeout(async () => {
      try {
        await showInterstitialAd();
      } catch (error) {
        console.log('Interstitial ad not available:', error);
      }
    }, 500);
  };

  // Support developers with rewarded ad
  const handleSupportDevelopers = async () => {
    try {
      const result = await showRewardedAd();
      
      if (result.rewarded) {
        Alert.alert(
          'شكراً لدعمك! 💝',
          'جزاك الله خيراً على دعمك لنا.',
          [{ text: 'بارك الله فيك', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
    }
  };
  
  // Preload interstitial ad when modal opens
  useEffect(() => {
    if (visible) {
      initializeAds();
    }
  }, [visible]);

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
                <Ionicons name="close" size={24} color="#1B5E20" />
              </TouchableOpacity>
            </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.titleFixed}>تخصيص</Text>
            </View>

            {/* Support Link - Subtle at top */}
            <TouchableOpacity 
              style={styles.supportLink}
              onPress={handleSupportDevelopers}
            >
              <Ionicons name="heart" size={14} color="#2E7D32" />
              <Text style={styles.supportLinkText}>ادعم التطبيق بمشاهدة إعلان</Text>
            </TouchableOpacity>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleFixed}>الخلفيات</Text>
            </View>

            {/* Themes Grid */}
            <View style={styles.themesGrid}>
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <View key={theme.id} style={styles.themeCardContainer}>
                    <TouchableOpacity
                      style={[
                        styles.themeCard,
                        isSelected && [styles.themeCardSelected, { borderColor: accentColor }],
                        theme.backgroundColor && { backgroundColor: theme.backgroundColor },
                      ]}
                      onPress={() => handleSelectTheme(theme.id)}
                      activeOpacity={0.8}
                    >
                      {theme.image ? (
                        <>
                          <Image 
                            source={theme.image} 
                            style={styles.themeImage}
                            resizeMode="cover"
                          />
                          {/* Preview text overlay */}
                          <View style={styles.previewOverlay}>
                            <Text style={[styles.previewText, { color: theme.textColor }]}>
                              نور على نور
                            </Text>
                          </View>
                        </>
                      ) : (
                        /* Classic theme - solid background */
                        <View style={styles.classicPreview}>
                          <Text style={[styles.previewText, { color: theme.textColor }]}>
                            نور على نور
                          </Text>
                        </View>
                      )}
                      {isSelected && (
                        <View style={[styles.selectedBadge, { backgroundColor: accentColor }]}>
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                    {/* Theme Name - under each card */}
                    <Text style={styles.themeNameText}>
                      {theme.nameAr}
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

// Helper function to get theme by ID
export function getThemeById(themeId: string): Theme {
  return themes.find(t => t.id === themeId) || themes[0];
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
    backgroundColor: '#E8F5E9',
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
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  titleFixed: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#1B5E20',
  },
  candleIcon: {
    fontSize: 48,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitleFixed: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1B5E20',
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  themeCardContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginBottom: 24,
  },
  themeCard: {
    width: '100%',
    height: CARD_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderWidth: 3,
  },
  themeCardSelectedFixed: {
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 16,
  },
  classicPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeFixed: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
  },
  themeNameText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    color: '#1B5E20',
  },
  // Support Link - Subtle at top
  supportLink: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginBottom: 8,
  },
  supportLinkText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
