import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

function MapCall(props) {
  const markers = [
    {
      id: 1,
      title: "Pashupatinath Temple",
      latitude: 27.7104,
      longitude: 85.3488,
    },
    {
      id: 2,
      title: "Swaymbhunath",
      latitude: 27.7149,
      longitude: 85.2908,
    },
    {
      id: 3,
      title: "Kathmandu Durbar Square",
      latitude: 27.7044,
      longitude: 85.3075,
    },
  ];

  const defaultLocation = {
    latitude: 27.7172, // Latitude for Kathmandu
    longitude: 85.324, // Longitude for Kathmandu
    latitudeDelta: 0.0622, // Adjust for zoom level
    longitudeDelta: 0.0421, // Adjust for zoom level
  };

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to get your location: ${error.message}` +
          " Make sure your location is enabled."
      );
      setLocation(defaultLocation);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          getCurrentLocation();
        } else {
          Alert.alert(
            "Permission Denied",
            "Location permission is required to show your current location on the map."
          );
          setLocation(defaultLocation);
          setLoading(false);
        }
      } catch (error) {
        console.warn(error);
        setLocation(defaultLocation);
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>MAP</Text>
      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={location || defaultLocation}
        region={location}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
          />
        ))}
        <Marker coordinate={location}>
          <Image
            source={require("./assets/logo.png")}
            style={{ width: 40, height: 40 }} // Adjust width and height as needed
          />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MapCall;
