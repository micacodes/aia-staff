import { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image, TouchableOpacity, TextInput } from "react-native";
import {
	useForm,
	Controller,
	SubmitErrorHandler,
	SubmitHandler,
} from "react-hook-form";
import { Link } from "@react-navigation/native";
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";

type AuthData = { username: string; password: string };

type AuthUser = {
	expiresAt: string;
	meta: {};
	name: string;
	token: string;
	tokenHash: string;
	type: "bearer";
	user: {
		about: null;
		avatar: string | null;
		avatarUrl: string;
		createdAt: string;
		deletedAt: null;
		dob: null;
		email: string;
		firstName: string;
		gender: null;
		geom: null;
		id: string;
		initials: string;
		lastName: string;
		location: null;
		name: string;
		phone: string;
		rememberMeToken: null;
		socialProvider: null;
		socialProviderId: null;
		status: string;
		updatedAt: string;
	};
};

export default function ForgotPasswordPage({ navigation }) {
	const { setSession } = useContext(AuthContext);
	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<AuthData>();
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit: SubmitHandler<AuthData> = async (data: AuthData) => {
		const res = await api.post<AuthUser>("/auth/password/forgot", data);

		if (res.token) {

			setTimeout(() => {
				navigation.navigate("Home");
			}, 1000);
		}
	};

	const onError: SubmitErrorHandler<any> = (errors, e) => {
		return console.log(errors);
	};

	return (
		<View className="flex-1 justify-center bg-gray-100 px-6">
			<View className="flex justify-center items-center mb-14">
				<Image
					className="h-28 w-28"
					source={require("../../assets/icon.png")}
				/>
			</View>

			<Text className="text-2xl mb-1">
				Forgot password?
			</Text>
			<Text className="text-lg text-slate-500">
				No worries, we got you!
			</Text>
			<StatusBar style="auto" />

			<Text className="m-2 ml-0 mt-4">Enter your email or phone</Text>

			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="w-full px-3 py-3 border rounded-lg"
						onBlur={onBlur}
						onChangeText={onChange}
						placeholder="Email or phone"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
						value={value}
					/>
				)}
				name="username"
				rules={{ required: true }}
			/>

			<View className="mt-6 text-white rounded w-full text-capitalize">
				<TouchableOpacity
					onPress={handleSubmit(onSubmit)}
					className="bg-primary-700 px-3 py-4 rounded-xl items-center"
				>
					<Text className="text-white text-base font-bold">
						{isSubmitting ? "Loading..." : "Get reset link"}
					</Text>
				</TouchableOpacity>
			</View>

			<Text className="my-8 text-[16px] text-center">
				Remembered password?
				<Link to="/Login">
					<Text className="text-primary-600 ml-2 text-[16px]">
						{" "}
						Login now
					</Text>
				</Link>
			</Text>
		</View>
	);
}
