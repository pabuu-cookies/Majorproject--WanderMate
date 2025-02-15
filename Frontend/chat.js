// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   Button,
//   StyleSheet,
//   Platform,
// } from "react-native";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const ChatScreen = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputText, setInputText] = useState("");
//   const [authToken, setAuthToken] = useState(null);
//   const flatListRef = useRef(null);

//   useEffect(() => {
//     const fetchSavedMessages = async () => {
//       try {
//         const savedMessages = await AsyncStorage.getItem("chatMessages");
//         if (savedMessages) {
//           setMessages(JSON.parse(savedMessages)); // Parse the stored messages
//         }
//       } catch (error) {
//         console.error("Error retrieving saved messages", error);
//       }
//     };
//     const fetchTokenAndTasks = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         if (token) {
//           setAuthToken(token);
//         }
//       } catch (error) {
//         console.error("Error retrieving auth token", error);
//       }
//     };
//     fetchSavedMessages();
//     fetchTokenAndTasks();
//   }, []);

//   // Function to send the message to the chatbot API
//   const sendMessageToAPI = async (message) => {
//     console.log("object", authToken);
//     if (authToken) {
//       try {
//         const response = await axios.post(
//           "http://192.168.1.65:3000/chat",
//           { message },
//           {
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//               "Content-Type": "text/plain",
//             },
//             responseType: "text",
//           }
//         );
//         console.log("response", response.data);
//         const botMessage = {
//           _id: Math.random(), // Generate a random ID for the bot's message
//           text: response.data || "Sorry, I didn’t get that.", // Default response
//           createdAt: new Date(),
//           user: {
//             _id: 2, // Assuming 2 is the bot's user ID
//             name: "Bot",
//           },
//         };

//         setMessages((previousMessages) => [...previousMessages, botMessage]);
//       } catch (error) {
//         console.error("Error sending message to API:", error);
//       }
//     }
//   };
//   const storeMessagesToAsyncStorage = async (messages) => {
//     try {
//       await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
//       console.log("store bhayo" + messages);
//     } catch (error) {
//       console.error("Error saving messages to AsyncStorage", error);
//     }
//   };

//   // Handle send button press
//   const onSendMessage = () => {
//     if (inputText.trim()) {
//       const userMessage = {
//         _id: Math.random(),
//         text: inputText,
//         createdAt: new Date(),
//         user: {
//           _id: 1, // User ID
//           name: "You",
//         },
//       };
//       console.log(userMessage);

//       setMessages((previousMessages) => {
//         const newMessages = [...previousMessages, userMessage];
//         storeMessagesToAsyncStorage(newMessages);
//         return newMessages;
//       });
//       sendMessageToAPI(inputText);
//       setInputText("");
//     }
//   };

//   // Function to render each message
//   const renderItem = ({ item }) => {
//     return (
//       <View
//         style={[
//           styles.messageContainer,
//           item.user._id === 1 ? styles.userMessage : styles.botMessage,
//         ]}
//       >
//         <Text style={styles.messageText}>{item.text}</Text>
//       </View>
//     );
//   };
//   const onContentSizeChange = () => {
//     if (flatListRef.current) {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Chat messages */}
//       <FlatList
//         ref={flatListRef}
//         data={messages}
//         renderItem={renderItem}
//         keyExtractor={(item) => item._id.toString()}
//         onContentSizeChange={onContentSizeChange}
//       />

//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.textInput}
//           placeholder="Type a message"
//           value={inputText}
//           onChangeText={setInputText}
//         />
//         <Button color={"green"} title="Send" onPress={onSendMessage} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "#f0f0f0",
//   },
//   messageContainer: {
//     padding: 10,
//     marginBottom: 10,
//     maxWidth: "80%",
//     borderRadius: 10,
//     marginHorizontal: 15,
//   },
//   userMessage: {
//     backgroundColor: "green",
//     alignSelf: "flex-end",
//   },
//   botMessage: {
//     backgroundColor: "#0a5b61",
//     alignSelf: "flex-start",
//   },
//   messageText: {
//     color: "#fff",
//     fontSize: 16,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     padding: 15,
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },
//   textInput: {
//     flex: 1,
//     borderColor: "#ccc",
//     borderWidth: 1,
//     padding: 10,
//     borderRadius: 5,
//     marginRight: 10,
//   },
// });

// export default ChatScreen;

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
import axios from "axios"; // Use Axios to handle API requests
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native"; // React Navigation hook

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation(); // Navigation hook

  useEffect(() => {
    const fetchSavedMessages = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem("chatMessages");
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages)); // Parse the stored messages
        }
      } catch (error) {
        console.error("Error retrieving saved messages", error);
      }
    };

    const fetchTokenAndTasks = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Error retrieving auth token", error);
      }
    };

    fetchSavedMessages();
    fetchTokenAndTasks();

    // Listen to back button press for Android
    const backAction = () => {
      saveChatToBackend();
      return true; // Prevent default back action
    };

    BackHandler.addEventListener("hardwareBackPress", backAction);

    // Cleanup on component unmount
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", backAction);
    };
  }, []);

  // Function to send the chat to the backend
  const saveChatToBackend = async () => {
    if (authToken && messages.length > 0) {
      try {
        const response = await axios.post(
          "http://192.168.1.65:3000/saveChat", // Replace with your actual backend URL
          { messages },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Chat saved to backend:", response.data);

        // Redirect to another screen or go back
        navigation.goBack();
      } catch (error) {
        console.error("Error saving chat to backend", error);
      }
    }
  };

  // Function to send the message to the chatbot API
  const sendMessageToAPI = async (message) => {
    if (authToken) {
      try {
        const response = await axios.post(
          "http://192.168.1.65:3000/chat", // Replace with your actual backend URL
          { message },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "text/plain",
            },
            responseType: "text",
          }
        );

        const botMessage = {
          _id: Date.now(), // Using timestamp as a unique ID
          text: response.data || "Sorry, I didn’t get that.",
          createdAt: new Date(),
          user: { _id: 2, name: "Bot" },
        };

        // Add bot's message to chat
        setMessages((previousMessages) => {
          const newMessages = [...previousMessages, botMessage];
          storeMessagesToAsyncStorage(newMessages); // Store messages in AsyncStorage
          return newMessages;
        });
      } catch (error) {
        console.error("Error sending message to API:", error);
      }
    }
  };

  // Store messages to AsyncStorage
  const storeMessagesToAsyncStorage = async (messages) => {
    try {
      await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
    } catch (error) {
      console.error("Error saving messages to AsyncStorage", error);
    }
  };

  // Handle send button press
  const onSendMessage = () => {
    if (inputText.trim()) {
      const userMessage = {
        _id: Date.now(), // Using timestamp as a unique ID
        text: inputText,
        createdAt: new Date(),
        user: { _id: 1, name: "You" },
      };

      setMessages((previousMessages) => {
        const newMessages = [...previousMessages, userMessage];
        storeMessagesToAsyncStorage(newMessages); // Store updated messages in AsyncStorage
        return newMessages;
      });

      sendMessageToAPI(inputText);
      setInputText(""); // Clear input field
    }
  };

  // Render each message
  const renderItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.user._id === 1 ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  // Scroll to the bottom when the list is updated
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Chat messages */}
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        ref={flatListRef} // Set reference for FlatList
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
