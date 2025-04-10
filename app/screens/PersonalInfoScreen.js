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
  Modal
} from 'react-native';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import authService from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const PersonalInfoScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

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
    // Check if input follows DD/MM/YYYY pattern
    const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = inputDate.match(datePattern);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JS months are 0-based
    const year = parseInt(match[3], 10);
    
    // Create date and validate components
    const date = new Date(year, month, day);
    const isValidDate = date.getDate() === day && 
                         date.getMonth() === month && 
                         date.getFullYear() === year;
    
    if (!isValidDate) return false;
    
    // Check if date is not in the future
    const today = new Date();
    return date <= today;
  };

  const handleDobInputChange = (text) => {
    // Allow only numbers and slashes
    const formatted = text.replace(/[^0-9\/]/g, '');
    
    // Auto-add slashes for better UX
    let value = formatted;
    if (formatted.length === 2 && dobInput.length === 1) {
      value = formatted + '/';
    } else if (formatted.length === 5 && dobInput.length === 4) {
      value = formatted + '/';
    }
    
    setDobInput(value);
    
    // If input is complete and valid, update dob
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
      case 2: // Validating DOB
        if (!dob) {
          isValid = false;
          errorMessage = 'Please enter a valid date of birth';
        }
        break;
      case 3: // Validating phone number
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

    if (step === 9) {
      handleUpdateProfile();
    } else {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleUpdateProfile = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    try {
      setIsSubmitting(true);
      
      // Validate required fields
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
      
      // Create an object with the form values using the exact property names expected by the backend
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
      
      // Send request to backend
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
      // Request permissions first on iOS
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
        quality: 0.5, // Reduce quality for smaller file size
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Selected image:', result.assets[0]);
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const renderStepIcon = () => {
    switch (step) {
      case 1: return <Ionicons name="person" size={36} color="#6c63ff" />;
      case 2: return <Ionicons name="calendar" size={36} color="#6c63ff" />;
      case 3: return <Ionicons name="call" size={36} color="#6c63ff" />;
      case 4: return <MaterialIcons name="attach-money" size={36} color="#6c63ff" />;
      case 5: return <Ionicons name="heart" size={36} color="#6c63ff" />;
      case 6: return <MaterialIcons name="list-alt" size={36} color="#6c63ff" />;
      case 7: return <Ionicons name="home" size={36} color="#6c63ff" />;
      case 8: return <Ionicons name="location" size={36} color="#6c63ff" />;
      case 9: return <Ionicons name="image" size={36} color="#6c63ff" />;
      default: return null;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>What's your gender?</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={gender} onValueChange={setGender} style={styles.input}>
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>When were you born?</Text>
            </View>
            <View style={styles.dateInputContainer}>
              <TextInput 
                style={styles.dateInput} 
                value={dobInput} 
                onChangeText={handleDobInputChange} 
                placeholder="DD/MM/YYYY"
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={() => setShowCalendar(true)}
              >
                <Ionicons name="calendar" size={24} color="#6c63ff" />
              </TouchableOpacity>
            </View>
            
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
                    <TouchableOpacity onPress={() => setShowCalendar(false)}>
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
                      [dob]: { selected: true, selectedColor: '#6c63ff', selectedTextColor: 'white' },
                    }}
                    maxDate={new Date().toISOString().split('T')[0]}
                    theme={{
                      backgroundColor: '#ffffff',
                      calendarBackground: '#ffffff',
                      textSectionTitleColor: '#6c63ff',
                      selectedDayBackgroundColor: '#6c63ff',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#6c63ff',
                      dayTextColor: '#333333',
                      arrowColor: '#6c63ff',
                    }}
                  />
                </View>
              </View>
            </Modal>
          </View>
        );
      case 3:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>What's your phone number?</Text>
            </View>
            <TextInput 
              style={styles.input} 
              value={phoneNumber} 
              onChangeText={setPhoneNumber} 
              keyboardType="numeric"
              placeholder="Enter your phone number"
            />
          </View>
        );
      case 4:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>What's your budget range?</Text>
            </View>
            <TextInput 
              style={styles.input} 
              value={budgetRange} 
              onChangeText={setBudgetRange}
              placeholder="e.g., 500-1000"
            />
          </View>
        );
      case 5:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>What are your preferences?</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={preferences} 
              onChangeText={setPreferences}
              placeholder="Enter your preferences"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 6:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>What are your requirements?</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={requirement} 
              onChangeText={setRequirement}
              placeholder="Enter your requirements"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 7:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>Describe your lifestyle</Text>
            </View>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={lifeStyle} 
              onChangeText={setLifeStyle}
              placeholder="Describe your lifestyle"
              multiline
              numberOfLines={4}
            />
          </View>
        );
      case 8:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>Where would you like to live?</Text>
            </View>
            <TextInput 
              style={styles.input} 
              value={preferredLocation} 
              onChangeText={setPreferredLocation}
              placeholder="Enter preferred location"
            />
          </View>
        );
      case 9:
        return (
          <View style={styles.inputContainer}>
            <View style={styles.titleContainer}>
              {renderStepIcon()}
              <Text style={styles.title}>Choose your profile picture</Text>
            </View>
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
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={{ ...styles.progress, width: `${(step / 9) * 100}%` }} />
            </View>
            <Text style={styles.progressText}>Step {step} of 9</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputSection}>{renderStep()}</View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              onPress={handlePreviousStep} 
              style={[styles.navButton, styles.prevButton, step === 1 && styles.disabledButton]} 
              disabled={step === 1}
            >
              <AntDesign name="arrowleft" size={20} color="white" />
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleNextStep} 
              style={[styles.navButton, styles.nextButton, isSubmitting && styles.disabledButton]} 
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Processing...' : (step === 9 ? 'Finish' : 'Next')}
              </Text>
              {!isSubmitting && <AntDesign name="arrowright" size={20} color="white" />}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    flex: 1,
    backdropFilter: 'blur(5px)',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  dateInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  calendarButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    height: 55,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    width: '48%',
  },
  prevButton: {
    backgroundColor: '#e63946',
  },
  nextButton: {
    backgroundColor: '#6c63ff',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 5,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 10,
  },
  progressText: {
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
    fontSize: 14,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#6c63ff',
    borderRadius: 5,
  },
  inputSection: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  avatarButton: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(108, 99, 255, 0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    marginBottom: 10,
  },
  avatarButtonText: {
    color: 'white',
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
    borderColor: '#6c63ff',
  },
  changeAvatarButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  changeAvatarButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 15,
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
  }
});

export default PersonalInfoScreen;