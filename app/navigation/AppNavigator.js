import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ChatScreen from '../screens/ChatScreen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import MapScreen from '../screens/MapScreen';

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
      {/* Thêm các màn hình phụ khác ở đây */}
      {/* Ví dụ:
      <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
