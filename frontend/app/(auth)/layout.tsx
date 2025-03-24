
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "StarTime Productivity",
  description: "AI-agent Productivity Hub",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
