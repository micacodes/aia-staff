import {
	Image,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { api, imagePath } from "../utils/api";
import { Controller, useForm } from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";

export default function OrderCard({
	order,
	staffId,
	onClose,
	onUpdate,
}: {
	order: Order;
	staffId: string;
	onClose: () => void;
	onUpdate?: () => void;
}) {
	const [ref, setRef] = useState("");

	const {
		handleSubmit,
		control,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<Order>({
		defaultValues: order,
	});

	const postOrder = async (status = "Placed") => {
		await api.put<Order>(`orders/${order.id}`, {
			ref,
			status,
			staffId,
		});

		onClose && onClose();

		onUpdate && onUpdate();

		// toast?.show("Order updated successfully", {
		// 	type: "success",
		// });
	};

	return (
		<>
			<View className="flex flex-row justify-between items-center mt-14 mb-4 px-6">
				<View className="flex flex-row items-center justify-center">
					<Image
						className="h-16 w-16 rounded-full"
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

					<View className="flex flex-col ml-2">
						<Text className="text-lg font-bold">
							{order.customer?.name}
						</Text>

						<Text>{order.customer?.phone}</Text>
					</View>
				</View>

				<Pressable
					onPress={() => onClose()}
					className="bg-red-400 h-12 w-12 rounded-full flex items-center justify-center"
				>
					<Icon name="close" size={35} color="white" />
				</Pressable>
			</View>

			<ScrollView className="h-screen px-6">
				<View className="flex flex-row justify-between">
					<View className="flex flex-col">
						<Text className="text-lg font-bold">
							{order.delivery} ({order.type})
						</Text>
						{order.section && <Text>@ {order.section?.name}</Text>}
					</View>
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Order status</Text>
					<Text>{order.status}</Text>
				</View>

				<View className="flex flex-col mt-4 border border-primary-600 p-2 rounded-lg">
					<Text className="text-lg font-bold mb-2">Order Items</Text>

					{order.items?.map((item, i) => (
						<View
							key={`item-${item.id}`}
							className="w-full border-t border-primary-600 py-2"
						>
							<View>
								<Text className="border-r pr-2">
									{i + 1}. {item.name}
								</Text>
							</View>

							<View className="flex flex-row justify-between">
								<Text className="border-r pr-2 tetx-base">
									x{item.quantity}
								</Text>

								<Text className="text-base font-bold">
									KES {item.price}
								</Text>
							</View>
						</View>
					))}
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Order Total</Text>
					<Text>KES {order.total}</Text>
				</View>

				{order?.invoices?.map(i => {
					return (
						<View key={i.id}>
							<View className="flex flex-row mt-4 items-center justify-between">
								<Text className="text-lg font-bold">
									Payments
								</Text>

								<View className="bg-primary-600 rounded-full p-1">
									<Icon name="plus" size={24} color="white" />
								</View>
							</View>

							<Text>{i.number}</Text>

							<View>
								{i?.order?.payments?.map(p => (
									<View>
										<Text className="text-base">
											KES {p.amount} via {p.method} (
											{p.status}){" "}
										</Text>
									</View>
								))}
							</View>
						</View>
					);
				})}

				{order.status === "Pending" && (
					<>
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
										placeholder="Enter POS reference"
										placeholderTextColor="rgba(0, 0, 0, 0.50)"
										value={value}
									/>
								)}
								name="ref"
								rules={{ required: true }}
							/>
						</View>

						<TouchableOpacity
							onPress={() => postOrder()}
							className="bg-primary-600 px-6 py-4 rounded-lg relative bottom-0 mt-4 flex flex-row justify-center"
						>
							<Text className="text-white text-base font-bold">
								Post order
							</Text>
						</TouchableOpacity>
					</>
				)}

				{order.status === "Placed" && (
					<>
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
										placeholder="Enter POS reference"
										placeholderTextColor="rgba(0, 0, 0, 0.50)"
										value={value}
									/>
								)}
								name="ref"
								rules={{ required: true }}
							/>
						</View>

						<View className="mt-6 flex flex-row justify-between space-x-1">
							{["Processing", "Rejected"].map(s => (
								<TouchableOpacity
									key={s}
									onPress={() => postOrder(s)}
									className="border border-primary-600 px-6 py-3 rounded-lg w-1/2"
								>
									<Text className="text-primary-600 text-base font-bold">
										Set {s}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<View className="mt-2 flex flex-row justify-between space-x-1">
							{["Delivering", "Delivered"].map(s => (
								<TouchableOpacity
									key={s}
									onPress={() => postOrder(s)}
									className="border border-primary-600 px-6 py-3 rounded-lg w-1/2"
								>
									<Text className="text-primary-600 text-base font-bold">
										Set {s}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<View className="mt-2 flex flex-row justify-between space-x-1">
							{["Completed", "Cancelled"].map(s => (
								<TouchableOpacity
									key={s}
									onPress={() => postOrder(s)}
									className="border border-primary-600 px-6 py-3 rounded-lg w-1/2"
								>
									<Text className="text-primary-600 text-base font-bold">
										Set {s}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</>
				)}

				{order.status === "Processing" && (
					<>
						<View className="mt-6 flex flex-row justify-between space-x-1">
							{["Delivering", "Delivered"].map(s => (
								<TouchableOpacity
									key={s}
									onPress={() => postOrder(s)}
									className="border border-primary-600 py-3 rounded-lg w-1/2"
								>
									<Text className="text-primary-600 text-base font-bold text-center">
										Set {s}
									</Text>
								</TouchableOpacity>
							))}
						</View>

						<View className="mt-2 flex flex-row justify-between space-x-1">
							{["Completed"].map(s => (
								<TouchableOpacity
									key={s}
									onPress={() => postOrder(s)}
									className="border border-primary-600 py-3 rounded-lg w-full"
								>
									<Text className="text-primary-600 text-base text-center font-bold">
										Set {s}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</>
				)}
			</ScrollView>
		</>
	);
}
