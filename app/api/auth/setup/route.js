import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * This endpoint replaces the built-in Kinde setup endpoint
 * It handles token expiration more gracefully
 */
export async function GET() {
  try {
    const { getUser, getAccessToken, isAuthenticated } = getKindeServerSession();
    
    // Check if authenticated first
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get user data and token
    const [user, token] = await Promise.all([
      getUser(),
      getAccessToken()
    ]);
    
    if (!user || !token) {
      return NextResponse.json(
        { error: 'Failed to retrieve user data' },
        { status: 401 }
      );
    }
    
    // Return user data
    return NextResponse.json({
      user,
      token
    });
  } catch (error) {
    console.error('Auth setup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Authentication error',
        message: error.message,
        code: error.code
      },
      { status: 401 }
    );
  }
} 