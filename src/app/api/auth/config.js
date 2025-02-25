import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth attempt:', { username: credentials?.username });

        if (!credentials?.username || !credentials?.password) {
          console.log('Missing credentials');
          throw new Error("Bitte Benutzername und Passwort eingeben");
        }

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
