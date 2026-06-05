import { useState, useCallback, useRef, useEffect } from "react";
import { joinRoom, fetchQuestions, submitAnswer, fetchLeaderboard, finishGame } from "../services/gameService";
import { useTimer } from "./useTimer";

export const PHASE = {
  LOADING:  "loading",
  PLAYING:  "playing",
  FEEDBACK: "feedback",
  RESULTS:  "results",
  ERROR:    "error",
};

const DEFAULT_CONFIG = {
  timePerQuestion: 30,
  lives: 3,
  totalQuestions: 10,
  points: { very_easy: 5, easy: 10, intermediate: 20, hard: 35, very_hard: 50 },
};

// ─── Gamification helpers ─────────────────────────────────────────────────────
const DIFF_ORDER = ['very_easy', 'easy', 'intermediate', 'hard', 'very_hard'];

function buildPools(qs) {
  const pools = { very_easy: [], easy: [], intermediate: [], hard: [], very_hard: [] };
  qs.forEach(q => { (pools[q.difficulty] ?? pools.intermediate).push(q); });
  return pools;
}

function getTargetDiffIdx(streak, total) {
  const threshold = Math.max(1, Math.ceil(total / 5));
  return Math.min(Math.floor(Math.max(streak - 1, 0) / threshold), 4);
}

// pools es inmutable — usedIds (Set) registra las preguntas ya mostradas
function pickFromPools(pools, streak, total, usedIds) {
  const target = getTargetDiffIdx(streak, total);
  const order  = [target];
  for (let i = 1; i <= 4; i++) {
    if (target + i <= 4) order.push(target + i);
    if (target - i >= 0) order.push(target - i);
  }
  for (const idx of order) {
    const key      = DIFF_ORDER[idx];
    const available = (pools[key] ?? []).filter(q => !usedIds.has(q.id));
    if (available.length > 0) {
      const q = available[Math.floor(Math.random() * available.length)];
      usedIds.add(q.id);
      return q;
    }
  }
  return null;
}

// Reintenta la función hasta maxAttempts veces con retardo exponencial.
// Silencioso tras el último intento — para guardados en segundo plano.
async function withRetry(fn, maxAttempts = 3, baseDelayMs = 600) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); } catch {
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, baseDelayMs * attempt));
      }
    }
  }
}

// ─── Session persistence (survives page reload) ──────────────────────────────
const SS_KEY = 'osteo_game';
function saveSession(data) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch {}
}
function loadSession(roomCode, playerName) {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.roomCode !== roomCode || s.playerName !== playerName) return null;
    return s;
  } catch { return null; }
}
function clearSession() {
  try { sessionStorage.removeItem(SS_KEY); } catch {}
}

