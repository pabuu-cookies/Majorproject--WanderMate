import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const AccommodationScreen = () => {
  const [place, setPlace] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setAuthToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        if (storedToken) {
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error("Error retrieving auth token:", error);
      }
    };
    fetchToken();
  }, []); // Runs only once when component mounts

  // Function to fetch hotels based on the place
  const fetchHotels = async () => {
    if (!place.trim()) {
      alert("Please enter a place");
      return;
    }
    if (!token) {
      alert("Auth token not found. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    const API_endpoint = "/accomodation/";

    try {
      console.log("requesting data");

      // Corrected API call with await
      const response = await api.post(
        API_endpoint,
        { place },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 100000 }
      );

      console.log("Response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setHotels(response.data);
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError("Failed to fetch hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const demoHotelData = [
  //   {
  //     name: "Hotel Crystal Pashupati",
  //     address: "Kathmandu, Nepal",
  //     reviewScore: "8.7 - Fabulous - 59 real reviews",
  //     reviewCount: "59 real reviews",
  //     hotelLink:
  //       "https://www.booking.com/hotel/np/crystal-pashupati.en-gb.html?aid=304142&label=gen173nr-1FCAQoggJCE3NlYXJjaF9wYXN1cGF0aW5hdGhICVgEaKsBiAEBmAEJuAEXyAEM2AEB6AEB-AEDiAIBqAIDuAKcjcG9BsACAdICJDQ2ZmRmNzYxLWE4NjYtNGVhNi1iYjA0LTRmMjRlOThlNzQxMtgCBeACAQ&ucfs=1&arphpl=1&group_adults=2&req_adults=2&no_rooms=1&group_children=0&req_children=0&hpos=1&hapos=1&sr_order=popularity&srpvid=28e436ce11270195&srepoch=1739605675&from=searchresults",
  //   },
  //   {
  //     name: "Shiva Shankar Hotel",
  //     address: "Pashupatināth, Kathmandu, Nepal",
  //     reviewScore: "7.4 - Good - 224 real reviews",
  //     reviewCount: "224 real reviews",
  //     hotelLink:
  //       "https://www.booking.com/hotel/np/shiva-shankar.en-gb.html?aid=304142&label=gen173nr-1FCAQoggJCE3NlYXJjaF9wYXN1cGF0aW5hdGhICVgEaKsBiAEBmAEJuAEXyAEM2AEB6AEB-AEDiAIBqAIDuAKcjcG9BsACAdICJDQ2ZmRmNzYxLWE4NjYtNGVhNi1iYjA0LTRmMjRlOThlNzQxMtgCBeACAQ&ucfs=1&arphpl=1&group_adults=2&req_adults=2&no_rooms=1&group_children=0&req_children=0&hpos=2&hapos=2&sr_order=popularity&srpvid=28e436ce11270195&srepoch=1739605675&from=searchresults",
  //   },
  // ];

  // Function to handle opening hotel links in the browser
  const handleOpenHotelLink = (url) => {
    if (url) {
      Linking.openURL(url);
    } else {
      alert("Hotel link is unavailable");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Hotels</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter a place (e.g., Pashupatinath)"
        value={place}
        onChangeText={setPlace}
      />
      <Button
        title="Search"
        color={"green"}
        onPress={fetchHotels}
        disabled={loading}
      />
      {loading && <Text>Loading...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={hotels}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.hotelItem}>
            <Text style={styles.hotelName}>
              {item.name.replace(/\s*Opens in new window\s*/gi, "").trim()}
            </Text>
            <Text>{item.address}</Text>
            <Text>{item.reviewScore.replace(/\n/g, "\n")}</Text>
            <Button
              title="View Hotel"
              color={"#006600"}
              onPress={() => handleOpenHotelLink(item.hotelLink)}
            />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingLeft: 8,
    borderRadius: 5,
  },
  hotelItem: {
    backgroundColor: "#f8f8f8",
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default AccommodationScreen;
