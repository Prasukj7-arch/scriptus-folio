import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
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
  }) => api.get('/books', { params }),
  
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
  
  getUserReviews: (userId: string) => api.get(`/reviews/user/${userId}`),
};

export default api;
