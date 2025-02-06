import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Button,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { Calendar } from "react-native-calendars";
import api from "./api";

const demoGuides = [
  {
    id: "1",
    name: "John Doe",
    description: "Experienced mountain guide.",
    image: require("./assets/logo.png"),
    availableDates: ["2025-02-10", "2025-02-15"],
  },
  {
    id: "2",
    name: "Jane Smith",
    description: "Expert in historical tours.",
    image: require("./assets/logo.png"),
    availableDates: ["2025-02-12", "2025-02-20"],
  },
];

const demoHiredGuide = {
  id: "3",
  name: "Alex Johnson",
  description: "Local wildlife expert.",
  image: require("./assets/logo.png"),
  selectedDates: ["2025-02-08", "2025-02-14"],
  status: "pending",
};

const API_endpoint = "/hire/guide/"; // MILAYERA CHANGE GARNU PARXA

const HireGuide = () => {
  const [guides, setGuides] = useState(demoGuides);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [hiredGuide, setHiredGuide] = useState(demoHiredGuide);

  //   useEffect(() => {
  //     fetch("https://your-backend-api.com/guides")
  //       .then((res) => res.json())
  //       .then((data) => setGuides([...demoGuides, ...data]))
  //       .catch((err) => console.error(err));
  //   }, []);

  const openCalendar = (guide) => {
    setSelectedGuide(guide);
    setSelectedDates({});
    setModalVisible(true);
  };

  const handleDayPress = (day) => {
    const newDates = { ...selectedDates };
    if (newDates[day.dateString]) {
      delete newDates[day.dateString];
    } else {
      newDates[day.dateString] = {
        selected: true,
        marked: true,
        selectedColor: "blue",
      };
    }
    setSelectedDates(newDates);
  };

  const sendHireRequest = async (newHiredGuide) => {
    const token = await AsyncStorage.getItem("authToken");
    api
      .post(
        `${API_endpoint}`,
        { newHiredGuide: newHiredGuide },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        console.log("Successfully Added Guide:", response.data);
      })
      .catch((error) => {
        console.error("Error Adding Guide:", error);
      });
  };
  const handleConfirm = () => {
    if (!selectedGuide || Object.keys(selectedDates).length === 0) {
      Alert.alert("Error", "Please select a guide and dates.");
      return;
    }

    const newHiredGuide = {
      id: selectedGuide.id,
      name: selectedGuide.name,
      description: selectedGuide.description,
      image: selectedGuide.image,
      selectedDates: Object.keys(selectedDates),
      status: "pending",
    };

    // Log the data being sent to the backend
    console.log("Data being sent to backend:", newHiredGuide);

    Alert.alert(
      "Confirm Booking",
      "Are you sure you want to book these dates?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            setHiredGuide(newHiredGuide);
            Alert.alert("Success", "Booking request sent!");
            sendHireRequest(newHiredGuide);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setHiredGuide(null);
    Alert.alert("Booking Cancelled", "You have cancelled your guide.");
  };

  return (
    <View style={styles.container}>
      {hiredGuide && (
        <View style={styles.hiredGuideContainer}>
          <Text style={styles.sectionTitle}>Your Guide</Text>
          <Image source={hiredGuide.image} style={styles.guideImage} />
          <Text style={styles.guideName}>{hiredGuide.name}</Text>
          <Text style={styles.guideDescription}>{hiredGuide.description}</Text>
          <Text style={styles.guideDates}>
            Selected Dates: {hiredGuide.selectedDates.join(", ")}
          </Text>
          <Text
            style={[
              styles.status,
              { color: hiredGuide.status === "hired" ? "green" : "orange" },
            ]}
          >
            Status: {hiredGuide.status}
          </Text>
          <Button title="Cancel Booking" onPress={handleCancel} color="red" />
        </View>
      )}
      <Text style={styles.sectionTitle}>Available Guides</Text>
      <FlatList
        data={guides.filter((g) => !hiredGuide || g.id !== hiredGuide.id)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.guideCard}>
            <Image source={item.image} style={styles.guideImage} />
            <Text style={styles.guideName}>{item.name}</Text>
            <Text style={styles.guideDescription}>{item.description}</Text>
            <TouchableOpacity
              onPress={() => openCalendar(item)}
              style={styles.button}
            >
              <Text style={styles.buttonText}>View Available Dates</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Select Available Dates</Text>
          {selectedGuide && selectedGuide.availableDates ? (
            <Calendar markedDates={selectedDates} onDayPress={handleDayPress} />
          ) : (
            <Text>No available dates</Text>
          )}
          <Button
            title="Confirm Booking"
            onPress={handleConfirm}
            color="green"
            style={{ marginBottom: "10px" }}
          />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  hiredGuideContainer: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  guideCard: {
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
  button: {
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
});

export default HireGuide;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 10,
//   },
//   guideCard: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#ddd",
//   },
//   guideImage: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//   },
//   guideName: {
//     fontSize: 18,
//   },
//   guideDescription: {
//     fontSize: 14,
//     color: "gray",
//   },
//   button: {
//     marginTop: 10,
//     backgroundColor: "#007BFF",
//     padding: 10,
//     borderRadius: 5,
//   },
//   buttonText: {
//     color: "white",
//     textAlign: "center",
//   },
//   hiredGuideContainer: {
//     padding: 15,
//     backgroundColor: "#f8f8f8",
//     marginBottom: 20,
//     borderRadius: 10,
//   },
//   guideDates: {
//     fontSize: 16,
//     marginTop: 5,
//   },
//   status: {
//     fontSize: 16,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: "white",
//     padding: 20,
//     marginTop: 100,
//   },
//   modalTitle: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
// });

// export default HireGuide;
