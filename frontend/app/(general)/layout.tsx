import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"
import Wrapper from "@/app/(general)/layoutWrapper"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
})

export const metadata: Metadata = {
  title: "StarTime Productivity",
  description: "AI-agent Productivity Hub",
}

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Wrapper>{children}</Wrapper>
      </body>
    </html>
  )
}
