import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
];

// Define public file patterns that should bypass middleware
const PUBLIC_FILE_PATTERNS = [
  /\.(svg|png|jpg|jpeg|gif|ico|pdf|woff|woff2|ttf|eot)$/,
  /^\/_next\//,
  /^\/api\//,
  /^\/favicon\.ico$/,
  /^\/images\//,
  /^\/fonts\//,
];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware executing for path:', pathname);
  
  try {
    // Check if the request is for a public file or API
    if (PUBLIC_FILE_PATTERNS.some(pattern => 
      typeof pattern === 'string' ? pathname.startsWith(pattern) : pattern.test(pathname)
    )) {
      return NextResponse.next();
    }
    
    // Check if the route is public
    if (PUBLIC_ROUTES.some(route => pathname === route)) {
      return NextResponse.next();
    }
    
    // Get the token with explicit configuration
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production"
    });
    
    console.log('Auth token present:', !!token);
    
    // If user is on login page and already authenticated, redirect to growguide
    if (token && pathname === '/login') {
      console.log('User is authenticated and on login page - redirecting to growguide');
      return NextResponse.redirect(new URL('/growguide', request.url));
    }
    
    // If no token and not on a public route, redirect to login
    if (!token) {
      console.log('No auth token - redirecting to login');
      // Cache the attempted URL to redirect back after login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // User is authenticated and accessing a protected route - allow access
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // For security, redirect to login on errors rather than allowing access
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public file extensions (.svg, .png, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
