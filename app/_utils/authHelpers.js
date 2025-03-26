/**
 * Client-side utility for handling authentication token refresh
 */

/**
 * Refreshes the authentication token when it expires
 * @returns {Promise<boolean>} True if refresh was successful
 */
export const refreshAuthToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh');
    if (!response.ok) {
      const data = await response.json();
      console.error('Token refresh failed:', data);
      
      // If unauthorized, redirect to login
      if (response.status === 401) {
        window.location.href = '/api/auth/login?post_login_redirect_url=/dashboard';
        return false;
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

/**
 * Handles API responses that might have auth errors
 * @param {Response} response - The fetch API response
 * @returns {Promise<any>} The response data or throws an error
 */
export const handleAuthResponse = async (response) => {
  if (response.status === 401) {
    // Try to refresh the token
    const refreshed = await refreshAuthToken();
    
    if (!refreshed) {
      // If refresh failed, redirect to login
      window.location.href = '/api/auth/login?post_login_redirect_url=/dashboard';
      throw new Error('Authentication failed');
    }
    
    // Token refreshed, retry the original request
    return fetch(response.url, {
      method: response.method,
      headers: response.headers,
      body: response.bodyUsed ? null : await response.blob(),
    }).then(res => res.json());
  }
  
  // If not an auth error, process normally
  return response.json();
}; 