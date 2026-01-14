import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
      alert('فشل في الحصول على إذن الإشعارات!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('يجب استخدام جهاز حقيقي لدفع الإشعارات');
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

