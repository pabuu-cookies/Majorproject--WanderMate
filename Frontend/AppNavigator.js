import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginForm from "./login";
import SignUpScreen from "./signup";
import HomePage from "./homePage";
import ChatScreen from "./chat";
import ToDoListScreen2 from "./TDL2";
import MapCall from "./map";
import HireGuide from "./HireGuide";
import AccommodationScreen from "./Accommodation";
import ReviewsComponent from "./review";
import ProfileScreen from "./GuideAccount";
import GuideMsg from "./guideMsg";
import GuideRequests from "./GuideRequests";

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
      <Stack.Screen name="Accommodation" component={AccommodationScreen} />
      <Stack.Screen name="Review" component={ReviewsComponent} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="GuideMsg" component={GuideMsg} />
      <Stack.Screen name="GuideReq" component={GuideRequests} />
    </Stack.Navigator>
  );
}

export default AppNavigator;
