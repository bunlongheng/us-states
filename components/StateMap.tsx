"use client";

import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { STATES, type StateData } from "@/lib/states";
import { REGION_COLORS, LEGEND_ORDER, lighten } from "@/lib/quiz";
import styles from "@/app/states.module.css";

const GEO_URL = "/states-10m.json";

// Never label these tiny states on the map (too cluttered).
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
  hoveredRegion: string | null;
  onActivate: (state: StateData) => void;
  onHoverState: (id: string | null) => void;
  onHoverRegion: (region: string | null) => void;
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
    hoveredRegion,
    onActivate,
    onHoverState,
    onHoverRegion,
    onBackground,
  } = props;

  return (
    <div className={styles.mapContainer} onClick={onBackground}>
      <ComposableMap projection="geoAlbersUsa" className={styles.map} projectionConfig={{ scale: 900 }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = String(geo.id).padStart(2, "0");
              const stateData = stateByFips[fips];

              // Unmatched geography (e.g. DC): render inert and hidden from AT.
              if (!stateData) {
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    tabIndex={-1}
                    aria-label="Not part of the 50 states"
                    className={styles.statePath}
                    style={{
                      default: { fill: "#2b3140", stroke: "#1a1a2e", strokeWidth: 0.5, cursor: "default", pointerEvents: "none" },
                      hover: { fill: "#2b3140", stroke: "#1a1a2e", strokeWidth: 0.5 },
                      pressed: { fill: "#2b3140" },
                    }}
                  />
                );
              }

              const id = stateData.id;
              const highlight = highlightId === id;
              const wrong = wrongId === id;
              const correct = correctId === id;
              const selected = selectedId === id;
              const hovered = hoveredId === id;
              const regionHovered = !!hoveredRegion && stateData.region === hoveredRegion;
              const fill = fillFor(stateData.region, { highlight, wrong, correct, selected, hovered, regionHovered });
              const stroke = selected || regionHovered ? "#ffffff" : "#1a1a2e";
              const strokeWidth = selected ? 2.5 : regionHovered ? 1.5 : 0.5;

              const activate = () => interactive && onActivate(stateData);

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
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
                  className={[
                    styles.statePath,
                    labelStates ? styles.statePathInteractive : "",
                    highlight ? styles.quizHighlight : "",
                    wrong ? styles.wrongAnswer : "",
                    correct ? styles.correctAnswer : "",
                    selected ? styles.selected : "",
                    regionHovered ? styles.regionHovered : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    default: { fill, stroke, strokeWidth, cursor: interactive ? "pointer" : "default", transition: "fill 0.15s" },
                    hover: { fill, stroke: "#ffffff", strokeWidth: 1.2, cursor: interactive ? "pointer" : "default" },
                    pressed: { fill },
                  }}
                />
              );
            })
          }
        </Geographies>

        {showLabels &&
          STATES.map((state) =>
            SKIP_LABEL.has(state.id) ? null : (
              <Marker key={state.id} coordinates={[state.centerLon, state.centerLat]}>
                <text textAnchor="middle" dominantBaseline="central" className={styles.stateLabel} style={{ pointerEvents: "none" }} aria-hidden="true">
                  {state.abbreviation}
                </text>
              </Marker>
            ),
          )}
      </ComposableMap>

      {showLegend && (
        <div className={styles.legendOverlay} role="group" aria-label="Region legend">
          {LEGEND_ORDER.map((region) => (
            <button
              key={region}
              type="button"
              className={`${styles.legendItem} ${hoveredRegion === region ? styles.legendItemActive : ""}`}
              aria-pressed={hoveredRegion === region}
              onMouseEnter={() => onHoverRegion(region)}
              onMouseLeave={() => onHoverRegion(null)}
              onFocus={() => onHoverRegion(region)}
              onBlur={() => onHoverRegion(null)}
              onClick={(e) => e.stopPropagation()}
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
