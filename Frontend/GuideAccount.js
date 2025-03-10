import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { Calendar } from "react-native-calendars";
import api from "./api";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const navigation = useNavigation();

  const [profile, setProfile] = useState({
    profilePicture: null, // File object (image file)
    name: "", // String: User's name
    email: "", // String: User's email
    bio: "", // String: Description
    gender: "", // String: User's gender
    bookedDates: [], // Array of strings: Booked dates in "YYYY-MM-DD" format
    status: "available", // String: Availability status
    languages: [], // Array of strings: Known languages
    experience: 0, // Number: Years of experience
    socialLinks: {
      // Object: Social links
      website: "",
      instagram: "",
      facebook: "",
    },
  });

  const [open, setOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempBookedDates, setTempBookedDates] = useState({});
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
    const fetchGuideProfile = async () => {
      try {
        const response = await api.get(`/user`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        console.log("object", authToken);
        const backendData = response.data;

        setProfile({
          image: `http://192.168.1.73:5500/assets/upload/${
            //api changeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
            backendData.profileImage || "logo.png"
          }`,
          name: backendData.name || "",
          email: backendData.email || "",
          bio: backendData.description || "",
          gender: "",
          bookedDates: backendData.availableDates || [],
          status: backendData.status || "available",
          languages: backendData.languages || [],
          experience: backendData.experience || 0,
          socialLinks: {
            website: "",
            instagram: "",
            facebook: "",
          },
        });
      } catch (error) {
        console.log("Error fetching guide", error);
      }
    };
    fetchGuideProfile();
  }, [authToken]);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    console.log("Image picker result:", result);

    if (!result.canceled && result.assets) {
      console.log("Selected image URI:", result.assets[0].uri);
      setProfile((prev) => ({
        ...prev,
        profilePicture: result.assets[0],
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
    const selectedDates = Object.keys(tempBookedDates);
    setProfile((prev) => ({
      ...prev,
      bookedDates: selectedDates,
    }));
    setShowCalendar(false);
  };

  const handleCancelDates = () => {
    setTempBookedDates({});
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");

      const formData = new FormData();
      if (profile.profilePicture) {
        const uri = profile.profilePicture.uri;
        let filename = uri.split("/").pop();
        let match = /\.(\w+)$/.exec(filename);
        let type = match ? `image/${match[1]}` : `image`;

        formData.append("profileImage", { uri, name: filename, type });
      }
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("description", profile.bio);
      profile.bookedDates.forEach((date) =>
        formData.append("availableDates[]", date)
      );
      formData.append("status", profile.status);
      profile.languages.forEach((language) =>
        formData.append("languages[]", language)
      );
      formData.append("experience", profile.experience.toString()); // Ensure it's a string
      formData.append("socialLinks[website]", profile.socialLinks.website);
      formData.append("socialLinks[instagram]", profile.socialLinks.instagram);
      formData.append("socialLinks[facebook]", profile.socialLinks.facebook);

      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
        if (key === "profileImage") {
          console.log(value);
        }
      });

      const response = await api.post("/user/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Profile updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      throw error;
    }
  };

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {/* Side Navigation */}
      <View style={styles.sideNav}>
        <Pressable onPress={() => navigation.navigate("Profile")}>
          <FontAwesome name="user" size={24} color="black" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("GuideMsg")}>
          <Feather name="message-circle" size={25} color="black" />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("GuideReq")}>
          <Ionicons name="notifications" size={24} color="black" />
        </Pressable>
      </View>

      {/* Main Content with ScrollView */}
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <TouchableOpacity onPress={handleImagePick}>
          <Image
            source={{ uri: profile.image }}
            style={{ width: 100, height: 100, borderRadius: 50 }}
          />
        </TouchableOpacity>

        <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 20 }}>
          Description:
        </Text>
        <TextInput
          value={profile.bio}
          onChangeText={(text) =>
            setProfile((prev) => ({ ...prev, bio: text }))
          }
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
        />

        <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 20 }}>
          Gender:
        </Text>
        <DropDownPicker
          open={open}
          value={profile.gender}
          items={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
          setOpen={setOpen}
          setValue={(callback) => {
            const newValue = callback(profile.gender);
            setProfile((prev) => ({ ...prev, gender: newValue }));
          }}
          placeholder="Select Gender"
        />

        <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 20 }}>
          Booked Days:
        </Text>
        <TouchableOpacity onPress={() => setShowCalendar(true)}>
          <Text
            style={{
              fontWeight: "bold",
              marginTop: 10,
              fontSize: 15,
              color: "blue",
            }}
          >
            Select Dates :
          </Text>
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
          scrollEnabled={false}
        />
        <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 20 }}>
          Languages:
        </Text>
        <TextInput
          value={profile.languages.join(", ")}
          onChangeText={(text) =>
            setProfile((prev) => ({
              ...prev,
              languages: text.split(",").map((lang) => lang.trim()),
            }))
          }
          style={{ borderBottomWidth: 1, marginBottom: 10 }}
          placeholder="Enter languages separated by commas"
        />

        <Text style={{ fontWeight: "bold", marginTop: 20, fontSize: 20 }}>
          Social Links:
        </Text>
        <TextInput
          value={profile.socialLinks.website}
          placeholder="https://www.instagram.com/prachi.s_/"
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={{ backgroundColor: "green", padding: 10, marginTop: 20 }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Update Profile
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
