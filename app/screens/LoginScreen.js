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
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, components, layout } from '../theme/theme';

const LoginScreen = ({ navigation }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Error', 'Please enter both email/phone and password');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await authService.login(emailOrPhone, password);
      
      if (result.isSuccess) {
        if (result.user.role === 'Customer') {
          await signIn(result.user.token);
          navigation.replace('MainTabs');
        } else {
          Alert.alert('Error', 'You do not have the correct role to access this app.');
        }
      } else {
        Alert.alert('Error', result.message || 'Login failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[layout.container, styles.container]}>
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
            <Text style={styles.welcomeText}>Chào mừng trở lại</Text>
            <Text style={styles.subtitleText}>Đăng nhập để tiếp tục sử dụng EasyRoomie</Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="person-outline" size={22} color={colors.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email hoặc số điện thoại"
                placeholderTextColor={colors.text.disabled}
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={[components.input, styles.inputContainer]}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primary} style={styles.inputIcon} />
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
                  color={colors.text.disabled} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                onPress={() => setRememberMe(!rememberMe)} 
                style={styles.rememberMeContainer}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Ionicons name="checkmark" size={16} color={colors.white} />}
                </View>
                <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPassword}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={handleLogin} 
              style={[components.button, components.buttonPrimary, styles.loginButton]}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={components.buttonText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.footerContainer}>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>Đăng ký</Text>
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
  logo: {
    width: 140,
    height: 140,
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    marginBottom: spacing.lg,
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
    paddingVertical: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberMeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  forgotPassword: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: borderRadius.lg,
    ...components.buttonPrimary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  footerContainer: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  signUpLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default LoginScreen;