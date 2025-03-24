import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PomodoroState {
  isRunning: boolean
  working: boolean
  timeLeft: number
  iteration: number
  hydrated: boolean
  show: boolean
  backgroundColor: string // "rgb(222, 93, 131)"
  foregroundColor: string // "rgb(241, 232, 223)"
  pomodoroStatus: string // "Blush D'Amour"

  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  switchPhase: () => void
  turnOn: () => void 
  turnOff: () => void
}

const WORK_DURATION = 1500
const SHORT_BREAK_DURATION = 300
const LONG_BREAK_DURATION = 900
const colorPalette = {
  active: [
    {
      backgroundColor: "rgb(222, 93, 131)",
      foregroundColor: "rgb(241, 232, 223)",
      pomodoroStatus: "Blush D'Amour",
    }, 
    {
      backgroundColor: "rgb(34, 32, 54)",
      foregroundColor: "rgb(129, 235, 73)",
      pomodoroStatus: "Feeling Kiwi 🥝",
    },
    {
      backgroundColor: "rgb(236, 39, 95)",
      foregroundColor: "rgb(255, 220, 220)",
      pomodoroStatus: "Cherry Blossom",
    },
    {
      backgroundColor: "rgb(255, 198, 39)",
      foregroundColor: "rgb(140, 29, 64)",
      pomodoroStatus: "Forks Up! 🔱",
    },
    {
      backgroundColor: "rgb(126, 249, 255)",
      foregroundColor: "rgb(11, 6, 246)",
      pomodoroStatus: "Electric Blue",
    },
    {
      backgroundColor: "rgb(71, 24, 8)",
      foregroundColor: "rgb(241, 132, 39)",
      pomodoroStatus: "Chocolate Rush",
    }
  ],
  passive: [
    {
      backgroundColor: "rgb(50, 147, 179)",
      foregroundColor: "rgb(181, 234, 224)",
      pomodoroStatus: "See me @ Navagio",
    },
    {
      backgroundColor: "rgb(196, 197, 201)",
      foregroundColor: "rgb(87, 89, 101)",
      pomodoroStatus: "Shhhh...",
    },
    {
      backgroundColor: "rgb(86, 88, 100)",
      foregroundColor: "rgb(249, 251, 250)",
      pomodoroStatus: "Midnight Badger 🦡",
    },
    {
      backgroundColor: "rgb(129, 150, 229)",
      foregroundColor: "rgb(242, 244, 255)",
      pomodoroStatus: "Dreaming...",
    },
    {
      backgroundColor: "rgb(240, 241, 245)",
      foregroundColor: "rgb(81, 56, 111)",
      pomodoroStatus: "Succinct Violet",
    }
  ],
}
const chooseRandom = (items: any[]) => {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

const sendNotification = (message: string) => {
  if ("Notification" in window && Notification.permission === "granted") {
      new Notification("", {
          body: message,
      })
  }
}

const pomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      working: true,
      timeLeft: WORK_DURATION,
      iteration: 1,
      hydrated: false, // Track hydration state
      show: false,     // New state property to control banner visibility
      ...chooseRandom(colorPalette.active),

      start: () => set({ isRunning: true }),
      pause: () => set({ isRunning: false }),
      reset: () =>
        set({
          isRunning: false,
          working: true,
          timeLeft: WORK_DURATION,
          iteration: 1,
          ...chooseRandom(colorPalette.active)
        }),
      tick: () =>
        set((state) => {
          if (state.isRunning && state.timeLeft > 0) {
            return { timeLeft: state.timeLeft - 1 }
          }
          if (state.isRunning && state.timeLeft === 0) {
            sendNotification(
              state.working ? "Time for a break! 🎉" : "Back to work! 💪"
            )
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
              ...chooseRandom(colorPalette.passive),
            }
          } else {
            return {
              working: true,
              timeLeft: WORK_DURATION,
              ...chooseRandom(colorPalette.active),
            }
          }
        }),
      turnOn: () =>
        set((state) => ({ show: true })), 
      turnOff: () =>
        set((state) => {
          get().reset()
          return ({ show: false })
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
