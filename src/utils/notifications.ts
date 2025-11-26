import * as Notifications from 'expo-notifications';
import {Platform} from 'react-native';
import {NOTIFICATION_CONFIG} from '../constants/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const configureNotifications = async () => {
  // Request permissions
  const {status: existingStatus} = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const {status} = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification!');
    return;
  }

  // Create notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CONFIG.CHANNEL_ID, {
      name: NOTIFICATION_CONFIG.CHANNEL_NAME,
      description: 'Notifications for Pokemon discoveries',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
    });
  }

  // Get push token
  const token = await Notifications.getExpoPushTokenAsync();
  console.log('Push token:', token);
};

export const showPokemonNotification = async (title: string, message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
      sound: true,
    },
    trigger: null, // Show immediately
  });
};

