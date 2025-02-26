import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, Image, Switch } from 'react-native';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isStudent, setIsStudent] = useState(false);

  const handleSignUp = () => {
    if (password === confirmPassword) {
      console.log("Sign up with:", email, fullName);
    } else {
      console.log("Passwords do not match");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logoEasyRommie.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>Sign up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#B0B0B0"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor="#B0B0B0"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#B0B0B0"
        value={fullName}
        onChangeText={setFullName}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Sinh viên</Text>
        <Switch
          value={isStudent}
          onValueChange={setIsStudent}
          thumbColor={isStudent ? '#4CAF50' : '#FF5722'}
        />
        <Text style={styles.switchLabel}>Người đi làm</Text>
      </View>

      <TouchableOpacity onPress={handleSignUp} style={styles.signUpButton}>
        <Text style={styles.signUpText}>Sign up</Text>
      </TouchableOpacity>

      <View style={styles.loginLinkContainer}>
        <Text style={styles.loginLinkText}>Already have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.loginLink}>Log in</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  signUpButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: 'white',
    fontSize: 16,
  },
  loginLinkContainer: {
    flexDirection: 'row',
  },
  loginLinkText: {
    fontSize: 16,
    color: '#5E5E5E',
  },
  loginLink: {
    fontSize: 16,
    color: '#000',
  },
});

export default SignUpScreen;
