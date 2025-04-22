import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import contractService from '../services/contractService';

const ViewAllRequestExtendContract = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchRequests = async (page = 1, shouldRefresh = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      }
      
      const result = await contractService.getAllExtendContractRequestsByCustomer(page);
      
      if (result.isSuccess && result.data) {
        // Change this line to use result.data.requests instead of result.data.items
        const newRequests = result.data.requests || [];
        
        if (shouldRefresh || page === 1) {
          setRequests(newRequests);
        } else {
          setRequests(prevRequests => [...prevRequests, ...newRequests]);
        }
        
        // Check if there is more data to load
        setHasMoreData(newRequests.length > 0);
        setPageIndex(page);
      } else {
        Alert.alert('Error', result.message || 'Failed to load requests');
        setHasMoreData(false);
      }
    } catch (error) {
      console.error('Error fetching extend contract requests:', error);
      Alert.alert('Error', 'Something went wrong while loading requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests(1, true);
  };

  const loadMoreRequests = () => {
    if (hasMoreData && !loadingMore) {
      setLoadingMore(true);
      fetchRequests(pageIndex + 1);
    }
  };

  const renderRequestItem = ({ item }) => {
    // Format date - fix this to use createdAt instead of createdDate
    const requestDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A';
    
    // Determine status color and text
    let statusColor = '#FFC107'; // Default: Pending
    let statusText = 'Đang chờ';
    
    if (item.status === 'Approved') {
      statusColor = '#4CAF50';
      statusText = 'Đã chấp nhận';
    } else if (item.status === 'Rejected') {
      statusColor = '#F44336';
      statusText = 'Đã từ chối';
    }
  
    return (
      <TouchableOpacity 
        style={styles.requestCard}
        onPress={() => {
          // Navigate to detail view if needed
          // navigation.navigate('RequestExtendContractDetail', { requestId: item.id });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.propertyName} numberOfLines={1}>
            {item.roomTitle || 'Phòng không có tên'} {item.roomNumber && `- ${item.roomNumber}`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.infoText}>Ngày gửi yêu cầu: {requestDate}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.infoText}>Thời hạn gia hạn: {item.monthWantToRent} tháng</Text>
          </View>
  
          {item.landLordName && (
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={16} color="#666" />
              <Text style={styles.infoText}>Chủ nhà: {item.landLordName}</Text>
            </View>
          )}
          
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Tin nhắn của bạn:</Text>
            <Text style={styles.messageText} numberOfLines={2}>
              {item.messageCustomer || 'Không có tin nhắn'}
            </Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.messageLabel}>Tin nhắn của chủ trọ:</Text>
            <Text style={styles.messageText} numberOfLines={2}>
              {item.messageLandlord || 'Không có tin nhắn'}
            </Text>
          </View>
        </View>
        
        
        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.updatedAt && item.updatedAt !== item.createdAt 
              ? `Cập nhật: ${new Date(item.updatedAt).toLocaleDateString('vi-VN')}` 
              : ''}
          </Text>
          <MaterialIcons name="chevron-right" size={24} color="#00A67E" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00A67E" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="history" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Bạn chưa có yêu cầu gia hạn hợp đồng nào</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Set StatusBar */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00A67E"
        translucent={true}
      />
      
      {/* Header with gradient that extends to status bar */}
      <LinearGradient
        colors={['#00A67E', '#00A67E']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.safeHeader}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitle}>
              <Text style={styles.headerText}>Yêu cầu gia hạn hợp đồng</Text>
            </View>
            <View style={styles.placeholderButton} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content Area */}
      <SafeAreaView style={styles.contentContainer}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00A67E" />
            <Text style={styles.loadingText}>Đang tải yêu cầu...</Text>
          </View>
        ) : (
          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.requestId.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00A67E']}
                tintColor={'#00A67E'}
              />
            }
            onEndReached={loadMoreRequests}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyList}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? StatusBar.currentHeight || 12 : 12,
  },
  safeHeader: {
    backgroundColor: 'transparent', // Make sure SafeAreaView is transparent
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderButton: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginLeft: 8,
  },
  messageContainer: {
    marginTop: 4,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ViewAllRequestExtendContract;