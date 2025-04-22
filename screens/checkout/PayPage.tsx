// screens/checkout/PayPage.tsx
// MODIFIED: Replaced local image requires with online URIs for payment logos.

import { useContext, useEffect, useState } from "react";
import {
	Pressable,
	SafeAreaView,
	Modal,
	KeyboardAvoidingView,
	Image, // Import Image component
    ActivityIndicator, // Added for loading state
    Alert, // Added for better feedback
    StyleSheet, // Added for styles
    Platform // Added for KeyboardAvoidingView behavior
} from "react-native";
import { Text, View, TextInput } from "react-native";
import { WebView } from "react-native-webview"; // Keep if Paystack/Pesaflow uses it
import { Paystack } from "react-native-paystack-webview";
import { RadioButton } from "react-native-paper";
import { CartContext } from "../../providers/CartProvider"; // Corrected path likely needed
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { useToast } from "react-native-toast-notifications";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Added for modal close button

// --- Type Definitions ---
// (Assuming Order, Payment, Session types are globally defined or imported)

// Define a type for the route params for better clarity
type PayPageRouteParams = {
    orderId?: string; // For regular orders
    reservationId?: string; // For pre-order confirmation linking
    invoiceId?: string; // For pre-order payment initiation
    total: number; // Always required, represents pre-order total or order total
    paymentType?: 'preorder' | 'order'; // To distinguish the context
};

// Define structure for payment initiation response if different for pre-order
interface PreOrderPaymentResponse extends Payment {
    url?: string; // For Pesaflow redirect
    // Add any specific fields backend returns for pre-order payment init
}


