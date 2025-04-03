import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Verifying OTP for email:", email, "with OTP:", otp);
      const result = await authService.verifyOTP(email, otp);
      
      console.log("OTP Verification result:", result);
      
      if (result.isSuccess) {
        Alert.alert('Success', result.message);
        navigation.replace('PersonalInfo', { email });
      } else {
        Alert.alert('Error', result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Implement resend OTP functionality here
    Alert.alert('Info', 'New verification code sent to your email');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Ionicons name="mail-open-outline" size={80} color="#6C63FF" />
            <Text style={styles.titleText}>Email Verification</Text>
            <Text style={styles.subtitleText}>
              We've sent a verification code to
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={22} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter Verification Code"
                placeholderTextColor="#ACACAC"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                autoCapitalize="none"
                maxLength={6}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleVerifyOtp} 
              style={styles.verifyButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back-outline" size={20} color="#6C63FF" style={styles.backIcon} />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8F9',
    borderRadius: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
    height: 60,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333333',
    letterSpacing: 2,
  },
  verifyButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#888888',
  },
  resendLink: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  backIcon: {
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '500',
  },
});

export default OtpVerificationScreen;