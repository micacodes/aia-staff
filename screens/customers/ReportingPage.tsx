import React, { useContext, useEffect, useState } from "react";
import { FlatList, Pressable, SafeAreaView, Text, View } from "react-native";
import { api } from "../../utils/api";
import { ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { AuthContext } from "../../providers/AuthProvider";
import { TextInput } from "react-native";
import { TouchableOpacity } from "react-native";
import {
	SelectList,
	MultipleSelectList,
} from "react-native-dropdown-select-list";

export default function ReportingPage() {
	const { session } = useContext(AuthContext);
	const [notes, setNotes] = useState({
		incident: {
			type: "incident",
			name: "Incident report",
			content: "",
			meta: { checklist: [] },
		},
		shift: {
			type: "shift",
			name: "End of shift",
			content: "",
			meta: { checklist: [] },
		},
	});

	const submitReport = async () => {
		await api.post("notes", {
			staffId: session.id,
			branchId: session.branch.id,
			vendorId: session.vendor.id,
			notes: Object.values(notes),
		});
	};

	return (
		<SafeAreaView className="bg-white py-4 h-full">
			<View className="flex justify-center px-4">
				{Object.keys(notes).map(n => (
					<View key={n}>
						<Text className="my-4 text-lg font-bold">
							{notes[n]["name"]}
						</Text>

						<View className="border border-primary-600 rounded-lg h-48 pl-4 py-1">
							<TextInput
								className="w-full h-full"
								placeholder="Enter notes here"
								multiline
								numberOfLines={9}
								onChangeText={content =>
									setNotes(p => ({
										...p,
										[n]: { ...notes[n], content },
									}))
								}
								style={{
									textAlignVertical: "top",
								}}
							/>
						</View>
					</View>
				))}

				<TouchableOpacity
					onPress={() => submitReport()}
					className="w-full bg-primary-600 rounded-lg px-4 py-4 my-5"
				>
					<Text className="text-center text-white bg-primary-600 rounded-lg">
						Submit reports
					</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
