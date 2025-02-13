import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
// import axios from "axios";
import api from "./api";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [authToken, setAuthToken] = useState(null);

  // Fetch the token from AsyncStorage when the component mounts
  const fetchAuthToken = async () => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
    }
  };
  fetchAuthToken();
  useEffect(() => {
    // Initial message setup (optional)
    // setMessages([
    //   {
    //     _id: 1,
    //     text: "Hello User",
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: "React Native",
    //       avatar: require("./assets/logo.png"),
    //     },
    //   },
    //   {
    //     _id: 2,
    //     text: "Hello",
    //     createdAt: new Date(),
    //     user: {
    //       _id: 1,
    //       name: "React Native",
    //       avatar: require("./assets/logo.png"),
    //     },
    //   },
    // ]);
  }, []);

  // Function to send the message to the API
  const sendMessageToAPI = async (message) => {
    if (authToken) {
      try {
        // Call the chatbot query API
        const response = await api.post(
          "/chatbot/query", // Replace with your actual URL
          { message }, // Send the message in the body
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Send the token in the header
            },
          }
        );

        // Assuming response.data contains the reply from the chatbot
        const botMessage = {
          _id: Math.random(), // Generate a random ID for the bot's message
          text: response.data.message || "Sorry, I didn't get that.", // Default response
          createdAt: new Date(),
          user: {
            _id: 2, // Assuming 2 is the bot's user ID
            name: "Bot",
            avatar: require("./assets/logo.png"),
          },
        };

        // Append the bot's response to the chat
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [botMessage])
        );
      } catch (error) {
        console.error("Error sending message to API:", error);
      }
    }
  };

  // Handle sending a message
  const onSend = useCallback(
    (messages = []) => {
      // setMessages((previousMessages) =>
      //   GiftedChat.append(previousMessages, messages)
      // );

      // Send the message to the API
      const userMessage = messages[0].text;
      fetchAuthToken();
      sendMessageToAPI(userMessage); // Send the message to your chatbot API
    },
    [authToken] // Re-run the callback if authToken changes
  );

  // renderSend function
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{ marginBottom: 5, marginRight: 5 }}
            size={32}
            color="green"
          />
        </View>
      </Send>
    );
  };

  // renderBubble function with default parameters
  const renderBubble = (props) => {
    const {
      wrapperStyle = { right: { backgroundColor: "green" } },
      textStyle = { right: { color: "#fff" } },
    } = props;

    return (
      <Bubble {...props} wrapperStyle={wrapperStyle} textStyle={textStyle} />
    );
  };

  // Scroll-to-bottom component
  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: 1,
      }}
      renderBubble={renderBubble}
      alwaysShowSend
      renderSend={renderSend}
      scrollToBottom
      scrollToBottomComponent={scrollToBottomComponent}
    />
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
