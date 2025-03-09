import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Calendar } from "react-native-calendars";
import api from "./api";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    profilePicture: null,
    bio: "",
    gender: "",
    bookedDates: [],
  });
  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempBookedDates, setTempBookedDates] = useState({}); // Temporary state for selected dates

  const handleImagePick = async () => {
    console.log("Launching image library...");

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    }

    // Launch the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true, // Allow cropping or editing
      aspect: [1, 1], // Aspect ratio for cropping
      quality: 1, // Image quality (0 to 1)
    });

    console.log("Image picker result:", result);

    if (!result.canceled && result.assets) {
      console.log("Selected image URI:", result.assets[0].uri);
      setProfile((prev) => ({
        ...prev,
        profilePicture: result.assets[0].uri,
      }));
    }
  };

  const handleDateSelect = (day) => {
    const selectedDate = day.dateString;
    setTempBookedDates((prev) => ({
      ...prev,
      [selectedDate]: { selected: true, selectedColor: "blue" },
    }));
  };

  const handleConfirmDates = () => {
    // Update the profile's bookedDates with the selected dates
    const selectedDates = Object.keys(tempBookedDates);
    setProfile((prev) => ({
      ...prev,
      bookedDates: selectedDates,
    }));
    setShowCalendar(false); // Close the calendar
  };

  const handleCancelDates = () => {
    setTempBookedDates({}); // Clear temporary selected dates
    setShowCalendar(false); // Close the calendar
  };

  const handleSubmit = async () => {
    console.log("profile details:", profile);
    try {
      await api.post("/user/profile/update", profile);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
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

      {/* Main Content */}
      <View style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={
              profile.profilePicture
                ? { uri: profile.profilePicture }
                : require("./assets/logo.png")
            }
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        </TouchableOpacity>

        <Text>Bio:</Text>
        <TextInput
          value={profile.bio}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, bio: text }))
          }
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />

        <Text>Gender:</Text>
        <DropDownPicker
          open={open}
          value={profile.gender}
          items={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
          setOpen={setOpen}
          setValue={(val) => setProfile((prev) => ({ ...prev, gender: val }))}
          placeholder="Select Gender"
        />

        <Text>Booked Days:</Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text>Select Dates</Text>
        </TouchableOpacity>
        {showCalendar && (
          <View>
            <Calendar
              onDayPress={handleDateSelect}
              markedDates={tempBookedDates}
            />
            <View style={styles.calendarButtonsContainer}>
              <TouchableOpacity
                onPress={handleConfirmDates}
                style={styles.calendarButton}
              >
                <Text style={styles.calendarButtonText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelDates}
                style={styles.calendarButton}
              >
                <Text style={styles.calendarButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <FlatList
          data={profile.bookedDates}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <Text>{item}</Text>}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={{ backgroundColor: "green", padding: 10, marginTop: 20 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Update Profile
          </Text>
        </TouchableOpacity>
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
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendarButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  calendarButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    width: "45%",
    alignItems: "center",
  },
  calendarButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
