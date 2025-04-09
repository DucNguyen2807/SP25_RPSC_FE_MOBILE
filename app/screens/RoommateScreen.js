import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, TextInput, Dimensions, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import postService from '../services/postService';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const RoommateScreen = () => {
  const navigation = useNavigation();
  const [roommates, setRoommates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    minBudget: null, maxBudget: null, gender: null, minAge: null, maxAge: null, lifeStyles: [],
  });

  const lifeStyleOptions = ['Yên tĩnh', 'Năng động', 'Sạch sẽ', 'Chăm chỉ', 'Thân thiện'];
  const themeColors = {
    primary: '#6D5BA3',
    secondary: '#6D5BA3',
    accent: '#6D5BA3',
    background: '#6D5BA3',
    cardBg: '#FFFFFF',
    text: '#1F2937',
    textLight: '#6B7280',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
  };
  
  useEffect(() => {
    fetchRoommatePosts();
  }, []);

  const fetchRoommatePosts = async () => {
    setLoading(true);
    setError('');
    
    try {
      const searchRequest = {
        pageNumber: 1,
        pageSize: 10,
        address: searchText || undefined,
        minBudget: filters.minBudget,
        maxBudget: filters.maxBudget,
        minAge: filters.minAge,
        maxAge: filters.maxAge,
        gender: filters.gender,
        lifeStyles: filters.lifeStyles.length > 0 ? filters.lifeStyles : undefined,
      };
  
      const result = await postService.getAllRoommatePosts(searchRequest);
      if (result.isSuccess && Array.isArray(result.posts.items)) {
        setRoommates(result.posts.items);
      } else {
        setError(result.message || 'No posts available');
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (type, value) => setFilters(prev => ({ ...prev, [type]: value }));
  
  const toggleLifeStyle = (style) => {
    setFilters(prev => ({
      ...prev,
      lifeStyles: prev.lifeStyles.includes(style)
        ? prev.lifeStyles.filter(item => item !== style)
        : [...prev.lifeStyles, style]
    }));
  };

  const filterOptions = [
    { id: 'price', icon: 'wallet', label: 'Budget', active: filters.minBudget || filters.maxBudget },
    { id: 'gender', icon: 'human-male-female', label: 'Gender', active: filters.gender },
    { id: 'age', icon: 'account-group', label: 'Age', active: filters.minAge || filters.maxAge },
    { id: 'lifestyle', icon: 'coffee', label: 'Lifestyle', active: filters.lifeStyles.length > 0 },
  ];

  const FilterInputRange = ({ label1, label2, value1, value2, onChange1, onChange2, placeholder1, placeholder2 }) => (
    <View style={styles.inputRow}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label1}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder1}
          keyboardType="numeric"
          value={value1 ? value1.toString() : ''}
          onChangeText={onChange1}
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label2}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder2}
          keyboardType="numeric"
          value={value2 ? value2.toString() : ''}
          onChangeText={onChange2}
        />
      </View>
    </View>
  );

  const renderFilterContent = () => {
    switch (activeFilter) {
      case 'price':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Budget Range</Text>
            <FilterInputRange 
              label1="Minimum" 
              label2="Maximum"
              value1={filters.minBudget}
              value2={filters.maxBudget}
              onChange1={(text) => handleFilterChange('minBudget', text ? parseFloat(text) : null)}
              onChange2={(text) => handleFilterChange('maxBudget', text ? parseFloat(text) : null)}
              placeholder1="0"
              placeholder2="10,000,000"
            />
          </View>
        );
      
      case 'gender':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gender</Text>
            <View style={styles.chipContainer}>
              {['Male', 'Female', 'Others'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[styles.chip, filters.gender === gender && styles.chipSelected]}
                  onPress={() => handleFilterChange('gender', gender)}
                >
                  <Text style={[styles.chipText, filters.gender === gender && styles.chipTextSelected]}>
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      case 'age':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Age Range</Text>
            <FilterInputRange 
              label1="From" 
              label2="To"
              value1={filters.minAge}
              value2={filters.maxAge}
              onChange1={(text) => handleFilterChange('minAge', text ? parseInt(text) : null)}
              onChange2={(text) => handleFilterChange('maxAge', text ? parseInt(text) : null)}
              placeholder1="18"
              placeholder2="65"
            />
          </View>
        );
      
      case 'lifestyle':
        return (
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lifestyle</Text>
            <View style={styles.chipContainer}>
              {lifeStyleOptions.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.chip, 
                    filters.lifeStyles.includes(style) && styles.chipSelected
                  ]}
                  onPress={() => toggleLifeStyle(style)}
                >
                  <Text 
                    style={[
                      styles.chipText, 
                      filters.lifeStyles.includes(style) && styles.chipTextSelected
                    ]}
                  >
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      
      default:
        return null;
    }
  };

  const renderRoommateCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RoommateDetail', { postId: item.postId })}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(249,250,251,1)']}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfoContainer}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.postOwnerInfo.avatar }} style={styles.avatar} />
              {item.status === 'Active' && <View style={styles.activeIndicator} />}
            </View>
            
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{item.postOwnerInfo.fullName}</Text>
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                </View>
              </View>
              
              <Text style={styles.userTitle}>{item.postOwnerInfo.postOwnerType}</Text>
              
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="account" size={12} color={themeColors.accent} />
                  <Text style={styles.badgeText}>{item.postOwnerInfo.gender}</Text>
                </View>
                <View style={styles.badge}>
                  <MaterialCommunityIcons name="cake-variant" size={12} color={themeColors.accent} />
                  <Text style={styles.badgeText}>{item.postOwnerInfo.age}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color={themeColors.accent} />
          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.priceContainer}>
          <MaterialCommunityIcons name="cash" size={18} color={themeColors.accent} />
          <Text style={styles.priceText}>
            {item.price.toLocaleString()} VND
          </Text>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.postOwnerInfo.lifeStyle && (
            <View style={styles.tag}>
              <MaterialCommunityIcons name="account-heart" size={12} color={themeColors.accent} style={styles.tagIcon} />
              <Text style={styles.tagText}>{item.postOwnerInfo.lifeStyle}</Text>
            </View>
          )}
          
          {item.postOwnerInfo.requirement && (
            <View style={styles.tag}>
              <MaterialCommunityIcons name="clipboard-list" size={12} color={themeColors.accent} style={styles.tagIcon} /> 
              <Text style={styles.tagText}>{item.postOwnerInfo.requirement}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.messageButton} 
          onPress={() => navigation.navigate('RoommateDetail', { postId: item.postId })}
        >
          <LinearGradient
            colors={[themeColors.primary, themeColors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <MaterialCommunityIcons name="eye" size={16} color="#FFF" />
            <Text style={styles.buttonText}>View Detail Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[themeColors.primary, themeColors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={20} color={themeColors.accent} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by location..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={fetchRoommatePosts}
            />
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell" size={22} color="#FFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map(filter => (
            <TouchableOpacity 
              key={filter.id}
              style={[
                styles.filterChip, 
                filter.active && styles.filterChipActive
              ]}
              onPress={() => {
                setActiveFilter(filter.id);
                setFilterModalVisible(true);
              }}
            >
              <MaterialCommunityIcons 
                name={filter.icon} 
                size={16} 
                color={filter.active ? "#FFF" : themeColors.accent} 
              />
              <Text style={[
                styles.filterChipText,
                filter.active && styles.filterChipTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={themeColors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={roommates}
          renderItem={renderRoommateCard}
          keyExtractor={item => item.postId}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group" size={80} color={themeColors.secondary} />
              <Text style={styles.emptyStateText}>No roommates found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your filters</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View 
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            {renderFilterContent()}
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={() => {
                  setFilters({
                    minBudget: null, maxBudget: null, gender: null, 
                    minAge: null, maxAge: null, lifeStyles: [],
                  });
                  setFilterModalVisible(false);
                  fetchRoommatePosts();
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={() => {
                  setFilterModalVisible(false);
                  fetchRoommatePosts();
                }}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', },
  header: { paddingTop: 50, paddingBottom: 18, paddingHorizontal: 18, },
  searchContainer: { flexDirection: 'row', alignItems: 'center', },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 5, },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1F2937', fontFamily: 'System', },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', },
  notificationBadge: { position: 'absolute', top: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF', },
  notificationBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', },
  filtersBar: { padding: 14, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 3, },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, marginHorizontal: 6, },
  filterChipActive: { backgroundColor: '#6366F1', },
  filterChipText: { color: '#4F46E5', fontSize: 14, fontWeight: '600', marginLeft: 8, fontFamily: 'System', },
  filterChipTextActive: { color: '#FFF', },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  errorText: { color: '#EF4444', fontSize: 16, fontFamily: 'System', },
  listContainer: { padding: 16, paddingBottom: 80, },
  card: { borderRadius: 20, overflow: 'hidden', marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, backgroundColor: '#FFF', },
  cardGradient: { padding: 18, },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', },
  userInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, },
  avatarWrapper: { position: 'relative', marginRight: 14, },
  avatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FFF', },
  activeIndicator: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFF', },
  userDetails: { flex: 1, },
  nameRow: { flexDirection: 'row', alignItems: 'center', },
  userName: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginRight: 8, fontFamily: 'System', },
  verifiedBadge: { backgroundColor: '#10B981', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', },
  userTitle: { fontSize: 14, color: '#6B7280', marginTop: 2, fontFamily: 'System', },
  badgeRow: { flexDirection: 'row', marginTop: 6, },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, marginRight: 8, },
  badgeText: { fontSize: 12, color: '#4F46E5', marginLeft: 4, fontFamily: 'System', },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14, },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  locationText: { fontSize: 14, color: '#6B7280', marginLeft: 6, flex: 1, fontFamily: 'System', },
  postTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 6, fontFamily: 'System', },
  postDescription: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12, fontFamily: 'System', },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start', },
  priceText: { fontSize: 16, fontWeight: '700', color: '#4F46E5', marginLeft: 6, fontFamily: 'System', },  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 10, },
  tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, marginRight: 8, marginBottom: 8, },
  tagIcon: { marginRight: 4, },
  tagText: { fontSize: 12, color: '#4F46E5', fontFamily: 'System', },
  messageButton: { marginTop: 6, },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '600', marginLeft: 8, fontFamily: 'System', },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', },
  modalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, },
  modalContent: { padding: 4, },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 18, fontFamily: 'System', },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', },
  inputGroup: { flex: 1, marginHorizontal: 6, },
  inputLabel: { fontSize: 14, color: '#6B7280', marginBottom: 8, fontFamily: 'System', },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#F9FAFB', },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#EEF2FF', margin: 6, },
  chipSelected: { backgroundColor: '#6366F1', },
  chipText: { color: '#4F46E5', fontSize: 14, fontFamily: 'System', },
  chipTextSelected: { color: '#FFF', },
  modalActions: { flexDirection: 'row', marginTop: 24, },
  resetButton: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#6366F1', borderRadius: 12, marginRight: 8, },
  resetButtonText: { color: '#6366F1', fontSize: 16, fontWeight: '600', fontFamily: 'System', },
  applyButton: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366F1', borderRadius: 12, marginLeft: 8, },
  applyButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', fontFamily: 'System', },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16, fontFamily: 'System', },
  emptyStateSubtext: { fontSize: 14, color: '#6B7280', marginTop: 8, fontFamily: 'System', },
});

export default RoommateScreen;