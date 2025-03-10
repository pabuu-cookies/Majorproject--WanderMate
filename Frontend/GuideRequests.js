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
// import { io } from "socket.io-client";

// const API_endpoint = "/guide/requests/"; // Replace with your backend endpoint
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

  // useEffect(() => {
  //   fetchRequests();
  //   setupSocket();
  // }, []);

  // const fetchRequests = async () => {
  //   const token = await AsyncStorage.getItem("authToken");
  //   fetch(API_endpoint, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setRequests(data))
  //     .catch((err) => console.error("Error fetching requests:", err));
  // };

  // const setupSocket = () => {
  //   socket.on("connect", () => {
  //     console.log("Connected to socket server");
  //   });

  //   socket.on("newRequest", (newRequest) => {
  //     setRequests((prevRequests) => [newRequest, ...prevRequests]);
  //   });

  //   socket.on("requestUpdated", (updatedRequest) => {
  //     setRequests((prevRequests) =>
  //       prevRequests.map((req) =>
  //         req.id === updatedRequest.id ? updatedRequest : req
  //       )
  //     );
  //   });
  // };

  const handleAccept = (requestId) => {
    // updateRequestStatus(requestId, "accepted");
    console.log("accepted", requestId);
  };

  const handleReject = (requestId) => {
    console.log("rejetcted", requestId);
    // updateRequestStatus(requestId, "rejected");
  };

  // const updateRequestStatus = async (requestId, status) => {
  //   const token = await AsyncStorage.getItem("authToken");

  //   // Send the PATCH request to update the status
  //   fetch(`${API_endpoint}${requestId}/`, {
  //     method: "PATCH",
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ status }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       // Notify the server about the update
  //       socket.emit("updateRequest", data);

  //       // Update the local state
  //       if (status === "rejected") {
  //         // Remove the rejected request from the list
  //         setRequests((prevRequests) =>
  //           prevRequests.filter((req) => req.id !== requestId)
  //         );
  //       } else {
  //         // Update the status of the request
  //         setRequests((prevRequests) =>
  //           prevRequests.map((req) =>
  //             req.id === requestId ? { ...req, status: status } : req
  //           )
  //         );
  //       }

  //       // Show a success message
  //       Alert.alert("Success", `Request ${status}`);
  //     })
  //     .catch((err) => {
  //       console.error("Error updating request:", err);
  //       Alert.alert("Error", "Failed to update the request status.");
  //     });
  // };

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
          data={demoRequests} //change thissssssssssssssssssss
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
                    onPress={() => handleAccept(item.id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: "red" }]}
                    onPress={() => handleReject(item.id)}
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
