import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

/**
 * Enhanced middleware to handle authentication across the application
 * This implementation focuses on reliability and consistency
 */
export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  
  // Check for logout-related cookies to ensure proper logout handling
  const cookies = request.cookies;
  const isLoggingOut = cookies.get('next-auth.session-token') === undefined && 
                      cookies.get('__Secure-next-auth.session-token') === undefined;
  
  console.log('Middleware executing for path:', pathname, 'Logging out:', isLoggingOut);
  
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
  
  // 3. Special handling for logout - always redirect to login
  if (pathname.includes('/signout') || pathname.includes('/logout')) {
    console.log('Detected logout request, will redirect to login');
    return NextResponse.next();
  }
  
  try {
    // 4. Get the authentication token with strict validation
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log('Auth token present:', !!token, 'for path:', pathname);
    
    // 5. Handle authenticated users on login page
    if (token && pathname === '/login') {
      console.log('Redirecting authenticated user from login to growguide');
      return NextResponse.redirect(new URL('/growguide', request.url));
    }
    
    // 6. Strict check for protected routes - ensure token is valid
    // Special handling for critical routes
    const criticalRoutes = ['/growguide', '/plants', '/help'];
    const isCriticalRoute = criticalRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );
    
    // Check for admin routes
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    
    if (!token || (isCriticalRoute && !token)) {
      console.log('Unauthenticated user attempting to access:', pathname);
      url.pathname = '/login';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    
    // Restrict admin routes to users with admin role
    if (isAdminRoute && !token.isAdmin) {
      console.log('Non-admin user attempting to access admin route:', pathname);
      return NextResponse.redirect(new URL('/growguide', request.url));
    }
    
    // 7. Allow authenticated users to access protected routes
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    url.pathname = '/login';
    return NextResponse.redirect(url);
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
