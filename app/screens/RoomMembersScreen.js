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
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import roomStayService from '../services/roomStayService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const RoomMembersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const { token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        return; // Wait for auth to load
      }

      if (!token) {
        Alert.alert(
          'Lỗi xác thực',
          'Vui lòng đăng nhập để xem danh sách thành viên',
          [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.navigate('Login')
            },
            {
              text: 'Hủy',
              onPress: () => navigation.goBack(),
              style: 'cancel'
            }
          ]
        );
        setLoading(false);
        return;
      }

      try {
        const response = await roomStayService.getRoommatesByCustomer(token);
        
        if (response.isSuccess) {
          // Sort roommate list to put Tenant at the top
          const sortedRoommateList = [...response.data.roommateList].sort((a, b) => {
            if (a.roomerType === 'Tenant' && b.roomerType !== 'Tenant') return -1;
            if (a.roomerType !== 'Tenant' && b.roomerType === 'Tenant') return 1;
            return 0;
          });
          
          setRoomData({
            ...response.data,
            roommateList: sortedRoommateList
          });
        } else {
          Alert.alert('Lỗi', response.message || 'Không thể tải danh sách thành viên');
        }
      } catch (error) {
        console.error('Error fetching room members:', error);
        Alert.alert('Lỗi', 'Đã có lỗi xảy ra khi tải danh sách thành viên');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, authLoading, navigation]);

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#00A67E" />
        <ActivityIndicator size="large" color="#00A67E" />
        <Text style={styles.loadingText}>Đang tải danh sách thành viên...</Text>
      </SafeAreaView>
    );
  }

  if (!roomData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00A67E" />
        
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#00A67E', '#00A67E']}
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
          <Text style={styles.headerTitle}>Thành viên trong phòng</Text>
          <View style={styles.headerPlaceholder} />
        </LinearGradient>

        {/* Empty State */}
        <View style={styles.emptyStateContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
            style={styles.emptyStateCard}
          >
            <View style={styles.emptyStateIconContainer}>
              <MaterialIcons name="home" size={64} color="#00A67E" />
            </View>
            <Text style={styles.emptyStateTitle}>Bạn chưa ở trong phòng nào</Text>
            <Text style={styles.emptyStateDescription}>
              Hãy tìm kiếm và đăng ký một phòng để bắt đầu trải nghiệm
            </Text>
            <TouchableOpacity 
              style={styles.findRoomButton}
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })}
            >
              <LinearGradient
                colors={['#00A67E', '#00A67E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.findRoomButtonGradient}
              >
                <Text style={styles.findRoomButtonText}>Tìm phòng ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00A67E" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#00A67E', '#00A67E']}
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
        <Text style={styles.headerTitle}>Thành viên trong phòng</Text>
        <View style={styles.headerPlaceholder} />
      </LinearGradient>

      {/* Room Info Card with Blur Effect */}
      <View style={styles.roomInfoContainer}>
        <BlurView intensity={20} style={styles.roomInfoBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
            style={styles.roomInfoGradient}
          >
            <View style={styles.roomInfoContent}>
              <Text style={styles.roomInfoTitle}>Thông tin phòng</Text>
              <View style={styles.roomInfoRow}>
                <MaterialIcons name="calendar-today" size={18} color="#00A67E" />
                <Text style={styles.roomInfoText}>
                  Từ {formatDate(roomData.roomStay.startDate)} đến {formatDate(roomData.roomStay.endDate)}
                </Text>
              </View>
              <View style={styles.roomInfoRow}>
                <MaterialIcons name="people" size={18} color="#00A67E" />
                <Text style={styles.roomInfoText}>Tổng số thành viên: {roomData.totalRoomer}</Text>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>

      {/* Members List */}
      <ScrollView 
        style={styles.membersList}
        showsVerticalScrollIndicator={false}
      >
        {roomData.roommateList.map((member, index) => (
          <TouchableOpacity 
            key={member.customerId}
            style={styles.memberCard}
            onPress={() => navigation.navigate('MemberDetail', { member })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
              style={styles.memberCardGradient}
            >
              <View style={styles.memberHeader}>
                <View style={styles.avatarContainer}>
                  {member.avatar ? (
                    <Image 
                      source={{ uri: member.avatar }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <LinearGradient
                      colors={['#00A67E', '#00A67E']}
                      style={[styles.avatar, styles.avatarPlaceholder]}
                    >
                      <Text style={styles.avatarText}>
                        {member.fullName.charAt(0)}
                      </Text>
                    </LinearGradient>
                  )}
                  {member.isCurrentUser && (
                    <View style={styles.currentUserBadge}>
                      <Text style={styles.currentUserText}>Bạn</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.memberInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.memberName}>{member.fullName}</Text>
                    <View style={[
                      styles.roleBadge,
                      { backgroundColor: member.roomerType === 'Tenant' ? '#00A67E20' : '#6D5BA320' }
                    ]}>
                      <Text style={[
                        styles.roleText,
                        { color: member.roomerType === 'Tenant' ? '#00A67E' : '#6D5BA3' }
                      ]}>
                        {member.roomerType === 'Tenant' ? 'Người thuê chính' : 'Người ở ghép'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.memberType}>{member.customerType}</Text>
                </View>
                
                <MaterialIcons name="chevron-right" size={24} color="#666" />
              </View>

              <View style={styles.memberDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons name="phone" size={16} color="#00A67E" />
                  <Text style={styles.detailText}>{member.phoneNumber}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="email" size={16} color="#00A67E" />
                  <Text style={styles.detailText}>{member.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={16} color="#00A67E" />
                  <Text style={styles.detailText}>{member.gender}</Text>
                </View>
              </View>

              <View style={styles.preferencesContainer}>
                <Text style={styles.preferencesTitle}>Sở thích & Lối sống</Text>
                <Text style={styles.preferencesText} numberOfLines={2}>
                  {member.preferences} • {member.lifeStyle}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
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
    color: '#00A67E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 8,
  },
  headerPlaceholder: {
    width: 40,
  },
  roomInfoContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roomInfoBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  roomInfoGradient: {
    padding: 16,
  },
  roomInfoContent: {
    gap: 12,
  },
  roomInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,166,126,0.1)',
    padding: 12,
    borderRadius: 12,
  },
  roomInfoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  membersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  memberCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberCardGradient: {
    padding: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentUserBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#00A67E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  currentUserText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '600',
  },
  memberType: {
    fontSize: 14,
    color: '#666',
  },
  memberDetails: {
    marginBottom: 16,
    backgroundColor: 'rgba(0,166,126,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  preferencesContainer: {
    backgroundColor: 'rgba(0,166,126,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  preferencesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  preferencesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateCard: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,166,126,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  findRoomButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  findRoomButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  findRoomButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoomMembersScreen; 