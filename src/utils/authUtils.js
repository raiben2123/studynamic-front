import { getTokenSync, getUserIdSync } from '../api/auth';

export const getAuthToken = () => {
  return getTokenSync();
};

export const getUserId = () => {
  return getUserIdSync();
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const setAuthCredentials = (token, userId) => {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
};

export const clearAuthCredentials = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};
