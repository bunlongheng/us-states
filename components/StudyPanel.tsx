"use client";

import React from "react";
import type { StateData } from "@/lib/states";
import { REGION_COLORS, invertHex } from "@/lib/quiz";
import { speak } from "@/lib/useGameAudio";
import styles from "@/app/states.module.css";

export function StudyPanel({ state, onClose }: { state: StateData | null; onClose: () => void }) {
  return (
    <div
      className={`${styles.infoPanel} ${state ? styles.infoPanelOpen : ""}`}
      style={
        state
          ? ({
              "--region-color": REGION_COLORS[state.region],
              "--region-color-inverted": invertHex(REGION_COLORS[state.region]),
            } as React.CSSProperties)
          : undefined
      }
    >
      {state ? (
        <>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close state details">
            ✕
          </button>
          <div className={styles.regionBadge}>
            <span className={styles.regionDot} />
            <span>{state.region}</span>
          </div>
          <h2 className={styles.stateNameLarge}>{state.name}</h2>
          <p className={styles.statePronunciation}>{state.pronunciation}</p>
          <button className={styles.speakBtn} onClick={() => speak(`${state.name}. ${state.pronunciation}`)}>
            <span aria-hidden="true">🔊</span> Pronounce
          </button>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">🏛️</span> Capital</span>
              <span className={styles.infoValue}>
                {state.capital}
                <span className={styles.infoPop}> ({state.capitalPop})</span>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">📅</span> Union</span>
              <span className={styles.infoValue}>
                #{state.unionOrder} - {state.unionDate}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">🗺️</span> Region</span>
              <span className={styles.infoValue}>{state.region}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">📐</span> Area</span>
              <span className={styles.infoValue}>{state.areaSqMiles}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">🐦</span> State Bird</span>
              <span className={styles.infoValue}>{state.stateBird}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><span aria-hidden="true">🌸</span> State Flower</span>
              <span className={styles.infoValue}>{state.stateFlower}</span>
            </div>
            <div className={`${styles.infoItem} ${styles.infoItemFull}`}>
              <span className={styles.infoLabel}><span aria-hidden="true">📜</span> Motto</span>
              <span className={styles.infoValue}>{state.stateMotto}</span>
            </div>
          </div>

          <div className={styles.funFacts}>
            <h3 className={styles.funFactsTitle}><span aria-hidden="true">🌟</span> Fun Facts</h3>
            {state.funFacts.map((fact, i) => (
              <p key={i} className={styles.funFact}>
                <span aria-hidden="true">⭐</span> {fact}
              </p>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.infoPanelPlaceholder}>
          <div className={styles.placeholderIcon} aria-hidden="true">
            🗺️
          </div>
          <p>Click any state to learn about it!</p>
        </div>
      )}
    </div>
  );
}
