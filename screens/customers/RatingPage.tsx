import React, { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { api } from "../../utils/api";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import { Rating } from "react-native-ratings";
import PhoneInput, { ICountry } from "react-native-international-phone-number";

export default function RatingPage({ navigation }) {
	const [customers, setCustomers] = useState<User[]>([]);
	const [customer, setCustomer] = useState<User>(null);
	const [adding, setAdding] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState<ICountry>();
	const [s, setS] = useState<string>("");
	const [ratings, setRatings] = useState<Record<string, any>>({
		sloading:{'name': 'Spending', points: 1},
		character: {'name': 'Character', points: 1},
		tipping: {'name': 'Tipping', points: 1},}
		)

	useEffect(() => {
		navigation.setOptions({
			title: customer ? `Rate ${customer.firstName}` : "Rate customer",
		});
	}, [customer]);

	useEffect(() => {
		if (s.length > 8) {
			const phone = selectedCountry?.callingCode + s.replace(/\s/g, "");
			console.log(phone);
			api.get<PaginatedData<User>>(`users`, {
				phone: phone.replace("+", ""),
			}).then(({ data }) => {
				setCustomers(data);
			});
		}
	}, [s]);

	const rateCustomer = async () => {
		await api.post('customer-ratings', {
			customerId: customer.id,
			ratings: Object.values(ratings)
		})
	}

	return (
		<SafeAreaView className="bg-primary-50 py-4 h-screen flex-1">
			<View className="flex justify-center">
				<View className="flex items-center justify-center my-2 px-4">
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

				{!customer && (
					<View className="px-6 my-4">
						{customers.map(c => (
							<TouchableOpacity
								key={c.id}
								onPress={() => setCustomer(c)}
							>
								<Text>
									{c.firstName} {c.lastName}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				)}

				{customer && <>
					{Object.keys(ratings).map(r => <View key={r}>
						<Text className="mx-4 text-xl font-bold my-3">
							{ratings[r].name}
						</Text>

						<View>
							<Rating
								type="custom"
								ratingCount={5}
								startingValue={ratings[r].points}
								imageSize={48}
								showRating={false}
								ratingColor="#5E9C8F"
								ratingBackgroundColor="#CCE0DC"
								tintColor="#F2F7F6"
								jumpValue={0.5}
								onFinishRating={(points) => setRatings((p) => ({...p, [r]: {...ratings[r], points}}))}
							/>
						</View>
					</View>
				)}

				<View className="px-4 mt-5">
					<Pressable 
					onPress={() => rateCustomer()}
					className="bg-primary-600 py-4 rounded-lg">
						<Text className="text-center text-white text-base font-bold">
							Submit
						</Text>
					</Pressable>
				</View>
				</>}
			</View>
		</SafeAreaView>
	);
}
