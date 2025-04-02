import AsyncStore from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const userSessionName = "user_session";

export type SessionContext = {
	sessionToken: string;
	session: {
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
		avatarUrl: string;
		id: string;
		vendor: Vendor,
		branch: Branch,
	};
} | null;

export const getAuthenticatedSession = async (): Promise<SessionContext> => {
	const parse = (sessionRaw: string | null): SessionContext => {
		if (!sessionRaw) {
			return null;
		}

		return JSON.parse(sessionRaw);
	};

	let p = AsyncStore.getItem(userSessionName);

	if (Platform.OS !== "web") {
		p = SecureStore.getItemAsync(userSessionName);
	}

	return p.then(parse);
};

export const setAuthenticatedSession = async (session: SessionContext): Promise<void> => {
	if (!session) {
		return killAuthenticatedSession();
	}

	if (Platform.OS === "web") {
		return AsyncStore.setItem(userSessionName, JSON.stringify(session));
	}

	return SecureStore.setItemAsync(userSessionName, JSON.stringify(session));
};

export const killAuthenticatedSession = () => {
	if (Platform.OS === "web") {
		return AsyncStore.removeItem(userSessionName);
	}

	return SecureStore.deleteItemAsync(userSessionName);
};
