import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { signIn, signOut } from 'next-auth/react'
import { NextApiRequest, NextApiResponse } from 'next'

const BACKEND_URL = process.env.NEXT_PUBLIC_HTTP_BACKEND

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account && account.provider === "google") {
        const response = await fetch(`${BACKEND_URL}/database/auth/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_in: account.expires_in,
            scope: account.scope,
            token_type: account.token_type,
          }),
        })

        if (!response.ok) {
          console.error('Failed to send auth token to backend')
          return false
        }

        return true
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;
      }

      if (user) {
        token.user = user;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user!,
      session.accessToken = token.accessToken as string

      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

interface AuthHandler {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>
}

const authHandler: AuthHandler = (req, res) => NextAuth(req, res, authOptions)

export { authHandler as GET, authHandler as POST, signIn, signOut }
