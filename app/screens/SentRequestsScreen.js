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
  Pressable,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SentRequestsScreen = ({ navigation, route }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);

  // Mock API response data
  const sentRequests = [
    {
      requestId: "20cc55eb-6ba3-4b67-b133-2a43b045216e",
      message: "Tui se o voi o tan 6 thang",
      status: "Pending",
      createdAt: "2025-04-09T12:08:11.037",
      postInfo: {
        postId: "A602C186-58AF-4D66-8397-3953DE305431",
        title: "Studio Apartment for Rent",
        description: "Căn loft rộng rãi với tầm nhìn đẹp ra toàn cảnh thành phố, đầy đủ nội thất, sẵn sàng cho người thuê",
        location: "Binh Thanh District",
        postOwnerName: "Robert Johnson",
        postOwnerAvatar: "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2024/07/anh-nu-cute-55.jpg",
        postOwnerPhone: "0778899001",
        postOwnerEmail: "customer3@example.com"
      }
    },
    {
      requestId: "c8fc222a-c65d-4ad0-abb1-d2bf14b40aa6",
      message: "test",
      status: "Pending",
      createdAt: "2025-04-09T12:09:58.49",
      postInfo: {
        postId: "357D37B1-F96F-4225-9FF8-F867B25246B0",
        title: "Cần kiếm người ở ghép, share tiền dễ thở",
        description: "Căn loft rộng rãi với tầm nhìn đẹp ra toàn cảnh thành phố, đầy đủ nội thất, sẵn sàng cho người thuê",
        location: "Binh Thanh District",
        postOwnerName: "Michael Wilson",
        postOwnerAvatar: "https://i.pinimg.com/1200x/a0/cf/86/a0cf86459174c134ee20d44ab763ad21.jpg",
        postOwnerPhone: "0665544332",
        postOwnerEmail: "customer5@example.com"
      }
    }
  ];

  useEffect(() => {
    // Update total requests count
    setTotalRequests(sentRequests.length);
    
    // Pass the count back to MenuScreen
    if (route.params?.onUpdateCount) {
      route.params.onUpdateCount(sentRequests.length);
    }
  }, [sentRequests.length]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA000';
      case 'accepted':
        return '#4CAF50';
      case 'rejected':
        return '#FF5252';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Đang chờ';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
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

  const handleRequestPress = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const DetailModal = ({ request, visible, onClose }) => {
    if (!request) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết yêu cầu</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                <View style={styles.locationContainer}>
                  <MaterialIcons name="location-on" size={16} color="#666" />
                  <Text style={styles.locationText}>{request.postInfo.location}</Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00A67E', '#00A67E']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu')}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu đã gửi</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.content}>
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

            {/* Post Title and Location */}
            <View style={styles.postInfo}>
              <Text style={styles.postTitle}>{request.postInfo.title}</Text>
              <View style={styles.locationContainer}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.locationText}>{request.postInfo.location}</Text>
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
              <Text style={styles.messageText}>{request.message}</Text>
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

      <DetailModal 
        request={selectedRequest}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  postInfo: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  descriptionContainer: {
    marginBottom: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  descriptionText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
    paddingLeft: 22,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

export default SentRequestsScreen; 