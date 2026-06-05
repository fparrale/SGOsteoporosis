import { useState, useEffect, useRef, useCallback } from "react";

// ─── useTimer ────────────────────────────────────────────────────────────
// Hook de temporizador para el juego.
// - `duration`: segundos totales
// - `onTimeUp`: callback cuando se acaba el tiempo
// - `running`: control externo para pausar/reanudar
// Retorna: { timeLeft, isRunning, progress, start, stop, reset }
// ─────────────────────────────────────────────────────────────────────────

export function useTimer(duration = 15, onTimeUp = () => {}, running = true) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Mantener referencia actualizada al callback
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Llamar al callback en el próximo ciclo para evitar set durante render
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback((newDuration) => {
    stop();
    setTimeLeft(newDuration ?? duration);
    if (newDuration !== 0) start();
  }, [duration, start, stop]);

  // Auto-start cuando running cambia a true
  useEffect(() => {
    if (running && timeLeft > 0) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [running, start, stop]); // eslint-disable-line react-hooks/exhaustive-deps

  const progress = duration > 0 ? timeLeft / duration : 0;

  return {
    timeLeft,
    isRunning: running,
    progress,
    start,
    stop,
    reset,
    setTimeLeft,
  };
}
