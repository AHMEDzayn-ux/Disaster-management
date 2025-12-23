// Configure base API URL (update this when you have a backend)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Fetch wrapper with authentication and error handling
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }

    // Handle non-OK responses
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Return parsed JSON
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Helper functions for common HTTP methods
const api = {
  get: (endpoint) => fetchAPI(endpoint, { method: 'GET' }),
  post: (endpoint, data) => fetchAPI(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data) => fetchAPI(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint) => fetchAPI(endpoint, { method: 'DELETE' }),
};

export default api;

// Example API functions
export const missingPersonsAPI = {
  getAll: () => api.get('/missing-persons'),
  getById: (id) => api.get(`/missing-persons/${id}`),
  create: (data) => api.post('/missing-persons', data),
  update: (id, data) => api.put(`/missing-persons/${id}`, data),
  delete: (id) => api.delete(`/missing-persons/${id}`),
};

export const disasterAPI = {
  getAll: () => api.get('/disasters'),
  getById: (id) => api.get(`/disasters/${id}`),
  create: (data) => api.post('/disasters', data),
  update: (id, data) => api.put(`/disasters/${id}`, data),
};

export const volunteerAPI = {
  getAll: () => api.get('/volunteers'),
  register: (data) => api.post('/volunteers', data),
  update: (id, data) => api.put(`/volunteers/${id}`, data),
};

export const donationAPI = {
  getAll: () => api.get('/donations'),
  create: (data) => api.post('/donations', data),
};

export const smsAPI = {
  process: (data) => api.post('/sms/process', data),
  getAll: () => api.get('/sms/reports'),
};
