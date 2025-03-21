import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  console.log('Middleware executing for path:', request.nextUrl.pathname);
  console.log('Request URL:', request.url);
  
  try {
    // Enhanced token retrieval with more debugging
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log('Auth token present:', !!token);
    if (!token) {
      console.log('Cookie headers:', request.headers.get('cookie'));
    }
    
    const isAuthPage = request.nextUrl.pathname.startsWith('/login');
    const isHomePage = request.nextUrl.pathname === '/';

    // Always allow access to login page if not authenticated
    if (isAuthPage && !token) {
      console.log('Allowing access to login page for unauthenticated user');
      return NextResponse.next();
    }

    // Always allow access to home page
    if (isHomePage) {
      console.log('Allowing access to home page');
      return NextResponse.next();
    }

    // Redirect to login if no token and trying to access protected routes
    if (!token && !isAuthPage) {
      console.log('No auth token - redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (token) {
      // If user is authenticated and tries to access auth pages
      if (isAuthPage) {
        console.log('User is authenticated and on login page - redirecting to growguide');
        // Enhanced redirect with more specific URL construction
        const baseUrl = request.nextUrl.origin;
        const redirectUrl = new URL('/growguide', baseUrl);
        console.log('Redirecting to:', redirectUrl.toString());
        
        // Create a response with explicit headers
        const response = NextResponse.redirect(redirectUrl);
        
        // Ensure headers are properly set
        response.headers.set('Cache-Control', 'no-store, max-age=0');
        
        return response;
      }
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
