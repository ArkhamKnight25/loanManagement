import axios from 'axios';
import authHeader from './authHeader';

const API_URL = 'http://localhost:3002/api';

export interface LoanApplication {
  amount: number;
  purpose: string;
}

export interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
}

const loanService = {
  // User: Apply for a loan
  applyForLoan: async (loanData: LoanApplication): Promise<Loan> => {
    const response = await axios.post(`${API_URL}/loans`, loanData, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // User: Get user's loans
  getUserLoans: async (): Promise<Loan[]> => {
    const response = await axios.get(`${API_URL}/loans/user`, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // Verifier: Get pending loans for verification
  getPendingLoans: async (): Promise<Loan[]> => {
    const response = await axios.get(`${API_URL}/loans/pending`, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // Verifier: Verify or reject a loan
  verifyLoan: async (loanId: string, action: 'verify' | 'reject'): Promise<Loan> => {
    const response = await axios.post(`${API_URL}/loans/${loanId}/${action}`, {}, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // Admin: Get verified loans for approval
  getVerifiedLoans: async (): Promise<Loan[]> => {
    const response = await axios.get(`${API_URL}/loans/verified`, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // Admin: Approve or reject a loan
  approveLoan: async (loanId: string, action: 'approve' | 'reject'): Promise<Loan> => {
    const response = await axios.post(`${API_URL}/loans/${loanId}/${action}`, {}, { 
      headers: authHeader() 
    });
    return response.data;
  },

  // Get statistics for dashboard
  getStatistics: async (): Promise<any> => {
    const response = await axios.get(`${API_URL}/loans/statistics`, {
      headers: authHeader()
    });
    return response.data;
  }
};

export default loanService; 