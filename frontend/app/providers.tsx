"use client"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ClientLayout } from "./client-layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SessionProvider } from "next-auth/react"
import pomodoroStore from "@/store/pomodoroStore"
import { useAuthSync } from "@/hooks/useAuthAsync"

import QuickActions from "@/components/quick-actions/quick-actions"
import PomodoroTimer from "@/components/pomodoro-timer/pomodoroTimer"


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </SessionProvider>
  )
}

// This wrapper ensures useSession is inside SessionProvider
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { show: pomodoroShow } = pomodoroStore()
  useAuthSync()
  return (
    <TooltipProvider>
      <SidebarProvider>
        <SidebarInset>
          <ClientLayout>{children}</ClientLayout>
        </SidebarInset>
      </SidebarProvider>
      <QuickActions />
      {pomodoroShow && <PomodoroTimer />}
    </TooltipProvider>
  )
}
