import axios from 'axios';

// Use environment variable for API URL in production, localhost in development
// Force production URL if in production environment
const isProduction = process.env.NODE_ENV === 'production';
const productionApiUrl = 'https://roadmap-backend-egd9.onrender.com/api';
const developmentApiUrl = 'http://localhost:8000/api';

// Handle environment variable - ensure it has /api suffix
let envApiUrl = process.env.REACT_APP_API_URL;
if (envApiUrl && !envApiUrl.endsWith('/api')) {
  envApiUrl = envApiUrl.endsWith('/') ? envApiUrl + 'api' : envApiUrl + '/api';
}

const API_BASE_URL = isProduction 
  ? (envApiUrl || productionApiUrl)
  : (envApiUrl || developmentApiUrl);

// Debug: Log the API URL being used (remove in production)
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('isProduction:', isProduction);

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  getProfile: () => api.get('/auth/profile/'),
};

// Roadmap APIs
export const roadmapAPI = {
  getItems: (params = {}) => api.get('/roadmap/', { params }),
  getItem: (id) => api.get(`/roadmap/${id}/`),
  toggleUpvote: (id) => api.post(`/roadmap/${id}/upvote/`),
};

// Comment APIs
export const commentAPI = {
  getComments: (roadmapId) => api.get(`/roadmap/${roadmapId}/comments/`),
  createComment: (roadmapId, commentData) => 
    api.post(`/roadmap/${roadmapId}/comments/`, commentData),
  updateComment: (commentId, commentData) => 
    api.put(`/comments/${commentId}/`, commentData),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}/`),
};

export default api; 