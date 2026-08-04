"use client";

import type { StateData } from "@/lib/states";
import type { QuizState } from "@/lib/quizEngine";
import { QuizTimer } from "./QuizTimer";
import styles from "@/app/states.module.css";

export function QuizSidebar(props: {
  state: QuizState;
  timerOn: boolean;
  timerSeconds: number;
  onAnswer: (choice: StateData) => void;
  onTimeout: () => void;
}) {
  const { state, timerOn, timerSeconds, onAnswer, onTimeout } = props;
  const { current, quizType, options, score, phase, wrongId, revealId, verdict, total } = state;
  if (!current) return null;

  const answering = phase !== "asking";
  const progressPct = total > 0 ? Math.round((score.total / total) * 100) : 0;
  const prompt = quizType === "findIt" ? `Find ${current.name} on the map` : "What state is highlighted?";

  return (
    <div className={styles.quizSidebar}>
      {/* Screen-reader-only running commentary: the question, then each result. */}
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">
        {verdict ?? prompt}
      </div>

      <div className={styles.quizHeader}>
        <div className={styles.quizHeaderRow}>
          <div className={styles.scoreDisplay} data-testid="score">
            ⭐ {score.correct} / {total}
          </div>
          {timerOn && phase === "asking" && (
            <QuizTimer key={current.id} seconds={timerSeconds} onTimeout={onTimeout} />
          )}
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
        <div className={styles.progressLabel}>{score.total} answered</div>
      </div>

      <div className={styles.quizQuestion} data-testid="question">
        {quizType === "findIt" ? (
          <span>
            🗺️ Find <strong>{current.name}</strong> on the map!
          </span>
        ) : (
          <span>❓ What state is highlighted?</span>
        )}
      </div>

      {/* Visible text verdict so results are never color-and-sound only. */}
      {verdict && (
        <div
          className={`${styles.quizVerdict} ${wrongId || !revealId ? "" : ""} ${
            revealId && !wrongId && verdict.startsWith("Correct") ? styles.quizVerdictGood : styles.quizVerdictBad
          }`}
        >
          {verdict}
        </div>
      )}

      {quizType === "nameIt" ? (
        <div className={styles.quizOptionsStack}>
          {options.map((opt) => (
            <button
              key={opt.id}
              data-testid="option"
              className={`${styles.optionBtn} ${wrongId === opt.id ? styles.optionBtnWrong : ""} ${
                revealId === opt.id && answering ? styles.optionBtnCorrect : ""
              }`}
              onClick={() => onAnswer(opt)}
              disabled={answering}
            >
              {opt.name}
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.findItHint}>
          <span>👆 Click the state on the map</span>
        </div>
      )}
    </div>
  );
}
