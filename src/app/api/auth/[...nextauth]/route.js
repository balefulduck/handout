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
            name: user.username,
            onboarding_completed: user.onboarding_completed
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
        token.onboarding_completed = user.onboarding_completed;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.onboarding_completed = token.onboarding_completed;
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  debug: true
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
