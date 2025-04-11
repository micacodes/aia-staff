import { useContext, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useToast } from "react-native-toast-notifications";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Pressable,
} from "react-native";
import {
  useForm,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from "react-hook-form";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Checkbox } from "react-native-paper";

// --- Ensure AuthContext and api paths are correct ---
import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";

// --- Type Definitions ---

// Input data for the form
type AuthData = {
  username: string;
  password: string;
  identifier: string;
};

// Auxiliary types
type Vendor = {
  id: string;
  name: string;
  // Add other relevant vendor fields if needed
};

type Branch = {
  id: string;
  name: string;
  // Add other relevant branch fields if needed
};

// Type for a single Role object within the roles array
type BackendRoleObject = {
  id: number | string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type for the expected response from the /auth/login/staff API endpoint
// Adjusted based on previously logged API response structure
type AuthUser = {
  token: string;
  tokenHash?: string; // Optional based on previous definition
  expiresAt?: string; // Optional based on previous definition
  type: "bearer";
  meta?: Record<string, any>;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string;
    avatar?: string | null;
    avatarUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    initials?: string;
    name?: string;
    status?: string;
    // Expecting 'roles' array based on log
    roles: BackendRoleObject[];
    // Include other potential user fields if needed
    idpass?: string;
    title?: string;
    gender?: string;
    dob?: string | null;
    otp?: string;
    rememberMeToken?: string | null;
    details?: string;
    location?: any | null;
    geom?: any | null;
    emailVerifiedAt?: string | null;
    phoneVerifiedAt?: string | null;
    deletedAt?: string | null;
    meta?: { username?: string; online?: boolean };
    [key: string]: any;
  };
  vendor?: Vendor | null;
  branch?: Branch | null;
};

