// ReservationsPage.tsx
// Path: src/screens/customers/ReservationsPage.tsx
// MODIFIED: Removed 'creating' state and Modal for old Reservation component.
// MODIFIED: "New Reservation" button now navigates to 'ReservationWizard'.

import React, { useEffect, useState, useCallback } from "react";
import {
	Image,
	Platform,
	Pressable,
	StatusBar,
	Text,
	View,
	SafeAreaView,
	ScrollView,
	Modal, // Keep Modal for Details view
	TouchableOpacity,
	StyleSheet,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { api, imagePath } from "../../utils/api"; // Adjust path if needed
import {
	Agenda,
	DateData,
	AgendaEntry,
	AgendaSchedule,
} from "react-native-calendars";
import { format, isValid } from 'date-fns'; // Removed unused imports
import { useToast } from "react-native-toast-notifications";

// --- REMOVED OLD Reservation component import ---
// import Reservation from "../../components/Reservation"; // No longer needed here

// --- Interfaces (Keep as is) ---
interface Customer {
    id: string | number; name?: string; firstName?: string; lastName?: string; phone?: string;
	avatar?: { url: string | null } | null; avatarUrl?: string | null;
}
interface ReservationItem {
    id: string | number; name: string; quantity?: number; price?: number;
    pivot?: { quantity?: number; price?: number; meta?: any };
}
interface Section { id: string | number; name: string; }
interface Branch { id: string | number; name: string; }
interface Lot { id: string | number; name: string; }
interface AssociatedOrder { id: string | number; items?: ReservationItem[]; }

interface ReservationData {
	id: string | number;
	reservation_start: string;
	reservation_end: string;
	headCount?: number;
	status: string;
	notes?: string | null;
	branchId?: string;
	lotId?: string | null;
	sectionId?: string | null;
	orderId?: string | null;
	userId?: string;
    createdAt?: string;
    updatedAt?: string;
	user?: Customer | null;
	section?: Section | null;
	branch?: Branch | null;
	lot?: Lot | null;
	order?: AssociatedOrder | null;
    delivery?: string;
	type?: string;
    action?: string;
    ref?: string | null;
}

interface AgendaReservationEntry extends AgendaEntry {
	name: string; height: number; day: string;
	data: ReservationData;
}

interface PaginatedData<T> {
    meta: { total: number; per_page: number; current_page: number; last_page: number; first_page: number; first_page_url: string | null; last_page_url: string | null; next_page_url: string | null; previous_page_url: string | null; };
    data: T[];
}

// --- Component ---
export default function ReservationsPage({ navigation }) {
	const [status, setStatus] = useState("Pending");
	const [selectedReservation, setSelectedReservation] = useState<ReservationData | undefined>(undefined);
	// --- REMOVED 'creating' state ---
	// const [creating, setCreating] = useState(false);
	const [items, setItems] = useState<AgendaSchedule<AgendaReservationEntry>>({});
	const [selected, setSelected] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
    const [isLoading, setIsLoading] = useState(false);
	const toast = useToast();

	// --- StatusBar (Keep as is) ---
	useEffect(() => {
        StatusBar.setBarStyle("dark-content");
        if (Platform.OS === "android") {
            StatusBar.setBackgroundColor("rgba(255,255,255,1)");
            StatusBar.setTranslucent(false);
        }
	}, []);

    // --- Update Navigation Title (Keep as is) ---
	useEffect(() => {
		navigation.setOptions({ title: `Reservations: ${selected}` });
	}, [selected, navigation]);

	// --- Effect to Fetch Data AND Update Agenda Items (Keep as is) ---
	useEffect(() => {
		const fetchDataAndUpdateAgenda = async () => {
            console.log(`Fetching reservations for date: ${selected}`);
            setIsLoading(true);

            const params = new URLSearchParams({
                start: selected, // Send selected date
                status: status,
                limit: '100',
                page: '1',
            });
            const urlWithParams = `/v1/reservations?${params.toString()}`;
            console.log("Requesting URL:", urlWithParams);

			let response;
			try {
                response = await api.get<PaginatedData<ReservationData>>(urlWithParams);
				const fetchedData = response?.data?.data || [];
				console.log(`Fetched ${fetchedData.length} reservations.`);

                const newAgendaItemsForDate: AgendaReservationEntry[] = [];
                fetchedData.forEach(res => {
                    const reservationDate = res.reservation_start;
                    try {
                        if (!reservationDate || isNaN(new Date(reservationDate).getTime())) {
                            throw new Error(`Invalid reservation_start date: ${reservationDate}`);
                        }
                        const dateStr = format(new Date(reservationDate), 'yyyy-MM-dd');
                        const timeStr = format(new Date(reservationDate), 'HH:mm');
                        if (dateStr !== selected) { return; }

                        const customerData = res.user;
                        const customerName = customerData?.name || `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim() || 'Unknown';

                        newAgendaItemsForDate.push({
                            name: `${customerName} @ ${timeStr}`,
                            height: 80,
                            day: dateStr,
                            data: res,
                        });
                    } catch (processingError: any) {
                        console.error(`Error processing reservation ID ${res.id}:`, processingError.message, res);
                    }
                });

                setItems(prevItems => ({
                    ...prevItems,
                    [selected]: newAgendaItemsForDate,
                }));

			} catch (error: any) {
				console.error("Failed to load reservations data:", error);
                let errorMessage = "Error loading reservations.";
                 if (error.response) { errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Server error'}`; }
                 else if (error.request) { errorMessage = "Network Error: Could not reach server."; }
                 toast.show(errorMessage, { type: 'danger' });
                 setItems(prevItems => ({ ...prevItems, [selected]: [] }));
			} finally {
                setIsLoading(false);
            }
		};

		fetchDataAndUpdateAgenda();
	}, [selected, status, toast]);


    // --- Memoized Render Item (Keep as is) ---
    const MemoizedAgendaItem = React.memo(({ item }: { item: AgendaReservationEntry }) => {
        if (!item?.data) return null;
        const reservationData = item.data;
        const customerData = reservationData.user;
        const customerName = customerData?.name || `${customerData?.firstName || ''} ${customerData?.lastName || ''}`.trim() || 'N/A';
        const reservationDate = reservationData.reservation_start;

        return (
            <TouchableOpacity
                key={reservationData.id}
                style={styles.itemContainer}
                onPress={() => setSelectedReservation(reservationData)}
            >
                <View style={styles.itemContent}>
                     <Image style={styles.itemImage} source={{ uri: imagePath(customerData?.avatar?.url, customerData?.avatarUrl) || undefined }} defaultSource={require('../../assets/icon.png')} resizeMode="contain" />
                    <View style={styles.itemDetails}>
                        <Text style={styles.itemTextName} numberOfLines={1}>{customerName}</Text>
                        <Text style={styles.itemTextInfo} numberOfLines={2}>
                            {reservationDate ? format(new Date(reservationDate), 'HH:mm') : 'N/A'}
                            {reservationData.section ? ` @ ${reservationData.section.name}` : ''}
                            {reservationData.headCount ? ` (${reservationData.headCount} guests)` : ''}
                        </Text>
                        <Text style={styles.itemTextStatus}>Status: {reservationData.status}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    });

    // --- Render Item Callbacks (Keep as is) ---
    const renderAgendaItem = useCallback((item: AgendaReservationEntry) => <MemoizedAgendaItem item={item} />, []);
    const renderEmptyDateSlot = useCallback(() => <View style={styles.emptyDate} />, []);
    const rowHasChanged = useCallback((r1: AgendaReservationEntry, r2: AgendaReservationEntry) => {
         if (!r1?.data || !r2?.data) return true;
         return r1.data.id !== r2.data.id || r1.data.status !== r2.data.status;
    }, []);

	return (
		<SafeAreaView style={styles.safeArea}>
            {/* --- Details Modal (Keep as is) --- */}
			{selectedReservation && (
				<Modal animationType="slide" transparent={true} visible={!!selectedReservation} onRequestClose={() => setSelectedReservation(undefined)}>
					<View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Pressable style={styles.modalCloseButtonAbsolute} onPress={() => setSelectedReservation(undefined)}>
                                <Icon name="close-circle" size={30} color="#555" />
                            </Pressable>
                            <Text style={styles.modalTitle}>Reservation Details</Text>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Modal Content (Keep as is) */}
                                {selectedReservation.reservation_start && (<View style={styles.modalSection}><Text style={styles.modalLabel}>Time:</Text><Text style={styles.modalValue}>{format(new Date(selectedReservation.reservation_start), 'EEE, MMM d, HH:mm')}</Text></View>)}
                                {selectedReservation.headCount && (<View style={styles.modalSection}><Text style={styles.modalLabel}>Guests:</Text><Text style={styles.modalValue}>{selectedReservation.headCount}</Text></View>)}
                                <View style={styles.modalSection}><Text style={styles.modalLabel}>Location:</Text><Text style={styles.modalValue}>{selectedReservation.section?.name ?? 'N/A'}</Text></View>
                                <View style={styles.modalSection}><Text style={styles.modalLabel}>Status:</Text><Text style={styles.modalValue}>{selectedReservation.status}</Text></View>
                                {selectedReservation.user && (<View style={styles.modalSection}><Text style={styles.modalLabel}>Customer:</Text><Text style={styles.modalValue}>{`${selectedReservation.user.firstName || ''} ${selectedReservation.user.lastName || ''}`.trim()} ({selectedReservation.user.phone ?? 'No Phone'})</Text></View>)}
                                {selectedReservation.order?.items && selectedReservation.order.items.length > 0 && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Order Items:</Text>
                                        {selectedReservation.order.items.map(item => ( <View key={item.id} style={styles.modalListItem}><Text style={styles.modalItemText}>{item.name}</Text><Text style={styles.modalItemText}>Qty: {item.pivot?.quantity ?? item.quantity ?? 'N/A'}</Text></View> ))}
                                    </View>
                                )}
                                {selectedReservation.ref && (<View style={styles.modalSection}><Text style={styles.modalLabel}>Reference:</Text><Text style={styles.modalValue}>{selectedReservation.ref}</Text></View>)}
                                {selectedReservation.notes && (<View style={styles.modalSection}><Text style={styles.modalLabel}>Notes:</Text><Text style={styles.modalValue}>{selectedReservation.notes}</Text></View>)}
                            </ScrollView>
                        </View>
					</View>
				</Modal>
			)}

            {/* --- REMOVED Creation Modal --- */}
            {/* {creating && ( ... old modal with <Reservation/> ... )} */}

            {/* --- New Reservation Button - MODIFIED onPress --- */}
			<View style={styles.newButtonContainer}>
				<TouchableOpacity
                    style={styles.newButton}
                    onPress={() => {
                        console.log(`[ReservationsPage] Navigating to Wizard with date: ${selected}`);
                        // *** Navigate to the new ReservationWizard screen ***
                        // *** Passing the selected date as a parameter ***
                        navigation.navigate('ReservationWizard', { selectedDate: selected });
                    }}
                >
                    <Icon name="plus-circle-outline" size={20} color="white" style={{ marginRight: 8 }} />
					<Text style={styles.newButtonText}>New reservation for {selected}</Text>
				</TouchableOpacity>
			</View>

            {/* --- Agenda Component (Keep as is) --- */}
			<Agenda
				items={items}
				loadItemsForMonth={null}
				selected={selected}
				renderItem={renderAgendaItem}
				renderEmptyDate={renderEmptyDateSlot}
                rowHasChanged={rowHasChanged}
				onDayChange={({ dateString }) => setSelected(dateString)}
				onDayPress={({ dateString }) => setSelected(dateString)}
                refreshing={isLoading}
                pastScrollRange={6} futureScrollRange={6}
				theme={{ /* ... theme ... */ }}
				showClosingKnob={true}
			/>
		</SafeAreaView>
	);
}

// --- Styles (Keep as is) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#F3F4F6", },
	newButtonContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#F3F4F6", },
	newButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: "#5E9C8F", borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, },
	newButtonText: { textAlign: "center", color: "white", fontSize: 16, fontWeight: 'bold', },
    itemContainer: { backgroundColor: 'white', borderRadius: 8, marginVertical: 8, marginHorizontal: 10, padding: 12, flexDirection: 'row', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, },
    itemContent: { flexDirection: 'row', alignItems: 'center', flex: 1, },
    itemImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#E5E7EB', },
    itemDetails: { flex: 1, justifyContent: 'center', },
    itemTextName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 2, },
    itemTextInfo: { fontSize: 14, color: '#4B5563', marginBottom: 3, },
    itemTextStatus: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', },
    itemError: { padding: 10, marginVertical: 8, marginHorizontal: 10, backgroundColor: '#FECACA', borderRadius: 5, },
    emptyDate: { height: 15, flex: 1, paddingTop: 30, },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', },
    modalContainer: { width: '90%', maxHeight: '80%', backgroundColor: 'white', borderRadius: 12, paddingVertical: 20, paddingHorizontal: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, },
    modalCloseButtonAbsolute: { position: 'absolute', top: 10, right: 10, zIndex: 1, padding: 5, },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#111827', },
    modalSection: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8, },
    modalLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4, fontWeight: '500' },
    modalValue: { fontSize: 16, color: '#374151', lineHeight: 22 },
    modalListItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    modalItemText: { fontSize: 15, color: '#374151', },
});