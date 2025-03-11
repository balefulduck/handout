import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isHomePage = request.nextUrl.pathname === '/';

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
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    // If user is authenticated and tries to access auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
