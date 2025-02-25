import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const isOnboarding = request.nextUrl.pathname.startsWith('/onboarding');

  // Always allow access to login page if not authenticated
  if (isAuthPage && !token) {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected routes
  if (!token && (isOnboarding || request.nextUrl.pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token) {
    // If user is authenticated but hasn't completed onboarding
    if (!token.onboarding_completed && !isOnboarding) {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If user is authenticated and tries to access auth pages
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If user has completed onboarding, don't allow access to onboarding page
    if (token.onboarding_completed && isOnboarding) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding/:path*',
    '/login',
  ],
};
