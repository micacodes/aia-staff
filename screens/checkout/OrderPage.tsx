import { useContext, useEffect, useRef, useState } from "react";
import {
	ImageBackground,
	Modal,
	Pressable,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { CartContext } from "../../providers/CartProvider";
import { SafeAreaView } from "react-native";
import { Image } from "react-native";
import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AntIcon from "react-native-vector-icons/AntDesign";
import { SelectList } from "react-native-dropdown-select-list";
import { api, imagePath } from "../../utils/api";
import PagerView from "react-native-pager-view";
import { AuthContext } from "../../providers/AuthProvider";
import {
	Agenda,
	DateData,
	AgendaEntry,
	AgendaSchedule,
} from "react-native-calendars";
import { addHours } from "date-fns";

export default function CheckoutOrderPage({ navigation, route }) {
	const { vendorId } = route.params;
	const {
		carts,
		customer,
		customerOrder,
		addToCart,
		getCartTotal,
		prepareOrder,
		createOrder,
	} = useContext(CartContext);
	const { session } = useContext(AuthContext);

	const [type, setType] = useState("");
	const [orig, setOrig] = useState("");
	const [delivery, setDelivery] = useState("");
	const [viewCart, setViewCart] = useState(false);
	const [page, setPage] = useState(0);
	const [slot, setSlot] = useState("");
	const [scheduling, setScheduling] = useState(false);
	const [items, setItems] = useState<AgendaSchedule>({});
	const [products, setProducts] = useState<Product[]>([]);
	const [section, setSection] = useState<string>();
	const [addresses, setAddresses] = useState<
		{ key: string; value: string | boolean | number }[]
	>([]);
	const [sections, setSections] = useState<
		{ key: string; value: string | boolean | number }[]
	>([]);
	const [lots, setLots] = useState<
		{ key: string; value: string | boolean | number }[]
	>([]);
	const [total, setTotal] = useState(0);

	const relatedRef = useRef(null);

	const setIndexPage = (p: number) => {
		relatedRef.current?.setPage(p);
	};

	const calculateTotal = () => {
		let orderTotal = getCartTotal();

		orderTotal *= 1.02;

		if (orig === "out") {
			orderTotal += 25;
		}

		setTotal(orderTotal);
	};

	const processOrder = async (action = "order") => {
		let orderTotal = getCartTotal();

		const AppInApp = orderTotal * 0.02;

		const meta = {
			charges: {
				AppInApp,
			},
			delivery: {
				time: slot,
			},
		}

		if(delivery === "Delivery") {
			meta['charges']['Delivery'] = 25
		}

		const order = await createOrder(vendorId, meta);

		if (action === "pay") {
			navigation.navigate("Pay", {
				orderId: order.id,
				total: total,
			});
		} else {
			navigation.navigate("Notifications");
		}
	};

	const loadItems = (day: DateData) => {
		setTimeout(() => {
			Array.from(new Array(12)).forEach((_, i) => {
				const time = day.timestamp + i * 60 * 60 * 1000;
				const strTime = new Date(time).toISOString().split("T")[0];

				if (!items[strTime]) {
					items[strTime] = [];
				}

				items[strTime].push({
					name: `${i + 6}:00 - ${i + 7}:00`,
					height: Math.max(50, Math.floor(Math.random() * 150)),
					day: addHours(new Date(time), 1)
						.toISOString()
						.split("T")[0],
				});
			});

			const newItems: AgendaSchedule = {};
			Object.keys(items).forEach(key => {
				newItems[key] = items[key];
			});
			setItems(newItems);
		}, 1000);
	};

	const fetchLots = (sectionId: string) => {
		setSection(sectionId);
		prepareOrder("sectionId", sectionId);
	};

	useEffect(() => {
		navigation.setOptions({
			headerShadowVisible: false,
            title: `Order for ${customer?.firstName}`,
			headerRight: () => (
				<View>
					<Pressable onPress={() => setViewCart(!viewCart)}>
						<Icon name="basket" size={30} color="#65A694" />
					</Pressable>
				</View>
			),
		});

		api.get<PaginatedData<Product>>("products", { per: 15 }).then(
			({ data }) => {
				setProducts(data);
			}
		);

		api.get<PaginatedData<Section>>("sections", { per: 15 }).then(
			({ data }) => {
				setSections(
					data.map(section => ({
						key: section.id,
						value: section.name,
					}))
				);
			}
		);

		api.get<PaginatedData<Address>>("addresses", { per: 15 }).then(
			({ data }) => {
				setAddresses(
					data.map(address => ({
						key: address.id,
						value: address.name,
					}))
				);
			}
		);

		setTotal(getCartTotal());
		prepareOrder("staffId", session.id);
		prepareOrder("branchId", session.branch.id)
	}, []);

	useEffect(() => {
		prepareOrder("type", type);
		prepareOrder("staffId", session.id);
		prepareOrder("branchId", session.branch.id)
		prepareOrder(
			"items",
			carts[vendorId].map(item => ({ [item.id]: item.quantity }))
		);
	}, [type]);

	useEffect(() => {
		if (delivery === "Delivery") {
			setScheduling(true);
		}
		prepareOrder("delivery", delivery);
		prepareOrder("staffId", session.id);
		prepareOrder("branchId", session.branch.id)
	}, [delivery]);

	useEffect(() => {
		setIndexPage(page);
	}, [page]);

	useEffect(() => {
		calculateTotal();
	}, [orig]);

	return (
		<SafeAreaView className="bg-white h-full">
			<ScrollView showsVerticalScrollIndicator={false} className="px-4 flex-1">
				<RadioButton.Group
					onValueChange={value => setType(value)}
					value={type}
				>
					<View className="flex flex-row justify-between items-center py-2">
						<Pressable
							onPress={() => setType("Instant")}
							className={
								"w-1/2 flex flex-row justify-center items-center border border-primary-600 rounded-l-lg px-4 py-2" +
								(type === "Instant" ? " bg-primary" : "")
							}
						>
						<AntIcon
							name="clockcircleo"
							size={30}
							color={
								type === "Instant" ? "white" : "#5E9C8F"
							}
						/>
							<View className="hidden">
								<RadioButton color="#5E9C8F" value="Instant" />
							</View>
							<Text 
								className={
									"ml-4" +
									(type === "Instant" ? " text-white" : "")
								}>Instant order</Text>
						</Pressable>
						<Pressable
							onPress={() => setType("Preorder")}
							className={
								"w-1/2 flex flex-row justify-center items-center border border-l-0 border-primary-600 rounded-r-lg px-4 py-2" +
								(type === "Preorder" ? " bg-primary" : "")
							}
						>
							<AntIcon
								name="calendar"
								size={30}
								color={
									type === "Preorder" ? "white" : "#5E9C8F"
								}
							/>
							<View className="hidden">
								<RadioButton color="#5E9C8F" value="Preorder" />
							</View>
							<Text
								className={
									"ml-4" +
									(type === "Preorder" ? " text-white" : "")
								}
							>
								Pre-order
							</Text>
						</Pressable>
					</View>
				</RadioButton.Group>

				{type && (
					<>
						<Modal visible={scheduling}>
							<View className="mt-8" />
							<Agenda
								items={items}
								loadItemsForMonth={loadItems}
								selected={
									new Date().toISOString().split("T")[0]
								}
								renderItem={(
									reservation: AgendaEntry,
									isFirst: boolean
								) => {
									return (
										<TouchableOpacity
											className="px-4 py-2 border border-primary-600 rounded-lg my-2 mr-4"
											onPress={() => {
												setSlot(reservation.name);
												setScheduling(false);
											}}
										>
											<Text>{reservation.name}</Text>
										</TouchableOpacity>
									);
								}}
								rowHasChanged={(
									r1: AgendaEntry,
									r2: AgendaEntry
								) => r1.name !== r2.name}
								showClosingKnob={true}
							/>

							<Pressable
								onPress={() => setScheduling(false)}
								className="bg-primary-600 py-3"
							>
								<Text className="text-center text-white">
									Close
								</Text>
							</Pressable>
						</Modal>

						{customerOrder.branchId && (
							<RadioButton.Group
								onValueChange={value => setDelivery(value)}
								value={delivery}
							>
								<View className="flex flex-row justify-between items-center py-2">
									<Pressable
										onPress={() => setDelivery("Dinein")}
										className="w-1/3 flex flex-row justify-center items-center border border-primary-600 border-r-0 rounded-l-lg px-1 py-2"
									>
										<RadioButton color="#5E9C8F" value="Dinein" />
										<Text>Dine in</Text>
									</Pressable>
									<Pressable
										onPress={() => setDelivery("Takeaway")}
										className="w-1/3 flex flex-row justify-center items-center border border-primary-600 px-2 py-2"
									>
										<RadioButton color="#5E9C8F" value="Takeaway" />
										<Text>Take away</Text>
									</Pressable>
									<Pressable
										onPress={() => setDelivery("Delivery")}
										className="w-1/3 flex flex-row justify-center items-center border border-primary-600 border-l-0 rounded-r-lg px-1 py-2"
									>
										<RadioButton color="#5E9C8F" value="Delivery" />
										<Text>Delivery</Text>
									</Pressable>
								</View>
							</RadioButton.Group>
						)}

						{delivery === "Takeaway" && customerOrder.branchId && (
							<RadioButton.Group
								onValueChange={value => setOrig(value)}
								value={orig}
							>
								<View className="py-2">
									<Pressable
										onPress={() => setOrig("in")}
										className="flex flex-row items-center border border-primary-600 rounded-lg px-4 py-2 my-2"
									>
										<RadioButton color="#5E9C8F" value="in" />
										<Text>I'm in the restaurant</Text>
									</Pressable>
									<Pressable
										onPress={() => setOrig("out")}
										className="flex flex-row items-center border border-primary-600 rounded-lg px-4 py-2 my-2"
									>
										<RadioButton color="#5E9C8F" value="out" />
										<Text>I'm not in the restaurant</Text>
									</Pressable>
								</View>
							</RadioButton.Group>
						)}

						{orig === "in" ||
							(type !== "Delivery" && delivery === "Dinein" && (
								<View className="mt-2">
									<SelectList
										setSelected={fetchLots}
										data={sections}
										save="key"
										placeholder="Select table/room/section/hall"
										boxStyles={{
											borderColor: "#5E9C8F",
											borderWidth: 1,
											borderRadius: 10,
											paddingVertical: 18,
											paddingHorizontal: 20,
										}}
										dropdownStyles={{
											borderColor: "#5E9C8F",
											borderWidth: 1,
											borderRadius: 10,
										}}
									/>
								</View>
							))}

							{section && (
								<View className="mt-2">
									<SelectList
										setSelected={t => prepareOrder("lotId", t)}
										data={lots}
										save="key"
										placeholder="Select table"
										boxStyles={{
											borderColor: "#5E9C8F",
											borderWidth: 1,
											borderRadius: 10,
											paddingVertical: 18,
											paddingHorizontal: 20,
										}}
										dropdownStyles={{
											borderColor: "#5E9C8F",
											borderWidth: 1,
											borderRadius: 10,
										}}
									/>
								</View>
							)}

						{delivery == "Delivery" && (
							<View className="my-2">
								<SelectList
									setSelected={b => console.log(b)}
									data={addresses}
									save="key"
									placeholder="Select delivery address"
									boxStyles={{
										borderColor: "#5E9C8F",
										borderWidth: 1,
										borderRadius: 10,
										paddingVertical: 18,
										paddingHorizontal: 20,
									}}
									dropdownStyles={{
										borderColor: "#5E9C8F",
										borderWidth: 1,
										borderRadius: 10,
									}}
								/>
							</View>
						)}
					</>
				)}

				<Modal animationType="slide" visible={viewCart}>
					<View className="px-4 h-screen py-4 mt-6">
						<View className="flex flex-row justify-between items-center">
							<Text className="text-xl font-bold">
								Order summary
							</Text>
						</View>

						{Object.keys(carts).map(vendorId => (
							<View
								key={vendorId}
								className="flex w-full my-5 space-y-4 border-t pt-2 border-primary-500"
							>
								{carts[vendorId].map((item: OrderItem) => (
									<View
										className="flex flex-row items-center justify-between border-b pb-3 border-primary-500"
										key={item.id}
									>
										<View className="w-1/4">
											<ImageBackground
												className="h-16"
												source={{
													uri: imagePath(
														item.image?.url
													),
												}}
												resizeMode="cover"
											/>
										</View>

										<View className="flex-1 flex-start ml-3">
											<View className="flex flex-row justify-between">
												<Text className="text-base font-bold">
													{item.name}
												</Text>

												<Icon
													name="trash-can-outline"
													size={20}
												/>
											</View>

											<View className="flex flex-row justify-between mt-2">
												<Text className="text-base font-bold">
													KES {item.price}
												</Text>

												<View className="flex flex-row items-center justify-between border-2 border-primary-600 rounded-2xl px-1">
													<Pressable
														onPress={() => {}}
													>
														<Icon
															name="minus"
															size={20}
														/>
													</Pressable>

													<Text className="mx-2">
														{item.quantity}
													</Text>

													<Pressable
														className=" px-1"
														onPress={() => {}}
													>
														<Icon
															name="plus"
															size={20}
														/>
													</Pressable>
												</View>
											</View>
										</View>
									</View>
								))}
							</View>
						))}

						<View className="flex flex-row justify-between px-4 mt-5">
							<Pressable onPress={() => setPage(page - 1)}>
								<Text className="text-xl text-bold">
									<Icon name="chevron-left" size={20} />
								</Text>
							</Pressable>

							<View>
								<Text className="text-xl text-bold">
									You might also like
								</Text>
							</View>

							<Pressable onPress={() => setPage(page + 1)}>
								<Text className="text-xl text-bold">
									<Icon name="chevron-right" size={20} />
								</Text>
							</Pressable>
						</View>

						<PagerView
							ref={relatedRef}
							initialPage={page}
							className="px-3 h-36 pt-3"
						>
							{products.map((product, key) => (
								<View
									key={key}
									className="flex flex-row items-center justify-between"
								>
									<View className="w-2/5">
										<Image
											className="h-32 w-full rounded-lg"
											source={{
												uri: imagePath(
													product.image?.url
												),
											}}
											resizeMode="cover"
										/>
									</View>

									<View className="flex-1 flex flex-start ml-3">
										<View className="flex flex-row justify-between">
											<Text className="text-base font-bold">
												{product.name}
											</Text>
										</View>
										<Text className="text-base font-bold">
											KES {product.price}
										</Text>

										<Pressable
											onPress={() => addToCart(product, {})}
											className="bg-primary-600 rounded-lg px-4 py-2 flex flex-row justify-center items-center mt-2"
										>
											<Text className="text-white">
												Add to cart
											</Text>
										</Pressable>
									</View>
								</View>
							))}
						</PagerView>

						<Pressable
							onPress={() => setViewCart(!viewCart)}
							className="flex justify-center items-center bg-primary-700 py-2 rounded-lg"
						>
							<Text className="text-xl text-bold text-white">
								Close
							</Text>
						</Pressable>
					</View>
				</Modal>
			</ScrollView>

			<View className="bg-primary-100 rounded-t-3xl pt-5 mt-auto bottom-0">
				{delivery == "Delivery" && slot && (
					<View className="flex flex-row justify-between px-4">
						<View>
							<Text className="text-lg text-bold">
								Delivery time
							</Text>
						</View>

						<View>
							<Text className="text-lg text-bold">{slot}</Text>
						</View>
					</View>
				)}

				<View className="flex flex-row justify-between px-4">
					<View>
						<Text className="text-lg font-bold mb-3">Subtotal</Text>
					</View>

					<View>
						<Text className="text-lg font-bold">
							{getCartTotal()}
						</Text>
					</View>
				</View>

				{(delivery === "takeaway" || delivery === "Delivery") && (
					<View className="flex flex-row justify-between px-4">
						<View>
							<Text className="text-base text-bold">
								Shipping
							</Text>
						</View>

						<View>
							<Text className="text-xl text-bold">0.00</Text>
						</View>
					</View>
				)}

				{(delivery === "takeaway" || delivery === "Delivery") && (
					<View className="flex flex-row justify-between px-4">
						<View>
							<Text className="text-base text-bold">
								Packaging
							</Text>
						</View>

						<View>
							<Text className="text-base text-bold">0.00</Text>
						</View>
					</View>
				)}

				<View className="flex flex-row justify-between px-4">
					<View>
						<Text className="text-base text-bold">Tip</Text>
					</View>

					<View>
						<Text className="text-base text-bold">0.00</Text>
					</View>
				</View>

				{orig === "out" && (
					<View className="flex flex-row justify-between px-4">
						<View>
							<Text className="text-base text-bold">
								AppInApp cost
							</Text>
						</View>

						<View>
							<Text className="text-base text-bold">25.00</Text>
						</View>
					</View>
				)}

				<View className="flex flex-row justify-between px-4">
					<View>
						<Text className="text-base text-bold">
							Service fee(2%)
						</Text>
					</View>

					<View>
						<Text className="text-base text-bold">
							{(getCartTotal() * 0.02).toFixed(2)}
						</Text>
					</View>
				</View>

				<View className="flex flex-row justify-between mx-4 mt-5 border-t border-primary-500 pt-4">
					<View>
						<Text className="text-base font-bold">Total</Text>
					</View>

					<View>
						<Text className="text-base font-bold">{total}</Text>
					</View>
				</View>

				<View className="flex flex-row justify-center items-center">
					
						<View className="fixed bottom-0 px-4 mt-5 w-full">
							<TouchableOpacity
								onPress={() => processOrder()}
								className="flex flex-row justify-center border-2 border-primary-600 bg-primary-600 rounded-lg py-4 px-8"
							>
								<Text className="text-white">Post to bill</Text>
							</TouchableOpacity>
						</View>
					
				</View>
			</View>
		</SafeAreaView>
	);
}
