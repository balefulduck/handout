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

    // Use relative URLs for redirects to avoid cross-environment issues
    // This ensures consistent behavior between development and production
    let redirectUrl = destination;
    
    // Ensure the path starts with a slash
    if (!redirectUrl.startsWith('/')) {
      redirectUrl = `/${redirectUrl}`;
    }
    
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
