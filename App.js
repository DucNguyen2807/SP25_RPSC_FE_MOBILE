import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './app/context/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
