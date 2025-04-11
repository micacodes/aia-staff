// src/utils/roleScreens.ts

/**
 * Defines which screens (by name) are accessible to different user roles.
 * Screen names must match the 'name' prop used in Stack.Screen and Tab.Screen.
 */

// Screens needed for basic app operation and profile access
const BASE_ACCESS: string[] = [
    'Root',           // Main stack container for logged-in users
    'Home',           // Tab: Landing page component
    'Profile',        // Tab: Entry to profile section
    'Account',        // Stack: Account details screen
    'Password',       // Stack: Change password screen
    'Language',       // Stack: Language settings
    'Help',           // Stack: Help/Support screen
    'About',          // Stack: About Us screen
    'Locate',         // Stack: Location screen
];

// Screens related to 'orders' and 'new orders' permissions
const ORDER_ACCESS: string[] = [
    // Tabs
    'Plus',           // Tab: Represents 'new orders'/'cart' access

    // Stacks
    'OrdersPage',     // Stack: View orders list ('orders')
    'NewOrdersPage',  // Stack: Component for creating new order ('new orders')
    'OrderDetails',   // Stack: View order details
    'CheckoutCartPage', // Stack: Cart view
    'ProductDetails',  // Stack: Viewing items
    'CheckoutOrderPage',// Stack: Checkout process
    'Pay',             // Stack: Payment screen
];

// Screens for users with full access permissions
const FULL_ACCESS_SCREENS: string[] = [
    ...BASE_ACCESS,
    ...ORDER_ACCESS,
    // Additional Tabs
    'Analytics',      // Tab: 'reports' permission
    'Notifications',  // Tab: 'broadcast' permission

    // Additional Stacks
    'OnboardPage',    // Stack: 'onboard' permission
    'Menu',           // Stack: 'menu' permission
    'ReportingPage',  // Stack: 'reports' permission
    'RatingPage',     // Stack: 'rate customer' permission
    'BroadcastPage',  // Stack: 'broadcast' permission
    'ReservationsPage',
    'Ratings',         // Viewing ratings?
];

// Screens for users with limited access (Chef, Rider)
const LIMITED_ACCESS_SCREENS: string[] = [
    ...BASE_ACCESS,
    ...ORDER_ACCESS,
];

// Map lowercase role names to their allowed screen name lists
export const ALLOWED_SCREENS: Record<string, string[]> = {
    chef: LIMITED_ACCESS_SCREENS,
    rider: LIMITED_ACCESS_SCREENS,
    cashier: FULL_ACCESS_SCREENS,
    manager: FULL_ACCESS_SCREENS,
    waiter: FULL_ACCESS_SCREENS,
    barista: FULL_ACCESS_SCREENS,
    barman: FULL_ACCESS_SCREENS,
};

// --- Helper Functions ---

export const getAllowedScreensByRole = (role: string | undefined | null): string[] => {
    if (!role) return [];
    return ALLOWED_SCREENS[role.toLowerCase()] || [];
};

export const hasAccessToScreen = (role: string | undefined | null, screenName: string): boolean => {
    if (!role || !screenName) return false;
    return getAllowedScreensByRole(role).includes(screenName);
};