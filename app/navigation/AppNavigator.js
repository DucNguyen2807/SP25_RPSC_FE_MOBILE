import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
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
