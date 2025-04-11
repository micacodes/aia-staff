import React, {
	createContext,
	ReactNode,
	useEffect,
	useState,
	useContext,
	useCallback,
} from "react";
import {
	getAuthenticatedSession,
	killAuthenticatedSession,
	SessionContext, // { sessionToken?: string; session?: UserSessionData }
	setAuthenticatedSession,
} from "../utils/auth"; // Adjust path
import { api } from "../utils/api"; // Adjust path

// --- Interfaces ---
interface Vendor { id: string; name: string; /* ... */ }
interface Branch { id: string; name: string; /* ... */ }

// User data structure stored IN THE FRONTEND CONTEXT
interface UserSessionData {
	firstName?: string;
	lastName?: string | null;
	email?: string;
	phone?: string;
	avatarUrl?: string | null; // Expecting a direct URL string
	id?: string;
	vendor?: Vendor | null;
	branch?: Branch | null;
	role?: string | null; // Role will be extracted and stored here (lowercase string)
}

// Interface for a single Role object WITHIN the backend response's roles array
interface BackendRoleObject {
  id: number | string; // Adjust type based on your backend Role model ID
  name: string; // e.g., "admin", "manager", "chef"
}

// --- Type for the EXPECTED response from the AdonisJS /auth/me endpoint ---
interface AdonisAuthMeResponse {
	id: string;
	firstName: string;
	lastName: string | null;
	email: string;
	phone: string;
	avatarUrl: string | null; // Expecting computed string URL from backend
	status?: string; // Optional status
	name?: string; // Optional computed name

	// --- Key Change: Expecting the 'roles' array ---
	roles: BackendRoleObject[];

	vendor?: Vendor | null; // Optional
	branch?: Branch | null; // Optional
    // Add other fields directly returned by /auth/me if needed
}


// --- Context Definition ---
interface AuthContextValue {
	session?: UserSessionData | null; // Can be null
	sessionToken?: string | null;
	setSession: (session: SessionContext | null) => Promise<void>;
	syncSession: () => Promise<void>;
	logOut: () => Promise<void>;
	didFetch: boolean;
	isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
	session: undefined,
	sessionToken: undefined,
	setSession: async () => {},
	syncSession: async () => {},
	logOut: async () => {},
	didFetch: false,
	isAuthenticated: false,
});


// --- Provider Props ---
interface AuthContextProviderProps {
	children: ReactNode;
}

