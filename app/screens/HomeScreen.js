import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  Image, StyleSheet, Dimensions, ActivityIndicator, Modal 
} from 'react-native';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const [pageSize, setPageSize] = useState(20);
  
  // Add this to prevent multiple load more requests
  const [isLoadingMoreInProgress, setIsLoadingMoreInProgress] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(true);
  
  const navigation = useNavigation();
  const [imageLoadErrors, setImageLoadErrors] = useState({});

  const themeColors = {
    primary: '#ACDCD0',
    secondary: '#6D5BA3',
    accent: '#6D5BA3',
  };

  useEffect(() => {
    fetchRooms();
  }, [filters, currentPage]);

  const fetchRooms = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

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
      
      // Ensure we have unique roomIds by using a Map
      const processedRooms = data.rooms.map(room => ({
        ...room,
        // Generate a unique identifier if roomId is duplicated
        uniqueId: `${room.roomId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      if (loadMore) {
        setRooms(prev => [...prev, ...processedRooms]);
      } else {
        setRooms(processedRooms);
      }
      setTotalPosts(data.totalActivePosts);
      setTotalPages(Math.ceil(data.totalFilteredRooms / pageSize));
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching rooms:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsLoadingMoreInProgress(false);
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

  // Handle load more when reaching end of list - Fixed to prevent continuous loading
  const handleLoadMore = () => {
    // Additional check to prevent continuous loading when already at the last page
    if (currentPage >= totalPages || loadingMore || loading || isLoadingMoreInProgress) {
      return;
    }
    
    if (!onEndReachedCalledDuringMomentum.current) {
      setIsLoadingMoreInProgress(true);
      setCurrentPage(prev => prev + 1);
      onEndReachedCalledDuringMomentum.current = true;
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
    if (!dateString) return 'Hôm nay';
    
    const updatedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - updatedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return '1 ngày trước';
    return `${diffDays} ngày trước`;
  };

  const handleImageError = (roomId) => {
    setImageLoadErrors(prev => ({ ...prev, [roomId]: true }));
  };

  // Footer component for FlatList with loading indicator
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={themeColors.accent} />
        <Text style={styles.loadingMoreText}>Loading more...</Text>
      </View>
    );
  };

  // Pagination controls component
  const PaginationControls = () => {
    // Only show if we have more than one page
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <Text style={styles.paginationText}>
          {totalPosts > 0 ? `Showing ${Math.min((currentPage - 1) * pageSize + 1, totalPosts)}-${Math.min(currentPage * pageSize, totalPosts)} of ${totalPosts}` : 'No results'}
        </Text>
        <View style={styles.paginationControls}>
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
            onPress={() => {
              if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
              }
            }}
            disabled={currentPage === 1}
          >
            <MaterialCommunityIcons 
              name="chevron-left" 
              size={22} 
              color={currentPage === 1 ? '#CBD5E1' : themeColors.accent} 
            />
          </TouchableOpacity>
          
          <View style={styles.paginationPageIndicator}>
            <Text style={styles.paginationPageText}>{currentPage} / {totalPages}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
            onPress={() => {
              if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
              }
            }}
            disabled={currentPage === totalPages}
          >
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={22} 
              color={currentPage === totalPages ? '#CBD5E1' : themeColors.accent} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );
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
          Trang {currentPage} / {totalPages}
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
              {activeFilter === 'price' && 'Lọc theo giá'}
              {activeFilter === 'roomType' && 'Loại phòng'}
              {activeFilter === 'district' && 'Khu vực'}
              {activeFilter === 'amenities' && 'Tiện nghi'}
            </Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {activeFilter === 'price' && (
            <View style={styles.filterContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.filterLabel}>Giá tối thiểu</Text>
                <TextInput
                  style={styles.filterInput}
                  value={filters.minPrice}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, minPrice: text }))}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.filterLabel}>Giá tối đa</Text>
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
              {['Studio', 'Phòng đơn', 'Phòng đôi', 'Căn hộ'].map((type, index) => (
                <TouchableOpacity
                  key={`roomType-${index}`}
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
                'Quận 1', 'Quận 2', 'Quận 3', 'Bình Thạnh', 
                'Gò Vấp', 'Phú Nhuận', 'Thủ Đức'
              ].map((district, index) => (
                <TouchableOpacity
                  key={`district-${index}`}
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
              {['Wifi', 'Dịch vụ dọn phòng', 'Điều hòa', 'Chỗ đậu xe'].map((amenity, index) => (
                <TouchableOpacity
                  key={`amenity-${index}`}
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
              <Text style={styles.resetButtonText}>Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !loadingMore) {
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
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRooms(false)}>
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
              placeholder="Bạn muốn tìm kiếm ở đâu?"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { icon: 'money-bill-wave', text: 'Giá', filter: 'price' },
            { icon: 'home', text: 'Loại phòng', filter: 'roomType' },
            { icon: 'map-marked-alt', text: 'Khu vực', filter: 'district' },
            { icon: 'wifi', text: 'Tiện nghi', filter: 'amenities' },
            { icon: 'map', text: 'Bản đồ', filter: 'map' }
          ]}
          keyExtractor={(item, index) => `filter-${item.filter}-${index}`}
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
          <Text style={styles.noResultsText}>Không tìm thấy phòng</Text>
          <Text style={styles.noResultsSubText}>
            Hãy thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc
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
            <Text style={styles.resetFiltersButtonText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.uniqueId || `room-${item.roomId}-${Math.random().toString(36).substring(2, 9)}`}
          renderItem={renderRoomCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          onRefresh={() => fetchRooms(false)}
          refreshing={loading}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Pagination Controls - fixed at bottom */}
      {!loading && !error && rooms.length > 0 && (
        <View style={styles.paginationWrapper}>
          <PaginationControls />
        </View>
      )}

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#333',
  },
  notificationButton: {
    backgroundColor: '#6D5BA3',
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF385C',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  filterScroll: {
    paddingHorizontal: 15,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterOptionText: {
    marginLeft: 6,
    color: '#6D5BA3',
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 15,
    paddingBottom: 80, // Added extra padding for pagination control
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  featuredLabelContainer: {
    position: 'absolute',
    top: 12,
    left: 0,
    zIndex: 10,
  },
  featuredLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  featuredLabelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  roomContent: {
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  reviews: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  badgeContainer: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  roomInfo: {
    marginTop: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D5BA3',
    marginBottom: 6,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: 'normal',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 13,
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
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
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
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
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
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterContent: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  filterOptionsList: {
    marginBottom: 20,
  },
  filterOptionItem: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterOptionSelected: {
    backgroundColor: '#EEEAFF',
    borderColor: '#6D5BA3',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#4B5563',
  },
  filterOptionTextSelected: {
    color: '#6D5BA3',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#6D5BA3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingMoreContainer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  paginationWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 14,
    color: '#4B5563',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  paginationPageIndicator: {
    paddingHorizontal: 12,
  },
  paginationPageText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  }
});

export default HomeScreen;