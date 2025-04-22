// screens/customers/ReservationWizard.tsx

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
    SafeAreaView, View, Text, ScrollView, TouchableOpacity, TextInput,
    StyleSheet, ActivityIndicator, Pressable, FlatList, Alert, Image
} from 'react-native';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useToast } from "react-native-toast-notifications";

import { AuthContext, AuthContextType } from '../../providers/AuthProvider'; // Adjust path
import { api, imagePath } from '../../utils/api'; // Adjust path

// --- Type Definitions ---
// Reusing interfaces from ReservationsPage where applicable
interface Customer { id: string | number; name?: string; firstName?: string; lastName?: string; }
interface Restaurant { id: string | number; name: string; /* Add other fields as needed */ }
interface Section { id: string | number; name: string; }
interface Product { id: string; name: string; price: number; image?: { url?: string | null } | null; }
interface PreOrderItem extends Product { quantity: number; }

// Data structure for the reservation being built
interface ReservationFormData {
    restaurantId: string | number | null;
    date: string; // YYYY-MM-DD format
    time: string | null; // HH:MM format
    guests: number;
    occasion: string;
    notes: string;
    preOrderItems: PreOrderItem[];
    parkingRequested: boolean;
    numberPlates: string[];
    branchId?: string; // From session
    vendorId?: string; // From session
    userId?: string;   // From session
    sectionId?: string | number | null; // Added for potential table booking logic later
    lotId?: string | number | null;     // Added for potential table booking logic later
}

// Define ParamList for type safety with navigation route
type ReservationWizardRouteParams = {
    ReservationWizard: {
        selectedDate: string;
    };
};

