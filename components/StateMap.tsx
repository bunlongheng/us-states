"use client";

import React from "react";
import { STATES, type StateData } from "@/lib/states";
import { STATE_PATHS, MAP_VIEWBOX } from "@/lib/mapPaths";
import { REGION_COLORS, LEGEND_ORDER, lighten } from "@/lib/quiz";
import styles from "@/app/states.module.css";

// Tiny states whose abbreviation label would clutter the map.
const SKIP_LABEL = new Set([
  "rhode-island",
  "delaware",
  "connecticut",
  "new-jersey",
  "maryland",
  "massachusetts",
  "vermont",
  "new-hampshire",
]);

const stateByFips: Record<string, StateData> = Object.fromEntries(STATES.map((s) => [s.fipsCode, s]));

function fillFor(
  region: StateData["region"] | undefined,
  f: { highlight: boolean; wrong: boolean; correct: boolean; selected: boolean; hovered: boolean; regionHovered: boolean },
): string {
  if (f.correct) return "#22c55e";
  if (f.wrong) return "#ef4444";
  if (f.highlight) return "#fbbf24";
  const base = region ? REGION_COLORS[region] : "#5b6472";
  if (f.selected) return lighten(base, 60);
  if (f.hovered) return lighten(base, 45);
  if (f.regionHovered) return lighten(base, 30);
  return base;
}

export function StateMap(props: {
  showLabels: boolean;
  interactive: boolean; // clicking/activating a state does something
  labelStates: boolean; // expose each state to AT by name + make it focusable
  showLegend: boolean;
  highlightId: string | null;
  wrongId: string | null;
  correctId: string | null;
  selectedId: string | null;
  hoveredId: string | null;
  activeRegion: string | null; // pinned region, or hovered when nothing is pinned
  pinnedRegion: string | null;
  onActivate: (state: StateData) => void;
  onHoverState: (id: string | null) => void;
  onHoverRegion: (region: string | null) => void;
  onPinRegion: (region: string) => void;
  onBackground: () => void;
}) {
  const {
    showLabels,
    interactive,
    labelStates,
    showLegend,
    highlightId,
    wrongId,
    correctId,
    selectedId,
    hoveredId,
    activeRegion,
    pinnedRegion,
    onActivate,
    onHoverState,
    onHoverRegion,
    onPinRegion,
    onBackground,
  } = props;

  return (
    <div className={styles.mapContainer} onClick={onBackground}>
      <svg viewBox={MAP_VIEWBOX} className={styles.map} role="group" aria-label="Map of the United States">
        {STATE_PATHS.map((sp) => {
          const stateData = stateByFips[sp.fips];

          // Unmatched geography (e.g. DC): inert and hidden from assistive tech.
          if (!stateData) {
            return <path key={sp.fips} d={sp.d} className={styles.statePathInert} aria-hidden="true" />;
          }

          const id = stateData.id;
          const highlight = highlightId === id;
          const wrong = wrongId === id;
          const correct = correctId === id;
          const selected = selectedId === id;
          const hovered = hoveredId === id;
          const regionHovered = !!activeRegion && stateData.region === activeRegion;
          const fill = fillFor(stateData.region, { highlight, wrong, correct, selected, hovered, regionHovered });
          const stroke = selected || regionHovered ? "#ffffff" : "#1a1a2e";
          const strokeWidth = selected ? 2.5 : regionHovered ? 1.5 : 0.5;
          const activate = () => interactive && onActivate(stateData);

          return (
            <path
              key={sp.fips}
              d={sp.d}
              data-id={id}
              tabIndex={labelStates ? 0 : -1}
              role={labelStates ? "button" : undefined}
              aria-label={labelStates ? stateData.name : undefined}
              aria-hidden={labelStates ? undefined : true}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                activate();
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (labelStates && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  activate();
                }
              }}
              onMouseEnter={() => onHoverState(id)}
              onMouseLeave={() => onHoverState(null)}
              onFocus={() => onHoverState(id)}
              onBlur={() => onHoverState(null)}
              className={[styles.statePath, labelStates ? styles.statePathInteractive : ""].filter(Boolean).join(" ")}
              style={{ fill, stroke, strokeWidth, cursor: interactive ? "pointer" : "default" }}
            />
          );
        })}

        {showLabels &&
          STATE_PATHS.map((sp) => {
            const stateData = stateByFips[sp.fips];
            if (!stateData || SKIP_LABEL.has(stateData.id)) return null;
            return (
              <text key={`l-${sp.fips}`} x={sp.cx} y={sp.cy} className={styles.stateLabel} aria-hidden="true">
                {stateData.abbreviation}
              </text>
            );
          })}
      </svg>

      {showLegend && (
        <div className={styles.legendOverlay} role="group" aria-label="Region legend">
          {LEGEND_ORDER.map((region) => (
            <button
              key={region}
              type="button"
              className={`${styles.legendItem} ${activeRegion === region ? styles.legendItemActive : ""}`}
              aria-pressed={pinnedRegion === region}
              onMouseEnter={() => onHoverRegion(region)}
              onMouseLeave={() => onHoverRegion(null)}
              onFocus={() => onHoverRegion(region)}
              onBlur={() => onHoverRegion(null)}
              onClick={(e) => {
                e.stopPropagation();
                onPinRegion(region);
              }}
            >
              <span className={styles.legendDot} style={{ background: REGION_COLORS[region] }} aria-hidden="true" />
              <span className={styles.legendLabel}>{region}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
