import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const roomService = {
  getRoomStayByCustomerId: async () => {
    try {
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('token');

      // Tạo URL cho API request
      const url = `${API_BASE_URL}/roomstay/by-customer`;

      // Gửi yêu cầu API với Authorization header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, data: data.data };  // Trả về dữ liệu từ API nếu thành công
      } else {
        return { isSuccess: false, message: data.message || 'Failed to get room stay' };
      }
    } catch (error) {
      console.error('Error fetching room stay:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching room stay' };
    }
  },
  
  // New method to get room details by ID
  getRoomById: async (roomId) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      console.log('Token retrieved:', token);  // Log token

      // Create URL for API request
      const url = `${API_BASE_URL}/room/rooms/${roomId}`;
      console.log('Request URL:', url);  // Log URL

      // Send API request with Authorization header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('API Response:', data);  // Log API response

      if (response.ok) {
        return { isSuccess: true, data: data };  // Return data from API if successful
      } else {
        console.log('Error message from API:', data.message || 'Room not found');
        return { 
          isSuccess: false, 
          message: data.message || 'Failed to get room details' 
        };
      }
    } catch (error) {
      console.error('Error fetching room details:', error);
      return { 
        isSuccess: false, 
        message: 'Something went wrong while fetching room details' 
      };
    }
  },
  getFeedbackByRoomId: async (roomId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/room/feedback/${roomId}`; // Đúng URL
  
      console.log('Fetching feedback from:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      console.log('Feedback response:', data);
  
      if (response.ok) {
        return { isSuccess: true, data: data };
      } else {
        return {
          isSuccess: false,
          message: data.message || 'Failed to fetch feedback',
        };
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return {
        isSuccess: false,
        message: 'Something went wrong while fetching feedback',
      };
    }
  }
  
};

export default roomService;