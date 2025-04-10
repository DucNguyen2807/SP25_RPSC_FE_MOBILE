import React, { useEffect, useState } from 'react';
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
  Linking,
  FlatList
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import roomService from '../services/roomService';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RoomStayDetail = () => {
  const [roomStay, setRoomStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const fetchRoomStayDetails = async () => {
      try {
        const result = await roomService.getRoomStayByCustomerId();
        if (result.isSuccess) {
          setRoomStay(result.data);
        }
      } catch (error) {
        console.error('Error fetching room stay details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStayDetails();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
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

  const openContractPDF = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.error("Cannot open URL: " + url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6D5BA3" />
        <ActivityIndicator size="large" color="#6D5BA3" />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </SafeAreaView>
    );
  }

  if (!roomStay) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#6D5BA3" />
        <LinearGradient
          colors={['#6D5BA3', '#8B75C5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết phòng</Text>
          <View style={styles.placeholder} />
        </LinearGradient>
        
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#6D5BA3" />
          <Text style={styles.emptyStateText}>Không tìm thấy thông tin phòng</Text>
          <TouchableOpacity
            style={styles.backToRentedButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToRentedText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { roomStay: roomStayData, customerContract } = roomStay;
  const { room } = roomStayData;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6D5BA3" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6D5BA3', '#8B75C5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết phòng</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Room Images Carousel */}
        <View style={styles.imageCarouselContainer}>
          {room.roomCusImages && room.roomCusImages.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const contentOffset = event.nativeEvent.contentOffset.x;
                  const index = Math.round(contentOffset / width);
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {room.roomCusImages.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image.imageUrl }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              
              {room.roomCusImages.length > 1 && (
                <View style={styles.paginationDots}>
                  {room.roomCusImages.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        currentImageIndex === index ? styles.activeDot : {},
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.carouselImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={50} color="#DDD" />
            </View>
          )}
        </View>

        {/* Room Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: getStatusColor(room.status) + '20' }]}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(room.status) }]} />
          <Text style={styles.statusBannerText}>
            Trạng thái phòng: <Text style={[styles.statusBannerValue, { color: getStatusColor(room.status) }]}>{getStatusText(room.status)}</Text>
          </Text>
        </View>

        {/* Room Basic Info */}
        <View style={styles.infoCard}>
          <Text style={styles.roomTitle}>{room.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá thuê:</Text>
            <Text style={styles.priceValue}>{formatCurrency(room.price)}/tháng</Text>
          </View>
          <View style={styles.addressRow}>
            <MaterialIcons name="location-on" size={18} color="#6D5BA3" />
            <Text style={styles.address}>{room.location}</Text>
          </View>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* Room Details */}
        <View style={styles.sectionCard}>
  <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
  
  <View style={styles.detailItem}>
    <Ionicons name="key-outline" size={20} color="#6D5BA3" />
    <Text style={styles.detailLabel}>Mã phòng:</Text>
    <Text style={styles.detailValue}>{room.roomNumber}</Text>
  </View>
  
  <View style={styles.detailItem}>
    <MaterialIcons name="category" size={20} color="#6D5BA3" />
    <Text style={styles.detailLabel}>Loại phòng:</Text>
    <Text style={styles.detailValue}>{room.roomTypeName}</Text>
  </View>
  
  <View style={styles.detailItem}>
    <FontAwesome5 name="coins" size={18} color="#6D5BA3" />
    <Text style={styles.detailLabel}>Tiền đặt cọc:</Text>
    <Text style={styles.detailValue}>{formatCurrency(room.deposite)}</Text>
  </View>
  
  <View style={styles.detailItem}>
    <MaterialIcons name="people" size={20} color="#6D5BA3" />
    <Text style={styles.detailLabel}>Người tối đa:</Text>
    <Text style={styles.detailValue}>{room.maxOccupancy} người</Text>
  </View>
  
  <View style={styles.detailItem}>
    <MaterialIcons name="square-foot" size={20} color="#6D5BA3" />
    <Text style={styles.detailLabel}>Diện tích:</Text>
    <Text style={styles.detailValue}>{room.square} m²</Text>
  </View>
</View>

        {/* Room Amenities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tiện nghi phòng</Text>
          <View style={styles.amenitiesContainer}>
            {room.roomCusAmentiesLists.map((amenity, index) => (
              <View key={index} style={styles.amenityItem}>
                <View style={styles.amenityIconContainer}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                </View>
                <Text style={styles.amenityName}>{amenity.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Room Services */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dịch vụ phòng</Text>
          {room.roomCusServices.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceName}>{service.serviceName}</Text>
              <Text style={styles.serviceCost}>{formatCurrency(service.cost)}</Text>
            </View>
          ))}
        </View>

        {/* Landlord Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin chủ trọ</Text>
          <View style={styles.landlordContainer}>
            <View style={styles.landlordAvatarContainer}>
              <Text style={styles.landlordAvatar}>{roomStayData.landlordName.charAt(0)}</Text>
            </View>
            <View style={styles.landlordDetails}>
              <Text style={styles.landlordName}>{roomStayData.landlordName}</Text>
              <Text style={styles.landlordTitle}>Chủ trọ</Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contract Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Thông tin hợp đồng</Text>
          <View style={styles.contractInfo}>
            <View style={styles.contractRow}>
              <Text style={styles.contractLabel}>Mã hợp đồng:</Text>
              <Text style={styles.contractValue}>{customerContract.contractId.substring(0, 8)}...</Text>
            </View>
            <View style={styles.contractRow}>
              <Text style={styles.contractLabel}>Ngày bắt đầu:</Text>
              <Text style={styles.contractValue}>{formatDate(customerContract.startDate)}</Text>
            </View>
            <View style={styles.contractRow}>
              <Text style={styles.contractLabel}>Ngày kết thúc:</Text>
              <Text style={styles.contractValue}>{formatDate(customerContract.endDate)}</Text>
            </View>
            <View style={styles.contractRow}>
              <Text style={styles.contractLabel}>Trạng thái:</Text>
              <Text style={[styles.contractStatus, { color: getStatusColor(customerContract.status) }]}>
                {getStatusText(customerContract.status)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.viewContractButton}
              onPress={() => openContractPDF(customerContract.term)}
            >
              <MaterialIcons name="description" size={20} color="#FFF" />
              <Text style={styles.viewContractText}>Xem hợp đồng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6D5BA3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6D5BA3',
    marginTop: 16,
    marginBottom: 24,
  },
  backToRentedButton: {
    backgroundColor: '#6D5BA3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToRentedText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageCarouselContainer: {
    width: width,
    height: width * 0.7,
    backgroundColor: '#EEE',
  },
  carouselImage: {
    width: width,
    height: width * 0.7,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 1,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusBannerText: {
    fontSize: 14,
    color: '#424242',
  },
  statusBannerValue: {
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6D5BA3',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14, 
    width: '100%',
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityIconContainer: {
    marginRight: 6,
  },
  amenityName: {
    fontSize: 14,
    color: '#333',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  serviceName: {
    fontSize: 15,
    color: '#333',
  },
  serviceCost: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6D5BA3',
  },
  landlordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  landlordAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6D5BA3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  landlordAvatar: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  landlordDetails: {
    flex: 1,
  },
  landlordName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  landlordTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#6D5BA3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contractInfo: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
  },
  contractRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contractLabel: {
    fontSize: 14,
    color: '#666',
  },
  contractValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  contractStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewContractButton: {
    backgroundColor: '#6D5BA3',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  viewContractText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RoomStayDetail;