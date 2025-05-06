import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../theme/theme';
import { API_BASE_URL } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const MyFeedbacksScreen = ({ navigation }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedFeedbacks, setReceivedFeedbacks] = useState([]);
  const [loadingReceived, setLoadingReceived] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/feedback/my-feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      const data = await response.json();
      if (data.isSuccess) {
        setFeedbacks(data.data.myFeedbacks);
      } else {
        throw new Error(data.message || 'Failed to fetch feedbacks');
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchReceivedFeedbacks = async () => {
    try {
      setLoadingReceived(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const response = await fetch(`${API_BASE_URL}/feedback/my-received-feedbacks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });
      const data = await response.json();
      if (data.isSuccess) {
        setReceivedFeedbacks(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch received feedbacks');
      }
    } catch (error) {
      console.error('Error fetching received feedbacks:', error);
    } finally {
      setLoadingReceived(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    if (activeTab === 'received') fetchReceivedFeedbacks();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedbacks();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOptionsPress = (feedback) => {
    setSelectedFeedback(feedback);
    setShowOptionsModal(true);
  };

  const handleEditPress = () => {
    setEditRating(selectedFeedback.rating);
    setEditDescription(selectedFeedback.description);
    setEditImages(selectedFeedback.imageRves || []);
    setShowOptionsModal(false);
    setShowEditModal(true);
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: handleDeleteFeedback,
        },
      ],
    );
    setShowOptionsModal(false);
  };

  const handleDeleteFeedback = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${API_BASE_URL}/feedback/delete-feedback-roommate/${selectedFeedback.feedbackId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();
      let data;
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        Alert.alert('Thành công', 'Đã xóa đánh giá thành công');
        fetchFeedbacks();
        return;
      }

      if (data.isSuccess) {
        Alert.alert('Thành công', 'Đã xóa đánh giá thành công');
        fetchFeedbacks();
      } else {
        throw new Error(data.message || 'Failed to delete feedback');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      Alert.alert('Lỗi', 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEditImages([...editImages, { uri: result.assets[0].uri }]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...editImages];
    newImages.splice(index, 1);
    setEditImages(newImages);
  };

  const handleUpdateFeedback = async () => {
    if (!editRating || !editDescription) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const formData = new FormData();
      formData.append('FeedbackId', selectedFeedback.feedbackId);
      formData.append('Description', editDescription);
      formData.append('Rating', editRating);
      
      editImages.forEach((image, index) => {
        if (image.uri) {
          formData.append(`Images`, {
            uri: image.uri,
            type: 'image/jpeg',
            name: `image${index}.jpg`,
          });
        }
      });

      const apiEndpoint = selectedFeedback.type === 'Roommate' 
        ? `${API_BASE_URL}/feedback/update-feedback-roommate`
        : `${API_BASE_URL}/feedback/update-feedback-room`;

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.isSuccess) {
        Alert.alert('Thành công', 'Đã cập nhật đánh giá thành công');
        setShowEditModal(false);
        fetchFeedbacks();
      } else {
        throw new Error(data.message || 'Failed to update feedback');
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật đánh giá. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onPress) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <FontAwesome
              name={star <= rating ? 'star' : 'star-o'}
              size={20}
              color={star <= rating ? '#FFD700' : colors.text.secondary}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getFilteredFeedbacks = () => {
    switch (activeTab) {
      case 'roommates':
        return feedbacks.filter(feedback => feedback.type === 'Roommate');
      case 'rooms':
        return feedbacks.filter(feedback => feedback.type === 'Room');
      case 'received':
        return receivedFeedbacks;
      default:
        return feedbacks;
    }
  };

  const renderFeedbackCard = (feedback) => {
    const isRoomFeedback = feedback.type === 'Room';

    return (
      <View key={feedback.feedbackId} style={styles.feedbackCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ 
                  uri: isRoomFeedback 
                    ? feedback.rentalRoomInfo?.images[0]
                    : feedback.revieweeInfo?.avatar
                }}
                style={styles.cardImage}
              />
              {isRoomFeedback ? (
                <Ionicons name="home" size={16} color={colors.white} style={styles.typeIcon} />
              ) : (
                <Ionicons name="people" size={16} color={colors.white} style={styles.typeIcon} />
              )}
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {isRoomFeedback 
                  ? feedback.rentalRoomInfo?.title
                  : feedback.revieweeInfo?.fullName
                }
              </Text>
              <Text style={styles.cardSubtitle}>
                {isRoomFeedback 
                  ? `${feedback.rentalRoomInfo?.roomTypeName} - Phòng ${feedback.rentalRoomInfo?.roomNumber}`
                  : feedback.revieweeInfo?.email
                }
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => handleOptionsPress(feedback)}
          >
            <MaterialIcons name="more-vert" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.ratingContainer}>
            {renderStars(feedback.rating)}
            <Text style={styles.dateText}>{formatDate(feedback.createdDate)}</Text>
          </View>
          
          <Text style={styles.description}>{feedback.description}</Text>

          {feedback.imageRves && feedback.imageRves.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.imagesContainer}
            >
              {feedback.imageRves.map((image) => (
                <Image
                  key={image.imageRfid}
                  source={{ uri: image.imageRfurl }}
                  style={styles.feedbackImage}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  const filteredFeedbacks = getFilteredFeedbacks();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primary]}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đánh giá của tôi</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'roommates' && styles.activeTab]}
            onPress={() => setActiveTab('roommates')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'roommates' ? colors.primary : colors.text.secondary} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'roommates' && styles.activeTabText]}>
              Người ở ghép
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
            onPress={() => setActiveTab('rooms')}
          >
            <Ionicons 
              name="home" 
              size={20} 
              color={activeTab === 'rooms' ? colors.primary : colors.text.secondary} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
              Phòng đã ở
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <MaterialIcons 
              name="inbox" 
              size={20} 
              color={activeTab === 'received' ? colors.primary : colors.text.secondary} 
              style={styles.tabIcon}
            />
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Đánh giá nhận được
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === 'received' ? (
          loadingReceived ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Đang tải đánh giá nhận được...</Text>
            </View>
          ) : receivedFeedbacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inbox" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>Bạn chưa nhận được đánh giá nào</Text>
            </View>
          ) : (
            receivedFeedbacks.map((feedback, idx) => (
              <View key={idx} style={styles.feedbackCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.headerLeft}>
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: feedback.reviewerAvatar }} style={styles.cardImage} />
                      <MaterialIcons name="person" size={16} color={colors.white} style={styles.typeIcon} />
                    </View>
                    <View style={styles.headerInfo}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{feedback.reviewerName}</Text>
                      <Text style={styles.cardSubtitle}>{feedback.type === 'Roommate' ? 'Người ở ghép' : 'Phòng'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.ratingContainer}>
                    {renderStars(feedback.rating)}
                    <Text style={styles.dateText}>{formatDate(feedback.createdDate)}</Text>
                  </View>
                  <Text style={styles.description}>{feedback.description}</Text>
                  {feedback.imageUrls && feedback.imageUrls.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                      {feedback.imageUrls.map((img, i) => (
                        <Image key={i} source={{ uri: img }} style={styles.feedbackImage} />
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            ))
          )
        ) : (
          filteredFeedbacks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="rate-review" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>
                {activeTab === 'all' 
                  ? 'Bạn chưa có đánh giá nào'
                  : activeTab === 'roommates'
                  ? 'Bạn chưa có đánh giá nào về người ở ghép'
                  : 'Bạn chưa có đánh giá nào về phòng đã ở'
                }
              </Text>
            </View>
          ) : (
            filteredFeedbacks.map(renderFeedbackCard)
          )
        )}
      </ScrollView>

      {/* Options Modal */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsModal}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleEditPress}
            >
              <MaterialIcons name="edit" size={24} color={colors.primary} />
              <Text style={styles.optionText}>Chỉnh sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleDeletePress}
            >
              <MaterialIcons name="delete" size={24} color={colors.error} />
              <Text style={[styles.optionText, { color: colors.error }]}>Xóa</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Chỉnh sửa đánh giá</Text>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalContent}>
              <View style={styles.ratingSection}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                {renderStars(editRating, setEditRating)}
              </View>

              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>Nhận xét</Text>
                <TextInput
                  style={styles.descriptionInput}
                  multiline
                  numberOfLines={4}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Nhập nhận xét của bạn..."
                />
              </View>

              <View style={styles.imagesSection}>
                <Text style={styles.sectionTitle}>Hình ảnh</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {editImages.map((image, index) => (
                    <View key={index} style={styles.imageContainer}>
                      <Image source={{ uri: image.uri || image.imageRfurl }} style={styles.editImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <MaterialIcons name="close" size={20} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {editImages.length < 5 && (
                    <TouchableOpacity
                      style={styles.addImageButton}
                      onPress={pickImage}
                    >
                      <MaterialIcons name="add-a-photo" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.editModalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleUpdateFeedback}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body1,
    color: colors.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.h4,
    fontWeight: '600',
    color: colors.white,
    marginLeft: -spacing.xl,
  },
  headerRight: {
    width: 40,
  },
  tabsWrapper: { marginHorizontal: spacing.md, marginVertical: spacing.md },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    borderRadius: borderRadius.md,
    backgroundColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.primaryLight || '#E6F4F1',
    borderRadius: borderRadius.md,
  },
  tabIcon: {
    marginRight: spacing.xs,
  },
  tabText: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.body1,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  feedbackCard: {
    margin: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  cardImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  typeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 2,
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.caption,
    color: colors.text.secondary,
  },
  cardContent: {
    padding: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: spacing.xs,
  },
  dateText: {
    fontSize: typography.caption,
    color: colors.text.secondary,
  },
  description: {
    fontSize: typography.body2,
    color: colors.text.primary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  imagesContainer: {
    marginTop: spacing.sm,
  },
  feedbackImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  optionsButton: {
    padding: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: width * 0.7,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  optionText: {
    marginLeft: spacing.md,
    fontSize: typography.body1,
    color: colors.text.primary,
  },
  editModal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    width: width * 0.9,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editModalTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  editModalContent: {
    padding: spacing.md,
  },
  ratingSection: {
    marginBottom: spacing.lg,
  },
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  imagesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.body1,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body2,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },
  imageContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  editImage: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  cancelButtonText: {
    fontSize: typography.body1,
    color: colors.text.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 120,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: typography.body1,
    color: colors.white,
    fontWeight: '500',
  },
});

export default MyFeedbacksScreen; 