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

import { AuthContext } from "../../providers/AuthProvider";
import { api } from "../../utils/api";

type AuthData = {
  username: string;
  password: string;
  identifier: string;
};

type Vendor = {
  id: string;
  name: string;
};

type Branch = {
  id: string;
  name: string;
};

type AuthUser = {
  token: string;
  tokenHash: string;
  expiresAt: string;
  type: "bearer";
  meta: Record<string, any>;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string | null;
    avatarUrl: string;
    createdAt: string;
    updatedAt: string;
    initials: string;
    name: string;
    status: string;
    [key: string]: any; 
  };
  vendor?: Vendor;
  branch?: Branch;
};

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

  const onSubmit: SubmitHandler<AuthData> = async (data) => {
    console.log('=========', data)
    try {
      toast.show("Logging in...", { type: "info" });

      const res = await api.post<AuthUser>("auth/login/staff/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Login Response:", res?.token);
      if (res?.token) {
        const user = res?.user;

        setSession({
          sessionToken: res?.token,
          session: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            id: user.id,
            vendor: res?.vendor,
            branch: res?.branch,
          },
        });

        toast.show("Login successful!", { type: "success" });

        setTimeout(() => {
          navigation.navigate("Home");
        }, 1000);
      } else {
        toast.show("Login failed. Invalid credentials.", { type: "danger" });
      }
    } catch (error: any) {
      console.error("Login Error:", error);

      toast.show("An error occurred. Please try again.", { type: "danger" });

      if (error.response?.data?.message) {
        toast.show(error.response.data.message, { type: "danger" });
      }
    }
  };

  const onError: SubmitErrorHandler<AuthData> = (errors) => {
    console.log("Form Errors:", errors);
  };

  return (
    <View className="flex-1 justify-center bg-gray-100 px-6">
      <View className="flex items-center mb-14">
        <Image
          className="h-28 w-28"
          source={require("../../assets/icon.png")}
        />
      </View>

      <Text className="text-2xl mb-1 text-center">Welcome to AppInApp</Text>
      <Text className="text-base text-slate-500 text-center">
        Sign in to your account below
      </Text>
      <StatusBar style="auto" />

      {/* Username */}
      <Text className="m-2 ml-0 mt-4 text-primary-900">Email, phone or username</Text>
      <Controller
        control={control}
        name="username"
        rules={{ required: "This field is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full px-3 py-3 border border-primary-600 rounded-lg"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Email, phone or username"
            placeholderTextColor="rgba(0, 0, 0, 0.50)"
          />
        )}
      />
      {errors.username && (
        <Text className="text-red-500 text-sm">{errors.username.message}</Text>
      )}

      {/* Identifier */}
      <Text className="m-2 ml-0 mt-4">Staff ID</Text>
      <Controller
        control={control}
        name="identifier"
        rules={{ required: "This field is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full px-3 py-3 border border-primary-600 rounded-lg"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Staff ID for employer"
            placeholderTextColor="rgba(0, 0, 0, 0.50)"
          />
        )}
      />
      {errors.identifier && (
        <Text className="text-red-500 text-sm">{errors.identifier.message}</Text>
      )}

      {/* Password */}
      <Text className="m-2 ml-0 mt-3">Account password</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: "This field is required" }}
        render={({ field: { onChange, onBlur, value } }) => (
          <View>
            <TextInput
              className="w-full px-3 py-3 border border-primary-600 rounded-lg"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
              placeholder="Account password"
              placeholderTextColor="rgba(0, 0, 0, 0.50)"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 bottom-0 flex items-center justify-center mr-3"
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#5E9C8F"
              />
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.password && (
        <Text className="text-red-500 text-sm">{errors.password.message}</Text>
      )}

      {/* Remember me and Forgot Password */}
      <View className="flex flex-row justify-between mt-3 items-center">
        <View className="flex flex-row items-center">
          <Checkbox
            status={remember ? "checked" : "unchecked"}
            onPress={() => setRemember((prev) => !prev)}
            color="#5E9C8F"
          />
          <Text>Remember me</Text>
        </View>

        <Pressable onPress={() => navigation.navigate("ForgotPasswordPage")}>
          <Text className="text-primary-600">Forgot password</Text>
        </Pressable>
      </View>

      {/* Login Button */}
      <View className="mt-6 rounded w-full">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit, onError)}
          // onPress={()=>{
          //   console.log("Pressed")
          //   }}
          className="bg-primary-600 px-3 py-4 rounded-xl items-center"
          disabled={isSubmitting}
        >
          <Text className="text-white font-bold text-base">
            {isSubmitting ? "Processing..." : "Login"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
