import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  BackHandler,
} from "react-native";
import { Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const storedMessages = await AsyncStorage.getItem("messages");

        if (storedMessages) {
          setMessages(JSON.parse(storedMessages)); // Parse the stored messages
        } else {
          setMessages([]); // Ensure messages is always an array
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          console.log("got token", token);
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token:", error);
      }
    };
    fetchChat();
    fetchToken();
  }, []);

  // Function to send the message to the chatbot API
  const sendMessageToAPI = async (message) => {
    if (!authToken) return;

    try {
      const response = await axios.post(
        "http://192.168.1.64:3000/chat",
        { message },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data); // Debugging step
      if (!response.data || !response.data.reply) {
        console.error("Missing reply in API response");
        return;
      }

      const botMessage = {
        text: response.data.reply || "Sorry, I didn’t get that.",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "Bot",
        },
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, botMessage];
        AsyncStorage.setItem("messages", JSON.stringify(newMessages)).catch(
          (error) => console.error("Error saving messages:", error)
        );
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message to API:", error);
    }
  };

  // Handle send button press
  const onSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        text: inputText,
        createdAt: new Date(),
        user: {
          _id: 1, // User ID
          name: "You",
        },
      };

      setMessages((previousMessages) => {
        const newMessages = [...previousMessages, userMessage];

        // Store updated messages in AsyncStorage
        AsyncStorage.setItem("messages", JSON.stringify(newMessages)).catch(
          (error) => {
            console.error("Error saving messages to AsyncStorage:", error);
          }
        );

        return newMessages;
      });

      sendMessageToAPI(inputText);
      setInputText("");
    }
  };

  const clearChatHistory = async () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to delete all chat history?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("messages"); // Delete stored messages
              setMessages([]); // Clear UI messages
              console.log("Chat history cleared!");
            } catch (error) {
              console.error("Error clearing chat history:", error);
            }
          },
        },
      ]
    );
  };

  // Function to render each message
  const renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.messageContainer,
          item.user._id === 1 ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  const onContentSizeChange = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          const createdAt = new Date(item.createdAt); // Ensure createdAt is a Date object
          return `${createdAt.getTime()}-${index}`; // Use getTime() safely
        }}
        onContentSizeChange={onContentSizeChange}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          value={inputText}
          onChangeText={setInputText}
        />
        <Button color={"green"} title="Send" onPress={onSendMessage} />
      </View>
      <Button color="red" title="Clear Chat" onPress={clearChatHistory} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#f0f0f0",
  },
  messageContainer: {
    padding: 10,
    marginBottom: 10,
    maxWidth: "80%",
    borderRadius: 10,
    marginHorizontal: 15,
  },
  userMessage: {
    backgroundColor: "green",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#0a5b61",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default ChatScreen;
