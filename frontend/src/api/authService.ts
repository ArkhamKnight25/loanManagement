import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<void> => {
    try {
      console.log('Sending registration request:', data);
      const response = await axios.post(`${API_URL}/auth/register`, data);
      console.log('Registration response:', response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: (): void => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default authService;
