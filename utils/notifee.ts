// import notifee, {
//   AndroidImportance,
//   Notification,
// } from "@notifee/react-native";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const notificationIcon = require("../assets/icon.png");

const NOTIFICATION_CHANNELS = Object.freeze({
  default: {
    name: "Default Channel",
    description: "Default notification channels for all notifications",
  },
} as const);

export const NotificationChannels = {
  get<T extends keyof typeof NOTIFICATION_CHANNELS>(id: T) {
    if (id in NOTIFICATION_CHANNELS) {
      return id;
    }

    if (__DEV__) {
      throw new Error("The specified notification channel is invalid");
    }

    return Object.keys(NOTIFICATION_CHANNELS)[0];
  },
};

export const createNotificationChannels = async () => {
  const channels = Object.entries(NOTIFICATION_CHANNELS).map(
    async ([id, { description, name }]) => {
      await Notifications.setNotificationChannelAsync(id, {
        name,
        description,
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: "#FF231F7C",
        vibrationPattern: [0, 250, 250, 250],
        showBadge: true,
      });
    }
  );

  await Promise.all(channels);
};

export const displayNotification = async <
  C extends keyof typeof NOTIFICATION_CHANNELS | null
>(
  data: Omit<Notifications.NotificationContentInput, "android" | "ios">,
  channel: C = null
) => {
  const channelId = NotificationChannels.get(channel ?? "default");

  await Notifications.scheduleNotificationAsync({
    content: {
      title: data.title,
      body: data.body,
      ...(Platform.OS === "android"
        ? {
            android: {
              channelId,
            },
          }
        : {
            ios: {
              sound: true,
              _displayInForeground: true,
            },
          }),
    },
    trigger: null,
  });
};
