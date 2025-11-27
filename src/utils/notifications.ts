import {Platform} from 'react-native';
import PushNotification, {
  Importance,
} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {NOTIFICATION_CONFIG} from '../constants/config';

let configured = false;

export const configureNotifications = () => {
  if (configured) {
    return;
  }

  PushNotification.configure({
    onRegister: token => {
      console.log('Push token:', token);
    },
    onNotification: notification => {
      if (Platform.OS === 'ios') {
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    },
    requestPermissions: Platform.OS === 'ios',
  });

  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
        channelName: NOTIFICATION_CONFIG.CHANNEL_NAME,
        channelDescription: 'Notifications for Pokemon discoveries',
        importance: Importance.HIGH,
        vibrate: true,
        soundName: 'default',
      },
      created => console.log('Notification channel created:', created),
    );
  }

  configured = true;
};

export const showPokemonNotification = (title: string, message: string) => {
  PushNotification.localNotification({
    channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
    title,
    message,
    playSound: true,
    soundName: 'default',
  });
};

