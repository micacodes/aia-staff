import { useContext, useEffect, useState } from "react";
import {
	Text,
	View,
	TextInput,
	Pressable,
	ScrollView,
	TouchableOpacity,
	ImageBackground,
} from "react-native";
import PhoneInput, { ICountry } from "react-native-international-phone-number";
import { useForm, Controller, SubmitErrorHandler } from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { KeyboardAvoidingView } from "react-native";

import { AuthContext } from "../providers/AuthProvider";
import { api, imagePath } from "../utils/api";
import { RadioButton } from "react-native-paper";

export default function RegisterUser({
	onCreated,
	searching = false,
}: {
	onCreated: (user: User) => void;
	searching?: boolean;
}) {
	const [customers, setCustomers] = useState<User[]>([]);
	const [customer, setCustomer] = useState<User>(null);
	const [adding, setAdding] = useState(true);
	const [s, setS] = useState<string>("");
	const [selectedCountry, setSelectedCountry] = useState<ICountry>();

	const { session } = useContext(AuthContext);
	const {
		handleSubmit,
		control,
		watch,
		setValue,
		setError,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<User & { vendorId?: string; branchId?: string }>({
		defaultValues: {
			vendorId: session.vendor?.id,
			branchId: session.branch?.id,
		},
	});

	const user = watch();

	const assignCustomer = (c: User) => {
		setCustomer(c);
	};

	const attachUser = async (user: User) => {
		try {
			await api
				.post<User>(`branches/${session.branch.id}/customers`, {
					vendorId: session.vendor.id,
					userId: user.id,
				})
				.then(onCreated);
		} catch (error) {}
	};

	const onSubmit = async (data: User) => {
		try {
			api.post<User>("auth/register", data).then(user => {
				attachUser(user);
				onCreated(user);

				reset();
			});
		} catch (error) {
			if (error.response.status === 422) {
				setError("email", {
					type: "manual",
					message: "Email already exists",
				});
			}

			console.error(error);
		}
	};

	const onError: SubmitErrorHandler<any> = (errors, e) => {
		return console.log(errors);
	};

	useEffect(() => {
		if (s.length > 2) {
			api.get<PaginatedData<User>>(`users/`, { s }).then(({ data }) => {
				setCustomers(data);
			});
		}
	}, [s]);

	return (
		<KeyboardAvoidingView className="h-full px-3 flex flex-col">
			<ScrollView className="flex-1">
				{!adding && searching && (
					<View className="flex items-center justify-center mt-2">
						<View className="w-full h-12 rounded-3xl bg-gray-100 flex flex-row items-center px-3">
							<Icon name="magnify" size={25} color="#5E9C8F" />

							<TextInput
								onChangeText={setS}
								placeholder="Search by phone or email"
								className="ml-3 w-full"
							/>
						</View>

						{customer ? (
							<View className="w-full">
								<View className="border border-dashed w-full mt-5 px-4 py-2 flex flex-row justify-between items-center">
									<Text>
										{customer.firstName} {customer.lastName}
									</Text>

									<TouchableOpacity
										onPress={() => {
											setCustomer(null);
											setCustomers([]);
										}}
										className="my-2 rounded-full px-2 py-2"
									>
										<Icon
											name="pencil"
											size={20}
											color="#5E9C8F"
										/>
									</TouchableOpacity>
								</View>

								<TouchableOpacity
									onPress={() => attachUser(customer)}
									className="my-4 bg-primary-600 py-4 rounded-lg"
								>
									<Text className="text-center text-white text-base">
										Set {customer.firstName} as customer
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							<View className="px-6 my-4">
								{!adding && (
									<View>
										{customers.map(c => (
											<TouchableOpacity
												key={`customer-${c.id}`}
												onPress={() =>
													assignCustomer(c)
												}
												className="my-2 flex flex-row items-center justify-between"
											>
												<ImageBackground
													source={{
														uri: imagePath(
															c.avatar?.url,
															c.avatarUrl
														),
													}}
													className="w-12 h-12 rounded-full"
												/>
												<Text>
													{c.firstName} {c.lastName}
												</Text>
											</TouchableOpacity>
										))}

										<TouchableOpacity
											onPress={() => setAdding(true)}
											className="mt-5 border border-primary-600 py-4 rounded-lg w-full px-5"
										>
											<Text className="text-base text-primary-600 text-center">
												+ Add new customer
											</Text>
										</TouchableOpacity>
									</View>
								)}
							</View>
						)}
					</View>
				)}

				{adding && !customer && (
					<View className="mt-5">
						{searching && (
							<TouchableOpacity
								onPress={() => setAdding(false)}
								className="my-4 border border-primary-600 py-4 rounded-lg w-full px-5"
							>
								<Text className="text-base text-center text-primary-600">
									Search for existing user
								</Text>
							</TouchableOpacity>
						)}

						<Text className="my-2 ml-0">Title</Text>

						<Controller
							control={control}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									className={
										"w-full px-3 py-3 border rounded-lg " +
										(errors.title
											? "border-red-500"
											: "border-primary-600")
									}
									onBlur={onBlur}
									onChangeText={value => onChange(value)}
									value={value}
									placeholder="Eg Mr., Mrs., Ms."
									placeholderTextColor="rgba(0, 0, 0, 0.50)"
								/>
							)}
							name="title"
							rules={{ required: true }}
						/>
						{errors.title && (
							<Text className="text-red-500 text-sm">
								{errors.title.message}
							</Text>
						)}

						<View className="w-full min-w-full flex flex-row items-center">
							<View className="flex-1 ">
								<Text className="my-2 ml-0">First name</Text>

								<Controller
									control={control}
									render={({
										field: { onChange, onBlur, value },
									}) => (
										<TextInput
											className="w-full px-3 py-3 border border-primary-600 rounded-l-lg border-r-0"
											onBlur={onBlur}
											onChangeText={value =>
												onChange(value)
											}
											value={value}
											placeholder="First name"
											placeholderTextColor="rgba(0, 0, 0, 0.50)"
										/>
									)}
									name="firstName"
									rules={{ required: true }}
								/>
							</View>

							<View className="flex-1 border-l-0">
								<Text className="my-2 ml-0">Last name</Text>
								<Controller
									control={control}
									render={({
										field: { onChange, onBlur, value },
									}) => (
										<TextInput
											className="px-3 py-3 border border-primary-600 rounded-r-lg"
											onBlur={onBlur}
											onChangeText={value =>
												onChange(value)
											}
											value={value}
											placeholder="Last name"
											placeholderTextColor="rgba(0, 0, 0, 0.50)"
										/>
									)}
									name="lastName"
									rules={{ required: true }}
								/>
							</View>
						</View>

						<Text className="m-2 ml-0 mt-4">E-mail address</Text>

						<Controller
							control={control}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									className="w-full px-3 py-3 border border-primary-600 rounded-lg"
									onBlur={onBlur}
									onChangeText={value => onChange(value)}
									value={value}
									placeholder="Enter email"
									placeholderTextColor="rgba(0, 0, 0, 0.50)"
								/>
							)}
							name="email"
							rules={{ required: true }}
						/>

						<Text className="m-2 ml-0 mt-4">Phone number</Text>

						<Controller
							control={control}
							render={({ field: { onChange, value } }) => (
								<PhoneInput
									value={value}
									onChangePhoneNumber={onChange}
									defaultCountry="KE"
									placeholder="700000000"
									selectedCountry={selectedCountry}
									onChangeSelectedCountry={setSelectedCountry}
									phoneInputStyles={{
										container: {
											width: "100%",
											borderColor: "#5E9C8F",
											borderWidth: 1,
											borderRadius: 8,
										},
									}}
								/>
							)}
							name="phone"
							rules={{
								required: {
									value: true,
									message: "Phone number is required",
								},
							}}
						/>
						{errors.phone && (
							<Text className="text-xs text-red-600">
								{errors.phone?.message}
							</Text>
						)}

						<Text className="m-2 ml-0 mt-4">
							ID number/Passsport (optional)
						</Text>

						<Controller
							control={control}
							render={({
								field: { onChange, onBlur, value },
							}) => (
								<TextInput
									className="w-full px-3 py-3 border border-primary-600 rounded-lg"
									onBlur={onBlur}
									onChangeText={value => onChange(value)}
									value={value}
									placeholder="Enter id number"
									placeholderTextColor="rgba(0, 0, 0, 0.50)"
								/>
							)}
							name="idpass"
						/>

						<Text className="m-2 ml-0 mt-4">Gender</Text>

						<RadioButton.Group
							onValueChange={newValue =>
								setValue("gender", newValue)
							}
							value={user.gender}
						>
							<View className="flex flex-row justify-between items-center py-2 space-x-1">
								{["Male", "Female", "Other"].map((g, i) => (
									<Pressable
										key={g}
										onPress={() => setValue("gender", g)}
										className={
											"flex-1 py-2 rounded-lg" +
											(g === user.gender
												? " bg-primary"
												: " bg-primary-200")
										}
									>
										<View className="flex flex-row justify-center items-center">
											<View className="hidden">
												<RadioButton value={g} />
											</View>
											<Icon
												name={
													g === "Male"
														? "gender-male"
														: g === "Female"
														? "gender-female"
														: "gender-male-female"
												}
												color={
													g === user.gender
														? "#fff"
														: "#000"
												}
												size={20}
											/>
											<Text
												className={
													"ml-3 text-base" +
													(g === user.gender
														? " text-white"
														: "")
												}
											>
												{g}
											</Text>
										</View>
									</Pressable>
								))}
							</View>
						</RadioButton.Group>

						<TouchableOpacity
							onPress={handleSubmit(onSubmit)}
							className=" text-white w-full text-capitalize my-4 fixed bottom-0 bg-primary-600 py-3 rounded-lg"
						>
							<Text className="text-white text-lg font-bold text-center">
								{isSubmitting ? "Loading..." : "Create Account"}
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
