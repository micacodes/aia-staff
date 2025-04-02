import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, View } from "react-native";
import { TouchableOpacity } from "react-native";
import { Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ChangePasswordPage({navigation}) {
	const {
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm();
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit = () => {};

	useEffect(() => {
		navigation.setOptions({
			headerTitle: "Change password",
			headerTitleAlign: "center",
			headerTitleStyle: {
				fontSize: 16,
				fontWeight: "bold",
			},
		});
	}, []);

	return (
		<SafeAreaView className="min-h-screen px-4 pb-12 bg-white">
			<Image source={require("../../assets/icon.png")} className="h-40 w-full" resizeMode="contain" />

			<View className="px-4 pt-2">
				<Text className="m-2 ml-0 mt-3">Old password</Text>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								className="w-12/12 px-3 py-3 border border-grey  rounded-lg"
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
								/>
							</TouchableOpacity>
						</View>
					)}
					name="password"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-3">New password</Text>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								className="w-12/12 px-3 py-3 border border-grey  rounded-lg"
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
								/>
							</TouchableOpacity>
						</View>
					)}
					name="password"
					rules={{ required: true }}
				/>

				<Text className="m-2 ml-0 mt-3">Confirm new password</Text>
				<Controller
					control={control}
					render={({ field: { onChange, onBlur, value } }) => (
						<View>
							<TextInput
								className="w-12/12 px-3 py-3 border border-grey  rounded-lg"
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
								/>
							</TouchableOpacity>
						</View>
					)}
					name="confirmPassword"
					rules={{ required: true }}
				/>

				<View className="mt-6 text-white rounded w-full text-capitalize">
					<Pressable
						onPress={handleSubmit(onSubmit)}
						className="bg-primary-500 px-3 py-4 rounded-xl items-center"
					>
						<Text className="text-white">
							{isSubmitting ? "Updating..." : "Update password"}
						</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}
