import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile } from '../Api/userApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Utility function to check token validity
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (!token || !tokenExpiry) return false;
    
    const now = new Date().getTime();
    const expiryTime = parseInt(tokenExpiry);
    return expiryTime > now;
  };

  // Utility function to get remaining token time
  const getTokenRemainingTime = () => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) return 0;
    
    const now = new Date().getTime();
    const expiryTime = parseInt(tokenExpiry);
    return Math.max(0, expiryTime - now);
  };

  const handleTokenExpiry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    setIsLoggedIn(false);
    setUser(null);
    setLoading(false);
  };

  const handleForceLogout = () => {
    handleTokenExpiry();
  };

  // Check if user is logged in on mount and set up token refresh
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      
      if (token && tokenExpiry) {
        const now = new Date().getTime();
        const expiryTime = parseInt(tokenExpiry);
        
        // If token is still valid (check if not expired), restore session
        if (expiryTime > now) {
          setIsLoggedIn(true);
          await fetchUserProfile();
        } else {
          // Token is expired, try to refresh it
          await refreshToken();
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up automatic token refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (isLoggedIn) {
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (tokenExpiry) {
          const now = new Date().getTime();
          const expiryTime = parseInt(tokenExpiry);
          
          // Refresh token if it expires within 7 days
          if (expiryTime - now < (7 * 24 * 60 * 60 * 1000)) {
            refreshToken();
          }
        }
      }
    }, 6 * 60 * 60 * 1000); // Check every 6 hours

    return () => {
      clearInterval(refreshInterval);
    };
  }, [isLoggedIn]);

  // Add force logout event listener
  useEffect(() => {
    window.addEventListener('forceLogout', handleForceLogout);
    
    return () => {
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, []);

  const refreshToken = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api";
      const response = await fetch(`${backendUrl}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.token) {
        const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        setIsLoggedIn(true);
        if (!user) {
          await fetchUserProfile();
        }
        return true;
      } else {
        handleTokenExpiry();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleTokenExpiry();
      return false;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.user);
      } else {
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If user profile fetch fails, try to refresh token first
      const refreshed = await refreshToken();
      if (!refreshed) {
        handleTokenExpiry();
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = (updatedUser) => {
    if (updatedUser && typeof updatedUser === 'object') {
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser
      }));
    }
  };

  const login = (token, userData = null) => {
    const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    setIsLoggedIn(true);
    
    // If user data is provided, set it immediately
    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      // Otherwise fetch user profile
      fetchUserProfile();
    }
  };

  const logout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://lms-backend-tau-nine.vercel.app/api";
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear client-side data regardless of API call result
      handleTokenExpiry();
    }
  };

  // Clear authentication data (without API call)
  const clearAuth = () => {
    handleTokenExpiry();
  };

  // Check if token is about to expire (within 1 day)
  const isTokenExpiringSoon = () => {
    const remainingTime = getTokenRemainingTime();
    return remainingTime > 0 && remainingTime < (24 * 60 * 60 * 1000);
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    loading,
    fetchUserProfile,
    updateUserProfile,
    refreshToken,
    clearAuth,
    isTokenValid,
    isTokenExpiringSoon,
    getTokenRemainingTime
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
