import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginForm from "./login"; // Adjust import path if necessary
import SignUpScreen from "./signup"; // Adjust import path if necessary
import HomePage from "./homePage";
import ChatScreen from "./chat";
import ToDoListScreen from "./toDoList";
import ToDoListScreen2 from "./TDL2";

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Chatbot" component={ChatScreen} />
      <Stack.Screen name="ToDoList" component={ToDoListScreen2} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
