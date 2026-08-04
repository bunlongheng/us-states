"use client";

import dynamic from "next/dynamic";
import styles from "./states.module.css";

// The game reads persisted settings from localStorage during init and uses canvas /
// Web Audio, so it is loaded client-only. The skeleton below is the real loading
// state shown until the chunk arrives.
const Game = dynamic(() => import("@/components/Game"), {
  ssr: false,
  loading: () => (
    <div className={styles.container}>
      <div className={styles.loading} role="status" aria-live="polite">
        <div className={styles.loadingMap} aria-hidden="true" />
        <span>Loading the US map...</span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <Game />;
}
