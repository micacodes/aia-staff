import {
	View,
	Text,
	ScrollView,
	ImageBackground,
	Pressable,
	Platform,
	TextInput,
} from "react-native";
import { useState, useEffect, useContext } from "react";
import { api, imagePath } from "../../utils/api";
import { CartContext } from "../../providers/CartProvider";
import { Checkbox } from "react-native-paper";
import { StatusBar } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import HTMLView from "react-native-htmlview";
import { Link } from "@react-navigation/native";
// import CheckBox from '@react-native-community/checkbox';

export default function ProductDetails({ navigation, route }) {
	const { productId }: { productId: string } = route.params;
	// const [toggleCheckBox, setToggleCheckBox] = useState(false)
	const [product, setProduct] = useState<Product>();
	const [forms, setForms] = useState<ProductForm[]>([]);
	const [meta, setMeta] = useState<Record<string, any>>();
	const { addToCart, createOrder, removeFromCart, carts } =
		useContext(CartContext);

	const [checked, setChecked] = useState(false);

	StatusBar.setBarStyle("light-content");
	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor("rgba(0,0,0,0)");
		StatusBar.setTranslucent(true);
	}

	const addAndRedirect = () => {
		addToCart(product, meta);
		navigation.navigate("CheckoutCartPage");
	};

	const buyAndRedirect = (product: Product) => {
		addToCart(product, meta);
		const vendorId = product?.vendorId;
		createOrder(vendorId, { action: "Reservation" }).then(order => {
			navigation.navigate("Notifications");
		});
	};

	useEffect(() => {
		navigation.setOptions({ title: product?.vendor?.name });

		api.get<Product>(`products/${productId}`).then(d => setProduct(d));

		api.get<PaginatedData<ProductForm>>(`products/${productId}/forms`).then(
			({ data }) => {
				setForms(data);
			}
		);
	}, []);

	const cartCount = carts
		? Object.keys(carts)?.reduce((sum, vendorId) => {
				return (
					sum +
					(carts && carts[vendorId]
						? carts[vendorId]?.reduce(
								(total: number, item: OrderItem) => total + 1,
								0
						  )
						: 0)
				);
		  }, 0)
		: 0;

	return (
		<View className="h-screen bg-primary-50">
			{product && (
				<ScrollView>
					<View className="">
						<View className="w-full h-72">
							<ImageBackground
								className="h-full"
								source={{ uri: imagePath(product.image?.url) }}
								resizeMode="cover"
								imageStyle={{
									borderBottomLeftRadius: 30,
									opacity: 0.8,
								}}
							>
								<View className="w-full absolute mt-9 flex flex-row justify-between items-center">
									<Pressable
										onPress={() => navigation.goBack()}
									>
										<Icon
											name="chevron-left"
											size={45}
											color={"#5E9C8F"}
										/>
									</Pressable>

									<View className="flex flex-row justify-between w-12 mr-5">
										{cartCount > 0 && (
											<Link to="/CheckoutCartPage">
												<View
													className="flex-1 flex flex-row"
												>
													<Icon
														name="cart"
														size={25}
														color="#65A694"
													/>

													<View
														className="-mt-2 h-8 w-8 rounded-full flex justify-center items-center bg-primary"
													>
														<Text
															className="text-white text-center"
														>
															{cartCount}
														</Text>
													</View>
												</View>
											</Link>
										)}
									</View>
								</View>

								<View className="absolute right-0 bottom-0 bg-primary-50 px-2 rounded-tl-lg">
									<Text className="text-2xl font-bold text-primary-600 shadow-lg">
										KES {product.price}
									</Text>
								</View>
							</ImageBackground>
						</View>
					</View>

					<View className="mx-4 border-b border-primary-400 py-4">
						<View className="flex flex-row justify-between items-center mb-1">
							<Text className="font-bold text-xl">
								{product?.name}
							</Text>
						</View>

						{product.details && (
							<View className="flex flex-row pr-3 ">
								<HTMLView value={product.details} />
							</View>
						)}
					</View>

					{forms.map(fo => (
						<View key={fo.id} className="mx-3">
							{/* <Text>{fo.name}</Text>

									<HTMLView value={fo.details} /> */}

							{Object.values(fo?.sections)?.map((s, sid) => (
								<View
									key={sid}
									className="border-b border-primary-400"
								>
									<Text className="text-base text-black font-bold mt-2">
										{s.name}
									</Text>

									<HTMLView value={s.details} />

									<Text></Text>

									{s.fields?.map((field, fid) => (
										<View
											key={`f-${fid}`}
											className="flex mb-2"
										>
											{field.type === "checkbox" && (
												<View className="flex">
													{field.options?.map(
														(option, oi) => (
															<View
																key={`o-${oi}`}
																className="flex flex-row items-center"
															>
																<Checkbox
																	status={
																		checked
																			? "checked"
																			: "unchecked"
																	}
																	onPress={() => {
																		setChecked(
																			!checked
																		);
																	}}
																/>

																<View>
																	<Text className="ml-2 font-bold text-base">
																		{
																			option.label
																		}
																	</Text>
																</View>
															</View>
														)
													)}
												</View>
											)}

											{field.type === "text" && (
												<>
													<Text className="mb-2">
														{field.name}
													</Text>

													<TextInput
														className="border-2 border-primary-600 rounded-lg px-6 py-2 flex flex-row justify-center items-center w-full"
														placeholder={
															field.placeholder
														}
														onChangeText={text =>
															setMeta(p => ({
																...p,
																...{
																	[field.name]:
																		text,
																},
															}))
														}
													/>
												</>
											)}

											{field.type === "textarea" && (
												<>
													<Text className="mb-2">
														{field.label}
													</Text>

													<TextInput
														className="border-2 border-primary-600 rounded-lg px-2 h-20 w-full"
														placeholder={
															field.placeholder
														}
														multiline
														onChangeText={text =>
															setMeta(p => ({
																...p,
																...{
																	[field.name]:
																		text,
																},
															}))
														}
														numberOfLines={5}
														style={{
															textAlignVertical:
																"top",
														}}
													/>
												</>
											)}
										</View>
									))}
								</View>
							))}
						</View>
					))}
				</ScrollView>
			)}

			{product?.price ? (
				<View className="mt-auto mb-5">
					<View className="px-4 mt-2">
						{carts &&
						carts[product.vendorId] &&
						carts[product.vendorId][product.id] ? (
							<Pressable
								onPress={() => removeFromCart(product)}
								className="bg-primary-600 rounded-lg px-6 py-4 flex flex-row justify-center items-center"
							>
								<Text className="text-white text-base">
									Remove from cart
								</Text>
							</Pressable>
						) : (
							<Pressable
								onPress={() => addToCart(product, meta)}
								className="bg-primary-600 rounded-lg px-6 py-4 flex flex-row justify-center items-center"
							>
								<Text className="text-white text-base font-bold">
									Add to cart
								</Text>
							</Pressable>
						)}
					</View>
				</View>
			) : (
				<View className="mt-auto mb-5">
					<View className="px-4 mt-3">
						<Pressable
							onPress={() => buyAndRedirect(product)}
							className="bg-primary-600 rounded-lg px-6 py-4 flex flex-row justify-center items-center"
						>
							<Text className="text-white text-base font-bold">
								Book or reserve now
							</Text>
						</Pressable>
					</View>
				</View>
			)}
		</View>
	);
}
