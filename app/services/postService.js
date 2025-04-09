import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const postService = {
  getAllRoommatePosts: async (searchRequest) => {
    try {
      // Lấy token từ AsyncStorage
      const token = await AsyncStorage.getItem('token');

      // Extract search parameters from the search request
      const {
        pageNumber = 1,
        pageSize = 10,
        address,
        minBudget,
        maxBudget,
        minAge,
        maxAge,
        gender,
        lifeStyles,
        customerTypes
      } = searchRequest;

      // Build query string with all possible filters
      let queryParams = new URLSearchParams();
      
      // Add pagination parameters
      queryParams.append('pageNumber', pageNumber);
      queryParams.append('pageSize', pageSize);
      
      // Add optional filters only if they exist
      if (address) queryParams.append('address', address);
      if (minBudget) queryParams.append('minBudget', minBudget);
      if (maxBudget) queryParams.append('maxBudget', maxBudget);
      if (minAge) queryParams.append('minAge', minAge);
      if (maxAge) queryParams.append('maxAge', maxAge);
      if (gender) queryParams.append('gender', gender);
      
      // Handle array parameters
      if (lifeStyles && lifeStyles.length > 0) {
        lifeStyles.forEach(style => queryParams.append('lifeStyles', style));
      }
      
      if (customerTypes && customerTypes.length > 0) {
        customerTypes.forEach(type => queryParams.append('customerTypes', type));
      }

      // Prepare the URL with query parameters
      const url = `${API_BASE_URL}/post/get-all-roommate-post?${queryParams.toString()}`;
      console.log('Request URL:', url);

      // Make the API request with Authorization header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Thêm token vào header
        },
      });

      // Log response for debugging
      console.log('Response Status:', response.status);
      
      const data = await response.json();
      console.log('Response Data:', data);

      if (data?.isSuccess) {
        return { isSuccess: true, message: data.message, posts: data.data };
      } else {
        console.log('Error message from API:', data.message);
        return { isSuccess: false, message: data.message || 'Failed to fetch roommate posts' };
      }
    } catch (error) {
      console.error('Error fetching roommate posts:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching posts' };
    }
  },

  getRoommatePostDetail: async (postId) => {
    try {
      const token = await AsyncStorage.getItem('token');
  
      const url = `${API_BASE_URL}/post/get-roommate-post-detail?postId=${postId}`;
      console.log('Request URL for Post Detail:', url);
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (data?.isSuccess) {
        // Sửa ở đây: trả về data thay vì postDetail
        return { isSuccess: true, message: data.message, data: data.data }; 
      } else {
        console.log('Error message from API:', data.message);
        return { isSuccess: false, message: data.message || 'Failed to fetch roommate post detail' };
      }
    } catch (error) {
      console.error('Error fetching roommate post detail:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching post detail' };
    }
  },
  
};

export default postService;
