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
      //console.log('Request URL:', url);

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
      //console.log('Response Status:', response.status);
      
      const data = await response.json();
      //console.log('Response Data:', data);

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
      //console.log('Request URL for Post Detail:', url);
  
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
        //console.log('Error message from API:', data.message);
        return { isSuccess: false, message: data.message || 'Failed to fetch roommate post detail' };
      }
    } catch (error) {
      console.error('Error fetching roommate post detail:', error);
      return { isSuccess: false, message: 'Something went wrong while fetching post detail' };
    }
  },
  // Thêm phương thức lấy bài đăng của khách hàng
getPostRoommateByCustomerId: async () => {
  try {
    // Lấy token từ AsyncStorage
    const token = await AsyncStorage.getItem('token');

    // Kiểm tra nếu không có token
    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    // Cấu trúc URL cho API request
    const url = `${API_BASE_URL}/post/Get-Post-Roommate-By-CustomerId`;

    // Thực hiện fetch với header Authorization
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Thêm token vào header
      },
    });

    // Kiểm tra phản hồi và lấy dữ liệu
    const data = await response.json();
    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message, data: data.data };
    } else {
      return { isSuccess: false, message: data.message || 'Failed to fetch post by customer ID' };
    }
  } catch (error) {
    console.error('Error fetching post by customer ID:', error);
    return { isSuccess: false, message: 'Something went wrong while fetching post by customer ID' };
  }
}, 
createRoommatePost: async (title, description, price, rentalRoomId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const requestData = {
      Title: title,
      Description: description,
      Price: price,
      RentalRoomId: rentalRoomId,
    };

    const url = `${API_BASE_URL}/post/create-roommate-post`;

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
    //console.log('API Response:', data);

    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message, data: data.data };
    } else {
      // Pass the errors from the API response
      return { 
        isSuccess: false, 
        message: data.message || data.title || 'Failed to create roommate post',
        errors: data.errors // Include the original errors object
      };
    }
  } catch (error) {
    console.error('Error creating roommate post:', error);
    return { isSuccess: false, message: 'Something went wrong while creating roommate post' };
  }
},
updateRoommatePost: async (postId, { title, description, price }) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const requestData = {
      Title: title,
      Description: description,
      Price: price,
    };

    const url = `${API_BASE_URL}/post/update-roommate-post/${postId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message, data: data.data };
    } else {
      return { 
        isSuccess: false, 
        message: data.message || 'Failed to update roommate post' 
      };
    }
  } catch (error) {
    console.error('Error updating roommate post:', error);
    return { isSuccess: false, message: 'Something went wrong while updating the post' };
  }
},
inactivateRoommatePost: async (postId) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const url = `${API_BASE_URL}/post/inactivate-roommate-post-by-tenant/${postId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message };
    } else {
      return { 
        isSuccess: false, 
        message: data.message || 'Failed to inactivate roommate post' 
      };
    }
  } catch (error) {
    console.error('Error inactivating roommate post:', error);
    return { isSuccess: false, message: 'Something went wrong while inactivating the post' };
  }
},
getRecommendedRoommatePosts: async (pageNumber = 1, pageSize = 10) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const url = `${API_BASE_URL}/post/recommended-roommate-posts?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data?.isSuccess) {
      return { isSuccess: true, message: data.message, data: data.data };
    } else {
      return { isSuccess: false, message: data.message || 'Failed to get recommended roommate posts' };
    }
  } catch (error) {
    console.error('Error fetching recommended roommate posts:', error);
    return { isSuccess: false, message: 'Something went wrong while fetching recommended roommate posts' };
  }
},
getAllPostRoommateByCustomerId: async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    const url = `${API_BASE_URL}/post/Get-All-Roommate-Post-By-Customer`;

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
      return { isSuccess: true, message: data.message, data: data.data };
    } else {
      return {
        isSuccess: false,
        message: data.message || 'Failed to fetch all roommate posts by customer',
      };
    }
  } catch (error) {
    console.error('Error fetching all roommate posts by customer:', error);
    return {
      isSuccess: false,
      message: 'Something went wrong while fetching posts by customer',
    };
  }
},

getFeedbackByUserId: async (userId) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      throw new Error('Unauthorized: No token found');
    }

    const url = `${API_BASE_URL}/post/feedback/${userId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { isSuccess: true, data };
    } else {
      return {
        isSuccess: false,
        message: 'Failed to fetch feedback',
      };
    }
  } catch (error) {
    console.error('Error fetching feedback by userId:', error);
    return {
      isSuccess: false,
      message: 'Something went wrong while fetching feedback',
    };
  }
},


};

export default postService;
