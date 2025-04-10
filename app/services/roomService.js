import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const roomService = {
  getRoomStayByCustomerId: async () => {
    try {
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('token');
      console.log('Token retrieved:', token);  // Log token

      // Tạo URL cho API request
      const url = `${API_BASE_URL}/roomstay/by-customer`;
      console.log('Request URL:', url);  // Log URL

      // Gửi yêu cầu API với Authorization header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('API Response:', data);  // Log API response

      if (data?.isSuccess) {
        return { isSuccess: true, data: data.data };  // Trả về dữ liệu từ API nếu thành công
      } else {
        console.log('Error message from API:', data.message);
        return { isSuccess: false, message: data.message || 'Failed to get room stay' };
      }
    } catch (error) {
      console.error('Error fetching room stay:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching room stay' };
    }
  },
};

export default roomService;
