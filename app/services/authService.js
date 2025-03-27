import axios from 'axios';

// Thay thế localhost bằng IP của máy tính chạy server
const API_URL = 'http://192.168.1.4:7159/api';

// Tạo instance axios với config mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password });
      const response = await axiosInstance.post('/authentication/login', {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Server trả về lỗi
        throw {
          message: error.response.data?.message || 'Server error occurred',
          status: error.response.status
        };
      } else if (error.request) {
        // Không nhận được response từ server
        throw {
          message: 'No response from server. Please check your connection.',
          status: 0
        };
      } else {
        // Lỗi khi tạo request
        throw {
          message: 'Error creating request. Please try again.',
          status: 0
        };
      }
    }
  }
};
