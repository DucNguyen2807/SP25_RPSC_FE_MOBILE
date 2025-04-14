import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator
  , Dimensions, Animated, TextInput, Modal
  , TouchableWithoutFeedback } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import postService from '../services/postService';
import roommateService from '../services/roommateService';  // Import roommateService
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const RoommateDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { postId } = route.params;

  const [loading, setLoading] = useState(true);
  const [postDetail, setPostDetail] = useState(null);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [message, setMessage] = useState('');  // State for message
  const [showInput, setShowInput] = useState(false);  // State to show/hide input
  const [modalVisible, setModalVisible] = useState(false);  // State to control Modal visibility

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
        } else {
          setError('Failed to load post details: ' + response.message);
        }
      } catch (err) {
        setError(`Error fetching: ${err.message}`);
        console.error('Detailed error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [postId]);

  const handleRequestShare = async () => {
    if (postDetail && postDetail.roomInfo) {
      const { postId, title } = postDetail;
      const requestMessage = message || `Hi, I am interested in sharing the room titled "${title}".`;
  
      console.log('Message to send:', requestMessage);  // Log message to console
      console.log('Calling sendRoomSharingRequest with postId:', postId, 'and message:', requestMessage);  // Log before calling service
  
      // Gọi hàm gửi yêu cầu chia sẻ phòng
      const response = await roommateService.sendRoomSharingRequest(postId, requestMessage);
  
      console.log('Response from sendRoomSharingRequest:', response); // Log response from API
  
      if (response.isSuccess) {
        console.log('Request sent successfully!');
        alert('Room sharing request sent successfully!');
      } else {
        console.log('Failed to send request:', response.message);
        alert('Failed to send request: ' + response.message);
      }
    }
  };
  

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Finding your perfect match...</Text>
      </View>
    );
  }

  const handleContactClick = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      if (!currentUserId) {
        console.log('User ID not found');
        return;
      }
  
      const { fullName, avatar, userId } = postOwnerInfo;
  
      navigation.navigate('Chat', {
        userName: fullName, 
        avatar: avatar,  
        userId: userId, 
        myId: currentUserId,  
      });
    } catch (error) {
      console.log('Error in fetching user ID:', error);
    }
  };
  

  if (error || !postDetail) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="error-outline" size={60} color="#F87171" />
        <Text style={styles.errorText}>{error || 'No data found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Go Back</Text>
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
      WiFi: 'wifi',
      'Air Conditioning': 'snowflake',
      'Washing Machine': 'tshirt',
      Kitchen: 'utensils',
      TV: 'tv',
      Parking: 'parking',
      Balcony: 'glass-whiskey',
      'Private Bathroom': 'bath',
      // Add more mappings as needed
    };

    const iconName = amenityIcons[amenity] || 'check-circle';
    return <FontAwesome5 name={iconName} size={16} color="#6366F1" />;
  };

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
            <Text style={styles.priceSubtext}>/month</Text>
          </View>
        </View>

        {/* Animated content container */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Profile Section */}
          <View style={styles.profileCard}>
            <View style={styles.profile}>
              <Image source={{ uri: postOwnerInfo?.avatar }} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{postOwnerInfo?.fullName || 'No name'}</Text>
                <View style={styles.profileBadge}>
                  <FontAwesome5 name="user-check" size={12} color="#6366F1" />
                  <Text style={styles.profileBadgeText}>Verified Host</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.messageButton} onPress={handleContactClick}>
                  <MaterialIcons name="chat" size={20} color="#FFF" />
                </TouchableOpacity>

            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetail}>
                <FontAwesome5 name="birthday-cake" size={14} color="#6366F1" />
                <Text style={styles.profileDetailText}>{postOwnerInfo?.age || '-'} years</Text>
              </View>
              <View style={styles.profileDetail}>
                <FontAwesome5 name="venus-mars" size={14} color="#6366F1" />
                <Text style={styles.profileDetailText}>{postOwnerInfo?.gender || '-'}</Text>
              </View>
              <View style={styles.profileDetail}>
                <FontAwesome5 name="heart" size={14} color="#6366F1" />
                <Text style={styles.profileDetailText}>{postOwnerInfo?.lifeStyle || '-'}</Text>
              </View>
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
              Posted: {new Date(createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Room Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="home" size={16} color="#6366F1" /> Room Details
            </Text>

            <Text style={styles.roomTitle}>{roomInfo?.title}</Text>
            <View style={styles.roomTypeContainer}>
              <Text style={styles.roomType}>{roomInfo?.roomTypeName}</Text>
            </View>

            <Text style={styles.roomDesc}>{roomInfo?.description}</Text>

            <View style={styles.roomStats}>
              <View style={styles.roomStat}>
                <FontAwesome5 name="door-open" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Room No.</Text>
                <Text style={styles.roomStatValue}>{roomInfo?.roomNumber}</Text>
              </View>

              <View style={styles.roomStat}>
                <FontAwesome5 name="ruler-combined" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Area</Text>
                <Text style={styles.roomStatValue}>{roomInfo?.square} m²</Text>
              </View>

              <View style={styles.roomStat}>
                <FontAwesome5 name="calendar-check" size={16} color="#6366F1" />
                <Text style={styles.roomStatLabel}>Available</Text>
                <Text style={styles.roomStatValue}>Now</Text>
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <FontAwesome5 name="concierge-bell" size={16} color="#6366F1" /> Amenities
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
              <FontAwesome5 name="hand-holding-heart" size={16} color="#6366F1" /> Services
            </Text>

            {(roomInfo?.services || []).map((service) => (
  <View key={service.serviceId} style={styles.serviceItem}>
    <View style={styles.serviceHeader}>
      <Text style={styles.serviceName}>{service.serviceName}</Text>
      <Text style={styles.servicePrice}>
  {(service.price !== null && service.price !== undefined ? service.price : 0).toLocaleString()}đ/{service.description === 'month' ? 'mo' : service.description}
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
          onPress={handleContactClick} // Gọi hàm khi bấm nút
        >
          <FontAwesome5 name="phone-alt" size={16} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.contactButtonText}>Contact Roommate</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={[styles.requestShareButton, { flex: 1 }]}
          onPress={() => setModalVisible(true)}  // Show Modal when clicked
        >
          <FontAwesome5 name="user-friends" size={16} color="#4F46E5" style={{ marginRight: 8 }} />
          <Text style={styles.requestShareButtonText}>Request to Share</Text>
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
        <Text style={styles.modalTitle}>Send Request</Text>
        <TouchableOpacity 
          onPress={() => setModalVisible(false)}
          style={styles.modalCloseButton}
        >
          <MaterialIcons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.modalContent}>
        <Text style={styles.modalLabel}>Message to Roommate</Text>
        <TextInput
          style={styles.modalInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Hi, I'd like to share this room with you..."
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={4}
        />
        
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            onPress={() => setModalVisible(false)}
            style={styles.modalCancelButton}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              handleRequestShare();
              setModalVisible(false);
            }}
            style={styles.modalSendButton}
          >
            <Text style={styles.modalSendText}>Send Request</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  header: { 
    height: 280, 
    position: 'relative' 
  },
  headerImage: { 
    width, 
    height: 280,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    zIndex: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  gradientOverlay: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { 
    position: 'absolute', 
    top: 40, 
    left: 20, 
    zIndex: 10,
  },
  shareButton: { 
    position: 'absolute', 
    top: 40, 
    right: 20, 
    zIndex: 10,
  },
  blurView: {
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
  },
  priceTag: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  priceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  priceSubtext: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 2,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profile: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    borderWidth: 3, 
    borderColor: '#FFF' 
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  profileBadgeText: {
    fontSize: 12,
    color: '#6366F1',
    marginLeft: 4,
    fontWeight: '500',
  },
  messageButton: {
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  profileDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileDetailText: {
    marginLeft: 6,
    color: '#4B5563',
    fontSize: 14,
  },
  section: { 
    padding: 20, 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16,
    marginTop: 16, 
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold',
    color: '#1F2937',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  location: { 
    marginLeft: 6,
    color: '#4B5563', 
    fontSize: 14,
  },
  description: { 
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  date: { 
    fontSize: 12, 
    color: '#9CA3AF', 
    marginTop: 12,
    fontStyle: 'italic',
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 16,
    color: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomTitle: { 
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1F2937',
  },
  roomTypeContainer: {
    backgroundColor: '#EEF2FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  roomType: { 
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '500',
  },
  roomDesc: { 
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
    marginTop: 8,
  },
  roomStat: {
    alignItems: 'center',
  },
  roomStatLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 6,
  },
  roomStatValue: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 8,
  },
  amenityText: {
    marginLeft: 8,
    color: '#4B5563',
    fontSize: 14,
  },
  serviceItem: { 
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10, 
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceName: { 
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 15,
  },
  serviceDesc: { 
    color: '#6B7280',
    marginTop: 4, 
    fontSize: 13,
  },
  servicePrice: { 
    color: '#6366F1', 
    fontWeight: '600',
    fontSize: 15,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12, 
  },

  centeredContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: { 
    marginTop: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  errorText: { 
    color: '#F87171', 
    marginTop: 10,
    textAlign: 'center',
    padding: 20,
  },
  retryButton: { 
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6366F1', 
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: { 
    color: '#FFF',
    fontWeight: '600', 
  },
  requestShareButton: {
    backgroundColor: '#E0E7FF', 
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  requestShareButtonText: {
    color: '#4F46E5', // tím đậm
    fontWeight: '600',
    fontSize: 16,
  },
  contactButton: {
    backgroundColor: '#E0E7FF', 
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 12,
  },
  contactButtonText: {
    color: '#4F46E5', // tím đậm
    fontWeight: '600',
    fontSize: 16,
  },
  // Add these styles to your StyleSheet

// Modal styles
modalBackground: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '85%',
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 10,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#F3F4F6',
},
modalTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1F2937',
},
modalCloseButton: {
  padding: 4,
},
modalContent: {
  padding: 20,
},
modalLabel: {
  fontSize: 14,
  fontWeight: '500',
  color: '#4B5563',
  marginBottom: 8,
},
modalInput: {
  backgroundColor: '#F9FAFB',
  borderRadius: 12,
  padding: 12,
  fontSize: 16,
  color: '#1F2937',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  minHeight: 100,
  textAlignVertical: 'top',
},
modalFooter: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 20,
  gap: 12,
},
modalCancelButton: {
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#E5E7EB',
  backgroundColor: '#FFFFFF',
},
modalCancelText: {
  color: '#4B5563',
  fontWeight: '500',
  fontSize: 16,
},
modalSendButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderRadius: 10,
  backgroundColor: '#6366F1',
  justifyContent: 'center',
},
modalSendText: {
  color: '#FFFFFF',
  fontWeight: '600',
  fontSize: 16,
},
});

export default RoommateDetailScreen;
