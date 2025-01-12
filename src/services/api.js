// Axios configuration
import axios from 'axios';

// Base API URL - update this to match your backend URL
const API_URL = 'http://localhost:8080';
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const submitStudentForm = async (formData) => {
  try {
    const response = await api.post('/submit', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginUser = async (credentials, role) => {
  try {
    const endpoint = role === 'hod' ? '/hod/login' : '/reviewer/login';
    const response = await api.post(endpoint, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSubmissions = async () => {
  try {
    const response = await api.get('/reviewer/submissions');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getApprovedSubmissions = async () => {
  try {
    const response = await api.get('/hod/submissions/approved');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitReview = async (reviewData) => {
  try {
    const response = await api.post('/reviewer/fpc_reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitHodReview = async (reviewData) => {
  try {
    const response = await api.post('/hod/hod_reviews', reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};