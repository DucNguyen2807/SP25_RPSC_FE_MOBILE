import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    console.log("Logging in with:", email, password);
    navigation.navigate('PersonalInfoScreen');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logoEasyRommie.png')}
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Your email"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.rememberMeContainer}>
        <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rememberMeCheckbox}>
          {rememberMe && <View style={styles.checked} />}
        </TouchableOpacity>
        <Text style={styles.rememberMeText}>Remember me</Text>
      </View>
      <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
        <Text style={styles.signInText}>Sign in</Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    paddingLeft: 15,
    fontSize: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#5E5E5E',
    borderRadius: 3,
  },
  rememberMeText: {
    fontSize: 16,
  },
  signInButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    color: 'white',
    fontSize: 16,
  },
  forgotPassword: {
    fontSize: 16,
    color: '#5E5E5E',
    marginBottom: 40,
  },
  signUpContainer: {
    flexDirection: 'row',
  },
  signUpText: {
    fontSize: 16,
    color: '#5E5E5E',
  },
  signUpLink: {
    fontSize: 16,
    color: '#000',
  },
});

export default LoginScreen;
