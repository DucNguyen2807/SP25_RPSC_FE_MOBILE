import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';

const { width } = Dimensions.get('window');

const RoomDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId } = route.params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/room/rooms/${roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch room details');
      }
      const data = await response.json();
      setRoom(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching room details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D5BA3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchRoomDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Image and Gradient Overlay */}
      <View style={styles.imageContainer}>
        <Image 
          source={
            !imageLoadError && 
            room?.roomImages && 
            room.roomImages.length > 0 && 
            room.roomImages[0].startsWith('http')
              ? { 
                  uri: room.roomImages[0],
                  cache: 'force-cache'
                }
              : require('../assets/logoEasyRommie.png')
          } 
          style={styles.roomImage} 
          defaultSource={require('../assets/logoEasyRommie.png')}
          onError={() => setImageLoadError(true)}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Info Card */}
        <View style={styles.infoContainer}>
          {/* Owner Info */}
          <View style={styles.ownerInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../assets/logoEasyRommie.png')} 
                style={styles.ownerAvatar} 
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>{room.landlord.landlordName}</Text>
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
              <Text style={styles.statusText}>{new Date(room.updatedAt).toLocaleDateString()}</Text>
            </LinearGradient>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Rent Price</Text>
            <Text style={styles.priceValue}>
              {room.roomPrices[0]?.price.toLocaleString()} VND
              <Text style={styles.duration}>/month</Text>
            </Text>
          </View>

          {/* Description Section */}
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.sectionTitle}>Description</Text>
            </View>
            <Text style={styles.descriptionText}>{room.description}</Text>
          </View>

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
                <Text style={styles.detailLabel}>Room Type</Text>
                <Text style={styles.detailValue}>{room.roomType.roomTypeName}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="users" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Max Occupancy</Text>
                <Text style={styles.detailValue}>{room.roomType.maxOccupancy} people</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <FontAwesome5 name="expand-arrows-alt" size={16} color="#6D5BA3" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Area</Text>
                <Text style={styles.detailValue}>{room.roomType.area} m²</Text>
              </View>
            </View>
          </View>

          {/* Amenities Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {room.roomAmenities.map((amenity, index) => (
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
            <Text style={styles.sectionTitle}>Services</Text>
            <View style={styles.servicesCard}>
              {room.roomServices.map((service, index) => (
                <View key={index}>
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <FontAwesome5 name="wifi" size={16} color="#6D5BA3" />
                      <Text style={styles.serviceLabel}>{service.roomServiceName}</Text>
                    </View>
                    {service.prices && service.prices.length > 0 && (
                      <Text style={styles.servicePrice}>
                        {service.prices[0].price.toLocaleString()} VND / month
                      </Text>
                    )}
                  </View>
                  <View style={styles.serviceDescription}>
                    <Text style={styles.serviceNote}>{service.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.additionalInfoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Available From</Text>
                <Text style={styles.infoValue}>
                  {new Date(room.availableDateToRent).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{room.status}</Text>
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
            <Text style={styles.messageButtonText}>Chat</Text>
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
            <Text style={styles.rentButtonText}>Rent Room</Text>
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
  imageContainer: {
    width: width,
    height: width * 0.75,
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  loadingContainer: {
    flex: 1,
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
    color: '#333',
    marginBottom: 20,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6D5BA3',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoomDetailScreen; 