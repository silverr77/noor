import { Platform } from 'react-native';

// Dynamic import for AdMob - only works in development builds, not Expo Go
let InterstitialAd: any = null;
let RewardedAd: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;
let TestIds: any = null;
let isAdMobAvailable = false;

try {
  const admob = require('react-native-google-mobile-ads');
  InterstitialAd = admob.InterstitialAd;
  RewardedAd = admob.RewardedAd;
  AdEventType = admob.AdEventType;
  RewardedAdEventType = admob.RewardedAdEventType;
  TestIds = admob.TestIds;
  isAdMobAvailable = true;
} catch (e) {
  // AdMob not available (running in Expo Go)
  console.log('AdMob not available - using Expo Go');
  isAdMobAvailable = false;
}

// Ad unit IDs - Replace with your real ad unit IDs in production
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? (TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712') // Test ID
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS ad unit ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android ad unit ID
    }) || 'ca-app-pub-3940256099942544/1033173712';

const REWARDED_AD_UNIT_ID = __DEV__
  ? (TestIds?.REWARDED || 'ca-app-pub-3940256099942544/5224354917') // Test ID
  : Platform.select({
      ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your iOS rewarded ad unit ID
      android: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Replace with your Android rewarded ad unit ID
    }) || 'ca-app-pub-3940256099942544/5224354917';

// Interstitial ad state
let interstitialAd: any = null;
let isAdLoaded = false;
let isAdLoading = false;

// Rewarded ad state
let rewardedAd: any = null;
let isRewardedAdLoaded = false;
let isRewardedAdLoading = false;

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

// Preload ads on app start
export const initializeAds = (): void => {
  if (isAdMobAvailable) {
    loadInterstitialAd().catch((e) => {
      console.log('Failed to preload interstitial:', e);
    });
    loadRewardedAd().catch((e) => {
      console.log('Failed to preload rewarded ad:', e);
    });
  }
};

// ==================== REWARDED ADS ====================

// Load a rewarded ad
export const loadRewardedAd = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isAdMobAvailable || !RewardedAd) {
      console.log('Rewarded ads not available in Expo Go');
      resolve();
      return;
    }

    if (isRewardedAdLoading) {
      console.log('Rewarded ad already loading');
      resolve();
      return;
    }

    if (isRewardedAdLoaded && rewardedAd) {
      console.log('Rewarded ad already loaded');
      resolve();
      return;
    }

    isRewardedAdLoading = true;

    try {
      rewardedAd = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: true,
      });

      const unsubscribeLoaded = rewardedAd.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          console.log('Rewarded ad loaded');
          isRewardedAdLoaded = true;
          isRewardedAdLoading = false;
          unsubscribeLoaded();
          resolve();
        }
      );

      const unsubscribeError = rewardedAd.addAdEventListener(
        AdEventType.ERROR,
        (error: any) => {
          console.log('Rewarded ad failed to load:', error);
          isRewardedAdLoaded = false;
          isRewardedAdLoading = false;
          unsubscribeError();
          reject(error);
        }
      );

      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          console.log('Rewarded ad closed');
          isRewardedAdLoaded = false;
          unsubscribeClosed();
          // Preload next rewarded ad
          loadRewardedAd();
        }
      );

      rewardedAd.load();
    } catch (error) {
      console.log('Error creating rewarded ad:', error);
      isRewardedAdLoading = false;
      reject(error);
    }
  });
};

// Show the rewarded ad and return whether reward was earned
export const showRewardedAd = (): Promise<{ success: boolean; rewarded: boolean }> => {
  return new Promise(async (resolve) => {
    if (!isAdMobAvailable) {
      console.log('Rewarded ads not available in Expo Go');
      // In dev mode, simulate a successful reward
      resolve({ success: true, rewarded: true });
      return;
    }

    if (!isRewardedAdLoaded || !rewardedAd) {
      console.log('Rewarded ad not ready, loading...');
      try {
        await loadRewardedAd();
      } catch (e) {
        console.log('Failed to load rewarded ad');
        resolve({ success: false, rewarded: false });
        return;
      }
    }

    if (isRewardedAdLoaded && rewardedAd) {
      let wasRewarded = false;

      // Listen for reward earned
      const unsubscribeEarned = rewardedAd.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward: any) => {
          console.log('User earned reward:', reward);
          wasRewarded = true;
          unsubscribeEarned();
        }
      );

      // Listen for ad closed
      const unsubscribeClosed = rewardedAd.addAdEventListener(
        AdEventType.CLOSED,
        () => {
          unsubscribeClosed();
          resolve({ success: true, rewarded: wasRewarded });
        }
      );

      try {
        await rewardedAd.show();
        isRewardedAdLoaded = false;
      } catch (error) {
        console.log('Error showing rewarded ad:', error);
        unsubscribeEarned();
        unsubscribeClosed();
        resolve({ success: false, rewarded: false });
      }
    } else {
      resolve({ success: false, rewarded: false });
    }
  });
};

// Check if rewarded ad is ready
export const isRewardedAdReady = (): boolean => {
  return isRewardedAdLoaded && rewardedAd !== null;
};
