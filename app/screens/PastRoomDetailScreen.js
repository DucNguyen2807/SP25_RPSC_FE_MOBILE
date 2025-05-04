import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  StatusBar, 
  ActivityIndicator, 
  Modal, 
  TextInput, 
  Alert,
  FlatList 
} from 'react-native';
import { FontAwesome5, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import roomService from '../services/roomService';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, borderRadius } from '../theme/theme';

const { width } = Dimensions.get('window');

const PastRoomDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params || {};
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    description: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!roomId) {
      console.error('No roomId provided in navigation params');
      setError('Room ID is required');
      return;
    }
    console.log('Fetching details for room ID:', roomId);
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching room details for ID:', roomId);
      const result = await roomService.getRoomById(roomId);
      
      if (result.isSuccess && result.data) {
        setRoom(result.data);
      } else {
        throw new Error(result.message || 'Room not found');
      }
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError(err.message || 'Failed to load room details');
      setRoom(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFeedback(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0]]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!feedback.description.trim()) {
        Alert.alert('Error', 'Please enter your feedback');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('Description', feedback.description);
      formData.append('Rating', feedback.rating.toString());
      formData.append('RentalRoomId', roomId);

      feedback.images.forEach((image, index) => {
        const imageUri = image.uri;
        const imageName = imageUri.split('/').pop();
        const imageType = 'image/jpeg';

        formData.append('Images', {
          uri: imageUri,
          name: imageName,
          type: imageType,
        });
      });

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/feedback/create-feedbackroom`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.isSuccess) {
        Alert.alert('Success', 'Your feedback has been submitted successfully!');
        setShowFeedbackModal(false);
        setFeedback({
          rating: 5,
          description: '',
          images: [],
        });
      } else {
        throw new Error(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Alert.alert('Error', err.message || 'Failed to submit feedback');
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

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveImageIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D5BA3" />
        <Text style={styles.loadingText}>Loading room details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF6B6B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) {
    return null;
  }

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đánh giá phòng</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {room && (
              <View style={styles.selectedRoomInfo}>
                <Image
                  source={{ uri: room.roomImages?.[0] }}
                  style={styles.modalRoomImage}
                />
                <Text style={styles.modalRoomTitle}>{room.title}</Text>
              </View>
            )}

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Đánh giá</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  >
                    <FontAwesome
                      name={star <= feedback.rating ? 'star' : 'star-o'}
                      size={30}
                      color={star <= feedback.rating ? '#FFD700' : colors.text.secondary}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nhận xét</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Nhập nhận xét của bạn..."
                value={feedback.description}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View style={styles.imagesContainer}>
              <Text style={styles.imagesLabel}>Hình ảnh</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                {feedback.images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setFeedback(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                    >
                      <MaterialIcons name="close" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                  <MaterialIcons name="add-photo-alternate" size={24} color={colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
              <Text style={styles.statusText}>Past Room</Text>
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
          {/* <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.sectionTitle}>{room.title || 'Mô tả'}</Text>
            </View>
            
            <Text style={styles.descriptionText}>
              {room.description || 'No description available'}
            </Text>
          </View> */}

          {/* Room Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="map-marker-alt" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
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
            <Text style={styles.sectionTitle}>Amenities</Text>
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

          {/* Additional Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
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

      {/* Bottom Button */}
      <View style={styles.bottomButton}>
        <TouchableOpacity 
          style={styles.feedbackButton}
          onPress={() => setShowFeedbackModal(true)}
        >
          <LinearGradient
            colors={['#6D5BA3', '#8873BE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.feedbackGradient}
          >
            <FontAwesome5 name="star" size={16} color="#FFF" />
            <Text style={styles.feedbackButtonText}>Feedback</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {renderFeedbackModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6D5BA3',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#6D5BA3',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    position: 'relative',
  },
  imageSlide: {
    width: width,
    height: width * 0.75,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 44,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    backgroundColor: '#F8F9FA',
  },
  infoContainer: {
    padding: 20,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  ownerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D5BA3',
  },
  duration: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  descriptionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0EDF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -6,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amenityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  servicesCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  servicePrice: {
    fontSize: 14,
    color: '#6D5BA3',
    fontWeight: '600',
  },
  serviceDescription: {
    backgroundColor: '#F0EDF6',
    borderRadius: 12,
    padding: 12,
  },
  serviceNote: {
    fontSize: 14,
    color: '#666',
  },
  additionalInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bottomButton: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  feedbackButton: {
    width: '100%',
  },
  feedbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  feedbackButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  selectedRoomInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalRoomImage: {
    width: 120,
    height: 80,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  modalRoomTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  ratingContainer: {
    marginBottom: spacing.lg,
  },
  ratingLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    marginBottom: spacing.lg,
  },
  imagesLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  imagesList: {
    flexDirection: 'row',
  },
  imagePreviewContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.body1,
    fontWeight: '600',
  },
});

export default PastRoomDetailScreen; 