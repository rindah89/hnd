import { NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

/**
 * API endpoint to refresh the Kinde auth token
 * This can be called by client-side code when a token expires
 */
export async function GET() {
  try {
    const { getAccessToken } = getKindeServerSession();
    
    // Fetch a new token - Kinde handles the refresh internally
    const token = await getAccessToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    
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