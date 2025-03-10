import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { signIn, signOut } from 'next-auth/react'

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        return true 
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Redirect to home page after successful login
      return baseUrl;
    },
    async signInError({ error }) {
      console.error('Error during sign in:', error)
      return '/error' // Redirect to error page
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const authHandler = (req, res) => NextAuth(req, res, options)

export { authHandler as GET, authHandler as POST, signIn, signOut }
