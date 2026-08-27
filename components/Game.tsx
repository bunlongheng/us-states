"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { STATES, type StateData } from "@/lib/states";
import { quizReducer, initQuiz, type QuestionMode } from "@/lib/quizEngine";
import { loadSettings, saveSettings, readBest, writeBest, isNewBest, type Difficulty, type Settings } from "@/lib/settings";
import { useGameAudio, prefersReducedMotion, speak } from "@/lib/useGameAudio";
import { StateMap } from "./StateMap";
import { StudyPanel } from "./StudyPanel";
import { QuizSidebar } from "./QuizSidebar";
import { VictoryCard } from "./VictoryCard";
import { SettingsModal } from "./SettingsModal";
import styles from "@/app/states.module.css";

type Mode = "study" | "quiz";

const TIMER_SECONDS: Record<Difficulty, number> = { 1: 30, 2: 20, 3: 10, 4: 5, 5: 3 };
const poolFor = (d: Difficulty) => STATES.filter((s) => s.difficulty <= d);

export default function Game() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const { difficulty, soundOn, timerOn, questionMode } = settings;

  const [mode, setMode] = useState<Mode>("quiz");
  const [showConfig, setShowConfig] = useState(false);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [pinnedRegion, setPinnedRegion] = useState<string | null>(null);
  const [bestAtStart, setBestAtStart] = useState(() => readBest(settings.difficulty));

  const [quiz, dispatch] = useReducer(quizReducer, undefined, () =>
    initQuiz(poolFor(settings.difficulty), settings.questionMode, { distractors: poolFor(settings.difficulty) }),
  );

  const { playSuccess, playWrong } = useGameAudio();
  const settingsBtnRef = useRef<HTMLButtonElement>(null);

  const quizStates = poolFor(difficulty);
  const timerSeconds = TIMER_SECONDS[difficulty];
  const patch = (p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p }));

  // Start a fresh run. Randomness lives in initQuiz (the factory), so the reducer just
  // adopts the pre-built state via RESET and stays pure. `distractors` keeps 4 real
  // options even when the question pool is tiny (retry-missed).
  const start = (pool: StateData[], distractors: StateData[], mode: QuestionMode, forBest: Difficulty) => {
    setBestAtStart(readBest(forBest));
    dispatch({ type: "RESET", state: initQuiz(pool, mode, { distractors }) });
  };

  // Persist settings (side-effect-only effect).
  useEffect(() => saveSettings(settings), [settings]);

  // Escape closes the study detail panel (the settings modal handles its own Escape).
  useEffect(() => {
    if (showConfig || (!selectedState && !pinnedRegion)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSelectedState(null);
      setPinnedRegion(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfig, selectedState, pinnedRegion]);

  // After a reveal, advance. setTimeout keeps dispatch out of the sync effect body;
  // the cleanup cancels it on mode switch / unmount.
  useEffect(() => {
    if (quiz.phase !== "revealing") return;
    const delay = quiz.wrongId ? 2000 : 1500;
    const id = setTimeout(() => dispatch({ type: "ADVANCE" }), delay);
    return () => clearTimeout(id);
  }, [quiz.phase, quiz.wrongId]);

  // On finish: celebrate, and record a new best only for a FULL run (not a retry-missed run).
  useEffect(() => {
    if (quiz.phase !== "done") return;
    if (!prefersReducedMotion()) confetti({ particleCount: 200, spread: 160, origin: { x: 0.5, y: 0.3 } });
    const fullRun = quiz.total === poolFor(difficulty).length;
    if (isNewBest(fullRun, quiz.score.correct, bestAtStart)) writeBest(difficulty, quiz.score.correct);
  }, [quiz.phase, quiz.score.correct, quiz.total, difficulty, bestAtStart]);

  const answer = (choice: StateData) => {
    if (quiz.phase !== "asking" || !quiz.current) return;
    const correct = choice.id === quiz.current.state.id;
    if (correct) {
      if (soundOn) playSuccess();
      if (!prefersReducedMotion()) confetti({ particleCount: 80, spread: 60, origin: { x: 0.85, y: 0.5 } });
    } else if (soundOn) {
      playWrong();
    }
    dispatch({ type: "ANSWER", choice });
  };

  const onTimeout = () => {
    if (soundOn) playWrong();
    dispatch({ type: "TIMEOUT" });
  };

  const changeDifficulty = (d: Difficulty) => {
    patch({ difficulty: d });
    if (mode === "quiz") start(poolFor(d), poolFor(d), questionMode, d);
  };

  const changeQuestionMode = (m: QuestionMode) => {
    patch({ questionMode: m });
    if (mode === "quiz") start(quizStates, quizStates, m, difficulty);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setSelectedState(null);
    setPinnedRegion(null);
    setHoveredRegion(null);
    if (next === "quiz") start(quizStates, quizStates, questionMode, difficulty);
  };

  const closeSettings = () => {
    setShowConfig(false);
    settingsBtnRef.current?.focus();
  };

  const onMapActivate = (state: StateData) => {
    if (mode === "study") {
      setSelectedState(state);
      speak(state.name); // say the state name on click (like the Pronounce button, not gated by the sound toggle)
    } else if (mode === "quiz" && quiz.current?.quizType === "findIt" && quiz.phase === "asking") {
      answer(state);
    }
  };

  const asking = quiz.phase === "asking";
  const quizType = quiz.current?.quizType;
  const interactive = mode === "study" || (mode === "quiz" && quizType === "findIt" && asking);
  const highlightId = mode === "quiz" && quizType === "nameIt" && asking ? quiz.current?.state.id ?? null : null;
  const revealing = quiz.phase === "revealing";
  // Hide labels during a nameIt question (so the answer is not spelled out on the map)
  // and at higher difficulties during a findIt question (challenge); show them on reveal.
  const showLabels = mode === "study" ? true : !asking || !(quizType === "nameIt" || difficulty >= 3);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>States</h1>
        <div className={styles.headerRight}>
          <div className={styles.modeToggle} role="group" aria-label="Mode">
            <button
              className={`${styles.modeBtn} ${mode === "study" ? styles.modeBtnActive : ""}`}
              aria-pressed={mode === "study"}
              onClick={() => switchMode("study")}
            >
              <span aria-hidden="true">📖</span> Study
            </button>
            <button
              className={`${styles.modeBtn} ${mode === "quiz" ? styles.modeBtnActive : ""}`}
              aria-pressed={mode === "quiz"}
              onClick={() => switchMode("quiz")}
            >
              <span aria-hidden="true">🎯</span> Quiz
            </button>
          </div>
          <button
            className={styles.configBtn}
            ref={settingsBtnRef}
            onClick={() => setShowConfig(true)}
            aria-haspopup="dialog"
            aria-expanded={showConfig}
          >
            <span className={styles.configIcon} aria-hidden="true">
              ⚙
            </span>{" "}
            Settings
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={`${styles.mapLayout} ${selectedState && mode === "study" ? styles.mapLayoutWithPanel : ""}`}>
          <StateMap
            showLabels={showLabels}
            interactive={interactive}
            labelStates={interactive}
            showLegend={mode === "study"}
            highlightId={highlightId}
            wrongId={revealing ? quiz.wrongId : null}
            correctId={revealing ? quiz.revealId : null}
            selectedId={mode === "study" ? selectedState?.id ?? null : null}
            hoveredId={hoveredState}
            activeRegion={pinnedRegion ?? hoveredRegion}
            pinnedRegion={pinnedRegion}
            onActivate={onMapActivate}
            onHoverState={setHoveredState}
            onHoverRegion={setHoveredRegion}
            onPinRegion={(r) => setPinnedRegion((p) => (p === r ? null : r))}
            onBackground={() => mode === "study" && setSelectedState(null)}
          />

          {mode === "study" && <StudyPanel state={selectedState} onClose={() => setSelectedState(null)} />}

          {mode === "quiz" && quiz.phase !== "done" && (
            <QuizSidebar state={quiz} timerOn={timerOn} timerSeconds={timerSeconds} onAnswer={answer} onTimeout={onTimeout} />
          )}

          {mode === "quiz" && quiz.phase === "done" && (
            <VictoryCard
              correct={quiz.score.correct}
              total={quiz.total}
              best={bestAtStart}
              missed={quiz.missed}
              isFullRun={quiz.total === quizStates.length}
              onRetryMissed={() => start(quiz.missed, quizStates, questionMode, difficulty)}
              onPlayAgain={() => start(quizStates, quizStates, questionMode, difficulty)}
              onStudy={() => switchMode("study")}
            />
          )}
        </div>
      </main>

      {showConfig && (
        <SettingsModal
          difficulty={difficulty}
          onDifficulty={changeDifficulty}
          soundOn={soundOn}
          onSound={(v) => patch({ soundOn: v })}
          timerOn={timerOn}
          onTimer={(v) => patch({ timerOn: v })}
          questionMode={questionMode}
          onQuestionMode={changeQuestionMode}
          timerSeconds={timerSeconds}
          onClose={closeSettings}
        />
      )}
    </div>
  );
}
