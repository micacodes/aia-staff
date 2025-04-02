import React, { useState } from "react";
import {
	Text,
	SafeAreaView,
	View,
	FlatList,
	TouchableOpacity,
} from "react-native";
import RegisterUser from "../../components/RegisterUser";

export default function OnboardPage({navigation}) {
	const [created, setCreated] = useState<User>();

	return (
		<View className="p-4 bg-primary-50 h-full">
			{created ? (
				<FlatList
					data={[
						{ title: "View orders", onPress: () => navigation.navigate("OrdersPage") },
						{ title: "View products", onPress: () => navigation.navigate("Products") },
						{ title: "View profile", onPress: () => {} },
						{ title: "View payments", onPress: () => {} },
						{ title: "New order", onPress: () => {} },
						{ title: "New reservation", onPress: () => {} },
						{ title: "Add another customer", onPress: () => setCreated(undefined) },
					]}
					numColumns={2}
					key={2}
					columnWrapperStyle={{
						gap: 5,
					}}
					contentContainerStyle={{gap: 5}}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<TouchableOpacity 
						onPress={item.onPress}
						className="bg-primary-200 p-4 rounded-lg border border-primary-200 flex-1 h-40 flex items-center justify-center"
						>
							<Text className="text-base font-bold">{item.title}</Text>
						</TouchableOpacity>
					)}
				/>
			) : (
				<RegisterUser searching onCreated={setCreated} />
			)}
		</View>
	);
}
