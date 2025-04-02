import { useContext } from "react";
import { AuthContext } from "../../providers/AuthProvider";
import {
	Image,
	Pressable,
	SafeAreaView,
	ScrollView,
	Text,
	View,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

export default function Profile({ navigation }) {
	const { session, logOut } = useContext(AuthContext);

	return (
		<SafeAreaView className="min-h-screen px-4 bg-primary-50">
			<ScrollView
				className="px-4 py-5"
				showsVerticalScrollIndicator={false}
			>
				<View className="flex  items-center mx-4 py-6">
					<View className="w-1/5">
						<Image
							source={{ uri: session.avatarUrl }}
							height={70}
							width={70}
							className="rounded-full"
						/>
					</View>
					<View className="flex-1 justify-center items-center">
						<Text className="text-lg font-bold">
							Hi {session.firstName},
						</Text>
						<Text className="">{session.email}</Text>
					</View>
				</View>


				<Pressable
					onPress={() => navigation.navigate("Account")}
					className="w-full flex flex-row justify-between items-center bg-primary-200 px-2 py-4 rounded-2xl"
				>
					<View className="flex flex-row items-center">
						<Icon name="user" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								My account
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>

				<Pressable
					onPress={() => navigation.navigate("Password")}
					className="w-full flex flex-row justify-between items-center mt-4 bg-primary-200 px-2 py-4 rounded-2xl"
				>
					<View className="flex flex-row items-center">
						<Icon name="lock" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								Change password
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>

				<Pressable
					onPress={() => navigation.navigate("Ratings")}
					className="w-full flex flex-row justify-between items-center mt-4 bg-primary-200 px-2 py-4 rounded-2xl"
				>
					<View className="flex flex-row items-center">
						<Icon name="staro" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								View my ratings
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>



				<Pressable
					onPress={() => navigation.navigate("Help")}
					className="w-full flex flex-row justify-between items-center bg-primary-200 px-2 py-4 rounded-2xl mt-4"
				>
					<View className="flex flex-row items-center">
						<Icon name="customerservice" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								Help and support
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>


				<Pressable
					onPress={() => navigation.navigate("Language")}
					className="w-full flex flex-row justify-between items-center mt-4 bg-primary-200 px-2 py-4 rounded-2xl"
				>
					<View className="flex flex-row items-center">
						<Icon name="flag" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								Language
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>

				<Pressable
					onPress={logOut}
					className="w-full flex flex-row justify-between items-center bg-primary-200 px-2 py-4 rounded-2xl my-4"
				>
					<View className="flex flex-row items-center">
						<Icon name="logout" size={30} />
						<View className="ml-4">
							<Text className="font-semibold text-lg">
								Logout
							</Text>
						</View>
					</View>
					<View className="flex flex-row items-center">
						<Icon name="arrowright" size={20} />
					</View>
				</Pressable>
			</ScrollView>
		</SafeAreaView>
	);
}
