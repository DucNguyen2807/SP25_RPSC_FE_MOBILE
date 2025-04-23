import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../services/authService';

const MenuScreen = ({ navigation, route }) => {
  const [requestCount, setRequestCount] = useState(0);
  const [userData, setUserData] = useState({
    fullName: '',
    avatar: null
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // Load request count
      const count = await AsyncStorage.getItem('requestCount');
      if (count !== null) {
        setRequestCount(parseInt(count));
      }
      
      // Use getInforProfile instead of AsyncStorage for user data
      const profileResult = await authService.getInforProfile();
      if (profileResult.isSuccess && profileResult.data) {
        const user = profileResult.data.user;
        setUserData({
          fullName: user.fullName || 'User',
          avatar: user.avatar || null
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // Add focus listener to update data when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Đăng xuất", 
          onPress: async () => {
            try {
              const result = await authService.logout();
              if (result.isSuccess) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                Alert.alert('Lỗi', result.message || 'Đăng xuất thất bại');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi đăng xuất');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleSentRequestsPress = () => {
    navigation.navigate('Rented', {
      screen: 'SentRequests',
      params: { refresh: Date.now() }
    });
  };
  
  const handleCustomerRequestsPress = () => {
    navigation.navigate('CustomerRequests');
  };

  const handleExtendContractRequestsPress = () => {
    navigation.navigate('History-Request-Extend-Contract');
  };

  const handlePastRoomsPress = () => {
    navigation.navigate('PastRooms');
  };

  const goBack = () => {
    navigation.goBack();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00A67E" />
      
      {/* Header */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>My Profile</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialIcons name="notifications-none" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.safeAreaContent}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00A67E']}
              tintColor={'#00A67E'}
            />
          }
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {userData.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require('../assets/logoEasyRommie.png')}
                style={styles.avatar}
              />
            )}
            <Text style={styles.userName}>{userData.fullName}</Text>
            <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile')}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
          </View>

          {/* Menu Options */}
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem}>
              <MaterialIcons name="favorite-border" size={24} color="#666" />
              <Text style={styles.menuItemText}>Phòng đã thích</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handlePastRoomsPress}
            >
              <MaterialIcons name="history" size={24} color="#666" />
              <Text style={styles.menuItemText}>Lịch sử ở ghép</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('MyFeedbacks')}
            >
              <MaterialIcons name="star-border" size={24} color="#666" />
              <Text style={styles.menuItemText}>Đánh giá của tôi</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleCustomerRequestsPress}
            >
              <MaterialIcons name="assignment" size={24} color="#666" />
              <Text style={styles.menuItemText}>Yêu cầu thuê phòng</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSentRequestsPress}
            >
              <MaterialIcons name="send" size={24} color="#666" />
              <Text style={styles.menuItemText}>Yêu cầu ở ghép đã gửi</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{requestCount}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            {/* New Button for Extend Contract Requests */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleExtendContractRequestsPress}
            >
              <MaterialIcons name="history" size={24} color="#666" />
              <Text style={styles.menuItemText}>Yêu cầu gia hạn hợp đồng</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('RoomMembers')}
            >
              <MaterialIcons name="people" size={24} color="#666" />
              <Text style={styles.menuItemText}>Danh sách người trong phòng</Text>
              <MaterialIcons name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#FF5252" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeAreaTop: {
    backgroundColor: '#00A67E',
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#00A67E',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#00A67E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  menuSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#424242',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  badgeContainer: {
    backgroundColor: '#00A67E',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MenuScreen;