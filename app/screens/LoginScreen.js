import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

const LoginScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput placeholder="Username" style={{ borderBottomWidth: 1, marginBottom: 20 }} />
      <TextInput placeholder="Password" secureTextEntry style={{ borderBottomWidth: 1, marginBottom: 20 }} />
      <Button title="Login" onPress={() => {}} />
    </View>
  );
};

export default LoginScreen;
