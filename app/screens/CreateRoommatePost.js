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
    price: suggestedPrice ? suggestedPrice.toString() : '', // Set suggested price if available
  });

  // Update price if suggestedPrice changes
  useEffect(() => {
    if (suggestedPrice) {
      setFormData(prevData => ({
        ...prevData,
        price: suggestedPrice.toString()
      }));
    }
  }, [suggestedPrice]);

  // Log roomId and suggested price for debugging purposes
  useEffect(() => {
    console.log('Room ID received:', roomId);
    console.log('Suggested price received:', suggestedPrice);
  }, [roomId, suggestedPrice]);

  const handleSubmit = async () => {
    try {
        const { title, description, price } = formData;
        if (!roomId) {
            Alert.alert('Error', 'No room ID provided. Please try again.');
            return;
        }
        
        const result = await postService.createRoommatePost(title, description, parseFloat(price), roomId);
        console.log('API Response:', result);
        
        if (result.isSuccess) {
            navigation.navigate('RentedMain', {
                postId: result.data?.postId,
                postData: formData
            });
            Alert.alert('Success', 'Roommate post created successfully!');
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
                Alert.alert('Validation Error', errorMessages);
            } else {
                // If no validation errors, show general error message
                Alert.alert('Error', result.message || 'Failed to create roommate post');
            }
        }
    } catch (error) {
        console.error('Error submitting the form:', error);
        Alert.alert('Error', 'Something went wrong while creating the post');
    }
};

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#4F46E5']}
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
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="Nhập tiêu đề bài đăng lớn hơn 10 kí tự"
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giới thiệu về bản thân</Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="comment-alt" size={16} color="#6366F1" style={[styles.inputIcon, {marginTop: 12}]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Chia sẻ về bản thân, thói quen sinh hoạt..."
                placeholderTextColor="#A0A0A0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giá phòng chia sẻ</Text>
            <View style={styles.inputContainer}>
              <FontAwesome5 name="coins" size={16} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => setFormData({...formData, price: text.replace(/[^0-9]/g, '')})}
                placeholder="Giá phòng (VNĐ)"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
              />
              <Text style={styles.priceUnit}>VNĐ/tháng</Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} activeOpacity={0.8}>
          <LinearGradient
            colors={['#6366F1', '#4F46E5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#FFF" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>Đăng Tin</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Bài đăng của bạn sẽ được hiển thị cho những người đang tìm phòng ở ghép
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
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

