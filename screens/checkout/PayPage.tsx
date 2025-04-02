import { useContext, useEffect, useState } from "react";
import {
	Pressable,
	SafeAreaView,
	Modal,
	KeyboardAvoidingView,
	Image,
} from "react-native";
import { Text, View, TextInput } from "react-native";
import { WebView } from "react-native-webview";
import { Paystack } from "react-native-paystack-webview";
import { RadioButton } from "react-native-paper";
import { CartContext } from "../../providers/CartProvider";
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";

export default function Pay({ navigation, route }) {
	const { session } = useContext(AuthContext);
	const { recordPayment, getCartTotal } = useContext(CartContext);

	const { orderId, total } = route.params;

	const [method, setMethod] = useState("");
	const [payer, setPayer] = useState("");
	const [popup, setPopup] = useState(false);
	const [payment, setPayment] = useState<Payment>(null);
	const [methodUrl, setMethodUrl] = useState("");
	const [order, setOrder] = useState<Order>(null);

	const { firstName, lastName, email, phone, id } = session;

	const handleSuccess = async (e: {
		data?: {
			event: string;
			transactionRef: {
				message: string;
				redirecturl: string;
				reference: string;
				status: string;
				trans: string;
				transaction: string;
				trxref: string;
			};
		};
		status: string;
		transactionRef: {
			message: string;
			redirecturl: string;
			reference: string;
			status: string;
			trans: string;
			transaction: string;
			trxref: string;
		};
	}) => {
		if (e.status === "success") {
			await recordPayment(order.id, {
				ref: e.transactionRef.reference,
			});

			navigation.navigate("Success", {
				e,
			});
		}
	};

	const getOrderTotal = () => {
		let total = order?.items.reduce((total, item) => {
			return total + item.price * item.quantity;
		}, 0);

		if (order?.meta?.charges) {
			total = Object.keys(order?.meta?.charges).reduce(
				(total, charge) => {
					return total + order?.meta?.charges[charge];
				},
				total
			);
		}

		return total;
	};

	const getOrderSubTotal = () => {
		return order?.items.reduce((total, item) => {
			return total + item.price * item.quantity;
		}, 0);
	};

	const processPayment = async () => {
		let p = null;
		if (method === "pesaflow") {
			p = await api.post<Payment & { url: string }>("payments", {
				orderId,
				amount: getCartTotal(),
				phone,
				email,
				firstName,
				lastName,
			});
		}

		if (method === "ke.mpesa") {
			setMethod("ke.mpesa");

			const payload = {
				orderId,
				amount: getOrderTotal(),
				payer,
				userId: session.id,
				method: "ke.mpesa",
				vendorId: order.vendorId,
			};

			if (order.invoices.length > 0) {
				payload["invoiceId"] = order.invoices[0].id;
			}

			p = await api.post<Payment>("payments", payload);

			if (p) {
				setPopup(false);
				navigation.navigate("PaymentConfirmPage", { payment: p });
			}
		}

		setPayment(p);
	};

	useEffect(() => {
		if (orderId) {
			api.get<Order>(`orders/${orderId}`).then(data => {
				setOrder(data);
			});
		}

		navigation.setOptions({
			title: order?.vendor?.name || "Pay",
		});

		setPayer(phone);
	}, []);

	useEffect(() => {
		if (method === "paystack") {
			setMethodUrl("https://reactnative.dev/");
		}
	}, [method]);

	return (
		<SafeAreaView className="py-6 bg-white pt-2 h-screen flex-1">
			<ScrollView>
				<KeyboardAvoidingView>
					<View className="flex flex-row justify-between px-4 mt-5">
						<View>
							<Text className="text-xl font-bold">Subtotal</Text>
						</View>

						<View>
							<Text className="text-xl font-bold">
								{getOrderSubTotal()}
							</Text>
						</View>
					</View>

					{order?.meta?.charges &&
						Object.keys(order?.meta?.charges).map(charge => (
							<View
								key={charge}
								className="flex flex-row justify-between px-4"
							>
								<View>
									<Text className="text-lg font-bold">
										{charge}
									</Text>
								</View>

								<View>
									<Text className="text-xl font-bold">
										{order?.meta?.charges[charge]}
									</Text>
								</View>
							</View>
						))}

					<View className="flex flex-row justify-between mx-4 mt-5 border-t border-primary-500 pt-4">
						<View>
							<Text className="text-lg font-bold">Total</Text>
						</View>

						<View>
							<Text className="text-lg font-bold">{total}</Text>
						</View>
					</View>

					<Modal animationType="slide" visible={popup}>
						{method === "ke.mpesa" && (
							<View className="flex h-screen  justify-center my-1">
								<View className="flex flex-row justify-center items-center mb-5">
									<Image
										source={require("../../assets/images/companies/mpesa-ke.png")}
										resizeMode="contain"
										className="w-60 h-60"
									/>
								</View>

								<View className="px-4">
									<Text className="text-lg">
										Pay{" "}
										<Text className="font-bold">
											KES {total}
										</Text>{" "}
										via Lipa Na M-Pesa
									</Text>
									<Text>
										Enter your M-Pesa phone number below
									</Text>
								</View>

								<View className="w-full px-4 mt-4">
									<TextInput
										className="py-2 px-8 rounded-lg border border-primary-400"
										placeholder="Confirm phone number"
										defaultValue={phone}
										onChange={e =>
											setPayer(e.nativeEvent.text)
										}
									/>
								</View>

								<TouchableOpacity
									onPress={() => processPayment()}
									className="mx-4 mt-5 bg-primary-700 rounded-lg py-3 flex flex-row justify-center items-center"
								>
									<Text className="text-white">
										Complete payment
									</Text>
								</TouchableOpacity>

								<View className="flex flex-row justify-center items-center mt-5">
									<TouchableOpacity
										onPress={() => {
											setPopup(false);
											setMethod("");
										}}
									>
										<Text className="font-bold text-primary-700">
											Close popup
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						)}

						{method === "ke.airtel" && (
							<View className="flex h-screen  justify-center my-1">
								<View className="flex flex-row justify-center items-center mb-5">
									<Image
										source={require("../../assets/images/companies/airtel.png")}
										resizeMode="contain"
										className="w-60 h-60"
									/>
								</View>

								<View className="px-4">
									<Text className="text-xl font-bold">
										Airtel Money (Kenya)
									</Text>
								</View>

								<View className="w-full px-4 mt-4">
									<TextInput
										className="py-2 px-8 rounded-lg border border-primary-400"
										placeholder="Confirm phone number"
									/>
								</View>

								<Pressable className="mx-4 mt-5 bg-primary-700 rounded-lg py-3 flex flex-row justify-center items-center">
									<Text className="text-white">
										Complete payment
									</Text>
								</Pressable>

								<View className="flex flex-row justify-center items-center mt-5">
									<Pressable onPress={() => setMethod("")}>
										<Text className="font-bold text-primary-700">
											Close popup
										</Text>
									</Pressable>
								</View>
							</View>
						)}

						{method === "paystack" && (
							<Paystack
								paystackKey="pk_live_dec72e901d86a8a03b957b5cd970cd74769e0703"
								refNumber={order.id}
								amount={getCartTotal()}
								firstName={firstName}
								lastName={lastName}
								billingEmail={email}
								phone={phone}
								//@ts-ignore
								currency="KES"
								channels={["card", "mobile_money"]}
								activityIndicatorColor="green"
								onCancel={e => {
									console.log(e);
								}}
								//@ts-ignore
								onSuccess={handleSuccess}
								autoStart={true}
							/>
						)}
					</Modal>

					<View>
						<View className="fixed bottom-0 px-4 mt-4">
							<RadioButton.Group
								onValueChange={value => setMethod(value)}
								value={method}
							>
								<View className="px-2 py-2">
									{[
										{
											key: "ke.mpesa",
											label: "Lipa Na M-Pesa",
											img: require("../../assets/images/companies/mpesa-ke.png"),
										},
										{
											key: "pesaflow",
											label: "Pesaflow",
											img: require("../../assets/images/companies/pesaflow.png"),
										},
									].map(m => (
										<Pressable
											key={m.key}
											onPress={() => {
												setMethod(m.key);
												setPopup(true);
											}}
											className="flex flex-row items-center justify-between border border-primary-600 rounded-lg px-4 py-2 my-2"
										>
											<View className="flex flex-row items-center">
												<RadioButton value={m.key} />
												<Text>{m.label}</Text>
											</View>
											<Image
												source={m.img}
												resizeMode="contain"
												className="w-20 h-8"
											/>
										</Pressable>
									))}
								</View>
							</RadioButton.Group>
						</View>
					</View>
				</KeyboardAvoidingView>
			</ScrollView>
		</SafeAreaView>
	);
}
