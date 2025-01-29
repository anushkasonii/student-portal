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
export const loginFpc = async (credentials) => {
  const response = await mainApi.post('/fpc/login', credentials);
  return response.data;
};

export const loginHod = async (credentials) => {
  const response = await mainApi.post('/hod/login', credentials);
  return response.data;
};

export const loginAdmin = async (credentials) => {
  const response = await mainApi.post('/admin/login', credentials);
  return response.data;
};

// Submission endpoints (Submission service)
export const submitApplication = async (formData) => {
  const response = await submissionApi.post('/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Review endpoints (Main service)
export const getSubmissions = async () => {
  try {
    const response = await mainApi.get('/fpc/submissions');
    if (response.data && Array.isArray(response.data.submissions)) {
      return response.data.submissions; // Extract the submissions array
    } else {
      throw new Error('Invalid data format or submissions key missing');
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
  }
};

export const getApprovedSubmissions = async () => {
  try {
    const response = await mainApi.get('/hod/approved_submissions');
    if (response.data && Array.isArray(response.data.submissions)) {
      return response.data.submissions; // Extract the submissions array
    } else {
      throw new Error('Invalid data format or submissions key missing');
    }
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
  }
};

export const createReview = async (reviewData) => {
  const response = await mainApi.post('/fpc/fpc_reviews', reviewData);
  return response.data;
};

export const createHodReview = async (reviewData) => {
  const response = await mainApi.post('/hod/hod_reviews', reviewData);
  return response.data;
};

// Admin endpoints (Main service)
export const getHods = async () => {
  const response = await mainApi.get('/admin/hods');
  return response.data; // Assuming the API returns a list of HODs
};

export const getFpcs = async () => {
  const response = await mainApi.get('/admin/fpcs');
  return response.data; // Assuming the API returns a list of FPCs
};

export const createHod = async (hodData) => {
  const response = await mainApi.post('/admin/hod', hodData);
  return response.data; // Assuming the API returns the created HOD
};

export const createFpc = async (fpcData) => {
  const response = await mainApi.post('/admin/fpc', fpcData);
  return response.data; // Assuming the API returns the created FPC
};

export { submissionApi, mainApi };
