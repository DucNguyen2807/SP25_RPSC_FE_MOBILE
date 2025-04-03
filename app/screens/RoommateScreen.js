import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import postService from '../services/postService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const RoommateScreen = () => {
  const navigation = useNavigation();
  const [roommates, setRoommates] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoommatePosts = async () => {
      setLoading(true);
      const searchRequest = {
        pageNumber: 1,
        pageSize: 10,
      };

      const result = await postService.getAllRoommatePosts(searchRequest);

      if (result.isSuccess && Array.isArray(result.posts.items)) {
        setRoommates(result.posts.items); // Set fetched posts to state if valid
      } else {
        setError(result.message || 'No posts available');
      }
      setLoading(false);
    };

    fetchRoommatePosts();
  }, []);

  const handleRoommatePress = (roommate) => {
    navigation.navigate('RoommateDetail', { roommate });
  };

  const renderRoommateCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleRoommatePress(item)}
    >
      <LinearGradient
        colors={['rgba(109, 91, 163, 0.05)', 'rgba(136, 115, 190, 0.1)']}
        style={styles.cardGradient}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: item.postOwnerInfo.avatar }} style={styles.avatar} />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.postOwnerInfo.fullName}</Text>
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={16} color="#4CAF50" />
                </View>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoBadge}>
                  <FontAwesome5 name="user" size={12} color="#666" />
                  <Text style={styles.infoText}>{item.postOwnerInfo.gender}</Text>
                </View>
                <View style={styles.infoBadge}>
                  <FontAwesome5 name="birthday-cake" size={12} color="#666" />
                  <Text style={styles.infoText}>{item.postOwnerInfo.age} tuổi</Text>
                </View>
              </View>
              <View style={styles.ratingContainer}>
                <FontAwesome5 name="star" size={12} color="#FFB800" solid />
                <Text style={styles.rating}>{item.postOwnerInfo.rating}</Text>
                <Text style={styles.reviews}>({item.postOwnerInfo.reviews} đánh giá)</Text>
              </View>
              <Text style={styles.occupation}>{item.postOwnerInfo.postOwnerType}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </View>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Text style={styles.status}>{item.status}</Text>
          </LinearGradient>
        </View>

        <View style={styles.traitsContainer}>
          <Text style={styles.traitsLabel}>Tiêu chí:</Text>
          <View style={styles.traits}>
            {item.traits && item.traits.length > 0 ? (
              item.traits.map((trait, index) => (
                <LinearGradient
                  key={index}
                  colors={['#6D5BA3', '#8873BE']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.traitBadge}
                >
                  <Text style={styles.traitText}>{trait}</Text>
                </LinearGradient>
              ))
            ) : (
              <Text>No traits available</Text>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.chatButton}>
          <LinearGradient
            colors={['#6D5BA3', '#8873BE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chatButtonGradient}
          >
            <FontAwesome5 name="comment-alt" size={16} color="#FFF" />
            <Text style={styles.chatButtonText}>Nhắn tin</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6D5BA3', '#8873BE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <FontAwesome5 name="search" size={16} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bạn cùng phòng..."
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

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="money-bill-wave" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Giá phòng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="venus-mars" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Giới tính</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="user-friends" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Độ tuổi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterOption}>
            <FontAwesome5 name="coffee" size={16} color="#6D5BA3" />
            <Text style={styles.filterOptionText}>Lối sống</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text>{error}</Text>
      ) : (
        <FlatList
          data={roommates}
          renderItem={renderRoommateCard}
          keyExtractor={item => item.postId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text>No roommates available</Text>} // Hiển thị khi không có dữ liệu
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: 44,
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchBar: {
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
  searchInput: {
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
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
  cardGradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
    padding: 4,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EDF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  occupation: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  status: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  traitsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  traitsLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '600',
  },
  traits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  traitText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  chatButton: {
    marginTop: 8,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  chatButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default RoommateScreen;
