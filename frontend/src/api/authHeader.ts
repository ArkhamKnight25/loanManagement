import { AuthResponse } from './authService';

export default function authHeader(): { Authorization: string } | {} {
  const userStr = localStorage.getItem('user');
  let user: AuthResponse | null = null;
  
  if (userStr) {
    user = JSON.parse(userStr);
  }

  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
} 