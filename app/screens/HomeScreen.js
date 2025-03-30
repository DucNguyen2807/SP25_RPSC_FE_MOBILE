import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

  const renderRoomCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image
          source={require('../assets/logoEasyRommie.png')}
          style={styles.avatar}
        />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.owner}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.postedTime}</Text>
            </View>
            {item.capacity && (
              <View style={[styles.badge, styles.capacityBadge]}>
                <Text style={styles.badgeText}>{item.capacity}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <Image source={item.image} style={styles.roomImage} />

      <View style={styles.roomInfo}>
        <Text style={styles.price}>
          {item.price} <Text style={styles.duration}>{item.duration}</Text>
        </Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Bạn muốn tìm kiếm nơi đâu?"
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <FontAwesome name="bell-o" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <View style={styles.filterContainer}>
        <View style={styles.basicFilters}>
          <View style={[styles.filterOption, styles.priceFilterButton]}>
            <Text style={styles.filterOptionText}>VNĐ/Tháng</Text>
            <View style={styles.priceFilterContent}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <Text style={styles.priceDivider}>|</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.filterOption, { marginHorizontal: 8 }]}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.filterOptionText}>
              {isExpanded ? '- Less' : '+ More'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterOption}
            onPress={handleMapPress}
          >
            <MaterialIcons name="location-on" size={20} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Map</Text>
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.expandedFilters}>
            <View style={styles.filterRow}>
              <TouchableOpacity style={styles.filterOption}>
                <Feather name="home" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Type</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#6D5BA3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterOption}>
                <MaterialIcons name="room-service" size={20} color="#6D5BA3" />
                <Text style={styles.filterOptionText}>Amenities</Text>
                <MaterialIcons name="keyboard-arrow-down" size={20} color="#6D5BA3" />
              </TouchableOpacity>
            </View>
            <View style={styles.filterRow}>
            </View>
          </View>
        )}
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoomCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'none',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d9d5d3',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
    height: '100%',
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  basicFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  filterOptionText: {
    color: '#6D5BA3',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  priceFilterButton: {
    flex: 0,
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  priceFilterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceInput: {
    fontSize: 14,
    color: '#6D5BA3',
    width: 50,
    padding: 2,
    textAlign: 'center',
  },
  priceDivider: {
    color: '#6D5BA3',
    marginHorizontal: 4,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  capacityBadge: {
    backgroundColor: '#E3F2FD',
  },
  badgeText: {
    fontSize: 12,
    color: '#333',
  },
  verifiedBadge: {
    marginLeft: 8,
  },
  premiumBadge: {
    marginLeft: 8,
  },
  roomImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  roomInfo: {
    paddingHorizontal: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  duration: {
    fontSize: 16,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#6D5BA3',
    paddingTop: 2,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#6D5BA3',
  },
  expandedFilters: {
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});

export default HomeScreen;
