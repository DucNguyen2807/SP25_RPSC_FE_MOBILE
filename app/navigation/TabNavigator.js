import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RoommateScreen from '../screens/RoommateScreen';
import MessageScreen from '../screens/MessageScreen';

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
                name="Favortite"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="favorite-border" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Roommate"
                component={RoommateScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="people" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Room"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="house" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessageScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Menu"
                component={HomeScreen}
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