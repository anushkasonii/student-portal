import axios from 'axios';
import { getIdFromToken } from "../utils/authUtils"; // Ensure the path is correct


const SUBMISSION_SERVICE_URL = 'https://temp.6513.in';
const MAIN_SERVICE_URL = 'https://temp.6513.in';
const FILES_BASE_URL = 'https://temp.6513.in/files';


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
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('userRole', 'admin');
  localStorage.setItem('userId', response.data.id); // Store user ID before redirecting
  setTimeout(() => {
    window.location.href = "/admin";  // Redirect after saving token
  }, 500); // Add delay to ensure storage completes
  return response.data;
};

// OTP endpoints
export const sendOtpToEmail = async (email) => {
  try {
    console.log("Sending OTP request:", { email }); 
    const response = await submissionApi.post('/generate-otp', { email });
    console.log("OTP Sent:", response.data); 
    return response.data;
  } catch (error) {
    console.error('Error generating OTP:', error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmailOtp = async (email, otp) => {
  try {
    // Check if email is an object, extract the correct value
    if (typeof email === "object" && email.email) {
      email = email.email; // Fix incorrect nesting
    }

    if (typeof email !== "string") {
      throw new Error(`email should be a string, but received: ${JSON.stringify(email)}`);
    }

    const requestData = { email, otp };
    console.log("Sending OTP validation request:", requestData);

    const response = await submissionApi.post('/validate-otp', requestData);

    console.log("OTP Validation Response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating OTP:', error.response?.data || error.message);
    throw error;
  }
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
    const response = await mainApi.get('/fpc/submissions', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    // Check if response.data exists and has submissions array
    if (!response.data || !Array.isArray(response.data.submissions)) {
      throw new Error('Invalid data format or submissions key missing');
    }
    return response.data.submissions;  // Return the entire data object to match the API response structure
  } catch (error) {
    console.error('Error fetching submissions:', error);
    // Throw a more informative error message
    throw new Error(error.response?.data?.message || 'Failed to fetch submissions');
  }
};

export const createFpcReview = async (reviewData) => {
  try {
    const response = await mainApi.post('/fpc/fpc_reviews', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      submission_id: reviewData.submission_id,
      fpc_id: getIdFromToken("fpc"),
      status: reviewData.status,
      comments: reviewData.comments,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating FPC review:', error);
    throw error;
  }
};

export const createHodReview = async (reviewData) => {
  try {
    const response = await mainApi.post('/hod/hod_reviews', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      submission_id: reviewData.submission_id,
      hod_id: getIdFromToken("hod"),
      action: reviewData.status,
      remarks: reviewData.comments,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating HOD review:', error);
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



// Admin endpoints
export const getHods = async () => {
  try {
    const response = await mainApi.get('/admin/hods', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data || []; // Ensure we return an empty array if no data
  } catch (error) {
    console.error('Error fetching HODs:', error);
    throw error;
  }
};


export const getFpcs = async () => {
  try {
    const response = await mainApi.get('/admin/fpcs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data || []; // Ensure we return an empty array if no data
  } catch (error) {
    console.error('Error fetching FPCs:', error);
    throw error;
  }
};

export const getAdmins = async () => {
  try {
    const response = await mainApi.get('/admin');
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};



export const createHod = async (hodData) => {
  try {
    const response = await mainApi.post('/admin/hod', {
      name: hodData.name,
      email: hodData.email,
      password: hodData.password,
      department: hodData.department
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating HOD:', error);
    throw error;
  }
};

export const createFpc = async (fpcData) => {
  try {
    const response = await mainApi.post('/admin/fpc', {
      name: fpcData.name,
      email: fpcData.email,
      password: fpcData.password,
      department: fpcData.department
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating FPC:', error);
    throw error;
  }
};

export const deleteHod = async (id) => {
  try {
    const response = await mainApi.delete(`/admin/hod?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting HOD:', error);
    throw error;
  }
};

export const deleteFpc = async (id) => {
  try {
    const response = await mainApi.delete(`/admin/fpc?id=${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting FPC:', error);
    throw error;
  }
};


export const getFileUrl = (filepath) => {
  return `${FILES_BASE_URL}/${filepath}`;
};

export { submissionApi, mainApi };
