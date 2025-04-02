import { SafeAreaView } from "react-native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

export default function Language() {
	return (
		<SafeAreaView className="h-full">
			<View className="flex items-center justify-center">
				<FlatList
					data={[
						{ title: "English", onPress: () => {} },
						{ title: "French", onPress: () => {} },
                        {title: "Swahili", onPress: () => {}},
					]}
					renderItem={({ item }) => (
						<TouchableOpacity onPress={item.onPress}>
							<Text>{item.title}</Text>
						</TouchableOpacity>
					)}
                    className="mt-40"
				/>
			</View>
		</SafeAreaView>
	);
}
