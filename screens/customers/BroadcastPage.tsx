// src/screens/customers/BroadcastPage.tsx
// (Replace entire file content)

import React, { useEffect, useState, useContext, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
	StyleSheet, Text, TouchableOpacity, View, Modal, SafeAreaView,
	ScrollView, Pressable, FlatList, Alert, ActivityIndicator, TextInput
} from "react-native";
import { SelectList, MultipleSelectList } from "react-native-dropdown-select-list";
import { AuthContext, AuthContextType } from "../../providers/AuthProvider"; // Adjust path
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Using MaterialCommunityIcons
import { api } from "../../utils/api"; // Adjust path
import { format, isValid } from "date-fns";

// --- Type Definitions ---
interface User { id: string; name?: string; } // Simple User type
interface MessageTemplate { id: string | number; name: string; content: string; } // id can be string or number
interface CustomerGroup { id: string; name: string; }
interface Message {
    id: string | number; // id can be string or number
    createdAt: string | number | Date;
    template?: MessageTemplate | null;
    author?: User | null;
    // Note: Recipient info isn't in the base message object from your logs
    // We might need 'type', 'target_groups', 'target_recipients' fields if backend adds them
    channels?: string[]; // Added channels to Message type based on modal usage
}
// Type for API responses that might be paginated OR direct arrays
interface PaginatedData<T> { data: T[]; meta?: any; links?: any; }
// type ListApiResponse<T> = PaginatedData<T> | T[]; // NO LONGER NEEDED

// Form data structure
interface BroadcastFormData {
    id?: string | number; // For resending
    type: string; // 'all', 'groups', 'individual'
    receipients: string[]; // Array of customer IDs
    groups: string[]; // Array of group IDs
    channels: string[]; // Array of channel names ('sms', 'mail', 'whatsapp', 'in-app')
    templateId: string | number | null; // Can be null initially
    message: string; // Content from template
    // Contextual IDs
    branchId?: string;
    vendorId?: string;
    userId?: string; // Author ID
}
// --- End Types ---


