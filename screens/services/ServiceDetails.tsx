import { useEffect, useState, useContext } from 'react'

import { View, Text, SafeAreaView, ScrollView, Pressable, ImageBackground, FlatList, Modal} from "react-native";
import VendorCard from '../../components/VendorCard';
import { api } from '../../utils/api';
import { CartContext } from '../../providers/CartProvider';
import Slider from '@react-native-community/slider';
import { SelectList, MultipleSelectList } from 'react-native-dropdown-select-list'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { set } from 'date-fns';
import ProductCard from '../../components/ProductCard';

export default function ServicesDetails({ navigation, route }) {
  const { service } = route.params

  const { carts, addToCart } = useContext(CartContext)

  const [filtering, setFiltering] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [productTypes, setProductTypes] = useState<ProductType[]>([])
  const [vendorCategories, setVendorCategories] = useState<ProductType[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState("");

  const data = [
    { key: '1', value: 'Mobiles', disabled: true },
    { key: '2', value: 'Appliances' },
    { key: '3', value: 'Cameras' },
    { key: '4', value: 'Computers', disabled: true },
    { key: '5', value: 'Vegetables' },
    { key: '6', value: 'Diary Products' },
    { key: '7', value: 'Drinks' },
  ]

  useEffect(() => {
    navigation.setOptions({ title: service.name })

    api.get<PaginatedData<ProductCategory>>(`product-categories`).then(({ data }) => {
      setProductCategories(data)
    })

    api.get<PaginatedData<ProductType>>(`product-types`).then(({ data }) => {
      setProductTypes(data)
    })

    api.get<PaginatedData<Vendor>>('vendors', { per: 15 }).then(({ data }) => {
      setVendors(data)
    })

    api.get<PaginatedData<Product>>('products', { per: 15 }).then(({ data }) => {
      setProducts(data)
    })
  }, [])

  return (
    <SafeAreaView className='bg-white'>
      <Text className='mx-4 font-bold'>
        {service.details}
      </Text>

      <ScrollView horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 pt-4"
      >
        <View className='flex flex-row gap-2 mb-2 justify-center'>
          {productTypes.map(typ => <Pressable
            key={typ.id}
            className='rounded-lg py-2 px-3 flex items-center justify-center bg-[#83BBAE]'
          >
            <Text className='text-white'>
              {typ.name}
            </Text>
          </Pressable>)}
        </View>
      </ScrollView>

      <View className='mt-4 mb-4 px-4 flex flex-row justify-between'>
        <View>
          <Text className='font-bold text-lg txt-red-400'>Our Top Vendors</Text>
        </View>
        <View>
          <Text className='font-bold text-primary-600'>See all</Text>
        </View>
      </View>

      <View className="flex flex-row justify-between mb-4 px-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='w-full flex flex-row mb-2 space-x-6'>
          {vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} navigation={navigation} />)}
        </ScrollView>
      </View>

      <View className='mt-4 mb-4 px-4 flex flex-row justify-between'>
        <View>
          <Text className='font-bold text-lg'>Products</Text>
        </View>
        <View>
          <Pressable
            onPress={() => setFiltering(!filtering)}
          >
            <Text className='font-bold text-primary-600'>Filter</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        animationType="slide"
        visible={filtering}
        onRequestClose={() => setFiltering(false)}
      >
        <View className="flex justify-center items-center px-4 h-screen space-y-5">
          <View>
          <Text className='text-2xl '>Filter records</Text>
          </View>
          <View className="flex space-y-3 justify-between w-full mb-4">
            <View className='mb-4'>
              <Text>Price range</Text>

              <Slider
                className='w-full h-10'
                minimumValue={0}
                maximumValue={100000}
                minimumTrackTintColor="#eee"
                maximumTrackTintColor="#000000"
              />
            </View>

            <View>
              <SelectList
                setSelected={(t) => setVendorCategories([...vendorCategories, ...[t]])}
                data={data}
                save="value"
                placeholder="Restaurant type"
              />
            </View>
            <View>
              <Text>Zone</Text>
            </View>

            <View>
              <MultipleSelectList
                setSelected={setSelected}
                data={data}
                save="value"
                onSelect={() => alert(selected)}
                label="Food type"
                placeholder="Select food type"
              />
            </View>
          </View>

          <Pressable
            onPress={() => setFiltering(!filtering)}
            className="bg-primary-600 px-5 py-3 w-full flex flex-row justify-center items-center text-white rounded-lg"
          >
            <Text className="text-white">Apply filters</Text>
          </Pressable>

          <View className="flex flex-row justify-center items-center mt-8">
            <Pressable onPress={() => setFiltering(false)}>
              <Text className="font-bold text-primary-700">
                Close popup
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

        <View className='flex flex-row gap-4 mb-4 px-2 overflow-y-scroll'>
          <FlatList
            data={products}
            numColumns={2}
            contentContainerStyle={{ gap: 5 }}
            columnWrapperStyle={{ gap: 5 }}
            key={2}
            renderItem={({ item: product }) => <ProductCard product={product} navigation={navigation} />}
            keyExtractor={item => item.id}
          />
        </View>
    </SafeAreaView>
  )
}
