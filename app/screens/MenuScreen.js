import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MenuScreen = ({ navigation, route }) => {
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    // Load request count from AsyncStorage
    const loadRequestCount = async () => {
      try {
        const count = await AsyncStorage.getItem('requestCount');
        if (count !== null) {
          setRequestCount(parseInt(count));
        }
      } catch (error) {
        console.error('Error loading request count:', error);
      }
    };

    loadRequestCount();

    // Add focus listener to update count when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      loadRequestCount();
    });

    return unsubscribe;
  }, [navigation]);

  const handleLogout = () => {
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
          onPress: () => {
            // TODO: Implement logout logic here
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleSentRequestsPress = () => {
    console.log("MenuScreen: Navigating to SentRequests");
    
    navigation.navigate('SentRequests', { refresh: Date.now() });

  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00A67E', '#00A67E']}
        style={styles.header}
      >
        <View style={styles.placeholder} />
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('../assets/logoEasyRommie.png')}
          style={styles.avatar}
        />
        <Text style={styles.userName}>Nguyễn Xuân Đức</Text>
        <TouchableOpacity style={styles.editButton}>
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
        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="star-border" size={24} color="#666" />
          <Text style={styles.menuItemText}>Đánh giá của tôi</Text>
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

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="help-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Trợ giúp & Phản hồi</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  placeholder: {
    flex: 1,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    marginTop: 'auto',
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