// --- Wizard Component ---
export default function ReservationWizard() {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ReservationWizardRouteParams, 'ReservationWizard'>>();
    const toast = useToast();
    const { session } = useContext<AuthContextType>(AuthContext);

    const selectedDateFromRoute = route.params?.selectedDate;

    // --- State ---
    const [currentStep, setCurrentStep] = useState(0);
    const [reservationData, setReservationData] = useState<ReservationFormData>({
        restaurantId: null,
        date: selectedDateFromRoute || format(new Date(), 'yyyy-MM-dd'), // Default if not passed
        time: null,
        guests: 1,
        occasion: '',
        notes: '',
        preOrderItems: [],
        parkingRequested: false,
        numberPlates: [],
        branchId: session?.branch?.id ?? undefined,
        vendorId: session?.vendor?.id ?? undefined,
        userId: session?.id ?? undefined,
        sectionId: null,
        lotId: null,
    });

    const [restaurants, setRestaurants] = useState<{ key: string | number; value: string }[]>([]);
    const [preOrderProducts, setPreOrderProducts] = useState<Product[]>([]);
    const [filteredPreOrderProducts, setFilteredPreOrderProducts] = useState<Product[]>([]);
    const [preOrderSearchQuery, setPreOrderSearchQuery] = useState('');
    const [sections, setSections] = useState<{ key: string | number; value: string }[]>([]); // For future table booking
    const [lots, setLots] = useState<{ key: string | number; value: string }[]>([]);     // For future table booking
    const [occasions] = useState([ // Example occasions - fetch from API if dynamic
        { key: 'Birthday', value: 'Birthday' },
        { key: 'Anniversary', value: 'Anniversary' },
        { key: 'Business Lunch/Dinner', value: 'Business Lunch/Dinner' },
        { key: 'Casual Dining', value: 'Casual Dining' },
        { key: 'Other', value: 'Other' },
    ]);
    const [selectedHour, setSelectedHour] = useState<string | null>(null);
    const [selectedMinute, setSelectedMinute] = useState<string | null>(null);
    const [currentNumberPlate, setCurrentNumberPlate] = useState('');

    const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
    const [isLoadingPreOrders, setIsLoadingPreOrders] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Helper Functions ---
    const updateReservationData = useCallback((newData: Partial<ReservationFormData>) => {
        setReservationData(prev => ({ ...prev, ...newData }));
    }, []);

    // Generate time options (can be customized)
    const timeOptions = useMemo(() => {
        const hours = Array.from({ length: 24 }, (_, i) => ({ key: String(i).padStart(2, '0'), value: String(i).padStart(2, '0') }));
        const minutes = [
            { key: '00', value: '00' },
            { key: '15', value: '15' },
            { key: '30', value: '30' },
            { key: '45', value: '45' },
        ];
        return { hours, minutes };
    }, []);

    // --- Effects ---

    // Set session IDs when session loads
    useEffect(() => {
        if (session?.branch?.id || session?.vendor?.id || session?.id) {
            updateReservationData({
                branchId: session.branch?.id ?? reservationData.branchId,
                vendorId: session?.vendor?.id ?? reservationData.vendorId,
                userId: session?.id ?? reservationData.userId,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]); // updateReservationData is memoized

    // Fetch Restaurants
    useEffect(() => {
        setIsLoadingRestaurants(true);
        // !!! REPLACE WITH YOUR ACTUAL API CALL !!!
        // Example structure:
        // api.get<Restaurant[]>('/restaurants') // Assuming API returns Restaurant[]
        //   .then(response => {
        //     if (Array.isArray(response)) {
        //       setRestaurants(response.map(r => ({ key: r.id, value: r.name })));
        //     }
        //   })
        //   .catch(err => { console.error("Failed to fetch restaurants:", err); toast.show("Could not load restaurants.", { type: 'danger' }); })
        //   .finally(() => setIsLoadingRestaurants(false));

        // --- Placeholder Data ---
        setTimeout(() => {
             setRestaurants([
                 { key: 'rest1', value: 'The Grand Brasserie' },
                 { key: 'rest2', value: 'Ocean Basket Rooftop' },
                 { key: 'rest3', value: 'Garden Cafe' },
             ]);
             setIsLoadingRestaurants(false);
        }, 500); // Simulate fetch
    }, [toast]); // Add toast if using it in error handling

    // Fetch Pre-order Products (only when step 2 becomes active)
    useEffect(() => {
        if (currentStep === 2 && preOrderProducts.length === 0) { // Fetch only once when needed
             setIsLoadingPreOrders(true);
             // !!! REPLACE WITH YOUR ACTUAL API CALL !!!
             // Example: api.get<Product[]>('/products?isPreOrder=true') or similar
             // api.get<Product[]>('/products?category=pre-order') // Example endpoint
             //     .then(response => {
             //         if (Array.isArray(response)) { setPreOrderProducts(response); setFilteredPreOrderProducts(response); }
             //     })
             //     .catch(err => { console.error("Failed to fetch pre-order items:", err); toast.show("Could not load pre-order items.", { type: 'danger' }); })
             //     .finally(() => setIsLoadingPreOrders(false));

             // --- Placeholder Data ---
             setTimeout(() => {
                 const items = [
                     { id: 'cake1', name: 'Chocolate Cake (Slice)', price: 500, image: { url: null } },
                     { id: 'champ1', name: 'House Champagne (Bottle)', price: 4500, image: { url: null } },
                     { id: 'cake2', name: 'Red Velvet Cake (Whole)', price: 3000, image: { url: null } },
                     { id: 'wine1', name: 'Sparkling Wine (Bottle)', price: 2500, image: { url: null } },
                 ];
                 setPreOrderProducts(items);
                 setFilteredPreOrderProducts(items);
                 setIsLoadingPreOrders(false);
             }, 500);
        }
    }, [currentStep, preOrderProducts.length, toast]);

    // Update reservation time when hour or minute changes
    useEffect(() => {
        if (selectedHour !== null && selectedMinute !== null) {
            updateReservationData({ time: `${selectedHour}:${selectedMinute}` });
        } else {
            updateReservationData({ time: null }); // Clear if incomplete
        }
    }, [selectedHour, selectedMinute, updateReservationData]);

    // Filter pre-order products based on search query
    useEffect(() => {
        if (preOrderSearchQuery === '') {
            setFilteredPreOrderProducts(preOrderProducts);
        } else {
            setFilteredPreOrderProducts(
                preOrderProducts.filter(p =>
                    p.name.toLowerCase().includes(preOrderSearchQuery.toLowerCase())
                )
            );
        }
    }, [preOrderSearchQuery, preOrderProducts]);


    // --- Step Navigation ---
    const handleNextStep = () => {
        // Add validation per step if needed
        if (currentStep === 0 && (!reservationData.restaurantId || !reservationData.time)) {
            toast.show("Please select restaurant and time.", { type: 'warning' });
            return;
        }
        if (currentStep === 1 && (!reservationData.guests || !reservationData.occasion)) {
            toast.show("Please enter guest count and occasion.", { type: 'warning' });
            return;
        }
        // Add more validation for other steps...
        if (currentStep < 4) { // 4 is the last step (index)
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    // --- Pre-Order Item Management ---
    const addPreOrderItem = (product: Product) => {
        setReservationData(prev => {
            const existingItemIndex = prev.preOrderItems.findIndex(item => item.id === product.id);
            let newItems: PreOrderItem[];
            if (existingItemIndex > -1) {
                // Item exists, increment quantity
                newItems = prev.preOrderItems.map((item, index) =>
                    index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                // Add new item
                newItems = [...prev.preOrderItems, { ...product, quantity: 1 }];
            }
            return { ...prev, preOrderItems: newItems };
        });
         toast.show(`${product.name} added to pre-order.`, { type: "success", duration: 1500 });
    };

    const updatePreOrderItemQuantity = (productId: string, change: number) => {
        setReservationData(prev => {
            const newItems = prev.preOrderItems
                .map(item =>
                    item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
                )
                .filter(item => item.quantity > 0); // Remove if quantity becomes 0 or less
            return { ...prev, preOrderItems: newItems };
        });
    };

    // Calculate pre-order total
    const preOrderTotal = useMemo(() => {
        return reservationData.preOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [reservationData.preOrderItems]);

    // --- Parking Management ---
    const addNumberPlate = () => {
        if (currentNumberPlate.trim()) {
            setReservationData(prev => ({
                ...prev,
                numberPlates: [...prev.numberPlates, currentNumberPlate.trim()]
            }));
            setCurrentNumberPlate(''); // Clear input
        }
    };

    const removeNumberPlate = (indexToRemove: number) => {
        setReservationData(prev => ({
            ...prev,
            numberPlates: prev.numberPlates.filter((_, index) => index !== indexToRemove)
        }));
    };

    // --- Final Submission Logic ---
    const handleConfirmReservation = async () => {
        setIsSubmitting(true);
        console.log("Submitting Reservation (No Pre-order):", reservationData);
        try {
            // !!! REPLACE WITH YOUR ACTUAL API CALL !!!
            // const response = await api.post('/reservations', reservationData); // Pass the collected data
            // console.log("Reservation Confirmed:", response);
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            toast.show("Reservation Confirmed!", { type: "success" });
            navigation.goBack(); // Go back to the agenda page
        } catch (error: any) {
            console.error("Error confirming reservation:", error);
            toast.show(`Error: ${error.message || 'Could not confirm reservation.'}`, { type: "danger" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProceedToPayment = async () => {
        setIsSubmitting(true);
        console.log("Initiating Pre-order Payment Flow:", reservationData);
        try {
             // !!! REPLACE WITH YOUR ACTUAL API CALL !!!
            // const response = await api.post('/reservations/initiate-preorder', reservationData);
            // const { reservationId, preOrderInvoiceId } = response; // Assuming backend returns these
            // console.log("Pre-order Initiated:", response);

            // --- Placeholder ---
            const reservationId = `res-${Date.now()}`;
            const preOrderInvoiceId = `inv-${Date.now()}`;
            await new Promise(resolve => setTimeout(resolve, 1000));
            // --- End Placeholder ---


            // Navigate to PayPage with necessary details
            navigation.navigate('Pay', { // <--- CHANGED 'PayPage' to 'Pay'
                reservationId: reservationId,
                invoiceId: preOrderInvoiceId,
                total: preOrderTotal,
                paymentType: 'preorder'
            });
            // Reset wizard state maybe? Or handle on PayPage success/cancel?

        } catch (error: any) {
            console.error("Error initiating pre-order payment:", error);
            toast.show(`Error: ${error.message || 'Could not initiate pre-order.'}`, { type: "danger" });
            setIsSubmitting(false); // Re-enable button on error
        }
        // Don't set isSubmitting to false here, navigation handles the transition
    };

    // --- Render Current Step ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Restaurant & Time
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Location & Time</Text>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Restaurant/Area *</Text>
                            {isLoadingRestaurants ? <ActivityIndicator /> : (
                                <SelectList
                                    setSelected={(val) => updateReservationData({ restaurantId: val })}
                                    data={restaurants}
                                    save="key"
                                    placeholder="Select an area to dine"
                                    boxStyles={styles.selectBox}
                                    dropdownStyles={styles.dropdown}
                                    search={false} // Disable search if list is short
                                    defaultOption={restaurants.find(r => r.key === reservationData.restaurantId)}
                                    notFoundText="No restaurants available"
                                />
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Date</Text>
                            <Text style={styles.dateDisplay}>{reservationData.date || 'Error: Date not found'}</Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Time *</Text>
                            <View style={styles.timeRow}>
                                <View style={styles.timeColumn}>
                                    <SelectList
                                        setSelected={setSelectedHour}
                                        data={timeOptions.hours}
                                        save="key" placeholder="Hour" search={false}
                                        boxStyles={styles.selectBox} dropdownStyles={styles.dropdown}
                                        defaultOption={timeOptions.hours.find(h => h.key === selectedHour)}
                                    />
                                </View>
                                <Text style={styles.timeSeparator}>:</Text>
                                <View style={styles.timeColumn}>
                                    <SelectList
                                        setSelected={setSelectedMinute}
                                        data={timeOptions.minutes}
                                        save="key" placeholder="Minute" search={false}
                                        boxStyles={styles.selectBox} dropdownStyles={styles.dropdown}
                                        defaultOption={timeOptions.minutes.find(m => m.key === selectedMinute)}
                                    />
                                </View>
                            </View>
                            {reservationData.time && <Text style={styles.timeDisplay}>Selected Time: {reservationData.time}</Text>}
                        </View>
                    </View>
                );
            case 1: // Details (Guests, Occasion, Notes)
                return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Reservation Details</Text>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Number of Guests *</Text>
                            <TextInput
                                style={styles.textInput}
                                keyboardType="numeric"
                                value={String(reservationData.guests)}
                                onChangeText={(text) => updateReservationData({ guests: parseInt(text, 10) || 1 })}
                                placeholder="e.g., 4"
                            />
                        </View>
                         <View style={styles.formGroup}>
                             <Text style={styles.label}>Occasion *</Text>
                             <SelectList
                                setSelected={(val) => updateReservationData({ occasion: val })}
                                data={occasions}
                                save="value" // Save the display value
                                placeholder="Select an occasion"
                                boxStyles={styles.selectBox}
                                dropdownStyles={styles.dropdown}
                                search={false}
                                defaultOption={occasions.find(o => o.value === reservationData.occasion)}
                             />
                         </View>
                         <View style={styles.formGroup}>
                             <Text style={styles.label}>Notes (Optional)</Text>
                             <TextInput
                                style={[styles.textInput, styles.textArea]}
                                multiline
                                value={reservationData.notes}
                                onChangeText={(text) => updateReservationData({ notes: text })}
                                placeholder="e.g., Allergy information, specific table request..."
                             />
                         </View>
                    </View>
                );
            case 2: // Pre-Order
                 return (
                    <View style={styles.stepContainer}>
                        <Text style={styles.stepTitle}>Pre-Order Items (Optional)</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Search pre-order items..."
                            value={preOrderSearchQuery}
                            onChangeText={setPreOrderSearchQuery}
                        />
{isLoadingPreOrders ? <ActivityIndicator style={{marginTop: 10}} /> : (
    <FlatList
        data={filteredPreOrderProducts}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false} // <--- ADD THIS LINE
        contentContainerStyle={{ paddingBottom: 10, marginTop: 10 }}
        ListEmptyComponent={<Text style={styles.infoText}>No matching items found.</Text>}
        renderItem={({ item: product }) => (
             <View style={styles.preOrderItem}>
                 <View style={styles.preOrderItemInfo}>
                      <Text style={styles.preOrderItemName}>{product.name}</Text>
                      <Text style={styles.preOrderItemPrice}>KES {product.price}</Text>
                 </View>
                 <TouchableOpacity style={styles.addButton} onPress={() => addPreOrderItem(product)}>
                     <Icon name="plus" size={20} color="white" />
                 </TouchableOpacity>
             </View>
        )}
    />
)}
                         {/* Display selected pre-order items */}
                        {reservationData.preOrderItems.length > 0 && (
                            <View style={styles.selectedItemsContainer}>
                                <Text style={styles.selectedItemsTitle}>Selected Pre-orders:</Text>
                                {reservationData.preOrderItems.map((item) => (
                                    <View key={item.id} style={styles.selectedItem}>
                                        <Text style={styles.selectedItemText}>{item.name}</Text>
                                        <View style={styles.quantityControl}>
                                            <TouchableOpacity onPress={() => updatePreOrderItemQuantity(item.id, -1)}><Icon name="minus-circle-outline" size={22} color="#DC2626" /></TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updatePreOrderItemQuantity(item.id, 1)}><Icon name="plus-circle-outline" size={22} color="#16A34A" /></TouchableOpacity>
                                        </View>
                                        <Text style={styles.selectedItemPrice}>KES {item.price * item.quantity}</Text>
                                    </View>
                                ))}
                                <Text style={styles.preOrderTotal}>Pre-order Total: KES {preOrderTotal}</Text>
                            </View>
                        )}
                    </View>
                 );
            case 3: // Parking
                 return (
                     <View style={styles.stepContainer}>
                         <Text style={styles.stepTitle}>Parking (Optional)</Text>
                         <TouchableOpacity
                             style={styles.checkboxContainer}
                             onPress={() => updateReservationData({ parkingRequested: !reservationData.parkingRequested })}
                         >
                             <Icon
                                 name={reservationData.parkingRequested ? "checkbox-marked-outline" : "checkbox-blank-outline"}
                                 size={24}
                                 color="#5E9C8F"
                             />
                             <Text style={styles.checkboxLabel}>Request Parking</Text>
                         </TouchableOpacity>

                         {reservationData.parkingRequested && (
                             <>
                                 <View style={styles.formGroup}>
                                     <Text style={styles.label}>Vehicle Number Plate(s)</Text>
                                     <View style={styles.plateInputRow}>
                                         <TextInput
                                             style={[styles.textInput, styles.plateInput]}
                                             value={currentNumberPlate}
                                             onChangeText={setCurrentNumberPlate}
                                             placeholder="e.g., KDA 123X"
                                             autoCapitalize="characters"
                                         />
                                         <TouchableOpacity style={styles.addPlateButton} onPress={addNumberPlate} disabled={!currentNumberPlate.trim()}>
                                             <Text style={styles.addPlateButtonText}>Add</Text>
                                         </TouchableOpacity>
                                     </View>
                                 </View>
                                 {reservationData.numberPlates.length > 0 && (
                                     <View style={styles.plateList}>
                                         {reservationData.numberPlates.map((plate, index) => (
                                             <View key={index} style={styles.plateListItem}>
                                                 <Text style={styles.plateListText}>{plate}</Text>
                                                 <TouchableOpacity onPress={() => removeNumberPlate(index)}>
                                                     <Icon name="close-circle" size={20} color="#DC2626" />
                                                 </TouchableOpacity>
                                             </View>
                                         ))}
                                     </View>
                                 )}
                             </>
                         )}
                     </View>
                 );
            case 4: // Summary & Submit
                 return (
                     <View style={styles.stepContainer}>
                         <Text style={styles.stepTitle}>Confirm Reservation</Text>
                         <View style={styles.summaryBox}>
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Restaurant:</Text> {restaurants.find(r=>r.key === reservationData.restaurantId)?.value || 'N/A'}</Text>
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Date:</Text> {reservationData.date}</Text>
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Time:</Text> {reservationData.time || 'N/A'}</Text>
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Guests:</Text> {reservationData.guests}</Text>
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Occasion:</Text> {reservationData.occasion || 'N/A'}</Text>
                             {reservationData.notes && <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Notes:</Text> {reservationData.notes}</Text>}
                             {reservationData.preOrderItems.length > 0 && (
                                 <>
                                    <Text style={styles.summaryLabel}>Pre-orders:</Text>
                                    {reservationData.preOrderItems.map(item => (
                                        <Text key={item.id} style={styles.summarySubItem}>- {item.name} (x{item.quantity})</Text>
                                    ))}
                                    <Text style={styles.summaryTotal}>Pre-order Total: KES {preOrderTotal}</Text>
                                 </>
                             )}
                             <Text style={styles.summaryItem}><Text style={styles.summaryLabel}>Parking:</Text> {reservationData.parkingRequested ? 'Requested' : 'Not Requested'}</Text>
                             {reservationData.parkingRequested && reservationData.numberPlates.length > 0 && (
                                 <>
                                     <Text style={styles.summaryLabel}>Number Plates:</Text>
                                     {reservationData.numberPlates.map((plate, index) => (
                                         <Text key={index} style={styles.summarySubItem}>- {plate}</Text>
                                     ))}
                                </>
                             )}
                         </View>
                     </View>
                 );
            default:
                return <View><Text>Unknown Step</Text></View>;
        }
    };

    // --- Render ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                {renderStepContent()}
            </ScrollView>

            {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
                {currentStep > 0 && (
                    <TouchableOpacity
                        style={[styles.navButton, styles.backButton]}
                        onPress={handlePrevStep}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.navButtonText}>Back</Text>
                    </TouchableOpacity>
                )}
                {currentStep < 4 ? (
                    <TouchableOpacity
                        style={[styles.navButton, styles.nextButton]}
                        onPress={handleNextStep}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.navButtonText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    // Final Step Button(s)
                    reservationData.preOrderItems.length > 0 ? (
                         <TouchableOpacity
                            style={[styles.navButton, styles.payButton, isSubmitting && styles.disabledButton]}
                            onPress={handleProceedToPayment}
                            disabled={isSubmitting}
                         >
                            {isSubmitting ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.navButtonText}>Proceed to Pay Pre-order (KES {preOrderTotal})</Text>}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.navButton, styles.confirmButton, isSubmitting && styles.disabledButton]}
                            onPress={handleConfirmReservation}
                            disabled={isSubmitting}
                        >
                             {isSubmitting ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.navButtonText}>Confirm Reservation</Text>}
                        </TouchableOpacity>
                    )
                )}
            </View>
        </SafeAreaView>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' }, // Light background
    scrollViewContent: { paddingBottom: 80 }, // Space for nav buttons
    stepContainer: { padding: 20 },
    stepTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#111827' },
    formGroup: { marginBottom: 18 },
    label: { marginBottom: 6, fontSize: 14, fontWeight: '500', color: '#374151' },
    selectBox: { borderColor: "#9CA3AF", borderRadius: 6, backgroundColor: 'white', minHeight: 48, alignItems: 'center', borderWidth: 1 },
    dropdown: { borderColor: "#9CA3AF", borderRadius: 6, backgroundColor: 'white', zIndex: 1000 }, // Higher zIndex
    badge: { backgroundColor: "#65A694", paddingVertical: 4, paddingHorizontal: 8 },
    dateDisplay: { fontSize: 16, padding: 12, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, backgroundColor: '#E5E7EB', color: '#4B5563'},
    timeRow: { flexDirection: 'row', alignItems: 'center' },
    timeColumn: { flex: 1 },
    timeSeparator: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 10, color: '#6B7280' },
    timeDisplay: { marginTop: 10, fontSize: 15, color: '#4B5563', fontStyle: 'italic' },
    textInput: { borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, backgroundColor: 'white' },
    textArea: { height: 100, textAlignVertical: 'top' },
    preOrderList: { maxHeight: 200, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6 },
    preOrderItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    preOrderItemInfo: { flex: 1, marginRight: 10 },
    preOrderItemName: { fontSize: 15, fontWeight: '500' },
    preOrderItemPrice: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    addButton: { backgroundColor: '#10B981', padding: 8, borderRadius: 15 },
    selectedItemsContainer: { marginTop: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 8 },
    selectedItemsTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    selectedItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    selectedItemText: { flex: 1, marginRight: 10, fontSize: 14 },
    quantityControl: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
    quantityText: { marginHorizontal: 8, fontSize: 15, minWidth: 20, textAlign: 'center'},
    selectedItemPrice: { fontWeight: '500', fontSize: 14 },
    preOrderTotal: { marginTop: 12, fontSize: 16, fontWeight: 'bold', textAlign: 'right' },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkboxLabel: { marginLeft: 8, fontSize: 16 },
    plateInputRow: { flexDirection: 'row', alignItems: 'center' },
    plateInput: { flex: 1, marginRight: 10 },
    addPlateButton: { backgroundColor: '#5E9C8F', paddingHorizontal: 15, paddingVertical: 11, borderRadius: 6 },
    addPlateButtonText: { color: 'white', fontWeight: '500' },
    plateList: { marginTop: 10 },
    plateListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    plateListText: { fontSize: 15 },
    summaryBox: { padding: 15, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 20},
    summaryItem: { fontSize: 16, marginBottom: 8, lineHeight: 22 },
    summaryLabel: { fontWeight: '600', color: '#374151' },
    summarySubItem: { fontSize: 15, marginLeft: 15, color: '#4B5563'},
    summaryTotal: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#1F2937'},
    navigationButtons: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: 'white', position: 'absolute', bottom: 0, left: 0, right: 0 },
    navButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
    backButton: { backgroundColor: '#D1D5DB' },
    nextButton: { backgroundColor: '#5E9C8F', flex: 1, marginLeft: 10 }, // Make next fill space if back exists
    confirmButton: { backgroundColor: '#16A34A', flex: 1, marginLeft: 10 },
    payButton: { backgroundColor: '#3B82F6', flex: 1, marginLeft: 10 },
    disabledButton: { backgroundColor: '#9CA3AF' },
    navButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    infoText: { textAlign: 'center', color: '#6B7280', marginTop: 10 },
});