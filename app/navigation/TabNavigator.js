import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import RoommateScreen from '../screens/RoommateScreen';

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
                name="Favorite"
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
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="chat-bubble-outline" size={24} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Setting"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="settings" size={24} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator; 