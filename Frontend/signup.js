import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Image,
  View,
  Alert,
} from "react-native";
import api from "./api";

const logo = require("./assets/logo.png");

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const API_endpoint = "user/register/";

  const handleSignUp = async () => {
    try {
      const response = await api.post(
        API_endpoint,
        {
          name,
          email: username,
          password,
          role,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      console.log("Response:", data);

      // Check for success based on the backend response structure
      if (data.status === "success" || data._id) {
        // Navigate to "Profile" if role is "guide", otherwise navigate to "Home"
        if (role === "guide") {
          navigation.navigate("Profile");
        } else {
          navigation.navigate("Home");
        }
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>WANDERMATE</Text>
      <Text style={styles.title}>Sign up</Text>
      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="FULL NAME"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          value={username}
          onChangeText={setUsername}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.radioContainer}>
        <Pressable onPress={() => setRole("user")} style={styles.radioButton}>
          <View
            style={[
              styles.radioCircle,
              role === "user" && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioText}>Tourist</Text>
        </Pressable>
        <Pressable onPress={() => setRole("guide")} style={styles.radioButton}>
          <View
            style={[
              styles.radioCircle,
              role === "guide" && styles.radioSelected,
            ]}
          />
          <Text style={styles.radioText}>Guide</Text>
        </Pressable>
      </View>

      <View style={styles.buttonView}>
        <Pressable style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>SIGN UP</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 70,
  },
  image: {
    height: 120,
    width: 170,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    paddingVertical: 20,
    color: "green",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "green",
    borderWidth: 1,
    borderRadius: 7,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginVertical: 20,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "green",
    marginRight: 10,
  },
  radioSelected: {
    backgroundColor: "green",
  },
  radioText: {
    fontSize: 18,
    color: "black",
  },
  button: {
    backgroundColor: "green",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
  },
});
