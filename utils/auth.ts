import AsyncStore from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Session storage name
const userSessionName = "user_session";

// Type for session context
export type SessionContext = {
	sessionToken: string;
	session: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		avatarUrl: string;
		id: string;
		vendor: Vendor;
		branch: Branch;
		role: string;
	};
} | null;

// Function to get the authenticated session from storage
export const getAuthenticatedSession = async (): Promise<SessionContext> => {
	const parse = (sessionRaw: string | null): SessionContext => {
		if (!sessionRaw) {
			return null;
		}
		return JSON.parse(sessionRaw);
	};

	let p = AsyncStore.getItem(userSessionName);

	// Use SecureStore for mobile platforms
	if (Platform.OS !== "web") {
		p = SecureStore.getItemAsync(userSessionName);
	}

	console.log("Platform:", Platform.OS);  // Log the platform for debugging

	return p.then(parse);
};

// Function to set the authenticated session to storage
export const setAuthenticatedSession = async (session: SessionContext): Promise<void> => {
	if (!session) {
		return killAuthenticatedSession();
	}

	console.log("Saving session:", session); // Log session before saving

	// Save session based on platform
	if (Platform.OS === "web") {
		return AsyncStore.setItem(userSessionName, JSON.stringify(session));
	}

	// For mobile platforms, use SecureStore
	return SecureStore.setItemAsync(userSessionName, JSON.stringify(session));
};

// Function to kill/remove the authenticated session from storage
export const killAuthenticatedSession = () => {
	console.log("Killing session..."); // Log when session is being removed

	// Remove session based on platform
	if (Platform.OS === "web") {
		return AsyncStore.removeItem(userSessionName);
	}

	// For mobile platforms, use SecureStore
	return SecureStore.deleteItemAsync(userSessionName);
};
