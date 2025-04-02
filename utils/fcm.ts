import { PermissionsAndroid } from "react-native";
import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import { createNotificationChannels, displayNotification } from "./notifee";

const requestUserPermissions = async (): Promise<boolean> => {
  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
  );

  return status === "granted";
};

const registerBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(onMessage);
};

const registerForegroundMessageHandler = (): VoidFunction => {
  const unsubscribe = messaging().onMessage(onMessage);

  return unsubscribe;
};

const onMessage = async (message: FirebaseMessagingTypes.RemoteMessage) => {
  const notification = {
    title: message.notification.title,
    body: message.notification.body,
    data: message.data,
  };

  await displayNotification(notification);
};

const getFCMToken = async (): Promise<string> => {
  return await messaging().getToken();
};

const onAppBootstrap = async () => {
  await messaging().registerDeviceForRemoteMessages();
  await createNotificationChannels();

  registerBackgroundMessageHandler();
};

export {
  onMessage,
  requestUserPermissions,
  registerForegroundMessageHandler,
  getFCMToken,
  onAppBootstrap,
};
