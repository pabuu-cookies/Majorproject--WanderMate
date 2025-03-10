import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import socket from "./socket";
import api from "./api";

// import { io } from "socket.io-client";

const API_endpoint = "/guide/requests/"; // Replace with your backend endpoint
// const socket = io("https://your-backend-socket-server.com"); // Replace with your socket server URL
const demoRequests = [
  {
    id: "1",
    name: "Alice Johnson",
    selectedDates: ["2025-03-10", "2025-03-11", "2025-03-12"],
    status: "pending",
  },
  {
    id: "2",
    name: "Bob Smith",
    selectedDates: ["2025-03-15", "2025-03-16"],
    status: "pending",
  },
  {
    id: "3",
    name: "Charlie Brown",
    selectedDates: ["2025-03-20", "2025-03-21", "2025-03-22"],
    status: "pending",
  },
];

const GuideRequests = () => {
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [authToken, setAuthToken] = useState(null);
  const [notifications, setNotifications] = useState(demoRequests);

  useEffect(() => {
    socket.on("notification", (request) => {
      console.log("Aayo meesage", request);
      setRequests((prevRequests) => [...prevRequests, request]);
    });

    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          console.log("token set", token);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };
    fetchToken();

    // Clean up the socket connection on unmount
    return () => {
      socket.off("notification");
    };
  }, []);

  const fetchRequests = async () => {
    const response = await api.get("/hire-requests/guide", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    let backendData = response.data;
    console.log("got requests", backendData);
    setRequests(
      backendData.map((request) => ({
        id: request._id,
        name: request.client.name,
        selectedDates: request.client.availableDates,
        status: request.status,
        createdAt: new Date(request.createdAt),
      }))
    );
  };

  useEffect(() => {
    const fetchUserIdAndJoinSocketRoom = async () => {
      try {
        console.log("TOKEN:           ", authToken);
        const response = await api.get(`/user`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log("object");
        const userId = response.data._id;
        socket.emit("joinRoom", { roomId: userId });
        console.log("jpoined troom", userId);
      } catch (error) {
        // console.error("Error fetching id", error);
      }
    };

    fetchUserIdAndJoinSocketRoom();
    fetchRequests();
  }, [authToken]);

  const sendGuideResponse = async (resp, id) => {
    console.log("Response", resp, id);
    const response = await api.patch(
      `/hire-requests/${id}`,
      {
        status: resp,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data, "request response");
    fetchRequests();
  };

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Side Navigation */}
      <View style={styles.sideNav}>
        <Pressable
          // style={styles.button}
          onPress={() => navigation.navigate("Profile")}
        >
          <FontAwesome name="user" size={24} color="black" />
        </Pressable>
        <Pressable
          // style={styles.button}
          onPress={() => navigation.navigate("GuideMsg")}
        >
          <Feather name="message-circle" size={25} color="black" />
        </Pressable>
        <Pressable
          // style={styles.button}
          onPress={() => navigation.navigate("GuideReq")}
        >
          <Ionicons name="notifications" size={24} color="black" />
        </Pressable>
      </View>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Hire Requests</Text>
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.requestCard}>
              {/* <Image source={{ uri: item.image }} style={styles.guideImage} /> */}
              <Text style={styles.guideName}>{item.name}</Text>
              {/* <Text style={styles.guideDescription}>{item.description}</Text> */}
              <Text style={styles.guideDates}>
                Selected Dates: {item.selectedDates.join(", ")}
              </Text>
              <Text
                style={[
                  styles.status,
                  { color: item.status === "accepted" ? "green" : "orange" },
                ]}
              >
                Status: {item.status}
              </Text>
              {item.status === "pending" && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "green" }]}
                    onPress={() => sendGuideResponse("accepted", item.id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "red" }]}
                    onPress={() => sendGuideResponse("cancelled", item.id)}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sideNav: {
    width: 60,
    backgroundColor: "white",
    paddingTop: 50,
    justifyContent: "space-evenly",
    alignItems: "center",
    height: "100%",
  },
  button: {
    backgroundColor: "gray",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  requestCard: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  guideImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  guideName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  guideDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  guideDates: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default GuideRequests;
