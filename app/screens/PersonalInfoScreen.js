import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert, 
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
const { width, height } = Dimensions.get('window');

// Multi-select component for preferences, requirements, and lifestyle
const MultiSelect = ({ 
  options, 
  selectedValues, 
  onSelectionChange, 
  title, 
  placeholder 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localSelection, setLocalSelection] = useState([]);

  useEffect(() => {
    // Initialize local selection from props
    if (selectedValues) {
      setLocalSelection(selectedValues.split(', ').filter(item => item !== ''));
    } else {
      setLocalSelection([]);
    }
  }, [selectedValues]);

  const toggleOption = (option) => {
    let newSelection = [...localSelection];
    
    if (newSelection.includes(option)) {
      // Remove option if already selected
      newSelection = newSelection.filter(item => item !== option);
    } else {
      // Add option if not already selected
      newSelection.push(option);
    }
    
    setLocalSelection(newSelection);
  };

  const handleConfirm = () => {
    // Join selected options with comma and space
    onSelectionChange(localSelection.join(', '));
    setIsModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.selectButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={[
          styles.selectButtonText,
          (!selectedValues || selectedValues.length === 0) && styles.placeholderText
        ]}>
          {selectedValues && selectedValues.length > 0 
            ? selectedValues 
            : placeholder || "Select options"}
        </Text>
        <Ionicons name="chevron-down" size={24} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    localSelection.includes(option) && styles.selectedOption
                  ]}
                  onPress={() => toggleOption(option)}
                >
                  <Text style={[
                    styles.optionText,
                    localSelection.includes(option) && styles.selectedOptionText
                  ]}>
                    {option}
                  </Text>
                  {localSelection.includes(option) && (
                    <Ionicons name="checkmark" size={22} color="#1E88E5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  // Using regular Animated instead of Reanimated
  const slideAnim = useState(new Animated.Value(0))[0];
  
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('Other');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [preferences, setPreferences] = useState('');
  const [requirement, setRequirement] = useState('');
  const [lifeStyle, setLifeStyle] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dobInput, setDobInput] = useState('');

  // For date validation
  useEffect(() => {
    if (dob) {
      setDobInput(formatDate(dob));
    }
  }, [dob]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const validateDate = (inputDate) => {
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = inputDate.match(datePattern);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    
    const date = new Date(year, month, day);
    const isValidDate = date.getDate() === day && 
                         date.getMonth() === month && 
                         date.getFullYear() === year;
    
    if (!isValidDate) return false;
    
    const today = new Date();
    return date <= today;
  };

  const handleDobInputChange = (text) => {
    const formatted = text.replace(/[^0-9\/]/g, '');
    
    let value = formatted;
    if (formatted.length === 2 && dobInput.length === 1) {
      value = formatted + '/';
    } else if (formatted.length === 5 && dobInput.length === 4) {
      value = formatted + '/';
    }
    
    setDobInput(value);
    
    if (validateDate(value)) {
      const [day, month, year] = value.split('/');
      setDob(`${year}-${month}-${day}`);
    }
  };

  const handleNextStep = () => {
    // Validate current step
    let isValid = true;
    let errorMessage = '';

    switch (step) {
      case 2:
        if (!dob) {
          isValid = false;
          errorMessage = 'Please enter a valid date of birth';
        }
        break;
      case 3:
        if (!phoneNumber || phoneNumber.length < 10) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number';
        }
        break;
    }

    if (!isValid) {
      Alert.alert('Validation Error', errorMessage);
      return;
    }

    // Animate card slide out
    Animated.timing(slideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      if (step === 7) {
        handleUpdateProfile();
      } else {
        slideAnim.setValue(width);
        setStep(step + 1);
        
        // Animate card slide in from right
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      }
    });
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      // Animate card slide out
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        slideAnim.setValue(-width);
        setStep(step - 1);
        
        // Animate card slide in from left
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start();
      });
    }
  };

 // Update these functions with improved styling
