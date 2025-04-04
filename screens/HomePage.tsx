import React from "react"; 
import { useState, useContext, useEffect, useRef } from "react";
import PagerView from "react-native-pager-view";
import { Rating } from "react-native-ratings";
import HTMLView from "react-native-htmlview";
import {
  Image,
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
// import {
//   getUniqueId,
//   getManufacturer,
//   getBrand,
//   getDevice,
// } from "react-native-device-info";
import * as Device from 'expo-device'
import { AuthContext } from "../providers/AuthProvider";
import { api, imagePath } from "../utils/api";

import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  registerForegroundMessageHandler,
  requestUserPermissions,
  getFCMToken,
} from "../utils/fcm";

export default function HomePage({ navigation, route }) {
  const { session } = useContext(AuthContext);

  const pagerRef = useRef<PagerView>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [rating, setRating] = useState(3.5);

  const gap = 8;

  StatusBar.setBarStyle("dark-content");
  if (Platform.OS === "android") {
    StatusBar.setBackgroundColor("rgba(0,0,0,0)");
    StatusBar.setTranslucent(true);
  }

  const setIndexPage = (p: number) => {
    pagerRef.current.setPage(p);
  };

  useEffect(() => {
    const unsubscribe = registerForegroundMessageHandler();

    requestUserPermissions().then((hasPermission) => {
      console.info("Has Notification Permissions", hasPermission);

      if (hasPermission) {
        getFCMToken().then(async (token) => {
          // console.log("FCM Token", token);
        console.log("deviceId", await Device);
          console.log("deviceName", await Device?.deviceName);
          console.log("deviceBrand", await Device?.brand);
          console.log("deviceManufacturer", await Device?.manufacturer);

          api.post("devices", {
            token,
            platform: Platform.OS,
            id: await Device?.modelId(),
            name: await Device?.deviceName,
            meta: {
              manufacturer: await Device?.manufacturer,
            },
          });
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      api
        .get<PaginatedData<Product>>("products", {
          s: searchQuery,
        })
        .then(({ data }) => {
          setSearchResults(data);
        });
    }
  }, [searchQuery]);

  return (
    <SafeAreaView className="py-6 bg-primary-50 pt-10 h-full flex-1">
      <View className="mb-4 w-full">
        <View className="flex flex-row justify-between items-center ml-3 py-3">
          <View className="flex flex-row items-center w-full space-x-2">
            <Image
              source={{ uri: session.avatarUrl }}
              height={48}
              width={48}
              className="rounded-full"
            />

            <View className="flex justify-center">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-lg font-bold">
                  Hi {session.firstName},
                </Text>

                <View className="flex flex-row items-center space-x-2">
                  <Rating
                    type="custom"
                    ratingCount={5}
                    startingValue={rating}
                    imageSize={25}
                    showRating={false}
                    ratingColor="#5E9C8F"
                    ratingBackgroundColor="#CCE0DC"
                    tintColor="#F2F7F6"
                    jumpValue={0.5}
                    readonly={true}
                  />
                </View>
              </View>

              {session.vendor && (
                <View className="flex flex-row">
                  <Text>{session.vendor.name}</Text>

                  {session.branch && (
                    <Text className="ml-1">{session.branch?.name}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
        <View className="flex items-center justify-center mx-4">
          <View className="w-full h-12 rounded-3xl bg-gray-200 flex flex-row items-center px-3">
            <Icon name="magnify" size={25} color="#5E9C8F" />

            <TextInput
              placeholder="Search & discover..."
              className="ml-3 w-full"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {searchQuery && (
            <View className="mt-2 w-full px-4 relative z-50 bg-white">
              <Text>
                Search results for{" "}
                <Text className="font-bold">{searchQuery}</Text>
              </Text>
              {searchResults.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() =>
                    navigation.navigate("ProductDetails", {
                      productId: product.id,
                    })
                  }
                  className="border-b border-primary-600 flex flex-row justify-between items-center py-2"
                >
                  <View className="flex flex-row items-center">
                    <View>
                      <Image
                        source={{
                          uri: imagePath(product.image?.url),
                        }}
                        height={50}
                        width={50}
                        className="rounded-full"
                      />
                    </View>

                    <View className="ml-2">
                      <Text className="text-base font-bold">
                        {product.name}
                      </Text>
                      <HTMLView value={product.details.slice(0, 50)} />
                    </View>
                  </View>
                  <View>
                    <Icon name="chevron-right" color="#5E9C8F" size={30} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        renderItem={({ item: task }) => (
          <TouchableOpacity
            key={task.id}
            className="flex-1 h-32 justify-center items-center rounded-xl bg-primary-200 p-4"
            onPress={() => navigation.navigate(task.pageName, { task })}
          >
            <View className="flex justify-center items-center">
              <Icon
                name={task.iconName || "cart"}
                size={50}
                color="#5E9C8F"
                className="h-12 w-12"
              />
              <Text className="font-bold text-[16px] mt-1 text-gray-500">
                {task.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        data={[
          {
            name: "Orders",
            iconName: "basket",
            id: 2,
            pageName: "OrdersPage",
          },
          {
            name: "New order",
            iconName: "draw-pen",
            id: 3,
            pageName: "NewOrdersPage",
          },
          {
            name: "Onboard",
            iconName: "border-color",
            id: 1,
            pageName: "OnboardPage",
          },
          {
            name: "Broadcast",
            iconName: "send",
            id: 4,
            pageName: "BroadcastPage",
          },
          {
            name: "Reservations",
            iconName: "calendar",
            id: 5,
            pageName: "ReservationsPage",
          },
          {
            name: "Menu",
            iconName: "book-open",
            id: 6,
            pageName: "Menu",
          },
          {
            name: "Report",
            iconName: "mail",
            id: 7,
            pageName: "ReportingPage",
          },
          {
            name: "Rate customer",
            iconName: "star",
            id: 8,
            pageName: "RatingPage",
          },
        ]}
        numColumns={2}
        contentContainerStyle={{ gap }}
        columnWrapperStyle={{ gap }}
        key={2}
        className="m-3 flex-1"
      />
    </SafeAreaView>
  );
}
