"use client";

import { SessionProvider } from "next-auth/react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ClientLayout } from "./client-layout"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <ClientLayout>{children}</ClientLayout>
      </SidebarProvider>
    </SessionProvider>
  );
}