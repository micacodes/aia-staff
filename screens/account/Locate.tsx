import { Text, View } from "react-native";
import { SafeAreaView } from "react-native";
import Geolocator from "../../components/Geolocator";

export default function LocateUsPage() {
    return <SafeAreaView className="min-h-screen px-4 py-12">
        <View className="px-4">
            <Text className="m-2 ml-0 mt-4 font-bold text-xl mb-4">
                Locate a store near me
            </Text>

            <Geolocator />
        </View>
    </SafeAreaView>
}