import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const RentedScreen = ({ navigation }) => {
  const rentedRoom = {
    id: 1,
    landlord: {
      name: 'Nguyễn Xuân Đức',
      avatar: require('../assets/logoEasyRommie.png'),
      isOnline: true,
    },
    price: '2,000,000',
    address: 'Mạn Thiện, Thủ Đức',
    image: require('../assets/logoEasyRommie.png'),
    status: 'Đã có 3 người',
    timestamp: 'Today',
  };

  // Giả lập dữ liệu bài đăng của người dùng
  const myPost = {
    fullName: 'Nguyễn Xuân Đức',
    age: '23',
    gender: 'Nam',
    occupation: 'Là sinh viên còn đi học',
    school: 'Đại học FPT',
    description: 'Xin chào mọi người! Mình là Nguyễn Xuân Đức, hiện đang là sinh viên năm cuối tại trường Đại học FPT, chuyên ngành Công nghệ Thông tin.',
    price: '4000000',
  };

  const handleViewContract = () => {
    // Navigate to contract view screen
    navigation.navigate('ContractView');
  };

  const handleCreateRoommatePost = () => {
    navigation.navigate('CreateRoommatePost');
  };

  const handleViewMyPost = () => {
    navigation.navigate('RoommatePostDetail', { postData: myPost });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6D5BA3', '#8B75C5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Phòng đã thuê</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="#FFF" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeNumber}>2</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Message */}
        <LinearGradient
          colors={['#E8F5E9', '#F1F8E9']}
          style={styles.successMessage}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.successText}>
            Phòng của bạn đã được thuê thành công, bây giờ bạn có thể xem hợp đồng với chủ trọ
          </Text>
        </LinearGradient>

        {/* Room Card */}
        <View style={styles.roomCard}>
          <Image source={rentedRoom.image} style={styles.roomImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          >
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{rentedRoom.price}</Text>
              <Text style={styles.priceUnit}>VNĐ/tháng</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.roomInfo}>
            <View style={styles.addressRow}>
              <MaterialIcons name="location-on" size={16} color="#6D5BA3" />
              <Text style={styles.address}>{rentedRoom.address}</Text>
            </View>

            {/* Landlord Info */}
            <View style={styles.landlordInfo}>
              <View style={styles.landlordRow}>
                <View style={styles.avatarContainer}>
                  <Image source={rentedRoom.landlord.avatar} style={styles.avatar} />
                  {rentedRoom.landlord.isOnline && <View style={styles.onlineIndicator} />}
                </View>
                <View>
                  <Text style={styles.landlordName}>{rentedRoom.landlord.name}</Text>
                  <Text style={styles.landlordTitle}>Chủ trọ</Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{rentedRoom.status}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={handleViewContract}>
                <LinearGradient
                  colors={['#009688', '#26A69A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.button, styles.contractButton]}
                >
                  <MaterialIcons name="description" size={20} color="#FFF" />
                  <Text style={styles.buttonText}>Xem hợp đồng</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* My Post Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài đăng của tôi</Text>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={20} color="#6D5BA3" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handleViewMyPost}>
            <LinearGradient
              colors={['#F0EDF6', '#F8F9FA']}
              style={styles.myPostCard}
            >
              <View style={styles.myPostHeader}>
                <View>
                  <View style={styles.postTitleRow}>
                    <FontAwesome5 name="user-friends" size={16} color="#6D5BA3" />
                    <Text style={styles.myPostTitle}>Tìm người ở ghép</Text>
                  </View>
                  <Text style={styles.myPostPrice}>
                    {Number(myPost.price).toLocaleString('vi-VN')}đ
                    <Text style={styles.priceUnit}>/tháng</Text>
                  </Text>
                </View>
                <LinearGradient
                  colors={['#E8F5E9', '#C8E6C9']}
                  style={styles.badge}
                >
                  <View style={styles.badgeDot} />
                  <Text style={styles.badgeText}>Đang hoạt động</Text>
                </LinearGradient>
              </View>
              <View style={styles.myPostStats}>
                <View style={styles.statItem}>
                  <FontAwesome5 name="user-friends" size={14} color="#6D5BA3" />
                  <Text style={styles.statText}>5 yêu cầu mới</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#6D5BA3" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Create New Post Button */}
        <TouchableOpacity onPress={handleCreateRoommatePost}>
          <LinearGradient
            colors={['#6D5BA3', '#8B75C5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButton}
          >
            <FontAwesome5 name="plus" size={16} color="#FFF" style={styles.createIcon} />
            <Text style={styles.createButtonText}>Tạo bài đăng tìm người ở ghép</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF5252',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  badgeNumber: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  successIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 14,
    lineHeight: 20,
  },
  roomCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
    overflow: 'hidden',
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    padding: 16,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
    opacity: 0.8,
  },
  roomInfo: {
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  address: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 8,
    fontWeight: '500',
  },
  landlordInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
  },
  landlordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  landlordTitle: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#F0EDF6',
    borderRadius: 8,
  },
  myPostCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  myPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  postTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  myPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  myPostPrice: {
    fontSize: 18,
    color: '#6D5BA3',
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '500',
  },
  myPostStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#6D5BA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RentedScreen; 