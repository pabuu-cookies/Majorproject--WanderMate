import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  Image,
  View,
} from "react-native";
import axios from "axios";
import api from "./api";

const logo = require("./assets/logo.png");

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const API_endpoint = "user/register/";

  const handleSignUp = async () => {
    try {
      try {
        const response = await api.post(
          API_endpoint,
          {
            name,
            email: username,
            password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data; // Axios stores the response data here
        console.log(data);
      } catch (error) {
        console.error(
          "Error during the API call:",
          error.response?.data || error.message
        );
      }

      if (response.ok) {
        if (data.success) {
          navigation.navigate("Home");
        } else {
          Alert.alert("Error", data.message || "Registration failed.");
        }
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
        console.error("Error response:", data); // Log server error details
      }
    } catch (error) {
      console.error("Error during signup:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
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
    paddingVertical: 40,
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
