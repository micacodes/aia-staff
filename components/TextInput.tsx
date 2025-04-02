import React from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';

export const TextInput = (props) => {

  const {
    label,
    ...inputProps
  } = props;

  return (

    <View className='w-10/12'>
      {label && (<Text className=''>{label}</Text>)}
      <View className='bg-[#F0F4FF] rounded-lg px-2 py-2 w-full'>
        <RNTextInput placeholder={props.placeholder} className='' />
      </View>
    </View>

  );
};

