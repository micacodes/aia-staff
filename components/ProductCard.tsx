import { useContext } from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CartContext } from "../providers/CartProvider";
import { imagePath } from "../utils/api";
// @todo Check if product is in cart, show minus icon
export default function ProductCard({
	product,
	navigation,
}: {
	product: Product;
	navigation: any;
}) {
	const { addToCart, carts } = useContext(CartContext);

	return (
		<View className="h-60 w-1/2 rounded-2xl flex-1 flex" key={product.id}>
			<View className="h-1/2">
				<ImageBackground
					className="h-full"
					source={{ uri: imagePath(product.image?.url) }}
					resizeMode="cover"
				/>
			</View>

			<Text className="font-medium mt-2 text-[16px]">{product.name}</Text>

			<Pressable
				onPress={() =>
					navigation.navigate("VendorDetails", {
						vendorId: product.vendorId,
					})
				}
				className="text-slate-500"
			>
				<Text>{product.vendor?.name}</Text>
			</Pressable>

			<View className="flex flex-row justify-between items-center">
				<Text className="text-2xl font-bold text-medium">
					KES {product.price}
				</Text>

				<Pressable onPress={() => addToCart(product, {})}>
					<Icon name="plus" size={40} />
				</Pressable>
			</View>
		</View>
	);
}
