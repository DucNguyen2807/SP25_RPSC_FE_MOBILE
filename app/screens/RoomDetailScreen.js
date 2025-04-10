import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import roomService from '../services/roomService';

const { width } = Dimensions.get('window');

const RoomDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params;
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true);
        const result = await roomService.getRoomById(roomId);
        
        if (result.isSuccess) {
          setRoom(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError('Failed to load room details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  const handleBack = () => {
    navigation.goBack();
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
                <Text style={styles.verifiedText}>Đã xác thực</Text>
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
                <Text style={styles.detailValue}>{room.location}</Text>
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
        <TouchableOpacity style={styles.messageButton}>
          <LinearGradient
            colors={['rgba(109, 91, 163, 0.1)', 'rgba(136, 115, 190, 0.1)']}
            style={styles.messageGradient}
          >
            <FontAwesome5 name="comment-alt" size={16} color="#6D5BA3" />
            <Text style={styles.messageButtonText}>Trò chuyện</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rentButton}>
          <LinearGradient
            colors={['#6D5BA3', '#8873BE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rentGradient}
          >
            <FontAwesome5 name="key" size={16} color="#FFF" />
            <Text style={styles.rentButtonText}>Thuê phòng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  bottomButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  messageButton: {
    flex: 1,
    marginRight: 8,
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6D5BA3',
  },
  messageButtonText: {
    color: '#6D5BA3',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rentButton: {
    flex: 1,
    marginLeft: 8,
  },
  rentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  rentButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RoomDetailScreen;