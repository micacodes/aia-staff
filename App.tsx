import ErrorBoundary from "./ErrorBoundary";
import Navigation from "./Navigation";
import AuthContextProvider from "./providers/AuthProvider";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";

import "./assets/styles";
import { CartContextProvider } from "./providers/CartProvider";

export default function App() {
	const [fontsLoaded, fontError] = useFonts({
		Inter_900Black,
	});

	if (!fontsLoaded && !fontError) {
		return null;
	}

	return (
		<AuthContextProvider>
			<ErrorBoundary>
				<CartContextProvider>
					<Navigation />
				</CartContextProvider>
			</ErrorBoundary>
		</AuthContextProvider>
	);
}
