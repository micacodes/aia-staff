import { View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import { useFonts } from 'expo-font';
import JobIcon from "../../assets/svg/job-search-symbol-of-suitcase-and-curriculum-paper-svgrepo-com.svg";
import FlightIcon from "../../assets/svg/takeoff-the-plane-svgrepo-com.svg";
import BuyIcon from "../../assets/svg/shopping-cart-svgrepo-com.svg";
import SearchIcon from "../../assets/svg/search-alt-2-svgrepo-com.svg";
import AddIcon from "../../assets/svg/add-svgrepo-com.svg";
import RentIcon from "../../assets/svg/rent-svgrepo-com2.svg";
import PayIcon from "../../assets/svg/pay-svgrepo-com.svg";
import QueryIcon from "../../assets/svg/question-mark-svgrepo-com.svg";
import SubscribeIcon from "../../assets/svg/pay-per-click-hand-link-svgrepo-com.svg";
import ApplyIcon from "../../assets/svg/application-form-svgrepo-com.svg";
import DonateIcon from "../../assets/svg/donate-heart-svgrepo-com.svg";
import StreamIcon from "../../assets/svg/tv-svgrepo-com.svg";
import ResearchIcon from "../../assets/svg/search-alt-2-svgrepo-com.svg";
import BookIcon from "../../assets/svg/appointments-svgrepo-com.svg";
import FillIcon from "../../assets/svg/form-svgrepo-com.svg";
import { useTask } from "../../hooks/useTask";

export default function AllServices({ navigation }) {
    const {tasks, fetchTasks} = useTask()

    return <SafeAreaView className="flex justify-center items-center bg-white min-h-screen px-6 pb-6">
        {/* {tasks.splice(0, 2).map(pair => {
            return <View className="flex flex-row gap-2 mb-2 justify-center">
                {pair.map((task) => {
                    return <Pressable className="rounded-2xl  h-11 px-2 flex items-center justify-center bg-[#83BBAE]">
                        <Text className="">{task.name}</Text>
                    </Pressable>
                })}
            </View>
        })} */}

        <View className="flex flex-row gap-4 mb-4">
            <Pressable
                className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]
                 "
                onPress={() => navigation.navigate('ServiceDetails')}>
                <BuyIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Buy & Order</Text>
            </Pressable>

            <Pressable className="h-32 w-32 rounded-2xl flex-1 bg-[#F0F4FF] justify-center items-center">
                <BookIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Book & Reserve</Text>
            </Pressable>
        </View>

        <View className="flex flex-row gap-4 mb-4 ">
            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <SubscribeIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Subscribe & Notify</Text>
            </Pressable>

            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <PayIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Pay & Transact </Text>
            </Pressable>
        </View>

        <View className="flex flex-row gap-4 mb-4">
            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <ResearchIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Survey and Research </Text>
            </Pressable>

            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <QueryIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Query & Validate</Text>
            </Pressable>
        </View>

        <View className="flex flex-row gap-4 mb-4">
            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <RentIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Hire & Rent </Text>
            </Pressable>

            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <StreamIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Stream </Text>
            </Pressable>

        </View>

        <View className="flex flex-row gap-4 mb-4">
            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <ApplyIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Apply & Register </Text>
            </Pressable>

            <Pressable className="h-32 w-32 rounded-2xl flex-1 flex justify-center items-center bg-[#F0F4FF]">
                <FillIcon height={40} width={40} />
                <Text className="font-bold text-[16px] mt-2">Report & Fill </Text>
            </Pressable>
        </View>
    </SafeAreaView>
}