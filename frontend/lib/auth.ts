import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { signIn, signOut } from 'next-auth/react'
import { NextApiRequest, NextApiResponse } from 'next'
import { useUserStore } from '@/store/userStore'

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
      if (account && profile?.email) {
        const response = await fetch(`${BACKEND_URL}/database/auth/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: profile.email, 
            google_auth: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_in: account.expires_in,
              scope: account.scope,
              token_type: account.token_type,
            },
          }),
        })

        if (!response.ok) {
          console.error('Failed to send auth token to backend')
          return false
        }
        
        console.log(account)
        const data = await response.json()

        account.backendAccessToken = data.token
        return true
      }
      return false
    },
    async redirect({ url, baseUrl }) {
      return baseUrl
    },
    async jwt({ token, account }) {
      if (account) {
        token.backendAccessToken = account.backendAccessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach user data and accessToken to the session
      if (token.user) {
        session.user = token.user
      }

      if (token.backendAccessToken) {
        session.accessToken = token.backendAccessToken as string
      }
      return session;
    },
  },
}

interface AuthHandler {
  (req: NextApiRequest, res: NextApiResponse): Promise<void>
}

const authHandler: AuthHandler = (req, res) => NextAuth(req, res, authOptions)

export { authHandler as GET, authHandler as POST, signIn, signOut }
