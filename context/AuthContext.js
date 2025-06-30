import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async ({ email, password }) => {
    try {
      console.log('Attempting login with:', { email, password: '****' });
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      // Check if response contains token
      if (response.data && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token); // Store the token
        setUser(response.data.user || { email }); // Fallback to email if user data not provided
        setIsLoggedIn(true);
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token'); // Remove the token
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 