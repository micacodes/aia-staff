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

import { useAuth } from "../providers/AuthProvider";
import { api, imagePath } from "../utils/api";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  registerForegroundMessageHandler,
  requestUserPermissions,
  getFCMToken,
} from "../utils/fcm";

// --- Types ---
interface ActionCardItem { id: number | string; name: string; iconName: string; pageName: string; }
interface Product { id: string; name: string; details: string | null; image?: { url?: string } | null; }
interface PaginatedData<T> { data: T[]; meta?: any; links?: any; }


export default function HomePage({ navigation, route }) {
  const { session, isAuthenticated } = useAuth();
  const role = session?.role;
  console.log("[HomePage] Rendering for Role:", role); // Renamed log slightly for clarity

  // --- State ---
  const [menuCards, setMenuCards] = useState<ActionCardItem[]>([]);
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
      // ... (same FCM/Device logic as before) ...
      const unsubscribe = registerForegroundMessageHandler();
      requestUserPermissions().then((hasPermission) => {
        if (hasPermission) { getFCMToken().then(async (token) => { /* ... post device ... */ }); }
      });
      return () => { unsubscribe(); };
  }, []);
  useEffect(() => { /* Search */
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length > 2) {
          api.get<PaginatedData<Product>>("products", { params: { s: trimmedQuery } })
            .then(({ data }) => { setSearchResults(data && Array.isArray(data.data) ? data.data : []); })
            .catch(err => { console.error("Product search failed:", err); setSearchResults([]); });
      } else { setSearchResults([]); }
  }, [searchQuery]);

  // --- Effect to Fetch Action Cards ---
  useEffect(() => {
    if (isAuthenticated && session?.id) {
      setIsLoadingCards(true);
      setCardError(null);
      setMenuCards([]);
      const endpoint = 'auth/role-actions'; // *** Verify this endpoint path ***
      console.log(`[HomePage] Attempting to fetch actions from: ${endpoint}`); // Log attempt

      api.get<ActionCardItem[]>(endpoint)
        .then(response => {
          console.log(`[HomePage] Successfully fetched actions from ${endpoint}. Response data:`, response.data); // Log success
          // Validate response data structure before setting state
          if (Array.isArray(response.data)) {
              setMenuCards(response.data);
          } else {
              console.warn(`[HomePage] Received non-array data from ${endpoint}. Setting empty actions. Received:`, response.data);
              setMenuCards([]); // Set empty array if data is not as expected
              setCardError("Received invalid action data."); // Optionally set a specific error
          }
        })
        .catch(error => {
          // --- DETAILED ERROR LOGGING ADDED HERE ---
          console.error(`[HomePage] Failed to load actions from endpoint: ${endpoint}. API Error:`, error);
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("[HomePage] API Error Response Data:", error.response.data);
            console.error("[HomePage] API Error Response Status:", error.response.status);
            console.error("[HomePage] API Error Response Headers:", error.response.headers);
            // Set a more specific error message if possible
            const message = error.response.data?.message || `Server responded with status ${error.response.status}`;
            setCardError(`Failed to load actions: ${message}`);
          } else if (error.request) {
            // The request was made but no response was received
            console.error("[HomePage] API Error Request (No Response):", error.request);
            setCardError("Failed to load actions: No response from server.");
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("[HomePage] API Error Message (Request Setup):", error.message);
            setCardError("Failed to load actions: Request setup error.");
          }
          console.error("[HomePage] Full API Error Config:", error.config);
          // --- END DETAILED LOGGING ---

          // Ensure state updates happen *after* logging
          // setCardError("Failed to load actions."); // Already set more specific message above
          setMenuCards([]); // Set menu cards to empty on error
        })
        .finally(() => {
          console.log(`[HomePage] Finished attempt to fetch actions from ${endpoint}`); // Log completion
          setIsLoadingCards(false);
        });
    } else {
      // Reset state if not authenticated or no session ID
      setMenuCards([]);
      setIsLoadingCards(false);
      setCardError(null);
      if (!isAuthenticated) console.log("[HomePage] Not fetching actions: User not authenticated.");
      if (!session?.id) console.log("[HomePage] Not fetching actions: Session ID missing.");
    }
  }, [isAuthenticated, session?.id]); // Keep dependencies


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
                 <View className="flex flex-row items-center space-x-2"><Rating type="custom" ratingCount={5} startingValue={rating} imageSize={20} showRating={false} ratingColor="#5E9C8F" ratingBackgroundColor="#CCE0DC" tintColor="#F2F7F6" jumpValue={0.5} readonly={true}/></View>
              </View>
              {session && (session.vendor || session.branch) ? (
                 <View className="flex flex-row flex-wrap mt-1"><Text numberOfLines={1} className="text-sm text-gray-600">{session.vendor?.name ?? ''}{session.vendor?.name && session.branch?.name ? ' - ' : ''}{session.branch?.name ?? ''}</Text></View>
              ) : null}
            </View>
          </View>
        </View>
        {/* Row 2: Search Section */}
        <View className="flex items-center justify-center mx-4 relative">
           <View className="w-full h-12 rounded-3xl bg-gray-200 flex flex-row items-center px-3">
             <Icon name="magnify" size={25} color="#5E9C8F" />
             <TextInput placeholder="Search & discover..." className="ml-3 flex-1" value={searchQuery} onChangeText={setSearchQuery}/>
           </View>
           {/* Search Results Overlay */}
           {searchQuery.length > 2 && (
             <View className="absolute top-full left-0 right-0 mt-1 z-50 bg-white shadow-lg rounded-md max-h-60 border border-gray-200">
               {searchResults.length > 0 ? (
                 <FlatList data={searchResults} keyExtractor={(item) => item.id}
                      renderItem={({item: product}) => (
                          <TouchableOpacity key={product.id} onPress={() => { setSearchQuery(''); setSearchResults([]); navigation.navigate("ProductDetails", { productId: product.id }); }} className="border-b border-gray-200 flex flex-row justify-between items-center py-2 px-4">
                              {/* Row for image/text */}
                              <View className="flex flex-row items-center flex-1 mr-2">
                                  {/* Image View */}
                                  {product.image?.url && (
                                      <View className="mr-3"><Image source={{ uri: imagePath(product.image.url) }} height={40} width={40} className="rounded-full bg-gray-200"/></View>
                                  )}
                                  {/* Text Details View */}
                                  <View className="flex-1">
                                      <Text className="text-base font-bold" numberOfLines={1}>{product.name || 'N/A'}</Text>
                                      {/* Using Text instead of HTMLView */}
                                      {product.details && typeof product.details === 'string' && product.details.length > 0 ? (<Text numberOfLines={1} style={htmlStyles.p}>{product.details.slice(0, 50) + '...'}</Text>) : null }
                                  </View>
                              </View>
                              {/* Chevron View */}
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

      {/* Main Content Grid */}
      {isLoadingCards ? ( <View style={styles.centered}><ActivityIndicator size="large" color="#5E9C8F" /><Text style={styles.infoText}>Loading actions...</Text></View>
      ) : cardError ? (
        // Display the error message from state
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={40} color="#DC2626" />
          <Text style={[styles.infoText, styles.errorText]}>{cardError}</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          renderItem={({ item: task }) => (
            <TouchableOpacity className="flex-1 h-32 justify-center items-center rounded-xl bg-primary-200 p-4 active:bg-primary-300" onPress={() => navigation.navigate(task.pageName)} accessibilityLabel={task.name}>
              <View className="flex justify-center items-center">
                <Icon name={task.iconName || "cart"} size={50} color="#5E9C8F"/>
                <Text className="font-bold text-[16px] mt-1 text-center text-gray-600">{task.name}</Text>
              </View>
            </TouchableOpacity>
          )}
          data={menuCards}
          numColumns={2}
          contentContainerStyle={{ gap, paddingBottom: 20 }}
          columnWrapperStyle={{ gap }}
          keyExtractor={(item) => item.id.toString()}
          className="m-3 flex-1"
          ListEmptyComponent={
             <View style={styles.centered}>
               {/* Show generic message if no cards loaded without error */}
               <Text className="text-center text-gray-500">No actions available for your role.</Text>
            </View>
           }
        />
      )}
    </View>
  );
}

// Added StyleSheet for Loading/Error states
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  infoText: { marginTop: 10, color: '#6B7280', textAlign: 'center' },
  errorText: { color: '#DC2626' },
  // Stylesheet for Text version of product details
  htmlStyles: { p: { margin: 0, color: '#6B7280', fontSize: 12 } }
});