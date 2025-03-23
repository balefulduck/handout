import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing auth route on server side');
}

// Determine the base URL for the application
// This is critical for avoiding localhost references in production
const getBaseUrl = () => {
  // Check for explicitly set NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // In production, try to determine the URL from request headers
  if (process.env.NODE_ENV === 'production') {
    // Default to https and the VERCEL_URL if available
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    // For other hosting platforms, we'll need to set NEXTAUTH_URL in env
    return 'https://your-production-domain.com';
  }
  
  // In development, default to localhost
  return 'http://localhost:3000';
};

// Define default error messages for authentication
const AUTH_ERRORS = {
  DEFAULT: 'Ein Fehler ist aufgetreten',
  USER_NOT_FOUND: 'Benutzer nicht gefunden',
  INVALID_PASSWORD: 'Falsches Passwort',
  MISSING_CREDENTIALS: 'Bitte Benutzername und Passwort eingeben'
};

export const authOptions = {
  // Set the correct base URL for all environments
  baseUrl: getBaseUrl(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        if (typeof window !== 'undefined') {
          throw new Error('Cannot authenticate on client side');
        }

        console.log('Auth attempt for:', credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          return Promise.reject(new Error(AUTH_ERRORS.MISSING_CREDENTIALS));
        }

        try {
          // Find user with exact username match
          const user = db.prepare(
            "SELECT * FROM users WHERE username = ? COLLATE NOCASE"
          ).get(credentials.username);

          if (!user) {
            console.log('User not found:', credentials.username);
            return Promise.reject(new Error(AUTH_ERRORS.USER_NOT_FOUND));
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.username);
            return Promise.reject(new Error(AUTH_ERRORS.INVALID_PASSWORD));
          }

          console.log('Authentication successful for:', credentials.username);
          
          // Return a user object with explicit id, name and admin status
          return {
            id: user.id,
            name: user.username,
            email: user.email || null,
            isAdmin: user.is_admin === 1 || false // Ensure boolean value with fallback
          };
        } catch (error) {
          console.error('Auth error:', error.message);
          return Promise.reject(new Error(AUTH_ERRORS.DEFAULT));
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      return session;
    },
    async redirect() {
      // Extremely simplified redirect handler
      // Let the client-side code handle all redirects
      // This effectively disables NextAuth's redirect handling
      return '/growguide';
    }
  },
  pages: {
    signIn: '/login'
  },
  // Session configuration - simplified
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Pages configuration
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login', // Error messages will be displayed on the login page
  },
  
  // Debug mode in development only
  debug: process.env.NODE_ENV !== "production",
  
  // Security settings
  secret: process.env.NEXTAUTH_SECRET,
  
  // URLs - only set in production if NEXTAUTH_URL is available
  ...(process.env.NEXTAUTH_URL && process.env.NODE_ENV === "production" ? {
    url: process.env.NEXTAUTH_URL,
  } : {}),
  
  // Simplified cookie settings to work with DigitalOcean's deployment
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV !== "production"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