const renderPreferencesDropdown = () => {
  const preferencesOptions = [
    "Không gian yên tĩnh",
    "Gần trung tâm thành phố",
    "Khu vực làm việc riêng",
    "View đẹp",
    "Không gian xanh",
    "Tiện ích hiện đại",
    "Khác"
  ];

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.stepTitle}>Your Preferences</Text>
      <Text style={styles.stepDescription}>Select the features that matter most to you in your living space</Text>
      
      <MultiSelect
        options={preferencesOptions}
        selectedValues={preferences}
        onSelectionChange={setPreferences}
        title="Chọn sở thích của bạn"
        placeholder="Tap to select preferences"
      />
      
      {preferences && preferences.length > 0 && (
        <View style={styles.selectedOptionsDisplay}>
          <Text style={styles.selectedOptionsText}>
            <Text style={styles.selectedOptionsLabel}>Selected: </Text>
            {preferences}
          </Text>
        </View>
      )}
    </View>
  );
};

const renderRequirementDropdown = () => {
  const requirementOptions = [
    "Chỗ để xe",
    "Ban công",
    "Hồ bơi",
    "Phòng gym",
    "An ninh 24/7",
    "Cho phép nuôi thú cưng",
    "Khác"
  ];

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.stepTitle}>Requirements</Text>
      <Text style={styles.stepDescription}>What features are must-haves for your new place?</Text>
      
      <MultiSelect
        options={requirementOptions}
        selectedValues={requirement}
        onSelectionChange={setRequirement}
        title="Chọn yêu cầu của bạn"
        placeholder="Tap to select requirements"
      />
      
      {requirement && requirement.length > 0 && (
        <View style={styles.selectedOptionsDisplay}>
          <Text style={styles.selectedOptionsText}>
            <Text style={styles.selectedOptionsLabel}>Selected: </Text>
            {requirement}
          </Text>
        </View>
      )}
    </View>
  );
};

