import api, { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const authService = {
  login: async (credentials) => {
    try {
      console.log('AuthService: Attempting login');
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const { token, user } = response.data;
      
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store the token
      await AsyncStorage.setItem('token', token);
      
      console.log('AuthService: Login successful');
      return { token, user };
    } catch (error) {
      console.error('AuthService: Login failed', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('AuthService: Attempting registration with:', {
        ...userData,
        password: '****'
      });

      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('AuthService: Registration successful');
      return response.data;
    } catch (error) {
      console.error('AuthService: Registration failed', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        responseData: error.response?.data,
        errorDetails: error.response?.data?.error
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('AuthService: Attempting logout');
      // Call logout endpoint if available
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.warn('AuthService: Logout API call failed:', error);
      }

      // Clear token regardless of API call result
      await AsyncStorage.removeItem('token');
      console.log('AuthService: Logout successful');
    } catch (error) {
      console.error('AuthService: Logout failed', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log('AuthService: Fetching current user');
      const response = await api.get('/api/user/profile');
      console.log('AuthService: User fetch successful');
      return response.data;
    } catch (error) {
      console.error('AuthService: User fetch failed', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log('AuthService: Updating profile');
      const response = await api.put('/api/user/profile', profileData);
      console.log('AuthService: Profile update successful');
      return response.data;
    } catch (error) {
      console.error('AuthService: Profile update failed', error);
      throw error;
    }
  },

  checkAuthStatus: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return false;

      // Verify token is valid by making a request
      try {
        await api.get('/api/user/profile');
        return true;
      } catch (error) {
        await AsyncStorage.removeItem('token');
        return false;
      }
    } catch (error) {
      console.error('AuthService: Auth status check failed', error);
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('AuthService: Get token failed', error);
      return null;
    }
  },

  clearToken: async () => {
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('AuthService: Clear token failed', error);
      throw error;
    }
  }
};

export default authService;