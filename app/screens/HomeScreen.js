import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  Image, StyleSheet, Dimensions, ActivityIndicator, Modal 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    roomTypeName: '',
    district: '',
    amenityIds: []
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  
  const navigation = useNavigation();
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  useEffect(() => {
    fetchRooms();
  }, [filters, currentPage]);

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
      
      queryParams.append('pageIndex', currentPage);
      queryParams.append('pageSize', pageSize);

      const response = await fetch(`${API_BASE_URL}/room/rooms?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      
      setRooms(data.rooms);
      setTotalPosts(data.totalActivePosts);
      setTotalPages(Math.ceil(data.totalFilteredRooms / pageSize));
      
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
    setCurrentPage(1);
    setShowFilterModal(false);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleMapPress = () => {
    const roomsWithCoordinates = rooms
      .filter(room => 
        room.roomType && 
        room.roomType.address && 
        room.roomType.address.lat && 
        room.roomType.address.long
      )
      .map(room => ({
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
      }));
    
    navigation.navigate('Map', { rooms: roomsWithCoordinates });
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { roomId: room.roomId });
  };

  const getTimeDifference = (dateString) => {
    if (!dateString) return 'Today';
    
    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - updatedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const handleImageError = (roomId) => {
    setImageLoadErrors(prev => ({ ...prev, [roomId]: true }));
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
              ? { uri: item.roomImages[0], cache: 'force-cache' }
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
            <Text style={styles.userName}>
              {item.landlord?.landlordName || 'Unknown Owner'}
            </Text>
            <View style={styles.ratingContainer}>
              <FontAwesome5 
                name="star" 
                size={12} 
                color={item.averageRating > 0 ? "#FFB800" : "#CCC"} 
              />
              <Text style={styles.rating}>
                {item.averageRating > 0 ? item.averageRating.toFixed(1) : 'No rating'}
              </Text>
              <Text style={styles.reviews}>
                {item.totalFeedbacks > 0 ? `(${item.totalFeedbacks} review${item.totalFeedbacks !== 1 ? 's' : ''})` : '(0 reviews)'}
              </Text>
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
            {item.roomPrices?.[0]?.price?.toLocaleString() || '0'} VND
            <Text style={styles.duration}>/month</Text>
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          
          <View style={styles.locationContainer}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
            <Text style={styles.location}>
              {item.roomType?.address?.district || ''}, {item.roomType?.address?.city || ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render pagination controls
  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity 
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        onPress={goToPrevPage}
        disabled={currentPage === 1}
      >
        <FontAwesome5 name="chevron-left" size={16} color={currentPage === 1 ? "#CCC" : "#6D5BA3"} />
      </TouchableOpacity>
      
      <View style={styles.paginationInfo}>
        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
        onPress={goToNextPage}
        disabled={currentPage === totalPages}
      >
        <FontAwesome5 name="chevron-right" size={16} color={currentPage === totalPages ? "#CCC" : "#6D5BA3"} />
      </TouchableOpacity>
    </View>
  );

  // Filter Modal
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
            <View style={styles.filterContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.filterLabel}>Min Price</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.filterLabel}>Max Price</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.maxPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, maxPrice: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          )}

          {activeFilter === 'roomType' && (
            <View style={styles.filterOptionsList}>
              {['Studio', 'Single Room', 'Double Room', 'Apartment'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOptionItem,
                    filters.roomTypeName === type && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterApply({ roomTypeName: type })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.roomTypeName === type && styles.filterOptionTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeFilter === 'district' && (
            <View style={styles.filterOptionsList}>
              {[
                'District 1', 'District 2', 'District 3', 'Binh Thanh', 
                'Go Vap', 'Phu Nhuan', 'Thu Duc'
              ].map((district) => (
                <TouchableOpacity
                  key={district}
                  style={[
                    styles.filterOptionItem,
                    filters.district === district && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterApply({ district })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.district === district && styles.filterOptionTextSelected
                  ]}>
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeFilter === 'amenities' && (
            <View style={styles.filterOptionsList}>
              {['WiFi', 'Cleaning Service', 'Air Conditioning', 'Parking'].map((amenity) => (
                <TouchableOpacity
                  key={amenity}
                  style={[
                    styles.filterOptionItem,
                    filters.amenityIds.includes(amenity) && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    const newAmenityIds = filters.amenityIds.includes(amenity)
                      ? filters.amenityIds.filter(id => id !== amenity)
                      : [...filters.amenityIds, amenity];
                    handleFilterApply({ amenityIds: newAmenityIds });
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.amenityIds.includes(amenity) && styles.filterOptionTextSelected
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
                setCurrentPage(1);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#ACDCD0', '#ACDCD0']}
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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { icon: 'money-bill-wave', text: 'Price', filter: 'price' },
            { icon: 'home', text: 'Room Type', filter: 'roomType' },
            { icon: 'map-marked-alt', text: 'Area', filter: 'district' },
            { icon: 'wifi', text: 'Amenities', filter: 'amenities' },
            { icon: 'map', text: 'Map', filter: 'map' }
          ]}
          keyExtractor={(item) => item.filter}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.filterOption}
              onPress={() => item.filter === 'map' ? handleMapPress() : handleFilterPress(item.filter)}
            >
              <FontAwesome5 name={item.icon} size={16} color="#6D5BA3" />
              <Text style={styles.filterOptionText}>{item.text}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterScroll}
        />
      </View>

      {rooms.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <FontAwesome5 name="search-minus" size={50} color="#6D5BA3" />
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
              setCurrentPage(1);
            }}
          >
            <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.roomId}
          renderItem={renderRoomCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onRefresh={fetchRooms}
          refreshing={loading}
          ListFooterComponent={renderPagination}
        />
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 40, paddingBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
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
    borderColor: '#FFF'
  },
  notificationBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  filterContainer: { paddingVertical: 12 },
  filterScroll: { paddingHorizontal: 16 },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  filterOptionText: { color: '#6D5BA3', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  
  // Cards
  listContainer: { padding: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden'
  },
  imageContainer: { position: 'relative', height: 180 },
  roomImage: { width: '100%', height: '100%' },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  featuredLabelContainer: { position: 'absolute', top: 12, left: 0, zIndex: 1 },
  featuredLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12
  },
  featuredLabelText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  roomContent: { padding: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  userDetails: { flex: 1 },
  userName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  rating: { fontSize: 12, color: '#333', fontWeight: '600', marginLeft: 4 },
  reviews: { fontSize: 11, color: '#666', marginLeft: 4 },
  badgeContainer: { marginLeft: 'auto' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  roomInfo: { marginTop: 4 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  duration: { fontSize: 13, color: '#666', fontWeight: 'normal' },
  description: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { fontSize: 13, color: '#666', marginLeft: 6, flex: 1 },
  
  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8
  },
  paginationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  paginationButtonDisabled: { backgroundColor: '#F8F8F8', shadowOpacity: 0, elevation: 0 },
  paginationInfo: { alignItems: 'center' },
  paginationText: { fontSize: 13, fontWeight: '600', color: '#333' },
  
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  filterContent: { marginBottom: 16 },
  inputContainer: { marginBottom: 12 },
  filterLabel: { fontSize: 14, color: '#333', marginBottom: 6 },
  filterInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14
  },
  filterOptionsList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  filterOptionItem: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8
  },
  filterOptionSelected: { backgroundColor: '#6D5BA3' },
  filterOptionText: { fontSize: 13, color: '#666' },
  filterOptionTextSelected: { color: '#FFF', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#6D5BA3',
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center'
  },
  resetButtonText: { color: '#6D5BA3', fontSize: 14, fontWeight: '600' },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#6D5BA3',
    borderRadius: 10,
    alignItems: 'center'
  },
  applyButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  
  // Empty states
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6D5BA3',
    borderRadius: 10,
    alignItems: 'center'
  },
  retryButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  noResultsText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  noResultsSubText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  resetFiltersButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6D5BA3',
    borderRadius: 10,
    alignItems: 'center'
  },
  resetFiltersButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' }
});

export default HomeScreen;