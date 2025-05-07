import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
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

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      const customerType = isStudent ? 'Student' : 'Worker';
      const result = await authService.registerCustomer(email, password, confirmPassword, fullName, customerType);

      if (result.isSuccess) {
        Alert.alert('Success', result.message);
        navigation.navigate('OtpVerification', { email }); 
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong, please try again.');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Image
              source={require('../assets/logoEasyRommie.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.titleText}>Tạo tài khoản</Text>
            <Text style={styles.subtitleText}>Tìm bạn ở ghép phù hợp với EasyRoomie</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="person-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                placeholderTextColor={colors.text.disabled}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
            
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="mail-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.text.disabled}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={colors.text.disabled}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.text.disabled}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={colors.text.secondary} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userTypeContainer}>
              <Text style={styles.userTypeLabel}>Tôi là:</Text>
              <View style={styles.userTypeOptions}>
                <TouchableOpacity 
                  style={[styles.userTypeButton, isStudent && styles.userTypeActive]}
                  onPress={() => setIsStudent(true)}
                >
                  <Ionicons 
                    name="school-outline" 
                    size={20} 
                    color={isStudent ? colors.white : colors.text.secondary} 
                    style={styles.userTypeIcon}
                  />
                  <Text style={[styles.userTypeText, isStudent && styles.userTypeTextActive]}>Student</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.userTypeButton, !isStudent && styles.userTypeActive]}
                  onPress={() => setIsStudent(false)}
                >
                  <Ionicons 
                    name="briefcase-outline" 
                    size={20} 
                    color={!isStudent ? colors.white : colors.text.secondary} 
                    style={styles.userTypeIcon}
                  />
                  <Text style={[styles.userTypeText, !isStudent && styles.userTypeTextActive]}>Worker</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={handleSignUp} 
              style={styles.signUpButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.signUpButtonText}>Đang xử lý...</Text>
              ) : (
                <Text style={styles.signUpButtonText}>Tạo tài khoản</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerContainer}>
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.lg,
  },
  titleText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    height: 56,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  userTypeContainer: {
    marginBottom: spacing.lg,
  },
  userTypeLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  userTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    height: 56,
  },
  userTypeActive: {
    backgroundColor: colors.primary,
  },
  userTypeIcon: {
    marginRight: spacing.sm,
  },
  userTypeText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  userTypeTextActive: {
    color: colors.white,
  },
  signUpButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerContainer: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  loginLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default SignUpScreen;