"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { STATES, type StateData } from "@/lib/states";
import { quizReducer, initQuiz, type QuestionMode } from "@/lib/quizEngine";
import { useGameAudio, prefersReducedMotion } from "@/lib/useGameAudio";
import { StateMap } from "./StateMap";
import { StudyPanel } from "./StudyPanel";
import { QuizSidebar } from "./QuizSidebar";
import { VictoryCard } from "./VictoryCard";
import { SettingsModal } from "./SettingsModal";
import styles from "@/app/states.module.css";

type Difficulty = 1 | 2 | 3 | 4 | 5;
type Mode = "study" | "quiz";

const TIMER_SECONDS: Record<Difficulty, number> = { 1: 30, 2: 20, 3: 10, 4: 5, 5: 3 };
const SETTINGS_KEY = "us-states:settings";
const bestKey = (d: Difficulty) => `us-states:best:${d}`;

const DEFAULT_SETTINGS = { difficulty: 1 as Difficulty, soundOn: true, timerOn: false, questionMode: "mixed" as QuestionMode };

function loadSettings(): typeof DEFAULT_SETTINGS {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const p = JSON.parse(raw);
    const difficulty = ([1, 2, 3, 4, 5] as const).includes(p.difficulty) ? (p.difficulty as Difficulty) : 1;
    const questionMode = (["mixed", "nameIt", "findIt"] as const).includes(p.questionMode) ? (p.questionMode as QuestionMode) : "mixed";
    return { difficulty, soundOn: p.soundOn !== false, timerOn: !!p.timerOn, questionMode };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function readBest(d: Difficulty): number {
  try {
    return Number(localStorage.getItem(bestKey(d))) || 0;
  } catch {
    return 0;
  }
}

const poolFor = (d: Difficulty) => STATES.filter((s) => s.difficulty <= d);

export default function Game() {
  const initial = useMemo(() => loadSettings(), []);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial.difficulty);
  const [soundOn, setSoundOn] = useState(initial.soundOn);
  const [timerOn, setTimerOn] = useState(initial.timerOn);
  const [questionMode, setQuestionMode] = useState<QuestionMode>(initial.questionMode);

  const [mode, setMode] = useState<Mode>("quiz");
  const [showConfig, setShowConfig] = useState(false);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const [quiz, dispatch] = useReducer(quizReducer, undefined, () => initQuiz(poolFor(initial.difficulty), initial.questionMode));

  const { playSuccess, playWrong } = useGameAudio();
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const [bestAtStart, setBestAtStart] = useState(() => readBest(initial.difficulty));

  const quizStates = useMemo(() => poolFor(difficulty), [difficulty]);
  const timerSeconds = TIMER_SECONDS[difficulty];

  // Start a fresh run over `pool` and snapshot the best score to beat.
  const start = (pool: StateData[], mode: QuestionMode, forBest: Difficulty) => {
    setBestAtStart(readBest(forBest));
    dispatch({ type: "START", pool, mode });
  };

  // Persist settings (side effect only - no setState here, so effects stay lint-clean).
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ difficulty, soundOn, timerOn, questionMode }));
    } catch {
      /* storage unavailable */
    }
  }, [difficulty, soundOn, timerOn, questionMode]);

  // After a reveal, advance to the next question. setTimeout keeps the dispatch out
  // of the synchronous effect body, and the cleanup cancels it on mode switch/unmount.
  useEffect(() => {
    if (quiz.phase !== "revealing") return;
    const delay = quiz.wrongId ? 2000 : 1500;
    const id = setTimeout(() => dispatch({ type: "ADVANCE" }), delay);
    return () => clearTimeout(id);
  }, [quiz.phase, quiz.wrongId]);

  // On finish: celebrate (unless reduced motion) and record a new best.
  useEffect(() => {
    if (quiz.phase !== "done") return;
    if (!prefersReducedMotion()) confetti({ particleCount: 200, spread: 160, origin: { x: 0.5, y: 0.3 } });
    if (quiz.score.correct > bestAtStart) {
      try {
        localStorage.setItem(bestKey(difficulty), String(quiz.score.correct));
      } catch {
        /* storage unavailable */
      }
    }
  }, [quiz.phase, quiz.score.correct, difficulty, bestAtStart]);

  const answer = (choice: StateData) => {
    if (quiz.phase !== "asking" || !quiz.current) return;
    const correct = choice.id === quiz.current.id;
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
    setDifficulty(d);
    if (mode === "quiz") start(poolFor(d), questionMode, d);
  };

  const changeQuestionMode = (m: QuestionMode) => {
    setQuestionMode(m);
    if (mode === "quiz") start(quizStates, m, difficulty);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setSelectedState(null);
    if (next === "quiz") start(quizStates, questionMode, difficulty);
  };

  const closeSettings = () => {
    setShowConfig(false);
    settingsBtnRef.current?.focus();
  };

  const onMapActivate = (state: StateData) => {
    if (mode === "study") setSelectedState(state);
    else if (mode === "quiz" && quiz.quizType === "findIt" && quiz.phase === "asking") answer(state);
  };

  const asking = quiz.phase === "asking";
  const interactive = mode === "study" || (mode === "quiz" && quiz.quizType === "findIt" && asking);
  const highlightId = mode === "quiz" && quiz.quizType === "nameIt" && asking ? quiz.current?.id ?? null : null;
  const revealing = quiz.phase === "revealing";

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
              📖 Study
            </button>
            <button
              className={`${styles.modeBtn} ${mode === "quiz" ? styles.modeBtnActive : ""}`}
              aria-pressed={mode === "quiz"}
              onClick={() => switchMode("quiz")}
            >
              🎯 Quiz
            </button>
          </div>
          <button className={styles.configBtn} ref={settingsBtnRef} onClick={() => setShowConfig(true)}>
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
            showLabels={!(mode === "quiz" && difficulty >= 3)}
            interactive={interactive}
            labelStates={interactive}
            showLegend={mode === "study"}
            highlightId={highlightId}
            wrongId={revealing ? quiz.wrongId : null}
            correctId={revealing ? quiz.revealId : null}
            selectedId={mode === "study" ? selectedState?.id ?? null : null}
            hoveredId={hoveredState}
            hoveredRegion={hoveredRegion}
            onActivate={onMapActivate}
            onHoverState={setHoveredState}
            onHoverRegion={setHoveredRegion}
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
              onRetryMissed={() => start(quiz.missed, questionMode, difficulty)}
              onPlayAgain={() => start(quizStates, questionMode, difficulty)}
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
          onSound={setSoundOn}
          timerOn={timerOn}
          onTimer={setTimerOn}
          questionMode={questionMode}
          onQuestionMode={changeQuestionMode}
          timerSeconds={timerSeconds}
          onClose={closeSettings}
        />
      )}
    </div>
  );
}
