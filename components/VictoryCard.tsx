"use client";

import type { StateData } from "@/lib/states";
import { isNewBest as computeNewBest } from "@/lib/settings";
import styles from "@/app/states.module.css";

export function VictoryCard(props: {
  correct: number;
  total: number;
  best: number;
  missed: StateData[];
  isFullRun: boolean;
  onRetryMissed: () => void;
  onPlayAgain: () => void;
  onStudy: () => void;
}) {
  const { correct, total, best, missed, isFullRun, onRetryMissed, onPlayAgain, onStudy } = props;
  const isNewBest = computeNewBest(isFullRun, correct, best);
  const praise =
    correct === total
      ? { text: "Perfect score!", emoji: "🏆" }
      : correct >= total * 0.8
        ? { text: "Excellent!", emoji: "🌟" }
        : correct >= total * 0.6
          ? { text: "Great job!", emoji: "👏" }
          : { text: "Keep practicing!", emoji: "💪" };

  return (
    <div className={styles.quizSidebar}>
      <div className={styles.victoryCard} role="status" aria-live="polite">
        <div className={styles.victoryEmoji} aria-hidden="true">
          🎉
        </div>
        <h2 className={styles.victoryTitle}>AMAZING!</h2>
        <p className={styles.victorySubtitle}>
          {isFullRun ? `You finished all ${total} states!` : `You cleared your ${total} missed states!`}
        </p>
        <div className={styles.finalScore}>
          <span className={styles.finalScoreNum}>{correct}</span>
          <span className={styles.finalScoreDen}> / {total}</span>
          <p className={styles.finalScoreLabel}>
            {praise.text} <span aria-hidden="true">{praise.emoji}</span>
          </p>
          {isFullRun && (
            <p className={styles.bestScore}>
              {isNewBest ? (
                <>
                  <span aria-hidden="true">🥇</span> New best!
                </>
              ) : (
                `Best: ${best} / ${total}`
              )}
            </p>
          )}
        </div>

        {missed.length > 0 && (
          <div className={styles.missedBox}>
            <div className={styles.missedTitle}>Missed ({missed.length})</div>
            <div className={styles.missedList}>{missed.map((s) => s.abbreviation).join(" · ")}</div>
          </div>
        )}

        {missed.length > 0 && (
          <button className={styles.restartBtn} onClick={onRetryMissed}>
            <span aria-hidden="true">🎯</span> Retry missed ({missed.length})
          </button>
        )}
        <button className={styles.restartBtn} onClick={onPlayAgain}>
          <span aria-hidden="true">🔄</span> Play Again
        </button>
        <button className={styles.studyModeBtn} onClick={onStudy}>
          <span aria-hidden="true">📖</span> Study Mode
        </button>
      </div>
    </div>
  );
}
