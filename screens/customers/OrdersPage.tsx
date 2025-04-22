// screens/customers/OrdersPage.tsx

import React, { useContext, useEffect, useState, useCallback, memo } from "react";
import {
	Image,
	Platform,
	Pressable,
	StatusBar,
	Text,
	View,
	SafeAreaView,
	Modal,
	TouchableOpacity,
	FlatList, // Using FlatList for the main list
	ActivityIndicator,
	StyleSheet,
	RefreshControl, // Import for Pull-to-Refresh
} from "react-native";
import { useToast } from "react-native-toast-notifications";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api"; // Adjust path as needed
import { format, isValid } from "date-fns"; // Import isValid
import { AuthContext } from "../../providers/AuthProvider"; // Adjust path as needed
import OrderCard from "../../components/OrderCard"; // Adjust path as needed
import { useFocusEffect, useNavigation } from '@react-navigation/native'; // Import hooks
import { NativeStackNavigationProp } from "@react-navigation/native-stack"; // Type for navigation prop

// --- Type Definitions ---
// TODO: Consider moving these shared types to a central file (e.g., src/types/models.ts or globals.d.ts)
interface User {
	id: number | string;
	name?: string;
    firstName?: string; // Added based on usage
    lastName?: string; // Added based on usage
	avatar?: { url?: string };
	avatarUrl?: string;
    phone?: string; // Added based on usage in OrderCard -> Reservation
}

interface Section {
	id: number | string;
	name?: string;
}

interface Order {
	id: number | string;
	status?: string;
	delivery?: string;
	type?: string;
	total: number;
	action?: string;
	section?: Section;
	customer?: User;
	createdAt: string | Date;
    items?: any[]; // Added based on OrderCard usage
    invoices?: any[]; // Added based on OrderCard usage
    meta?: Record<string, any>; // Added based on OrderCard usage
    vendorId?: string; // Added based on OrderCard usage
    ref?: string; // Added based on OrderCard usage
    vendor?: { name?: string }; // Added based on usage
    branchId?: string; // Added based on usage
}

interface PaginatedData<T> {
	data: T[];
	meta?: any;
    links?: any;
}
// --- End Type Definitions ---

// Define stack param list if using typed navigation
type RootStackParamList = {
    OrdersPage: undefined;
    NewOrdersPage: undefined;
    OrderDetails: { orderId: number | string };
    // Add other screen definitions
};

type OrdersPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrdersPage'>;

// --- Constants ---
// TODO: Consider moving to a constants file (e.g., src/constants/orderConstants.ts)
const STATUS_OPTIONS = [
    "Order Initiation", "Preorder Validation", "Approve & Payment", "Order Confirmation",
    "Fullfilment", "Feedback & Assessment", "Post Processing", "Closure & Resource Release",
];
const PLACEHOLDER_AVATAR_URL = "https://via.placeholder.com/100/CCCCCC/888888?text=No+Image";


// --- Sub-Components ---

