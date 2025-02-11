import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginForm from "./login";
import SignUpScreen from "./signup";
import HomePage from "./homePage";
import ChatScreen from "./chat";
import ToDoListScreen2 from "./TDL2";
import MapCall from "./map";
import HireGuide from "./HireGuide";

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="Chatbot" component={ChatScreen} />
      <Stack.Screen name="ToDoList" component={ToDoListScreen2} />
      <Stack.Screen name="Maps" component={MapCall} />
      <Stack.Screen name="Guide" component={HireGuide} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
