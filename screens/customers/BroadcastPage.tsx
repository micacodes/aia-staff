import React, { useEffect, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import {
	Text,
	TouchableOpacity,
	View,
	Modal,
	SafeAreaView,
	ScrollView,
	Pressable,
	FlatList,
} from "react-native";
import {
	SelectList,
	MultipleSelectList,
} from "react-native-dropdown-select-list";
import { AuthContext } from "../../providers/AuthProvider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api } from "../../utils/api";
import { format } from "date-fns";

const BroadcastPage = ({ navigation }) => {
	const { session } = useContext(AuthContext);
	const [customers, setCustomers] = useState<User[]>([]);
	const [groups, setGroups] = useState<{ key: string; value: string }[]>([]);
	const [creating, setCreating] = useState(false);
	const {
		handleSubmit,
		watch,
		control,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<{
		id?: string;
		type: string;
		receipients: string[];
		groups: string[];
		channels: string[];
		templateId: string;
		message: string;
		branchId: string;
		vendorId: string;
		userId: string;
	}>({
		defaultValues: {
			type: "",
			receipients: [],
			groups: [],
			channels: [],
			templateId: "",
			message: "",
			branchId: session?.branch?.id,
			vendorId: session?.vendor?.id,
			userId: session?.id,
		},
	});

	const broadcast = watch();

	const [templates, setTemplates] = useState<
		{
			key: string;
			value: string;
			content: string;
		}[]
	>([]);

	const [messages, setMessages] = useState<Message[]>([]);

	const loadMessages = () => {
		api.get<PaginatedData<Message>>("messages").then(({ data }) =>
			setMessages(data)
		);
	};

	const sendMessage = async () => {
		try {
			await api.post("messages", broadcast);
			loadMessages();
			setCreating(false);
		} catch (error) {
			console.error(error);
		}
	};

	useEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<TouchableOpacity
					onPress={() => setCreating(true)}
					className="bg-primary-600 rounded-full p-1"
				>
					<Icon name="plus" size={24} color="white" />
				</TouchableOpacity>
			),
		});

		api.get<PaginatedData<CustomerGroup>>(
			`branches/${session?.branch?.id}/groups`
		).then(({ data }) =>
			setGroups(data.map(g => ({ key: g.id, value: g.name })))
		);

		loadMessages();

		api.get<PaginatedData<MessageTemplate>>("message-templates").then(
			({ data }) => {
				setTemplates(
					data.map(template => ({
						key: template.id,
						value: template.name,
						content: template.content,
					}))
				);
			}
		);
	}, []);

	return (
		<SafeAreaView className="bg-gray-100 h-full">
			<FlatList
				className="px-4 pt-4 bg-white h-full"
				data={messages}
				renderItem={({ item: msg }) => (
					<View className=" bg-white rounded-2xl border border-primary-600 min-h-20 mb-2">
						<View className="flex flex-1 flex-row py-3 space-x-2 ml-2">
							<View className="w-1/4 border border-primary-600 rounded-lg flex justify-center items-center py-2">
								<Text
									className="font-bold text-uppercase text-lg"
									style={{ textTransform: "uppercase" }}
								>
									{format(new Date(msg.createdAt), "MMM")}
								</Text>
								<Text className="text-bold font-bold text-lg">
									{format(new Date(msg.createdAt), "dd")}
								</Text>
							</View>

							<View className="flex-1 pr-2">
								<Text className="text-base font-bold">
									{msg.template?.name}
								</Text>
								<Text>{msg.template?.content}</Text>

								<View className="flex flex-row space-x-1 justify-end">
									<Text>By</Text>
									<Text className="font-bold">
										{msg.author?.name}
									</Text>
								</View>
							</View>
						</View>

						<View className="flex flex-row w-full rounded-b-xl z-10">
							<TouchableOpacity
								onPress={() => {
									setValue('id', msg.id);
									setValue("type", "individual");
									// setValue("receipients", [
									// 	msg.receipient?.id,
									// ]);
									setValue("templateId", msg.template?.id);
									setValue("message", msg.template?.content);
									// setValue("channels", msg.channels);
									setCreating(true);
								}}
								className="flex-1 border-primary-400 px-4 py-2 flex flex-row justify-center items-center bg-primary-600 text-center rounded-b-xl"
							>
								<Text className="text-white font-bold text-center">
									Resend
								</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
				keyExtractor={item => `message-${item.id}`}
				contentContainerStyle={{ gap: 5 }}
			/>

			{creating && (
				<Modal>
					<ScrollView>
						<View className="h-full flex justify-center px-4 mt-8">
							<View className="flex flex-row justify-end">
								<Pressable
									onPress={() => setCreating(false)}
									className="bg-red-500 h-10 w-10 flex justify-center items-center rounded-full"
								>
									<Icon
										name="close"
										size={24}
										color="white"
									/>
								</Pressable>
							</View>
							<View>
								<Text className="my-4">Select type</Text>

								<View>
									<SelectList
										setSelected={type =>
											setValue("type", type)
										}
										data={[
											{
												key: "all",
												value: "All customers",
											},
											{
												key: "groups",
												value: "Customer groups",
											},
											{
												key: "individual",
												value: "Individual customers",
											},
										]}
										save="key"
										placeholder="Select broadcast type"
										boxStyles={{ borderColor: "#5e9c8f" }}
										dropdownStyles={{
											borderColor: "#5e9c8f",
										}}
									/>
								</View>
							</View>

							{broadcast.type === "individual" && (
								<View>
									<Text className="my-4">
										Select receipient(s)
									</Text>

									<View>
										<MultipleSelectList
											setSelected={receipients =>
												setValue(
													"receipients",
													receipients
												)
											}
											data={[
												{
													key: "1",
													value: "Mauko Maunde",
												},
											]}
											save="key"
											label="Food type"
											placeholder="Search for customer(s)"
											boxStyles={{
												borderColor: "#5e9c8f",
											}}
											dropdownStyles={{
												borderColor: "#5e9c8f",
											}}
										/>
									</View>
								</View>
							)}

							{broadcast.type === "groups" && (
								<View>
									<Text className="my-4">
										Select group(s)
									</Text>

									<View>
										<MultipleSelectList
											setSelected={d =>
												setValue("groups", d)
											}
											data={groups}
											save="key"
											label="Group"
											placeholder="Search for group(s)"
											boxStyles={{
												borderColor: "#5e9c8f",
											}}
											dropdownStyles={{
												borderColor: "#5e9c8f",
											}}
										/>
									</View>
								</View>
							)}

							{!broadcast.id && (
								<>
									<Text className="my-4">
										Select a message template
									</Text>
									<SelectList
										setSelected={template =>
											setValue("templateId", template)
										}
										data={templates}
										save="key"
										placeholder="Message template"
										onSelect={() =>
											setValue(
												"message",
												templates.find(
													template =>
														template.key ===
														broadcast.templateId
												)?.content
											)
										}
										boxStyles={{ borderColor: "#5e9c8f" }}
										dropdownStyles={{
											borderColor: "#5e9c8f",
										}}
									/>
								</>
							)}

							{broadcast.message && (
								<Text className="my-4">
									{broadcast.message}
								</Text>
							)}

							<View>
								<Text className="my-4">Select channel(s)</Text>

								<View>
									<MultipleSelectList
										setSelected={channels =>
											setValue("channels", channels)
										}
										data={[
											{ key: "sms", value: "SMS" },
											{ key: "mail", value: "Email" },
											{
												key: "whatsapp",
												value: "WhatsApp",
											},
											{
												key: "telegram",
												value: "Telegram",
											},
											{
												key: "facebook",
												value: "Facebook",
											},
										]}
										save="key"
										label="Food type"
										placeholder="Search for channel(s)"
										boxStyles={{ borderColor: "#5e9c8f" }}
										dropdownStyles={{
											borderColor: "#5e9c8f",
										}}
									/>
								</View>
							</View>

							<TouchableOpacity
								onPress={sendMessage}
								className="flex flex-row items-center justify-center mt-4 mb-2 bg-primary-600 py-4 rounded-lg"
							>
								<Text className="text-white font-bold">
									Send message
								</Text>
							</TouchableOpacity>
						</View>
					</ScrollView>
				</Modal>
			)}
		</SafeAreaView>
	);
};

export default BroadcastPage;
