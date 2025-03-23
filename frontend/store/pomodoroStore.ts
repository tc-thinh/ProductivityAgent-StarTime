import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PomodoroState {
  isRunning: boolean
  working: boolean
  timeLeft: number
  iteration: number
  hydrated: boolean
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  switchPhase: () => void
}

const WORK_DURATION = 1500
const SHORT_BREAK_DURATION = 300
const LONG_BREAK_DURATION = 900

const pomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      working: true,
      timeLeft: WORK_DURATION,
      iteration: 1,
      hydrated: false, // Track hydration state
      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      reset: () =>
        set({
          isRunning: false,
          working: true,
          timeLeft: WORK_DURATION,
          iteration: 1,
        }),
      tick: () =>
        set((state) => {
          if (state.isRunning && state.timeLeft > 0) {
            return { timeLeft: state.timeLeft - 1 }
          }
          if (state.isRunning && state.timeLeft === 0) {
            get().switchPhase()
          }
          return {}
        }),
      switchPhase: () =>
        set((state) => {
          if (state.working) {
            const nextIteration = state.iteration < 4 ? state.iteration + 1 : 1
            const breakDuration =
              state.iteration < 4 ? SHORT_BREAK_DURATION : LONG_BREAK_DURATION
            return {
              working: false,
              timeLeft: breakDuration,
              iteration: nextIteration,
            }
          } else {
            return {
              working: true,
              timeLeft: WORK_DURATION,
            }
          }
        }),
    }),
    {
      name: "pomodoro-store",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true // Mark as hydrated
        }
      },
    }
  )
)

export default pomodoroStore
