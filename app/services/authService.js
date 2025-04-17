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
          // Lưu user, token và refreshToken vào AsyncStorage
          await AsyncStorage.setItem('user', JSON.stringify(data.data));
          await AsyncStorage.setItem('token', data.data.token);
          await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
          await AsyncStorage.setItem('userId', data.data.userId);
          return { 
            isSuccess: true, 
            message: 'Login successful', 
            user: {
              ...data.data,
              token: data.data.token
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
  },

  logout: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      const response = await fetch(`${API_BASE_URL}/authentication/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      const data = await response.json();
      
      if (data?.isSuccess) {
        // Clear all stored data
        await AsyncStorage.multiRemove(['token', 'user', 'userId', 'refreshToken']);
        return { isSuccess: true, message: 'Logout successful' };
      } else {
        return { isSuccess: false, message: data.message || 'Logout failed' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      return { isSuccess: false, message: error.message || 'Something went wrong' };
    }
  },
  getInforProfile: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return { isSuccess: false, message: 'User is not authenticated. Token not found.' };
      }

      const response = await fetch(`${API_BASE_URL}/user/Get-Customer-By-UserId`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        return { isSuccess: true, message: 'Customer information retrieved successfully.', data: data.data };
      } else {
        const errorData = await response.json();
        return { isSuccess: false, message: errorData.message || 'Failed to retrieve customer information.' };
      }
    } catch (error) {
      console.error('Error retrieving customer information:', error);
      return { isSuccess: false, message: 'An error occurred while retrieving customer information.' };
    }
  },

  // Add these functions to your authService object

  updateUserProfile: async (userData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        return { isSuccess: false, message: 'User is not authenticated. Token not found.' };
      }
  
      // Create FormData object
      const formData = new FormData();
  
      // Add all fields to FormData
      if (userData.FullName) formData.append('FullName', userData.FullName);
      if (userData.PhoneNumber) formData.append('PhoneNumber', userData.PhoneNumber);
      if (userData.Address) formData.append('Address', userData.Address);
      if (userData.Gender) formData.append('Gender', userData.Gender);
      
      // Format date if it exists
      if (userData.Dob) {
        const formattedDate = new Date(userData.Dob).toISOString().split('T')[0];
        formData.append('Dob', formattedDate);
      }
  
      // Handle Avatar if it's a file object from React Native
      if (userData.Avatar && userData.Avatar.uri) {
        const avatarFileObject = {
          uri: userData.Avatar.uri,
          type: userData.Avatar.type || 'image/jpeg', // Default to jpeg if type is not provided
          name: userData.Avatar.name || 'avatar.jpg', // Default name if not provided
        };
        formData.append('Avatar', avatarFileObject);
      }
  
      const response = await fetch(`${API_BASE_URL}/user/Update-User-Profile`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header when using FormData - fetch will set it automatically
        },
        body: formData, // Send FormData instead of JSON
      });
  
      const data = await response.json();
      
      if (data?.isSuccess) {
        return { isSuccess: true, message: data.message || 'User profile updated successfully' };
      } else {
        return { isSuccess: false, message: data.message || 'Failed to update user profile' };
      }
    } catch (error) {
      console.error('Update user profile error:', error);
      return { 
        isSuccess: false, 
        message: 'An error occurred while updating user profile: ' + error.message 
      };
    }
  },

updateCustomerDetails: async (customerData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      return { isSuccess: false, message: 'User is not authenticated. Token not found.' };
    }

    const response = await fetch(`${API_BASE_URL}/user/Edit-Customer-Profile`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(customerData),
    });

    const data = await response.json();
    
    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message || 'Customer details updated successfully' };
    } else {
      console.log('Sending customer data:', JSON.stringify(customerData));
      console.log('Full server response:', JSON.stringify(data));
      console.log('Error response:', data);
      console.log('Error message:', data.message);
      return { isSuccess: false, message: data.message || 'Failed to update customer details' };
    }
  } catch (error) {
    console.error('Update customer details error:', error);
    return { 
      isSuccess: false, 
      message: 'An error occurred while updating customer details: ' + error.message 
    };
  }
}
};

export default authService;


