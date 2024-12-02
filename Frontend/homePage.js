import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

export default function HomePage({ navigation }) {
  const handlePress = (feature) => {
    console.log(`${feature} button pressed`);
    navigation.navigate(feature);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to WanderMate !</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("ToDoList")}
        >
          <Text style={styles.buttonText}>To Do List</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => handlePress("Maps")}>
          <Text style={styles.buttonText}>Maps</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate("Chatbot")}
        >
          <Text style={styles.buttonText}>Chatbot</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => handlePress("Review")}>
          <Text style={styles.buttonText}>Review</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handlePress("Accommodation")}
        >
          <Text style={styles.buttonText}>Accommodation</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handlePress("Hire a Guide")}
        >
          <Text style={styles.buttonText}>Hire a Guide</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 50,
    marginTop: 30,
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    backgroundColor: "green",
    paddingVertical: 15,
    paddingHorizontal: 20,
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
});
