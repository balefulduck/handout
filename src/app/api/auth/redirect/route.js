import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * API endpoint to handle server-side redirects after authentication
 * This helps bypass client-side routing issues that may occur in production
 */
export async function POST(request) {
  try {
    // Verify the user is authenticated
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Get the destination from the request body
    const body = await request.json();
    const { destination } = body;

    if (!destination) {
      return NextResponse.json(
        { error: 'Missing destination', success: false }, 
        { status: 400 }
      );
    }

    // Build the full URL for the redirect
    const baseUrl = process.env.NEXTAUTH_URL || 
                   (process.env.NODE_ENV === "production" 
                    ? `https://${process.env.DOMAIN || 'www.drc420.team'}`
                    : 'http://localhost:3000');
    
    const redirectUrl = new URL(destination, baseUrl).toString();
    
    console.log(`Server-side redirect prepared: ${redirectUrl}`);

    // If we made it here, provide the redirect URL for the client to use
    return NextResponse.json({
      success: true,
      redirectUrl,
      message: 'Redirect successful',
    });
  } catch (error) {
    console.error('Server-side redirect error:', error);
    return NextResponse.json(
      { error: error.message, success: false }, 
      { status: 500 }
    );
  }
}
