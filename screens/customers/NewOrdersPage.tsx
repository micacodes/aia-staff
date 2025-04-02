import React, { useContext, useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	SafeAreaView,
	Text,
	View,
	Image,
} from "react-native";
import { api } from "../../utils/api";
import { ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CartContext } from "../../providers/CartProvider";
import { TouchableOpacity } from "react-native";
import { Modal } from "react-native";
import RegisterUser from "../../components/RegisterUser";
import { AuthContext } from "../../providers/AuthProvider";
import HTMLView from "react-native-htmlview";
import PhoneInput, { ICountry } from "react-native-international-phone-number";

export default function NewOrdersPage() {
	const { session } = useContext(AuthContext);
	const [categories, setCategories] = useState<ProductCategory[]>([]);
	const [category, setCategory] = useState<string>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [customers, setCustomers] = useState<User[]>([]);
	const [customer, setCustomer] = useState<User>(null);
	const [adding, setAdding] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<ICountry>();
	const [s, setS] = useState<string>();

	const { addToCart, setCurrentCustomer } = useContext(CartContext);

	const assignCustomer = (c: User) => {
		setCurrentCustomer(c);
		setCustomer(c);
	};

	useEffect(() => {
		try {
			api.get<PaginatedData<ProductCategory>>("product-categories", {
				vendor: session.vendor.id,
				//branch: session.branch.id
			}).then(({ data }) => {
				setCategories(data);
			});
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		try {
			if (category) {
				api.get<PaginatedData<Product>>(
					`product-categories/${category}/products`
				).then(({ data }) => {
					setProducts(data);
				});
			}
		} catch (error) {
			console.error(error);
		}
	}, [category]);

	useEffect(() => {
		if (s && s.length > 8) {
			const phone = selectedCountry?.callingCode + s.replace(/\s/g, "");
			
			api.get<PaginatedData<User>>(`users`, {
				phone: phone.replace("+", ""),
			}).then(({ data }) => {
				setCustomers(data);
			});
		}
	}, [s]);

	return (
		<SafeAreaView className="bg-white py-4 h-full">
			<View className="flex items-center justify-center my-2 px-4">
				<View className="w-full rounded-lg flex flex-row items-center">
					<PhoneInput
						value={s}
						onChangePhoneNumber={setS}
						defaultCountry="KE"
						selectedCountry={selectedCountry}
						onChangeSelectedCountry={setSelectedCountry}
						placeholder="700000000"
						customMask={["##########"]}
						phoneInputStyles={{
							container: {
								width: "100%",
								borderColor: "#5E9C8F",
								borderWidth: 1,
								height:50,
								borderRadius: 10,
							},
							input: {
								paddingVertical: 9,
								textDecorationColor: "#5E9C8F",
							},
							flagContainer: {
								backgroundColor: "#5E9C8F",
							}
						}}
						
					/>
				</View>
			</View>

			{adding && (
				<Modal>
					<View className="flex flex-row justify-end mt-14 mr-6">
						<Pressable
							onPress={() => setAdding(false)}
							className="bg-red-400 h-12 w-12 rounded-full flex items-center justify-center"
						>
							<Icon name="close" size={35} color="white" />
						</Pressable>
					</View>
					<RegisterUser onCreated={setCustomer} />
				</Modal>
			)}

			{!customer && (
				<View className="px-6 mb-4">
					{customers.map(c => (
						<TouchableOpacity
							key={`customer-${c.id}`}
							onPress={() => assignCustomer(c)}
							className="my-2 bg-primary-600 px-2 rounded-lg py-2"
						>
							<Text className=" text-white">
								{c.firstName} {c.lastName}
							</Text>
						</TouchableOpacity>
					))}

					{customers.length === 0 && (
						<View className="flex justify-center items-center">
							<Text className="text-center my-4">OR</Text>

							<TouchableOpacity
								onPress={() => setAdding(true)}
								className="w-full border border-primary-500 p-4 rounded-lg flex items-center justify-center"
							>
								<Text className="text-primary-600">
									Onboard customer
								</Text>
							</TouchableOpacity>

							<Image
								className="h-3/4 w-3/4"
								source={require("../../assets/images/searchimage.jpg")}
								resizeMode="cover"
							/>
						</View>
					)}
				</View>
			)}

			{customer && (
				<View className="px-4 my-5">
					<ScrollView horizontal className="mb-3 space-x-3">
						{categories.map(cat => (
							<Pressable
								key={`category-${cat.id}`}
								onPress={() => setCategory(cat.id)}
								className={
									"flex justify-center items-center px-6 py-2 rounded-lg " +
									(category === cat?.id
										? "bg-primary-500"
										: "border border-primary-600")
								}
							>
								<Text
									className={
										"text-left " +
										(category === cat?.id
											? "text-white"
											: "text-primary-600")
									}
								>
									{cat.name}
								</Text>
							</Pressable>
						))}
					</ScrollView>

					{!category && (
						<View className="my-10">
							<Text>
								Please select a category to view products
							</Text>
						</View>
					)}

					<FlatList
						data={products}
						renderItem={({ item: product }) => (
							<View className="bg-primary-100 mb-3 px-4 py-2 rounded-lg">
								<View className="flex flex-row items-center justify-between">
									<Text className="text-base font-bold">
										{product.name}
									</Text>

									<Text className="text-base font-bold">
										KES {product.price}
									</Text>
								</View>
								<View className="flex flex-row justify-between items-center">
									<HTMLView value={product.details} />

									<Pressable
										onPress={() => addToCart(product, {})}
										className="flex flex-row items-center justify-end"
									>
										<Icon
											name="plus-circle"
											size={35}
											color="#5E9C8F"
										/>
									</Pressable>
								</View>
							</View>
						)}
						className="w-full"
					/>
				</View>
			)}
		</SafeAreaView>
	);
}
