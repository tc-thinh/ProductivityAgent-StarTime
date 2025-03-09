import { AppSidebar } from "@/components/sidebar-components/app-sidebar";
import { Toaster } from "@/components/ui/sonner"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { SessionProvider } from "next-auth/react"
import { Providers } from "@/app/providers"

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

export default function GeneralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
