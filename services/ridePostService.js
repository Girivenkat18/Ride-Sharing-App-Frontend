import axios from 'axios';
import { API_BASE_URL } from './api';

export const createRidePost = async (rideData) => {
  const token = localStorage.getItem('token'); // or use AsyncStorage for mobile
  const response = await axios.post(`${API_BASE_URL}/api/ride-posts`, rideData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// Fetch all rides posted by a specific owner (user)
export const getRidesByOwner = async (ownerId) => {
    const token = localStorage.getItem('token'); // or AsyncStorage if on device
    const response = await axios.get(`${API_BASE_URL}/api/ride-posts/owner/${ownerId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };