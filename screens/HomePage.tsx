import React, { useState, useContext, useEffect, useRef } from "react";
import PagerView from "react-native-pager-view";
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
  ActivityIndicator,
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
  console.log("[HomePage] Rendering for Role:", role);

  // --- State ---
  // --- FRONTEND FIX 1: Change state type to handle array of strings ---
  const [menuCards, setMenuCards] = useState<string[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
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
                      console.log("[HomePage] FCM Token:", fcmToken);
                      // Post device token if needed (interceptor adds auth)
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
          // Assuming products endpoint returns { data: [...] }
          api.get<PaginatedData<Product>>("products", { s: trimmedQuery }) // Pass query as second arg
            .then((response) => {
                setSearchResults(response && Array.isArray(response.data) ? response.data : []);
            })
            .catch(err => { console.error("Product search failed:", err); setSearchResults([]); });
      } else { setSearchResults([]); }
  }, [searchQuery]);

  // --- Effect to Fetch Action Cards ---
  useEffect(() => {
    // Check auth state and token (needed for interceptor)
    if (isAuthenticated && session?.id && sessionToken) {
      setIsLoadingCards(true);
      setCardError(null);
      setMenuCards([]);
      const endpoint = 'auth/role-actions';

      console.log(`[HomePage] Attempting to fetch actions from: ${endpoint} (interceptor will add token)`);

      // --- FRONTEND FIX 2: Call api.get correctly (no manual config), expect string array ---
      api.get<string[]>(endpoint) // Expect string[] directly from API now
        .then(response => {
          // response should now be ["Orders", "Summaries"]
          const actionData = response;

          console.log(`[HomePage] Successfully fetched actions from ${endpoint}. Response data:`, actionData);

          // Check if the response IS an array (even if empty)
          if (Array.isArray(actionData)) {
              // Verify items are strings if needed, otherwise just set
              setMenuCards(actionData.filter(item => typeof item === 'string'));
          } else {
              // Handle cases where response is not an array (null, undefined, object etc.)
              console.warn(`[HomePage] Received non-array data from ${endpoint}. Setting empty actions. Received:`, actionData);
              setMenuCards([]); // Ensure cards are empty
              setCardError("Received invalid action data format from server.");
          }
        })
        .catch(error => {
          // Keep the detailed error logging
          console.error(`[HomePage] Failed to load actions from endpoint: ${endpoint}. API Error:`, error);
           if (error.response) {
                console.error("[HomePage] API Error Response Data:", error.response.data);
                console.error("[HomePage] API Error Response Status:", error.response.status);
                const message = error.response.data?.message || `Server error (${error.response.status})`;
                if (error.response.status === 401 || error.response.status === 403) {
                    setCardError("Authentication failed. Please log in again.");
                } else {
                    setCardError(`Failed to load actions: ${message}`);
                }
            } else if (error.request) {
                console.error("[HomePage] API Error Request (No Response):", error.request);
                setCardError("Failed to load actions: Could not connect to the server.");
            } else {
                console.error("[HomePage] API Error Message (Request Setup):", error.message);
                setCardError("Failed to load actions: Application error preparing request.");
            }
            console.error("[HomePage] Full API Error Config (from Axios):", error.config);
            setMenuCards([]);
        })
        .finally(() => {
          console.log(`[HomePage] Finished attempt to fetch actions from ${endpoint}`);
          setIsLoadingCards(false);
        });
    } else {
      // Conditions not met
      setMenuCards([]);
      setIsLoadingCards(false);
      setCardError(null);
      if (!isAuthenticated) console.log("[HomePage] Not fetching actions: User not authenticated.");
      if (!session?.id) console.log("[HomePage] Not fetching actions: Session ID missing.");
      if (!sessionToken) console.log("[HomePage] Not fetching actions: Auth Token (sessionToken) missing.");
    }
  }, [isAuthenticated, session?.id, sessionToken]);


  // --- FRONTEND FIX 3: Add the lookup map for card details ---
  // Define this inside the component function, before the return statement.
  // !!! YOU MUST UPDATE iconName and pageName TO MATCH YOUR APP !!!
  const actionCardDetails: { [key: string]: { iconName: string; pageName: string } } = {
    "Orders": { iconName: "receipt-outline", pageName: "Order" }, // Example, adjust!
    "Summaries": { iconName: "chart-bar", pageName: "SummaryScreen" },   // Example, adjust!
    // Add entries for ALL possible strings the API might return
    // e.g., "Inventory": { iconName: "clipboard-list-outline", pageName: "InventoryScreen" },
  };
  // Define a fallback for safety if an unknown string is received
  const fallbackDetails = { iconName: "help-circle-outline", pageName: "HomeScreen" };

  // --- Styles ---
  const htmlStyles = StyleSheet.create({ p: { margin: 0, color: '#6B7280', fontSize: 12 }, });

  // --- Render Function ---
  return (
    <View className="py-6 bg-primary-50 pt-10 h-full flex-1">
      {/* Header Section (No changes needed here) */}
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
        {/* Row 2: Search Section (No changes needed here) */}
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
           </View>
           {searchQuery.length > 2 && (
             <View style={styles.searchResultsContainer} className="absolute top-full left-0 right-0 mt-1 z-50 bg-white shadow-lg rounded-md max-h-60 border border-gray-200">
               {searchResults.length > 0 ? (
                 <FlatList
                      data={searchResults}
                      keyExtractor={(item) => item.id} // Product search results likely have IDs
                      renderItem={({item: product}) => (
                          <TouchableOpacity
                              key={product.id}
                              onPress={() => {
                                  setSearchQuery('');
                                  setSearchResults([]);
                                  navigation.navigate("ProductDetails", { productId: product.id });
                              }}
                              className="border-b border-gray-200 flex flex-row justify-between items-center py-2 px-4"
                          >
                              <View className="flex flex-row items-center flex-1 mr-2">
                                  {product.image?.url && (
                                      <View className="mr-3"><Image source={{ uri: imagePath(product.image.url) }} height={40} width={40} className="rounded-full bg-gray-200"/></View>
                                  )}
                                  <View className="flex-1">
                                      <Text className="text-base font-bold" numberOfLines={1}>{product.name || 'N/A'}</Text>
                                      {product.details ? (<Text numberOfLines={1} style={htmlStyles.p}>{product.details.replace(/<[^>]*>?/gm, '').slice(0, 50) + (product.details.length > 50 ? '...' : '')}</Text>) : null }
                                  </View>
                              </View>
                              <View><Icon name="chevron-right" color="#5E9C8F" size={25} /></View>
                          </TouchableOpacity>
                      )}
                 />
               ) : (
                 <View className="p-4 items-center justify-center"><Text className="text-center text-gray-500">No products found</Text></View>
               )}
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
            // --- FRONTEND FIX 4: Update renderItem ---
            renderItem={({ item: taskName }) => { // item is the string e.g. "Orders"
              const details = actionCardDetails[taskName] || fallbackDetails; // Look up details or use fallback
              return (
                <TouchableOpacity
                  className="flex-1 h-32 justify-center items-center rounded-xl bg-primary-200 p-4 active:bg-primary-300"
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(details.pageName)} // Use looked-up pageName
                  accessibilityLabel={taskName}
                >
                  <View className="flex justify-center items-center">
                    {/* Use looked-up iconName */}
                    <Icon name={details.iconName} size={50} color="#5E9C8F"/>
                    {/* Use the taskName string directly for the label */}
                    <Text className="font-bold text-[16px] mt-1 text-center text-gray-600">{taskName}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            data={menuCards} // Data is now string[]
            numColumns={2}
            contentContainerStyle={{ gap, paddingBottom: 20 }}
            columnWrapperStyle={{ gap }}
            // --- FRONTEND FIX 5: Update keyExtractor ---
            keyExtractor={(item, index) => `${item}-${index}`} // Use item string + index
            className="m-3 flex-1"
            ListEmptyComponent={
               <View style={styles.centered}>
                 {/* This message shows if API returns [] or only unknown strings */}
                 <Text className="text-center text-gray-500">No actions available for your role.</Text>
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
  errorText: { color: '#DC2626' },
  htmlStyles: { p: { margin: 0, color: '#6B7280', fontSize: 12 } },
  actionCard: {},
  searchResultsContainer: {}
});