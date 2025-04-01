import { create } from 'zustand'

interface ApplicationState {
    sidebarRefreshTrigger: number
    refreshSidebar: () => void
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  sidebarRefreshTrigger: 0,
  refreshSidebar: () => set({ sidebarRefreshTrigger: 1 - get().sidebarRefreshTrigger })
}))
