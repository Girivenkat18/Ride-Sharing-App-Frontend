// For Android emulator, use 10.0.2.2 instead of localhost
export const API_BASE_URL = __DEV__ 
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080'
  : 'https://your-production-url.com'; 