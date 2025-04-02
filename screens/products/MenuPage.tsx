import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { FlatList, Text, View } from "react-native";
import { api } from "../../utils/api";
import HTMLView from "react-native-htmlview";
import { AuthContext } from "../../providers/AuthProvider";

export default function MenuPage({ navigation }) {
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [products, setProducts] = useState<Product[]>([]);

	const { session } = useContext(AuthContext);

	useEffect(() => {
		api.get<PaginatedData<ProductCategory>>("product-categories", {
			vendor: session.vendor?.id,
			// branch: session.branch?.id,
		}).then(({ data }) => {
			setCategories(data);
		});

		api.get<PaginatedData<Product>>("products").then(({ data }) => {
			setProducts(data);
		});
	}, []);

	return (
		<FlatList
			data={categories}
			keyExtractor={item => `category-${item.id}`}
			renderItem={({ item: cat }) => (
				<View key={`category-${cat.id}`} className="px-2">
					<Text className="text-left text-lg font-bold my-1">
						{cat.name}
					</Text>

					<FlatList
						data={products.filter(
							p => p.productCategoryId === cat.id
						)}
						renderItem={({ item: product }) => (
							<TouchableOpacity
								onPress={() =>
									navigation.navigate("ProductDetails", {
										productId: product.id,
									})
								}
								className="flex-1 border border-primary-500 mb-3 px-2 py-2 rounded-lg"
							>
								<View className="">
									<Text className="text-base font-bold">
										{product.name}
									</Text>
								</View>

								<Text className="text-truncate flex items-center">
									<HTMLView
										value={product.details.slice(0, 25)}
										stylesheet={StyleSheet.create({
											p: {
												fontWeight: "300",
												fontSize: 12,
											},
										})}
									/>
									<Text>...</Text>
								</Text>

								<View className="flex flex-row justify-between items-center">
									<Text className="font-bold">
										KES {product.price}/{product.unit}
									</Text>
								</View>
							</TouchableOpacity>
						)}
						numColumns={2}
						key={2}
						contentContainerStyle={{ gap: 5 }}
						columnWrapperStyle={{ gap: 5 }}
					/>
				</View>
			)}
			className="bg-white"
		/>
	);
}