export default function Pay({ navigation, route }) {
	const { session } = useContext(AuthContext);
	const { recordPayment } = useContext(CartContext); // May need adjustment for pre-orders
    const toast = useToast();

    // --- Use the type defined above ---
	const {
        orderId,
        reservationId,
        invoiceId,
        total, // This is the pre-calculated total (either order or pre-order) passed in
        paymentType = 'order' // Default to 'order' if not specified
    } = route.params as PayPageRouteParams;

    console.log("[PayPage] Received Params:", route.params);

	const [method, setMethod] = useState("");
	const [payer, setPayer] = useState(session?.phone || ""); // Default to session phone
	const [popup, setPopup] = useState(false);
	const [payment, setPayment] = useState<Payment | PreOrderPaymentResponse | null>(null);
	const [methodUrl, setMethodUrl] = useState(""); // For webview redirects like Pesaflow
	// --- Store relevant entity ID (order or reservation) ---
    const [entityId, setEntityId] = useState<string | null>(orderId || reservationId || null);
    // --- Store associated entity details if needed (optional, can reduce redundant fetches) ---
    const [entityDetails, setEntityDetails] = useState<Order | ReservationData | null>(null); // Use ReservationData type if defined elsewhere
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	const { firstName, lastName, email, phone } = session || {}; // Use session safely

    // --- Fetch Order/Reservation details ---
    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            try {
                if (paymentType === 'order' && orderId) {
                    console.log(`[PayPage] Fetching order details for ID: ${orderId}`);
                    const data = await api.get<Order>(`orders/${orderId}`);
                    setEntityDetails(data);
                    setEntityId(orderId);
                    navigation.setOptions({ title: data?.vendor?.name || "Pay Order" });
                } else if (paymentType === 'preorder' && reservationId) {
                    console.log(`[PayPage] Fetching reservation details for ID: ${reservationId}`);
                    // !!! --- ADD API CALL TO FETCH RESERVATION DETAILS IF NEEDED --- !!!
                    // const data = await api.get<ReservationData>(`reservations/${reservationId}`);
                    // setEntityDetails(data);
                    setEntityId(reservationId);
                    navigation.setOptions({ title: "Pay Pre-Order" });
                    // For now, just log it:
                    console.log("[PayPage] Pre-order: Displaying total passed via params. Full reservation details not fetched.");
                } else if (!orderId && !reservationId) {
                     console.error("[PayPage] Error: Missing required ID (orderId or reservationId).");
                     toast.show("Error: Missing required payment information.", { type: 'danger'});
                     navigation.goBack();
                } else {
                     navigation.setOptions({ title: "Complete Payment" }); // Generic title if no details fetched
                }
            } catch (err: any) {
                 console.error(`[PayPage] Error fetching ${paymentType} details:`, err);
                 toast.show(`Could not load ${paymentType} details.`, { type: 'danger' });
                 // Consider going back if details are essential
                 // navigation.goBack();
            } finally {
                 setIsLoading(false);
            }
        };

        fetchDetails();
        setPayer(session?.phone || ""); // Set default payer phone
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, reservationId, paymentType, navigation, session?.phone]); // Add toast later if used in catch

    // --- Handle Paystack Success ---
	const handleSuccess = async (e: {
		status: string;
		transactionRef: { reference: string; /* other fields */ };
	}) => {
        console.log("[PayPage] Paystack Success Event:", e);
		if (e.status === "success" && e.transactionRef?.reference) {
            setIsProcessingPayment(true);
            try {
                if (paymentType === 'preorder' && reservationId) {
                    console.log(`[PayPage] Confirming pre-order payment for reservation ${reservationId} with Paystack ref: ${e.transactionRef.reference}`);
                    // !!! --- REPLACE with your actual backend endpoint --- !!!
                    await api.post(`/reservations/${reservationId}/confirm-payment`, {
                        paymentReference: e.transactionRef.reference,
                        method: 'paystack', // Hardcoded for this block
                        amount: total,
                        status: 'completed'
                    });
                    toast.show("Pre-order payment successful!", { type: 'success' });
                    navigation.navigate("ReservationsPage"); // Navigate back to agenda

                } else if (paymentType === 'order' && orderId) {
                    console.log(`[PayPage] Recording payment for order ${orderId} with Paystack ref: ${e.transactionRef.reference}`);
                     await recordPayment(orderId, {
                         ref: e.transactionRef.reference,
                         status: 'completed',
                         method: 'paystack',
                         amount: total
                     });
                    toast.show("Order payment successful!", { type: 'success' });
                     navigation.navigate("OrdersPage"); // Navigate to orders list

                } else {
                     console.error("[PayPage] Paystack success but couldn't determine context (order/preorder). EntityID:", entityId);
                     throw new Error("Payment context unclear after Paystack success.");
                }
            } catch(err) {
                console.error("[PayPage] Error processing successful Paystack payment:", err);
                toast.show("Payment failed during system update. Please contact support.", { type: "danger", duration: 6000 });
            } finally {
                 setIsProcessingPayment(false);
                 setPopup(false); // Close the modal after processing
                 setMethod("");
            }
		} else {
             console.warn("[PayPage] Paystack success event but status !== 'success' or ref missing:", e);
             toast.show("Payment issue occurred via Paystack. Please verify or contact support.", { type: "warning", duration: 5000 });
             setPopup(false); // Close modal even on non-success status
             setMethod("");
        }
	};

	// --- Get Display Total (Uses passed-in total) ---
	const getDisplayTotal = () => total;

    // --- Calculate/Display Subtotal and Charges (Optional, based on fetched details) ---
    const getDisplaySubTotal = () => {
        if (paymentType === 'order' && entityDetails && 'items' in entityDetails) {
            return (entityDetails as Order)?.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        // Can't reliably calculate subtotal for pre-order without fetching associated items.
        return null; // Return null or handle differently if you fetch pre-order items
    };

    const getDisplayCharges = () => {
        if (paymentType === 'order' && entityDetails && 'meta' in entityDetails && (entityDetails as Order).meta?.charges) {
            return (entityDetails as Order).meta.charges;
        }
        // Pre-orders typically don't have separate charges applied during *this* step
        return {};
    };
    const subTotal = getDisplaySubTotal();
    const charges = getDisplayCharges();

	// --- Initiate Payment (e.g., for M-Pesa, Pesaflow) ---
	const processPayment = async () => {
        if (!method || !payer) return;
        setIsProcessingPayment(true);
        let paymentApiResponse: Payment | PreOrderPaymentResponse | null = null;
        const amountToPay = total; // Use the total passed in

        try {
             // Determine Vendor ID based on context
             let vendorIdForPayment: string | undefined = undefined;
             if (paymentType === 'order' && entityDetails && 'vendorId' in entityDetails) {
                 vendorIdForPayment = (entityDetails as Order).vendorId;
             } else if (paymentType === 'preorder' && entityDetails && 'vendorId' in entityDetails) {
                 vendorIdForPayment = (entityDetails as ReservationData).vendorId; // Assuming ReservationData has vendorId
             } else if(session?.vendor?.id){
                vendorIdForPayment = session.vendor.id; // Fallback to session vendor if details not loaded/available
             }

             if (!vendorIdForPayment) {
                 throw new Error("Could not determine Vendor ID for payment.");
             }


            const basePayload = {
                orderId: paymentType === 'order' ? entityId : undefined,
                reservationId: paymentType === 'preorder' ? entityId : undefined,
                invoiceId: paymentType === 'preorder' ? invoiceId : (entityDetails && 'invoices' in entityDetails && entityDetails.invoices?.length > 0 ? entityDetails.invoices[0].id : undefined),
                amount: amountToPay,
                payer: payer,
                userId: session?.id,
                method: method,
                vendorId: vendorIdForPayment, // Use determined vendorId
                paymentType: paymentType
            };

            // Remove undefined keys cleanly
            Object.keys(basePayload).forEach(key => basePayload[key] === undefined && delete basePayload[key]);

            console.log(`[PayPage] Initiating ${method} payment with payload:`, basePayload);

            if (method === "ke.mpesa") {
                 paymentApiResponse = await api.post<Payment>("payments", basePayload);
                 if (paymentApiResponse?.id) {
                     setPayment(paymentApiResponse);
                     setPopup(false);
                     toast.show("Check your phone for M-Pesa prompt.", { type: "info", duration: 10000});
                     // Navigate immediately - PaymentConfirmPage should handle polling/status updates
                     navigation.navigate("PaymentConfirmPage", { payment: paymentApiResponse });
                 } else {
                     throw new Error("M-Pesa initiation failed.");
                 }
            } else if (method === "pesaflow") {
                 paymentApiResponse = await api.post<PreOrderPaymentResponse>("payments", basePayload);
                 if (paymentApiResponse?.url) {
                     setMethodUrl(paymentApiResponse.url);
                     setPayment(paymentApiResponse);
                     setPopup(false);
                     // TODO: Implement WebView modal display for Pesaflow URL
                     Alert.alert("Pesaflow", "Pesaflow redirect not yet implemented in UI.");
                 } else {
                    throw new Error("Pesaflow initiation failed or did not return URL.");
                 }
            } else {
                throw new Error(`Unsupported payment method: ${method}`);
            }

        } catch (error: any) {
             console.error(`[PayPage] Error initiating ${method} payment:`, error);
             const message = error.response?.data?.message || error.message || "Payment initiation failed.";
             toast.show(message, { type: "danger" });
             setPopup(false); // Close modal on error
        } finally {
            setIsProcessingPayment(false);
        }
	};


	// --- Render ---
	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView contentContainerStyle={styles.scrollContainer}>
				<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#5E9C8F" style={{ flex: 1, justifyContent: 'center' }} />
                    ) : (
                        <>
                            {/* --- Order Summary --- */}
                            <View style={styles.summaryContainer}>
                                {subTotal !== null && ( // Only show subtotal if calculable
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Subtotal</Text>
                                        <Text style={styles.summaryValue}>KES {subTotal.toFixed(2)}</Text>
                                    </View>
                                )}

                                {Object.entries(charges).map(([charge, amount]) => (
                                    <View style={styles.summaryRow} key={charge}>
                                        <Text style={styles.summaryLabel}>{charge}</Text>
                                        <Text style={styles.summaryValue}>KES {Number(amount)?.toFixed(2)}</Text>
                                    </View>
                                ))}

                                <View style={[styles.summaryRow, styles.totalRow]}>
                                    <Text style={[styles.summaryLabel, styles.totalLabel]}>Total to Pay</Text>
                                    <Text style={[styles.summaryValue, styles.totalValue]}>KES {getDisplayTotal()?.toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* --- Payment Method Selection --- */}
                            <View style={styles.methodsContainer}>
                                <Text style={styles.methodsTitle}>Select Payment Method</Text>
                                <RadioButton.Group onValueChange={val => setMethod(val)} value={method}>
                                    {[
                                        { key: "ke.mpesa", label: "Lipa Na M-Pesa", img: { uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" } },
                                        { key: "paystack", label: "Card / Other Mobile", img: { uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Paystack_Logo.png/1200px-Paystack_Logo.png" } },
                                        { key: "pesaflow", label: "Pesaflow", img: { uri: "https://pesaflow.com/images/logo.png" } },
                                        // Add other methods like Airtel here if needed
                                    ].map(m => (
                                        <TouchableOpacity
                                            key={m.key}
                                            style={styles.methodButton}
                                            onPress={() => { setMethod(m.key); setPopup(true); }} // Always open popup for confirmation/webview
                                        >
                                            <View style={styles.methodContent}>
                                                <RadioButton value={m.key} color="#5E9C8F"/>
                                                <Text style={styles.methodLabel}>{m.label}</Text>
                                            </View>
                                            <Image source={m.img} style={styles.methodImage} />
                                        </TouchableOpacity>
                                    ))}
                                </RadioButton.Group>
                            </View>
                        </>
                    )}
				</KeyboardAvoidingView>
			</ScrollView>

            {/* --- Payment Modals --- */}
            <Modal animationType="slide" transparent={false} visible={popup} onRequestClose={() => { setPopup(false); setMethod(""); }}>
                <SafeAreaView style={{ flex: 1 }}>

                    {/* M-Pesa Input Modal */}
                    {method === "ke.mpesa" && (
                        <View style={styles.modalView}>
                            <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" }} resizeMode="contain" style={styles.modalImage}/>
                            <Text style={styles.modalText}>Pay <Text style={styles.modalAmount}>KES {getDisplayTotal()?.toFixed(2)}</Text> via Lipa Na M-Pesa</Text>
                            <Text style={styles.modalSubText}>Enter your M-Pesa phone number:</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. 0712345678"
                                keyboardType="phone-pad"
                                value={payer} // Controlled component
                                onChangeText={setPayer} // Update state
                            />
                            <TouchableOpacity
                                onPress={processPayment}
                                disabled={isProcessingPayment || !payer || payer.length < 9} // Basic validation
                                style={[styles.modalButton, styles.modalConfirmButton, (isProcessingPayment || !payer || payer.length < 9) && styles.disabledButton]}
                            >
                                {isProcessingPayment ? <ActivityIndicator color="white" /> : <Text style={styles.modalButtonText}>Confirm & Pay</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setPopup(false); setMethod(""); }} style={styles.modalCloseLink}>
                                <Text style={styles.modalCloseLinkText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Paystack WebView Modal */}
                    {method === "paystack" && entityId && (
                        <View style={{ flex: 1 }}>
                            <Paystack
                                // IMPORTANT: Use your ACTUAL Paystack Public Key (Test or Live)
                                paystackKey="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" // REPLACE THIS
                                refNumber={`${paymentType}-${entityId}-${Date.now()}`}
                                amount={getDisplayTotal()} // Use the state total
                                billingEmail={email || 'customer@example.com'} // Use session email or a fallback
                                billingName={`${firstName || ''} ${lastName || 'Customer'}`.trim()}
                                activityIndicatorColor="#5E9C8F"
                                channels={['card', 'mobile_money']} // Customize as needed
                                currency="KES"
                                onCancel={(e) => { console.log("Paystack Cancelled:", e); setPopup(false); setMethod(""); toast.show("Payment cancelled.", { type: 'warning' }); }}
                                onSuccess={handleSuccess}
                                autoStart={true}
                                style={{ flex: 1 }} // Ensure WebView takes full space
                            />
                            {/* Improved Close Button for Paystack Modal */}
                            <TouchableOpacity
                                style={styles.paystackCloseButton}
                                onPress={() => { setPopup(false); setMethod(""); toast.show("Payment cancelled.", { type: 'warning' }); }}
                            >
                                <Icon name="close-circle" size={30} color="#555" />
                            </TouchableOpacity>
                        </View>
                    )}

                     {/* --- Add Pesaflow WebView Modal Here --- */}
                    {method === "pesaflow" && methodUrl && (
                        <View style={{ flex: 1 }}>
                             <WebView source={{ uri: methodUrl }} style={{ flex: 1 }} />
                             {/* Add a close button as WebView might not have one */}
                             <TouchableOpacity style={styles.paystackCloseButton} onPress={() => { setPopup(false); setMethod(""); }}>
                                 <Icon name="close-circle" size={30} color="#555" />
                             </TouchableOpacity>
                         </View>
                    )}

                 </SafeAreaView>
            </Modal>
		</SafeAreaView>
	);
}

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    scrollContainer: { flexGrow: 1, padding: 16, paddingBottom: 30 }, // Added paddingBottom
    summaryContainer: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB', },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, },
    summaryLabel: { fontSize: 16, color: '#4B5563' },
    summaryValue: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
    totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 8, },
    totalLabel: { fontWeight: 'bold', fontSize: 18 },
    totalValue: { fontWeight: 'bold', fontSize: 18 },
    methodsContainer: { marginTop: 10, },
    methodsTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111827' },
    methodButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 10, },
    methodContent: { flexDirection: 'row', alignItems: 'center', flex: 1, },
    methodLabel: { marginLeft: 10, fontSize: 16, color: '#374151' },
    methodImage: { width: 80, height: 30, resizeMode: 'contain', marginLeft: 10 },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    modalImage: { width: 150, height: 150, marginBottom: 20 },
    modalText: { fontSize: 18, textAlign: 'center', marginBottom: 5, paddingHorizontal: 10 },
    modalAmount: { fontWeight: 'bold' },
    modalSubText: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
    modalInput: { width: '100%', borderWidth: 1, borderColor: '#9CA3AF', borderRadius: 6, padding: 12, marginBottom: 20, fontSize: 16, textAlign: 'center' },
    modalButton: { borderRadius: 8, paddingVertical: 14, width: '100%', alignItems: 'center', marginBottom: 15 },
    modalConfirmButton: { backgroundColor: '#16A34A' },
    modalButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    modalCloseLink: { marginTop: 10 },
    modalCloseLinkText: { color: '#5E9C8F', fontWeight: '500' },
    disabledButton: { backgroundColor: '#9CA3AF' },
    paystackCloseButton: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 15, backgroundColor: 'rgba(255,255,255,0.7)', padding: 8, borderRadius: 15, zIndex: 10 }, // Adjusted for visibility
});