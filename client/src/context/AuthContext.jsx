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
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && tokenExpiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(tokenExpiry);
      
      // If token is still valid (check if not expired), restore session
      if (expiryTime > now) { // Simply check if token hasn't expired
        setIsLoggedIn(true);
        fetchUserProfile();
      } else {
        // Token is expired, try to refresh it
        refreshToken();
      }
    } else {
      setLoading(false);
    }

    // Set up automatic token refresh every 7 days (instead of 24 hours)
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
      // Clean up force logout event listener
      window.removeEventListener('forceLogout', handleForceLogout);
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/refresh-token` || "http://localhost:3000/api/auth/refresh-token",  {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenExpiry', expiryTime.toString());
        setIsLoggedIn(true);
        if (!user) {
          fetchUserProfile();
        }
      } else {
        handleTokenExpiry();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleTokenExpiry();
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If user profile fetch fails, the token might be invalid
      handleTokenExpiry();
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

  const login = (token) => {
    const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000); // 30 days
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    setIsLoggedIn(true);
    // Fetch user profile after login
    fetchUserProfile();
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookie
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout` || "http://localhost:3000/api/auth/logout", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear client-side data regardless of API call result
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    loading,
    fetchUserProfile,
    updateUserProfile,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;