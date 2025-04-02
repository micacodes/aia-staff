import { useState, useContext, useEffect } from "react";
import {
	Pressable,
	Text,
	View,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	TextInput,
	StatusBar,
	Platform,
} from "react-native";
import {
	useForm,
	Controller,
	SubmitErrorHandler,
	SubmitHandler,
} from "react-hook-form";
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";

import { RadioButton } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "react-native";

export default function AccountPage({ navigation }) {
	const { setSession, logOut, session, sessionToken } =
		useContext(AuthContext);

	const [gender, setGender] = useState("Other");

	StatusBar.setBarStyle("light-content");
	if (Platform.OS === "android") {
		StatusBar.setBackgroundColor("rgba(0,0,0,0)");
		StatusBar.setTranslucent(true);
	}

	const {
		handleSubmit,
		watch,
		control,
		formState: { errors, isSubmitting },
	} = useForm<User>({
		defaultValues: async () => api.get<User>("auth/me"),
	});

	const user = watch();

	const onSubmit: SubmitHandler<User> = async (data: User) => {
		const res = await api.post<User>(`/users/${user.id}`, data);

		if (res.id) {
			setSession({
				sessionToken,
				session: {
					...session,
					firstName: res.firstName,
					lastName: res.lastName,
					email: res.email,
					phone: res.phone,
					avatarUrl: res.avatarUrl,
					id: res.id,
				},
			});
		}
	};

	return (
		<View className="bg-white h-full">
			<Image
				source={{ uri: session.avatarUrl }}
				className="h-40 w-full mt-n4"
				resizeMode="cover"
			/>
			<ScrollView showsVerticalScrollIndicator={false} className="mx-4">
				<View className="flex flex-row items-center w-full rounded-lg mt-3 relative z-50 -mt-42">
					<View className="flex flex-row">
						{user && (
							<Text className="text-lg font-bold">
								{user.firstName} {user.lastName}
							</Text>
						)}
					</View>
				</View>

				<Text className="m-2 ml-0 mt-4">Full name</Text>

				<View className="flex flex-row">
					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								className="flex-1 px-3 py-3 border border-r-0 border-primary-400 rounded-l-lg"
								onBlur={onBlur}
								onChangeText={onChange}
								placeholder="Enter first name"
								placeholderTextColor="rgba(0, 0, 0, 0.50)"
								value={value}
								textContentType="givenName"
							/>
						)}
						name="firstName"
						rules={{ required: true }}
					/>

					<Controller
						control={control}
						render={({ field: { onChange, onBlur, value } }) => (
							<TextInput
								className="flex-1 px-3 py-3 border border-primary-400 rounded-r-lg"
								onBlur={onBlur}
								onChangeText={onChange}
								placeholder="Enter last name"
								placeholderTextColor="rgba(0, 0, 0, 0.50)"
								value={value}
								textContentType="familyName"
							/>
						)}
						name="lastName"
						rules={{ required: true }}
					/>
				</View>

				<Text className="m-2 ml-0 mt-4">Email address</Text>

				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							className="w-full px-3 py-3 border border-primary-400 rounded-lg"
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Enter email address"
							placeholderTextColor="rgba(0, 0, 0, 0.50)"
							value={value}
							textContentType="emailAddress"
						/>
					)}
					name="email"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-4">Phone number</Text>

				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							className="w-full px-3 py-3 border border-primary-400 rounded-lg"
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Enter phone number"
							placeholderTextColor="rgba(0, 0, 0, 0.50)"
							value={value}
							textContentType="telephoneNumber"
						/>
					)}
					name="phone"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-4">National ID number</Text>

				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<TextInput
							className="w-full px-3 py-3 border border-primary-400 rounded-lg"
							onBlur={onBlur}
							onChangeText={onChange}
							placeholder="Enter ID number"
							placeholderTextColor="rgba(0, 0, 0, 0.50)"
							value={value}
							textContentType="telephoneNumber"
						/>
					)}
					name="idpass"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-4">About me</Text>

				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View className="h-24">
							<TextInput
								className="w-full px-3 border border-primary-400 rounded-lg"
								onBlur={onBlur}
								onChangeText={onChange}
								placeholder="Something about you"
								placeholderTextColor="rgba(0, 0, 0, 0.50)"
								value={value}
								multiline
								numberOfLines={4}
								style={{
									textAlignVertical: "top",
								}}
							/>
						</View>
					)}
					name="details"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-4">Gender</Text>

				<RadioButton.Group
					onValueChange={value => setGender(value)}
					value={gender}
				>
					<View className="flex flex-row justify-between items-center pr-6 py-2">
						<View className="flex flex-row justify-center items-center">
							<RadioButton value="Male" />
							<Text>Male</Text>
						</View>
						<View className="flex flex-row justify-center items-center">
							<RadioButton value="Female" />
							<Text>Female</Text>
						</View>
						<View className="flex flex-row justify-center items-center">
							<RadioButton value="Other" />
							<Text>Other</Text>
						</View>
					</View>
				</RadioButton.Group>

				<View className="my-6 text-white rounded w-full text-capitalize">
					<TouchableOpacity
						onPress={handleSubmit(onSubmit)}
						className="bg-primary-600 px-3 py-3 rounded-lg items-center"
					>
						<Text className=" text-white font-bold text-base">
							Update profile
						</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}
