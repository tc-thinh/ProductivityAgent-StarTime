import { create } from 'zustand'
import { Path } from "@/lib/types"

interface BreadcrumbPathState {
  path: Path[]
  setPath: (newPath: Path[]) => void
  push: (segment: Path) => void
  pop: () => void
}

const useBreadcrumbPath = create<BreadcrumbPathState>((set, get) => ({
  path: [],
  setPath: (newPath) => set({ path: newPath }),
  push: (segment) => set((state) => ({ path: [...state.path, segment] })),
  pop: () => set((state) => ({ path: state.path.slice(0, -1) })),
}))

export default useBreadcrumbPath