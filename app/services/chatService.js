import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const chatService = {
  sendMessageToUser: async ({ message, receiverId }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const senderId = await AsyncStorage.getItem('userId'); // 🟢 Lấy senderId từ login

      const chatMessageCreateReqModel = {
        message,
        receiverId,
        senderId
      };

      const response = await fetch(`${API_BASE_URL}/chat/send-message-to-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(chatMessageCreateReqModel),
      });

      const data = await response.json();
      console.log('Send Message Response:', data);

      return {
        isSuccess: response.ok,
        message: data.message || (response.ok ? 'Message sent.' : 'Failed to send message'),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return { isSuccess: false, message: 'Error sending message.' };
    }
  },

  getChatHistory: async (user2Id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/chat/history?user2=${encodeURIComponent(user2Id)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      return { isSuccess: true, data };
    } catch (error) {
      return { isSuccess: false, message: 'Error fetching chat history.' };
    }
  },

  getHistoryByUserId: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `${API_BASE_URL}/chat/history-by-user`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      return { isSuccess: true, data };
    } catch (error) {
      return { isSuccess: false, message: 'Error fetching full chat history.' };
    }
  }
};

export default chatService;
