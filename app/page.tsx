"use client";

import dynamic from "next/dynamic";
import styles from "./states.module.css";

// The game is fully client-interactive (canvas, audio, a projected SVG map that
// react-simple-maps renders with sub-pixel drift between server and client), so it
// is loaded client-only. The skeleton below is the real loading state until the
// chunk arrives, and rendering client-only also sidesteps the map hydration warning.
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
