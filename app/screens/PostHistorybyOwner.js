import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  StatusBar,
  Dimensions
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import postService from '../services/postService';
import { colors, typography, spacing, borderRadius, shadows } from '../theme/theme';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 160;

const PostHistoryByOwner = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useState(new Animated.Value(0))[0];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getAllPostRoommateByCustomerId();
      
      if (response.isSuccess) {
        setPosts(response.data);
      } else {
        Alert.alert('Thông báo', response.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách bài đăng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' đ';
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'Active':
        return { 
          color: '#4CAF50',
          icon: 'check-circle',
          text: 'Đang hoạt động',
          gradient: ['#4CAF50', '#8BC34A']
        };
      case 'Inactive':
        return { 
          color: '#FF5722',
          icon: 'x-circle',
          text: 'Không hoạt động',
          gradient: ['#FF5722', '#FF9800']
        };
      default:
        return { 
          color: '#9E9E9E',
          icon: 'help-circle',
          text: 'Không xác định',
          gradient: ['#9E9E9E', '#BDBDBD']
        };
    }
  };

  const renderItem = ({ item, index }) => {
    const statusConfig = getStatusConfig(item.status);
    const inputRange = [
      -1, 
      0, 
      ITEM_HEIGHT * index, 
      ITEM_HEIGHT * (index + 2)
    ];
    
    const scale = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.9],
    });
    
    const opacity = scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0.7],
    });

    return (
      <Animated.View 
        style={[
          styles.postCardContainer,
          { 
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.postCard}
          onPress={() => {
            // Navigate to post details
          }}
          activeOpacity={0.9}
        >
          {/* Right corner status badge */}
          <LinearGradient
            colors={statusConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}
          >
            <Feather name={statusConfig.icon} size={12} color="white" />
            <Text style={styles.statusText}>{statusConfig.text}</Text>
          </LinearGradient>
          
          {/* Title with shadow */}
          <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.divider} />
          
          {/* Post info with updated icons */}
          <View style={styles.postInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="wallet-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{formatPrice(item.price)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          
          {/* Action buttons */}
          
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="post-add" 
        size={100} 
        color="#CCCCCC"
        style={styles.emptyImage}
      />
      <Text style={styles.emptyTitle}>Chưa có bài đăng nào</Text>
      <Text style={styles.emptyText}>Tạo bài đăng mới để chia sẻ phòng của bạn</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          navigation.navigate('CreatePost');
        }}
      >
        <LinearGradient
          colors={['#2196F3', '#03A9F4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.createButtonGradient}
        >
          <Feather name="plus" size={20} color="#FFF" />
          <Text style={styles.createButtonText}>Tạo bài đăng mới</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => {
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <Animated.View style={[styles.headerShadow, { opacity: headerOpacity }]} />
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <ActivityIndicator size="large" color="#5E8B7E" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh sách bài đăng</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            navigation.navigate('CreatePost');
          }}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>
      
      {renderHeader()}

      <Animated.FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item.postId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5E8B7E']}
            tintColor="#5E8B7E"
            progressBackgroundColor="#ffffff"
          />
        }
        ListEmptyComponent={EmptyListComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#5E8B7E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  postCardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    height: ITEM_HEIGHT,
    overflow: 'hidden',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 80,
    marginBottom: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  postInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  // Removed loadingAnimation style
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  createButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PostHistoryByOwner;