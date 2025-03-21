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
      
      // Always use relative URLs for redirects
      // This ensures consistent behavior across environments
      
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
      if (path.includes('/api/auth/signout') || path.includes('/api/auth/logout')) {
        console.log('Logout callback - redirecting to /login');
        return '/login';
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
  // Session configuration
  session: {
    // Use JWT strategy for sessions
    strategy: "jwt",
    // Session will last for 30 days
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Update session every time it's used
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  // JWT configuration
  jwt: {
    // How long until the JWT expires
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Cookie security settings
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Explicitly disable absolute URLs for redirects
  // This ensures we always use relative URLs which work across environments
  forceAbsoluteUrls: false,
  
  // Cookie configuration
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
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.csrf-token`,
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
