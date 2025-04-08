import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CreateRoommatePost = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Xuân Đức',
    age: '23',
    gender: 'Nam',
    occupation: 'Là sinh viên còn đi học',
    school: 'Đại học FPT',
    description: 'Xin chào mọi người! Mình là Trần Vũ Khải, hiện đang là sinh viên năm cuối tại trường Đại học FPT, chuyên ngành Công nghệ Thông tin. Mình có niềm đam mê với phát triển phần mềm và đặc biệt quan tâm đến các dự án liên quan đến web và ứng dụng di động.',
    price: '4000000',
  });

  const handleSubmit = () => {
    // TODO: Submit form data to API
    navigation.navigate('RoommatePostDetail', { postData: formData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6D5BA3', '#8B75C5']}
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
        <Text style={styles.headerTitle}>Tạo bài đăng tìm người ở ghép</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#F0EDF6', '#F8F9FA']}
            style={styles.greetingContainer}
          >
            <Text style={styles.greeting}>Hello, tui là {formData.fullName}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <FontAwesome5 name="birthday-cake" size={12} color="#6D5BA3" style={styles.infoIcon} />
                <Text style={styles.infoText}>{formData.age} tuổi</Text>
              </View>
              <View style={styles.infoBadge}>
                <FontAwesome5 name="user" size={12} color="#6D5BA3" style={styles.infoIcon} />
                <Text style={styles.infoText}>{formData.gender}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Occupation Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="briefcase" size={16} color="#6D5BA3" />
            <Text style={styles.sectionTitle}>Công việc/Học vấn hiện tại</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.occupation}
            onChangeText={(text) => setFormData({...formData, occupation: text})}
            placeholder="VD: Sinh viên năm 3, Nhân viên văn phòng,..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* School/Company Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="building" size={16} color="#6D5BA3" />
            <Text style={styles.sectionTitle}>Nơi học tập/làm việc</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.school}
            onChangeText={(text) => setFormData({...formData, school: text})}
            placeholder="VD: Đại học FPT, Công ty ABC,..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="user-circle" size={16} color="#6D5BA3" />
            <Text style={styles.sectionTitle}>Giới thiệu về bản thân</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="Chia sẻ về bản thân, sở thích, thói quen sinh hoạt..."
            placeholderTextColor="#A0A0A0"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Price Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
            <Text style={styles.sectionTitle}>Giá phòng muốn share</Text>
          </View>
          <View style={styles.priceContainer}>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={formData.price}
              onChangeText={(text) => setFormData({...formData, price: text})}
              placeholder="Giá phòng"
              placeholderTextColor="#A0A0A0"
              keyboardType="numeric"
            />
            <Text style={styles.priceUnit}>/tháng</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient
            colors={['#6D5BA3', '#8B75C5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <FontAwesome5 name="paper-plane" size={16} color="#FFF" style={styles.submitIcon} />
            <Text style={styles.submitButtonText}>Đăng tin</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
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
    fontWeight: '600',
    color: '#FFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  greetingContainer: {
    borderRadius: 12,
    padding: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6D5BA3',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#F8F9FA',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  priceContainer: {
    position: 'relative',
  },
  priceInput: {
    paddingRight: 64,
  },
  priceUnit: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#6D5BA3',
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
});

export default CreateRoommatePost; 