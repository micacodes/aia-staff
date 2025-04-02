import notifee, {
  AndroidImportance,
  Notification,
} from "@notifee/react-native";

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
  const channels = Object.entries(NOTIFICATION_CHANNELS).reduce(
    (prev, [id, { description, name }]) => {
      prev.push(
        notifee.createChannel({
          id: id,
          name,
          description,
          lights: true,
          vibration: true,
          importance: AndroidImportance.DEFAULT,
          badge: true,
        })
      );

      return prev;
    },
    []
  );
  await Promise.resolve(channels);
};

export const displayNotification = <
  C extends keyof typeof NOTIFICATION_CHANNELS | null
>(
  data: Omit<Notification, "android" | "ios">,
  channel: C = null
) => {
  const channelId = NotificationChannels.get(channel ?? "default");

  return notifee.displayNotification({
    title: data.title,
    body: data.body,
    android: {
      channelId,
      largeIcon: notificationIcon,
    },
  });
};
