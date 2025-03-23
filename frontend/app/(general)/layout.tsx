import { Providers } from "@/app/providers"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/app/globals.css"

import QuickActions from "@/components/quick-actions/quick-actions"
import PomodoroTimer from "@/components/pomodoro-timer/pomodoroTimer"
import { TooltipProvider } from "@/components/ui/tooltip"

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
        <TooltipProvider>
          <Providers>
            {children}
          </Providers>
          <QuickActions />
          <PomodoroTimer />
        </TooltipProvider>
      </body>
    </html>
  )
}
