// HarmoniousLivingScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const HarmoniousLivingScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sống chung hòa thuận</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400/E8F5E9/4CAF50?text=Harmonious+Living' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="people-outline" size={36} color="#4CAF50" />
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chia sẻ không gian sống</Text>
          <Text style={styles.paragraph}>
            Sống chung với người khác có thể mang đến nhiều niềm vui nhưng cũng đầy thách thức. 
            Việc xây dựng một môi trường sống hòa thuận đòi hỏi sự tôn trọng và thấu hiểu lẫn nhau.
          </Text>
        </View>

        {/* Communication Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao tiếp hiệu quả</Text>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Trò chuyện thường xuyên</Text>
              <Text style={styles.tipDescription}>
                Dành thời gian nói chuyện với người ở cùng, chia sẻ những khó khăn và mong muốn.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="document-text-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Thiết lập nội quy rõ ràng</Text>
              <Text style={styles.tipDescription}>
                Cùng nhau xây dựng quy tắc về giờ giấc, khách đến thăm, vệ sinh chung và chia sẻ không gian.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="ear-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Lắng nghe và thấu hiểu</Text>
              <Text style={styles.tipDescription}>
                Cố gắng nhìn nhận từ góc độ của người khác, tránh phán xét và thể hiện sự quan tâm.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Shared Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chia sẻ trách nhiệm</Text>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Lịch trình công việc</Text>
              <Text style={styles.tipDescription}>
                Tạo lịch vệ sinh, nấu ăn hoặc các công việc chung để đảm bảo trách nhiệm được chia đều.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="cash-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Quản lý chi tiêu</Text>
              <Text style={styles.tipDescription}>
                Thống nhất cách chia sẻ các khoản chi phí chung như thực phẩm, vật dụng, wifi...
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="thumbs-up-outline" size={20} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Ghi nhận đóng góp</Text>
              <Text style={styles.tipDescription}>
                Đừng quên cảm ơn khi người khác làm việc nhà hoặc mang đến không khí tích cực.
              </Text>
            </View>
          </View>
        </View>

        {/* Resolving Conflicts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giải quyết xung đột</Text>
          <View style={styles.conflictCard}>
            <View style={styles.conflictStep}>
              <View style={[styles.stepCircle, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Bình tĩnh và chọn thời điểm thích hợp để nói chuyện</Text>
            </View>
            
            <View style={styles.conflictStep}>
              <View style={[styles.stepCircle, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Sử dụng ngôn ngữ tích cực, tránh đổ lỗi</Text>
            </View>
            
            <View style={styles.conflictStep}>
              <View style={[styles.stepCircle, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Đề xuất giải pháp thay vì chỉ nêu vấn đề</Text>
            </View>
            
            <View style={styles.conflictStep}>
              <View style={[styles.stepCircle, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Sẵn sàng thỏa hiệp và tìm điểm chung</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// SecuritySafetyScreen.js
export const SecuritySafetyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF9800" />
      
      {/* Header */}
      <LinearGradient
        colors={['#FF9800', '#FFA726']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>An ninh và an toàn</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400/FFF3E0/FF9800?text=Security+Safety' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="shield-checkmark-outline" size={36} color="#FF9800" />
            </View>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bảo vệ ngôi nhà chung</Text>
          <Text style={styles.paragraph}>
            An ninh và an toàn là yếu tố quan trọng để có một cuộc sống yên bình. 
            Những biện pháp phòng ngừa đơn giản có thể bảo vệ bạn và tài sản của bạn khỏi các rủi ro.
          </Text>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>An ninh phòng trọ</Text>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Khóa cửa an toàn</Text>
              <Text style={styles.tipDescription}>
                Luôn khóa cửa khi ra ngoài, ngay cả khi chỉ đi vắng trong thời gian ngắn.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="eye-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Cảnh giác với người lạ</Text>
              <Text style={styles.tipDescription}>
                Không mở cửa cho người lạ và thông báo với chủ trọ khi thấy người khả nghi.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="key-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Bảo quản chìa khóa</Text>
              <Text style={styles.tipDescription}>
                Không để chìa khóa ở nơi dễ thấy và tránh đánh dấu địa chỉ trên móc khóa.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Fire Safety */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phòng cháy chữa cháy</Text>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flame-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Thiết bị điện an toàn</Text>
              <Text style={styles.tipDescription}>
                Tắt các thiết bị điện khi không sử dụng, tránh quá tải ổ cắm.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Tìm hiểu lối thoát hiểm</Text>
              <Text style={styles.tipDescription}>
                Nắm rõ các lối thoát khẩn cấp và quy trình sơ tán khi có hỏa hoạn.
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <View style={[styles.tipIconSmall, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="water-outline" size={20} color="#FF9800" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipItemTitle}>Trang bị bình cứu hỏa</Text>
              <Text style={styles.tipDescription}>
                Đề xuất với chủ trọ lắp đặt bình cứu hỏa và báo khói tại các vị trí phù hợp.
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Số điện thoại khẩn cấp</Text>
          <View style={styles.emergencyContainer}>
            <TouchableOpacity style={styles.emergencyButton}>
              <View style={styles.emergencyIconContainer}>
                <Ionicons name="call-outline" size={24} color="#FFF" />
              </View>
              <View>
                <Text style={styles.emergencyName}>Cảnh sát</Text>
                <Text style={styles.emergencyNumber}>113</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emergencyButton}>
              <View style={[styles.emergencyIconContainer, { backgroundColor: '#F44336' }]}>
                <Ionicons name="flame-outline" size={24} color="#FFF" />
              </View>
              <View>
                <Text style={styles.emergencyName}>Cứu hỏa</Text>
                <Text style={styles.emergencyNumber}>114</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.emergencyButton}>
              <View style={[styles.emergencyIconContainer, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="medkit-outline" size={24} color="#FFF" />
              </View>
              <View>
                <Text style={styles.emergencyName}>Cấp cứu</Text>
                <Text style={styles.emergencyNumber}>115</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách kiểm tra an toàn</Text>
          <TouchableOpacity style={styles.checklistButton}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#FF9800" />
            <Text style={styles.checklistText}>Tải danh sách kiểm tra an toàn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Common styles for both screens
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: -20,
    right: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  conflictCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
  },
  conflictStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  emergencyContainer: {
    marginTop: 8,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emergencyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emergencyName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  emergencyNumber: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '700',
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  checklistText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    marginLeft: 8,
  },
});

export default HarmoniousLivingScreen; 