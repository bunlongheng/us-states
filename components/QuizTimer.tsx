"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/states.module.css";

// Self-contained countdown. Remounted per question via a `key` on the caller side,
// so the starting value comes from the useState initializer (never a setState in an
// effect). The interval's setState is async, and onTimeout is deferred out of the
// updater, so this component holds zero synchronous-setState-in-effect.
export function QuizTimer({ seconds, onTimeout }: { seconds: number; onTimeout: () => void }) {
  const [left, setLeft] = useState(seconds);
  const firedRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((p) => {
        const next = p - 1;
        if (next <= 0 && !firedRef.current) {
          firedRef.current = true;
          clearInterval(id);
          queueMicrotask(() => onTimeoutRef.current());
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`${styles.timerDisplay} ${left <= 3 ? styles.timerCritical : ""}`}
      role="timer"
      aria-label={`${left} seconds left`}
    >
      {left}s
    </div>
  );
}
