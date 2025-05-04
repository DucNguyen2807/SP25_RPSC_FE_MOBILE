import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import postService from '../services/postService';

const CreateRoommatePost = ({ route, navigation }) => {
  // Get roomId and suggestedPrice from route params
  const { roomId, suggestedPrice } = route.params || {};
  
  const [formData, setFormData] = useState({
    title: '',
    description: 'Xin chào mọi người! Mình đang tìm người ở ghép, mình là người gọn gàng, sạch sẽ và tôn trọng không gian riêng tư của người khác.',
    price: suggestedPrice ? suggestedPrice.toString() : '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState('');

  // Update price if suggestedPrice changes
  useEffect(() => {
    if (suggestedPrice) {
      const priceString = suggestedPrice.toString();
      setFormData(prevData => ({
        ...prevData,
        price: priceString
      }));
      setFormattedPrice(formatCurrency(priceString));
    }
  }, [suggestedPrice]);

  // Log roomId and suggested price for debugging purposes
  useEffect(() => {
    console.log('Room ID received:', roomId);
    console.log('Suggested price received:', suggestedPrice);
  }, [roomId, suggestedPrice]);

  const formatCurrency = (value) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Format with commas for thousands
    if (numericValue) {
      return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return '';
  };

  const handlePriceChange = (text) => {
    // Store raw numeric value in formData
    const numericValue = text.replace(/[^0-9]/g, '');
    setFormData({...formData, price: numericValue});
    
    // Display formatted value
    setFormattedPrice(formatCurrency(numericValue));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Tiêu đề phải có ít nhất 10 ký tự';
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    // Validate price
    if (!formData.price) {
      newErrors.price = 'Giá phòng không được để trống';
    } else if (parseInt(formData.price) <= 0) {
      newErrors.price = 'Giá phòng phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin nhập vào');
      return;
    }

    if (!roomId) {
      Alert.alert('Lỗi', 'Không có ID phòng. Vui lòng thử lại.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { title, description, price } = formData;
      
      const result = await postService.createRoommatePost(title.trim(), description.trim(), parseFloat(price), roomId);
      console.log('API Response:', result);
      
      if (result.isSuccess) {
        navigation.navigate('RentedMain', {
          postId: result.data?.postId,
          postData: formData
        });
        Alert.alert('Thành công', 'Bạn đã đăng tin tìm người ở ghép thành công!');
      } else {
        // Check if there are validation errors in the result
        if (result.errors && Object.keys(result.errors).length > 0) {
          // Create error message string from the errors object
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(', ')}`;
              } else {
                return `${field}: ${messages}`;
              }
            })
            .join('\n');
          
          console.log('Validation Errors:', errorMessages);
          Alert.alert('Lỗi xác thực', errorMessages);
        } else {
          // If no validation errors, show general error message
          Alert.alert('Lỗi', result.message || 'Không thể tạo bài đăng');
        }
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tạo bài đăng');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Status Bar Configuration */}
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#ACDCD0" 
        translucent={true}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#ACDCD0', '#ACDCD0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Bài Đăng Tìm Bạn Ở Ghép</Text>
      </LinearGradient>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <SafeAreaView style={styles.safeAreaContent}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header Illustration */}
            <View style={styles.illustrationContainer}>
              <FontAwesome5 name="home" size={64} color="#6366F1" />
              <Text style={styles.illustrationText}>Tìm Người Ở Ghép</Text>
            </View>
            
            {/* Form Container */}
            <View style={styles.formContainer}>
              {/* Title Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tiêu đề bài đăng</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="heading" size={16} color="#6366F1" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.title ? styles.inputError : null]}
                    value={formData.title}
                    onChangeText={(text) => {
                      setFormData({...formData, title: text});
                      if (errors.title) {
                        setErrors({...errors, title: null});
                      }
                    }}
                    placeholder="Nhập tiêu đề bài đăng lớn hơn 10 kí tự"
                    placeholderTextColor="#A0A0A0"
                    maxLength={100}
                  />
                </View>
                {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
                <Text style={styles.charCount}>{formData.title.length}/100</Text>
              </View>

              {/* Description Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giới thiệu về bản thân</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="comment-alt" size={16} color="#6366F1" style={[styles.inputIcon, {marginTop: 12}]} />
                  <TextInput
                    style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                    value={formData.description}
                    onChangeText={(text) => {
                      setFormData({...formData, description: text});
                      if (errors.description) {
                        setErrors({...errors, description: null});
                      }
                    }}
                    placeholder="Chia sẻ về bản thân, thói quen sinh hoạt..."
                    placeholderTextColor="#A0A0A0"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                </View>
                {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
                <Text style={styles.charCount}>{formData.description.length}/500</Text>
              </View>

              {/* Price Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Giá phòng chia sẻ</Text>
                <View style={styles.inputContainer}>
                  <FontAwesome5 name="coins" size={16} color="#6366F1" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.price ? styles.inputError : null]}
                    value={formattedPrice}
                    onChangeText={handlePriceChange}
                    placeholder="Giá phòng (VNĐ)"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="numeric"
                  />
                  <Text style={styles.priceUnit}>VNĐ/tháng</Text>
                </View>
                {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              onPress={handleSubmit} 
              activeOpacity={0.8} 
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#ACDCD0', '#ACDCD0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.submitButton, isSubmitting ? styles.submitButtonDisabled : null]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <FontAwesome5 name="paper-plane" size={16} color="#FFF" style={styles.submitIcon} />
                    <Text style={styles.submitButtonText}>Đăng Tin</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Bài đăng của bạn sẽ được hiển thị cho những người đang tìm phòng ở ghép
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  safeAreaContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 16,
  },
  illustrationText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 12,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  charCount: {
    position: 'absolute',
    right: 0,
    bottom: -18,
    fontSize: 12,
    color: '#6B7280',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  priceUnit: {
    position: 'absolute',
    right: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default CreateRoommatePost;