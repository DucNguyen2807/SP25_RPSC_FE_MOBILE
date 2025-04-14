import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const authService = {
  login: async (phoneNumber, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/authentication/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, password }),
      });
      
      const data = await response.json();
      
      if (data?.isSuccess) {
        if (data.data.role === 'Customer') {
          // Lưu user và token vào AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(data.data));
          await AsyncStorage.setItem('token', data.data.token);  
          await AsyncStorage.setItem('userId', data.data.userId); 
          return { 
            isSuccess: true, 
            message: 'Login successful', 
            user: {
              ...data.data,
              token: data.data.token // Đảm bảo token được trả về trong user object
            } 
          };
        } else {
          return { isSuccess: false, message: 'You do not have the correct role to access this app.' };
        }
      } else {
        return { isSuccess: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { isSuccess: false, message: 'Something went wrong' };
    }
  },

  registerCustomer: async (email, password, confirmPassword, fullName, customerType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/authentication/register-customer`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          confirmPassword,
          fullName,
          customerType
        }),
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, message: 'Registration successful', user: data.data };
      } else {
        return { isSuccess: false, message: data?.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { isSuccess: false, message: 'Something went wrong during registration' };
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify-email`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
  
      if (response.ok) {
        return { isSuccess: true, message: 'Account activated successfully' };
      } else {
        const data = await response.json();
        console.error('Error response:', data);
        return { isSuccess: false, message: data?.message || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('OTP Verification error:', error);
      return { isSuccess: false, message: 'Something went wrong during OTP verification' };
    }
  },
  
  updateCustomerProfile: async (formValues, userEmail) => {
    try {
      // Create a new FormData instance
      const formData = new FormData();
      
      // Add all fields except Avatar to formData
      Object.entries(formValues).forEach(([key, value]) => {
        if (key !== 'Avatar' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Handle Avatar separately if it exists
      if (formValues.Avatar && formValues.Avatar.uri) {
        // Extract filename from URI
        const uriParts = formValues.Avatar.uri.split('/');
        const fileName = uriParts[uriParts.length - 1];
        
        // Append as a file object compatible with React Native
        formData.append('Avatar', {
          uri: formValues.Avatar.uri,
          name: fileName,
          type: formValues.Avatar.mimeType || 'image/jpeg'
        });
        
        console.log('Avatar file prepared:', {
          uri: formValues.Avatar.uri,
          name: fileName,
          type: formValues.Avatar.mimeType || 'image/jpeg'
        });
      }
      
      // Log the FormData entries for debugging
      console.log('FormData created for API call');
      
      // Build the URL with the query parameter
      const url = `${API_BASE_URL}/user/update-customer-profile?userEmail=${encodeURIComponent(userEmail)}`;
      console.log('API URL:', url);
      
      // Make the API request
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          // Do NOT set Content-Type for multipart/form-data
        },
        body: formData,
      });
      
      // Process the response
      if (!response.ok) {
        console.error('Server responded with status:', response.status);
        const errorText = await response.text();
        console.error('Response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          // If parsing fails, use the raw text
          errorData = { message: errorText };
        }
        
        return { 
          isSuccess: false, 
          message: errorData?.message || `Request failed with status ${response.status}` 
        };
      }
      
      const data = await response.json();
      return { 
        isSuccess: data?.isSuccess || false, 
        message: data?.message || 'Profile updated' 
      };
    } catch (error) {
      console.error('Update profile error details:', error);
      // Check if it's a network error and provide more specific message
      if (error.message === 'Network request failed') {
        return { 
          isSuccess: false, 
          message: 'Network connection error. Please check your internet connection and try again.' 
        };
      }
      return { 
        isSuccess: false, 
        message: 'An error occurred while updating profile: ' + error.message 
      };
    }
  }
};

export default authService;