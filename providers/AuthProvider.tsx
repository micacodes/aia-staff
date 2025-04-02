import { createContext, ReactNode, useEffect, useState } from "react";
import {
	getAuthenticatedSession,
	killAuthenticatedSession,
	SessionContext,
	setAuthenticatedSession,
} from "../utils/auth";
import { api } from "../utils/api";

interface Context {
	session?: {
		firstName?: string;
		lastName?: string;
		email?: string;
		phone?: string;
		avatarUrl?: string;
		id?: string;
		vendor: Vendor;
		branch: Branch;
	};
	sessionToken?: string;
	setSession: (session: SessionContext) => void;
	syncSession: () => Promise<void>;
	logOut: () => void;
	didFetch: boolean;
	isAuthenticated: boolean;
}

export const AuthContext = createContext<Context>({
	setSession: () => {},
	syncSession: () => Promise.resolve(),
	logOut: () => {},
	didFetch: false,
	isAuthenticated: false,
});

interface AuthContextProps {
	children: ReactNode;
}

export default function AuthContextProvider({ children }: AuthContextProps) {
	const [vendor, setVendor] = useState<Vendor | undefined>(undefined);
	const [branch, setBranch] = useState<Branch | undefined>(undefined);
	const [sessionContext, setSessionContext] = useState<
		SessionContext | undefined
	>(undefined);

	useEffect(() => {
		getAuthenticatedSession().then(syncSession);
	}, []);

	const syncSession = async (auth: { sessionToken?: string, session: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        avatarUrl: string;
        id: string;
        vendor: Vendor;
        branch: Branch;
    };}) => {
		if (!auth?.sessionToken) {
			return setSession(null);
		}

		try {
			const user: any = await api.get("auth/me", {});
			setSessionContext({
				...sessionContext,
				sessionToken: auth.sessionToken,
				session: {
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					phone: user.phone,
					avatarUrl: user.avatarUrl,
					id: user.id,
					vendor: auth.session.vendor,
					branch: auth.session.branch,
				},
			});
		} catch (err: any) {
			if (err.response?.status === 401) {
				// The user is no longer logged in (hence 401)
				console.log("Session is not authenticated:", err);
			} else {
				// A network or some other error occurred
				console.error(err);
			}

			// Remove the session / log the user out.
			setSessionContext(null);
		}
	};

	const setSession = async (session: SessionContext) => {
		setVendor(session?.session.vendor);
		setBranch(session?.session.branch);
    
		if (!session) {
			await killAuthenticatedSession();
			return setSessionContext(session);
		}

		setAuthenticatedSession(session).then(() => syncSession(session));
	};

	const logOut = () => {
		killAuthenticatedSession().then(() => setSessionContext(null));
	};

	if (sessionContext === undefined) {
		return null;
	}

	return (
		<AuthContext.Provider
			value={{
				session: sessionContext?.session,
				sessionToken: sessionContext?.sessionToken,

				isAuthenticated: Boolean(sessionContext?.sessionToken),

				syncSession: () => getAuthenticatedSession().then(syncSession),

				setSession,

				logOut,

				didFetch: true,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
