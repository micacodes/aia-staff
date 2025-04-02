import { useContext, useEffect, useState } from "react";
import {
	Image,
	Platform,
	Pressable,
	StatusBar,
	Text,
	View,
	SafeAreaView,
	ScrollView,
	Modal,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api";
import { format, formatDistance } from "date-fns";
import { AuthContext } from "../../providers/AuthProvider";
import OrderCard from "../../components/OrderCard";

export default function CartPage({ navigation }) {
	const [status, setStatus] = useState("Pending");
	const [orders, setOrders] = useState([]);
	const [order, setOrder] = useState<Order>();

	const { session } = useContext(AuthContext);

	const toast = useToast();

	StatusBar.setBarStyle("dark-content");
	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor("rgba(255,255,255,255)");
		StatusBar.setTranslucent(true);
	}

	const fetchOrders = async () => {
		api.get<PaginatedData<Order>>("orders", { status }).then(({ data }) => {
			setOrders(data);
		});
	};

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Pressable
					onPress={() => navigation.navigate("NewOrdersPage")}
					className="bg-primary-600 rounded-full"
				>
					<Icon name="plus" size={30} color="white" />
				</Pressable>
			),
		});
	}, []);

	useEffect(() => {
		fetchOrders();
	}, [status]);

	return (
		<SafeAreaView className="bg-gray-100 h-full">
			{order && (
				<Modal>
					<OrderCard
						order={order}
						onClose={() => setOrder(undefined)}
						onUpdate={() => {
							setOrder(undefined);
							fetchOrders();
						}}
						staffId={session.id}
					/>
				</Modal>
			)}

			<FlatList
				className="px-6 max-h-24 min-h-24 h-24 w-full"
				contentContainerStyle={{ gap: 5, alignItems: "center" }}
				horizontal
				showsHorizontalScrollIndicator={false}
				data={[
					"Pending",
					"Placed",
					"Processing",
					"Delivering",
					"Delivered",
					"Completed",
					"Cancelled",
					"Rejected",
				]}
				renderItem={({ item: s }) => (
					<Pressable
						key={s}
						onPress={() => setStatus(s)}
						className={
							"rounded-full h-12 px-6 flex items-center justify-center " +
							(s === status ? "bg-primary-800" : "bg-primary")
						}
					>
						<Text className="text-white text-base font-bold">
							{s}
						</Text>
					</Pressable>
				)}
			/>

			<ScrollView className="px-4 mb-2">
				{orders.map(order => (
					<TouchableOpacity
						key={order.id}
						onPress={() => setOrder(order)}
						className="bg-white rounded-lg px-2 my-2"
					>
						<View className="flex flex-1 flex-row py-3 items-center">
							<Image
								className="h-14 w-14 rounded-full"
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
							<View className="ml-2 flex-1">
								<Text className="text-lg font-bold">
									{order.delivery} ({order.type})
								</Text>

								<Text>
									{order.total > 0 && (
										<Text>KES {order.total} </Text>
									)}
									{order.action} @ {order.section?.name} by{" "}
									{order.customer?.name}
								</Text>

								<Text className="pb-1">
									{format(
										new Date(order.createdAt),
										"EEE do MMMM, yyyy HH:mm a"
									)}
								</Text>
							</View>
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}
