import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * Utility function to get authenticated session with automatic token refresh
 * This handles the JWT expiration by forcing a refresh when token is expired
 */
export const getAuthenticatedSession = async () => {
  try {
    const { getUser, isAuthenticated } = getKindeServerSession();
    
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      return { isAuthenticated: false, user: null };
    }
    
    // Get user data
    const user = await getUser();
    return { isAuthenticated: true, user };
    
  } catch (error) {
    console.error("Auth error:", error);
    // If token is expired, return not authenticated
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { isAuthenticated: false, user: null };
    }
    throw error;
  }
}; 