import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import { Asset } from "expo-asset";

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
  Linking,
} from "react-native";
import { Calendar } from "react-native-calendars";
import api from "./api";

const demoGuides = [];

const demoHiredGuide = {
  id: "3",
  name: "Alex Johnson",
  description: "Local wildlife expert.",
  image:
    "http://192.168.1.73:5500/assets/upload/1741617886882-0cd66959-e063-46e9-8246-8fbf9d35c5b0.jpeg", //apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
  availableDates: ["2025-02-08", "2025-02-14"],
  status: "pending",
};

const API_endpoint = "/user/hire/";

const HireGuide = () => {
  const [guides, setGuides] = useState(demoGuides); //replace demo guides with fetched guidess
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedDates, setSelectedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [hiredGuide, setHiredGuide] = useState(demoHiredGuide); //replace demo gudes with hired guides
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      if (!authToken) return;
      try {
        const response = await api.get(`/user/guides`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const transformedGuides = response.data.map((guide) => ({
          id: guide._id,
          name: guide.name,
          description: guide.description || "",
          image: `http://192.168.1.73:5500/assets/upload/${
            //apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
            guide.profileImage || "logo.png"
          }`,
          availableDates: guide.availableDates || [],
          status: guide.status,
          languages: guide.languages || [],
        }));
        setGuides(transformedGuides);
      } catch (error) {
        console.error("Error fetching guides", error);
      }
    };

    const fetchUserGuides = async () => {
      if (!authToken) return;
      try {
        const response = await api.get(`/hire-requests/user`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const transformedGuides = response.data.map((request) => ({
          id: request.guide._id,
          name: request.guide.name,
          description: request.guide.description || "",
          image: `http://192.168.1.73:5500/assets/upload/${
            //apiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
            request.guide.profileImage || "logo.png"
          }`,
          availableDates: request.guide.availableDates || [],
          status: request.status,
          languages: request.guide.languages || [],
        }));
        console.log("\n\n\nMy requests:\n\n", response.data);

        const hired = transformedGuides.find(
          (guide) => guide.status === "accepted"
        );
        setHiredGuide(hired);
        console.log(hired, hiredGuide);
      } catch (error) {
        console.error("Error fetching guides", error);
      }
    };

    fetchUserGuides();
    fetchGuides();
  }, [authToken]);

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
      .get(`${API_endpoint}${newHiredGuide.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
    const newHiredGuideSave = {
      id: selectedGuide.id,
      name: selectedGuide.name,
      description: selectedGuide.description,
      image: selectedGuide.image,
      availableDates: Object.keys(selectedDates),
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
            setHiredGuide(newHiredGuideSave);
            Alert.alert("Success", "Booking request sent!");
            sendHireRequest(newHiredGuide);
          },
        },
      ]
    );
  };
  const openInstagramProfile = () => {
    if (hiredGuide && hiredGuide.instagram) {
      const instagramUrl = "http://instagram.com/prachi.s_";
      Linking.openURL(instagramUrl).catch((err) =>
        console.error("Error opening Instagram profile", err)
      );
    }
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
          <Image source={{ uri: hiredGuide.image }} style={styles.guideImage} />
          <Text style={styles.guideName}>{hiredGuide.name}</Text>
          <Text style={styles.guideDescription}>{hiredGuide.description}</Text>
          <View style={styles.languagesContainer}>
            <Text style={styles.languagesTitle}>Languages:</Text>
            {(hiredGuide.languages || []).map((language, index) => (
              <Text key={index} style={styles.languageText}>
                {language}
              </Text>
            ))}
          </View>
          <Text style={styles.guideDates}>
            Selected Dates: {hiredGuide.availableDates.join(", ")}
          </Text>
          <Text
            style={[
              styles.status,
              { color: hiredGuide.status === "accepted" ? "green" : "orange" },
            ]}
          >
            Status: {hiredGuide.status}
          </Text>
          {hiredGuide.status !== "accepted" ? (
            <Button title="Cancel Booking" onPress={handleCancel} color="red" />
          ) : (
            <TouchableOpacity onPress={openInstagramProfile}>
              <Text style={styles.instagramLink}>Instagram: @prachi.s_</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <Text style={styles.sectionTitle}>Available Guides</Text>
      <FlatList
        data={guides.filter((g) => g.id !== (hiredGuide ? hiredGuide.id : -1))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.guideCard}>
            <Image
              source={{
                uri: item.image,
              }}
              style={styles.guideImage}
            />
            <Text style={styles.guideName}>{item.name}</Text>
            <Text style={styles.guideDescription}>{item.description}</Text>
            <View style={styles.languagesContainer}>
              <Text style={styles.languagesTitle}>Languages:</Text>
              {(item.languages || []).map((language, index) => (
                <Text key={index} style={styles.languageText}>
                  {language}
                </Text>
              ))}
            </View>
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
  instagramLink: {
    fontSize: 14,
    color: "#1e90ff",
    marginBottom: 10,
  },
  languagesContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  languagesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  languageText: {
    fontSize: 14,
    color: "#444",
    marginHorizontal: 5,
  },
});

export default HireGuide;
