import { create } from "zustand"

interface UserState {
  email: string | null
  name: string | null
  image: string | null
  accessToken: string | null
  authenticated: boolean
  setUser: (
    authenticated: boolean,
    email: string,
    name: string,
    image: string,
    accessToken?: string,
  ) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  email: null,
  name: null,
  image: null,
  accessToken: null,
  authenticated: false,
  setUser: (authenticated, email, name, image, accessToken) =>
    set({ email, name, image, accessToken, authenticated }),
  clearUser: () => set({ email: null, name: null, image: null, accessToken: null, authenticated: false }),
}))
