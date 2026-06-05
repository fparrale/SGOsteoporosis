// ─── useGameConfig.jsx ────────────────────────────────────────────────────────

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Alert from "../../../components/ui/Alert";
import {
  DEFAULTS,
  QUESTIONS_MIN,
  QUESTIONS_MAX,
  TIME_MIN,
  TIME_MAX,
} from "../constants/gameConfigConstants";
import { fetchTournamentConfig, saveTournamentConfig } from "../services/GameConfigService";

function snapshot(fields) {
  return {
    questions: fields.questions,
    timePerQ: fields.timePerQ,
    random: fields.random,
    difficulty: fields.difficulty,
    lives: fields.lives,
    language: fields.language,
  };
}

function equalSnapshot(a, b) {
  if (!a || !b) return false;
  return (
    a.questions === b.questions &&
    a.timePerQ === b.timePerQ &&
    a.random === b.random &&
    a.difficulty === b.difficulty &&
    a.lives === b.lives &&
    a.language === b.language
  );
}

export function useGameConfig() {
  const { t } = useTranslation("admin");

  const [questions, setQuestions] = useState(DEFAULTS.questions);
  const [timePerQ, setTimePerQ] = useState(DEFAULTS.timePerQ);
  const [random, setRandom] = useState(DEFAULTS.random);
  const [difficulty, setDifficulty] = useState(DEFAULTS.difficulty);
  const [lives, setLives] = useState(DEFAULTS.lives);
  const [language, setLanguage] = useState(DEFAULTS.language);

  /** Última versión guardada / cargada desde API (para dirty y descartar). */
  const [baseline, setBaseline] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const ui = await fetchTournamentConfig();
        if (cancelled) return;
        setQuestions(ui.questions);
        setTimePerQ(ui.timePerQ);
        setRandom(ui.random);
        setDifficulty(ui.difficulty);
        setLives(ui.lives);
        setLanguage(ui.language);
        setBaseline(snapshot(ui));
        setLoadError(false);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setLoadError(true);
          setBaseline(snapshot(DEFAULTS));
          Alert.error(t("tournaments_load_error_alert"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fields = useMemo(
    () => ({ questions, timePerQ, random, difficulty, lives, language }),
    [questions, timePerQ, random, difficulty, lives, language]
  );

  const isDirty = useMemo(() => {
    if (!baseline) return false;
    return !equalSnapshot(snapshot(fields), baseline);
  }, [fields, baseline]);

  const sliderPct = Math.round(((timePerQ - TIME_MIN) / (TIME_MAX - TIME_MIN)) * 100);

  const sliderBg = `linear-gradient(to right,
    #3b6cf8 0%, #3b6cf8 ${sliderPct}%,
    #e2e8f0 ${sliderPct}%, #e2e8f0 100%)`;

  const clampQuestions = useCallback(
    (value) =>
      setQuestions(Math.min(QUESTIONS_MAX, Math.max(QUESTIONS_MIN, value))),
    []
  );

  const toggleRandom = useCallback(() => setRandom((prev) => !prev), []);

  const handleDiscard = useCallback(() => {
    if (!baseline) return;
    setQuestions(baseline.questions);
    setTimePerQ(baseline.timePerQ);
    setRandom(baseline.random);
    setDifficulty(baseline.difficulty);
    setLives(baseline.lives);
    setLanguage(baseline.language);
    Alert.warning(t("tournaments_discard_alert"));
  }, [baseline, t]);

  const handleSave = useCallback(async () => {
    if (!baseline || isLoading) return;
    try {
      const saved = await saveTournamentConfig(fields);
      setBaseline(snapshot(saved));
      setQuestions(saved.questions);
      setTimePerQ(saved.timePerQ);
      setRandom(saved.random);
      setDifficulty(saved.difficulty);
      setLives(saved.lives);
      setLanguage(saved.language);
      Alert.success(t("tournaments_save_success_alert"));
    } catch {
      Alert.error(t("tournaments_save_error_alert"));
    }
  }, [fields, t, baseline, isLoading]);

  return {
    fields: { questions, timePerQ, random, difficulty, lives, language },
    setters: {
      clampQuestions,
      setTimePerQ,
      toggleRandom,
      setDifficulty,
      setLives,
      setLanguage,
    },
    helpers: { sliderPct, sliderBg },
    isDirty,
    loadError,
    isLoading,
    handleSave,
    handleDiscard,
  };
}
