import "react-native-gesture-handler";

import { useContext } from "react";
import { Text, View } from "react-native";
import { Link, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AntIcon from "react-native-vector-icons/AntDesign";

// Contexts
import { AuthContext } from "./providers/AuthProvider";

// Screens
import HomePage from "./screens/HomePage";
import LoginPage from "./screens/auth/LoginPage";
import OnboardPage from "./screens/customers/OnboardPage";
import { CartContext } from "./providers/CartProvider";
import CheckoutCartPage from "./screens/checkout/CartPage";
import CheckoutOrderPage from "./screens/checkout/OrderPage";
import NotificationsPage from "./screens/account/Notifications";
import OrdersPage from "./screens/customers/OrdersPage";
import OrdersDetails from "./screens/customers/OrderDetails";
import NewOrdersPage from "./screens/customers/NewOrdersPage";
import BroadcastPage from "./screens/customers/BroadcastPage";
import ReservationsPage from "./screens/customers/ReservationsPage";
import Menu from "./screens/products/MenuPage";
import ProductDetails from "./screens/products/ProductDetails"

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

const Tab = createBottomTabNavigator();

const Drawer = createDrawerNavigator();

const Stack = createNativeStackNavigator<{
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

const TabNavigator = () => {
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

	return <Tab.Navigator
		screenOptions={{
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
		<Tab.Screen
			name="Home"
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
			name="Analytics"
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
				title:"Reports & analytics"
			}}
		/>
		<Tab.Screen
			name="Plus"
			component={cartCount > 0 ? CheckoutCartPage : NewOrdersPage}
			options={{
				tabBarIcon: ({ focused, size }) => (
					<AntIcon
						name="plus"
						color={focused ? "#65A694" : "#000000"}
						size={40}
					/>
				),
				tabBarLabel: () => <></>,
				title:"Add new"
			}}
		/>
		<Tab.Screen
			name="Notifications"
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
			}}
		/>
		<Tab.Screen
			name="Profile"
			component={Profile}
			options={{
				title: "My profile",
				headerShown: true,
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
	</Tab.Navigator>
};


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
		className="flex flex-row justify-between mr-6 w-12"
		style={{
		  marginRight: 15,
		}}
	  >
		{cartCount > 0 && (
		  <Link className="flex-1 pr-4" to="/CheckoutCartPage">
			<Icon name="basket" size={20} color="#65A694" />
  
			<View
			  style={{
				marginTop: -2,
				backgroundColor: "#83BBAE",
				borderRadius: 100,
				height: 20,
				width: 20,
				alignItems: "center",
			  }}
			>
			  <Text
				className="w-8 h-8 rounded-full text-white text-center"
				style={{ color: "#fff" }}
			  >
				{cartCount}
			  </Text>
			</View>
		  </Link>
		)}
	  </View>
	);
  };

export default function Navigation() {
	const { isAuthenticated } = useContext(AuthContext);

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
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
					<>
						{/* <Stack.Screen
            name="Root"
            component={DrawerNavigator}
            options={{
              title: 'Home',
            }}
          /> */}
						<Stack.Screen
							name="Root"
							component={TabNavigator}
							options={{
								headerShown: false,
							}}
						/>

						<Stack.Screen
							name="OnboardPage"
							component={OnboardPage}
							options={{
								headerShown: true,
								title: "Onboard Customer",
								headerRight,
							}}
						/>

						<Stack.Screen
							name="OrdersPage"
							component={OrdersPage}
							options={{
								title:"Orders",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="OrderDetails"
							component={OrdersDetails}
							options={{
								title:"Order details",
								headerShown: true,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="NewOrdersPage"
							component={NewOrdersPage}
							options={{
								title:"New Order",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="BroadcastPage"
							component={BroadcastPage}
							options={{
								title: "Send notifications",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="ReservationsPage"
							component={ReservationsPage}
							options={{
								title:"Reservations",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Menu"
							component={Menu}
							options={{
								title:"Menu",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="CheckoutCartPage"
							component={CheckoutCartPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								title: "My cart",
							}}
						/>

						<Stack.Screen
							name="ProductDetails"
							component={ProductDetails}
							options={{
								headerShown: false,
								headerBackTitleVisible: false,
								title: "Product Details",
							}}
						/>

						<Stack.Screen
							name="CheckoutOrderPage"
							component={CheckoutOrderPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								title: "Checkout",
							}}
						/>

						<Stack.Screen
							name="Pay"
							component={Pay}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Account"
							component={AccountPage}
							options={{
								headerShown: false,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Password"
							component={ChangePasswordPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Language"
							component={Language}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Ratings"
							component={Ratings}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="ReportingPage"
							component={ReportingPage}
							options={{
								title:"Reporting",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="RatingPage"
							component={RatingPage}
							options={{
								title:"Rating",
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Help"
							component={GetHelpPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								title: "Help & support",
								headerRight,
							}}
						/>

						<Stack.Screen
							name="About"
							component={AboutUsPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>

						<Stack.Screen
							name="Locate"
							component={LocateUsPage}
							options={{
								headerShown: true,
								headerBackTitleVisible: false,
								headerRight,
							}}
						/>
					</>
				) : (
					<>
						<Stack.Screen
							name="Login"
							component={LoginPage}
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="Register"
							component={OnboardPage}
							options={{
								headerShown: false,
							}}
						/>
						<Stack.Screen
							name="ForgotPasswordPage"
							component={ForgotPasswordPage}
							options={{
								headerShown: false,
							}}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
