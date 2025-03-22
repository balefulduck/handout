import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// This ensures we only use the database on the server side
if (typeof window === 'undefined') {
  console.log('Initializing auth route on server side');
}

export const authOptions = {
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
          return null; // Return null instead of throwing to trigger proper NextAuth error handling
        }

        try {
          // Find user with exact username match
          const user = db.prepare(
            "SELECT * FROM users WHERE username = ? COLLATE NOCASE"
          ).get(credentials.username);

          if (!user) {
            console.log('User not found:', credentials.username);
            // Return null instead of throwing to trigger proper NextAuth error handling
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          
          if (!isValid) {
            console.log('Invalid password for user:', credentials.username);
            // Return null instead of throwing to trigger proper NextAuth error handling
            return null;
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
          return null; // Return null to trigger NextAuth error handling
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
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect called for:', url);
      
      // Extremely simplified redirect logic for DigitalOcean compatibility
      // The simpler this function, the more reliable it will be across environments
      
      // For login-related paths, always send to growguide
      if (url.includes('/login') || url.includes('/api/auth/signin') || 
          url.includes('/api/auth/callback') || url.includes('callback')) {
        console.log('Auth flow detected - redirecting to /growguide');
        return '/growguide';
      }
      
      // For logout-related paths, always go to login
      if (url.includes('/signout') || url.includes('/logout')) {
        console.log('Logout flow detected - redirecting to /login');
        return '/login';
      }
      
      // For all other URLs, extract just the path for consistency
      // This avoids any localhost references in the URL
      try {
        // If it's an absolute URL, extract just the path
        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          return urlObj.pathname || '/growguide';
        }
      } catch (error) {
        console.error('Error parsing redirect URL:', error);
      }
      
      // For any other cases, use the URL as is if it starts with /
      // Otherwise make it relative by adding a leading /
      return url.startsWith('/') ? url : `/${url}`;
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