// --- AuthContextProvider Implementation ---
export default function AuthContextProvider({ children }: AuthContextProviderProps) {
	const [sessionContext, setSessionContext] = useState<SessionContext | null | undefined>(undefined);
	const [didFetch, setDidFetch] = useState(false);

	// --- Core Sync Function ---
	// Updated to handle the AdonisJS response structure and correct Axios call
	const performSync = useCallback(async (authData: SessionContext | null) => {
		console.log("[Auth] Performing sync...");

		if (!authData?.sessionToken) {
			console.log("[Auth] No token provided for sync. Setting session to null.");
			setSessionContext(null);
			setDidFetch(true);
			return;
		}

		try {
			console.log(`[Auth] Fetching /auth/me with token: Bearer ${authData.sessionToken.substring(0, 10)}...`);

            // *** CORRECTED Axios call structure ***
            // URL is first argument, config object (with headers) is second.
            const response = await api.get<AdonisAuthMeResponse>(
                "auth/me", // Just the path
                {          // Config object as second argument
                    headers: {
                        Authorization: `Bearer ${authData.sessionToken}`,
                    },
                }
            );

			const backendUser = response.data; // User data directly from AdonisJS response

            // *** UPDATED VITAL CHECK for valid AdonisJS user data ***
            // Check if backendUser exists, is an object, has an id, and has the 'roles' array
			if (!backendUser || typeof backendUser !== 'object' || !backendUser.id || !Array.isArray(backendUser.roles)) {
                console.error("[Auth] Error: /auth/me returned invalid or incomplete data. Expected object with id and roles array. Received:", backendUser);
				await killAuthenticatedSession();
				setSessionContext(null);
				setDidFetch(true);
				return;
			}

			// --- If check passes, backendUser data is structurally valid ---
			console.log("[Auth] /auth/me success. Raw backend data received:", backendUser);

            // --- Extract the primary role name from the 'roles' array ---
            let primaryRoleName: string | null = null;
            if (backendUser.roles.length > 0 && backendUser.roles[0]?.name) {
                primaryRoleName = backendUser.roles[0].name.toLowerCase(); // Use lowercase
            } else {
                console.warn(`[Auth] User ${backendUser.id} has no roles assigned or first role has no 'name' property.`);
            }
            console.log("[Auth] Extracted role for frontend context:", primaryRoleName);

			// *** Update context with data mapped from backend response ***
			setSessionContext({
				sessionToken: authData.sessionToken,
				session: {
					id: backendUser.id,
					firstName: backendUser.firstName,
					lastName: backendUser.lastName,
					email: backendUser.email,
					phone: backendUser.phone,
					avatarUrl: backendUser.avatarUrl, // Use computed URL from backend
					role: primaryRoleName, // Use the extracted, lowercase role
					vendor: backendUser.vendor ?? null,
					branch: backendUser.branch ?? null,
				},
			});
			setDidFetch(true);

		} catch (err: any) {
            // --- Handle NETWORK or HTTP errors ---
            console.error("[Auth] Error caught during /auth/me API call:", err);
            if (err.response) {
                console.error("[Auth] Error Response Data:", err.response.data);
                console.error("[Auth] Error Response Status:", err.response.status);
                 if (err.response.status === 401) {
                    console.log("[Auth] Token invalid/expired (401). Logging out.");
                } else {
                    console.log(`[Auth] Server responded with status ${err.response.status}. Logging out.`);
                }
            } else if (err.request) {
                 console.error("[Auth] No response received from /auth/me request:", err.request);
                 console.log("[Auth] Network error likely. Logging out.");
            } else {
                console.error("[Auth] Error setting up /auth/me request:", err.message);
                 console.log("[Auth] Request setup error. Logging out.");
            }

			await killAuthenticatedSession();
			setSessionContext(null);
			setDidFetch(true);
		}
	}, []); // Empty dependency array

	// --- Initial Load Effect ---
	useEffect(() => {
		console.log("[Auth] Initializing: Checking stored session...");
		let isMounted = true;
		getAuthenticatedSession()
			.then(async (storedAuth) => {
				if (isMounted) {
					console.log("[Auth] Stored session retrieved:", storedAuth ? `Token found (${storedAuth.sessionToken?.substring(0,5)}...)` : 'No token');
					await performSync(storedAuth);
					console.log("[Auth] Initial sync process completed.");
				}
			})
			.catch(async (error) => {
				if (isMounted) {
					console.error("[Auth] Error getting stored session:", error);
					setSessionContext(null);
					setDidFetch(true);
				}
			});
		return () => { isMounted = false; };
	}, [performSync]);

    // --- setSession Function ---
    // Assumes LOGIN response provides user data including 'role' string directly.
	const setSession = useCallback(async (newSession: SessionContext | null) => {
		if (!newSession || !newSession.sessionToken) {
			console.log("[Auth] setSession called with null. Logging out.");
			await killAuthenticatedSession();
			setSessionContext(null);
			setDidFetch(true);
		} else {
			console.log("[Auth] setSession called with new login session data.");
            let processedRole: string | null = null;
			if (newSession.session?.role && typeof newSession.session.role === 'string') {
				processedRole = newSession.session.role.toLowerCase();
                console.log("[Auth] Role processed in setSession (from LOGIN):", processedRole);
                // Update the role within the newSession object *before* setting state/storage
                newSession.session.role = processedRole;
			} else if (newSession.session) {
                console.warn("[Auth] Role string missing/invalid in LOGIN response data passed to setSession. Awaiting sync for correct role.");
                newSession.session.role = null; // Ensure role is null if not provided correctly
            }

            setSessionContext(newSession); // Set state with potentially null role from login
			await setAuthenticatedSession(newSession); // Store session
			setDidFetch(true);
            console.log("[Auth] Session set. Current context role (may be updated by sync):", newSession.session?.role);
            // Optional: Trigger sync immediately after login if login response is unreliable for role
            // console.log("[Auth] Triggering sync immediately after setSession...");
            // await performSync(newSession);
		}
	}, []); // Removed performSync from dependencies

	// --- logOut Function ---
	const logOut = useCallback(async () => {
		console.log("[Auth] logOut called explicitly.");
		await killAuthenticatedSession();
		setSessionContext(null);
		setDidFetch(true);
	}, []);

	// --- Manual Sync Function ---
	const syncSessionManual = useCallback(async () => {
		console.log("[Auth] Manual sync triggered.");
		const currentAuth = await getAuthenticatedSession();
        await performSync(currentAuth);
	}, [performSync]); // Depends on performSync


	// --- Context Value ---
	const value: AuthContextValue = {
		session: sessionContext?.session ?? null,
		sessionToken: sessionContext?.sessionToken ?? null,
		isAuthenticated: !!sessionContext?.sessionToken,
		setSession,
		syncSession: syncSessionManual,
		logOut,
		didFetch,
	};

	console.log(`[Auth] Provider rendering. didFetch: ${didFetch}, isAuthenticated: ${value.isAuthenticated}, Role: ${value.session?.role}`);
	return (
		<AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
	);
}

// --- Custom Hook ---
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthContextProvider");
	}
	return context;
};