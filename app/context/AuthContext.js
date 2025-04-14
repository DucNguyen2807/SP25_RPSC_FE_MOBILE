import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token from AsyncStorage when app starts
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (newToken) => {
    try {
      await AsyncStorage.setItem('userToken', newToken);
      setToken(newToken);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setToken(null);
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
