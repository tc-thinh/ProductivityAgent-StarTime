import { create } from "zustand"
import { persist } from "zustand/middleware"

interface UserState {
  email: string | null
  name: string | null
  image: string | null
  accessToken: string | null
  authenticated: boolean
  hydrated: boolean // Track rehydration
  setUser: (
    authenticated: boolean,
    email: string,
    name: string,
    image: string,
    accessToken?: string,
  ) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      email: null,
      name: null,
      image: null,
      accessToken: null,
      authenticated: false,
      hydrated: false, 

      setUser: (authenticated, email, name, image, accessToken) => {
        console.log("Setting user in Zustand:", { authenticated, email, name, image, accessToken })
        set({ email, name, image, accessToken, authenticated })
      },

      clearUser: () => {
        console.log("Clearing user from Zustand")
        set({ email: null, name: null, image: null, accessToken: null, authenticated: false })
      },
    }),
    {
      name: "user-store",
      onRehydrateStorage: () => (state) => {
        console.log("Rehydrating Zustand store:", state)
        if (state) {
          state.hydrated = true 
        }
      },
    }
  )
)
