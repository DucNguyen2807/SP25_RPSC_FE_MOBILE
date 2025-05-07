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
import { colors, typography, spacing, borderRadius, components, layout } from '../theme/theme';

const OtpVerificationScreen = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Verifying OTP for email:", email, "with OTP:", otp);
      const result = await authService.verifyOTP(email, otp);
      
      console.log("OTP Verification result:", result);
      
      if (result.isSuccess) {
        Alert.alert('Thành công', result.message);
        navigation.replace('PersonalInfo', { email });
      } else {
        Alert.alert('Lỗi', result.message || 'Xác thực thất bại');
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Thông báo', 'Mã xác thực mới đã được gửi đến email của bạn');
  };

  return (
    <SafeAreaView style={[layout.container, styles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Ionicons name="mail-open-outline" size={80} color={colors.primary} />
            <Text style={styles.titleText}>Xác thực Email</Text>
            <Text style={styles.subtitleText}>
              Chúng tôi đã gửi mã xác thực đến
            </Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="key-outline" size={22} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mã xác thực"
                placeholderTextColor={colors.text.disabled}
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                autoCapitalize="none"
                maxLength={6}
              />
            </View>
            
            <TouchableOpacity 
              onPress={handleVerifyOtp} 
              style={[components.button, components.buttonPrimary, styles.verifyButton]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={components.buttonText}>Xác thực</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Không nhận được mã? </Text>
              <TouchableOpacity onPress={handleResendCode}>
                <Text style={styles.resendLink}>Gửi lại</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back-outline" size={20} color={colors.primary} style={styles.backIcon} />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  titleText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitleText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  emailText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  formContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    letterSpacing: 2,
  },
  verifyButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  footerContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  backIcon: {
    marginRight: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default OtpVerificationScreen;