import { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useToast } from "react-native-toast-notifications";
import {
	Text,
	View,
	Image,
	TouchableOpacity,
	TextInput,
	Pressable,
} from "react-native";
import {
	useForm,
	Controller,
	SubmitErrorHandler,
	SubmitHandler,
} from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";
import { Checkbox } from "react-native-paper";

type AuthData = { username: string; password: string; identifier: string };

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
	vendor?: Vendor;
	branch?: Branch;
};

const initialState = {
	remember: false,
};

export default function LoginPage({ navigation }) {
	const { setSession } = useContext(AuthContext);
	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<AuthData>();
	const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

	const toast = useToast();

	const onSubmit: SubmitHandler<AuthData> = async (data: AuthData) => {
		// toast.show("Logging in...", {
		// 	type: "success",
		// });

		const res = await api.post<AuthUser>("auth/login/staff", data);

		console.log(res);

		if (res.token) {
			setSession({
				sessionToken: res.token,
				session: {
					firstName: res.user.firstName,
					lastName: res.user.lastName,
					email: res.user.email,
					phone: res.user.phone,
					avatarUrl: res.user.avatarUrl,
					id: res.user.id,
					vendor: res.vendor,
					branch: res.branch,
				},
			});

			setTimeout(() => {
				navigation.navigate("Home");
			}, 1000);
		}
	};

	const onError: SubmitErrorHandler<any> = (errors, e) => {
		return console.log(errors);
	};

	return (
		<View className="flex-1 justify-center bg-gray-100 px-6 ">
			<View className="flex justify-center items-center mb-14">
				<Image
					className="h-28 w-28"
					source={require("../../assets/icon.png")}
				/>
			</View>

			<Text className="text-2xl mb-1 text-center">
				Welcome to AppInApp
			</Text>
			<Text className="text-base text-slate-500 text-center">
				Sign in to your account below
			</Text>
			<StatusBar style="auto" />

			<Text className="m-2 ml-0 mt-4 text-primary-900">
				Email, phone or username
			</Text>

			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="w-full px-3 py-3 border border-primary-600 rounded-lg"
						onBlur={onBlur}
						onChangeText={onChange}
						placeholder="Email, phone or username"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
						value={value}
					/>
				)}
				name="username"
				rules={{ required: true }}
			/>

			<Text className="m-2 ml-0 mt-4">Staff ID</Text>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						className="w-full px-3 py-3 border border-primary-600 rounded-lg"
						onBlur={onBlur}
						onChangeText={onChange}
						placeholder="Staff ID for employer"
						placeholderTextColor="rgba(0, 0, 0, 0.50)"
						value={value}
					/>
				)}
				name="identifier"
				rules={{ required: true }}
			/>

			<Text className="m-2 ml-0 mt-3">Account password</Text>
			<Controller
				control={control}
				render={({ field: { onChange, onBlur, value } }) => (
					<View>
						<TextInput
							className="w-12/12 px-3 py-3 border border-primary-600  rounded-lg"
							onBlur={onBlur}
							onChangeText={onChange}
							secureTextEntry={!showPassword}
							placeholder="Account password"
							placeholderTextColor="rgba(0, 0, 0, 0.50)"
							value={value}
						/>
						<TouchableOpacity
							onPress={() => setShowPassword(!showPassword)}
							className="absolute right-0 top-0 bottom-0 flex items-center justify-center mr-3"
						>
							<Icon
								name={showPassword ? "eye-off" : "eye"}
								size={20}
                color="#5E9C8F"
							/>
						</TouchableOpacity>
					</View>
				)}
				name="password"
				rules={{ required: true }}
			/>

			<View className="flex flex-row justify-between mt-3 items-center">
				<View className="flex flex-row justify-between items-center">
          <Checkbox 
            status={remember ? 'checked' : 'unchecked'}
            onPress={() => {
              setRemember(!remember);
            }}
            color="#5E9C8F"
           />
					<Text className="">Remember me</Text>
				</View>

				<Pressable
					onPress={() => navigation.navigate("ForgotPasswordPage")}
				>
					<Text className="text-primary-600">Forgot password</Text>
				</Pressable>
			</View>

			<View className="mt-6 text-white rounded w-full text-capitalize">
				<TouchableOpacity
					onPress={handleSubmit(onSubmit)}
					className="bg-primary-600 px-3 py-4 rounded-xl items-center"
				>
					<Text className="text-white font-bold text-base">
						{isSubmitting ? "Processing..." : "Login"}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}
