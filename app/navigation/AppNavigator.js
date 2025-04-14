import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import MapScreen from '../screens/MapScreen';
import RoommateDetailScreen from '../screens/RoommateDetailScreen';
import RoomDetailScreen from '../screens/RoomDetailScreen';
import SignUpScreen from '../screens/SignUpScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import SaveResourcesScreen from '../screens/SaveResourcesScreen';
import HarmoniousLivingScreen from '../screens/HarmoniousLivingScreen'
import { SecuritySafetyScreen } from '../screens/SaveResourcesScreen';
import RoomStayDetail from '../screens/RoomStayDetail';
import RoommatePostDetail from '../screens/RoommatePostDetail';
import CustomerRequestsScreen from '../screens/CustomerRequestsScreen';
import RoomMembersScreen from '../screens/RoomMembersScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name="SignUp"
        component={SignUpScreen}
      />
      
      <Stack.Screen 
        name="OtpVerification"
        component={OtpVerificationScreen}
      />
      <Stack.Screen 
        name="PersonalInfo" 
        component={PersonalInfoScreen}
        options={{
          headerShown: false,
          title: 'Personal Information',
          headerStyle: {
            backgroundColor: '#E5E5E5',
          },
          headerTintColor: '#000',
        }}
      />
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
      />
      <Stack.Screen 
        name="RoomStayDetail" 
        component={RoomStayDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="RoommatePostDetail" 
        component={RoommatePostDetail}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SaveResource" 
        component={SaveResourcesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="HarmoniousLiving" 
        component={HarmoniousLivingScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="SecuritySafety" 
        component={SecuritySafetyScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="RoommateDetail" 
        component={RoommateDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="RoomDetail" 
        component={RoomDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="CustomerRequests" 
        component={CustomerRequestsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="RoomMembers" 
        component={RoomMembersScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
