import { NextResponse } from 'next/server'
import { getAuthenticatedSession } from './lib/auth'

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  try {
    // Use our custom auth function that handles token expiration
    const { isAuthenticated } = await getAuthenticatedSession();

    if (!isAuthenticated) {
      // Redirect to login when not authenticated or token expired
      return NextResponse.redirect(new URL('/api/auth/login?post_login_redirect_url=/dashboard', request.url));
    }
    
    // User is authenticated, proceed with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // For any auth errors, redirect to login
    return NextResponse.redirect(new URL('/api/auth/login?post_login_redirect_url=/dashboard', request.url));
  }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/dashboard/:path*',
}