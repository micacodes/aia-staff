import React from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { setItem } from '../utils/storage';

// (navigator as any).geolocation = require('@react-native-community/geolocation');

export default function Geolocator() {
    return <GooglePlacesAutocomplete
        fetchDetails
        // currentLocation
        currentLocationLabel='Current location'
        placeholder='Set your location'
        onPress={(data, details = null) => {
            // setItem('location', details.geometry);
        }}
        query={{
            key: 'AIzaSyC9FoD_j2JZvGOu2GvDpXKIx58BCzHM47E',
            language: 'en',
        }}
        renderLeftButton={() => <Icon name="map-marker" size={40} color="#E8503D" />}
        debounce={200}
    />
};