// --- LoginPage Component ---
export default function LoginPage({ navigation }: any) {
  const { setSession } = useContext(AuthContext);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthData>();

  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  // --- onSubmit Handler ---
  const onSubmit: SubmitHandler<AuthData> = async (data) => {
    console.log("Login Attempt Data:", data);
    try {
        toast.show("Logging in...", { type: "info", duration: 2000 });

        // Make the login request
        const res = await api.post<AuthUser>(
          "auth/login/staff/",
          {
              username: data.username.trim(),
              password: data.password.trim(),
              identifier: data.identifier.trim(),
          },
          {
              headers: { "Content-Type": "application/json" },
          }
        );

        // Check if response, token, and user object exist
        if (res?.token && res.user) {
            const user = res.user;
            let loginRole: string | null = null;

            // --- CORRECTED ROLE EXTRACTION LOGIC ---
            // Check if 'user.roles' is an array, has at least one item,
            // and the first item has a valid 'name' property.
            if (Array.isArray(user.roles) && user.roles.length > 0 && user.roles[0]?.name && typeof user.roles[0].name === 'string') {
                 loginRole = user.roles[0].name.toLowerCase(); // Extract name, convert to lowercase
                 console.log("[Login] Extracted Role from user.roles[0].name:", loginRole);
            }
            // Fallback if role wasn't found in the expected structure
            else {
                console.warn("[Login] Role information missing or in unexpected format in user.roles array. API Response User:", user);
                toast.show("Login succeeded, but role info missing/invalid. Check API response.", { type: "warning", duration: 4000 });
                // The role might be updated later by AuthProvider's sync if /auth/me works and provides it
            }
            // --- END: CORRECTED ROLE EXTRACTION LOGIC ---

            // Call setSession with processed data
            await setSession({
                sessionToken: res.token,
                session: {
                    // Map relevant fields from API response to context structure
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName ?? null,
                    email: user.email,
                    phone: user.phone,
                    avatarUrl: user.avatarUrl ?? user.avatar ?? null,
                    vendor: res.vendor ?? null,
                    branch: res.branch ?? null,
                    role: loginRole, // Pass the correctly extracted (or null) role
                },
            });

            toast.show("Login successful!", { type: "success", duration: 2000 });

            // No immediate navigation here - Navigation.tsx handles it based on context update

        } else {
            // Handle cases where API response structure is unexpected
            console.error("Login failed: Invalid API response structure received (missing token or user).", res);
            toast.show("Login failed. Unexpected server response.", { type: "danger", duration: 4000 });
        }
    } catch (error: any) {
        // --- ERROR Handling ---
        console.error("Login API Error:", error);
        if (error.response) {
          // Server responded with an error status code
          console.error("Error Response Data:", error.response.data);
          console.error("Error Response Status:", error.response.status);
          const backendMessage = error.response.data?.message || error.response.data?.error || "Invalid credentials or server error.";
          toast.show(`Login failed: ${backendMessage}`, { type: "danger", duration: 4000 });
        } else if (error.request) {
          // Request was made but no response received
          console.error("Error Request:", error.request);
          toast.show("Login failed: No response from server. Check network.", { type: "danger", duration: 4000 });
        } else {
          // Error setting up the request
          console.error("Error Message:", error.message);
          toast.show("Login failed: Error setting up request.", { type: "danger", duration: 4000 });
        }
    }
  };

  // --- onError Handler (for form validation errors) ---
  const onError: SubmitErrorHandler<AuthData> = (errors) => {
      console.log("Form Validation Errors:", errors);
      // Optionally show a toast for specific form errors
      if (errors.username) toast.show(errors.username.message || 'Username issue', { type: "warning" });
      if (errors.identifier) toast.show(errors.identifier.message || 'Identifier issue', { type: "warning" });
      if (errors.password) toast.show(errors.password.message || 'Password issue', { type: "warning" });
  };

  // --- JSX (UI) ---
  return (
    <View className="flex-1 justify-center bg-gray-100 px-6">
      {/* Logo and Welcome Text */}
      <View className="flex items-center mb-14">
        <Image
          className="h-28 w-28"
          source={require("../../assets/icon.png")} // Ensure path is correct
        />
      </View>
      <Text className="text-2xl mb-1 text-center">Welcome to AppInApp</Text>
      <Text className="text-base text-slate-500 text-center mb-6">
        Sign in to your account below
      </Text>
      <StatusBar style="auto" />

      {/* Username Input */}
      <Text className="m-2 ml-0 mt-4 text-primary-900">Email, phone or username</Text>
      <Controller
        control={control}
        name="username"
        rules={{ required: "Username, email, or phone is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`w-full px-3 py-3 border ${errors.username ? 'border-red-500' : 'border-primary-600'} rounded-lg`}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Email, phone or username"
            placeholderTextColor="rgba(0, 0, 0, 0.50)"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.username && (
        <Text className="text-red-500 text-sm mt-1">{errors.username.message}</Text>
      )}

      {/* Identifier Input */}
      <Text className="m-2 ml-0 mt-4 text-primary-900">Staff ID</Text>
      <Controller
        control={control}
        name="identifier"
        rules={{ required: "Staff ID is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`w-full px-3 py-3 border ${errors.identifier ? 'border-red-500' : 'border-primary-600'} rounded-lg`}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Staff ID for employer"
            placeholderTextColor="rgba(0, 0, 0, 0.50)"
            autoCapitalize="none"
          />
        )}
      />
      {errors.identifier && (
        <Text className="text-red-500 text-sm mt-1">{errors.identifier.message}</Text>
      )}

      {/* Password Input */}
      <Text className="m-2 ml-0 mt-3 text-primary-900">Account password</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View className={`w-full border ${errors.password ? 'border-red-500' : 'border-primary-600'} rounded-lg flex-row items-center pr-2`}>
            <TextInput
              className="flex-1 px-3 py-3"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
              placeholder="Account password"
              placeholderTextColor="rgba(0, 0, 0, 0.50)"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="p-1" // Padding for easier touch target
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#5E9C8F" // Consider using theme color variable
              />
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.password && (
        <Text className="text-red-500 text-sm mt-1">{errors.password.message}</Text>
      )}

      {/* Remember me and Forgot Password */}
      <View className="flex flex-row justify-between mt-3 items-center">
        <Pressable onPress={() => setRemember((prev) => !prev)} className="flex flex-row items-center p-1">
          <Checkbox.Android // Or Checkbox.IOS if needed
            status={remember ? "checked" : "unchecked"}
            color="#5E9C8F" // Consider using theme color variable
          />
          <Text className="ml-1">Remember me</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("ForgotPasswordPage")}>
          <Text className="text-primary-600 font-semibold">Forgot password?</Text>
        </Pressable>
      </View>

      {/* Login Button */}
      <View className="mt-6 rounded w-full">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, onError)}
          className={`px-3 py-4 rounded-xl items-center ${isSubmitting ? 'bg-primary-400' : 'bg-primary-600'}`} // Style disabled state
          disabled={isSubmitting}
        >
          <Text className="text-white font-bold text-base">
            {isSubmitting ? "Logging In..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}