export default function BroadcastPage({ navigation }) {
	// console.log("[BroadcastPage] Rendering START");
	const { session } = useContext<AuthContextType>(AuthContext);

	// State
	const [customers, setCustomers] = useState<User[]>([]); // TODO: Implement fetching customers
	const [groups, setGroups] = useState<{ key: string; value: string }[]>([]);
	const [creating, setCreating] = useState(false); // Modal visibility
	const [templates, setTemplates] = useState<{ key: string | number; value: string; content: string }[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);

	// React Hook Form setup
	const {
		handleSubmit, watch, control, setValue, reset,
		formState: { errors, isSubmitting },
	} = useForm<BroadcastFormData>({
		// Default values - ensure they match the form fields
		defaultValues: {
            type: "", receipients: [], groups: [], channels: [],
            templateId: null, message: "",
            branchId: session?.branch?.id ?? undefined, // Set from session
            vendorId: session?.vendor?.id ?? undefined, // Set from session
            userId: session?.id ?? undefined,          // Set from session
            id: undefined, // No message ID initially
        },
	});

	const broadcast = watch(); // Watch form values for dynamic UI

    // Effect to set default context IDs when session changes
    useEffect(() => {
        if (session?.branch?.id || session?.vendor?.id || session?.id) {
            // Reset relevant fields if needed when session loads/changes
            reset(currentFormValues => ({
                ...currentFormValues, // Keep existing form data
                branchId: session.branch?.id ?? currentFormValues.branchId,
                vendorId: session?.vendor?.id ?? currentFormValues.vendorId,
                userId: session?.id ?? currentFormValues.userId,
            }), { keepDefaultValues: true }); // Avoid overwriting user input unnecessarily unless intended
        }
    }, [session, reset]);


	// Fetches the list of messages
	const loadMessages = useCallback(() => {
        console.log("[BroadcastPage] loadMessages: Fetching...");
        api.get<Message[]>("messages") // Expect Paginated or Array  //Changed from ListApiResponse<Message>
            .then(({ data: responseData }) => {  // data has changed
                console.log("[BroadcastPage] loadMessages: RAW Response:", responseData);
                // Handle both direct array and paginated {data: [...]}
                if (Array.isArray(responseData)) {
                    console.log(`[BroadcastPage] loadMessages: Processing ${responseData.length} messages.`);
                    setMessages(responseData);  // Changed
                } else {
                    console.warn("[BroadcastPage] loadMessages: Received invalid structure:", responseData);
                    setMessages([]); // Set empty on invalid structure
                }
            })
            .catch(error => {
                console.error("[BroadcastPage] loadMessages: Error fetching messages:", error);
                setMessages([]); // Set empty on error
            });
	}, []); // No dependencies needed if it doesn't rely on external state

    // Fetch Customer Groups
    const loadGroups = useCallback(() => {
        console.log("[BroadcastPage] loadGroups: Fetching...");
        if (session?.branch?.id && session?.id) {
            api.get<CustomerGroup[]>("customer-groups")  // Use the new endpoint.  // Changed from ListApiResponse<CustomerGroup>
                .then(({ data: responseData }) => { // Changed
                    console.log("[BroadcastPage] Groups API Response:", responseData);
                    if (Array.isArray(responseData)) {
                        console.log(`[BroadcastPage] Processing ${responseData.length} groups.`); // Changed
                        setCustomerGroups(responseData);  // Store the fetched groups
                        setGroups(responseData.map(g => ({ key: g.id, value: g.name }))); // Changed
                    } else {
                        console.warn("[BroadcastPage] Invalid structure for groups:", responseData);
                        setCustomerGroups([]);
                        setGroups([]);
                    }
                })
                .catch(error => {
                    console.error("[BroadcastPage] Error fetching groups:", error);
                    setCustomerGroups([]);
                    setGroups([]);
                });
        } else {
            setCustomerGroups([]); // Clear if session is missing
            setGroups([]);
        }
    }, [session]);


	// Sends the broadcast message via API POST
	const sendMessage = async (formData: BroadcastFormData) => { // Receive validated data from handleSubmit
        // Client-side validation (already good)
        if (!formData.type || !formData.message || !formData.channels?.length) { Alert.alert("Missing Info", "Type, message, and channel(s) required."); return; }
        if (formData.type === 'groups' && !formData.groups?.length) { Alert.alert("Missing Info", "Select at least one group."); return; }
        if (formData.type === 'individual' && !formData.receipients?.length) { Alert.alert("Missing Info", "Select at least one recipient."); return; }
        // Allow sending without template if message exists (e.g., for resend maybe?) - adjust if template always needed
        // if (!formData.id && !formData.templateId) { Alert.alert("Missing Info", "Please select a message template."); return; }

		try {
			console.log("[BroadcastPage] sendMessage: Sending data:", formData);
			// Use the correct API endpoint for sending/resending messages
			// If resending uses PUT/PATCH, adjust method and URL
			const apiCall = formData.id
                ? api.put(`messages/${formData.id}`, formData) // Example: PUT for resend/update
                : api.post("messages", formData);              // POST for new message

            await apiCall;

            Alert.alert("Success", `Broadcast message ${formData.id ? 'resent' : 'sent'} successfully.`);
			loadMessages(); // Refresh the list
			setCreating(false); // Close modal
		} catch (error: any) { // Added type annotation
			console.error("[BroadcastPage] sendMessage: Error:", error);
            Alert.alert("Error", `Failed to ${formData.id ? 'resend' : 'send'} broadcast message.`);
            if (error.response) { console.error("API Error Response:", error.response.data); }
		}
	};

	// Main useEffect for initial data loading and setting header
	useEffect(() => {
        console.log("[BroadcastPage] Mount/Session Effect Running");
        const canCreateTemplates = session?.role === 'admin' || session?.role === 'vendor_admin';
		navigation.setOptions({
			headerRight: () => ( // Add New button
                <TouchableOpacity
					onPress={() => {
                        console.log("[BroadcastPage] Opening 'Create New' modal.");
                        // Reset form fully for new message, keeping context IDs
                        reset({
                            type: "", receipients: [], groups: [], channels: [], templateId: null, message: "",
                            branchId: session?.branch?.id ?? undefined, vendorId: session?.vendor?.id ?? undefined, userId: session?.id ?? undefined,
                            id: undefined // Ensure no ID for new message
                        });
                        setCreating(true); // Open modal
                    }}
					className="bg-primary-600 rounded-full p-1" style={{ marginRight: 15 }}
				>
					<Icon name="plus" size={24} color="white" />
				</TouchableOpacity>
			),
		});

		// Fetch data only if session context IDs are available
		if (session?.branch?.id && session?.id) {
			console.log("[BroadcastPage] Session ready, fetching lists...");

			// --- Fetch Groups ---
            loadGroups();  // Use the new loadGroups function

			// --- Fetch Messages ---
			loadMessages(); // Fetch initial messages

			// --- Fetch Templates - Role-Based Logic ---
            let templateFetchURL = "message-templates"; // Default

            if (session?.role === 'vendor_admin' && session?.vendor?.id) {
                templateFetchURL = `vendors/${session.vendor.id}/message-templates`;
            } else if (session?.role === 'manager' && session?.vendor?.id) {
                templateFetchURL = `vendors/${session.vendor.id}/message-templates?managed=true`;
            }
            // else if (session?.role === 'admin') {
            //     templateFetchURL = "message-templates"; // Admin fetches all (default)
            // }
            // No changes needed if admin fetches everything without a vendor filter.
            console.log("[BroadcastPage] Fetching templates from:", templateFetchURL);

			api.get<MessageTemplate[]>(templateFetchURL)
				.then(({ data: responseData }) => { // Changed from ListApiResponse<MessageTemplate>
                    console.log("[BroadcastPage] Templates API Response:", responseData);
                    if (Array.isArray(responseData)) {
                        console.log(`[BroadcastPage] Processing ${responseData.length} templates.`);
                        setTemplates(responseData.map(t => ({ key: t.id, value: t.name, content: t.content })));  // Changed
                    } else {
                        console.warn("[BroadcastPage] Invalid structure for templates:", responseData);
                        setTemplates([]);
                    }
				})
                .catch(error => { console.error("[BroadcastPage] Error fetching templates:", error); setTemplates([]); });

            // --- TODO: Fetch Customers ---
            // api.get<ListApiResponse<User>>('/customers') // Or your customer endpoint
            //    .then(({ data: responseData }) => {
            //        const customerList = Array.isArray(responseData) ? responseData : responseData?.data;
            //        if (Array.isArray(customerList)) {
            //            console.log(`[BroadcastPage] Processing ${customerList.length} customers.`);
            //            setCustomers(customerList); // Assuming User type matches needed structure
            //        } else { // ... error handling ... }
            //    }).catch(error => { // ... error handling ... });


		} else {
			 console.log("[BroadcastPage] Waiting for session data...");
             setGroups([]); setMessages([]); setTemplates([]); setCustomers([]); // Clear data if session is missing
		}
	// Dependencies: Run when session or navigation changes. loadMessages/reset are stable.
	}, [session, navigation, loadMessages, reset, loadGroups]);  // Add loadGroups to dependencies


    // --- Render Item Function for FlatList ---
    const renderMessageItem = useCallback(({ item: msg }: { item: Message }) => {
        // Defensive checks
        if (!msg?.id || !msg.createdAt) { return null; }

        let formattedMonth = 'ERR'; let formattedDay = 'ERR';
        try {
            const createdDate = new Date(msg.createdAt);
            if (isValid(createdDate)) {
                formattedMonth = format(createdDate, "MMM");
                formattedDay = format(createdDate, "dd");
            } else { console.warn("Invalid date:", msg.createdAt); }
        } catch (e) { console.error("Date format error:", e); }

        return (
            <View className="bg-white rounded-2xl border border-primary-600 mb-2 overflow-hidden shadow-sm">
               {/* Top section: Date, Content, Author */}
               <View className="flex flex-row py-3 px-2 space-x-2">
                    {/* Date Box */}
                    <View className="w-1/5 border border-primary-600 rounded-lg flex justify-center items-center py-2 aspect-square bg-gray-50">
                        <Text className="font-bold text-primary-700 text-uppercase text-base" style={{ textTransform: "uppercase" }}>{formattedMonth}</Text>
                        <Text className="font-bold text-primary-700 text-xl">{formattedDay}</Text>
                    </View>
                    {/* Content Area */}
                    <View className="flex-1 pr-1 justify-between">
                        <View>
                            <Text className="text-base font-semibold text-gray-800 mb-1" numberOfLines={1}>{msg.template?.name ?? 'N/A'}</Text>
                            <Text className="text-sm text-gray-600 mb-1" numberOfLines={2}>{msg.template?.content ?? 'No Content'}</Text>
                             {/* --- Recipient Info Placeholder --- */}
                             {/* <Text className="text-xs text-gray-400 italic">Recipient info not available in list view.</Text> */}
                        </View>
                        <View className="flex-row justify-end items-center mt-1">
                            <Text className="text-xs text-gray-500">By: </Text>
                            <Text className="font-semibold text-xs text-gray-700">{msg.author?.name ?? 'System'}</Text>
                        </View>
                    </View>
                </View>
               {/* Bottom Action Bar */}
               <View className="flex flex-row w-full border-t border-gray-200">
                    <TouchableOpacity
                        onPress={() => {
                            console.log("[BroadcastPage] Resend button pressed for message:", msg.id);
                            // Ensure required data exists before opening modal
                            if (msg?.template?.id && msg.template?.content) {
                                // Pre-fill form for resend
                                reset({
                                    id: msg.id, // Set message ID to indicate resend/update
                                    type: "individual", // Sensible default, user can change
                                    templateId: msg.template.id,
                                    message: msg.template.content,
                                    receipients: [], // Clear recipients for resend selection
                                    groups: [], // Clear groups for resend selection
                                    channels: msg.channels ?? [], // Pre-fill channels if available
                                    // Keep context IDs
                                    branchId: session?.branch?.id ?? undefined,
                                    vendorId: session?.vendor?.id ?? undefined,
                                    userId: session?.id ?? undefined,
                                });
                                setCreating(true); // Open modal
                            } else {
                                console.warn("[BroadcastPage] Cannot resend message, missing data:", msg);
                                Alert.alert("Error", "Cannot resend, message data incomplete.");
                            }
                        }}
                        className="flex-1 px-4 py-2 flex flex-row justify-center items-center bg-primary-600 hover:bg-primary-700 active:bg-primary-800" // Added hover/active (web only)
                    >
                        {/* *** ICON FIX: Use a valid name *** */}
                        <Icon name="history" size={16} color="white" style={{marginRight: 5}}/>
                        <Text className="text-white font-bold text-center text-sm">Resend</Text>
                    </TouchableOpacity>
                    {/* Add other actions here if needed (e.g., View Details, Delete) */}
                </View>
            </View>
        );
    }, [session, reset]); // Added dependencies used inside


    // console.log("[BroadcastPage] Rendering JSX...");
	return (
		<SafeAreaView className="bg-gray-100 flex-1">
			{/* Message List */}
			<FlatList
				className="px-4 pt-4 bg-gray-100 flex-1" // Changed bg slightly
				data={messages}
				renderItem={renderMessageItem} // Use the memoized render function
				keyExtractor={(item) => `msg-${item.id}`}
				contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={() => (
                    <View style={styles.centered}><Text style={styles.infoText}>No broadcast messages found.</Text></View>
                )}
			/>

			{/* Create/Edit Modal */}
			{creating && (
				<Modal animationType="slide" transparent={false} visible={creating} onRequestClose={() => setCreating(false)}>
					<SafeAreaView className="flex-1 bg-gray-100">
                        {/* Make modal content scrollable */}
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
						    <View className="flex-1 px-4 pt-4 pb-8">
							    {/* Modal Header */}
                                <View className="flex flex-row justify-between items-center mb-6 pb-2 border-b border-gray-300">
                                    <Text className="text-xl font-bold text-gray-700">{broadcast.id ? "Resend Broadcast" : "Create New Broadcast"}</Text>
								    <Pressable onPress={() => setCreating(false)} style={styles.closeButton}>
									    <Icon name="close" size={24} color="white" />
								    </Pressable>
							    </View>

                                {/* --- Form Fields --- */}
							    {/* Type Selection */}
                                <View style={styles.formGroup}>
								    <Text style={styles.label}>Select Type *</Text>
								    <SelectList
                                        setSelected={(type) => setValue("type", type as string)}
                                        data={[ { key: "all", value: "All Customers" }, { key: "groups", value: "Customer Groups" }, { key: "individual", value: "Individual Customers" } ]}
                                        save="key" placeholder="Select broadcast type"
                                        boxStyles={styles.selectBox} dropdownStyles={styles.dropdown} search={false}
                                        defaultOption={broadcast.type ? { key: broadcast.type, value: broadcast.type === 'all' ? 'All Customers' : (broadcast.type === 'groups' ? 'Customer Groups' : 'Individual Customers')} : undefined} // Set default based on form state
									/>
                                    {/* TODO: Add error display from react-hook-form if needed */}
							    </View>

							    {/* Recipient Selection (Conditional) */}
                                {broadcast.type === "individual" && (
								    <View style={styles.formGroup}>
									    <Text style={styles.label}>Select Recipient(s) *</Text>
                                        {/* TODO: Replace with actual customer data */}
                                        <Text style={styles.infoText}>(Customer selection not yet implemented)</Text>
									    {/* <MultipleSelectList
                                            setSelected={recipients => setValue("receipients", recipients as string[])}
											data={customers.map(c => ({ key: c.id, value: c.name ?? 'Unknown' }))} // Use actual customers state
                                            defaultOptions={ (Array.isArray(broadcast.receipients) ? broadcast.receipients : []).map(id => customers.find(c => c.id === id)).filter(Boolean).map(c => ({ key: c!.id, value: c!.name ?? 'Unknown' })) }
											save="key" label="Recipients" placeholder="Search customer(s)" boxStyles={styles.selectBox} dropdownStyles={styles.dropdown} badgeStyles={styles.badge}
										/> */}
								    </View>
							    )}

							    {/* Group Selection (Conditional) */}
                                {broadcast.type === "groups" && (
								    <View style={styles.formGroup}>
									    <Text style={styles.label}>Select Group(s) *</Text>
									    <MultipleSelectList
                                            setSelected={(selectedGroups) => setValue("groups", selectedGroups as string[])}
											data={groups} // Use groups state fetched from API
                                            // Filter default options based on current form state for 'groups'
                                            defaultOptions={ (Array.isArray(broadcast.groups) ? broadcast.groups : []).map(id => groups.find(g => g.key === id)).filter(Boolean) as {key: string; value: string}[] }
											save="key" label="Groups" placeholder="Select group(s)"
                                            boxStyles={styles.selectBox} dropdownStyles={styles.dropdown} badgeStyles={styles.badge}
                                            notFoundText={groups.length === 0 ? "No groups found" : "Group not found"}
										/>
								    </View>
							    )}

							    {/* Template Selection (Only for new messages) */}
                                {!broadcast.id && ( // Show only when creating new, not resending
								    <View style={styles.formGroup}>
									    <Text style={styles.label}>Select Message Template *</Text>
									    <SelectList
                                            setSelected={templateKey => {
                                                const selectedTemplate = templates.find(t => t.key === templateKey);
                                                setValue("templateId", selectedTemplate?.key ?? null);
                                                setValue("message", selectedTemplate?.content ?? ""); // Update message preview
                                            }}
											data={templates} // Use templates state fetched from API
                                            save="key" placeholder="Select a message template"
                                            boxStyles={styles.selectBox} dropdownStyles={styles.dropdown} searchPlaceholder="Search templates"
                                            defaultOption={broadcast.templateId ? templates.find(t => t.key === broadcast.templateId) : undefined} // Set default based on form state
                                            notFoundText={templates.length === 0 ? "No templates found" : "Template not found"}
										/>
                                    </View>
							    )}

							    {/* Message Preview */}
                                {broadcast.message ? ( // Show only if message has content
                                    <View style={styles.previewBox}>
                                        <Text style={styles.label}>Message Preview:</Text>
								        <Text style={styles.previewText}>{broadcast.message}</Text>
                                    </View>
                                ) : (
                                    !broadcast.id && <View style={styles.formGroup}><Text style={styles.infoText}>Select a template to see the message.</Text></View>
                                )}

							    {/* Channel Selection */}
                                <View style={styles.formGroup}>
								    <Text style={styles.label}>Select Channel(s) *</Text>
								    <MultipleSelectList
                                        setSelected={(selectedChannels) => setValue("channels", selectedChannels as string[])}
                                        data={[ { key: "sms", value: "SMS" }, { key: "mail", value: "Email" }, { key: "whatsapp", value: "WhatsApp" }, {key: "in-app", value: "In-App"} ]} // Added in-app
                                        save="key" label="Channels" placeholder="Select channel(s)"
                                        boxStyles={styles.selectBox} dropdownStyles={styles.dropdown} badgeStyles={styles.badge}
                                        // Set default based on form state
                                        defaultOptions={ (Array.isArray(broadcast.channels) ? broadcast.channels : []).map(key => ({key, value: key.charAt(0).toUpperCase() + key.slice(1)})) } // Format value for display
									/>
							    </View>

                                {/* Template Content Editor (Conditional Read-Only) */}
                                {!broadcast.id && ( // Only for new messages, not resend
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Message Content:</Text>
                                        <TextInput
                                            // Assuming you have a TextInput for content editing
                                            style={styles.selectBox} // or your desired style
                                            multiline
                                            value={broadcast.message}
                                            onChangeText={(text) => setValue("message", text)}
                                            editable={session?.role === 'admin' || session?.role === 'vendor_admin' ||  !!broadcast.id}  // Read-only for staff/manager, editable for admin/vendor admin, edit when resending
                                            placeholder="Enter message content"
                                        />
                                    </View>
                                )}

							    {/* Submit Button */}
                                <TouchableOpacity
                                    // Use handleSubmit to trigger validation and onSubmit
								    onPress={handleSubmit(sendMessage)} // Pass the sendMessage function
                                    disabled={isSubmitting} // Disable while submitting
                                    style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
							    >
                                    {isSubmitting ? ( <ActivityIndicator color="white" size="small" style={styles.buttonIcon} /> ) : ( <Icon name={broadcast.id ? "history" : "send"} size={18} color="white" style={styles.buttonIcon} /> )}
								    <Text style={styles.sendButtonText}>{isSubmitting ? "Sending..." : (broadcast.id ? "Resend Message" : "Send Message")}</Text>
							    </TouchableOpacity>
						    </View>
					    </ScrollView>
                    </SafeAreaView>
				</Modal>
			)}
		</SafeAreaView>
	);
};

