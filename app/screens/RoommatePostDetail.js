import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const RoommatePostDetail = ({ route, navigation }) => {
  const { postData } = route.params;
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleShowProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const ProfileModal = ({ user, visible, onClose }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={onClose}
      >
        <Pressable style={styles.modalContent}>
          {/* Profile Header with Gradient */}
          <LinearGradient
            colors={['#6D5BA3', '#8B75C5', '#A390E4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileHeader}
          >
            <View style={styles.profileHeaderContent}>
              <Image
                source={require('../assets/logoEasyRommie.png')}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <Text style={styles.profileOccupation}>{user?.occupation}</Text>
                <View style={styles.onlineStatus}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Online</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <ScrollView style={styles.profileDetails}>
            {/* Basic Info Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Thông tin cơ bản</Text>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="user" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.age} tuổi • {user?.gender}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="briefcase" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.occupation}</Text>
              </View>
            </View>

            {/* Tags Section Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Sở thích & Tính cách</Text>
              <View style={styles.profileTags}>
                <LinearGradient
                  colors={['#6D5BA3', '#8B75C5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.profileTag}
                >
                  <FontAwesome5 name="smile" size={14} color="#FFF" style={styles.tagIcon} />
                  <Text style={styles.profileTagTextNew}>Hòa đồng</Text>
                </LinearGradient>
                <LinearGradient
                  colors={['#4CAF50', '#66BB6A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.profileTag}
                >
                  <FontAwesome5 name="heart" size={14} color="#FFF" style={styles.tagIcon} />
                  <Text style={styles.profileTagTextNew}>Dễ tính</Text>
                </LinearGradient>
                <LinearGradient
                  colors={['#1976D2', '#42A5F5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.profileTag}
                >
                  <FontAwesome5 name="utensils" size={14} color="#FFF" style={styles.tagIcon} />
                  <Text style={styles.profileTagTextNew}>Món nào cũng biết nấu</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Contact Info Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Thông tin liên hệ</Text>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="envelope" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.email}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="phone" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.phone}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.profileActionButton}
                onPress={() => {
                  onClose();
                  navigation.navigate('Chat', { userId: 1 });
                }}
              >
                <LinearGradient
                  colors={['#6D5BA3', '#8B75C5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionButtonGradient}
                >
                  <FontAwesome5 name="comment" size={16} color="#FFF" />
                  <Text style={styles.actionButtonText}>Nhắn tin ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <MaterialIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderRequestItem = ({ name, age, gender, occupation, email, phone }) => (
    <View style={styles.requestCard}>
      <TouchableOpacity 
        style={styles.requestHeader}
        onPress={() => handleShowProfile({ name, age, gender, occupation, email, phone })}
      >
        <Image
          source={require('../assets/logoEasyRommie.png')}
          style={styles.avatar}
        />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{name}</Text>
          <Text style={styles.requestOccupation}>{occupation}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate('Chat', { userId: 1 })}
          >
            <FontAwesome5 name="comment" size={16} color="#6D5BA3" />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.profileButton]}
            onPress={() => handleShowProfile({ name, age, gender, occupation, email, phone })}
          >
            <FontAwesome5 name="user" size={16} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="envelope" size={14} color="#666" />
          <Text style={styles.detailText}>{email}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="phone" size={14} color="#666" />
          <Text style={styles.detailText}>{phone}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="info-circle" size={14} color="#666" />
          <Text style={styles.detailText}>{age} tuổi • {gender}</Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => {
            // TODO: Handle accept request
            navigation.navigate('AcceptRequest', { 
              requestId: 1,
              userName: name
            });
          }}
        >
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptButtonGradient}
          >
            <FontAwesome5 name="check" size={16} color="#FFF" />
            <Text style={styles.acceptButtonText}>Chấp nhận</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const dummyRequests = [
    {
      name: 'Nguyễn Xuân Đức',
      age: '21',
      gender: 'Nữ',
      occupation: 'Student',
      email: 'duccoagi@gmail.com',
      phone: '0909231234'
    },
    {
      name: 'Nguyễn Xuân Đen',
      age: '22',
      gender: 'Nữ',
      occupation: 'Student',
      email: 'ducden@gmail.com',
      phone: '0382123085'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Chi tiết bài đăng</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Post Details */}
        <View style={styles.postCard}>
          <View style={styles.userInfo}>
            <Image
              source={require('../assets/logoEasyRommie.png')}
              style={styles.userAvatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{postData.fullName}</Text>
              <View style={styles.userTags}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Hòa đồng</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Dễ tính</Text>
                </View>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>Món nào cũng biết nấu</Text>
                </View>
              </View>
            </View>
            <Text style={styles.postTime}>Today</Text>
          </View>

          <View style={styles.postDetails}>
            <View style={styles.detailRow}>
              <FontAwesome5 name="user" size={16} color="#6D5BA3" />
              <Text style={styles.detailText}>{postData.age} tuổi • {postData.gender}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="briefcase" size={16} color="#6D5BA3" />
              <Text style={styles.detailText}>{postData.occupation}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="building" size={16} color="#6D5BA3" />
              <Text style={styles.detailText}>{postData.school}</Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
              <Text style={styles.detailText}>{Number(postData.price).toLocaleString('vi-VN')}đ/tháng</Text>
            </View>
          </View>

          <Text style={styles.description}>{postData.description}</Text>
        </View>

        {/* Requests List */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Yêu cầu ở ghép</Text>
          {dummyRequests.map((request, index) => (
            <View key={index}>
              {renderRequestItem(request)}
            </View>
          ))}
        </View>
      </ScrollView>

      <ProfileModal 
        user={selectedUser}
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
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
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0EDF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#6D5BA3',
    fontSize: 12,
  },
  postTime: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  description: {
    color: '#1A1A1A',
    fontSize: 14,
    lineHeight: 20,
  },
  requestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  requestOccupation: {
    fontSize: 14,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chatButton: {
    backgroundColor: '#F0EDF6',
  },
  profileButton: {
    backgroundColor: '#E3F2FD',
  },
  chatText: {
    color: '#6D5BA3',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  requestDetails: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0EDF6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0EDF6',
  },
  acceptButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  acceptButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    width: '100%',
  },
  profileHeader: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  profileOccupation: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  onlineText: {
    color: '#FFF',
    fontSize: 14,
  },
  profileDetails: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EDF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileDetailText: {
    flex: 1,
    fontSize: 16,
    color: '#424242',
  },
  profileTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagIcon: {
    marginRight: 6,
  },
  profileTagTextNew: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  profileActions: {
    marginTop: 8,
    marginBottom: 24,
  },
  profileActionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RoommatePostDetail; 