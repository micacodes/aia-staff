import { Image, Pressable, Text, View } from "react-native";
import { imagePath } from "../utils/api";

export default function VendorCard({ vendor, navigation }: { vendor: Vendor, navigation: any }) {
    return <Pressable
        key={vendor.id}
        className="flex-1 rounded-lg flex justify-center items-center min-w-8 mx-4 px-6 pb-2"
        onPress={
            () => navigation.navigate('VendorDetails', { vendorId: vendor.id })
        }
    >
        <Image
            source={{ uri: imagePath(vendor.logo?.url, vendor.logoUrl) }}
            resizeMode='contain'
            className="w-full h-16"
        />

        <Text className="text-center">
            {vendor.name}
        </Text>
    </Pressable>
}