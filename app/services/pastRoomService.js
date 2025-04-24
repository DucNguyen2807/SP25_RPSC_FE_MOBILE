import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const pastRoomService = {
  getPastRooms: async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/room/get-past-rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching past rooms:', error);
      throw error;
    }
  }
};

export default pastRoomService; 