import React, { useContext, useEffect, useState, useCallback } from "react";
import {
	StyleSheet,
	TouchableOpacity,
	FlatList, // Keep for potential horizontal category filter if needed later
	Text,
	View,
	SectionList, // Import SectionList
	ActivityIndicator, // Import ActivityIndicator
	SafeAreaView, // Good practice for screen container
} from "react-native";
import { api } from "../../utils/api";
// Consider replacing HTMLView with Text + numberOfLines for performance if possible
import HTMLView from "react-native-htmlview";
import { AuthContext } from "../../providers/AuthProvider";
import { useNavigation } from "@react-navigation/native"; // Use hook
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// --- Type Definitions (Ensure these match your actual data) ---
interface ProductCategory {
	id: number | string;
	name: string;
	// other fields...
}

interface Product {
	id: number | string;
	name: string;
	productCategoryId: number | string;
	details: string;
	price: number;
	unit: string;
	// other fields...
}

// Type for the data structure SectionList expects
interface ProductSection {
	title: string;
	id: number | string; // Add category ID for reference if needed
	data: Product[];
}

// Type for API response (adjust if different)
interface PaginatedData<T> {
    data: T[];
    // other pagination fields...
}

// Navigation types
type RootStackParamList = {
    MenuPage: undefined;
    ProductDetails: { productId: number | string };
    // ... other screens
};
type MenuPageNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MenuPage'>;

// --- Styles defined outside component ---
const htmlStyles = StyleSheet.create({
	p: {
		fontWeight: "300",
		fontSize: 12,
        margin: 0, // Reset default margins if needed
        color: '#6B7280' // Tailwind gray-500
	},
    // Add other tag styles if needed
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // White background
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F3F4F6', // Tailwind gray-100
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB', // Tailwind gray-200
		marginTop: 5, // Add some space between sections
    },
	productItemContainer: {
        flex: 1, // Important for numColumns layout
        margin: 6, // Spacing around items
        borderWidth: 1,
        borderColor: '#D1D5DB', // Tailwind gray-300
        borderRadius: 8,
        padding: 10,
		backgroundColor: '#FFFFFF', // White background for items
    },
	productItemContent: {
		// Styles for content within the TouchableOpacity
	},
	productName: {
		fontSize: 15,
		fontWeight: 'bold',
		marginBottom: 4,
        color: '#1F2937', // Tailwind gray-800
	},
    productDetailsContainer: {
        flexDirection: 'row', // Keep HTMLView and ellipsis together
        alignItems: 'center',
        minHeight: 20, // Ensure consistent height
        marginBottom: 6,
    },
    productPriceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto', // Push price to bottom if needed
    },
    productPrice: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#1F2937', // Tailwind gray-800
    },
    // Style for product grid (contentContainerStyle of SectionList)
    listContentContainer: {
        paddingHorizontal: 6, // Side padding for the grid
		paddingBottom: 20, // Padding at the bottom
    },
});

