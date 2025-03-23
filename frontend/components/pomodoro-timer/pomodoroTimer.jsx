"use client"

import React, { useEffect, useState } from "react";
import pomodoroStore from "@/store/pomodoroStore";

const PomodoroTimer = () => {
  const { timeLeft, isRunning, start, pause, reset, tick, hydrated } = pomodoroStore();

  // Local state to track hydration
  const [isHydrated, setIsHydrated] = useState(false);

  // Ensure hydration is properly tracked
  useEffect(() => {
    if (hydrated) {
      setIsHydrated(true);
    }
  }, [hydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [tick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!isHydrated) {
    return <div style={{ position: "fixed", right: 0, top: "33%" }}>Loading Pomodoro...</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "33%",
        right: 0,
        padding: "1rem",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <h1 style={{ margin: 0 }}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </h1>
      <div style={{ marginTop: "0.5rem" }}>
        {!isRunning ? (
          <button onClick={start}>Start</button>
        ) : (
          <button onClick={pause}>Pause</button>
        )}
        <button onClick={reset} style={{ marginLeft: "0.5rem" }}>
          Reset
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
