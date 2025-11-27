import {Platform} from 'react-native';
import {
  check,
  request,
  checkNotifications,
  requestNotifications,
  PERMISSIONS,
  RESULTS,
  PermissionStatus,
} from 'react-native-permissions';

const isGranted = (status: PermissionStatus | undefined) =>
  status === RESULTS.GRANTED || status === 'granted';

const resolvePermission = (iosPermission: string, androidPermission: string) =>
  Platform.OS === 'ios' ? iosPermission : androidPermission;

export const requestCameraPermission = async (): Promise<boolean> => {
  const permission = resolvePermission(PERMISSIONS.IOS.CAMERA, PERMISSIONS.ANDROID.CAMERA);
  const currentStatus = await check(permission);
  if (isGranted(currentStatus)) {
    return true;
  }
  const nextStatus = await request(permission);
  return isGranted(nextStatus);
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  const permission = resolvePermission(
    PERMISSIONS.IOS.MICROPHONE,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  );
  const currentStatus = await check(permission);
  if (isGranted(currentStatus)) {
    return true;
  }
  const nextStatus = await request(permission);
  return isGranted(nextStatus);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const existing = await checkNotifications();
  if (isGranted(existing.status as PermissionStatus)) {
    return true;
  }
  const {status} = await requestNotifications(['alert', 'sound', 'badge']);
  return status === 'granted';
};