// --- Component ---
export default function MenuPage() {
	const [sections, setSections] = useState<ProductSection[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const { session } = useContext(AuthContext);
    const navigation = useNavigation<MenuPageNavigationProp>();

	// Fetch and process data
	const loadMenuData = useCallback(async () => {
		if (!session?.vendor?.id) {
			setError("Vendor information is missing.");
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		setError(null);
		setSections([]); // Clear previous data

		try {
			// Fetch categories and products in parallel
			const [categoryResponse, productResponse] = await Promise.all([
				api.get<PaginatedData<ProductCategory> | ProductCategory[]>("product-categories", {
                    params: { // Use params for query parameters
                        vendor: session.vendor.id,
                        // branch: session.branch?.id, // Uncomment if needed
                    }
                }),
				api.get<PaginatedData<Product> | Product[]>("products", {
                    params: { // Filter products by vendor on backend if possible!
                        vendor: session.vendor.id,
                        // Add other filters like status: 'active'
                    }
                }) // Ideally, filter by vendor server-side!
			]);

            // --- Data Extraction (Handle both paginated and direct array responses) ---
            let categories: ProductCategory[] = [];
            if (categoryResponse.data && Array.isArray((categoryResponse.data as PaginatedData<ProductCategory>).data)) {
                categories = (categoryResponse.data as PaginatedData<ProductCategory>).data;
            } else if (Array.isArray(categoryResponse.data)) {
                 categories = categoryResponse.data;
            }

            let products: Product[] = [];
             if (productResponse.data && Array.isArray((productResponse.data as PaginatedData<Product>).data)) {
                products = (productResponse.data as PaginatedData<Product>).data;
            } else if (Array.isArray(productResponse.data)) {
                 products = productResponse.data;
            }
            // --- End Data Extraction ---


			// --- Transform data for SectionList ---
			const productMap = new Map<string | number, Product[]>();
			products.forEach(product => {
				const categoryId = product.productCategoryId;
				if (!productMap.has(categoryId)) {
					productMap.set(categoryId, []);
				}
				productMap.get(categoryId)?.push(product);
			});

			const formattedSections: ProductSection[] = categories
				.map(category => ({
					id: category.id,
					title: category.name,
					data: productMap.get(category.id) || [], // Get products for this category
				}))
				.filter(section => section.data.length > 0); // Optional: Hide empty categories

			setSections(formattedSections);

		} catch (err: any) {
			console.error("Failed to load menu data:", err);
			setError(err.response?.data?.message || "Failed to load menu. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [session?.vendor?.id]); // Dependency: vendor ID

	useEffect(() => {
		navigation.setOptions({ title: 'Menu' }); // Set screen title
		loadMenuData();
	}, [loadMenuData, navigation]); // Load data on mount and when vendor changes

	// --- Render Functions ---

	// Render Header for each Section (Category Name)
	const renderSectionHeader = ({ section }: { section: ProductSection }) => (
		<Text style={styles.sectionHeader}>{section.title}</Text>
	);

	// Render Item for each Product
	const renderProductItem = ({ item, index, section }: { item: Product, index: number, section: ProductSection }) => (
		<TouchableOpacity
            style={styles.productItemContainer}
			onPress={() =>
				navigation.navigate("ProductDetails", { productId: item.id })
			}
            accessibilityLabel={`${item.name}, KES ${item.price} per ${item.unit}. Tap for details.`}
		>
			<View style={styles.productItemContent}>
				<Text style={styles.productName} numberOfLines={2}>{item.name}</Text>

                {/* Use Text with numberOfLines for better performance if possible */}
                <Text style={styles.productDetailsContainer} numberOfLines={2}>
                    {item.details?.replace(/<[^>]+>/g, '') || ''} {/* Strip HTML tags for simple Text */}
                </Text>

                {/* --- OR: Keep HTMLView if complex tags needed --- */}
				{/* <View style={styles.productDetailsContainer}>
					<HTMLView
						value={`<p>${item.details?.slice(0, 30) || ''}</p>`} // Limit length
						stylesheet={htmlStyles} // Use pre-defined stylesheet
					/>
                     {item.details?.length > 30 && <Text>...</Text>}
				</View> */}
                {/* --- End HTMLView Option --- */}


				<View style={styles.productPriceContainer}>
					<Text style={styles.productPrice}>
						KES {item.price}/{item.unit}
					</Text>
                    {/* Add to cart button or similar could go here */}
				</View>
			</View>
		</TouchableOpacity>
	);


	// --- Main Render Logic ---

	if (isLoading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size="large" color="#4F46E5" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContainer}>
				<Text className="text-red-500 text-center mb-4">{error}</Text>
                <TouchableOpacity
                    onPress={loadMenuData}
                    className="bg-primary-600 px-4 py-2 rounded"
                >
                    <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
			</View>
		);
	}

	if (sections.length === 0) {
		return (
			<View style={styles.centerContainer}>
				<Text className="text-gray-500">No menu items available.</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<SectionList
				sections={sections}
				keyExtractor={(item, index) => `product-${item.id}-${index}`}
				renderItem={renderProductItem}
				renderSectionHeader={renderSectionHeader}
				// --- For Grid Layout (numColumns equivalent) ---
				// SectionList doesn't directly support numColumns like FlatList.
                // This makes renderItem render *pairs* of items in a row.
                // You might need more complex logic if sections can have odd numbers of items.
                // renderItem={({ section, index }) => {
                //     if (index % 2 !== 0) return null; // Skip odd indices
                //     const item = section.data[index];
                //     const nextItem = section.data[index + 1];
                //     return (
                //         <View style={{ flexDirection: 'row' }}>
                //              {item && renderProductItem({ item, index, section }) }
                //              {/* Render second item only if it exists */}
                //              {nextItem ? renderProductItem({ item: nextItem, index: index + 1, section }) : <View style={{flex:1, margin: 6}} /> /* Spacer */}
                //         </View>
                //     )
                // }}
                // keyExtractor={(item, index) => `product-row-${item.id}-${index}`}
                // --- End Grid Layout ---
				contentContainerStyle={styles.listContentContainer}
				stickySectionHeadersEnabled={true} // Keep headers sticky
			/>
		</SafeAreaView>
	);
}