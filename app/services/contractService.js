import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';

const contractService = {
  createExtendContractRequest: async ({ messageCustomer, monthWantToRent, landlordId, contractId }) => {
    try {
      const token = await AsyncStorage.getItem('token');

      const url = `${API_BASE_URL}/requestextendcontract/create-extendcontract`;

      const payload = {
        messageCustomer,
        monthWantToRent,
        landlordId,
        contractId,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data?.isSuccess) {
        return { isSuccess: true, message: data.message };
      } else {
        return {
          isSuccess: false,
          message: data.message || 'Failed to create extend contract request',
        };
      }
    } catch (error) {
      console.error('Error creating extend contract request:', error);
      return {
        isSuccess: false,
        message: 'Something went wrong while creating extend contract request',
      };
    }
  },
  getAllExtendContractRequestsByCustomer: async (pageIndex = 1, pageSize = 10) => {
    try {
      const token = await AsyncStorage.getItem('token');
  
      const url = `${API_BASE_URL}/requestextendcontract/view-all-request-by-customer?pageIndex=${pageIndex}&pageSize=${pageSize}`;
  
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok && data?.isSuccess) {
        return {
          isSuccess: true,
          data: data.data,
          message: data.message || 'Success',
        };
      } else {
        return {
          isSuccess: false,
          message: data.message || 'Failed to fetch extend contract requests',
        };
      }
    } catch (error) {
      console.error('Error fetching extend contract requests:', error);
      return {
        isSuccess: false,
        message: 'Something went wrong while fetching extend contract requests',
      };
    }
  },
  
};

export default contractService;
