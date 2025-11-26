import * as Camera from 'expo-camera';
import * as Audio from 'expo-av';

export const requestCameraPermission = async (): Promise<boolean> => {
  const {status} = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  const {status} = await Audio.requestPermissionsAsync();
  return status === 'granted';
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  // Handled by expo-notifications in notifications.ts
  return true;
};

