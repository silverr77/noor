import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Alert, Linking, Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
  try {
    const { status } = await Notifications.getPermissionsAsync();
    console.log('Checking notification permission status:', status);
    return status === 'granted';
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
}

// Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    // Check current permission status first
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    console.log('Current notification permission status:', existingStatus);
    
    if (existingStatus === 'granted') {
      console.log('Notification permission already granted');
      return true;
    }

    // If permission was previously denied, we need to guide user to Settings
    if (existingStatus === 'denied') {
      Alert.alert(
        'الإشعارات معطلة',
        'تم رفض الإشعارات مسبقاً. يرجى تفعيلها من إعدادات الجهاز.',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'فتح الإعدادات', 
            style: 'default',
            onPress: () => {
              // Open app settings
              Linking.openSettings().catch((error) => {
                console.error('Error opening settings:', error);
              });
            }
          }
        ]
      );
      return false;
    }

    // Request permission - this will show the system dialog if not previously denied
    console.log('Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    
    console.log('Permission request result:', status);
    
    if (status === 'granted') {
      console.log('Notification permission granted successfully');
      return true;
    } else if (status === 'denied') {
      Alert.alert(
        'الإشعارات معطلة',
        'للحصول على تذكيرات يومية، يرجى تفعيل الإشعارات من إعدادات الجهاز',
        [{ text: 'حسناً', style: 'default' }]
      );
      return false;
    } else {
      // undetermined or other status
      console.log('Permission status is:', status);
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    Alert.alert(
      'خطأ',
      'حدث خطأ أثناء طلب إذن الإشعارات. يرجى المحاولة مرة أخرى.',
      [{ text: 'حسناً', style: 'default' }]
    );
    return false;
  }
}

// Register for push notifications (for remote notifications if needed)
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'نور - التذكيرات',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1B5E20',
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

    // Safely parse times with fallbacks
    let startHour = 8;  // default 8 AM
    let startMinute = 0;
    let endHour = 22;   // default 10 PM
    let endMinute = 0;
    
    if (startTime) {
      const startDate = new Date(startTime);
      if (!Number.isNaN(startDate.getTime())) {
        startHour = startDate.getHours();
        startMinute = startDate.getMinutes();
      }
    }
    
    if (endTime) {
      const endDate = new Date(endTime);
      if (!Number.isNaN(endDate.getTime())) {
        endHour = endDate.getHours();
        endMinute = endDate.getMinutes();
      }
    }
    
    const notificationCount = Math.min(count || 3, 10); // Max 10 notifications

    // Validate hours are valid numbers
    if (Number.isNaN(startHour) || Number.isNaN(endHour)) {
      console.log('Invalid time values, using defaults');
      startHour = 8;
      startMinute = 0;
      endHour = 22;
      endMinute = 0;
    }

    // Convert to total minutes for precise calculation
    const startTotalMinutes = startHour * 60 + startMinute;
    let endTotalMinutes = endHour * 60 + endMinute;
    
    // Handle case where end is before start (cross midnight)
    if (endTotalMinutes <= startTotalMinutes) {
      endTotalMinutes += 24 * 60; // Add 24 hours
    }
    
    const totalMinutes = endTotalMinutes - startTotalMinutes;
    
    // Calculate interval - respect user's time range
    // Minimum 1 minute between notifications to avoid exact duplicates
    const minInterval = 1; 
    const calculatedInterval = notificationCount > 1 
      ? totalMinutes / (notificationCount - 1) 
      : 0;
    const intervalMinutes = Math.max(calculatedInterval, minInterval);

    const channelId = Platform.OS === 'android' ? 'default' : undefined;

    console.log(`=== SCHEDULING NOTIFICATIONS ===`);
    console.log(`Count: ${notificationCount}`);
    console.log(`Start: ${startHour}:${startMinute.toString().padStart(2, '0')}`);
    console.log(`End: ${endHour}:${endMinute.toString().padStart(2, '0')}`);
    console.log(`Total minutes: ${totalMinutes}, Interval: ${intervalMinutes.toFixed(1)} min`);

    // Schedule each notification
    for (let i = 0; i < notificationCount; i++) {
      let notificationMinutes: number;
      
      if (notificationCount === 1) {
        // Single notification at start time
        notificationMinutes = startTotalMinutes;
      } else {
        // Distribute notifications across the time range
        notificationMinutes = startTotalMinutes + (intervalMinutes * i);
      }
      
      // Normalize to 24 hours
      notificationMinutes = notificationMinutes % (24 * 60);
      
      const notificationHour = Math.floor(notificationMinutes / 60);
      const notificationMinute = Math.floor(notificationMinutes % 60);
      
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
          minute: notificationMinute,
          ...(channelId && { channelId }),
        },
      });

      console.log(`✓ Notification ${i + 1}: ${notificationHour}:${notificationMinute.toString().padStart(2, '0')} - "${message.body}"`);
    }

    console.log(`=== SCHEDULED ${notificationCount} DAILY NOTIFICATIONS ===`);
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

// Get scheduled notification times as formatted strings
export async function getScheduledNotificationTimes(): Promise<string[]> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  
  return scheduled.map(notification => {
    const trigger = notification.trigger as any;
    if (trigger?.hour !== undefined && trigger?.minute !== undefined) {
      const hour = trigger.hour;
      const minute = trigger.minute;
      return `${hour}:${minute.toString().padStart(2, '0')}`;
    }
    return 'Unknown';
  }).sort((a, b) => a.localeCompare(b));
}

// Legacy function for backward compatibility
export async function scheduleDailyNotification(): Promise<void> {
  await scheduleNotifications();
}
