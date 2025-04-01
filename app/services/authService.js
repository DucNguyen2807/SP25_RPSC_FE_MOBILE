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
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { isSuccess: false, message: 'Something went wrong' };
    }
  }
};

export default authService;