const renderLifestyleDropdown = () => {
  const lifestyleOptions = [
    "Năng động",
    "Thích hoạt động cộng đồng",
    "Thích sự yên tĩnh",
    "Thích làm việc tại nhà",
    "Thường xuyên đi công tác",
    "Gia đình có trẻ nhỏ",
    "Thích nuôi thú cưng",
    "Thích nấu ăn",
    "Khác"
  ];

  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.stepTitle}>Lifestyle</Text>
      <Text style={styles.stepDescription}>Tell us about your lifestyle to help find your perfect match</Text>
      
      <MultiSelect
        options={lifestyleOptions}
        selectedValues={lifeStyle}
        onSelectionChange={setLifeStyle}
        title="Chọn phong cách sống của bạn"
        placeholder="Tap to select lifestyle options"
      />
      
      {lifeStyle && lifeStyle.length > 0 && (
        <View style={styles.selectedOptionsDisplay}>
          <Text style={styles.selectedOptionsText}>
            <Text style={styles.selectedOptionsLabel}>Selected: </Text>
            {lifeStyle}
          </Text>
        </View>
      )}
    </View>
  );
};

  const renderPreferredLocationDropdown = () => {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Khu vực ưa thích</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={preferredLocation}
            onValueChange={setPreferredLocation}
            style={styles.input}
          >
            <Picker.Item label="Chọn khu vực ưa thích" value="" />
            <Picker.Item label="An Khánh" value="An Khánh" />
            <Picker.Item label="An Lợi Đông" value="An Lợi Đông" />
            <Picker.Item label="An Phú" value="An Phú" />
            <Picker.Item label="Bình Chiểu" value="Bình Chiểu" />
            <Picker.Item label="Bình Thọ" value="Bình Thọ" />
            <Picker.Item label="Cát Lái" value="Cát Lái" />
            <Picker.Item label="Hiệp Bình Chánh" value="Hiệp Bình Chánh" />
            <Picker.Item label="Hiệp Bình Phước" value="Hiệp Bình Phước" />
            <Picker.Item label="Hiệp Phú" value="Hiệp Phú" />
            <Picker.Item label="Linh Chiểu" value="Linh Chiểu" />
            <Picker.Item label="Linh Đông" value="Linh Đông" />
            <Picker.Item label="Linh Tây" value="Linh Tây" />
            <Picker.Item label="Linh Trung" value="Linh Trung" />
            <Picker.Item label="Linh Xuân" value="Linh Xuân" />
            <Picker.Item label="Long Bình" value="Long Bình" />
            <Picker.Item label="Long Phước" value="Long Phước" />
            <Picker.Item label="Long Thạnh Mỹ" value="Long Thạnh Mỹ" />
            <Picker.Item label="Long Trường" value="Long Trường" />
            <Picker.Item label="Phú Hữu" value="Phú Hữu" />
            <Picker.Item label="Phước Bình" value="Phước Bình" />
            <Picker.Item label="Phước Long A" value="Phước Long A" />
            <Picker.Item label="Phước Long B" value="Phước Long B" />
            <Picker.Item label="Tân Phú" value="Tân Phú" />
            <Picker.Item label="Tam Bình" value="Tam Bình" />
            <Picker.Item label="Tam Phú" value="Tam Phú" />
            <Picker.Item label="Tăng Nhơn Phú A" value="Tăng Nhơn Phú A" />
            <Picker.Item label="Tăng Nhơn Phú B" value="Tăng Nhơn Phú B" />
            <Picker.Item label="Thảo Điền" value="Thảo Điền" />
            <Picker.Item label="Thạnh Mỹ Lợi" value="Thạnh Mỹ Lợi" />
            <Picker.Item label="Thủ Thiêm" value="Thủ Thiêm" />
            <Picker.Item label="Trường Thạnh" value="Trường Thạnh" />
            <Picker.Item label="Trường Thọ" value="Trường Thọ" />
          </Picker>
        </View>
      </View>
    );
  };

  const handleUpdateProfile = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!dob) {
        Alert.alert('Error', 'Date of birth is required');
        setIsSubmitting(false);
        return;
      }
      
      if (!phoneNumber) {
        Alert.alert('Error', 'Phone number is required');
        setIsSubmitting(false);
        return;
      }
      
      const formValues = {
        Gender: gender,
        Dob: dob, 
        PhoneNumber: phoneNumber,
        BudgetRange: budgetRange || "0-0",
        Preferences: preferences || "",
        Requirement: requirement || "",
        LifeStyle: lifeStyle || "",
        PreferredLocation: preferredLocation || "",
        Avatar: avatar
      };
      
      console.log('Sending data to update profile:', formValues);
      
      const result = await authService.updateCustomerProfile(formValues, email);
      
      if (result.isSuccess) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.replace('Login') }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An error occurred while updating your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickAvatar = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload an avatar.');
          return;
        }
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1: return <FontAwesome5 name="id-card" size={36} color="#1E88E5" />;
      case 2: return <Feather name="dollar-sign" size={36} color="#1E88E5" />;
      case 3: return <Ionicons name="heart" size={36} color="#1E88E5" />;
      case 4: return <Ionicons name="list" size={36} color="#1E88E5" />;
      case 5: return <Ionicons name="home" size={36} color="#1E88E5" />;
      case 6: return <Ionicons name="location" size={36} color="#1E88E5" />;
      case 7: return <Ionicons name="image" size={36} color="#1E88E5" />;
      default: return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Personal Details";
      case 2: return "Budget Range";
      case 3: return "Your Preferences";
      case 4: return "Requirements";
      case 5: return "Lifestyle";
      case 6: return "Preferred Location";
      case 7: return "Your Profile Picture";
      default: return "";
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.inputWrapper}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={gender} onValueChange={setGender} style={styles.input}>
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <View style={styles.dateInputContainer}>
                <TextInput 
                  style={styles.dateInput} 
                  value={dobInput} 
                  onChangeText={handleDobInputChange} 
                  placeholder="DD/MM/YYYY"
                  keyboardType="numeric"
                  maxLength={10}
                  placeholderTextColor="#888"
                />
                <TouchableOpacity 
                  style={styles.calendarButton}
                  onPress={() => setShowCalendar(true)}
                >
                  <Ionicons name="calendar" size={24} color="#1E88E5" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput 
                style={styles.input} 
                value={phoneNumber} 
                onChangeText={setPhoneNumber} 
                keyboardType="numeric"
                placeholder="Enter your phone number"
                placeholderTextColor="#888"
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>What's your budget range?</Text>
            <TextInput 
              style={styles.input} 
              value={budgetRange} 
              onChangeText={setBudgetRange}
              placeholder="e.g., 500-1000"
              placeholderTextColor="#888"
            />
          </View>
        );
        case 3:
          return renderPreferencesDropdown();
        case 4:
          return renderRequirementDropdown();
        case 5:
          return renderLifestyleDropdown();
        case 6:
          return renderPreferredLocationDropdown();
      case 7:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Choose your profile picture</Text>
            {avatar ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
                <TouchableOpacity style={styles.changeAvatarButton} onPress={handlePickAvatar}>
                  <Text style={styles.changeAvatarButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
                <Ionicons name="cloud-upload-outline" size={28} color="white" style={styles.uploadIcon} />
                <Text style={styles.avatarButtonText}>Select Avatar</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={['#1E88E5', '#42A5F5', '#64B5F6']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <View 
                  key={i} 
                  style={[
                    styles.progressDot, 
                    i <= step ? styles.activeDot : {}
                  ]} 
                />
              ))}
            </View>
          </View>
          
          <Animated.View 
            style={[
              styles.card, 
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.cardHeader}>
              {getStepIcon()}
              <Text style={styles.cardTitle}>{getStepTitle()}</Text>
            </View>
            
            <View style={styles.cardContent}>
              {renderStepContent()}
            </View>
            
            <View style={styles.actionButtons}>
              {step > 1 && (
                <TouchableOpacity 
                  onPress={handlePreviousStep} 
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={handleNextStep} 
                style={[
                  styles.primaryButton,
                  step === 1 && styles.fullWidthButton
                ]}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? 'Processing...' : (step === 7 ? 'Finish' : 'Continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <View style={styles.swipeHint}>
            <AntDesign name="swapleft" size={20} color="white" />
            <Text style={styles.swipeHintText}>Swipe to navigate</Text>
            <AntDesign name="swapright" size={20} color="white" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <Calendar
              current={dob || new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                setDob(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [dob]: { selected: true, selectedColor: '#1E88E5', selectedTextColor: 'white' },
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#1E88E5',
                selectedDayBackgroundColor: '#1E88E5',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#1E88E5',
                dayTextColor: '#333333',
                arrowColor: '#1E88E5',
              }}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};
const additionalStyles = {
  // Enhanced styling for the MultiSelect component
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  selectedOptionsDisplay: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  selectedOptionsText: {
    color: '#1E88E5',
    fontSize: 14,
    lineHeight: 20,
  },
  selectedOptionsLabel: {
    fontWeight: '600',
  },
  // Make the MultiSelect button more appealing
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.3)',
  },
  // Enhance the modal appearance
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    maxHeight: height * 0.7,
    padding: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  // Enhance the option items
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
  },
  // Add more attractive buttons in the footer
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  confirmButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    margin: 5,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 12,
    height: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    minHeight: 450,
  },
  cardHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#f9f9f9',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  inputWrapper: {
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  calendarButton: {
    backgroundColor: '#f5f5f5',
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthButton: {
    marginLeft: 0,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginRight: 10,
    flex: 1,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    opacity: 0.8,
  },
  swipeHintText: {
    color: 'white',
    fontSize: 14,
    marginHorizontal: 10,
  },
  avatarButton: {
    width: '100%',
    height: 150,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(30, 136, 229, 0.3)',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    marginBottom: 10,
    color: '#1E88E5',
  },
  avatarButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '500',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#1E88E5',
  },
  changeAvatarButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  changeAvatarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    width: '100%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  stepTitle: additionalStyles.stepTitle,
  stepDescription: additionalStyles.stepDescription,
  selectedOptionsDisplay: additionalStyles.selectedOptionsDisplay,
  selectedOptionsText: additionalStyles.selectedOptionsText,
  selectedOptionsLabel: additionalStyles.selectedOptionsLabel,
  selectButton: additionalStyles.selectButton,
  modalContent: additionalStyles.modalContent,
  modalHeader: additionalStyles.modalHeader,
  modalTitle: additionalStyles.modalTitle,
  optionItem: additionalStyles.optionItem,
  selectedOption: additionalStyles.selectedOption,
  modalFooter: additionalStyles.modalFooter,
  confirmButton: additionalStyles.confirmButton,
  confirmButtonText: additionalStyles.confirmButtonText,
});

export default PersonalInfoScreen;