import React, { useState, useContext, useEffect, useRef } from "react";
import { Rating } from "react-native-ratings";
// import HTMLView from "react-native-htmlview";
import {
  Image,
  Text,
  View,
  // SafeAreaView,
  StatusBar,
  Platform,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // Ensure ActivityIndicator is imported if used
} from "react-native";
import * as Device from 'expo-device';

import { useAuth } from "../providers/AuthProvider"; // Make sure this path is correct
import { api, imagePath } from "../utils/api"; // Make sure these paths are correct
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  registerForegroundMessageHandler,
  requestUserPermissions,
  getFCMToken,
} from "../utils/fcm"; // Make sure this path is correct

// --- Types ---
// Keep ActionCardItem for reference or potential future backend fix, but it's not used for menuCards state anymore
interface ActionCardItem { id: number | string; name: string; iconName: string; pageName: string; }
interface Product { id: string; name: string; details: string | null; image?: { url?: string } | null; }
interface PaginatedData<T> { data: T[]; meta?: any; links?: any; }


export default function HomePage({ navigation, route }) {
  // Destructure sessionToken as identified before
  const { session, sessionToken, isAuthenticated } = useAuth();
  const role = session?.role;
  // console.log("[HomePage] Rendering for Role:", role); // Keep if helpful

  // --- State ---
  // --- State type handles array of strings ---
  const [menuCards, setMenuCards] = useState<string[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false); // Separate loading state
  const [cardError, setCardError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [rating, setRating] = useState(3.5);
  const gap = 8;

  // --- Effects ---
  useEffect(() => { /* StatusBar */
      StatusBar.setBarStyle("dark-content");
      if (Platform.OS === "android") { StatusBar.setBackgroundColor("rgba(0,0,0,0)"); StatusBar.setTranslucent(true); }
   }, []);

  useEffect(() => { /* FCM/Device */
      const setupFCM = async () => {
          const unsubscribe = registerForegroundMessageHandler();
          try {
              const hasPermission = await requestUserPermissions();
              if (hasPermission) {
                  const fcmToken = await getFCMToken();
                  if (fcmToken && sessionToken) {
                      // console.log("[HomePage] FCM Token:", fcmToken);
                      // await api.post('/users/devices', { token: fcmToken, type: Platform.OS });
                  }
              }
          } catch (error) {
              console.error("[HomePage] Error during FCM/Device setup:", error);
          }
          return unsubscribe;
      };
      let unsubscribeFcmHandler: (() => void) | undefined;
      setupFCM().then(handler => { unsubscribeFcmHandler = handler; });
      return () => { if (unsubscribeFcmHandler) { unsubscribeFcmHandler(); } };
  }, [sessionToken]);

  useEffect(() => { /* Search */
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length > 2) {
          setIsLoadingSearch(true); // Start search loading
          api.get<PaginatedData<Product>>("products", { s: trimmedQuery })
            .then((response) => {
                setSearchResults(response?.data && Array.isArray(response.data) ? response.data : []);
            })
            .catch(err => { console.error("Product search failed:", err); setSearchResults([]); })
            .finally(() => setIsLoadingSearch(false)); // Stop search loading
      } else {
          setSearchResults([]);
      }
  }, [searchQuery]);

  // --- Effect to Fetch Action Cards (Strings) ---
  useEffect(() => {
    if (isAuthenticated && session?.id && sessionToken) {
      setIsLoadingCards(true);
      setCardError(null);
      setMenuCards([]);
      const endpoint = 'auth/role-actions';
      console.log(`[HomePage] Attempting to fetch action strings from: ${endpoint}`);

      api.get<string[]>(endpoint) // Expect string[]
        .then(response => {
          const actionData = response;
          console.log(`[HomePage] Successfully fetched action strings from ${endpoint}. Response data:`, actionData);
          if (Array.isArray(actionData)) {
              const filteredActions = actionData.filter(item => typeof item === 'string');
              setMenuCards(filteredActions);
              console.log("[HomePage] menuCards updated:", filteredActions); // <--- ADD THIS LINE
          } else {
              console.warn(`[HomePage] Received non-array data from ${endpoint}. Setting empty actions. Received:`, actionData);
              setMenuCards([]);
              setCardError("Received invalid action data format from server.");
          }
        })
        .catch(error => {
          console.error(`[HomePage] Failed to load actions from endpoint: ${endpoint}. API Error:`, error);
           if (error.response) {
                const message = error.response.data?.message || `Server error (${error.response.status})`;
                if (error.response.status === 401 || error.response.status === 403) { setCardError("Authentication failed."); }
                else { setCardError(`Failed to load actions: ${message}`); }
            } else if (error.request) { setCardError("Failed to load actions: Could not connect to server."); }
            else { setCardError("Failed to load actions: Application error."); }
            setMenuCards([]);
        })
        .finally(() => { setIsLoadingCards(false); });
    } else {
      setMenuCards([]); setIsLoadingCards(false); setCardError(null);
      // Log reasons if needed
    }
  }, [isAuthenticated, session?.id, sessionToken]);


  // --- Lookup map for card details based on string from API ---
  // --- UPDATE THIS MAP with correct iconName and pageName for YOUR app ---
  const actionCardDetails: { [key: string]: { iconName: string; pageName: string } } = {
    "Orders":        { iconName: "basket",       pageName: "OrdersPage" },
    "New Order":     { iconName: "draw-pen",     pageName: "NewOrdersPage" },
    "Onboard":       { iconName: "border-color", pageName: "OnboardPage" },
    "Broadcast":     { iconName: "send",         pageName: "BroadcastPage" },
    "Reservations":  { iconName: "calendar",     pageName: "ReservationsPage" },
    "Menu":          { iconName: "book-open",    pageName: "Menu" },
    "Reports":        { iconName: "mail",         pageName: "ReportingPage" },
    "Rate Customer": { iconName: "star",         pageName: "RatingPage" },
     // Add other potential strings like "Summaries" if the API sends them
     "Summaries": { iconName: "chart-bar", pageName: "SummaryScreen" }, // Adjust pageName if needed
  };
  const fallbackDetails = { iconName: "help-circle-outline", pageName: "Home" }; // Fallback uses "Home" page

  // --- Styles ---
  const htmlStyles = StyleSheet.create({ p: { margin: 0, color: '#6B7280', fontSize: 12 }, });

  // --- Render Function ---
  return (
    <View className="py-6 bg-primary-50 pt-10 h-full flex-1">
      {/* Header Section */}
      <View className="mb-4 w-full">
         {/* Row 1: Avatar + Info */}
         <View className="flex flex-row justify-between items-center ml-3 py-3">
           <View className="flex flex-row items-center w-full space-x-2">
            {session?.avatarUrl ? ( <Image source={{ uri: session.avatarUrl }} height={48} width={48} className="rounded-full bg-gray-300"/>
            ) : ( <View className="h-12 w-12 rounded-full bg-gray-300 items-center justify-center"><Icon name="account" size={30} color="#6B7280" /></View> )}
            <View className="flex justify-center flex-1 pr-2">
              <View className="flex flex-row justify-between items-center">
                 <Text className="text-lg font-bold" numberOfLines={1}>{'Hi ' + (session?.firstName || 'User') + ','}</Text>
                 <View className="flex flex-row items-center space-x-2">
                     <Rating type="custom" ratingCount={5} startingValue={rating} imageSize={20} showRating={false} ratingColor="#5E9C8F" ratingBackgroundColor="#CCE0DC" tintColor="#F2F7F6" jumpValue={0.5} readonly={true}/>
                 </View>
              </View>
              {session && (session.vendor || session.branch) ? (
                 <View className="flex flex-row flex-wrap mt-1">
                     <Text numberOfLines={1} className="text-sm text-gray-600">
                         {session.vendor?.name ?? ''}{session.vendor?.name && session.branch?.name ? ' - ' : ''}{session.branch?.name ?? ''}
                     </Text>
                 </View>
              ) : null}
            </View>
          </View>
        </View>
        {/* Row 2: Search Section */}
        <View className="flex items-center justify-center mx-4 relative">
           <View className="w-full h-12 rounded-3xl bg-gray-200 flex flex-row items-center px-3">
             <Icon name="magnify" size={25} color="#5E9C8F" />
             <TextInput
                placeholder="Search & discover..."
                className="ml-3 flex-1"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
             />
             {isLoadingSearch && <ActivityIndicator size="small" color="#5E9C8F" style={{ marginRight: 5 }}/>}
           </View>
           {/* Search Results Overlay */}
           {searchQuery.length > 2 && !isLoadingSearch && (
             <View style={styles.searchResultsContainer} className="absolute top-full left-0 right-0 mt-1 z-50 bg-white shadow-lg rounded-md max-h-60 border border-gray-200">
               {searchResults.length > 0 ? (
                 <FlatList
                      data={searchResults}
                      keyExtractor={(item) => item.id}
                      renderItem={({item: product}) => (
                          <TouchableOpacity
                              key={product.id}
                              onPress={() => { setSearchQuery(''); setSearchResults([]); navigation.navigate("ProductDetails", { productId: product.id }); }}
                              className="border-b border-gray-200 flex flex-row justify-between items-center py-2 px-4"
                          >
                              <View className="flex flex-row items-center flex-1 mr-2">
                                  {product.image?.url && (<View className="mr-3"><Image source={{ uri: imagePath(product.image.url) }} height={40} width={40} className="rounded-full bg-gray-200"/></View>)}
                                  <View className="flex-1">
                                      <Text className="text-base font-bold" numberOfLines={1}>{product.name || 'N/A'}</Text>
                                      {product.details ? (<Text numberOfLines={1} style={htmlStyles.p}>{product.details.replace(/<[^>]*>?/gm, '').slice(0, 50) + (product.details.length > 50 ? '...' : '')}</Text>) : null }
                                  </View>
                              </View>
                              <View><Icon name="chevron-right" color="#5E9C8F" size={25} /></View>
                          </TouchableOpacity>
                      )}
                 />
               ) : ( <View className="p-4 items-center justify-center"><Text className="text-center text-gray-500">No products found</Text></View> )}
             </View>
           )}
         </View>
      </View>

      {/* Main Content Grid: Action Cards */}
      {isLoadingCards ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#5E9C8F" /><Text style={styles.infoText}>Loading actions...</Text></View>
      ) : cardError ? (
          <View style={styles.centered}>
            <Icon name="alert-circle-outline" size={40} color="#DC2626" />
            <Text style={[styles.infoText, styles.errorText]}>{cardError}</Text>
          </View>
      ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            // --- Corrected renderItem ---
            renderItem={({ item: taskName }) => { // item is the string e.g. "Orders"
              const details = actionCardDetails[taskName] || fallbackDetails; // Look up details or use fallback

              // Optional: Check if details were found or if using fallback
              if (!actionCardDetails[taskName]) {
                  console.log(`[HomePage] Using fallback details for task: ${taskName}`);
              }

              return (
                <TouchableOpacity
                  className="flex-1 h-32 justify-center items-center rounded-xl bg-primary-200 p-4 active:bg-primary-300" // Use Tailwind or StyleSheet
                  style={styles.actionCardContainer} // Example StyleSheet usage
                  // --- CORRECTED onPress ---
                  onPress={() => {
                    // Use details.pageName and taskName in the log
                    console.log(`[HomePage] Card Pressed. Attempting to navigate to: ${details.pageName} (for card: ${taskName})`);
                    // Use details.pageName for navigation
                    navigation.navigate(details.pageName);
                  }}
                  // --- CORRECTED accessibilityLabel ---
                  accessibilityLabel={taskName} // Use taskName directly
                >
                  <View className="flex justify-center items-center">
                    <Icon name={details.iconName} size={50} color="#5E9C8F"/>
                    <Text className="font-bold text-[16px] mt-1 text-center text-gray-600">{taskName}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            data={menuCards} // Data is string[] fetched from API
            numColumns={2}
            contentContainerStyle={{ gap, paddingBottom: 20 }}
            columnWrapperStyle={{ gap }}
            keyExtractor={(item, index) => `${item}-${index}`} // Use item string + index for key
            className="m-3 flex-1"
            ListEmptyComponent={
               <View style={styles.centered}>
                 <Text style={styles.infoText}>No actions available for your role.</Text>
              </View>
             }
          />
      )}
    </View>
  );
}

// StyleSheet defined outside the component
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { marginTop: 10, color: '#6B7280', textAlign: 'center' },
  errorText: { color: '#DC2626', textAlign: 'center', padding: 10 },
  htmlStyles: { p: { margin: 0, color: '#6B7280', fontSize: 12 } },
  actionCardContainer: { flex: 1, height: 128, justifyContent: 'center', alignItems: 'center', borderRadius: 12, padding: 16, backgroundColor: '#D6EFED' },
  searchResultsContainer: {},
  // Optional style for invalid items if needed from previous examples:
  // invalidItemPlaceholder: { backgroundColor: '#FFEBEB', borderColor: '#FFCCCC', borderWidth: 1, },
  // errorTextSmall: { fontSize: 10, color: 'red', textAlign: 'center', }
});