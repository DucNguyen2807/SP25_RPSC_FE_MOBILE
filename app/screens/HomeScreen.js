import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Dimensions, Animated, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const HomeScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    roomTypeName: '',
    district: '',
    amenityIds: []
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const navigation = useNavigation();
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  useEffect(() => {
    fetchRooms();
  }, [filters]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.roomTypeName) queryParams.append('roomTypeName', filters.roomTypeName);
      if (filters.district) queryParams.append('district', filters.district);
      filters.amenityIds.forEach(id => queryParams.append('amenityIds', id));

      const response = await fetch(`${API_BASE_URL}/room/rooms?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPress = (filterType) => {
    setActiveFilter(filterType);
    setShowFilterModal(true);
  };

  const handleFilterApply = (newFilter) => {
    setFilters(prev => ({
      ...prev,
      ...newFilter
    }));
    setShowFilterModal(false);
  };

  const handleMapPress = () => {
    const roomsWithCoordinates = rooms.map((room) => {
      // Kiểm tra xem room có đầy đủ thông tin cần thiết không
      if (!room.roomType || !room.roomType.address || 
          !room.roomType.address.lat || !room.roomType.address.long) {
        console.log('Room missing coordinates:', room.roomId);
        return null;
      }

      return {
        roomId: room.roomId,
        coordinate: {
          latitude: parseFloat(room.roomType.address.lat),
          longitude: parseFloat(room.roomType.address.long)
        },
        price: room.roomPrices[0]?.price || 0,
        roomImages: room.roomImages || [],
        description: room.description || '',
        location: `${room.roomType.address.houseNumber} ${room.roomType.address.street}, ${room.roomType.address.district}, ${room.roomType.address.city}`,
        owner: room.landlord?.landlordName || '',
        title: room.title || '',
        packageLabel: room.packageLabel || ''
      };
    }).filter(room => room !== null); // Lọc bỏ các phòng không có tọa độ

    console.log('Rooms with coordinates:', roomsWithCoordinates.length);
    
    navigation.navigate('Map', { rooms: roomsWithCoordinates });
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { room });
  };

  const getTimeDifference = (dateString) => {
    if (!dateString) return 'Today';
    
    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - updatedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const prefetchImages = async (imageUrls) => {
    try {
      await Promise.all(
        imageUrls.map(url => 
          Image.prefetch(url).catch(error => {
            console.log('Error prefetching image:', error);
            return false;
          })
        )
      );
    } catch (error) {
      console.log('Error in prefetchImages:', error);
    }
  };

  useEffect(() => {
    if (rooms.length > 0) {
      const imageUrls = rooms
        .filter(room => room.roomImages && room.roomImages.length > 0)
        .map(room => room.roomImages[0])
        .filter(url => url && url.startsWith('http'));
      
      if (imageUrls.length > 0) {
        prefetchImages(imageUrls);
      }
    }
  }, [rooms]);

  const handleImageError = (roomId) => {
    setImageLoadErrors(prev => ({
      ...prev,
      [roomId]: true
    }));
  };

  const renderRoomCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleRoomPress(item)}
    >
      {/* Featured Label */}
      {item.packageLabel && (
        <View style={styles.featuredLabelContainer}>
          <LinearGradient
            colors={['#FF385C', '#E31C5F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.featuredLabel}
          >
            <Text style={styles.featuredLabelText}>{item.packageLabel}</Text>
          </LinearGradient>
        </View>
      )}

      {/* Room Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={
            !imageLoadErrors[item.roomId] && 
            item.roomImages && 
            item.roomImages.length > 0 && 
            item.roomImages[0].startsWith('http')
              ? { 
                  uri: item.roomImages[0],
                  cache: 'force-cache'
                }
              : require('../assets/logoEasyRommie.png')
          } 
          style={styles.roomImage} 
          defaultSource={require('../assets/logoEasyRommie.png')}
          onError={() => handleImageError(item.roomId)}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <FontAwesome5 name="heart" size={16} color="#FF385C" />
        </TouchableOpacity>
      </View>

      {/* Room Info */}
      <View style={styles.roomContent}>
        <View style={styles.userInfo}>
          <Image
            source={require('../assets/logoEasyRommie.png')}
            style={styles.avatar}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.landlord.landlordName}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome5 name="star" size={12} color="#FFB800" />
              <Text style={styles.rating}>4.8</Text>
              <Text style={styles.reviews}>(12 đánh giá)</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['#FF385C', '#E31C5F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{getTimeDifference(item.updatedAt)}</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.price}>
            {item.roomPrices[0]?.price.toLocaleString()} VND
            <Text style={styles.duration}>/month</Text>
          </Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.locationContainer}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
            <Text style={styles.location}>
              {item.roomType.address.houseNumber} {item.roomType.address.street}, 
              {item.roomType.address.district}, {item.roomType.address.city}
            </Text>
          </View>

          <View style={styles.amenitiesContainer}>
            {item.roomAmenities.map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity.name}</Text>
              </View>
            ))}
          </View>

          <View style={styles.capacityContainer}>
            <FontAwesome5 name="users" size={14} color="#666" />
            <Text style={styles.capacity}>Max {item.roomType.maxOccupancy} people</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {activeFilter === 'price' && 'Filter by Price'}
              {activeFilter === 'roomType' && 'Room Type'}
              {activeFilter === 'district' && 'Area'}
              {activeFilter === 'amenities' && 'Amenities'}
            </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {activeFilter === 'price' && (
            <View style={styles.priceFilterContent}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Min Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Max Price</Text>
                <TextInput
                  style={styles.priceInput}
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          )}

          {activeFilter === 'roomType' && (
            <View style={styles.roomTypeContent}>
              {['Studio', 'Single Room', 'Double Room', 'Apartment'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.roomTypeOption,
                    filters.roomTypeName === type && styles.roomTypeOptionSelected
                  ]}
                  onPress={() => handleFilterApply({ roomTypeName: type })}
                >
                  <Text style={[
                    styles.roomTypeText,
                    filters.roomTypeName === type && styles.roomTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeFilter === 'district' && (
            <View style={styles.districtContent}>
              {[
                'District 1', 'District 2', 'District 3', 'District 4', 'District 5', 
                'District 6', 'District 7', 'District 8', 'District 9', 'District 10',
                'District 11', 'District 12', 'Binh Thanh', 'Binh Tan', 'Go Vap',
                'Phu Nhuan', 'Tan Binh', 'Tan Phu', 'Thu Duc', 'Binh Chanh',
                'Can Gio', 'Cu Chi', 'Hoc Mon', 'Nha Be'
              ].map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.districtOption,
                    filters.district === district && styles.districtOptionSelected
                  ]}
                  onPress={() => handleFilterApply({ district })}
                >
                  <Text style={[
                    styles.districtText,
                    filters.district === district && styles.districtTextSelected
                  ]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeFilter === 'amenities' && (
            <View style={styles.amenitiesContent}>
              {['WiFi', 'Cleaning Service', 'Air Conditioning', 'Parking'].map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.amenityOption,
                    filters.amenityIds.includes(amenity) && styles.amenityOptionSelected
                  ]}
                  onPress={() => {
                    const newAmenityIds = filters.amenityIds.includes(amenity)
                      ? filters.amenityIds.filter(id => id !== amenity)
                      : [...filters.amenityIds, amenity];
                    handleFilterApply({ amenityIds: newAmenityIds });
                  }}
                >
                  <Text style={[
                    styles.amenityText,
                    filters.amenityIds.includes(amenity) && styles.amenityTextSelected
                  ]}>
                    {amenity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setFilters({
                  minPrice: '',
                  maxPrice: '',
                  roomTypeName: '',
                  district: '',
                  amenityIds: []
                });
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={fetchRooms}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#6D5BA3', '#8873BE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.searchContainer}>
              <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Where do you want to search?"
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <FontAwesome5 name="bell" size={20} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity 
              style={[styles.filterOption, styles.priceFilterButton]}
              onPress={() => handleFilterPress('price')}
            >
              <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>Price</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => handleFilterPress('roomType')}
            >
              <FontAwesome5 name="home" size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>Room Type</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => handleFilterPress('district')}
            >
              <FontAwesome5 name="map-marked-alt" size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>Area</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => handleFilterPress('amenities')}
            >
              <FontAwesome5 name="wifi" size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>Amenities</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.filterOption}
              onPress={handleMapPress}
            >
              <FontAwesome5 name="map" size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>Map</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.noResultsContainer}>
          <MaterialIcons name="search-off" size={60} color="#6D5BA3" />
          <Text style={styles.noResultsText}>No rooms found</Text>
          <Text style={styles.noResultsSubText}>
            Try adjusting your search or filter criteria
          </Text>
          <TouchableOpacity 
            style={styles.resetFiltersButton}
            onPress={() => {
              setFilters({
                minPrice: '',
                maxPrice: '',
                roomTypeName: '',
                district: '',
                amenityIds: []
              });
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>

        {renderFilterModal()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#6D5BA3', '#8873BE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={16} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where do you want to search?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <FontAwesome5 name="bell" size={20} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterOption, styles.priceFilterButton]}
            onPress={() => handleFilterPress('price')}
          >
            <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Price</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={() => handleFilterPress('roomType')}
          >
            <FontAwesome5 name="home" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Room Type</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={() => handleFilterPress('district')}
          >
            <FontAwesome5 name="map-marked-alt" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Area</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={() => handleFilterPress('amenities')}
          >
            <FontAwesome5 name="wifi" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Amenities</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={handleMapPress}
          >
            <FontAwesome5 name="map" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Map</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Room List */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.roomId}
        renderItem={renderRoomCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchRooms}
        refreshing={loading}
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF385C',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterOptionText: {
    color: '#6D5BA3',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  featuredLabelContainer: {
    position: 'absolute',
    top: 16,
    left: 0,
    zIndex: 1,
  },
  featuredLabel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  featuredLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roomContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  roomInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'normal',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityBadge: {
    backgroundColor: '#F0EDF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    color: '#6D5BA3',
    fontSize: 12,
    fontWeight: '500',
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacity: {
    fontSize: 14,
    color: '#666',
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
    color: '#FF5252',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6D5BA3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#6D5BA3',
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  priceFilterContent: {
    padding: 10,
  },
  priceInputContainer: {
    marginBottom: 15,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  roomTypeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  roomTypeOption: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  roomTypeOptionSelected: {
    backgroundColor: '#6D5BA3',
  },
  roomTypeText: {
    color: '#666',
  },
  roomTypeTextSelected: {
    color: '#FFF',
  },
  districtContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  districtOption: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  districtOptionSelected: {
    backgroundColor: '#6D5BA3',
  },
  districtText: {
    color: '#666',
  },
  districtTextSelected: {
    color: '#FFF',
  },
  amenitiesContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  amenityOption: {
    padding: 10,
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  amenityOptionSelected: {
    backgroundColor: '#6D5BA3',
  },
  amenityTextSelected: {
    color: '#FFF',
  },
  badgeContainer: {
    marginLeft: 'auto',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  noResultsSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resetFiltersButton: {
    backgroundColor: '#6D5BA3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetFiltersButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
