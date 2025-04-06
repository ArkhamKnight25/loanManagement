import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'VERIFIER' | 'USER';
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("AuthProvider rendering", { currentUser, loading });

  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      setLoading(true);
      
      try {
        // First check for special roles mock user
        const mockUser = localStorage.getItem('mockUser');
        const mockToken = localStorage.getItem('mockToken');
        
        if (mockUser && mockToken) {
          console.log('Found mock user:', JSON.parse(mockUser));
          setCurrentUser(JSON.parse(mockUser));
          setLoading(false);
          return;
        }
        
        // Then check for stored user from regular login
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          console.log('Found stored user:', JSON.parse(storedUser));
          setCurrentUser(JSON.parse(storedUser));
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setLoading(false);
          return;
        }
        
        // As a last resort, try to fetch user from API
        if (token) {
          try {
            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Get current user data from server
            const response = await axios.get(`${API_URL}/auth/me`);
            console.log('Fetched user from API:', response.data);
            setCurrentUser(response.data);
            localStorage.setItem('currentUser', JSON.stringify(response.data));
          } catch (error) {
            console.error('Error fetching current user:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            delete axios.defaults.headers.common['Authorization'];
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Special case for development - checking for mock users
      const mockUser = localStorage.getItem('mockUser');
      if (mockUser) {
        console.log('Setting current user from mock user');
        setCurrentUser(JSON.parse(mockUser));
        return;
      }
      
      // Check for the stored user from the login component
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        console.log('Setting current user from stored user');
        setCurrentUser(JSON.parse(storedUser));
        return;
      }
      
      // If no stored user, the login request was likely made directly in the Login component
      // and we don't need to do anything else here
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, role = 'USER') => {
    setLoading(true);
    
    try {
      if (process.env.NODE_ENV === 'development') {
        // Create mock user with proper typing
        const userRole = role as 'ADMIN' | 'VERIFIER' | 'USER';
        
        const mockUser: User = {
          id: '123',
          username,
          email,
          role: userRole
        };
        
        setCurrentUser(mockUser);
        return;
      }
      
      const response = await axios.post(`${API_URL}/auth/register`, { 
        username, 
        email, 
        password,
        role
      });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setCurrentUser(user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    
    // Clear both mock and real authentication
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockToken');
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('lastPath');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    
    // Force reload to login page
    window.location.href = '/login';
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 