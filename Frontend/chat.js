import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // Icon for translation

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
          setMessages(JSON.parse(storedMessages));
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      }
    };

    const fetchToken = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token:", error);
      }
    };
    fetchChat();
    fetchToken();
  }, []);

  const sendMessageToAPI = async (message) => {
    if (!authToken) return;

    try {
      const response = await axios.post(
        "http://192.168.1.73:3000/chat",
        { message },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.reply) {
        return;
      }

      const botMessage = {
        text: response.data.reply,
        createdAt: new Date(),
        user: { _id: 2, name: "Bot" },
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, botMessage];
        AsyncStorage.setItem("messages", JSON.stringify(newMessages));
        return newMessages;
      });
    } catch (error) {
      console.error("Error sending message to API:", error);
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

  const onContentSizeChange = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const API_endpoint = "/chatbot/translate/";

  const translateMessage = async (text) => {
    if (!authToken) return;
    try {
      const response = await api.post(
        API_endpoint,
        {
          translatefrom: "en",
          text: text,
          translateTo: "ne",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.translatedText) {
        const translatedText =
          response.data.translatedText[0]?.translation ||
          "Translation unavailable";
        Alert.alert("Translated Text", translatedText);
      }
    } catch (error) {
      console.error("Error translating message:", error);
    }
  };

  const onSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        text: inputText,
        createdAt: new Date(),
        user: { _id: 1, name: "You" },
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, userMessage];
        AsyncStorage.setItem("messages", JSON.stringify(newMessages));
        return newMessages;
      });

      sendMessageToAPI(inputText);
      setInputText("");
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.user._id === 1 ? styles.userMessage : styles.botMessage,
      ]}
    >
      <View style={styles.messageRow}>
        <Text style={styles.messageText}>{item.text}</Text>
        {item.user._id === 2 && (
          <TouchableOpacity onPress={() => translateMessage(item.text)}>
            <Ionicons
              name="language"
              size={20}
              color="#fff"
              style={{ padding: 10 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.createdAt}-${index}`}
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
    flexDirection: "row",
    alignItems: "center",
  },
  userMessage: {
    backgroundColor: "green",
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#0a5b61",
    alignSelf: "flex-start",
  },
  messageRow: {
    flexDirection: "column",
    alignItems: "center",
    flexWrap: "wrap", // Allows text and icon to stay on the same row
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    flexShrink: 1, // Ensures text doesn't push out the icon
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
