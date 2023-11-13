import React from "react";
import { View, Image, StyleSheet, Text, SafeAreaView } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MapScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.78825, // Initial latitude for the map
          longitude: -122.4324, // Initial longitude for the map
          latitudeDelta: 0.0922, // Delta for latitude (zoom level)
          longitudeDelta: 0.0421, // Delta for longitude (zoom level)
        }}
      >
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
      </MapView>
    </View>
  );
};

export default MapScreen;