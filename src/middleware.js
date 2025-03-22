import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

/**
 * Simple middleware to handle authentication across the application
 * This implementation focuses on reliability and consistency
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware executing for path:', pathname);
  
  // 1. Always allow access to static assets and API routes
  if (
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/') ||
    pathname === '/favicon.ico' ||
    /\.(svg|png|jpg|jpeg|gif|ico|pdf|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // 2. Always allow access to the login page and home page
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }
  
  try {
    // 3. Get the authentication token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log('Auth token present:', !!token, 'for path:', pathname);
    
    // 4. Handle authenticated users on login page
    if (token && pathname === '/login') {
      console.log('Redirecting authenticated user from login to growguide');
      return NextResponse.redirect(new URL('/growguide', request.url));
    }
    
    // 5. Handle unauthenticated users on protected routes
    if (!token) {
      console.log('Unauthenticated user attempting to access:', pathname);
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // 6. Allow authenticated users to access protected routes
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
