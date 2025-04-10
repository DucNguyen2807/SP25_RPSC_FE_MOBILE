import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import RentedStackNavigator from './RentedStackNavigator';
import RoommateScreen from '../screens/RoommateScreen';
import MessageScreen from '../screens/MessageScreen';
import HomeScreen from '../screens/HomeScreen';
import MenuScreen from '../screens/MenuScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#6D5BA3',
                tabBarInactiveTintColor: '#666',
            }}
        >
            <Tab.Screen
                name="Rented"
                component={RentedStackNavigator}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="history" size={24} color={color} />
                    ),
                    tabBarLabel: 'Rented'
                }}
            />
            <Tab.Screen
                name="Roommate"
                component={RoommateScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="people" size={24} color={color} />
                    ),
                    tabBarLabel: 'Roommate'
                }}
            />
            <Tab.Screen
                name="Room"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="house" size={24} color={color} />
                    ),
                    tabBarLabel: 'Room'
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessageScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
                    ),
                    tabBarLabel: 'Messages'
                }}
            />
            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="menu" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator; 