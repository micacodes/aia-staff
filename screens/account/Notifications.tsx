import { useContext, useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { View, SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../utils/api";
import { format } from "date-fns";
import { AuthContext } from "../../providers/AuthProvider";

export default function NotificationsPage({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { session } = useContext(AuthContext);
  let dummyNotifications = [];
  dummyNotifications = [
    {
      id: -1,
      data: {
        title: "Welcome!",
        body: `Welcome onboard, ${session?.firstName}!`,
        actions: [
          {
            label: "Go to Home",
            screen: "Home",
            args: {},
          },
        ],
      },
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: -2,
      data: {
        title: "Reminder",
        body: "Don't forget to complete your profile setup.",
        actions: [
          {
            label: "Complete Profile",
            screen: "ProfileSetup",
            args: {},
          },
        ],
      },
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: -3,
      data: {
        title: "Special Offer",
        body: "Check out our latest promotions!",
        actions: [
          {
            label: "View Offers",
            screen: "Promotions",
            args: {},
          },
        ],
      },
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("notifications");
      const updatedNotifications = [...dummyNotifications, ...data].map(
        (notification) => ({
          ...notification,
          tone: "default", // Assign a default tone to each notification
        })
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      const updatedDummyNotifications = dummyNotifications.map(
        (notification) => ({
          ...notification,
          tone: "default", // Assign a default tone to dummy notifications
        })
      );
      setNotifications(updatedDummyNotifications);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    navigation.setOptions({
      title: "Notifications",
      headerRight: () => (
        <TouchableOpacity
          className="rounded-full mr-4"
          onPress={clearNotifications}
        >
          <Icon name="check-all" size={30} color="#5E9C8F" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, notifications]);

  const markAsRead = (notificationToMark) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationToMark.id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearNotifications = async () => {
    // const realNotifications = notifications.filter((n) => n.id > 0);
    // const readNotifications = realNotifications.filter((n) => n.read);

    // await Promise.all(
    //   readNotifications.map((n) => api.destroy(`notifications/${n.id}`))
    // );

    // setNotifications([
    //   ...dummyNotifications,
    //   ...realNotifications.filter((n) => !n.read),
    // ]);
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  StatusBar.setBarStyle("dark-content");
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("rgba(255,255,255,255)");
    StatusBar.setTranslucent(true);
  }

  return (
    <SafeAreaView className="bg-primary-50 h-full">
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: notification }) => (
          <View
            className={`rounded-xl shadow-md mb-3 ${
              notification.read ? "bg-gray-300" : "bg-primary-200"
            }`}
          >
            <View className="flex flex-1 flex-row-reverse px-2 py-3">
              <View className="flex-1">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-lg font-bold">
                    {notification.data.title}
                  </Text>
                  <TouchableOpacity onPress={() => markAsRead(notification)}>
                    <Icon
                      name={notification.read ? "check-all" : "check"}
                      size={40}
                      color={notification.read ? "white" : "#5E9C8F"}
                    />
                  </TouchableOpacity>
                </View>
                <Text>{notification.data.body}</Text>
                <Text className="pb-1">
                  {format(
                    new Date(notification.createdAt),
                    "EEE do MMMM, yyyy HH:mm a"
                  )}
                </Text>
              </View>
              <View className="w-1/5 justify-center items-center">
                <Icon name="bell" size={35} />
              </View>
            </View>
            <View className="w-full">
              {notification.data.actions?.map((action, key) => (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(action.screen, action.args)
                  }
                  key={key}
                  className="py-2 items-center bg-primary-600 text-center rounded-b-xl w-full"
                >
                  <Text className="text-white font-bold text-center">
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        className="px-4 space-y-2 mt-2 mb-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
}
