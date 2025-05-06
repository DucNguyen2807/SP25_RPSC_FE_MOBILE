import React, { useState, useEffect } from 'react';
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
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import roomStayService from '../services/roomStayService';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';

const LeaveRequestsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const { token } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await roomStayService.getLeaveRoomRequests(token);
        if (response.isSuccess) {
          setRequests(response.data.leaveRoomRequestList);
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tải danh sách yêu cầu');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tải danh sách yêu cầu');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return 'Chờ xử lý';
      case 1:
        return 'Đã chấp nhận';
      case 2:
        return 'Đã từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return colors.warning;
      case 1:
        return colors.success;
      case 2:
        return colors.error;
      default:
        return colors.text.secondary;
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const result = await roomStayService.acceptLeaveRoomRequest(token, requestId);
      if (result.isSuccess) {
        Alert.alert(
          "Thành công",
          "Yêu cầu rời phòng đã được chấp nhận thành công.",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert("Lỗi", result.message || "Không thể chấp nhận yêu cầu rời phòng");
      }
    } catch (error) {
      console.error('Accept request error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi chấp nhận yêu cầu');
    }
  };

  const handleRejectRequest = async (requestId) => {
    // TODO: Implement reject request functionality
    Alert.alert('Thông báo', 'Chức năng từ chối yêu cầu sẽ được cập nhật sau');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách yêu cầu...</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.listContainer} contentContainerStyle={{ paddingBottom: insets.bottom }}>
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="assignment" size={64} color={colors.primary} />
            <Text style={styles.emptyStateText}>Không có yêu cầu nào</Text>
          </View>
        ) : (
          requests.map((request) => (
            <View key={request.cmoid} style={styles.requestCard}>
              <BlurView intensity={20} style={styles.requestBlur}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
                  style={styles.requestGradient}
                >
                  {/* Member Info */}
                  <View style={styles.memberInfo}>
                    <Image
                      source={{ uri: request.memberInfo.avatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{request.memberInfo.fullName}</Text>
                      <Text style={styles.memberPhone}>{request.memberInfo.phoneNumber}</Text>
                    </View>
                  </View>

                  {/* Request Details */}
                  <View style={styles.requestDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="calendar-today" size={16} color={colors.primary} />
                      <Text style={styles.detailText}>
                        Ngày yêu cầu: {formatDate(request.dateRequest)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="info" size={16} color={colors.primary} />
                      <Text style={[styles.detailText, { color: getStatusColor(request.status) }]}>
                        Trạng thái: {getStatusText(request.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {request.status === 0 && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleAcceptRequest(request.cmoid)}
                      >
                        <Text style={styles.actionButtonText}>Chấp nhận</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </BlurView>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={[
          styles.header,
          { 
            paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 16,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yêu cầu rời phòng</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Content */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  requestCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  requestGradient: {
    padding: 16,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  memberPhone: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  requestDetails: {
    backgroundColor: 'rgba(0,166,126,0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LeaveRequestsScreen;