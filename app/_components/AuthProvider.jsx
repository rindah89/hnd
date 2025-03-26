'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { refreshAuthToken } from '../_utils/authHelpers';

// Create an auth context to share auth state
const AuthContext = createContext({
  isAuthenticated: false,
  isLoading: true,
  error: null,
  refreshToken: async () => {}
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isLoading: kindeIsLoading } = useKindeBrowserClient();
  
  // Function to handle token refresh
  const refreshToken = async () => {
    try {
      setIsLoading(true);
      
      // Use our custom setup endpoint instead of the Kinde default
      const response = await fetch('/api/auth/setup');
      if (!response.ok) {
        // If we get a 401, try to refresh the token
        if (response.status === 401) {
          const refreshSuccess = await refreshAuthToken();
          setIsLoading(false);
          return refreshSuccess;
        }
        
        throw new Error('Failed to get auth setup');
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Periodically check and refresh token
  useEffect(() => {
    // Only run this effect if the user is logged in
    if (!user || kindeIsLoading) return;
    
    // Set up a timer to refresh the token every 30 minutes
    // (typical JWT tokens last 60 minutes, we refresh earlier)
    const refreshInterval = 30 * 60 * 1000; // 30 minutes
    
    const intervalId = setInterval(() => {
      refreshToken();
    }, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [user, kindeIsLoading]);
  
  // Update loading state based on Kinde
  useEffect(() => {
    if (!kindeIsLoading) {
      setIsLoading(false);
    }
  }, [kindeIsLoading]);
  
  // Try to refresh right after loading
  useEffect(() => {
    if (user && !kindeIsLoading) {
      refreshToken();
    }
  }, [user, kindeIsLoading]);
  
  // Prepare the context value
  const value = {
    isAuthenticated: !!user,
    isLoading,
    error,
    refreshToken,
    user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 