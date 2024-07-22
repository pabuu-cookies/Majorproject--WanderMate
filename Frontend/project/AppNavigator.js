import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginForm from './login'; // Adjust import path if necessary
import SignUpScreen from './signup'; // Adjust import path if necessary

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginForm} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;