import { Modal, Pressable, ScrollView, Text, TextInput } from "react-native";
import { View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../utils/api";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { useForm, Controller } from "react-hook-form";
import { TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import RegisterUser from "./RegisterUser";

export default function Reservation({
	onCreate,
	onCancel,
	selected,
	...props
}: {
	onCreate: () => void;
	onCancel: () => void;
	selected: string;
	[key: string]: any;
}) {
	const [s, setS] = useState<string>("");
	const [customers, setCustomers] = useState<User[]>([]);
	const [adding, setAdding] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<ICountry>();
	const {
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<Order>({
		defaultValues: {
			userId: "",
			branchId: "",
			vendorId: "",
			sectionId: "",
			lotId: "",
		},
	});

	const order = watch();

	const onSubmit = async (data: Order) => {
		await api.post("orders", data);
		onCreate();
	};

	useEffect(() => {
		if (s.length > 8) {
			const phone = selectedCountry?.callingCode + s.replace(/\s/g, "");
			api.get<PaginatedData<User>>(`users`, {
				phone: phone.replace("+", ""),
			}).then(({ data }) => {
				setCustomers(data);
			});
		}
	}, [s]);

	return (
		<ScrollView>
			<View className="w-full px-3">
				<View className="flex flex-row justify-between items-center">
					<Text className="text-xl font-bold">
						Reservation for {selected}
					</Text>

					<Pressable
						onPress={onCancel}
						className="bg-red-400 h-12 w-12 rounded-full flex items-center justify-center"
					>
						<Icon name="close" size={35} color="white" />
					</Pressable>
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Select customer</Text>

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
							},
							input: {
								backgroundColor: "#F3F3F3",
								paddingVertical: 9,
							},
						}}
					/>
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
						<RegisterUser
							onCreated={c => setValue("userId", c.id)}
						/>
					</Modal>
				)}

				{!order.userId && (
					<View className="">
						{customers.map(c => (
							<TouchableOpacity
								key={`customer-${c.id}`}
								onPress={() => setValue("userId", c.id)}
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
									// onPress={() => setAdding(true)}
									className="w-full border border-primary-500 p-4 rounded-lg flex items-center justify-center"
								>
									<Text className="text-primary-600">
										Onboard customer
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				)}

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Select time</Text>

					<TextInput
						className="w-full px-3 py-2 border border-primary-600 rounded-lg"
						placeholder="Set time"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
					/>
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Select section</Text>

					<TextInput
						className="w-full px-3 py-2 border border-primary-600 rounded-lg"
						placeholder="Set section"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
					/>
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Select table</Text>

					<TextInput
						className="w-full px-3 py-2 border border-primary-600 rounded-lg"
						placeholder="Set table"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
					/>
				</View>

				<View className="flex flex-col mt-4">
					<Text className="text-lg font-bold">Order notes</Text>

					<TextInput
						className="w-full px-3 py-2 border border-primary-600 rounded-lg h-20"
						placeholder="Add order notes"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
						multiline
						style={{
							textAlignVertical:
								"top",
						}}
					/>
				</View>
				<TouchableOpacity
					onPress={handleSubmit(onSubmit)}
					className="py-4 bg-primary-600 rounded-lg my-4"
				>
					<Text className="text-center text-white text-base font-bold">
						Place reservation
					</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}
