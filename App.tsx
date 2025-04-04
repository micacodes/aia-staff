import React from "react";
import { ToastProvider } from "react-native-toast-notifications"; // Import the ToastProvider
import ErrorBoundary from "./ErrorBoundary";
import Navigation from "./Navigation";
import AuthContextProvider from "./providers/AuthProvider";
import { useFonts, Inter_900Black } from "@expo-google-fonts/inter";
import { name as appName } from "./app.json";

import "./assets/styles";
import { CartContextProvider } from "./providers/CartProvider";
import { AppRegistry } from "react-native";

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_900Black,
  });

  // Show nothing while loading fonts
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ToastProvider>
      <AuthContextProvider>
        <ErrorBoundary>
          <CartContextProvider>
            <Navigation />
          </CartContextProvider>
        </ErrorBoundary>
      </AuthContextProvider>
    </ToastProvider>
  );
}

AppRegistry.registerComponent(appName, () => App);