import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Sample notification messages for variety
const notificationMessages = [
  { title: 'نور 🌟', body: 'حان وقت ذكرك اليومي' },
  { title: 'نور 💫', body: 'ألا بذكر الله تطمئن القلوب' },
  { title: 'نور ✨', body: 'لحظة مع الذكر تنير يومك' },
  { title: 'نور 🤲', body: 'وقت الدعاء والأذكار' },
  { title: 'نور 📿', body: 'سبحان الله وبحمده' },
  { title: 'نور 🌙', body: 'لا تنسى ذكر الله' },
  { title: 'نور 💝', body: 'اقتباس جديد بانتظارك' },
  { title: 'نور 🕌', body: 'استرح مع كلمات تريح القلب' },
];

// Check if notifications are enabled
export async function checkNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  
  if (existingStatus === 'granted') {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert(
      'الإشعارات معطلة',
      'للحصول على تذكيرات يومية، يرجى تفعيل الإشعارات من إعدادات الجهاز',
      [{ text: 'حسناً', style: 'default' }]
    );
    return false;
  }

  return true;
}

// Register for push notifications (for remote notifications if needed)
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'نور - التذكيرات',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
      sound: 'default',
    });
  }

  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return undefined;
  }

  // Try to get push token for remote notifications
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (projectId) {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Push token:', token);
    } else {
      console.log('No projectId configured. Local notifications will still work.');
    }
  } catch (error) {
    console.log('Push token registration failed:', error);
  }

  return token;
}

// Schedule notifications based on user settings
export async function scheduleNotifications(): Promise<void> {
  // First check permissions
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) {
    console.log('No notification permission, skipping schedule');
    return;
  }

  // Cancel all existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Load user settings
  const settingsStr = await AsyncStorage.getItem('notificationSettings');
  
  if (!settingsStr) {
    // No settings saved, use defaults
    await scheduleDefaultNotifications();
    return;
  }

  try {
    const settings = JSON.parse(settingsStr);
    const { enabled, count, startTime, endTime } = settings;

    if (!enabled) {
      console.log('Notifications disabled by user');
      return;
    }

    // Safely parse hours with fallbacks
    let startHour = 8; // default 8 AM
    let endHour = 22;  // default 10 PM
    
    if (startTime) {
      const startDate = new Date(startTime);
      if (!isNaN(startDate.getTime())) {
        startHour = startDate.getHours();
      }
    }
    
    if (endTime) {
      const endDate = new Date(endTime);
      if (!isNaN(endDate.getTime())) {
        endHour = endDate.getHours();
      }
    }
    
    const notificationCount = count || 3;

    // Validate hours are valid numbers
    if (isNaN(startHour) || isNaN(endHour)) {
      console.log('Invalid time values, using defaults');
      startHour = 8;
      endHour = 22;
    }

    // Calculate intervals between notifications
    const totalHours = endHour > startHour ? endHour - startHour : 24 - startHour + endHour;
    const intervalHours = notificationCount > 1 ? totalHours / (notificationCount - 1) : totalHours;

    const channelId = Platform.OS === 'android' ? 'default' : undefined;

    console.log(`Scheduling ${notificationCount} notifications from ${startHour}:00 to ${endHour}:00`);

    // Schedule each notification
    for (let i = 0; i < notificationCount; i++) {
      let notificationHour: number;
      
      if (notificationCount === 1) {
        // Single notification at start time
        notificationHour = startHour;
      } else {
        // Distribute notifications across the time range
        notificationHour = Math.floor(startHour + (intervalHours * i)) % 24;
      }
      
      // Ensure hour is a valid integer
      notificationHour = Math.max(0, Math.min(23, Math.floor(notificationHour)));
      
      const message = notificationMessages[i % notificationMessages.length];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: true,
          ...(channelId && { channelId }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: notificationHour,
          minute: 0,
          ...(channelId && { channelId }),
        },
      });

      console.log(`Scheduled notification at ${notificationHour}:00`);
    }

    console.log(`Scheduled ${notificationCount} daily notifications`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    await scheduleDefaultNotifications();
  }
}

// Schedule default notifications (morning and evening)
async function scheduleDefaultNotifications(): Promise<void> {
  const channelId = Platform.OS === 'android' ? 'default' : undefined;

  // Morning notification at 8 AM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'نور 🌟',
      body: 'صباح النور! ابدأ يومك بالذكر',
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

  // Evening notification at 8 PM
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'نور 🌙',
      body: 'مساء النور! لا تنسى أذكار المساء',
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

  console.log('Scheduled default notifications (8 AM and 8 PM)');
}

// Send a test notification immediately
export async function sendTestNotification(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'نور 🎉',
      body: 'تم تفعيل الإشعارات بنجاح!',
      sound: true,
    },
    trigger: null, // null trigger = immediate notification
  });
}

// Cancel all scheduled notifications
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('All notifications cancelled');
}

// Get all scheduled notifications (for debugging)
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// Legacy function for backward compatibility
export async function scheduleDailyNotification(): Promise<void> {
  await scheduleNotifications();
}
