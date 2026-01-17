import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // Silently fail - user can enable notifications later
      console.log('Notification permissions not granted');
      return;
    }
    
    // Try to get push token, but handle gracefully if projectId is not configured
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (projectId) {
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } else {
        // No projectId configured - skip push token (local notifications still work)
        console.log('No projectId configured for push notifications. Local notifications will still work.');
      }
    } catch (error) {
      // Push token failed but local notifications still work
      console.log('Push token registration failed:', error);
    }
  } else {
    // Running on simulator - silently skip, don't show alert
    console.log('Notifications require a real device');
  }

  return token;
}

export async function scheduleDailyNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const channelId = Platform.OS === 'android' ? 'default' : undefined;

  // Morning notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'أذكار اليوم',
      body: 'حان وقت قراءة أذكارك اليومية',
      sound: true,
      ...(channelId && { channelId }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
      ...(channelId && { channelId }),
    },
  });

  // Evening notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'أذكار المساء',
      body: 'لا تنسى أذكار المساء',
      sound: true,
      ...(channelId && { channelId }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
      ...(channelId && { channelId }),
    },
  });
}