// --- Styles --- (Keep your existing styles StyleSheet.create({...}))
const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, paddingHorizontal: 20 },
    infoText: { color: '#6B7280', textAlign: 'center', fontSize: 14 },
    formGroup: { marginBottom: 20 }, // Increased spacing
    label: { marginBottom: 6, fontSize: 14, fontWeight: '500', color: '#374151' }, // Darker label
    selectBox: { borderColor: "#65A694", borderRadius: 8, backgroundColor: 'white', minHeight: 50, alignItems: 'center' }, // Added minHeight, align items
    dropdown: { borderColor: "#65A694", borderRadius: 8, backgroundColor: 'white', position: 'relative', zIndex: 10 }, // Added zIndex
    badge: { backgroundColor: "#65A694", paddingVertical: 4, paddingHorizontal: 8 }, // Adjusted padding
    previewBox: { marginBottom: 20, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
    previewText: { color: '#1F2937', fontSize: 14, lineHeight: 20 },
    closeButton: { backgroundColor: '#DC2626', height: 36, width: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 18 }, // Slightly smaller
    sendButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, paddingVertical: 14, borderRadius: 8, backgroundColor: '#059669', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
    sendButtonDisabled: { backgroundColor: '#9CA3AF', elevation: 0 },
    sendButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    buttonIcon: { marginRight: 8 }
});