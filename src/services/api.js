import axios from 'axios';

const SUBMISSION_SERVICE_URL = 'http://localhost:8001';
const MAIN_SERVICE_URL = 'http://localhost:8002';
const FILES_BASE_URL = 'http://localhost:8002/files';

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

// Auth endpoints
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

// Submission endpoints
export const submitApplication = async (formData) => {
  try {
    const response = await submissionApi.post('/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Submission Error:', error.response?.data || error.message);
    throw error;
  }
};

// FPC endpoints
export const getSubmissions = async () => {
  try {
    const response = await mainApi.get('/fpc/submissions');
    return response.data.submissions;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

export const createFpcReview = async (reviewData) => {
  try {
    const response = await mainApi.post('/fpc/fpc_reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating FPC review:', error);
    throw error;
  }
};

// HOD endpoints
export const getApprovedSubmissions = async (nocType) => {
  try {
    const response = await mainApi.get('/hod/submissions', {
      params: { noc_type: nocType }
    });
    return response.data.submissions;
  } catch (error) {
    console.error('Error fetching approved submissions:', error);
    throw error;
  }
};

export const createHodReview = async (reviewData) => {
  try {
    const response = await mainApi.post('/hod/hod_reviews', reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating HOD review:', error);
    throw error;
  }
};

// Admin endpoints
export const getHods = async () => {
  try {
    const response = await mainApi.get('/admin/hods');
    return response.data;
  } catch (error) {
    console.error('Error fetching HODs:', error);
    throw error;
  }
};

export const getFpcs = async () => {
  try {
    const response = await mainApi.get('/admin/fpcs');
    return response.data;
  } catch (error) {
    console.error('Error fetching FPCs:', error);
    throw error;
  }
};

export const createHod = async (hodData) => {
  try {
    const response = await mainApi.post('/admin/hod', hodData);
    return response.data;
  } catch (error) {
    console.error('Error creating HOD:', error);
    throw error;
  }
};

export const createFpc = async (fpcData) => {
  try {
    const response = await mainApi.post('/admin/fpc', fpcData);
    return response.data;
  } catch (error) {
    console.error('Error creating FPC:', error);
    throw error;
  }
};

export const getFileUrl = (filepath) => {
  return `${FILES_BASE_URL}/${filepath}`;
};

export { submissionApi, mainApi };