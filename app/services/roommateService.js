import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const roommateService = {
  // Gửi yêu cầu chia sẻ phòng
  sendRoomSharingRequest: async (postId, message) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const requestData = { postId, message };

      const url = `${API_BASE_URL}/customer/room-sharing-request`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, message: data.message };
      } else {
        return { isSuccess: false, message: data.message || 'Failed to send room sharing request' };
      }
    } catch (error) {
      console.error('Error sending room sharing request:', error);
      return { isSuccess: false, message: 'Something went wrong while sending room sharing request' };
    }
  },

  // Lấy tất cả các yêu cầu ở ghép
  getAllRoommateRequests: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/customer/get-all-roommate-request`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, data: data.data };
      } else {
        return { isSuccess: false, message: data.message || 'Failed to fetch roommate requests' };
      }
    } catch (error) {
      console.error('Error fetching roommate requests:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching roommate requests' };
    }
  },

  // Từ chối yêu cầu ở ghép
  rejectRoommateRequest: async (requestId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/customer/reject-roommate-request/${requestId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, message: 'Roommate request rejected successfully' };
      } else {
        return { isSuccess: false, message: data.message || 'Failed to reject roommate request' };
      }
    } catch (error) {
      console.error('Error rejecting roommate request:', error);
      return { isSuccess: false, message: 'Something went wrong while rejecting the roommate request' };
    }
  },

  // Chấp nhận yêu cầu ở ghép
  acceptRoommateRequest: async (requestId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/customer/accept-roommate-request/${requestId}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data?.isSuccess) {
        return { isSuccess: true, message: 'Roommate request accepted successfully' };
      } else {
        return { isSuccess: false, message: data.message || 'Failed to accept roommate request' };
      }
    } catch (error) {
      console.error('Error accepting roommate request:', error);
      return { isSuccess: false, message: 'Something went wrong while accepting the roommate request' };
    }
  },
};

export default roommateService;
