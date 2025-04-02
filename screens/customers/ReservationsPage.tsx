import { useEffect, useState } from "react";
import {
	Image,
	Platform,
	Pressable,
	StatusBar,
	Text,
	TextInput,
	View,
	SafeAreaView,
	ScrollView,
	Modal,
	TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api";
import { useForm, Controller } from "react-hook-form";
import {
	Agenda,
	DateData,
	AgendaEntry,
	AgendaSchedule,
} from "react-native-calendars";
import { addHours } from "date-fns";
import Reservation from "../../components/Reservation";

export default function ReservationsPage({ navigation }) {
	const [status, setStatus] = useState("Pending");
	const [orders, setOrders] = useState([]);
	const [order, setOrder] = useState<Order>();
	const [slot, setSlot] = useState("");
	const [creating, setCreating] = useState(false);
	const [items, setItems] = useState<AgendaSchedule>({});
	const [selected, setSelected] = useState(
		new Date().toISOString().split("T")[0]
	);

	StatusBar.setBarStyle("dark-content");
	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor("rgba(255,255,255,255)");
		StatusBar.setTranslucent(true);
	}

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

	const {
		handleSubmit,
		control,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<Order>();

	useEffect(() => {
		navigation.setOptions({
			title: `Reservations`,
		});
	}, [selected]);

	useEffect(() => {
		api.get<PaginatedData<Order>>("orders", {
			status,
			start: selected,
		}).then(({ data }) => {
			setOrders(data);
		});
	}, [status]);

	return (
		<SafeAreaView className="bg-gray-100 h-full">
			{order && (
				<Modal>
					<View className="flex flex-row justify-end mt-14 mr-6">
						<Pressable
							onPress={() => setOrder(undefined)}
							className="bg-red-400 h-12 w-12 rounded-full flex items-center justify-center"
						>
							<Icon name="close" size={35} color="white" />
						</Pressable>
					</View>

					<View className="h-screen px-6">
						<View className="flex flex-row justify-between">
							<View className="flex flex-col">
								<Text className="text-lg font-bold">
									{order.delivery} ({order.type})
								</Text>
								<Text>@ {order.section?.name}</Text>
							</View>
						</View>

						<View className="flex flex-col mt-4">
							<Text className="text-lg font-bold">
								Order status
							</Text>
							<Text>{order.status}</Text>
						</View>

						<View className="flex flex-col mt-4">
							<Text className="text-lg font-bold">
								Customer Details
							</Text>
							<Text>
								{order.customer?.name} ({order.customer?.phone})
							</Text>
						</View>

						{/* Order items with option to remove */}
						<View className="flex flex-col mt-4">
							<Text className="text-lg font-bold">
								Order Items
							</Text>
							{order.items?.map(item => (
								<View
									key={item.id}
									className="flex flex-row justify-between"
								>
									<Text>{item.name}</Text>
									<Text>{item.quantity}</Text>
								</View>
							))}
						</View>

						<View className=" mt-4">
							<Controller
								control={control}
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										className="w-full px-3 py-4 border border-primary-600 rounded-lg"
										onBlur={onBlur}
										onChangeText={onChange}
										placeholder="Enter external ref"
										placeholderTextColor="rgba(0, 0, 0, 0.50)"
										value={value}
									/>
								)}
								name="ref"
								rules={{ required: true }}
							/>
						</View>

						<Pressable
							onPress={() => setOrder(undefined)}
							className="bg-primary-600 px-6 py-4 rounded-lg relative bottom-0 mt-4 flex flex-row justify-center"
						>
							<Text className="text-white text-base font-bold">
								Post order
							</Text>
						</Pressable>
					</View>
				</Modal>
			)}

			{creating && (
				<Modal>
					<Reservation
						onCreate={() => setCreating(false)}
						onCancel={() => setCreating(false)}
						selected={selected}
					/>
				</Modal>
			)}

			<View className="px-4">
				<TouchableOpacity
					onPress={() => setCreating(true)}
					className="py-4 bg-primary-600 rounded-lg my-2"
				>
					<Text className="text-center text-white text-base">
						New reservation for {selected}
					</Text>
				</TouchableOpacity>
			</View>

			<Agenda
				items={items}
				loadItemsForMonth={loadItems}
				selected={selected}
				onDayChange={({ dateString }) => setSelected(dateString)}
				renderItem={(reservation: AgendaEntry, isFirst: boolean) => {
					return (
						<ScrollView className="px-4 mb-2">
							{orders.map(order => (
								<TouchableOpacity
									key={order.id}
									onPress={() => setOrder(order)}
									className="bg-white rounded-2xl my-2"
								>
									<View className="flex flex-1 flex-row-reverse py-3 items-center">
										<View className="flex-1">
											<Text className="text-lg font-bold">
												{order.customer?.name}
											</Text>
											<Text>
												{order.action} @{" "}
												{order.section?.name} -{" "}
												{order.delivery} ({order.type})
											</Text>
										</View>

										<Image
											className="h-16 w-1/5 mx-1"
											source={{
												uri: imagePath(
													order.customer?.avatar?.url,
													order.customer?.avatarUrl
												),
											}}
											resizeMode="contain"
											height={100}
											width={100}
										/>
									</View>
								</TouchableOpacity>
							))}
						</ScrollView>
					);
				}}
				renderEmptyDate={() => {
					return <View />;
				}}
				rowHasChanged={(r1: AgendaEntry, r2: AgendaEntry) => {
					return r1.name !== r2.name;
				}}
				theme={{
					backgroundColor: "#ffffff",
					calendarBackground: "#ffffff",
					textSectionTitleColor: "#b6c1cd",
					selectedDayBackgroundColor: "#5E9C8F",
					selectedDayTextColor: "#ffffff",
					todayTextColor: "#00adf5",
					dayTextColor: "#5E9C8F",
					textDisabledColor: "#d9e",
				}}
				showClosingKnob={true}
			/>
		</SafeAreaView>
	);
}
