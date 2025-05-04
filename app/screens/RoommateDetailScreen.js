import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator,
  Dimensions, Animated, TextInput, Modal, FlatList, 
  TouchableWithoutFeedback } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import postService from '../services/postService';
import roommateService from '../services/roommateService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const RoommateDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { postId } = route.params;

  const [loading, setLoading] = useState(true);
  const [postDetail, setPostDetail] = useState(null);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Standard animations instead of Reanimated
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const fetchPostDetail = async () => {
      setLoading(true);
      try {
        const response = await postService.getRoommatePostDetail(postId);
        if (response.isSuccess && response.data) {
          setPostDetail(response.data);
          setError(null);
          
          // Start fade-in animation when data loads
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
          
          // Fetch feedback for the post owner
          if (response.data.postOwnerInfo && response.data.postOwnerInfo.userId) {
            fetchUserFeedback(response.data.postOwnerInfo.userId);
          }
        } else {
          setError('Không thể tải chi tiết bài đăng: ' + response.message);
        }
      } catch (err) {
        setError(`Lỗi tải dữ liệu: ${err.message}`);
        console.error('Chi tiết lỗi:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostDetail();
  }, [postId]);

  const fetchUserFeedback = async (userId) => {
    console.log('Đang tải đánh giá cho người dùng:', userId);
    setFeedbackLoading(true);
    try {
      const feedbackResponse = await postService.getFeedbackByUserId(userId);
      if (feedbackResponse.isSuccess && feedbackResponse.data) {
        setFeedback(feedbackResponse.data);
      } else {
        console.log('Không thể tải đánh giá:', feedbackResponse.message);
      }
    } catch (err) {
      console.error('Lỗi khi tải đánh giá:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };
  

  const handleRequestShare = async () => {
    if (postDetail && postDetail.roomInfo) {
      const { postId, title } = postDetail;
      const requestMessage = message || `Xin chào, tôi quan tâm đến việc chia sẻ phòng có tiêu đề "${title}".`;
  
      console.log('Tin nhắn gửi:', requestMessage);
      console.log('Gọi sendRoomSharingRequest với postId:', postId, 'và tin nhắn:', requestMessage);
  
      const response = await roommateService.sendRoomSharingRequest(postId, requestMessage);
  
      console.log('Phản hồi từ sendRoomSharingRequest:', response);
  
      if (response.isSuccess) {
        console.log('Yêu cầu gửi thành công!');
        alert('Yêu cầu chia sẻ phòng đã được gửi thành công!');
      } else {
        console.log('Không thể gửi yêu cầu:', response.message);
        alert('Không thể gửi yêu cầu: ' + response.message);
      }
    }
  };
  
  const handleContactClick = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      if (!currentUserId) {
        console.log('Không tìm thấy ID người dùng');
        return;
      }
  
      const { fullName, avatar, userId } = postDetail.postOwnerInfo;
  
      navigation.navigate('Chat', {
        userName: fullName, 
        avatar: avatar,  
        userId: userId, 
        myId: currentUserId,  
      });
    } catch (error) {
      console.log('Lỗi khi lấy ID người dùng:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tìm kiếm kết quả phù hợp...</Text>
      </View>
    );
  }

  if (error || !postDetail) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F87171" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy dữ liệu'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { postOwnerInfo, roomInfo, title, description, location, createdAt } = postDetail;
  const roomImages = roomInfo?.roomImages && roomInfo.roomImages.length > 0
    ? roomInfo.roomImages
    : [require('../assets/logoEasyRommie.png')];

  const renderImageIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {roomImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              index === activeImageIndex && styles.activeIndicator,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderAmenityIcon = (amenity) => {
    const amenityIcons = {
      'WiFi': 'wifi',
      'Điều hòa': 'snowflake',
      'Máy giặt': 'tshirt',
      'Bếp': 'utensils',
      'TV': 'tv',
      'Bãi đỗ xe': 'parking',
      'Ban công': 'glass-whiskey',
      'Phòng tắm riêng': 'bath',
      // Thêm các biểu tượng khi cần
    };

    const iconName = amenityIcons[amenity] || 'check-circle';
    return <FontAwesome5 name={iconName} size={16} color="#6366F1" />;
  };

  // Hiển thị đánh giá sao
  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome5 
          key={i} 
          name="star" 
          size={14} 
          solid={i <= rating}
          color={i <= rating ? '#FFC107' : '#E5E7EB'} 
          style={{marginRight: 2}}
        />
      );
    }
    return stars;
  };

  // Hiển thị mục đánh giá
  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackItem}>
      <View style={styles.feedbackHeader}>
        <View style={styles.feedbackUser}>
          <View style={styles.reviewerAvatar}>
            <Text style={styles.reviewerInitial}>
              {item.reviewerName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
            <Text style={styles.feedbackDate}>
              {new Date(item.createdDate).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
      </View>
      
      <Text style={styles.feedbackDescription}>{item.description}</Text>
      
      {item.imageUrls && item.imageUrls.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.feedbackImagesContainer}
        >
          {item.imageUrls.map((url, idx) => (
            <Image 
              key={idx} 
              source={{uri: url}} 
              style={styles.feedbackImage} 
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Carousel */}
        <View style={styles.header}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {roomImages.map((image, index) => (
              <Image
                key={index}
                source={typeof image === 'string' ? { uri: image } : image}
                style={styles.headerImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {renderImageIndicator()}

          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.6)']}
            style={styles.gradientOverlay}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <BlurView intensity={90} tint="dark" style={styles.blurView}>
              <MaterialIcons name="arrow-back" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton}>
            <BlurView intensity={90} tint="dark" style={styles.blurView}>
              <MaterialIcons name="share" size={24} color="#FFF" />
            </BlurView>
          </TouchableOpacity>

          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {(postDetail.priceShare || (typeof roomInfo?.price === 'number' ? roomInfo.price : 0)).toLocaleString()}đ
            </Text>
            <Text style={styles.priceSubtext}>/tháng</Text>
          </View>
        </View>

        {/* Animated content container */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Section */}
          <View style={styles.profileCard}>
            <View style={styles.profile}>
              <Image source={{ uri: postOwnerInfo?.avatar }} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{postOwnerInfo?.fullName || 'Không có tên'}</Text>
                <View style={styles.profileBadge}>
                  <FontAwesome5 name="user-check" size={12} color="#6366F1" />
                  <Text style={styles.profileBadgeText}>Chủ nhà đã xác thực</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.messageButton} onPress={handleContactClick}>
                <MaterialIcons name="chat" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetail}>
                <FontAwesome5 name="birthday-cake" size={14} color="#6366F1" />
                <Text style={styles.profileDetailText}>{postOwnerInfo?.age || '-'} tuổi</Text>
              </View>
              <View style={styles.profileDetail}>
                <FontAwesome5 name="venus-mars" size={14} color="#6366F1" />
                <Text style={styles.profileDetailText}>{postOwnerInfo?.gender || '-'}</Text>
              </View>
            </View>
            <View style={[styles.profileDetail, { marginTop: 10 }]}>
              <FontAwesome5 name="heart" size={14} color="#6366F1" />
              <Text style={styles.profileDetailText}>{postOwnerInfo?.lifeStyle || '-'}</Text>
            </View>
            <View style={[styles.profileDetail, { marginTop: 10 }]}>
              <FontAwesome5 name="clipboard-list" size={14} color="#6366F1" />
              <Text style={styles.profileDetailText}>{postOwnerInfo?.requirement || '-'}</Text>
            </View>
          </View>

          {/* Title and Description */}
          <View style={styles.section}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.locationRow}>
              <FontAwesome5 name="map-marker-alt" size={16} color="#6366F1" />
              <Text style={styles.location}>{location}</Text>
            </View>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.date}>
              Đăng ngày: {new Date(createdAt).toLocaleDateString('vi-VN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Roommate Feedback Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="star" size={16} color="#6366F1" /> Đánh giá người ở chung
            </Text>
            
            {feedbackLoading ? (
              <ActivityIndicator size="small" color="#6366F1" style={{marginVertical: 20}} />
            ) : feedback && feedback.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={{marginTop: 10}}
              >
                {feedback.map((item, index) => (
                  <View key={index} style={styles.feedbackItemHorizontal}>
                    <View style={styles.feedbackHeader}>
                      <View style={styles.feedbackUser}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerInitial}>
                            {item.reviewerName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
                          <Text style={styles.feedbackDate}>
                            {new Date(item.createdDate).toLocaleDateString('vi-VN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ratingContainer}>
                        {renderRatingStars(item.rating)}
                      </View>
                    </View>
                    
                    <Text style={styles.feedbackDescription}>{item.description}</Text>
                    
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.feedbackImagesContainer}
                      >
                        {item.imageUrls.map((url, idx) => (
                          <Image 
                            key={idx} 
                            source={{uri: url}} 
                            style={styles.feedbackImage} 
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noFeedbackContainer}>
                <FontAwesome5 name="comment-slash" size={40} color="#D1D5DB" />
                <Text style={styles.noFeedbackText}>Chưa có đánh giá nào</Text>
              </View>
            )}
          </View>

          {/* Room Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="home" size={16} color="#6366F1" /> Chi tiết phòng
            </Text>

            <Text style={styles.roomTitle}>{roomInfo?.title}</Text>
            <View style={styles.roomTypeContainer}>
              <Text style={styles.roomType}>{roomInfo?.roomTypeName}</Text>
            </View>

            <Text style={styles.roomDesc}>{roomInfo?.description}</Text>

            <View style={styles.roomStats}>
              <View style={styles.roomStat}>
                <FontAwesome5 name="door-open" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Phòng số</Text>
                <Text style={styles.roomStatValue}>{roomInfo?.roomNumber}</Text>
              </View>

              <View style={styles.roomStat}>
                <FontAwesome5 name="ruler-combined" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Diện tích</Text>
                <Text style={styles.roomStatValue}>{roomInfo?.square} m²</Text>
              </View>

              <View style={styles.roomStat}>
                <FontAwesome5 name="calendar-check" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Hiện có</Text>
                <Text style={styles.roomStatValue}>Ngay bây giờ</Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="concierge-bell" size={16} color="#6366F1" /> Tiện nghi
            </Text>

            <View style={styles.amenitiesGrid}>
              {(roomInfo?.roomAmenities || []).map((amenity, idx) => (
                <View key={idx} style={styles.amenityItem}>
                  {renderAmenityIcon(amenity)}
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="hand-holding-heart" size={16} color="#6366F1" /> Dịch vụ
            </Text>

            {(roomInfo?.services || []).map((service) => (
              <View key={service.serviceId} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.serviceName}</Text>
                  <Text style={styles.servicePrice}>
                    {(service.price !== null && service.price !== undefined ? service.price : 0).toLocaleString()}đ
                  </Text>
                </View>
                <Text style={styles.serviceDesc}>{service.description}</Text>
              </View>
            ))}
          </View>

          {/* Bottom padding to ensure content isn't hidden behind footer */}
          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>

      {/* Contact Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.contactButton, { flex: 1 }]}
          onPress={handleContactClick}
        >
          <FontAwesome5 name="phone-alt" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.contactButtonText}>Liên hệ người ở chung</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.requestShareButton, { flex: 1 }]}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome5 name="user-friends" size={16} color="#4F46E5" style={{ marginRight: 8 }} />
          <Text style={styles.requestShareButtonText}>Yêu cầu chia sẻ</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for input */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gửi yêu cầu</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Tin nhắn gửi người ở chung</Text>
              <TextInput
                style={styles.modalInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Xin chào, tôi muốn chia sẻ phòng này với bạn..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={4}
              />
              
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.modalCancelButton}
                >
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => {
                    handleRequestShare();
                    setModalVisible(false);
                  }}
                  style={styles.modalSendButton}
                >
                  <Text style={styles.modalSendText}>Gửi yêu cầu</Text>
                  <MaterialIcons name="send" size={18} color="#FFFFFF" style={{marginLeft: 6}} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { height: 280, position: 'relative' },
  headerImage: { width, height: 280, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  indicatorContainer: { position: 'absolute', bottom: 20, flexDirection: 'row', alignSelf: 'center', zIndex: 10 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeIndicator: { backgroundColor: '#FFFFFF', width: 24 },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%', borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backButton: { position: 'absolute', top: 40, left: 20, zIndex: 10 },
  shareButton: { position: 'absolute', top: 40, right: 20, zIndex: 10 },
  blurView: { borderRadius: 20, padding: 10, overflow: 'hidden' },
  priceTag: { position: 'absolute', right: 20, bottom: 20, backgroundColor: 'rgba(99, 102, 241, 0.85)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  priceText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  priceSubtext: { color: '#FFFFFF', fontSize: 12, marginLeft: 2 },
  profileCard: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: -30, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  profile: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#FFF' },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  profileBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  profileBadgeText: { fontSize: 12, color: '#6366F1', marginLeft: 4, fontWeight: '500' },
  messageButton: { backgroundColor: '#6366F1', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  profileDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  profileDetail: { flexDirection: 'row', alignItems: 'center' },
  profileDetailText: { marginLeft: 6, color: '#4B5563', fontSize: 14 },
  section: { padding: 20, backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  location: { marginLeft: 6, color: '#4B5563', fontSize: 14 },
  description: { color: '#6B7280', lineHeight: 20, marginTop: 8 },
  date: { fontSize: 12, color: '#9CA3AF', marginTop: 12, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1F2937', flexDirection: 'row', alignItems: 'center' },
  roomTitle: { fontWeight: 'bold', fontSize: 16, color: '#1F2937' },
  roomTypeContainer: { backgroundColor: '#EEF2FF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, marginBottom: 12 },
  roomType: { color: '#6366F1', fontSize: 12, fontWeight: '500' },
  roomDesc: { color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  roomStats: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginTop: 8 },
  roomStat: { alignItems: 'center' },
  roomStatLabel: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  roomStatValue: { color: '#1F2937', fontWeight: '600', fontSize: 14, marginTop: 2 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenityItem: { flexDirection: 'row', alignItems: 'center', width: '50%', paddingVertical: 8 },
  amenityText: { marginLeft: 8, color: '#4B5563', fontSize: 14 },
  serviceItem: { backgroundColor: '#F9FAFB', padding: 14, borderRadius: 12, marginBottom: 10 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontWeight: 'bold', color: '#1F2937', fontSize: 15 },
  serviceDesc: { color: '#6B7280', marginTop: 4, fontSize: 13 },
  servicePrice: { color: '#6366F1', fontWeight: '600', fontSize: 15 },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderTopWidth: 1, 
    borderTopColor: '#F3F4F6', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8
  },
  contactButton: { 
    backgroundColor: '#6366F1', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: 8
  },
  contactButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600', 
    fontSize: 14 
  },
  requestShareButton: { 
    backgroundColor: '#EEF2FF', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE'
  },
  requestShareButtonText: { 
    color: '#4F46E5', 
    fontWeight: '600', 
    fontSize: 14 
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center'
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#F87171',
    textAlign: 'center'
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6366F1',
    borderRadius: 8
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937'
  },
  modalCloseButton: {
    padding: 4
  },
  modalContent: {
    padding: 16
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB'
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12
  },
  modalCancelText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },
  modalSendButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalSendText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  feedbackItemHorizontal: {
    width: 335,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginRight: 12
  },
  feedbackItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  feedbackUser: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  reviewerInitial: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  feedbackDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20
  },
  feedbackImagesContainer: {
    marginTop: 12
  },
  feedbackImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 8
  },
  noFeedbackContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 12
  },
  noFeedbackText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center'
  }
});
export default RoommateDetailScreen;