// ─── useGameLogic ─────────────────────────────────────────────────────────
// roomCode: PIN de sala ('' = modo público)
// playerName, playerAge, avatarId: datos del jugador desde la URL
export function useGameLogic(roomCode = "", playerName = "", playerAge = "", avatarId = 1) {
  const [phase, setPhase]               = useState(PHASE.LOADING);
  const [questions, setQuestions]       = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameConfig, setGameConfig]     = useState(DEFAULT_CONFIG);
  const [lives, setLives]               = useState(DEFAULT_CONFIG.lives);
  const [score, setScore]               = useState(0);
  const [correctCount, setCorrectCount]     = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [maxStreak, setMaxStreak]       = useState(0);
  const [currentStreak, setCurrentStreak]   = useState(0);
  const [totalTime, setTotalTime]       = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [leaderboard, setLeaderboard]   = useState([]);
  const [playerRank, setPlayerRank]     = useState(0);
  const [answerHistory, setAnswerHistory]   = useState([]);
  const [lastPoints, setLastPoints]     = useState(0);
  const [error, setError]               = useState(null);

  const tokenRef         = useRef(null);
  const playerIdRef      = useRef(null);
  const questionStartRef = useRef(Date.now());
  const usedQuestionIds  = useRef([]);
  // Guardia síncrona: los updates de estado son asíncronos, dos clicks rápidos
  // pasarían el check de selectedOption antes de que el primero se aplique.
  const isSubmittingRef  = useRef(false);
  // Evita la doble ejecución de useEffect por React StrictMode en desarrollo.
  const joinedRef        = useRef(false);

  // Modo gamificación
  const gamificacionRef  = useRef(false);
  const [gamificacion, setGamificacion] = useState(false);
  const [pickedQuestion, setPickedQuestion] = useState(null);
  const poolsRef         = useRef(null);
  const usedInGameRef    = useRef(new Set());

  // ── Timer ──────────────────────────────────────────────────────────────
  const isPlaying = phase === PHASE.PLAYING;

  const handleTimeUp = useCallback(() => {
    const question = gamificacionRef.current ? pickedQuestion : questions[currentIndex];
    if (!question) return;

    setAnswerHistory(prev => [...prev, {
      questionId:    question.id,
      questionText:  question.text,
      options:       question.options,
      category:      question.category,
      difficulty:    question.difficulty,
      correctIndex:  question.correctIndex,
      selectedIndex: -1,
      isCorrect:     false,
      timeSpent:     gameConfig.timePerQuestion,
    }]);

    setPhase(PHASE.FEEDBACK);
    setIsCorrect(false);
    setSelectedOption(-1);
    setLives(prev => prev - 1);
    setIncorrectCount(prev => prev + 1);
    setCurrentStreak(0);

    // Guarda el tiempo agotado en el backend con reintentos
    if (tokenRef.current) {
      withRetry(() => submitAnswer(
        tokenRef.current, question.id, null,
        gameConfig.timePerQuestion, 0
      ));
    }
  }, [currentIndex, questions, gameConfig.timePerQuestion, pickedQuestion]);

  const timer = useTimer(gameConfig.timePerQuestion, handleTimeUp, isPlaying);

  // ── Initialization: join → fetch questions ────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (joinedRef.current) return;
      joinedRef.current = true;

      try {
        setPhase(PHASE.LOADING);

        // ── Restore session if the page was reloaded mid-game ──────────
        const saved = loadSession(roomCode, playerName);
        if (saved) {
          tokenRef.current    = saved.token;
          playerIdRef.current = saved.playerId;
          setGameConfig(saved.config);
          setLives(saved.lives);
          setScore(saved.score);
          setCurrentIndex(saved.currentIndex);
          setCorrectCount(saved.correctCount);
          setIncorrectCount(saved.incorrectCount);
          setMaxStreak(saved.maxStreak);
          setCurrentStreak(saved.currentStreak);
          setTotalTime(saved.totalTime);
          setAnswerHistory(saved.answerHistory);
          setQuestions(saved.questions);

          const isGamif = Boolean(saved.gamificacion);
          gamificacionRef.current = isGamif;
          setGamificacion(isGamif);
          if (isGamif && saved.questions) {
            poolsRef.current      = buildPools(saved.questions);
            usedInGameRef.current = new Set(saved.usedInGame || []);
            const picked = saved.questions.find(q => q.id === saved.pickedQuestionId) || null;
            setPickedQuestion(picked);
          }

          timer.reset(saved.config.timePerQuestion);
          if (saved.phase === PHASE.FEEDBACK) {
            setSelectedOption(saved.selectedOption);
            setIsCorrect(saved.isCorrect);
            setLastPoints(saved.lastPoints ?? 0);
            isSubmittingRef.current = true;
            setPhase(PHASE.FEEDBACK);
          } else {
            setPhase(PHASE.PLAYING);
          }
          questionStartRef.current = Date.now();
          return;
        }

        // 1) Join (creates participant + session if public mode)
        const joinResult = await joinRoom(roomCode, {
          name: playerName,
          age:  playerAge,
          avatarId: parseInt(avatarId, 10) || 1,
        });

        // Una vez unido, completa siempre la inicialización aunque StrictMode cancele el efecto.
        // Abortar aquí dejaría un participante registrado en BD sin sesión de juego activa.
        tokenRef.current    = joinResult.token;
        playerIdRef.current = joinResult.playerId;

        const cfg = { ...DEFAULT_CONFIG, ...joinResult.config };
        setGameConfig(cfg);
        setLives(cfg.lives);

        // 2) Fetch questions using the token
        const qs = await fetchQuestions(joinResult.token);

        usedQuestionIds.current = qs.map(q => q.id);

        const isGamif = Boolean(joinResult.config?.gamificacion);
        gamificacionRef.current = isGamif;
        setGamificacion(isGamif);

        if (isGamif) {
          poolsRef.current = buildPools(qs);
          usedInGameRef.current = new Set();
          const first = pickFromPools(poolsRef.current, 0, qs.length, usedInGameRef.current);
          setPickedQuestion(first);
        }

        setQuestions(qs);
        timer.reset(cfg.timePerQuestion);
        setPhase(PHASE.PLAYING);
        questionStartRef.current = Date.now();
      } catch (err) {
        joinedRef.current = false;
        setError(err.message);
        setPhase(PHASE.ERROR);
      }
    }

    init();
    return () => { cancelled = true; };
    // Se ejecuta solo una vez al montar el componente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Select answer ──────────────────────────────────────────────────────
  const selectAnswer = useCallback(async (optionIndex) => {
    if (phase !== PHASE.PLAYING || selectedOption !== null || isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    const question = gamificacionRef.current ? pickedQuestion : questions[currentIndex];
    if (!question) return;

    const timeSpent = (Date.now() - questionStartRef.current) / 1000;
    setTotalTime(prev => prev + timeSpent);

    // Corrección local — correctIndex vino del servidor
    const correct        = optionIndex === question.correctIndex;
    const selectedOptId  = question.optionIds?.[optionIndex] ?? null;

    setSelectedOption(optionIndex);
    setIsCorrect(correct);
    timer.stop();

    // Puntos según configuración del servidor
    const pts         = gameConfig.points ?? DEFAULT_CONFIG.points;
    const basePoints  = pts[question.difficulty] ?? pts.intermediate ?? 20;
    const timeBonus   = (correct && timer.timeLeft > gameConfig.timePerQuestion / 2)
                          ? Math.round(timer.timeLeft * 2) : 0;
    const pointsEarned = correct ? basePoints + timeBonus : 0;

    setLastPoints(pointsEarned);

    if (correct) {
      setScore(prev => prev + pointsEarned);
      setCorrectCount(prev => prev + 1);
      setCurrentStreak(prev => {
        const next = prev + 1;
        setMaxStreak(max => Math.max(max, next));
        return next;
      });
    } else {
      setLives(prev => prev - 1);
      setIncorrectCount(prev => prev + 1);
      setCurrentStreak(0);
    }

    setAnswerHistory(prev => [...prev, {
      questionId:    question.id,
      questionText:  question.text,
      options:       question.options,
      category:      question.category,
      difficulty:    question.difficulty,
      correctIndex:  question.correctIndex,
      selectedIndex: optionIndex,
      isCorrect:     correct,
      timeSpent,
    }]);

    setPhase(PHASE.FEEDBACK);

    // Guarda en el backend con reintentos
    if (tokenRef.current) {
      withRetry(() => submitAnswer(
        tokenRef.current, question.id, selectedOptId,
        timeSpent, currentStreak
      ));
    }
  }, [phase, selectedOption, currentIndex, questions, timer, gameConfig, currentStreak, pickedQuestion]);

  // ── Next question or results ───────────────────────────────────────────
  const nextQuestion = useCallback(async () => {
    const livesAfter = lives - (isCorrect === false && selectedOption !== -1 ? 0 : 0);
    // lives state is already updated; check current value
    if (lives <= 0 || currentIndex >= questions.length - 1) {
      timer.stop();
      clearSession();
      setPhase(PHASE.RESULTS);

      if (tokenRef.current) {
        // Finaliza la partida en servidor (await para que el leaderboard vea las estadísticas finales)
        await finishGame(tokenRef.current);

        try {
          const board = await fetchLeaderboard(tokenRef.current);
          setLeaderboard(board);
          const myIdx = board.findIndex(p => p.name === playerName);
          setPlayerRank(myIdx >= 0 ? myIdx + 1 : board.length + 1);
        } catch {
          const myPrecision = correctCount + incorrectCount > 0
            ? Math.round((correctCount / (correctCount + incorrectCount)) * 100) : 0;
          setPlayerRank(1);
          setLeaderboard([{ name: playerName, score, precision: myPrecision, avatar: '' }]);
        }
      }
    } else {
      if (gamificacionRef.current && poolsRef.current) {
        const next = pickFromPools(poolsRef.current, currentStreak, questions.length, usedInGameRef.current);
        if (next) setPickedQuestion(next);
      }
      isSubmittingRef.current = false;
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      questionStartRef.current = Date.now();
      timer.reset(gameConfig.timePerQuestion);
      setPhase(PHASE.PLAYING);
    }
  }, [
    lives, currentIndex, questions,
    score, correctCount, incorrectCount,
    playerName, timer, gameConfig.timePerQuestion,
    isCorrect, selectedOption, currentStreak,
  ]);

  // ── Live leaderboard polling (room mode only, every 5 s while playing) ──
  useEffect(() => {
    if (!roomCode || phase !== PHASE.PLAYING) return;
    const id = setInterval(async () => {
      if (!tokenRef.current) return;
      try {
        const board = await fetchLeaderboard(tokenRef.current);
        setLeaderboard(board);
      } catch { /* non-critical */ }
    }, 5000);
    return () => clearInterval(id);
  }, [phase, roomCode]);

  // ── Persist progress to sessionStorage on every meaningful state change ──
  useEffect(() => {
    if (!tokenRef.current) return;
    if (phase !== PHASE.PLAYING && phase !== PHASE.FEEDBACK) return;
    saveSession({
      roomCode, playerName,
      token:            tokenRef.current,
      playerId:         playerIdRef.current,
      config:           gameConfig,
      questions,
      currentIndex,
      score,
      lives,
      correctCount,
      incorrectCount,
      maxStreak,
      currentStreak,
      totalTime,
      answerHistory,
      gamificacion,
      usedInGame:       [...usedInGameRef.current],
      pickedQuestionId: pickedQuestion?.id ?? null,
      phase,
      selectedOption,
      isCorrect,
      lastPoints,
    });
  }, [
    phase, currentIndex, score, lives, correctCount, incorrectCount,
    maxStreak, currentStreak, totalTime, answerHistory, pickedQuestion,
    gamificacion, gameConfig, questions, roomCode, playerName,
    selectedOption, isCorrect, lastPoints,
  ]);

  // ── Restart ────────────────────────────────────────────────────────────
  const restartGame = useCallback(async () => {
    clearSession();
    isSubmittingRef.current = false;
    setCurrentIndex(0);
    setLives(gameConfig.lives);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMaxStreak(0);
    setCurrentStreak(0);
    setTotalTime(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setAnswerHistory([]);
    setLeaderboard([]);
    setPlayerRank(0);
    setError(null);
    questionStartRef.current = Date.now();

    if (!tokenRef.current) return;
    try {
      setPhase(PHASE.LOADING);
      // Limpia la lista de exclusión para que el backend devuelva el total configurado
      usedQuestionIds.current = [];
      const qs = await fetchQuestions(tokenRef.current);
      usedQuestionIds.current = qs.map(q => q.id);

      if (gamificacionRef.current) {
        poolsRef.current = buildPools(qs);
        usedInGameRef.current = new Set();
        const first = pickFromPools(poolsRef.current, 0, qs.length, usedInGameRef.current);
        setPickedQuestion(first);
      }

      setQuestions(qs);
      timer.reset(gameConfig.timePerQuestion);
      setPhase(PHASE.PLAYING);
    } catch (err) {
      setError(err.message);
      setPhase(PHASE.ERROR);
    }
  }, [gameConfig, timer]);

  // ── Exit ───────────────────────────────────────────────────────────────
  const exitGame = useCallback(async () => {
    clearSession();
    timer.stop();
    if (tokenRef.current) {
      finishGame(tokenRef.current).catch(() => {});
    }
  }, [timer]);

  const currentQuestion = gamificacionRef.current
    ? (pickedQuestion || null)
    : (questions[currentIndex] || null);
  const totalAnswered   = correctCount + incorrectCount;
  const precision       = totalAnswered > 0
    ? Math.round((correctCount / totalAnswered) * 100) : 0;

  return {
    phase,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    questions,
    maxLives:  gameConfig.lives,
    lives,
    score,
    correctCount,
    incorrectCount,
    maxStreak,
    currentStreak,
    totalTime,
    precision,
    selectedOption,
    isCorrect,
    leaderboard,
    playerRank,
    answerHistory,
    lastPoints,
    timeLeft:    timer.timeLeft,
    timerProgress: timer.progress,
    error,
    gamificacion,
    selectAnswer,
    nextQuestion,
    restartGame,
    exitGame,
  };
}
