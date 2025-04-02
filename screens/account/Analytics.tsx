import { SafeAreaView, View, Text, FlatList } from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function Analytics() {
	const barData = [
		{ value: 250, label: "M" },
		{ value: 500, label: "T", frontColor: "#5E9C8F" },
		{ value: 745, label: "W", frontColor: "#5E9C8F" },
		{ value: 320, label: "T" },
		{ value: 600, label: "F", frontColor: "#5E9C8F" },
		{ value: 256, label: "S" },
		{ value: 300, label: "S" },
	];

	const reportsData = [
		{value: 300, label: "Orders completed today"},
		{value: 0, label: "Orders cancelled today"},
		{value: 3900, label: "Orders today"},
		{value: 3400, label: "Total tips today"},
		{value: 300, label: "Orders completed today"},
	]

	return (
		<SafeAreaView className="bg-primary-50 h-full">
			<View className="px-4 space-y-3">
				<View className="flex mt-5">
					<FlatList
						data={reportsData}
						renderItem={({ item }) => (
							<View className="flex-1 bg-primary-300 rounded-lg flex justify-center items-center h-20 shadow-sm px-3">
								<Text className="text-center">{item.label}</Text>
								<Text className="text-xl">{item.value}</Text>
							</View>
						)}
						keyExtractor={(item, index) => index.toString()}
						numColumns={2}
						key={2}
						contentContainerStyle={{ gap: 8 }}
						columnWrapperStyle={{ gap: 8 }}
					/>
				</View>

				<BarChart
					barWidth={22}
					noOfSections={3}
					barBorderRadius={4}
					frontColor="lightgray"
					data={barData}
					yAxisThickness={0}
					xAxisThickness={0}
				/>
			</View>
		</SafeAreaView>
	);
}
