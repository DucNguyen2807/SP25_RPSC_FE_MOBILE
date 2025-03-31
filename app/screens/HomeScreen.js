import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Dimensions, Animated, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const HomeScreen = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const navigation = useNavigation();

  const rooms = [
    {
      id: '1',
      owner: 'Nguyễn Xuân Đức',
      price: '2,000,000 VND',
      duration: '/tháng',
      location: 'Mạn Thiện, Thủ Đức',
      description: 'Phòng riêng-Có gác-Có bếp',
      postedTime: 'Today',
      capacity: 'Tối đa 3 người',
      image: require('../assets/logoEasyRommie.png'),
      amenities: ['Wifi', 'Máy lạnh', 'Tủ lạnh'],
      rating: 4.8,
      reviews: 12
    },
    {
      id: '2',
      description: 'Phòng siêu đẹp có Ban Công 205/41/34 Phạm Văn Chiêu, P.14, ...',
      owner: 'Nguyễn Xuân Đức',
      price: '2.9 triệu',
      duration: '/tháng',
      area: '20 m²',
      location: 'Gò Vấp, Hồ Chí Minh',
      capacity: 'Tối đa 3 người',
      postedTime: '35 phút trước',
      image: require('../assets/logoEasyRommie.png'),
    },
    {
      id: '3',
      title: 'PHÒNG ĐẸP NHƯ CĂN HỘ STUDIO Đủ Nội Thất CÓ GÁC LỬNG THÔN...',
      price: '4.2 triệu/tháng',
      area: '22 m²',
      location: 'Bình Thạnh, Hồ Chí Minh',
      time: '1 giờ trước',
      image: require('../assets/logoEasyRommie.png'),
    },
    {
      id: '4',
      title: 'Phòng Đẹp 68A Phan Đăng Lưu, P.5, Q.Phú Nhuận (có Thang Máy, Khoá...',
      price: '3 triệu/tháng',
      area: '20 m²',
      location: 'Phú Nhuận, Hồ Chí Minh',
      time: '1 giờ trước',
      image: require('../assets/logoEasyRommie.png'),
    },
  ];

  const handleMapPress = () => {
    navigation.navigate('Map', { rooms });
  };

  const handleRoomPress = (room) => {
    navigation.navigate('RoomDetail', { room });
  };

  const renderRoomCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleRoomPress(item)}
    >
      {/* Featured Label */}
      <View style={styles.featuredLabelContainer}>
        <LinearGradient
          colors={['#FF385C', '#E31C5F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.featuredLabel}
        >
          <Text style={styles.featuredLabelText}>Tin nổi bật</Text>
        </LinearGradient>
      </View>

      {/* Room Image */}
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.roomImage} />
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
            <Text style={styles.userName}>{item.owner}</Text>
            <View style={styles.ratingContainer}>
              <FontAwesome5 name="star" size={12} color="#FFB800" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviews}>({item.reviews} đánh giá)</Text>
            </View>
          </View>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.postedTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.price}>
            {item.price}
            <Text style={styles.duration}>{item.duration}</Text>
          </Text>
          <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
          
          <View style={styles.locationContainer}>
            <FontAwesome5 name="map-marker-alt" size={14} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>

          <View style={styles.amenitiesContainer}>
            {item.amenities?.map((amenity, index) => (
              <View key={index} style={styles.amenityBadge}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <View style={styles.capacityContainer}>
            <FontAwesome5 name="users" size={14} color="#666" />
            <Text style={styles.capacity}>{item.capacity}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
              placeholder="Bạn muốn tìm kiếm nơi đâu?"
              placeholderTextColor="#999"
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
          <TouchableOpacity style={[styles.filterOption, styles.priceFilterButton]}>
            <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Giá</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="home" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Loại phòng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="map-marked-alt" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Khu vực</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={handleMapPress}
          >
            <FontAwesome5 name="map" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Bản đồ</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Room List */}
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
});

export default HomeScreen;
