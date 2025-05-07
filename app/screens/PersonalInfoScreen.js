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
import { colors, typography, spacing, borderRadius, components, layout } from '../theme/theme';
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
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [budgetRangeError, setBudgetRangeError] = useState('');
  const [preferences, setPreferences] = useState('');
  const [requirement, setRequirement] = useState('');
  const [lifeStyle, setLifeStyle] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [dobInput, setDobInput] = useState('');
  const [dobError, setDobError] = useState('');

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
    // Clear previous error
    setDobError('');
    
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = inputDate.match(datePattern);
    
    if (!match) {
      setDobError('Date format should be DD/MM/YYYY');
      return false;
    }
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    
    const date = new Date(year, month, day);
    const isValidDate = date.getDate() === day && 
                        date.getMonth() === month && 
                        date.getFullYear() === year;
    
    if (!isValidDate) {
      setDobError('Please enter a valid date');
      return false;
    }
    
    const today = new Date();
    const age = today.getFullYear() - year - 
               (today.getMonth() < month || 
               (today.getMonth() === month && today.getDate() < day) ? 1 : 0);
    
    if (age < 18) {
      setDobError('You must be at least 18 years old');
      return false;
    }
    
    if (date > today) {
      setDobError('Date of birth cannot be in the future');
      return false;
    }
    
    return true;
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
    
    if (value.length === 10) {
      if (validateDate(value)) {
        const [day, month, year] = value.split('/');
        setDob(`${year}-${month}-${day}`);
      }
    } else {
      setDob('');
    }
  };
  
  const validatePhoneNumber = (number) => {
    // Clear previous error
    setPhoneNumberError('');
    
    // Remove any non-numeric characters
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if the number is empty
    if (!cleanNumber) {
      setPhoneNumberError('Phone number is required');
      return false;
    }
    
    // Check if the number has at least 10 digits (common in most countries)
    if (cleanNumber.length < 10) {
      setPhoneNumberError('Phone number must have at least 10 digits');
      return false;
    }
    
    // Check if the number has a reasonable length (not too long)
    if (cleanNumber.length > 15) {
      setPhoneNumberError('Phone number is too long');
      return false;
    }
    
    return true;
  };
  
  const handlePhoneNumberChange = (text) => {
    // Allow only numbers, spaces, and common separators
    const formatted = text.replace(/[^\d\s+()-]/g, '');
    setPhoneNumber(formatted);
    
    // Validate while typing but only show errors after user stops typing
    validatePhoneNumber(formatted);
  };
  
  const validateBudgetRange = (budget) => {
    // Clear previous error
    setBudgetRangeError('');
    
    // Check if it's a single number
    const singleNumberPattern = /^(?:(?:\d{1,3}(?:,\d{3})+)|(?:\d+))(?:,\d{3})*$/;
    const rangePattern = /^(?:(?:\d{1,3}(?:,\d{3})+)|(?:\d+))(?:,\d{3})*-(?:(?:\d{1,3}(?:,\d{3})+)|(?:\d+))(?:,\d{3})*$/;
    
    // Remove commas for numerical processing
    const cleanBudget = budget.replace(/,/g, '');
    
    if (singleNumberPattern.test(budget)) {
      const value = parseInt(cleanBudget, 10);
      if (value < 1000000) {
        setBudgetRangeError('Budget should be at least 1,000,000');
        return false;
      }
      if (value > 50000000) {
        setBudgetRangeError('Budget seems too high');
        return false;
      }
      return true;
    } 
    else if (rangePattern.test(budget)) {
      const [minStr, maxStr] = cleanBudget.split('-');
      const min = parseInt(minStr, 10);
      const max = parseInt(maxStr, 10);
      
      if (min >= max) {
        setBudgetRangeError('Minimum budget must be less than maximum');
        return false;
      }
      
      if (min < 1000000) {
        setBudgetRangeError('Minimum budget should be at least 1,000,000');
        return false;
      }
      
      if (max > 50000000) {
        setBudgetRangeError('Maximum budget seems too high');
        return false;
      }
      
      return true;
    } 
    else {
      setBudgetRangeError('Please enter a single number or a range (min-max)');
      return false;
    }
  };
  
  const formatCurrency = (text) => {
    // Remove all non-digit characters except for the hyphen
    const cleanText = text.replace(/[^\d-]/g, '');
    
    // Split by hyphen to handle range format
    const parts = cleanText.split('-');
    
    if (parts.length > 2) {
      // Too many hyphens, keep only the first and second parts
      parts.splice(2);
    }
    
    // Format each part with commas
    const formattedParts = parts.map(part => {
      if (!part) return '';
      
      // Convert to number and format with commas
      return part.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    });
    
    // Join back with hyphen if it's a range
    return formattedParts.join('-');
  };
  
  const handleBudgetChange = (text) => {
    const formatted = formatCurrency(text);
    setBudgetRange(formatted);
    validateBudgetRange(formatted);
  };

  const handleNextStep = () => {
    // Validate current step
    let isValid = true;
    let errorMessage = '';

    switch (step) {
      case 1:
        // Validate date of birth
        if (!dob) {
          isValid = false;
          errorMessage = 'Please enter a valid date of birth';
          setDobError(errorMessage);
        } else if (!validateDate(dobInput)) {
          isValid = false;
          errorMessage = dobError;
        }
        
        // Validate phone number
        if (!validatePhoneNumber(phoneNumber)) {
          isValid = false;
          errorMessage = phoneNumberError || 'Please enter a valid phone number';
        }
        break;
        
      case 2:
        // Validate budget range
        if (!budgetRange) {
          isValid = false;
          errorMessage = 'Please enter your budget';
          setBudgetRangeError(errorMessage);
        } else if (!validateBudgetRange(budgetRange)) {
          isValid = false;
          errorMessage = budgetRangeError;
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
      
      // Remove commas from budget before sending to backend
      const cleanBudget = budgetRange ? budgetRange.replace(/,/g, '') : "0";
      
      const formValues = {
        Gender: gender,
        Dob: dob, 
        PhoneNumber: phoneNumber,
        BudgetRange: cleanBudget || "0",
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
      case 1: return "Thông tin cá nhân";
      case 2: return "Khoảng ngân sách";
      case 3: return "Sở thích của bạn";
      case 4: return "Yêu cầu";
      case 5: return "Phong cách sống";
      case 6: return "Khu vực ưa thích";
      case 7: return "Ảnh đại diện";
      default: return "";
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.inputWrapper}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={gender} onValueChange={setGender} style={styles.input}>
                  <Picker.Item label="Nam" value="Male" />
                  <Picker.Item label="Nữ" value="Female" />
                  <Picker.Item label="Khác" value="Other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày sinh</Text>
              <View style={styles.dateInputContainer}>
                <TextInput 
                  style={[styles.dateInput, dobError ? styles.inputError : null]} 
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
              {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput 
                style={[styles.input, phoneNumberError ? styles.inputError : null]} 
                value={phoneNumber} 
                onChangeText={setPhoneNumber} 
                keyboardType="numeric"
                placeholder="Nhập số điện thoại của bạn"
                placeholderTextColor="#888"
              />
              {phoneNumberError ? <Text style={styles.errorText}>{phoneNumberError}</Text> : null}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Khoảng ngân sách của bạn là bao nhiêu?</Text>
            <TextInput 
              style={[styles.input, budgetRangeError ? styles.inputError : null]} 
              value={budgetRange} 
              onChangeText={setBudgetRange}
              placeholder="Ví dụ: 500-1000"
              placeholderTextColor="#888"
              keyboardType="numeric"
            />
            {budgetRangeError ? <Text style={styles.errorText}>{budgetRangeError}</Text> : null}
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
            <Text style={styles.inputLabel}>Chọn ảnh đại diện của bạn</Text>
            {avatar ? (
              <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
                <TouchableOpacity style={styles.changeAvatarButton} onPress={handlePickAvatar}>
                  <Text style={styles.changeAvatarButtonText}>Thay đổi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.avatarButton} onPress={handlePickAvatar}>
                <Ionicons name="cloud-upload-outline" size={28} color="white" style={styles.uploadIcon} />
                <Text style={styles.avatarButtonText}>Chọn ảnh đại diện</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <LinearGradient 
      colors={[colors.primary, colors.primaryLight, colors.primaryLighter]} 
      style={styles.container}
    >
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
            <View style={[styles.cardHeader, { backgroundColor: colors.background.secondary }]}>
              {getStepIcon()}
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{getStepTitle()}</Text>
            </View>
            
            <View style={[styles.cardContent, { backgroundColor: colors.background.primary }]}>
              {renderStepContent()}
            </View>
            
            <View style={[styles.actionButtons, { backgroundColor: colors.background.secondary }]}>
              {step > 1 && (
                <TouchableOpacity 
                  onPress={handlePreviousStep} 
                  style={[styles.secondaryButton, { borderColor: colors.gray[300] }]}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.text.secondary }]}>Quay lại</Text>
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
                  {isSubmitting ? 'Đang xử lý...' : (step === 7 ? 'Hoàn thành' : 'Tiếp tục')}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <View style={styles.swipeHint}>
            <AntDesign name="swapleft" size={20} color={colors.white} />
            <Text style={styles.swipeHintText}>Vuốt để điều hướng</Text>
            <AntDesign name="swapright" size={20} color={colors.white} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.calendarModal, { backgroundColor: colors.background.primary }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.gray[200] }]}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Chọn ngày sinh</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={dob || new Date().toISOString().split('T')[0]}
              onDayPress={(day) => {
                setDob(day.dateString);
                setShowCalendar(false);
              }}
              markedDates={{
                [dob]: { selected: true, selectedColor: colors.primary, selectedTextColor: colors.white },
              }}
              maxDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: colors.background.primary,
                calendarBackground: colors.background.primary,
                textSectionTitleColor: colors.primary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.white,
                todayTextColor: colors.primary,
                dayTextColor: colors.text.primary,
                arrowColor: colors.primary,
              }}
            />
          </View>
        </View>
      </Modal>
      </View>
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
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
    backgroundColor: colors.white + '66', // 40% opacity
    margin: spacing.xs,
  },
  activeDot: {
    backgroundColor: colors.white,
    width: 12,
    height: 12,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    minHeight: 450,
  },
  cardHeader: {
    padding: spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  cardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  cardContent: {
    padding: spacing.xl,
    flex: 1,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  calendarButton: {
    backgroundColor: colors.background.tertiary,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    flex: 1,
    marginLeft: spacing.sm,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidthButton: {
    marginLeft: 0,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: spacing.sm,
    flex: 1,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  swipeHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    opacity: 0.8,
  },
  swipeHintText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    marginHorizontal: spacing.sm,
  },
  avatarButton: {
    width: '100%',
    height: 150,
    backgroundColor: colors.primary + '1A', // 10% opacity
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '4D', // 30% opacity
    borderStyle: 'dashed',
  },
  uploadIcon: {
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  avatarButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '500',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarPreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  changeAvatarButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
  },
  changeAvatarButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  calendarModal: {
    borderRadius: borderRadius.xl,
    width: '100%',
    padding: spacing.xl,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
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