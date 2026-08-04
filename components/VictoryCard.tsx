"use client";

import type { StateData } from "@/lib/states";
import styles from "@/app/states.module.css";

export function VictoryCard(props: {
  correct: number;
  total: number;
  best: number;
  missed: StateData[];
  onRetryMissed: () => void;
  onPlayAgain: () => void;
  onStudy: () => void;
}) {
  const { correct, total, best, missed, onRetryMissed, onPlayAgain, onStudy } = props;
  const isNewBest = correct > best;
  const praise =
    correct === total
      ? "Perfect score! 🏆"
      : correct >= total * 0.8
        ? "Excellent! 🌟"
        : correct >= total * 0.6
          ? "Great job! 👏"
          : "Keep practicing! 💪";

  return (
    <div className={styles.quizSidebar}>
      <div className={styles.victoryCard} role="status" aria-live="polite">
        <div className={styles.victoryEmoji} aria-hidden="true">
          🎉
        </div>
        <h2 className={styles.victoryTitle}>AMAZING!</h2>
        <p className={styles.victorySubtitle}>You finished all {total} states!</p>
        <div className={styles.finalScore}>
          <span className={styles.finalScoreNum}>{correct}</span>
          <span className={styles.finalScoreDen}> / {total}</span>
          <p className={styles.finalScoreLabel}>{praise}</p>
          <p className={styles.bestScore}>{isNewBest ? "🥇 New best!" : `Best: ${best} / ${total}`}</p>
        </div>

        {missed.length > 0 && (
          <div className={styles.missedBox}>
            <div className={styles.missedTitle}>Missed ({missed.length})</div>
            <div className={styles.missedList}>{missed.map((s) => s.abbreviation).join(" · ")}</div>
          </div>
        )}

        {missed.length > 0 && (
          <button className={styles.restartBtn} onClick={onRetryMissed}>
            🎯 Retry missed ({missed.length})
          </button>
        )}
        <button className={styles.restartBtn} onClick={onPlayAgain}>
          🔄 Play Again
        </button>
        <button className={styles.studyModeBtn} onClick={onStudy}>
          📖 Study Mode
        </button>
      </div>
    </div>
  );
}
