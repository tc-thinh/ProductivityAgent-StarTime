import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useUserStore } from "@/store/userStore"

export function useAuthSync() {
  const { data: session, status } = useSession()
  const setUser = useUserStore((state) => state.setUser)
  const clearUser = useUserStore((state) => state.clearUser)

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setUser(
        true,
        session.user.email || "",
        session.user.name || "",  
        session.user.image || "", 
        session.accessToken || ""
      )
    } else if (status === "unauthenticated") {
      clearUser()
    }
  }, [session, status, setUser, clearUser])
}
