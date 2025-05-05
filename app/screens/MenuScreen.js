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
import { colors, typography, spacing, borderRadius } from '../theme/theme';

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <SafeAreaView style={styles.safeAreaTop}>
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text style={styles.headerText}>Hồ sơ của tôi</Text>
          </View>
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
                <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
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
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => navigation.navigate('PostHistoryByOwner')}
            >
              <MaterialIcons name="people" size={24} color="#666" />
              <Text style={styles.menuItemText}>Danh sách bài đăng cũ</Text>
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
    backgroundColor: colors.background.secondary,
  },
  safeAreaTop: {
    backgroundColor: colors.primary,
  },
  safeAreaContent: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.primary,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    color: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.white,
  },
  userName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.md,
  },
  editButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    marginTop: spacing.sm,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.tertiary,
  },
  menuItemText: {
    flex: 1,
    marginLeft: spacing.lg,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    marginLeft: spacing.lg,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.error,
  },
  badgeContainer: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});

export default MenuScreen;


