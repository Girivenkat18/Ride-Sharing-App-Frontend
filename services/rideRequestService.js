import axios from 'axios';
import { API_BASE_URL } from './api';

// Get all ride requests for rides owned by the current user
export const getRideRequestsByOwner = async (ownerId) => {
  const token = localStorage.getItem('token'); // Replace with AsyncStorage for mobile if needed
  const res = await axios.get(`${API_BASE_URL}/api/ride-requests/owner/${ownerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

// Accept or reject a request
export const respondToRideRequest = async (requestId, status) => {
  const token = localStorage.getItem('token');
  const res = await axios.put(
    `${API_BASE_URL}/api/ride-requests/${requestId}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
};
