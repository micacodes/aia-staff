import { useContext, useEffect, useState } from "react";
import {
	FlatList,
	Pressable,
	SafeAreaView,
	Text,
	TextInput,
	TouchableOpacity,
} from "react-native";
import { View } from "react-native";
import { api, imagePath } from "../../utils/api";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "react-native";
import { AuthContext } from "../../providers/AuthProvider";
import { RadioButton } from "react-native-paper";

export default function OrderDetails({ navigation, route }) {
	const { orderId } = route.params;
	const [order, setOrder] = useState<Order>(null);
	const [ref, setRef] = useState("");

	const { session } = useContext(AuthContext);

	const {
		handleSubmit,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<Order>({
		defaultValues: order,
	});

	useEffect(() => {
		api.get<Order>(`orders/${orderId}`).then(order => {
			setOrder(order);
		});
	}, [orderId]);

	const postOrder = async () => {
		setOrder(undefined);

		await api.put<Order>(`orders/${order.id}`, {
			ref,
			status: "Placed",
			staffId: session.id,
		});

		// toast?.show("Order updated successfully", {
		// 	type: "success",
		// });
	};

	return (
		<SafeAreaView className="flex bg-white h-full">
			{order && (
				<View className="px-4 py-4">
					<View className="flex flex-row justify-between items-center bg-primary-200 mb-4 mx-4 rounded-lg p-2">
						<View className="flex items-center justify-center w-full">
							<Image
								className="h-14 w-14 rounded-full mb-2"
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

							<View className="flex flex-row justify-between w-full py-2">
								<View>
									<Text>Customer name:</Text>
								</View>
								<View>
									<Text className=" font-bold">
										{order.customer?.name}
									</Text>
								</View>
							</View>

							<View className="flex flex-row justify-between w-full py-2">
								<View>
									<Text>Customer phone:</Text>
								</View>
								<Text>{order.customer?.phone}</Text>
							</View>

							<View className="flex flex-row justify-between w-full py-2">
								<View>
									<Text>Order Type:</Text>
								</View>
								<Text>
									{order.delivery} ({order.type})
								</Text>
							</View>

							<View className="flex flex-row justify-between w-full py-2">
								<View>
									<Text>Section:</Text>
								</View>
								<Text>@{order.section?.name}</Text>
							</View>
						</View>
					</View>

					<View className="h-screen px-4">
						<View className="flex flex-col mt-4 bg-primary-100 p-2 rounded-lg">
							<Text className="text-lg font-bold mb-2">
								Order Items
							</Text>

							{order.items?.map((item, i) => (
								<View key={item.id} className="w-full ">
									<View>
										<Text className="pr-2 w-1/2">
											{i + 1}. {item.name}
										</Text>
									</View>
									<View className="w-full flex flex-row justify-between py-2">
										<Text className="pr-2 w-1/4">
											x{item.quantity}
										</Text>
										<Text className="">
											KES {item.price}
										</Text>
									</View>
								</View>
							))}

							<View className="flex flex-row justify-end w-full border-t mt-4">
								<Text className="text-lg font-bold my-2">
									KES {order.total}
								</Text>
							</View>
						</View>

						<View className=" mt-4">
							<Controller
								control={control}
								render={({
									field: { onChange, onBlur, value },
								}) => (
									<TextInput
										className="w-full px-3 py-3 border border-primary-600 rounded-lg"
										onBlur={onBlur}
										onChangeText={setRef}
										placeholder="Enter external ref"
										placeholderTextColor="rgba(0, 0, 0, 0.50)"
										value={order.ref}
									/>
								)}
								name="ref"
								rules={{ required: true }}
							/>
						</View>

						<Text className="text-lg font-bold mt-2">
							Order status
						</Text>

						<RadioButton.Group
							onValueChange={newValue =>
								setOrder({ ...order, status: newValue })
							}
							value={order.status}
						>
							<FlatList
								data={[
									"Pending",
									"Placed",
									"Processing",
									"Closed",
								]}
								renderItem={({ item: s }) => (
									<Pressable
										key={s}
										className={
											"flex-1 rounded-lg flex flex-row items-center justify-center py-2 " +
											(s === order.status
												? "bg-primary"
												: "border border-primary-600")
										}
									>
										<View className="hidden">
											<RadioButton
												value={s}
												status={
													s === order.status
														? "checked"
														: "unchecked"
												}
												onPress={() =>
													setOrder({
														...order,
														status: s,
													})
												}
											/>
										</View>
										<Text
											className={
												"text-base font-bold text-center " +
												(s === order.status
													? "text-white"
													: "text-primary-600")
											}
										>
											{s}
										</Text>
									</Pressable>
								)}
								columnWrapperStyle={{ gap: 5 }}
								contentContainerStyle={{ gap: 5 }}
								numColumns={2}
								key={2}
								className="mt-4"
							/>
						</RadioButton.Group>

						<TouchableOpacity
							onPress={() => postOrder()}
							className="bg-primary-600 px-6 py-4 rounded-lg relative bottom-0 mt-4 flex flex-row justify-center"
						>
							<Text className="text-white text-base font-bold">
								Update order
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
		</SafeAreaView>
	);
}
