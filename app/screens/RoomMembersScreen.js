import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  Pressable,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useFocusEffect } from '@react-navigation/native';
import roomStayService from '../services/roomStayService';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MenuOption = ({ icon, label, onPress, color = '#333' }) => (
  <TouchableOpacity 
    style={styles.menuOption}
    onPress={onPress}
  >
    <View style={styles.menuOptionIcon}>
      <MaterialIcons name={icon} size={24} color={color} />
    </View>
    <Text style={[styles.menuOptionText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

const RoomMembersScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const { token, isLoading: authLoading } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = useCallback(async () => {
    if (authLoading) {
      return;
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
        const sortedRoommateList = [...response.data.roommateList].sort((a, b) => {
          if (a.roomerType === 'Tenant' && b.roomerType !== 'Tenant') return -1;
          if (a.roomerType !== 'Tenant' && b.roomerType === 'Tenant') return 1;
          return 0;
        });
        
        const currentUserData = sortedRoommateList.find(member => member.isCurrentUser);
        setCurrentUser(currentUserData);
        
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
  }, [token, authLoading, navigation]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchData();
    }, [fetchData])
  );

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const handleMenuPress = (member) => {
    setSelectedMember(member);
    setShowMenu(true);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
    setSelectedMember(null);
  };

  const handleOptionPress = (action) => {
    handleMenuClose();
    action();
  };

  const handleLeaveRoom = async () => {
    Alert.alert(
      "Xác nhận rời phòng",
      "Bạn có chắc chắn muốn gửi yêu cầu rời phòng?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Gửi yêu cầu", 
          onPress: async () => {
            try {
              const result = await roomStayService.requestLeaveRoomByMember(token);
              if (result.isSuccess) {
                Alert.alert(
                  "Thành công",
                  result.message,
                  [
                    {
                      text: "OK",
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                Alert.alert("Lỗi", result.message);
              }
            } catch (error) {
              console.error('Leave room error:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu rời phòng');
            }
          },
          style: 'destructive'
        }
      ]
    );
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
          <View 
            key={member.customerId}
            style={styles.memberCard}
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
                
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => handleMenuPress(member)}
                >
                  <MaterialIcons name="more-vert" size={24} color="#666" />
                </TouchableOpacity>
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
          </View>
        ))}
      </ScrollView>

      {/* Custom Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}
      >
        <Pressable style={styles.modalOverlay} onPress={handleMenuClose}>
          <BlurView intensity={20} style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Tùy chọn</Text>
              <TouchableOpacity onPress={handleMenuClose}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuContent}>
              {!selectedMember?.isCurrentUser && (
                <>
                  <MenuOption
                    icon="person"
                    label="Xem chi tiết"
                    onPress={() => handleOptionPress(() => 
                      navigation.navigate('MemberDetail', { member: selectedMember })
                    )}
                  />
                  <MenuOption
                    icon="chat"
                    label="Nhắn tin"
                    onPress={() => handleOptionPress(() => {
                      // TODO: Implement chat functionality
                    })}
                  />
                </>
              )}
              {selectedMember?.isCurrentUser && (
                <>
                  {currentUser?.roomerType === 'Tenant' ? (
                    <MenuOption
                      icon="exit-to-app"
                      label="Xem yêu cầu rời phòng"
                      onPress={() => handleOptionPress(() => 
                        navigation.navigate('LeaveRequests', { roomId: roomData.roomStay.roomId })
                      )}
                      color="#00A67E"
                    />
                  ) : (
                    <MenuOption
                      icon="logout"
                      label="Rời phòng"
                      onPress={() => handleOptionPress(handleLeaveRoom)}
                      color="#FF5252"
                    />
                  )}
                </>
              )}
            </View>
          </BlurView>
        </Pressable>
      </Modal>
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
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuContent: {
    gap: 12,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  menuOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RoomMembersScreen; 