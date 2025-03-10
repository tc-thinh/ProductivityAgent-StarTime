import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { signIn, signOut } from 'next-auth/react'
import { NextApiRequest, NextApiResponse } from 'next'

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
        return true 
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async jwt({ token, user, account }) {
      // Store Google API access token
      if (account) {
        token.accessToken = account.access_token;
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
