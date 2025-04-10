import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import postService from '../services/postService';
import roommateService from '../services/roommateService';

const { width: screenWidth } = Dimensions.get('window');

const RoommatePostDetail = ({ route, navigation }) => {
  // Add null check for route.params and postData
  const { postId, postData } = route.params || {};
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [post, setPost] = useState(postData || null);
  const [loading, setLoading] = useState(true);
  const [roommateRequests, setRoommateRequests] = useState([]);
  const [requestLoading, setRequestLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);

  // Fetch post data if only postId is provided
  useEffect(() => {
    const fetchPostData = async () => {
      if (postId && !postData) {
        try {
          setLoading(true);
          const result = await postService.getPostRoommateByCustomerId();
          if (result.isSuccess) {
            // Format the data to match our component's expectations
            const fetchedPost = result.data;
            setPost({
              postId: fetchedPost.postId,
              title: fetchedPost.title,
              fullName: fetchedPost.customerName,
              email: fetchedPost.customerEmail,
              phoneNumber: fetchedPost.customerPhoneNumber,
              price: fetchedPost.price.toString(),
              description: fetchedPost.description,
              status: fetchedPost.status,
              createdAt: new Date(fetchedPost.createdAt).toLocaleDateString('vi-VN'),
            });
          } else {
            console.error('Failed to fetch post data:', result.message);
          }
        } catch (error) {
          console.error('Error fetching post data:', error);
        } finally {
          setLoading(false);
        }
      } else if (postData) {
        // If postData is provided directly, just use it
        setPost(postData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId, postData]);

  // Fetch roommate requests using roommateService
  // Fetch roommate requests using roommateService
const fetchRoommateRequests = async () => {
  try {
    setRequestLoading(true);
    const result = await roommateService.getAllRoommateRequests();
    
    if (result.isSuccess && result.data) {
      setRoommateRequests(result.data.requestSharingList || []);
    } else {
      console.error('Failed to fetch roommate requests:', result.message);
      // Set empty array as fallback
      setRoommateRequests([]);
    }
  } catch (error) {
    console.error('Error fetching roommate requests:', error);
    // Set empty array on error
    setRoommateRequests([]);
  } finally {
    setRequestLoading(false);
  }
};
  useEffect(() => {
    fetchRoommateRequests();
  }, []);

  // Handle accepting a roommate request
  // Handle accepting a roommate request
const handleAcceptRequest = async (requestId) => {
  try {
    setProcessingRequest(requestId);
    const result = await roommateService.acceptRoommateRequest(requestId);
    if (result.isSuccess) {
      Alert.alert(
        "Thành công",
        "Đã chấp nhận yêu cầu ở ghép thành công",
        [{ 
          text: "OK", 
          onPress: () => {
            // Navigate to RentedMain after successful acceptance
            navigation.navigate('RentedMain');
          } 
        }]
      );
    } else {
      Alert.alert("Lỗi", result.message || "Không thể chấp nhận yêu cầu");
    }
  } catch (error) {
    console.error('Error accepting request:', error);
    Alert.alert("Lỗi", "Đã xảy ra lỗi khi xử lý yêu cầu");
  } finally {
    setProcessingRequest(null);
  }
};

// Handle rejecting a roommate request
const handleRejectRequest = async (requestId) => {
  try {
    setProcessingRequest(requestId);
    const result = await roommateService.rejectRoommateRequest(requestId);
    if (result.isSuccess) {
      Alert.alert(
        "Thành công",
        "Đã từ chối yêu cầu ở ghép thành công",
        [{ 
          text: "OK", 
          onPress: () => {
            // Fetch roommate requests again after successful rejection
            fetchRoommateRequests();
          } 
        }]
      );
    } else {
      Alert.alert("Lỗi", result.message || "Không thể từ chối yêu cầu");
    }
  } catch (error) {
    console.error('Error rejecting request:', error);
    Alert.alert("Lỗi", "Đã xảy ra lỗi khi xử lý yêu cầu");
  } finally {
    setProcessingRequest(null);
  }
}; 

  // Helper function to calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

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
                source={user?.avatar ? { uri: user.avatar } : require('../assets/logoEasyRommie.png')}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.fullName}</Text>
                <Text style={styles.profileOccupation}>{user?.customerType}</Text>
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
                <Text style={styles.profileDetailText}>
                  {calculateAge(user?.dob)} tuổi • {user?.gender === 'Male' ? 'Nam' : 'Nữ'}
                </Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="briefcase" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.customerType || 'N/A'}</Text>
              </View>
            </View>

            {/* Tags Section Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Sở thích & Tính cách</Text>
              <View style={styles.profileTags}>
                {user?.preferences && (
                  <LinearGradient
                    colors={['#6D5BA3', '#8B75C5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.profileTag}
                  >
                    <FontAwesome5 name="smile" size={14} color="#FFF" style={styles.tagIcon} />
                    <Text style={styles.profileTagTextNew}>{user.preferences}</Text>
                  </LinearGradient>
                )}
                {user?.lifeStyle && (
                  <LinearGradient
                    colors={['#4CAF50', '#66BB6A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.profileTag}
                  >
                    <FontAwesome5 name="heart" size={14} color="#FFF" style={styles.tagIcon} />
                    <Text style={styles.profileTagTextNew}>{user.lifeStyle}</Text>
                  </LinearGradient>
                )}
                {user?.requirement && (
                  <LinearGradient
                    colors={['#1976D2', '#42A5F5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.profileTag}
                  >
                    <FontAwesome5 name="utensils" size={14} color="#FFF" style={styles.tagIcon} />
                    <Text style={styles.profileTagTextNew}>{user.requirement}</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {/* Contact Info Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Thông tin liên hệ</Text>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="envelope" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.email || 'N/A'}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="phone" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.phoneNumber || 'N/A'}</Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="map-marker-alt" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.address || 'N/A'}</Text>
              </View>
            </View>

            {/* Budget and Location Card */}
            <View style={styles.profileCard}>
              <Text style={styles.profileSectionTitle}>Tài chính & Vị trí</Text>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>
                  {user?.budgetRange ? Number(user.budgetRange).toLocaleString('vi-VN') + 'đ/tháng' : 'N/A'}
                </Text>
              </View>
              <View style={styles.profileDetailItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome5 name="location-arrow" size={16} color="#6D5BA3" />
                </View>
                <Text style={styles.profileDetailText}>{user?.preferredLocation || 'N/A'}</Text>
              </View>
            </View>

            {/* Message from user */}
            {user?.message && (
              <View style={styles.profileCard}>
                <Text style={styles.profileSectionTitle}>Lời nhắn</Text>
                <Text style={styles.messageText}>{user.message}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.profileActions}>
              <TouchableOpacity 
                style={styles.profileActionButton}
                onPress={() => {
                  onClose();
                  navigation.navigate('Chat', { userId: user?.userId });
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

  const renderRequestItem = (request) => (
    <View style={styles.requestCard}>
      <TouchableOpacity 
        style={styles.requestHeader}
        onPress={() => handleShowProfile(request)}
      >
        <Image
          source={request.avatar ? { uri: request.avatar } : require('../assets/logoEasyRommie.png')}
          style={styles.avatar}
        />
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>{request.fullName}</Text>
          <Text style={styles.requestOccupation}>{request.customerType}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.chatButton]}
            onPress={() => navigation.navigate('Chat', { userId: request.userId })}
          >
            <FontAwesome5 name="comment" size={16} color="#6D5BA3" />
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.profileButton]}
            onPress={() => handleShowProfile(request)}
          >
            <FontAwesome5 name="user" size={16} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      
      <View style={styles.requestDetails}>
        <View style={styles.detailItem}>
          <FontAwesome5 name="envelope" size={14} color="#666" />
          <Text style={styles.detailText}>{request.email}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="phone" size={14} color="#666" />
          <Text style={styles.detailText}>{request.phoneNumber}</Text>
        </View>
        <View style={styles.detailItem}>
          <FontAwesome5 name="info-circle" size={14} color="#666" />
          <Text style={styles.detailText}>{calculateAge(request.dob)} tuổi • {request.gender === 'Male' ? 'Nam' : 'Nữ'}</Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        {/* Two buttons side by side for Accept and Reject */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.acceptButton]}
            onPress={() => handleAcceptRequest(request.requestId)}
            disabled={processingRequest === request.requestId}
          >
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButtonGradient}
            >
              <FontAwesome5 name="check" size={16} color="#FFF" />
              <Text style={styles.acceptButtonText}>
                {processingRequest === request.requestId ? 'Đang xử lý...' : 'Chấp nhận'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, styles.rejectButton]}
            onPress={() => handleRejectRequest(request.requestId)}
            disabled={processingRequest === request.requestId}
          >
            <LinearGradient
              colors={['#F44336', '#E57373']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rejectButtonGradient}
            >
              <FontAwesome5 name="times" size={16} color="#FFF" />
              <Text style={styles.rejectButtonText}>
                {processingRequest === request.requestId ? 'Đang xử lý...' : 'Từ chối'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Show loading or placeholder if post data is not available yet
  if (loading) {
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error message if post data couldn't be loaded
  if (!post) {
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
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không thể tải dữ liệu bài đăng</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!postData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#00A67E', '#00A67E']}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin bài đăng</Text>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.userName}>{post.fullName || 'Không có tên'}</Text>
              
            </View>
            <Text style={styles.postTime}>{post.createdAt || 'Today'}</Text>
          </View>

          {post.title && (
            <Text style={styles.postTitle}>{post.title}</Text>
          )}

          <View style={styles.postDetails}>
            
            <View style={styles.detailRow}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
              <Text style={styles.detailText}>
                {post.price ? Number(post.price).toLocaleString('vi-VN') + 'đ/tháng' : 'N/A'}
              </Text>
            </View>
            {post.email && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="envelope" size={16} color="#6D5BA3" />
                <Text style={styles.detailText}>{post.email}</Text>
              </View>
            )}
            {post.phoneNumber && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="phone" size={16} color="#6D5BA3" />
                <Text style={styles.detailText}>{post.phoneNumber}</Text>
              </View>
            )}
            {post.status && (
              <View style={styles.detailRow}>
                <FontAwesome5 name="info-circle" size={16} color="#6D5BA3" />
                <Text style={styles.detailText}>Trạng thái: {post.status}</Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{post.description || 'Không có mô tả'}</Text>
        </View>

        {/* Requests List */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>Yêu cầu ở ghép</Text>
          {requestLoading ? (
            <View style={styles.requestLoadingContainer}>
              <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
            </View>
          ) : roommateRequests.length > 0 ? (
            roommateRequests.map((request, index) => (
              <View key={request.requestId || index}>
                {renderRequestItem(request)}
              </View>
            ))
          ) : (
            <View style={styles.noRequestsContainer}>
              <Text style={styles.noRequestsText}>Chưa có yêu cầu ở ghép nào</Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6D5BA3',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6D5BA3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
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
  postTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
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
  rejectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  rejectButtonText: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default RoommatePostDetail;