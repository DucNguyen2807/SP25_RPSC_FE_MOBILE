import { API_BASE_URL } from '../constants/config';

const postService = {
  getAllRoommatePosts: async (pageNumber = 1, pageSize = 10) => {
    try {
      // Đảm bảo pageNumber và pageSize là số và có thể thay đổi giá trị
      let page = parseInt(pageNumber, 10); // Dùng let để có thể gán lại giá trị
      let size = parseInt(pageSize, 10);   // Dùng let để có thể gán lại giá trị

      // Kiểm tra nếu giá trị không phải là số thì gán giá trị mặc định
      if (isNaN(page) || page <= 0) {
        page = 1;
      }
      if (isNaN(size) || size <= 0) {
        size = 10;
      }

      // Truyền tham số pageNumber và pageSize vào URL
      const response = await fetch(`${API_BASE_URL}/post/get-all-roommate-post?pageNumber=${page}&pageSize=${size}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      // Log response để debug
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      
      const data = await response.json();

      // Log dữ liệu trả về để debug
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
};

export default postService;
