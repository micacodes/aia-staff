import { useContext, useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { CartContext } from "../../providers/CartProvider";
import { SafeAreaView } from "react-native";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api";

export default function CheckoutCartPage({ navigation }) {
  const { carts, customer, removeFromCart, updateCart, getCartTotal } =
    useContext(CartContext);

  const [page, setPage] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      title: `Order for ${customer?.name}`,
      headerShadowVisible: false,
    });
  }, []);

  return (
    <SafeAreaView className="py-6 bg-gray-100 pt-6 h-full flex-1">
      {Object.keys(carts).map((vendorId) => (
        <ScrollView
          key={vendorId}
          showsVerticalScrollIndicator={false}
          className="px-4"
        >
          <View className="flex w-full my-5 space-y-4 border-b pb-8 border-gray-400">
            {carts[vendorId].map((item: OrderItem) => (
              <View
                className="flex flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 shadow-xl"
                key={item.id}
              >
                <View className="w-1/4">
                  <ImageBackground
                    className="h-20 w-20"
                    source={{
                      uri: imagePath(item.image?.url),
                    }}
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1 flex-start ml-3 w-3/4">
                  <View className="flex flex-row justify-between items-center">
                    <Pressable
                      onPress={() => removeFromCart(item, vendorId)}
                      className="flex flex-row justify-between"
                    >
                      <Text className="text-lg font-bold">{item.name}</Text>
                    </Pressable>
                    <Pressable onPress={() => removeFromCart(item, vendorId)}>
                      <Icon name="trash-can-outline" size={30} />
                    </Pressable>
                  </View>

                  <View className="flex flex-row justify-between items-center mt-2">
                    <Text className="text-base font-bold text-primary-600">
                      KES {item.price}
                    </Text>

                    <View className="flex flex-row items-center justify-between">
                      <Pressable
                        onPress={() => updateCart(item, item.quantity - 1)}
                      >
                        <Icon
                          name="minus-circle-outline"
                          size={30}
                          color="#5E9C8F"
                        />
                      </Pressable>

                      <Text className="mx-2 text-base">{item.quantity}</Text>

                      <Pressable
                        className=""
                        onPress={() => updateCart(item, item.quantity + 1)}
                      >
                        <Icon
                          name="plus-circle-outline"
                          size={30}
                          color="#5E9C8F"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View className="flex flex-row justify-between px-4 mt-3">
            <View>
              <Text className="text-lg text-bold">Subtotal</Text>
            </View>

            <View>
              <Text className="text-lg text-bold font-semibold">
                {getCartTotal(vendorId)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CheckoutOrderPage", {
                vendorId,
              })
            }
            className="flex flex-row justify-center my-4 bg-primary-600 rounded-lg py-4"
          >
            <Text className="text-white text-base font-bold">Checkout now</Text>
          </TouchableOpacity>

          <View className="flex flex-row justify-between items-center"></View>
        </ScrollView>
      ))}

      <View className="mt-auto mx-4">
        <Pressable className="flex flex-row justify-center my-4 border-2 border-primary-600 rounded-lg py-4" onPress={() => navigation.goBack()}>
          <Text className="text-primary-600 text-base">Continue shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
