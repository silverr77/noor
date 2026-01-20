import { Platform } from 'react-native';

// Dynamic import for AdMob - only works in development builds, not Expo Go
let InterstitialAd: any = null;
let AdEventType: any = null;
let TestIds: any = null;
let isAdMobAvailable = false;

try {
  const admob = require('react-native-google-mobile-ads');
  InterstitialAd = admob.InterstitialAd;
  AdEventType = admob.AdEventType;
  TestIds = admob.TestIds;
  isAdMobAvailable = true;
} catch (e) {
  // AdMob not available (running in Expo Go)
  console.log('AdMob not available for interstitials - using Expo Go');
  isAdMobAvailable = false;
}

// Ad unit IDs - Replace with your real ad unit IDs in production
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? (TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712') // Test ID
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS ad unit ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android ad unit ID
    }) || 'ca-app-pub-3940256099942544/1033173712';

let interstitialAd: any = null;
let isAdLoaded = false;
let isAdLoading = false;

// Cooldown management for interstitial ads
const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes between interstitials
let lastInterstitialTime = 0;

// Initialize and load an interstitial ad
export const loadInterstitialAd = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isAdMobAvailable || !InterstitialAd) {
      console.log('Interstitial ads not available in Expo Go');
      resolve();
      return;
    }

    if (isAdLoading) {
      console.log('Interstitial ad already loading');
      resolve();
      return;
    }

    if (isAdLoaded && interstitialAd) {
      console.log('Interstitial ad already loaded');
      resolve();
      return;
    }

    isAdLoading = true;

    try {
      interstitialAd = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = interstitialAd.addAdEventListener(
        AdEventType.LOADED,
        () => {
          console.log('Interstitial ad loaded');
          isAdLoaded = true;
          isAdLoading = false;
          unsubscribeLoaded();
          resolve();
        }
      );

      const unsubscribeError = interstitialAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log('Interstitial ad failed to load:', error);
          isAdLoaded = false;
          isAdLoading = false;
          unsubscribeError();
          reject(error);
        }
      );

      const unsubscribeClosed = interstitialAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log('Interstitial ad closed');
          isAdLoaded = false;
          unsubscribeClosed();
          // Preload next ad
          loadInterstitialAd();
        }
      );

      interstitialAd.load();
    } catch (error) {
      console.log('Error creating interstitial ad:', error);
      isAdLoading = false;
      reject(error);
    }
  });
};

// Show the interstitial ad (with cooldown protection)
export const showInterstitialAd = async (): Promise<boolean> => {
  if (!isAdMobAvailable) {
    console.log('Interstitial ads not available in Expo Go');
    return false;
  }

  // Check cooldown - don't show ads too frequently
  const now = Date.now();
  if (now - lastInterstitialTime < INTERSTITIAL_COOLDOWN_MS) {
    console.log('Interstitial ad on cooldown, skipping...');
    return false;
  }

  if (!isAdLoaded || !interstitialAd) {
    console.log('Interstitial ad not ready, loading...');
    try {
      await loadInterstitialAd();
    } catch (e) {
      console.log('Failed to load interstitial ad');
      return false;
    }
  }

  if (isAdLoaded && interstitialAd) {
    try {
      await interstitialAd.show();
      isAdLoaded = false;
      lastInterstitialTime = Date.now(); // Update last shown time
      return true;
    } catch (error) {
      console.log('Error showing interstitial ad:', error);
      return false;
    }
  }

  return false;
};

// Check if AdMob is available
export const isAdsAvailable = (): boolean => {
  return isAdMobAvailable;
};

// Preload interstitial ad on app start
export const initializeAds = (): void => {
  if (isAdMobAvailable) {
    loadInterstitialAd().catch((e) => {
      console.log('Failed to preload interstitial:', e);
    });
  }
};

