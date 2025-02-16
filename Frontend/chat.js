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
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [chatId, setChatId] = useState(null);

  useEffect(() => {
    const saveChatId = async (id) => {
      try {
        await AsyncStorage.setItem("chatId", id);
      } catch (error) {
        console.error("Error saving chatId:", error);
      }
    };

    const loadChatId = async () => {
      try {
        const storedChatId = await AsyncStorage.getItem("chatId");
        if (storedChatId) setChatId(storedChatId);
      } catch (error) {
        console.error("Error loading chatId:", error);
      }
    };

    // const fetchSavedMessages = async () => {
    //   try {
    //     const token = await AsyncStorage.getItem("authToken");
    //     if (!token) return;

    //     const response = await axios.get("http://192.168.1.147:5500/latest", {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     });

    //     console.log("Fetched Chat Response:", response.data);

    //     if (!Array.isArray(response.data) || response.data.length === 0) {
    //       console.error(
    //         "Invalid chat data format or empty data:",
    //         response.data
    //       );
    //       return;
    //     }

    //     const latestChat = response.data[response.data.length - 1];
    //     if (!latestChat.messages || !Array.isArray(latestChat.messages)) {
    //       console.error("Invalid messages format in chat object");
    //       return;
    //     }

    //     const formattedMessages = latestChat.messages.map((msg) => ({
    //       _id: msg._id,
    //       text: msg.text,
    //       createdAt: new Date(msg.createdAt),
    //       user: msg.user,
    //     }));

    //     setMessages(formattedMessages);
    //   } catch (error) {
    //     console.error(
    //       "Error fetching latest chat:",
    //       error.response?.data || error.message
    //     );
    //   }
    // };
    const fetchChat = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get("http://192.168.1.64:5500/chat", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.length > 0) {
          const latestChat = response.data[response.data.length - 1];
          setChatId(latestChat._id); // Set the chat ID from backend
          setMessages(latestChat.messages); // Load previous messages
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

    // fetchSavedMessages();
    fetchChat();
    fetchToken();
    const backAction = () => {
      saveChatToBackend(chatId);
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, []);

  // Function to send the message to the chatbot API
  const sendMessageToAPI = async (message) => {
    console.log("object", authToken);
    if (authToken) {
      try {
        const response = await axios.post(
          "http://192.168.1.64:3000/chat",
          { message },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "text/plain",
            },
            responseType: "text",
          }
        );
        console.log("response", response.data);
        const botMessage = {
          _id: Math.random(), // Generate a random ID for the bot's message
          text: response.data || "Sorry, I didn’t get that.", // Default response
          createdAt: new Date(),
          user: {
            _id: 2, // Assuming 2 is the bot's user ID
            name: "Bot",
          },
        };

        setMessages((previousMessages) => [...previousMessages, botMessage]);
      } catch (error) {
        console.error("Error sending message to API:", error);
      }
    }
  };
  const saveChatToBackend = async () => {
    if (!authToken || messages.length === 0) return;

    try {
      if (!chatId) {
        // If no chatId, create a new chat
        const response = await axios.post(
          "http://192.168.1.64:5500/chat",
          { messages },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("New Chat Created:", response.data);
        setChatId(response.data._id); // Store new chatId
      } else {
        // Update the existing chat
        await axios.patch(
          `http://192.168.1.64:5500/chat/${chatId}`,
          { messages },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Chat Updated");
      }
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const storeMessagesToAsyncStorage = async (messages) => {
    try {
      await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
      console.log("store bhayo" + messages);
    } catch (error) {
      console.error("Error saving messages to AsyncStorage", error);
    }
  };

  // Handle send button press
  const onSendMessage = () => {
    if (inputText.trim()) {
      const userMessage = {
        _id: Math.random(),
        text: inputText,
        createdAt: new Date(),
        user: {
          _id: 1, // User ID
          name: "You",
        },
      };
      console.log(userMessage);

      setMessages((previousMessages) => {
        const newMessages = [...previousMessages, userMessage];
        storeMessagesToAsyncStorage(newMessages);
        return newMessages;
      });
      sendMessageToAPI(inputText);
      setInputText("");
    }
  };

  // Function to render each message
  const renderItem = ({ item }) => {
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
        keyExtractor={(item) => item._id.toString()}
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
