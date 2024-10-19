// src/lib/auth.ts

import { AuthOptions, SessionStrategy } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.password) {
            throw new Error('No password set for this user');
          }

          // Compare the provided password with the stored hashed password
          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          // Return user object with isAdmin
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error('Error in authorize function:', error);
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Ensure 'user.id' is a string
        token.isAdmin = user.isAdmin; // Include isAdmin in JWT
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string; // Ensure 'token.id' is a string
        session.user.isAdmin = token.isAdmin as boolean; // Include isAdmin in session
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error', // Optional: Custom error page
  },
};
