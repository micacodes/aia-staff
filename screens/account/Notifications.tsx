import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
} from "react-native";
import { View, SafeAreaView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api";
import { format, formatDistance } from "date-fns";

export default function NotificationsPage({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api
      .get<PaginatedData<DatabaseNotification>>("notifications")
      .then(({ data }) => {
        setNotifications(data);
      });
  }, []);

  navigation.setOptions({
    title: "My Notifications",
    headerRight: () => (
      <TouchableOpacity
        className="rounded-full mr-4"
        //onPress={clearNotifications}
      >
        <Icon name="check-all" size={30} color="#5E9C8F" />
      </TouchableOpacity>
    ),
  });

  StatusBar.setBarStyle("dark-content");
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("rgba(255,255,255,255)");
    StatusBar.setTranslucent(true);
  }

const markAsRead = (notificationToMark) => {
	setNotifications((prevNotifications) =>
		prevNotifications.map((notification) => {
			if (notification === notificationToMark) {
				return { ...notification, read: !notification.read };
			}
			return notification;
		})
	);
};

// const clearNotifications = async () => {
//     const readNotifications = notifications.filter(notification => notification.read);

//     await Promise.all(readNotifications.map(notification =>
//         api.destroy(`notifications/${notification.id}`)
//     ));

//     setNotifications(notifications.filter(notification => !notification.read));
// };

  return (
    <SafeAreaView className="bg-primary-50 h-full">
      <FlatList
        showsVerticalScrollIndicator={false}
        data={notifications}
        renderItem={({ item: notification }) => (
          <View className=" bg-primary-200 rounded-xl shadow-md mb-3">
            <View className="flex flex-1 flex-row-reverse px-2 py-3">
              <View className="flex-1">
                <View className="flex flex-row items-center justify-between">
                  <Text className="text-lg font-bold">
                    {notification.data.title}
                  </Text>
                  <TouchableOpacity onPress={() => markAsRead(notification)}>
                    <Icon
                      name="check"
                      size={40}
                      color={notification.read ? "red" : "#5E9C8F"}
                      value={notification.read}
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
                <Icon name="bell" size={35}></Icon>
              </View>
            </View>

            {/* <View className="flex flex-row justify-between items-center px-6"> */}
            {/* <Text className="text-center text-sm text-gray-400">
								{formatDistance(new Date(note.created_at), Date.now())}
							</Text> */}

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
            {/* </View> */}
          </View>
        )}
        className="px-4 space-y-2 mt-2 mb-4"
      />
    </SafeAreaView>
  );
}
