import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Figure out which URL to use based on where we're running
// iOS simulator can use localhost, Android emulator needs 10.0.2.2, physical device needs my computer's IP
const getApiUrl = () => {
  if (__DEV__) {
    // iOS simulator works with localhost
    if (Platform.OS === 'ios') {
      return 'http://192.168.1.23:3000';
    }
    // Android emulator has this special address
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000';
    }
    // For real devices, need to use my computer's IP
    // Update this if my IP changes
    return 'http://192.168.1.23:3000';
  }
  return 'https://your-production-api.com';
};

const API_BASE_URL = getApiUrl();

// Just for debugging - see what URL we're actually using
console.log('API Base URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the auth token to every request if we have one
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

