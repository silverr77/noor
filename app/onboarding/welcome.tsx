import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Half - Purple Background */}
      <View style={styles.topSection}>
        <View style={styles.topContent}>
          <Text style={styles.appTitle}>أذكار</Text>
          <Text style={styles.appSubtitle}>أقوال وأدعية يومية</Text>
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
            fill="#FEF3E2"
          />
        </Svg>
      </View>

      {/* Bottom Half - Cream Background */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomContent}>
          {/* Title */}
          <Text style={styles.title}>
            مرحباً، أنا أذكار!
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            أنا هنا لإضاءة يومك
          </Text>

          {/* Description */}
          <Text style={styles.description}>
            لنبدأ رحلتك إلى الذكر مع تذكيرات يومية لطيفة تساعدك على البقاء حاضراً
          </Text>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/name')}
          >
            <Text style={styles.buttonText}>ابدأ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  topSection: {
    flex: 0.6,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  appTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  appSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
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
    backgroundColor: '#FEF3E2',
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
    color: '#1E3A8A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#1E3A8A',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

