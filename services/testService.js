import axios from 'axios';
import { API_BASE_URL } from './api';

export const pingBackend = async () => {
  try {
    console.log('Attempting ping to:', `${API_BASE_URL}/api/ping`);
    // Use axios directly to bypass auth interceptors
    const response = await axios.get(`${API_BASE_URL}/api/ping`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    console.log('Ping response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ping error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const testPost = async () => {
  try {
    console.log('Testing POST endpoint:', `${API_BASE_URL}/api/test-post`);
    // Use axios directly for public endpoints
    const response = await axios.post(`${API_BASE_URL}/api/test-post`, {
      test: 'data',
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    console.log('Test POST response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Test POST error:', {
      message: error.message,
      response: error.response?.data
    });
    throw error;
  }
}; 