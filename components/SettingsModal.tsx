"use client";

import { useEffect, useRef } from "react";
import type { QuestionMode } from "@/lib/quizEngine";
import styles from "@/app/states.module.css";

type Difficulty = 1 | 2 | 3 | 4 | 5;

const QUESTION_MODES: { value: QuestionMode; label: string }[] = [
  { value: "mixed", label: "Mixed" },
  { value: "nameIt", label: "Name it" },
  { value: "findIt", label: "Find it" },
];

export function SettingsModal(props: {
  difficulty: Difficulty;
  onDifficulty: (d: Difficulty) => void;
  soundOn: boolean;
  onSound: (v: boolean) => void;
  timerOn: boolean;
  onTimer: (v: boolean) => void;
  questionMode: QuestionMode;
  onQuestionMode: (m: QuestionMode) => void;
  timerSeconds: number;
  onClose: () => void;
}) {
  const { difficulty, onDifficulty, soundOn, onSound, timerOn, onTimer, questionMode, onQuestionMode, timerSeconds, onClose } = props;
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Focus the dialog on open, trap Tab inside it, and close on Escape. Focus is
  // returned to the trigger by the caller (which restores it on unmount).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const first = card.querySelector<HTMLElement>("button, [tabindex]");
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      );
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle} id="settings-title">
            SETTINGS
          </h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>
        <div className={styles.modalDivider} />

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle} id="difficulty-label">
            DIFFICULTY
          </div>
          <div className={styles.modalTiles} role="radiogroup" aria-labelledby="difficulty-label">
            {([1, 2, 3, 4, 5] as const).map((level) => (
              <button
                key={level}
                role="radio"
                aria-checked={difficulty === level}
                aria-label={`Difficulty ${level}`}
                className={`${styles.modalTile} ${difficulty === level ? styles.modalTileActive : ""}`}
                onClick={() => onDifficulty(level)}
              >
                {level}⭐
              </button>
            ))}
          </div>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle} id="mode-label">
            QUESTION TYPE
          </div>
          <div className={styles.modalTiles} role="radiogroup" aria-labelledby="mode-label">
            {QUESTION_MODES.map((m) => (
              <button
                key={m.value}
                role="radio"
                aria-checked={questionMode === m.value}
                className={`${styles.modalTile} ${styles.modalTileWide} ${questionMode === m.value ? styles.modalTileActive : ""}`}
                onClick={() => onQuestionMode(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.modalSection}>
          <div className={styles.modalSectionTitle}>OPTIONS</div>
          <div className={styles.modalToggles}>
            <button
              className={`${styles.modalToggle} ${soundOn ? styles.modalToggleActive : ""}`}
              aria-pressed={soundOn}
              onClick={() => onSound(!soundOn)}
            >
              {soundOn ? "🔊" : "🔇"} Sound
            </button>
            <button
              className={`${styles.modalToggle} ${timerOn ? styles.modalToggleActive : ""}`}
              aria-pressed={timerOn}
              onClick={() => onTimer(!timerOn)}
            >
              {timerOn ? "⏱️" : "⏳"} Timer {timerOn && <span className={styles.timerDetail}>({timerSeconds}s)</span>}
            </button>
          </div>
        </div>

        <button className={styles.modalSaveBtn} onClick={onClose}>
          SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  );
}
