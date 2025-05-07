import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView, TouchableOpacity,
  TouchableWithoutFeedback, Keyboard, Dimensions, StatusBar, ActivityIndicator, 
  Modal, TextInput, Alert, FlatList, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import roomService from '../services/roomService';
import { colors } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const RoomDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);
  const [rentRequest, setRentRequest] = useState({
    message: '',
    monthWantRent: '',
    dateWantToRent: new Date(Date.now()).toISOString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFeedbackIndex, setActiveFeedbackIndex] = useState(0);
  
  useEffect(() => {
    fetchRoomDetails();
    fetchFeedback();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const result = await roomService.getRoomById(roomId);
      
      if (result.isSuccess) {
        setRoom(result.data);
      } else {
        setError(result.message || 'Failed to fetch room details');
      }
    } catch (err) {
      setError('Failed to load room details');
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      setFeedbackLoading(true);
      const result = await roomService.getFeedbackByRoomId(roomId);
      
      if (result.isSuccess) {
        setFeedback(result.data);
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContactClick = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      if (!currentUserId) {
        console.log('Không tìm thấy ID người dùng');
        return;
      }
      
      // Navigate to Chat screen with required params
      navigation.navigate('Chat', {
        userName: room.landlord?.landlordName || 'Landlord', 
        avatar: { uri: room.roomImages?.[0] || 'https://via.placeholder.com/40' },  
        userId: room.landlord?.userId, 
        myId: currentUserId,  
      });
    } catch (error) {
      console.log('Lỗi khi lấy ID người dùng:', error);
      Alert.alert(
        'Error',
        'Could not open chat. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRentRequest = async () => {
    try {
      // Validate input
      if (!rentRequest.message.trim()) {
        setSubmitError('Please enter a message');
        return;
      }
      if (!rentRequest.monthWantRent || isNaN(parseInt(rentRequest.monthWantRent))) {
        setSubmitError('Please enter a valid number of months');
        return;
      }
      if (!rentRequest.dateWantToRent) {
        setSubmitError('Please select a move-in date');
        return;
      }

      // Validate date is in the future
      const selectedDate = new Date(rentRequest.dateWantToRent);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        setSubmitError('Move-in date must be in the future');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Format date to match API requirement
      const formattedDate = new Date(rentRequest.dateWantToRent);
      formattedDate.setHours(2, 7, 28, 795); // Set to match API format
      const isoDate = formattedDate.toISOString();

      const response = await fetch(`${API_BASE_URL}/customerrequestrent/room-rent-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: roomId,
          message: rentRequest.message,
          monthWantRent: parseInt(rentRequest.monthWantRent),
          dateWantToRent: isoDate
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send rent request');
      }

      if (data.isSuccess) {
        setSubmitSuccess(true);
        setShowRentModal(false);
        // Reset form
        setRentRequest({
          message: '',
          monthWantRent: '',
          dateWantToRent: new Date(Date.now()).toISOString()
        });
        // Show success message
        Alert.alert(
          'Success',
          'Your rent request has been sent successfully!',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(data.message || 'Failed to send rent request');
      }
    } catch (err) {
      console.error('Error submitting rent request:', err);
      setSubmitError(err.message);
      Alert.alert(
        'Error',
        err.message || 'Failed to send rent request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VNĐ";
  };

  const renderImageItem = ({ item, index }) => {
    return (
      <View style={styles.imageSlide}>
        <Image 
          source={{ uri: item || 'https://via.placeholder.com/400x300' }} 
          style={styles.roomImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  // Updated renderFeedbackItem for horizontal scrolling
  const renderFeedbackItem = ({ item }) => {
    return (
      <View style={styles.feedbackItemHorizontal}>
        <View style={styles.feedbackHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatarSmall}>
              <FontAwesome5 name="user" size={14} color="#6D5BA3" />
            </View>
            <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          </View>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome5 
                key={star}
                name="star" 
                size={14} 
                color={star <= item.rating ? '#FFD700' : '#E0E0E0'} 
                style={styles.starIcon}
              />
            ))}
          </View>
        </View>
        
        <Text style={styles.ratingDate}>
          {new Date(item.createdDate).toLocaleDateString()}
        </Text>
        
        <Text style={styles.feedbackText}>{item.description}</Text>
        
        {item.imageUrls && item.imageUrls.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.feedbackImages}>
            {item.imageUrls.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.feedbackImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveImageIndex(viewableItems[0].index);
    }
  };

  const onViewableFeedbackItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveFeedbackIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D5BA3" />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) {
    return null;
  }

  // Updated renderRentModal function to improve form accessibility and date selection
  const renderRentModal = () => (
    <Modal
      visible={showRentModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowRentModal(false)}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Yêu cầu thuê phòng</Text>
                <TouchableOpacity onPress={() => setShowRentModal(false)}>
                  <FontAwesome5 name="times" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.formScrollContainer}>
                <View style={styles.formContainer}>
                  <Text style={styles.formLabel}>Tin nhắn</Text>
                  <TextInput
                    style={styles.formInput}
                    value={rentRequest.message}
                    onChangeText={(text) => setRentRequest(prev => ({ ...prev, message: text }))}
                    placeholder="Nhập tin nhắn của bạn"
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.formLabel}>Số tháng muốn thuê</Text>
                  <TextInput
                    style={styles.formInput}
                    value={rentRequest.monthWantRent}
                    onChangeText={(text) => setRentRequest(prev => ({ ...prev, monthWantRent: text }))}
                    placeholder="Nhập số tháng"
                    keyboardType="numeric"
                  />

                  <Text style={styles.formLabel}>Ngày muốn dọn vào</Text>
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => {
                      setShowDatePicker(true);
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {rentRequest.dateWantToRent ? new Date(rentRequest.dateWantToRent).toLocaleDateString() : 'Chọn ngày'}
                    </Text>
                    <FontAwesome5 name="calendar-alt" size={16} color="#6D5BA3" />
                  </TouchableOpacity>

                  {showDatePicker && (
                    <DateTimePicker
                      value={new Date(rentRequest.dateWantToRent)}
                      mode="date"
                      display="default"
                      minimumDate={new Date(Date.now())}
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          selectedDate.setHours(2, 7, 28, 795);
                          setRentRequest(prev => ({ ...prev, dateWantToRent: selectedDate.toISOString() }));
                        }
                      }}
                    />
                  )}

                  {submitError && (
                    <Text style={styles.errorText}>{submitError}</Text>
                  )}

                  <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleRentRequest}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        <FlatList
          data={room.roomImages}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        
        {/* Image Indicators */}
        <View style={styles.imageIndicators}>
          {room.roomImages.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.indicator, 
                index === activeImageIndex ? styles.activeIndicator : {}
              ]} 
            />
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Info Card */}
        <View style={styles.infoContainer}>
          {/* Owner Info */}
          <View style={styles.ownerInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: room.roomImages[0] || 'https://via.placeholder.com/100x100' }} 
                style={styles.ownerAvatar} 
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>{room.landlord?.landlordName || 'Landlord'}</Text>
              <View style={styles.verifiedBadge}>
                <FontAwesome5 name="check-circle" size={14} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusBadge}
            >
              <Text style={styles.statusText}>{room.status}</Text>
            </LinearGradient>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Giá thuê</Text>
            <Text style={styles.priceValue}>
              {formatPrice(room.roomPrices?.[0]?.price)}<Text style={styles.duration}>/tháng</Text>
            </Text>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.sectionTitle}>{room.title || 'Mô tả'}</Text>
            </View>
            
            <Text style={styles.descriptionText}>
              {room.description || 'No description available'}
            </Text>
          </View>

          {/* Room Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Địa chỉ</Text>
                <Text style={styles.detailValue}>
                  {room.roomType.address.houseNumber} {room.roomType.address.street}, 
                  {room.roomType.address.district}, {room.roomType.address.city}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="home" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Kiểu phòng</Text>
                <Text style={styles.detailValue}>{room.roomType?.roomTypeName || 'Standard Room'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="users" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Số người ở tối đa</Text>
                <Text style={styles.detailValue}>{room.roomType?.maxOccupancy || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="expand-arrows-alt" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Diện tích</Text>
                <Text style={styles.detailValue}>{room.roomType?.area || 'N/A'} m²</Text>
              </View>
            </View>
          </View>

          {/* Amenities Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Tiện ích</Text>
            <View style={styles.amenitiesGrid}>
              {room.roomAmenities?.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <LinearGradient
                    colors={['#6D5BA3', '#8873BE']}
                    style={styles.amenityIcon}
                  >
                    <FontAwesome5 name="check" size={12} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.amenityText}>{amenity.name}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Dịch vụ</Text>
            {room.roomServices?.map((service, index) => (
              <View key={index} style={styles.servicesCard}>
                <View style={styles.serviceRow}>
                  <View style={styles.serviceInfo}>
                    <FontAwesome5 
                      name={service.roomServiceName.toLowerCase().includes('wifi') ? 'wifi' : 'concierge-bell'} 
                      size={16} 
                      color="#6D5BA3" 
                    />
                    <Text style={styles.serviceLabel}>{service.roomServiceName}</Text>
                  </View>
                  <Text style={styles.servicePrice}>
                    {formatPrice(service.prices?.[0]?.price)} / tháng
                  </Text>
                </View>
                <View style={styles.serviceDescription}>
                  <Text style={styles.serviceNote}>{service.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Feedback Section - MODIFIED TO HORIZONTAL SCROLLING */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Đánh giá phòng</Text>
            
            {feedbackLoading ? (
              <View style={styles.feedbackLoading}>
                <ActivityIndicator size="small" color="#6D5BA3" />
                <Text style={styles.loadingText}>Loading feedback...</Text>
              </View>
            ) : feedback && feedback.length > 0 ? (
              <View>
                <FlatList
                  data={feedback}
                  renderItem={renderFeedbackItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  pagingEnabled
                  snapToInterval={width - 40} // Account for container padding
                  decelerationRate="fast"
                  contentContainerStyle={styles.feedbackListHorizontal}
                  onViewableItemsChanged={onViewableFeedbackItemsChanged}
                  viewabilityConfig={viewabilityConfig}
                />
                
                {/* Feedback indicators */}
                {feedback.length > 1 && (
                  <View style={styles.feedbackIndicators}>
                    {feedback.map((_, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.feedbackIndicator, 
                          index === activeFeedbackIndex ? styles.activeFeedbackIndicator : {}
                        ]} 
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.noFeedbackContainer}>
                <FontAwesome5 name="comment-slash" size={32} color="#AAA" />
                <Text style={styles.noFeedbackText}>Phòng này chưa có feedback</Text>
              </View>
            )}
          </View>

          {/* Additional Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thông tin thêm</Text>
            <View style={styles.additionalInfoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bắt đầu vào ở</Text>
                <Text style={styles.infoValue}>
                  {room.availableDateToRent ? new Date(room.availableDateToRent).toLocaleDateString() : 'Ngay bây giờ'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Công ty</Text>
                <Text style={styles.infoValue}>{room.landlord?.companyName || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cập nhật</Text>
                <Text style={styles.infoValue}>
                  {room.updatedAt ? new Date(room.updatedAt).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={handleContactClick}
        >
          <LinearGradient
            colors={[colors.primaryLight || '#E6F4F1', colors.primaryLight || '#E6F4F1']}
            style={[styles.messageGradient, { borderColor: colors.primary }]}
          >
            <FontAwesome5 name="comment-alt" size={16} color={colors.primary} />
            <Text style={[styles.messageButtonText, { color: colors.primary }]}>Nhắn tin</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.rentButton}
          onPress={() => setShowRentModal(true)}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rentGradient}
          >
            <FontAwesome5 name="key" size={16} color="#FFF" />
            <Text style={styles.rentButtonText}>Thuê phòng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {renderRentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#6D5BA3' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#F8F9FA' },
  errorText: { marginTop: 16, marginBottom: 24, fontSize: 16, color: '#666', textAlign: 'center' },
  retryButton: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#6D5BA3', borderRadius: 12 },
  retryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  imageContainer: { width: width, height: width * 0.75, position: 'relative' },
  imageSlide: { width: width, height: width * 0.75 },
  roomImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  backButton: { position: 'absolute', top: 44, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)' },
  imageIndicators: { position: 'absolute', bottom: 20, flexDirection: 'row', justifyContent: 'center', width: '100%' },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeIndicator: { width: 24, backgroundColor: '#FFF' },
  content: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, backgroundColor: '#F8F9FA' },
  infoContainer: { padding: 20 },
  ownerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginRight: 12 },
  ownerAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FFF' },
  onlineIndicator: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFF' },
  ownerDetails: { flex: 1 },
  ownerName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center' },
  verifiedText: { fontSize: 12, color: '#4CAF50', marginLeft: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: '500' },
  priceSection: { marginBottom: 24 },
  priceLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  priceValue: { fontSize: 24, fontWeight: 'bold', color: '#6D5BA3' },
  duration: { fontSize: 16, color: '#666', fontWeight: 'normal' },
  descriptionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  descriptionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  descriptionText: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 16 },
  detailsCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  detailIcon: { width: 32, height: 32, backgroundColor: 'rgba(109, 91, 163, 0.1)', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  sectionContainer: { marginBottom: 24 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 16 },
  amenityIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  amenityText: { fontSize: 14, color: '#333' },
  servicesCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  serviceLabel: { fontSize: 14, color: '#333', fontWeight: '500', marginLeft: 8 },
  servicePrice: { fontSize: 14, color: '#6D5BA3', fontWeight: '600' },
  serviceDescription: { marginTop: 4 },
  serviceNote: { fontSize: 12, color: '#666' },
  
  // Additional styles for the feedback section
  feedbackLoading: { alignItems: 'center', padding: 16 },
  noFeedbackContainer: { alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16 },
  noFeedbackText: { marginTop: 12, fontSize: 14, color: '#666', textAlign: 'center' },
  feedbackListHorizontal: { paddingRight: 20 },
  feedbackItemHorizontal: { width: width - 40, padding: 16, backgroundColor: '#FFF', borderRadius: 16, marginRight: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(109, 91, 163, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  reviewerName: { fontSize: 14, fontWeight: '500', color: '#333' },
  ratingContainer: { flexDirection: 'row' },
  starIcon: { marginHorizontal: 1 },
  ratingDate: { fontSize: 12, color: '#999', marginBottom: 8 },
  feedbackText: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8 },
  feedbackImages: { flexDirection: 'row', marginTop: 8 },
  feedbackImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
  feedbackIndicators: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  feedbackIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(109, 91, 163, 0.3)', marginHorizontal: 4 },
  activeFeedbackIndicator: { width: 24, backgroundColor: '#6D5BA3' },
  
  // Additional Info styles
  additionalInfoCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  
  // Bottom button styles
  bottomButtons: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EFEFEF' },
  messageButton: { flex: 1, marginRight: 8 },
  messageGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#6D5BA3' },
  messageButtonText: { marginLeft: 8, fontSize: 16, color: '#6D5BA3', fontWeight: '600' },
  rentButton: { flex: 2 },
  rentGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12 },
  rentButtonText: { marginLeft: 8, fontSize: 16, color: '#FFF', fontWeight: '600' },
  
  // Modal styles
  keyboardAvoidingView: { flex: 1 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: height * 0.9 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  formScrollContainer: { maxHeight: height * 0.7 },
  formContainer: { marginBottom: 20 },
  formLabel: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 16 },
  formInput: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#E0E0E0' },
  datePickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  datePickerButtonText: { fontSize: 16, color: '#333' },
  dateHint: { fontSize: 12, color: '#999', marginTop: 4 },
  submitButton: { backgroundColor: '#6D5BA3', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 24 },
  submitButtonDisabled: { backgroundColor: '#AAA' },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});


    export default RoomDetailScreen; 