// Order List Item Component
interface OrderListItemProps {
    item: Order;
    onPress: (order: Order) => void;
}
const OrderListItem = memo(({ item, onPress }: OrderListItemProps) => {
    const imageUrl = imagePath(item.customer?.avatar?.url, item.customer?.avatarUrl);
    const imageSourceUri = imageUrl || PLACEHOLDER_AVATAR_URL;

    const createdDate = new Date(item.createdAt);
    const displayDate = isValid(createdDate)
        ? format(createdDate, "EEE dd MMM yyyy, hh:mm a")
        : "Date unavailable";

    const customerName = item.customer?.name
        || `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim()
        || 'Unknown Customer';

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            className="bg-white rounded-lg px-3 py-3 my-1.5 mx-4 flex-row items-center shadow-sm active:opacity-80"
            accessibilityLabel={`Order by ${customerName}, Status: ${item.status || 'Unknown'}. Placed on ${displayDate}. Tap for details.`}
            accessibilityRole="button"
        >
            <Image
                className="h-14 w-14 rounded-full bg-gray-200 mr-3"
                source={{ uri: imageSourceUri }}
                resizeMode="cover"
            />
            <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                    {item.delivery || 'Delivery'} ({item.type || 'N/A'})
                </Text>
                <Text className="text-sm text-gray-600 mt-0.5" numberOfLines={1}>
                    {item.total > 0 && `KES ${item.total.toFixed(2)} - `}
                    {item.action || 'Action'} @ {item.section?.name || 'Section'} by{' '}
                    <Text className="font-medium">{customerName}</Text>
                </Text>
                <Text className="text-xs text-gray-500 pt-1">{displayDate}</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#cccccc" />
        </TouchableOpacity>
    );
});

// Status Filter Button Component
interface StatusFilterButtonProps {
    status: string;
    isSelected: boolean;
    onPress: (status: string) => void;
}
const StatusFilterButton = memo(({ status, isSelected, onPress }: StatusFilterButtonProps) => {
    return (
        <Pressable
            onPress={() => onPress(status)}
            className={`rounded-full h-9 px-4 flex items-center justify-center transition-colors duration-150 ease-in-out ${
                isSelected ? "bg-primary-700 shadow-sm" : "bg-primary-500"
            } active:opacity-80`}
            accessibilityLabel={`Filter orders by status: ${status}`}
            accessibilityState={{ selected: isSelected }}
            accessibilityRole="button"
        >
            <Text className="text-white text-sm font-medium">{status}</Text>
        </Pressable>
    );
});

// --- Main OrdersPage Component ---
export default function OrdersPage() {
	// --- State ---
	const [selectedStatus, setSelectedStatus] = useState<string>(STATUS_OPTIONS[0] || "Pending"); // Default to first status or fallback
	const [orders, setOrders] = useState<Order[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<Order | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// --- Hooks ---
	const { session } = useContext(AuthContext);
	const toast = useToast();
    const navigation = useNavigation<OrdersPageNavigationProp>();

	// --- StatusBar Configuration ---
	useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            StatusBar.setBarStyle("dark-content");
            if (Platform.OS === "android") {
                StatusBar.setBackgroundColor("transparent"); // Use transparent for dark content on light bg
                StatusBar.setTranslucent(true);
            }
        });
		return unsubscribe;
	}, [navigation]);

	// --- Data Fetching ---
	const fetchOrders = useCallback(async (refreshing = false) => {
		if (!session?.id) {
			setError("Authentication required to view orders.");
			setOrders([]);
			if (refreshing) setIsRefreshing(false);
            setIsLoading(false); // Ensure loading stops
			return;
		}
		if (!refreshing) setIsLoading(true);
		setError(null);

		try {
			// Pass status in the params object for `api.get`
            const response = await api.get<PaginatedData<Order> | Order[]>("orders", {
                status: selectedStatus, // Use selectedStatus here
            });

            let fetchedOrders: Order[] = [];
            // Check if response exists and has a data property that is an array (for paginated)
            if (response?.data && Array.isArray((response as PaginatedData<Order>).data)) {
                fetchedOrders = (response as PaginatedData<Order>).data;
            }
            // Check if the response itself is an array (for non-paginated)
            else if (Array.isArray(response)) {
                 fetchedOrders = response;
            }
            // Handle cases where response might be just the data object (less common but possible)
            else if (response && typeof response === 'object' && !Array.isArray(response) && (response as PaginatedData<Order>).data) {
                 fetchedOrders = (response as PaginatedData<Order>).data;
            }

			setOrders(fetchedOrders);

		} catch (err: any) {
			console.error("Failed to fetch orders:", err);
			const message = err.response?.data?.message || "Failed to load orders. Please try again.";
			setError(message);
			setOrders([]); // Clear orders on error
			if (!refreshing) {
                toast.show(message, { type: "danger", duration: 4000 });
            }
		} finally {
			if (!refreshing) setIsLoading(false);
            setIsRefreshing(false);
		}
	}, [selectedStatus, session?.id, toast]); // Dependencies: refetch when status or session changes

	// --- Effects ---
	useEffect(() => {
		navigation.setOptions({
			title: 'My Orders',
			headerRight: () => (
				<Pressable
					onPress={() => navigation.navigate("NewOrdersPage")}
					className="bg-primary-600 rounded-full p-1 mr-3 active:opacity-75"
					accessibilityLabel="Create new order"
					accessibilityRole="button"
				>
					<Icon name="plus" size={26} color="white" />
				</Pressable>
			),
		});
	}, [navigation]);

    // Fetch orders when the screen focuses or selectedStatus changes
    useFocusEffect(
        useCallback(() => {
            if (session?.id) {
                fetchOrders();
            } else {
                setError("Authentication required.");
                setOrders([]);
            }
        }, [fetchOrders, session?.id]) // fetchOrders already depends on selectedStatus
    );

	// --- Event Handlers ---
	const handleRefresh = useCallback(() => {
		setIsRefreshing(true);
		fetchOrders(true); // Pass true to indicate refreshing
	}, [fetchOrders]);

	const handleSelectOrder = useCallback((order: Order) => {
		setSelectedOrder(order);
	}, []); // No dependencies needed if it just sets state

	const handleCloseModal = useCallback(() => {
		setSelectedOrder(undefined);
	}, []);

	const handleUpdateOrder = useCallback(() => {
		setSelectedOrder(undefined);
        fetchOrders(); // Re-fetch the list after an update
	}, [fetchOrders]); // Depends on fetchOrders

    const handleSelectStatus = useCallback((status: string) => {
        setSelectedStatus(status);
        setOrders([]); // Clear list immediately for better UX
        // The useFocusEffect/useEffect depending on fetchOrders will trigger the actual fetch
    }, []);

	// --- Render Functions ---

	// Render Main Order List using extracted component
	const renderListItem = useCallback(({ item }: { item: Order }) => (
        <OrderListItem item={item} onPress={handleSelectOrder} />
    ), [handleSelectOrder]);

	// Render Status Filter Item using extracted component
	const renderStatusFilter = useCallback(({ item }: { item: string }) => (
        <StatusFilterButton
            status={item}
            isSelected={item === selectedStatus}
            onPress={handleSelectStatus}
        />
    ), [selectedStatus, handleSelectStatus]);

	// --- Main Content Rendering Logic ---
	const renderMainContent = () => {
		if (isLoading && orders.length === 0 && !isRefreshing) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#5E9C8F" />
                    <Text style={styles.loadingText}>Loading Orders...</Text>
				</View>
			);
		}

		if (error && !isRefreshing && orders.length === 0) { // Only show full error state if list is empty
			return (
				<View style={styles.centerContainer}>
					<Icon name="alert-circle-outline" size={40} color="#DC2626" />
					<Text className="text-red-600 text-center mt-3 mb-4 px-4">{error}</Text>
					<TouchableOpacity
						onPress={() => fetchOrders()}
						className="bg-primary-600 px-5 py-2 rounded-md active:opacity-80"
					>
						<Text className="text-white font-semibold">Retry</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<FlatList
				data={orders}
				renderItem={renderListItem} // Use the memoized render function
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={styles.listContentContainer}
				refreshControl={
					<RefreshControl
						refreshing={isRefreshing}
						onRefresh={handleRefresh}
						colors={["#5E9C8F", "#9CA3AF"]} // Adjusted colors
						tintColor={"#5E9C8F"}
					/>
				}
                ListEmptyComponent={ // Show empty message when list is fetched but empty
                    !isLoading && !isRefreshing && (
                         <View style={styles.centerContainer}>
                            <Icon name="format-list-bulleted" size={40} color="#9CA3AF" />
                            <Text className="text-gray-500 mt-3 text-center px-5">
                                {`No orders found with status "${selectedStatus}".`}
                            </Text>
                        </View>
                    )
                }
			/>
		);
	};

	// --- Component Return ---
	return (
		<SafeAreaView style={styles.safeArea}>
			{/* Order Details Modal */}
			{selectedOrder && (
				<Modal
					visible={true} // Modal visibility controlled by selectedOrder state
					animationType="slide"
					onRequestClose={handleCloseModal}
					presentationStyle="pageSheet" // Or "formSheet" or remove for default fullscreen
				>
					<OrderCard
						order={selectedOrder}
						onClose={handleCloseModal}
						onUpdate={handleUpdateOrder}
						staffId={session?.id}
					/>
				</Modal>
			)}

			{/* Status Filter Horizontal List */}
			<View className="py-2.5 bg-gray-100 border-b border-gray-200">
				<FlatList
					horizontal
					showsHorizontalScrollIndicator={false}
					data={STATUS_OPTIONS} // Use constant
					renderItem={renderStatusFilter} // Use the memoized render function
					keyExtractor={(item) => item}
					contentContainerStyle={styles.statusFilterContainer}
				/>
			</View>

			{/* Main Content Area */}
			<View style={styles.listContainer}>
				{renderMainContent()}
			</View>

		</SafeAreaView>
	);
}

// --- Styles ---
const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F3F4F6', // Tailwind gray-100
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
        marginTop: 40, // Add some margin from the top filter
	},
    loadingText: {
        marginTop: 10,
        color: '#6B7280', // Tailwind gray-500
    },
	statusFilterContainer: {
		paddingHorizontal: 12,
		gap: 8,
        height: 40, // Ensure items fit vertically
        alignItems: 'center',
	},
    listContainer: {
        flex: 1, // Make sure the list container takes remaining space
    },
    listContentContainer: {
        paddingBottom: 20, // Add padding at the bottom
    },
});