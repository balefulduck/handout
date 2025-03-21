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

        console.log('Auth attempt:', { username: credentials?.username });

        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error("Bitte Benutzername und Passwort eingeben");
        }

        try {
          const user = db.prepare(
            "SELECT * FROM users WHERE username = ?"
          ).get(credentials.username);

          console.log('Found user:', user ? 'yes' : 'no');

          if (!user) {
            throw new Error("Benutzer nicht gefunden");
          }

          console.log('Comparing passwords...');
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          console.log('Password valid:', isValid);

          if (!isValid) {
            throw new Error("Falsches Passwort");
          }

          return {
            id: user.id,
            name: user.username
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback called with:', { url, baseUrl });
      
      // Extract the path from URL if it's absolute
      let path = url;
      try {
        // If the URL is absolute, extract just the pathname
        if (url.startsWith('http')) {
          const urlObj = new URL(url);
          path = urlObj.pathname;
          console.log('Extracted path from absolute URL:', path);
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
      
      // Handle sign-in redirects
      if (path.includes('/api/auth/signin') || path.includes('/api/auth/callback') || path.includes('/login')) {
        console.log('Auth callback - redirecting to /growguide');
        return '/growguide';
      }
      
      // Handle sign-out redirects
      if (path.includes('/api/auth/signout') || path.includes('/logout')) {
        console.log('Logout detected in NextAuth redirect callback');
        return '/login';
      }
      
      // For any other paths, use them directly as relative URLs
      return path.startsWith('/') ? path : `/${path}`;
    }
  },
  pages: {
    signIn: '/login'
  },
  // Properly configure URLs for different environments
  // This prevents incorrect redirects after logout
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Set the base URL for NextAuth
  // Only using the URL setting when explicitly provided
  ...(process.env.NEXTAUTH_URL
    ? {
        url: process.env.NEXTAUTH_URL,
      }
    : {}),
      
  // Don't use baseUrl at all - we're using only relative URLs for redirects
  // This avoids any issues with domain mismatches
  
  // Explicitly disable absolute URLs for redirects
  forceAbsoluteUrls: false,
      
  // Configure cookies with more permissive settings for cross-domain issues
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Don't set domain in production to use the default top-level domain
        domain: undefined,
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: undefined,
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: undefined,
      },
    },
  },
  debug: process.env.NODE_ENV !== "production"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
