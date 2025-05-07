import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import roomService from '../services/roomService';
import postService from '../services/postService';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RentedScreen = ({ navigation }) => {
  const [rentedRoom, setRentedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingPost, setExistingPost] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [customerType, setCustomerType] = useState(null);

  // Enhanced fetchData function with improved error handling
  const fetchData = useCallback(async () => {
    try {
      // Fetch room stay data
      const roomResult = await roomService.getRoomStayByCustomerId();
      if (roomResult.isSuccess) {
        const roomData = roomResult.data.roomStay;
        
        // Store the customer type
        setCustomerType(roomData.roomStayCustomerType);
        
        setRentedRoom({
          landlordId : roomData.landlordId,
          userId : roomData.userId,
          landlordName: roomData.landlordName,
          landlordAvatar: roomData.landlordAvatar || null,
          statusOfMaxRoom: roomData.statusOfMaxRoom,
          price: roomData.room.price,
          imageUrl: roomData.room.roomCusImages[0]?.imageUrl,
          status: roomData.room.status,
          address: roomData.room.location || 'District 2, Ho Chi Minh City',
          roomId: roomData.room.roomId,
          title: roomData.room.title,
          maxOccupancy: roomData.room.maxOccupancy,
          roomTypeName: roomData.room.roomTypeName,
        });
        
        // Only fetch post data if the customer is a Tenant
        if (roomData.roomStayCustomerType === 'Tenant') {
          const postResult = await postService.getPostRoommateByCustomerId();
          if (postResult.isSuccess && postResult.data) {
            setExistingPost(postResult.data);
          } else {
            setExistingPost(null);
          }
        }
      } else {
        // Handle case where room fetch was not successful
        setRentedRoom(null);
        console.warn('Failed to fetch room data:', roomResult.message || 'Unknown error');
      }
    } catch (error) {
      //console.error('Error fetching data:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing indicator
    }
  }, []);

  // Enhanced onRefresh function with wait time to show refresh animation
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Make sure the refresh spinner shows for at least a moment to give user feedback
    setTimeout(() => {
      fetchData();
    }, 500); // Short delay to ensure refresh spinner is visible
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Function to handle contact button click and navigate to Chat
  const handleContactClick = async () => {
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      if (!currentUserId) {
        console.log('Không tìm thấy ID người dùng');
        return;
      }
      
      // Navigate to Chat screen with required params
      navigation.navigate('Chat', {
        userName: rentedRoom.landlordName, 
        avatar: { uri: rentedRoom.landlordAvatar || 'https://via.placeholder.com/40' },  
        userId: rentedRoom.userId, 
        myId: currentUserId,  
      });
    } catch (error) {
      console.log('Lỗi khi lấy ID người dùng:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Renting':
        return '#FF9800';
      case 'Active':
        return '#4CAF50';
      case 'Pending':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Renting':
        return 'Đang thuê';
      case 'Active':
        return 'Hoạt động';
      case 'Pending':
        return 'Đang chờ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#ACDCD0" />
        <LinearGradient
          colors={['#ACDCD0', '#ACDCD0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Phòng đã thuê</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeNumber}>2</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ACDCD0" />
          <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
        </View>
      </View>
    );
  }

  if (!rentedRoom) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#ACDCD0" />
        <LinearGradient
          colors={['#ACDCD0', '#ACDCD0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Phòng đã thuê</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeNumber}>2</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
        
        <ScrollView 
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#ACDCD0']}
              tintColor={'#ACDCD0'}
              progressBackgroundColor="#FFF"
            />
          }
        >
          <Ionicons name="home-outline" size={80} color="#ACDCD0" />
          <Text style={styles.emptyStateText}>Bạn chưa thuê phòng nào</Text>
          <TouchableOpacity
            style={styles.browseRoomsButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Room' })}
          >
            <Text style={styles.browseRoomsText}>Tìm phòng ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const formattedPrice = rentedRoom.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const statusColor = getStatusColor(rentedRoom.status);
  const statusText = getStatusText(rentedRoom.status);

  // Calculate suggested price
  const suggestedPrice = rentedRoom.price / rentedRoom.maxOccupancy;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#ACDCD0" />
      
      <LinearGradient
        colors={['#ACDCD0', '#ACDCD0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Phòng đã thuê</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="#FFF" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeNumber}>2</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ACDCD0']}
            tintColor={'#ACDCD0'}
            progressBackgroundColor="#FFF"
            progressViewOffset={20} // Adds some offset to make the spinner more visible
            size="large" // Make spinner bigger for better visibility
          />
        }
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(rentedRoom.status) + '20' }]}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          <Text style={styles.statusBannerText}>
            Trạng thái phòng: <Text style={[styles.statusBannerValue, { color: statusColor }]}>{statusText}</Text>
          </Text>
        </View>
        
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RoomStayDetail')}
        >
          {/* Room Card */}
          <View style={styles.roomCard}>
            <View style={styles.roomImageContainer}>
              {rentedRoom.imageUrl ? (
                <Image 
                  source={{ uri: rentedRoom.imageUrl }} 
                  style={styles.roomImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.roomImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={50} color="#DDD" />
                </View>
              )}
              
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                style={styles.imageOverlay}
              >
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{formattedPrice}</Text>
                  <Text style={styles.priceUnit}>/tháng</Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.roomInfo}>
              {/* Room Title */}
              <Text style={styles.roomTitle}>{rentedRoom.title || rentedRoom.roomTypeName}</Text>
              
              <View style={styles.addressRow}>
                <MaterialIcons name="location-on" size={18} color="#ACDCD0" />
                <Text style={styles.address} numberOfLines={2}>{rentedRoom.address}</Text>
              </View>

              {/* Status */}
              <View style={styles.statusRow}>
                <View style={styles.statusIconContainer}>
                  <Ionicons 
                    name={
                      rentedRoom.status === 'Active' ? 'checkmark-circle' : 
                      rentedRoom.status === 'Renting' ? 'time' : 'alert-circle'
                    } 
                    size={22} 
                    color={statusColor} 
                  />
                </View>
                <View style={styles.statusTextContainer}>
                  <Text style={styles.statusLabel}>Trạng thái</Text>
                  <Text style={[styles.statusValue, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>

              {/* Customer Type Badge */}
              <View style={styles.customerTypeBadge}>
                <Text style={styles.customerTypeText}>
                  {customerType === 'Tenant' ? 'Người thuê chính' : 'Người ở ghép'}
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Landlord Info */}
              <View style={styles.landlordContainer}>
                {rentedRoom.landlordAvatar ? (
                  <Image
                    source={{ uri: rentedRoom.landlordAvatar }}
                    style={styles.landlordAvatarImage}
                  />
                ) : (
                  <View style={styles.landlordAvatarContainer}>
                    <Text style={styles.landlordAvatar}>{rentedRoom.landlordName.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.landlordDetails}>
                  <Text style={styles.landlordName}>{rentedRoom.landlordName}</Text>
                  <Text style={styles.landlordTitle}>Chủ trọ</Text>
                </View>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={handleContactClick}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Only show Create New Post Button if customer type is Tenant and no existing post */}
        {customerType === 'Tenant' && !existingPost && rentedRoom?.statusOfMaxRoom === 'NotEnough' && (
          <TouchableOpacity 
            onPress={() => {
              navigation.navigate('CreateRoommatePost', { 
                roomId: rentedRoom?.roomId,
                suggestedPrice: suggestedPrice // Pass the calculated suggested price
              });
            }}
            activeOpacity={0.8}  
          >
            <LinearGradient
              colors={['#ACDCD0', '#ACDCD0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.createButton}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFF" style={styles.createButtonIcon} />
              <Text style={styles.createButtonText}>Tạo bài đăng tìm người ở ghép</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {/* Only show Existing Post Information if customer type is Tenant and post exists */}
        {customerType === 'Tenant' && existingPost && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('RoommatePostDetail', { postId: existingPost.postId })}
            activeOpacity={0.8}
            style={styles.existingPostContainer}
          >
            <View style={styles.existingPostHeader}>
              <Ionicons name="document-text" size={18} color="#ACDCD0" />
              <Text style={styles.existingPostTitle}>Bài đăng tìm người ở ghép của bạn</Text>
            </View>
            <View style={styles.existingPostContent}>
              <Text style={styles.existingPostName} numberOfLines={1}>{existingPost.title}</Text>
              <Text style={styles.existingPostDescription} numberOfLines={2}>{existingPost.description}</Text>
              <View style={styles.existingPostFooter}>
                <View style={styles.existingPostPrice}>
                <Text style={styles.existingPostPriceValue}>
  {typeof existingPost?.price === 'number'
    ? existingPost.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    : 'Đang cập nhật'}
</Text>

                </View>
                <View style={[styles.existingPostStatus, { backgroundColor: getStatusColor(existingPost.status) + '20' }]}>
                  <Text style={[styles.existingPostStatusText, { color: getStatusColor(existingPost.status) }]}>
                    {getStatusText(existingPost.status)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Helpful Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Mẹo hữu ích</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScrollContent}
          >
            <TouchableOpacity 
              style={styles.tipCard}
              onPress={() => navigation.navigate('SaveResource')}
            >
              <View style={[styles.tipIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.tipTitle}>Tiết kiệm điện nước</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tipCard}
              onPress={() => navigation.navigate('HarmoniousLiving')}
            >
              <View style={[styles.tipIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="people-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.tipTitle}>Sống chung hòa thuận</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.tipCard}
              onPress={() => navigation.navigate('SecuritySafety')}
            >
              <View style={[styles.tipIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.tipTitle}>An ninh và an toàn</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
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
    marginTop: 12,
    fontSize: 16,
    color: '#ACDCD0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 12, // Adjusted for iOS status bar
    paddingBottom: 12,
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusBannerText: {
    fontSize: 14,
    color: '#333',
  },
  statusBannerValue: {
    fontWeight: 'bold',
  },
  roomCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  roomImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 4,
    marginBottom: 2,
  },
  roomInfo: {
    padding: 16,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  address: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginLeft: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ACDCD020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  customerTypeText: {
    color: '#ACDCD0',
    fontWeight: '600',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  landlordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landlordAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ACDCD0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  landlordAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  landlordAvatar: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  landlordDetails: {
    flex: 1,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  landlordTitle: {
    fontSize: 12,
    color: '#666',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ACDCD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipsScrollContent: {
    paddingRight: 16,
  },
  tipCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  browseRoomsButton: {
    backgroundColor: '#ACDCD0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseRoomsText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  // Styles for existing post display
  existingPostContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  existingPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  existingPostTitle: {
    fontSize: 14,
    color: '#ACDCD0',
    fontWeight: '500',
    marginLeft: 8,
  },
  existingPostContent: {
    paddingLeft: 4,
  },
  existingPostName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  existingPostDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  existingPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  existingPostPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingPostPriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ACDCD0',
  },
  existingPostStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  existingPostStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RentedScreen;