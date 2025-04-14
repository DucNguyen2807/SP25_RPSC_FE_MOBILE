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
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

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
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>What are your preferences?</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={preferences} 
              onChangeText={setPreferences}
              placeholder="Tell us what you're looking for..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#888"
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>What are your requirements?</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={requirement} 
              onChangeText={setRequirement}
              placeholder="What features do you need?"
              multiline
              numberOfLines={4}
              placeholderTextColor="#888"
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Describe your lifestyle</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={lifeStyle} 
              onChangeText={setLifeStyle}
              placeholder="Tell us about your daily routines..."
              multiline
              numberOfLines={4}
              placeholderTextColor="#888"
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Where would you like to live?</Text>
            <TextInput 
              style={styles.input} 
              value={preferredLocation} 
              onChangeText={setPreferredLocation}
              placeholder="Enter preferred location"
              placeholderTextColor="#888"
            />
          </View>
        );
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
  }
});

export default PersonalInfoScreen;