import { useState, useEffect } from 'react'
import { Text, SafeAreaView, ScrollView, Pressable, FlatList, Image, View } from "react-native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api, imagePath } from "../utils/api";

export default function AllServices({ navigation }) {
    const gap = 5

    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        api.get<PaginatedData<Task>>('tasks', {per: 30}).then(({ data }) => {
            setTasks(data)
        })
    }, [])

    return <SafeAreaView className="bg-white px-4 pb-4 overflow-y-scroll">
        <ScrollView>
            <View>
                <FlatList
                    renderItem={({ item: task }) => <Pressable key={task.id}
                        className="h-32 w-32 rounded-xl flex-1 flex justify-center items-center"
                        onPress={() => navigation.navigate('Task', { task })}
                    >
                        <Image source={{ uri: imagePath(task.image?.url) }} className='h-12 w-12' />
                        <Text className="font-bold text-[16px] mt-2 text-gray-500">
                            {task.name}
                        </Text>
                    </Pressable>}
                    data={tasks}
                    numColumns={2}
                    contentContainerStyle={{ gap }}
                    columnWrapperStyle={{ gap }}
                    key={2}
                />
            </View>
        </ScrollView>
    </SafeAreaView>
}