import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import RentedScreen from '../screens/RentedScreen';
import CreateRoommatePost from '../screens/CreateRoommatePost';
import RoommatePostDetail from '../screens/RoommatePostDetail';
import SentRequestsScreen from '../screens/SentRequestsScreen';

const Stack = createStackNavigator();

const RentedStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RentedMain" component={RentedScreen} />
      <Stack.Screen name="CreateRoommatePost" component={CreateRoommatePost} />
      <Stack.Screen name="RoommatePostDetail" component={RoommatePostDetail} />
      <Stack.Screen name="SentRequests" component={SentRequestsScreen} />
    </Stack.Navigator>
  );
};

export default RentedStackNavigator; 