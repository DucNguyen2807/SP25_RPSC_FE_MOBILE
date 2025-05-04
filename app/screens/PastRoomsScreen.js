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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import pastRoomService from '../services/pastRoomService';
import { colors, typography, spacing, borderRadius, components, layout } from '../theme/theme';
import { API_BASE_URL } from '../constants/config';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const PastRoomsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'roommates'
  const [pastRooms, setPastRooms] = useState([]);
  const [pastRoommates, setPastRoommates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 5,
    description: '',
    images: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPastRooms = async () => {
    try {
      setLoading(true);
      const response = await pastRoomService.getPastRooms(token);
      if (response.isSuccess && response.data) {
        setPastRooms(response.data);
      } else {
        console.error('API Error:', response.message || 'No data returned');
        setPastRooms([]);
      }
    } catch (error) {
      console.error('Error fetching past rooms:', error);
      setPastRooms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPastRoommates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/get-past-roommates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });
      const data = await response.json();
      if (data.isSuccess && data.data) {
        setPastRoommates(data.data);
      } else {
        console.error('API Error:', data.message || 'No roommates data returned');
        setPastRoommates([]);
      }
    } catch (error) {
      console.error('Error fetching past roommates:', error);
      setPastRoommates([]);
    }
  };

  useEffect(() => {
    fetchPastRooms();
    fetchPastRoommates();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'rooms') {
      fetchPastRooms();
    } else {
      fetchPastRoommates();
    }
  };

  const handleRoomPress = (room) => {
    if (!room?.roomId) {
      console.error('Room ID is missing:', room);
      return;
    }
    console.log('Navigating to room detail with ID:', room.roomId);
    navigation.navigate('PastRoomDetail', { roomId: room.roomId });
  };

  const handleRoommatePress = (roommate) => {
    setSelectedRoommate(roommate);
    setShowFeedbackModal(true);
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setFeedback(prev => ({
          ...prev,
          images: [...prev.images, result.assets[0]]
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!feedback.description.trim()) {
        Alert.alert('Error', 'Please enter your feedback');
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('RevieweeId', selectedRoommate.userId);
      formData.append('Description', feedback.description);
      formData.append('Rating', feedback.rating.toString());

      feedback.images.forEach((image, index) => {
        const imageUri = image.uri;
        const imageName = imageUri.split('/').pop();
        const imageType = 'image/jpeg';

        formData.append('Images', {
          uri: imageUri,
          name: imageName,
          type: imageType,
        });
      });

      const response = await fetch(`${API_BASE_URL}/feedback/create-feedback-roommate`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();

      if (data.isSuccess) {
        Alert.alert('Success', 'Feedback submitted successfully');
        setShowFeedbackModal(false);
        setFeedback({
          rating: 5,
          description: '',
          images: [],
        });
      } else {
        throw new Error(data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoommateCard = (roommate) => (
    <TouchableOpacity
      key={roommate.customerId}
      style={styles.roommateCard}
      onPress={() => handleRoommatePress(roommate)}
    >
      <Image
        source={{ uri: roommate.avatarUrl }}
        style={styles.roommateAvatar}
      />
      <View style={styles.roommateInfo}>
        <Text style={styles.roommateName}>{roommate.fullName}</Text>
        <Text style={styles.roommateContact}>{roommate.phoneNumber}</Text>
        <Text style={styles.roommateEmail}>{roommate.email}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  const renderFeedbackModal = () => (
    <Modal
      visible={showFeedbackModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowFeedbackModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Đánh giá người ở ghép</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {selectedRoommate && (
              <View style={styles.selectedRoommateInfo}>
                <Image
                  source={{ uri: selectedRoommate.avatarUrl }}
                  style={styles.modalRoommateAvatar}
                />
                <Text style={styles.modalRoommateName}>{selectedRoommate.fullName}</Text>
              </View>
            )}

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Đánh giá</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  >
                    <FontAwesome
                      name={star <= feedback.rating ? 'star' : 'star-o'}
                      size={30}
                      color={star <= feedback.rating ? '#FFD700' : colors.text.secondary}
                      style={styles.starIcon}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nhận xét</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={4}
                placeholder="Nhập nhận xét của bạn..."
                value={feedback.description}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, description: text }))}
              />
            </View>

            <View style={styles.imagesContainer}>
              <Text style={styles.imagesLabel}>Hình ảnh</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesList}>
                {feedback.images.map((image, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setFeedback(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }))}
                    >
                      <MaterialIcons name="close" size={20} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addImageButton} onPress={handleImagePick}>
                  <MaterialIcons name="add-photo-alternate" size={24} color={colors.primary} />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Lịch sử thuê phòng</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
            Phòng đã thuê
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'roommates' && styles.activeTab]}
          onPress={() => setActiveTab('roommates')}
        >
          <Text style={[styles.tabText, activeTab === 'roommates' && styles.activeTabText]}>
            Người từng ở ghép
          </Text>
        </TouchableOpacity>
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
        {activeTab === 'rooms' ? (
          // Past Rooms Content
          pastRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="home" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>Bạn chưa có phòng đã thuê</Text>
            </View>
          ) : (
            pastRooms.map((room) => (
              <TouchableOpacity
                key={room.roomId}
                style={styles.roomCard}
                onPress={() => handleRoomPress(room)}
              >
                <Image
                  source={{ uri: room.images?.[0] }}
                  style={styles.roomImage}
                />
                <View style={styles.roomInfo}>
                  {/* <Text style={styles.roomTitle} numberOfLines={1}>
                    {room.title}
                  </Text> */}
                  <Text style={styles.roomAddress} numberOfLines={1}>
                    {room.address}
                  </Text>
                  <View style={styles.roomDetails}>
                    <Text style={styles.roomType}>{room.roomTypeName}</Text>
                    <Text style={styles.roomNumber}>Phòng {room.roomNumber}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )
        ) : (
          // Past Roommates Content
          pastRoommates.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people" size={64} color={colors.gray[400]} />
              <Text style={styles.emptyText}>Bạn chưa có người từng ở ghép</Text>
            </View>
          ) : (
            pastRoommates.map(renderRoommateCard)
          )
        )}
      </ScrollView>
      {renderFeedbackModal()}
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
    backgroundColor: colors.background.primary,
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
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    textAlign: 'center',
    fontSize: typography.body2,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
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
  roomCard: {
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roomImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  roomInfo: {
    padding: spacing.md,
  },
  roomTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roomAddress: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomType: {
    fontSize: typography.body2,
    color: colors.primary,
    fontWeight: '500',
  },
  roomNumber: {
    fontSize: typography.body2,
    color: colors.text.secondary,
  },
  roommateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  roommateAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
  },
  roommateInfo: {
    flex: 1,
  },
  roommateName: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roommateContact: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  roommateEmail: {
    fontSize: typography.body2,
    color: colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  selectedRoommateInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalRoommateAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.sm,
  },
  modalRoommateName: {
    fontSize: typography.h6,
    fontWeight: '600',
    color: colors.text.primary,
  },
  ratingContainer: {
    marginBottom: spacing.lg,
  },
  ratingLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  starIcon: {
    marginHorizontal: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagesContainer: {
    marginBottom: spacing.lg,
  },
  imagesLabel: {
    fontSize: typography.body2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  imagesList: {
    flexDirection: 'row',
  },
  imagePreviewContainer: {
    marginRight: spacing.sm,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: typography.body1,
    fontWeight: '600',
  },
});

export default PastRoomsScreen; 