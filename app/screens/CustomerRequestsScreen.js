import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import NetInfo from the community package
import NetInfo from '@react-native-community/netinfo';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/theme';

const CustomerRequestsScreen = ({ navigation, route }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  
  // Get roomId from route params or use default value 111 as provided in your comment
  const roomId = route.params?.roomId || '111';

  useEffect(() => {
    // Check network connectivity
    const checkConnection = async () => {
      try {
        const networkState = await NetInfo.fetch();
        setIsConnected(networkState.isConnected);
        if (networkState.isConnected) {
          fetchRequests();
        } else {
          setError('No internet connection. Please check your network settings.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Network check error:', err);
        // Try to fetch anyway
        fetchRequests();
      }
    };

    checkConnection();

    // Add refresh listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkConnection();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Using token:', token.substring(0, 10) + '...');

      // Build the URL with required roomId parameter
      const url = `${API_BASE_URL}/customerrequestrent/room-rent-request?roomId=${roomId}`;
      
      console.log('Fetching from URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log('Response status:', response.status);
      
      // For debugging - log the raw response
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Now parse the response as JSON if it's not empty
      const data = responseText ? JSON.parse(responseText) : {};

      if (response.ok && data.isSuccess) {
        setRequests(data.data || []);
      } else {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
    } catch (err) {
      // Handle specific error types
      if (err.message.includes('Network request failed')) {
        setError('Network request failed. Please check your connection.');
      } else {
        setError(err.message || 'An unknown error occurred');
      }
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setCancelling(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${API_BASE_URL}/customerrequestrent/room-rent-request/cancel/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // For debugging - log the raw response
      const responseText = await response.text();
      console.log('Cancel response text:', responseText);
      
      // Parse the response if there's content
      const data = responseText ? JSON.parse(responseText) : {};

      if (response.ok && data.isSuccess) {
        Alert.alert('Success', 'Request cancelled successfully');
        // Refresh the requests list
        fetchRequests();
      } else {
        throw new Error(data.message || `Server error: ${response.status}`);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'An unknown error occurred');
      console.error('Error cancelling request:', err);
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestPress = (request) => {
    navigation.navigate('RoomDetail', { roomId: request.roomId });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#FFA000';
      case 'Approved':
        return '#4CAF50';
      case 'Rejected':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending':
        return 'Đang chờ';
      case 'Approved':
        return 'Đã duyệt';
      case 'Rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestCard}
      onPress={() => handleRequestPress(item)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.requestId}>Yêu cầu #{item.roomRequestId.substring(0, 8)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color="#666" />
          <Text style={styles.detailText}>
            Ngày dọn vào: {new Date(item.dateWantToRent).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="timer" size={16} color="#666" />
          <Text style={styles.detailText}>
            Thời hạn: {item.monthWantRent} tháng
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="message" size={16} color="#666" />
          <Text style={styles.detailText} numberOfLines={2}>
            Lời nhắn: {item.message || 'Không có lời nhắn'}
          </Text>
        </View>
      </View>

      <View style={styles.requestFooter}>
        <Text style={styles.dateText}>
          Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <View style={styles.footerActions}>
          {item.status === 'Pending' && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                Alert.alert(
                  'Hủy yêu cầu',
                  'Bạn có chắc chắn muốn hủy yêu cầu này?',
                  [
                    {
                      text: 'Không',
                      style: 'cancel'
                    },
                    {
                      text: 'Có',
                      onPress: () => handleCancelRequest(item.roomRequestId)
                    }
                  ]
                );
              }}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.cancelButtonText}>Hủy</Text>
              )}
            </TouchableOpacity>
          )}
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A67E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu thuê phòng đã gửi</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchRequests}
        >
          <MaterialIcons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRequests}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.roomRequestId}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchRequests}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={48} color="#666" />
              <Text style={styles.emptyText}>Không tìm thấy yêu cầu nào</Text>
            </View>
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  requestDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
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
    color: '#F44336',
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#00A67E',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CustomerRequestsScreen;