import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  
  try {
    // Get the token with explicit configuration
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log('Auth token present:', !!token);
    
    // Define route types
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isHomePage = request.nextUrl.pathname === '/';
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
    const isPublicAsset = [
      '/_next/', '/favicon.ico', '/images/', '/fonts/'
    ].some(path => request.nextUrl.pathname.startsWith(path));
    
    // Always allow API routes and public assets
    if (isApiRoute || isPublicAsset) {
      return NextResponse.next();
    }

    // Always allow access to login page if not authenticated
    if (isAuthPage && !token) {
      return NextResponse.next();
    }

    // Always allow access to home page
    if (isHomePage) {
      return NextResponse.next();
    }

    // Redirect to login if no token and trying to access protected routes
    if (!token && !isAuthPage) {
      console.log('No auth token - redirecting to login');
      // Use relative URL for consistent behavior
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // If user is authenticated and tries to access auth pages
    if (token && isAuthPage) {
      console.log('User is authenticated and on login page - redirecting to growguide');
      // Use relative URL for consistent behavior
      return NextResponse.redirect(new URL('/growguide', request.url));
    }
    
    // User is authenticated and accessing a protected route - allow access
    if (token) {
      return NextResponse.next();
    }

    console.log('Default middleware pass-through');
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Fall back to allowing the request through in case of errors
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
