import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';

const EditProfile = ({ navigation }) => {
  // State for active tab (User or Customer)
  const [activeTab, setActiveTab] = useState('user');
  
  // User section data
  const [userData, setUserData] = useState({
    userId: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    dob: new Date(),
    address: '',
    gender: 'Male',
    avatar: null
  });

  // Customer section data
  const [customerData, setCustomerData] = useState({
    customerId: '',
    preferences: '',
    lifeStyle: '',
    budgetRange: '',
    preferredLocation: '',
    requirement: '',
    customerType: 'Student'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Date picker state
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Customer type options
  const customerTypes = ['Student', 'Worker'];

  useEffect(() => {
    fetchProfileData();
  }, []);

  // When user data is loaded, update the date state
  useEffect(() => {
    if (userData.dob) {
      setSelectedYear(userData.dob.getFullYear());
      setSelectedMonth(userData.dob.getMonth() + 1);
      setSelectedDay(userData.dob.getDate());
    }
  }, [userData.dob]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const result = await authService.getInforProfile();
      
      if (result.isSuccess && result.data) {
        // Set user data
        const user = result.data.user;
        setUserData({
          userId: user.userId || '',
          email: user.email || '',
          fullName: user.fullName || '',
          phoneNumber: user.phoneNumber || '',
          dob: user.dob ? new Date(user.dob) : new Date(),
          address: user.address || '',
          gender: user.gender || 'Male',
          avatar: user.avatar || null
        });

        // Set customer data
        const customer = result.data.customer;
        if (customer) {
          setCustomerData({
            customerId: customer.customerId || '',
            preferences: customer.preferences || '',
            lifeStyle: customer.lifeStyle || '',
            budgetRange: customer.budgetRange || '',
            preferredLocation: customer.preferredLocation || '',
            requirement: customer.requirement || '',
            customerType: customer.customerType || 'Student'
          });
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDataChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomerDataChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  // Format date for display and API
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const confirmDate = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    handleUserDataChange('dob', newDate);
    setDateModalVisible(false);
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const goBack = () => {
    navigation.goBack();
  };

  const pickImage = async () => {
    try {
      setIsUploading(true);
      
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change your profile photo.');
        setIsUploading(false);
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        // Get the selected asset
        const selectedAsset = result.assets[0];
        
        // Update avatar in state
        handleUserDataChange('avatar', {
          uri: selectedAsset.uri,
          mimeType: 'image/jpeg' // Default to JPEG, can be more specific if needed
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const saveUserProfile = async () => {
    setIsSavingUser(true);
    try {
      // Prepare user data for API
      const userUpdateData = {
        FullName: userData.fullName,
        PhoneNumber: userData.phoneNumber,
        Address: userData.address,
        Gender: userData.gender,
        Dob: userData.dob,
        Avatar: userData.avatar
      };

      // Call the API to update user profile
      const result = await authService.updateUserProfile(userUpdateData);
      
      if (result.isSuccess) {
        Alert.alert('Success', 'Personal information updated successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to update personal information');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating personal information');
    } finally {
      setIsSavingUser(false);
    }
  };

  const saveCustomerProfile = async () => {
    setIsSavingCustomer(true);
    try {
      // Prepare customer data for API
      const customerUpdateData = {
        Preferences: customerData.preferences,
        LifeStyle: customerData.lifeStyle,
        BudgetRange: customerData.budgetRange,
        PreferredLocation: customerData.preferredLocation,
        Requirement: customerData.requirement,
        CustomerType: customerData.customerType
      };

      // Call the API to update customer details
      const result = await authService.updateCustomerDetails(customerUpdateData);
      
      if (result.isSuccess) {
        Alert.alert('Success', 'Preferences updated successfully');
      } else {
        Alert.alert('Error', result.message || 'Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating customer details:', error);
      Alert.alert('Error', 'An unexpected error occurred while updating preferences');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4267B2" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Generate date picker data
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={dateModalVisible}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date of Birth</Text>
            
            <View style={styles.datePickerContainer}>
              {/* Day Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Day</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {days.map((d) => (
                    <TouchableOpacity 
                      key={`day-${d}`}
                      style={[
                        styles.datePickerItem,
                        d === selectedDay && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        d === selectedDay && styles.datePickerItemTextSelected
                      ]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Month Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Month</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {months.map((m) => (
                    <TouchableOpacity 
                      key={`month-${m}`}
                      style={[
                        styles.datePickerItem,
                        m === selectedMonth && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedMonth(m)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        m === selectedMonth && styles.datePickerItemTextSelected
                      ]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.datePickerColumn}>
                <Text style={styles.datePickerLabel}>Year</Text>
                <ScrollView style={styles.datePickerScroll}>
                  {years.map((y) => (
                    <TouchableOpacity 
                      key={`year-${y}`}
                      style={[
                        styles.datePickerItem,
                        y === selectedYear && styles.datePickerItemSelected
                      ]}
                      onPress={() => setSelectedYear(y)}
                    >
                      <Text style={[
                        styles.datePickerItemText,
                        y === selectedYear && styles.datePickerItemTextSelected
                      ]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]} 
                onPress={confirmDate}
              >
                <Text style={styles.modalConfirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {userData.avatar ? (
                <Image 
                  source={{ uri: typeof userData.avatar === 'object' ? userData.avatar.uri : userData.avatar }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.placeholderAvatar]}>
                  <Icon name="person" size={60} color="#ccc" />
                </View>
              )}
              {isUploading && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage} disabled={isUploading}>
              <Icon name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.fullName || 'Your Name'}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'user' && styles.activeTab]} 
            onPress={() => setActiveTab('user')}
          >
            <Icon 
              name="person" 
              size={20} 
              color={activeTab === 'user' ? '#4267B2' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'user' && styles.activeTabText]}>
              Personal Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'customer' && styles.activeTab]} 
            onPress={() => setActiveTab('customer')}
          >
            <Icon 
              name="settings" 
              size={20} 
              color={activeTab === 'customer' ? '#4267B2' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'customer' && styles.activeTabText]}>
              Preferences
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* USER SECTION */}
        {activeTab === 'user' && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.fullName}
                  onChangeText={(text) => handleUserDataChange('fullName', text)}
                  placeholder="Enter your full name"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon name="email" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={userData.email}
                  editable={false}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.phoneNumber}
                  onChangeText={(text) => handleUserDataChange('phoneNumber', text)}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setDateModalVisible(true)}
              >
                <Icon name="cake" size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.dateText}>{formatDate(userData.dob)}</Text>
                <Icon name="arrow-drop-down" size={24} color="#555" style={styles.dropdownIcon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <View style={styles.inputContainer}>
                <Icon name="location-on" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={userData.address || ''}
                  onChangeText={(text) => handleUserDataChange('address', text)}
                  placeholder="Enter your address"
                  multiline
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity 
                  style={styles.radioOption} 
                  onPress={() => handleUserDataChange('gender', 'Male')}
                >
                  <View style={styles.radioButton}>
                    {userData.gender === 'Male' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption} 
                  onPress={() => handleUserDataChange('gender', 'Female')}
                >
                  <View style={styles.radioButton}>
                    {userData.gender === 'Female' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Female</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.radioOption} 
                  onPress={() => handleUserDataChange('gender', 'Other')}
                >
                  <View style={styles.radioButton}>
                    {userData.gender === 'Other' && <View style={styles.radioButtonSelected} />}
                  </View>
                  <Text style={styles.radioLabel}>Other</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Save User Profile Button */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveUserProfile}
              disabled={isSavingUser}
            >
              {isSavingUser ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>Save Personal Information</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* CUSTOMER SECTION */}
        {activeTab === 'customer' && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
  <Text style={styles.inputLabel}>Customer Type</Text>
  <View style={styles.buttonPickerContainer}>
    {customerTypes.map((type) => (
      <TouchableOpacity
        key={type}
        style={[
          styles.typeButton,
          customerData.customerType === type && styles.typeButtonSelected
        ]}
        onPress={() => handleCustomerDataChange('customerType', type)}
      >
        <Text style={[
          styles.typeButtonText,
          customerData.customerType === type && styles.typeButtonTextSelected
        ]}>
          {type}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Budget Range</Text>
              <View style={styles.inputContainer}>
                <Icon name="attach-money" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={customerData.budgetRange}
                  onChangeText={(text) => handleCustomerDataChange('budgetRange', text)}
                  placeholder="Enter your budget range"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Location</Text>
              <View style={styles.inputContainer}>
                <Icon name="place" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={customerData.preferredLocation}
                  onChangeText={(text) => handleCustomerDataChange('preferredLocation', text)}
                  placeholder="Enter your preferred location"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lifestyle</Text>
              <View style={styles.inputContainer}>
                <Icon name="local-activity" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={customerData.lifeStyle}
                  onChangeText={(text) => handleCustomerDataChange('lifeStyle', text)}
                  placeholder="Describe your lifestyle"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferences</Text>
              <View style={styles.textAreaContainer}>
                <Icon name="favorite" size={20} color="#999" style={styles.textAreaIcon} />
                <TextInput
                  style={styles.textArea}
                  value={customerData.preferences}
                  onChangeText={(text) => handleCustomerDataChange('preferences', text)}
                  placeholder="Describe your preferences"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Requirements</Text>
              <View style={styles.textAreaContainer}>
                <Icon name="list-alt" size={20} color="#999" style={styles.textAreaIcon} />
                <TextInput
                  style={styles.textArea}
                  value={customerData.requirement}
                  onChangeText={(text) => handleCustomerDataChange('requirement', text)}
                  placeholder="Describe your requirements"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            {/* Save Customer Profile Button */}
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveCustomerProfile}
              disabled={isSavingCustomer}
            >
              {isSavingCustomer ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4267B2', fontWeight: '500' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#00A67E', paddingVertical: 16, paddingHorizontal: 16, elevation: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  backButton: { padding: 8 },
  headerRightPlaceholder: { width: 40 },
  contentContainer: { paddingBottom: 24 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', marginBottom: 16 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#4267B2' },
  placeholderAvatar: { backgroundColor: '#e1e1e1', justifyContent: 'center', alignItems: 'center' },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  cameraIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4267B2', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#666' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#4267B2' },
  tabText: { marginLeft: 8, fontSize: 15, color: '#666', fontWeight: '500' },
  activeTabText: { color: '#4267B2', fontWeight: 'bold' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12, elevation: 2 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9fafb', overflow: 'hidden' },
  input: { flex: 1, paddingVertical: 12, paddingRight: 12, fontSize: 15, color: '#333' },
  inputIcon: { paddingHorizontal: 12 },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#888' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9fafb', paddingVertical: 12 },
  dateText: { flex: 1, fontSize: 15, color: '#333' },
  dropdownIcon: { marginRight: 12 },
  radioContainer: { flexDirection: 'row', marginTop: 8 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  radioButton: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#4267B2', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  radioButtonSelected: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#4267B2' },
  radioLabel: { fontSize: 15, color: '#333' },
  pickerContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9fafb', overflow: 'hidden' },
  picker: { flex: 1, height: 50 },
  pickerIcon: { paddingHorizontal: 12 },
  textAreaContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, backgroundColor: '#f9fafb', overflow: 'hidden' },
  textArea: { flex: 1, paddingVertical: 12, paddingRight: 12, fontSize: 15, color: '#333', minHeight: 100 },
  textAreaIcon: { paddingHorizontal: 12, paddingTop: 12 },
  saveButton: { flexDirection: 'row', backgroundColor: '#4267B2', marginTop: 16, padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonIcon: { marginRight: 8 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  datePickerContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  datePickerColumn: { flex: 1, alignItems: 'center' },
  datePickerLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#666' },
  datePickerScroll: { height: 150, width: '100%' },
  datePickerItem: { padding: 10, alignItems: 'center' },
  datePickerItemSelected: { backgroundColor: '#e7f3ff', borderRadius: 5 },
  datePickerItemText: { fontSize: 16, color: '#333' },
  datePickerItemTextSelected: { color: '#4267B2', fontWeight: 'bold' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6, flex: 1, marginHorizontal: 5 },
  modalCancelButton: { backgroundColor: '#f2f2f2' },
  modalCancelButtonText: { color: '#666', textAlign: 'center', fontWeight: '500' },
  modalConfirmButton: { backgroundColor: '#4267B2' },
  buttonPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  },
  typeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9fafb',
  },
  typeButtonSelected: {
    backgroundColor: '#4267B2',
    borderColor: '#4267B2',
  },
  typeButtonText: {
    fontSize: 15,
    color: '#333',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalConfirmButtonText: { color: '#fff', textAlign: 'center', fontWeight: '500' }
});

export default EditProfile;