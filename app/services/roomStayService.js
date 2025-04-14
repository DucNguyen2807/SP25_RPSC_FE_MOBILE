import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const roomStayService = {
  getRoommatesByCustomer: async (token) => {
    try {
      console.log('Fetching roommates with token:', token);
      console.log('API URL:', `${API_BASE_URL}/roomstay/get-roommates-by-customer`);
      
      const response = await axios.get(`${API_BASE_URL}/roomstay/get-roommates-by-customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },

  getLeaveRoomRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customer/get-leave-room-requests`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching leave room requests:', error);
      throw error;
    }
  }
};

export default roomStayService; 