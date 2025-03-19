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
      // Force redirect to /growguide after sign in
      if (url.startsWith(baseUrl)) {
        // If this is an internal URL, decide where to redirect
        if (url.includes('/api/auth/signin') || url.includes('/api/auth/callback') || url.includes('/login')) {
          console.log('Auth callback - redirecting to /growguide');
          return `${baseUrl}/growguide`;
        }
      }
      // Default redirect behavior
      return url.startsWith(baseUrl) ? url : baseUrl;
    }
  },
  pages: {
    signIn: '/login'
  },
  // Properly configure URLs for different environments
  // This prevents incorrect redirects after logout
  useSecureCookies: process.env.NODE_ENV === "production",
  // Add URL configuration based on environment
  ...(process.env.NEXTAUTH_URL
    ? {
        // If NEXTAUTH_URL is set in environment, use it
        url: process.env.NEXTAUTH_URL,
      }
    : {
        // In development, default to localhost
        url: process.env.NODE_ENV === "production"
          ? "https://" + process.env.DOMAIN || "https://drc420.team"
          : "http://localhost:3000",
      }),
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      },
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      },
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      },
    },
  },
  debug: process.env.NODE_ENV !== "production"
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
