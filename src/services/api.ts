import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API_URL:', API_URL);
console.log('🔧 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear storage and redirect if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Use React Router navigation instead of window.location
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    }
    
    // Clean up error messages to be user-friendly
    if (error.message && error.message.includes('Request failed with status code')) {
      const status = error.response?.status;
      if (status === 401) {
        error.message = 'Invalid email or password';
      } else if (status === 400) {
        error.message = 'Please check your information';
      } else if (status === 409) {
        error.message = 'An account with this email already exists';
      } else if (status === 500) {
        error.message = 'Server error. Please try again later';
      } else {
        error.message = 'Something went wrong. Please try again';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  getMe: () => api.get('/auth/me'),
};

// Books API
export const booksAPI = {
  getBooks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
  }) => {
    console.log('🔧 booksAPI.getBooks called with params:', params);
    console.log('🔧 Making request to:', `${API_URL}/books`);
    return api.get('/books', { params });
  },
  
  getMyBooks: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
  }) => {
    console.log('🔧 booksAPI.getMyBooks called with params:', params);
    console.log('🔧 Making request to:', `${API_URL}/books/my-books`);
    return api.get('/books/my-books', { params });
  },
  
  getBook: (id: string) => api.get(`/books/${id}`),
  
  createBook: (bookData: {
    title: string;
    author: string;
    description: string;
    genre: string;
    publishedYear: number;
  }) => api.post('/books', bookData),
  
  updateBook: (id: string, bookData: {
    title?: string;
    author?: string;
    description?: string;
    genre?: string;
    publishedYear?: number;
  }) => api.put(`/books/${id}`, bookData),
  
  deleteBook: (id: string) => api.delete(`/books/${id}`),
  
  getGenres: () => api.get('/books/genres'),
};

// Reviews API
export const reviewsAPI = {
  createReview: (reviewData: {
    bookId: string;
    rating: number;
    reviewText: string;
  }) => api.post('/reviews', reviewData),
  
  updateReview: (id: string, reviewData: {
    rating?: number;
    reviewText?: string;
  }) => api.put(`/reviews/${id}`, reviewData),
  
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  
  getBookReviews: (bookId: string) => api.get(`/reviews/book/${bookId}`),
  
  getUserReviews: (userId: string) => api.get(`/reviews/user/${userId}`),
  
  canReview: (bookId: string) => api.get(`/reviews/can-review/${bookId}`),
};

export default api;
