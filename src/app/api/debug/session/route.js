import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/config";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Return session info and headers for debugging
    return NextResponse.json({
      authenticated: !!session,
      session: session,
      cookies: request.headers.get('cookie'),
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
