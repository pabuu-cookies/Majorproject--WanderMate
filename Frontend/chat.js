import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Bubble, GiftedChat, Send } from "react-native-gifted-chat";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ChatScreen = () => {
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: "Hello User",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "React Native",
        avatar: require("./assets/logo.png"),
      },
    },
    {
      _id: 2,
      text: "Hello",
      createdAt: new Date(),
      user: {
        _id: 1,
        name: "React Native",
        avatar: require("./assets/logo.png"),
      },
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello User",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: require("./assets/logo.png"),
        },
      },
      {
        _id: 2,
        text: "Hello",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: "React Native",
          avatar: require("./assets/logo.png"),
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

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
