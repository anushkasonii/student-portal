// src/services/api.js
import axios from 'axios';

const SUBMISSION_SERVICE_URL = 'http://localhost:8001';
const MAIN_SERVICE_URL = 'http://localhost:8002';

// Create separate instances for different services
const submissionApi = axios.create({
  baseURL: SUBMISSION_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const mainApi = axios.create({
  baseURL: MAIN_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests for both instances
[submissionApi, mainApi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// Auth endpoints (Main service)
export const loginReviewer = async (credentials) => {
  const response = await mainApi.post('/reviewer/login', credentials);
  return response.data;
};

export const loginHod = async (credentials) => {
  const response = await mainApi.post('/hod/login', credentials);
  return response.data;
};

// Submission endpoints (Submission service)
export const submitApplication = async (formData) => {
  const response = await submissionApi.post('/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Review endpoints (Main service)
export const getSubmissions = async () => {
  const response = await mainApi.get('/reviewer/submissions');
  return response.data;
};

export const getApprovedSubmissions = async () => {
  const response = await mainApi.get('/hod/approved_submissions');
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await mainApi.post('/reviewer/fpc_reviews', reviewData);
  return response.data;
};

export const createHodReview = async (reviewData) => {
  const response = await mainApi.post('/hod/hod_reviews', reviewData);
  return response.data;
};

export { submissionApi, mainApi };
