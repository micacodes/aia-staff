import "react-native-gesture-handler";

import { useContext } from "react";
import { Text, View } from "react-native";
import { Link, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer"; // Although Drawer is defined, it's not used in the final export. Included for completeness.
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AntIcon from "react-native-vector-icons/AntDesign";

// Contexts
// --- Import useAuth hook instead of just AuthContext ---
import { AuthContext as UnusedAuthContext, useAuth } from "./providers/AuthProvider"; // Import useAuth
import { CartContext } from "./providers/CartProvider";

// Screens (Ensure all these paths are correct in your project structure)
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/auth/LoginPage";
import OnboardPage from "./screens/customers/OnboardPage";
import CheckoutCartPage from "./screens/checkout/CartPage";
import CheckoutOrderPage from "./screens/checkout/OrderPage";
import NotificationsPage from "./screens/account/Notifications";
import OrdersPage from "./screens/customers/OrdersPage";
import OrdersDetails from "./screens/customers/OrderDetails";
import NewOrdersPage from "./screens/customers/NewOrdersPage";
import BroadcastPage from "./screens/customers/BroadcastPage";
import ReservationsPage from "./screens/customers/ReservationsPage";
import Menu from "./screens/products/MenuPage";
import ProductDetails from "./screens/products/ProductDetails";
import Profile from "./screens/account/Profile";
import AboutUsPage from "./screens/account/About";
import Analytics from "./screens/account/Analytics";
import AccountPage from "./screens/account/Account";
import GetHelpPage from "./screens/account/Help";
import LocateUsPage from "./screens/account/Locate";
import ChangePasswordPage from "./screens/account/Password";
import Pay from "./screens/checkout/PayPage";
import ReportingPage from "./screens/customers/ReportingPage";
import RatingPage from "./screens/customers/RatingPage";
import ForgotPasswordPage from "./screens/auth/ForgotPasswordPage";
import Language from "./screens/account/Language";
import Ratings from "./screens/account/Ratings";

// --- Navigator Definitions ---
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator(); // Defined but not used in the current structure
const Stack = createNativeStackNavigator<{
	// --- Stack Navigator Type Definitions (Keep all original types) ---
	Root: undefined;
	Home: undefined;
	Login: undefined;
	Register: undefined;
	Tasks: undefined;
	Task: undefined;
	ServiceDetails: undefined;
	Vendors: undefined;
	VendorDetails: undefined;
	CheckoutCartPage: undefined;
	CheckoutOrderPage: undefined;
	ProductDetails: undefined;
	About: undefined;
	Account: undefined;
	Help: undefined;
	Password: undefined;
	Locate: undefined;
	OnboardPage: undefined;
	OrdersPage: undefined;
	NewOrdersPage: undefined;
	BroadcastPage: undefined;
	ReservationsPage: undefined;
	Menu: undefined;
	Analytics: undefined;
	Notifications: undefined;
	Profile: undefined;
	Pay: undefined;
	ReportingPage: undefined;
	RatingPage: undefined;
	ForgotPasswordPage: undefined;
	Language: undefined;
	Ratings: undefined;
	OrderDetails: undefined;
}>();


// --- TabNavigator Component with RBAC ---
const TabNavigator = () => {
	const { carts } = useContext(CartContext);
	const { session } = useAuth(); // Use the hook to get session context

	// Calculate cart count (existing logic)
	const cartCount = carts
		? Object.keys(carts).reduce((sum, vendorId) => {
				return (
					sum +
					(carts
						? carts[vendorId]?.reduce(
								(total: number, item: OrderItem) => total + item.quantity,
								0
							)
						: 0)
				);
			}, 0)
		: 0;

	// --- RBAC Logic ---
	const role = session?.role; // Get role (e.g., 'chef', 'rider', 'manager') - already lowercase
	const isChefOrRider = role === 'chef' || role === 'rider';
	console.log("[Navigation] Rendering Tabs for Role:", role); // For debugging

	return (
		<Tab.Navigator
			screenOptions={{
				// Your existing screenOptions
				headerShadowVisible: false,
				headerTintColor: "#65A694",
				headerTitleStyle: {
					fontWeight: "bold",
					color: "#65A694",
				},
				tabBarStyle: {
					borderTopWidth: 0,
					elevation: 0,
					backgroundColor: "#F2F7F6",
				},
				headerStyle: {
					backgroundColor: "#F2F7F6",
				},
			}}
		>
			{/* --- Tabs visible to ALL logged-in roles --- */}
			<Tab.Screen
				name="Home" // Assumed = 'Orders'
				component={HomePage}
				options={{
					headerShown: false,
					tabBarIcon: ({ focused, size }) => (
						<AntIcon
							name="home"
							color={focused ? "#65A694" : "#000000"}
							size={size}
						/>
					),
					tabBarLabel: () => <></>,
				}}
			/>

			<Tab.Screen
				name="Plus" // Assumed = 'New Orders'
				component={cartCount > 0 ? CheckoutCartPage : NewOrdersPage} // Keep conditional logic
				options={{
					tabBarIcon: ({ focused, size }) => (
						<AntIcon
							name="plus"
							color={focused ? "#65A694" : "#000000"}
							size={40} // Keep size 40
						/>
					),
					tabBarLabel: () => <></>,
					// Use dynamic title based on which component is rendered
					title: cartCount > 0 ? "Cart" : "Add new",
				}}
			/>

			{/* --- Tabs visible ONLY to roles OTHER THAN Chef/Rider --- */}
			{!isChefOrRider && (
				<>
					<Tab.Screen
						name="Analytics" // Represents 'Reports' functionality
						component={Analytics}
						options={{
							tabBarIcon: ({ focused, size }) => (
								<AntIcon
									name="linechart"
									color={focused ? "#65A694" : "#000000"}
									size={size}
								/>
							),
							tabBarLabel: () => <></>,
							title: "Reports & analytics",
						}}
					/>
					<Tab.Screen
						name="Notifications" // Needed for other roles
						component={NotificationsPage}
						options={{
							tabBarIcon: ({ focused, size }) => (
								<AntIcon
									name="bells"
									color={focused ? "#65A694" : "#000000"}
									size={size}
								/>
							),
							tabBarLabel: () => <></>,
							// title: "Notifications" // Default title is fine unless specified
						}}
					/>
					<Tab.Screen
						name="Profile" // Needed for other roles
						component={Profile}
						options={{
							title: "My profile",
							headerShown: true, // Keep as true or change based on desired UX
							tabBarIcon: ({ focused, size }) => (
								<AntIcon
									name="user"
									color={focused ? "#65A694" : "#000000"}
									size={size}
								/>
							),
							tabBarLabel: () => <></>,
						}}
					/>
				</>
			)}
		</Tab.Navigator>
	);
};


// --- headerRight function (Keep As Is) ---
const headerRight = () => {
	const { carts } = useContext(CartContext);

	const cartCount = carts ? Object.keys(carts).reduce((sum, vendorId) => {
	  return (
		sum +
		(carts ? carts[vendorId]?.reduce(
		  (total: number, item: OrderItem) =>
			total + item.quantity,
		  0
		) : 0)
	  );
	}, 0) : 0;

	return (
	  <View
		className="flex flex-row justify-between mr-6 w-12" // Ensure className works (requires Nativewind/Tailwind setup)
		style={{
		  marginRight: 15, // Style fallback/override
		}}
	  >
		{cartCount > 0 && (
		  <Link className="flex-1 pr-4" to={{ screen: 'CheckoutCartPage' }}> {/* Correct Link usage with object */}
			<Icon name="basket" size={20} color="#65A694" />

			<View
			  style={{
				// Styles for the badge
				position: 'absolute', // Position badge relative to icon
				right: 10, // Adjust positioning
				top: -5,  // Adjust positioning
				backgroundColor: "#83BBAE",
				borderRadius: 10, // Make it circular
				height: 20,
				width: 20,
				justifyContent: 'center', // Center text vertically
				alignItems: "center", // Center text horizontally
			  }}
			>
			  <Text
				style={{ color: "#fff", fontSize: 10, fontWeight: 'bold' }} // Style text
			  >
				{cartCount}
			  </Text>
			</View>
		  </Link>
		)}
	  </View>
	);
  };


// --- Main Exported Navigation Component ---
export default function Navigation() {
	const { isAuthenticated } = useAuth(); // Use hook here

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					// Global Stack Screen Options (Keep As Is)
					headerShown: false,
					headerShadowVisible: false,
					headerTintColor: "#65A694",
					headerTitleStyle: {
						fontWeight: "bold",
						color: "#65A694",
					},
					headerStyle: {
						backgroundColor: "#F2F7F6",
					},
				}}
			>
				{isAuthenticated ? (
					// --- Authenticated User Screens ---
					<>
						{/* --- Root screen uses the modified TabNavigator --- */}
						<Stack.Screen
							name="Root"
							component={TabNavigator}
							options={{
								headerShown: false, // No header for the tab container itself
							}}
						/>

						{/* --- Other Stack Screens (Keep definitions for navigation targets) --- */}
						{/* Access controlled implicitly by lack of navigation paths for restricted roles */}
						{/* Ensure headerRight uses the 'headerRight' function defined above */}
						<Stack.Screen name="OnboardPage" component={OnboardPage} options={{ headerShown: true, title: "Onboard Customer", headerRight }}/>
						<Stack.Screen name="OrdersPage" component={OrdersPage} options={{ title:"Orders", headerShown: true, headerBackTitleVisible: false, headerRight }} />
                        <Stack.Screen name="OrderDetails" component={OrdersDetails} options={{ title:"Order details", headerShown: true, headerRight }} />
						<Stack.Screen name="NewOrdersPage" component={NewOrdersPage} options={{ title:"New Order", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="BroadcastPage" component={BroadcastPage} options={{ title: "Send notifications", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="ReservationsPage" component={ReservationsPage} options={{ title:"Reservations", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="Menu" component={Menu} options={{ title:"Menu", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="CheckoutCartPage" component={CheckoutCartPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "My cart" }} />
						<Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false, headerBackTitleVisible: false, title: "Product Details" }} />
						<Stack.Screen name="CheckoutOrderPage" component={CheckoutOrderPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "Checkout" }} />
						<Stack.Screen name="Pay" component={Pay} options={{ headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="Account" component={AccountPage} options={{ headerShown: false, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="Password" component={ChangePasswordPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "Change Password", headerRight }} />
						<Stack.Screen name="Language" component={Language} options={{ headerShown: true, headerBackTitleVisible: false, title: "Language", headerRight }} />
						<Stack.Screen name="Ratings" component={Ratings} options={{ headerShown: true, headerBackTitleVisible: false, title: "My Ratings", headerRight }} />
						<Stack.Screen name="ReportingPage" component={ReportingPage} options={{ title:"Reporting", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="RatingPage" component={RatingPage} options={{ title:"Rate Service", headerShown: true, headerBackTitleVisible: false, headerRight }} />
						<Stack.Screen name="Help" component={GetHelpPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "Help & support", headerRight }} />
						<Stack.Screen name="About" component={AboutUsPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "About Us", headerRight }} />
						<Stack.Screen name="Locate" component={LocateUsPage} options={{ headerShown: true, headerBackTitleVisible: false, title: "Locate Us", headerRight }} />
						<Stack.Screen name="Analytics" component={Analytics} options={{ title:"Reports & analytics", headerShown: true, headerBackTitleVisible: false, headerRight }}/>
						<Stack.Screen name="Notifications" component={NotificationsPage} options={{ title:"Notifications", headerShown: true, headerBackTitleVisible: false, headerRight }}/>
						<Stack.Screen name="Profile" component={Profile} options={{ title:"My profile", headerShown: true, headerBackTitleVisible: false, headerRight }}/>


					</>
				) : (
					// --- Authentication Screens ---
					<>
						<Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }}/>
						{/* Assuming Register navigates to OnboardPage based on original code */}
						<Stack.Screen name="Register" component={OnboardPage} options={{ headerShown: false }}/>
						<Stack.Screen name="ForgotPasswordPage" component={ForgotPasswordPage} options={{ headerShown: false }}/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}