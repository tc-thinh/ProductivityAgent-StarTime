"use client";

import { SessionProvider } from "next-auth/react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ClientLayout } from "./client-layout"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <SidebarInset>
          <ClientLayout>{children}</ClientLayout>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}