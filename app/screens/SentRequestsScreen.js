import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  ScrollView, 
  Modal, 
  ActivityIndicator, 
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import roommateService from '../services/roommateService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

// Main component
const SentRequestsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA000';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#FF5252';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Đang chờ';
      case 'accepted': return 'Đã chấp nhận';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchSentRequests = async () => {
    if (!refreshing) setLoading(true);
    try {
      const result = await roommateService.getAllSentRoommateRequests();
      
      if (result.isSuccess) {
        setSentRequests(result.data.sentRequestSharingList);
        
        // Update total requests count
        const totalRequests = result.data.totalSentRequests;
        try {
          await AsyncStorage.setItem('requestCount', totalRequests.toString());
        } catch (storageError) {
          console.error('Lỗi khi lưu số lượng yêu cầu:', storageError);
        }
      } else {
        console.error('API trả về lỗi:', result.message);
        setError(result.message);
        Alert.alert('Lỗi', result.message);
      }
    } catch (err) {
      console.error('Lỗi trong fetchSentRequests:', err);
      setError('Không thể tải yêu cầu đã gửi');
      Alert.alert('Lỗi', 'Không thể tải yêu cầu đã gửi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSentRequests();
    
    // Setup focus listener
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSentRequests();
    });
  
    return unsubscribe;
  }, [navigation, route.params?.refresh]);

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSentRequests();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A67E" />
          <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchSentRequests}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (sentRequests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="inbox" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>Bạn chưa gửi yêu cầu nào</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => navigation.navigate('Room')}
          >
            <Text style={styles.browseButtonText}>Tìm kiếm phòng</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {sentRequests.map((request) => (
          <TouchableOpacity 
            key={request.requestId}
            style={styles.requestCard}
            onPress={() => handleRequestPress(request)}
          >
            {/* Post Owner Info */}
            <View style={styles.ownerInfo}>
              <Image 
                source={{ uri: request.postInfo.postOwnerAvatar }}
                style={styles.avatar}
              />
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{request.postInfo.postOwnerName}</Text>
                <View style={styles.contactInfo}>
                  <MaterialIcons name="phone" size={14} color="#666" />
                  <Text style={styles.contactText}>{request.postInfo.postOwnerPhone}</Text>
                </View>
              </View>
            </View>

            {/* Post Title and Location/Price */}
            <View style={styles.postInfo}>
              <Text style={styles.postTitle}>{request.postInfo.title}</Text>
              <View style={styles.locationPriceContainer}>
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.locationText} numberOfLines={1}>{request.postInfo.location}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.priceText}>{formatPrice(request.postInfo.price)}</Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {request.postInfo.description}
              </Text>
            </View>

            {/* Request Message */}
            <View style={styles.messageContainer}>
              <View style={styles.messageHeader}>
                <FontAwesome5 name="comment-alt" size={14} color="#666" />
                <Text style={styles.messageTitle}>Tin nhắn của bạn</Text>
              </View>
              <Text style={styles.messageText} numberOfLines={2}>{request.message}</Text>
            </View>

            {/* Footer */}
            <View style={styles.requestFooter}>
              <View style={styles.dateContainer}>
                <MaterialIcons name="schedule" size={16} color="#666" />
                <Text style={styles.dateText}>
                  {formatDate(request.createdAt)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(request.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                  {getStatusText(request.status)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Detail modal component
  const DetailModal = () => {
    const request = selectedRequest;
    if (!request) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Post Owner Info */}
              <View style={styles.ownerInfo}>
                <Image 
                  source={{ uri: request.postInfo.postOwnerAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.ownerDetails}>
                  <Text style={styles.ownerName}>{request.postInfo.postOwnerName}</Text>
                  <View style={styles.contactInfo}>
                    <MaterialIcons name="phone" size={14} color="#666" />
                    <Text style={styles.contactText}>{request.postInfo.postOwnerPhone}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <MaterialIcons name="email" size={14} color="#666" />
                    <Text style={styles.contactText}>{request.postInfo.postOwnerEmail}</Text>
                  </View>
                </View>
              </View>

              {/* Post Title and Location */}
              <View style={styles.postInfo}>
                <Text style={styles.postTitle}>{request.postInfo.title}</Text>
                <View style={styles.locationPriceContainer}>
                  <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={16} color="#666" />
                    <Text style={styles.locationText}>{request.postInfo.location}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Ionicons name="pricetag-outline" size={16} color="#666" />
                    <Text style={styles.priceText}>{formatPrice(request.postInfo.price)}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText}>
                  {request.postInfo.description}
                </Text>
              </View>

              {/* Request Message */}
              <View style={styles.messageContainer}>
                <View style={styles.messageHeader}>
                  <FontAwesome5 name="comment-alt" size={14} color="#666" />
                  <Text style={styles.messageTitle}>Tin nhắn của bạn</Text>
                </View>
                <Text style={styles.messageText}>{request.message}</Text>
              </View>

              {/* Status and Date */}
              <View style={styles.statusContainer}>
                <View style={styles.dateContainer}>
                  <MaterialIcons name="schedule" size={16} color="#666" />
                  <Text style={styles.dateText}>
                    {formatDate(request.createdAt)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(request.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                    {getStatusText(request.status)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.primary} 
        translucent={true}
      />
      
      {/* Header with proper insets */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={[
          styles.header,
          { paddingTop: insets.top || (Platform.OS === 'ios' ? 44 : 16) }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu đã gửi</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.7}
          disabled={loading || refreshing}
        >
          <MaterialIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.container}>
        {renderContent()}
      </View>

      <DetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#00A67E', // Same as header color for status bar area
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 16,
    // paddingTop handled dynamically with SafeAreaInsets
  },
  backButton: { 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
  },
  refreshButton: { 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#FFF' 
  },
  content: { 
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24
  },
  requestCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 16, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  ownerInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  avatar: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    backgroundColor: '#F0F0F0' 
  },
  ownerDetails: { 
    flex: 1, 
    marginLeft: 12 
  },
  ownerName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1A1A1A', 
    marginBottom: 4 
  },
  contactInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 2 
  },
  contactText: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 4 
  },
  postInfo: { 
    marginBottom: 12 
  },
  postTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1A1A1A', 
    marginBottom: 8 
  },
  locationPriceContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  locationContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  locationText: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 4 
  },
  priceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E8F5E9', 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 12 
  },
  priceText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#00A67E', 
    marginLeft: 4 
  },
  descriptionContainer: { 
    marginBottom: 12, 
    paddingVertical: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  descriptionText: { 
    fontSize: 14, 
    color: '#424242', 
    lineHeight: 20 
  },
  messageContainer: { 
    marginBottom: 12 
  },
  messageHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  messageTitle: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#666', 
    marginLeft: 8 
  },
  messageText: { 
    fontSize: 14, 
    color: '#424242', 
    lineHeight: 20, 
    paddingLeft: 22 
  },
  requestFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  dateContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  dateText: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 4 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  statusDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    marginRight: 6 
  },
  statusText: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    width: '90%', 
    maxHeight: '80%', 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1A1A1A' 
  },
  closeButton: { 
    padding: 4 
  },
  modalBody: { 
    padding: 16 
  },
  statusContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 16, 
    paddingTop: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#F0F0F0' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#666' 
  },
  errorContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  errorText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  retryButton: { 
    backgroundColor: '#00A67E', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  retryButtonText: { 
    color: '#FFF', 
    fontWeight: '600' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  emptyText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  browseButton: { 
    backgroundColor: colors.primary, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  browseButtonText: { 
    color: '#FFF', 
    fontWeight: '600' 
  },
});

export default SentRequestsScreen;