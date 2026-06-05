// ─── GameService.js ──────────────────────────────────────────────────────
// Comunicación con el backend del módulo de juego.
// Todas las llamadas van a /api/game/* (proxied por Vite → Apache).

export const AVATARS = [
  { id: 1, name: 'Alegre',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Alegre' },
  { id: 2, name: 'Cool',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=sixsevbenbbn' },
  { id: 3, name: 'Divertido', url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=xrlev' },
  { id: 4, name: 'Tímido',    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=timidoop' },
  { id: 5, name: 'Loco',      url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Zoe' },
];

// ── POST /api/game/join ──────────────────────────────────────────────────
// pin: string (6 caracteres) o '' para modo público
// Retorna: { token, playerId, sessionId, config: { timePerQuestion, lives, totalQuestions, points } }
export async function joinRoom(pin, { name, age, avatarId }) {
  const res = await fetch('/api/game/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, name, age: parseInt(age, 10), avatarId }),
  });
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || 'Error al unirse al juego');
  return data;
}

// ── GET /api/game/questions ──────────────────────────────────────────────
// Token en Authorization: Bearer header — no queda en logs ni historial del navegador.
// Retorna: { questions: [{ id, text, options, optionIds, correctIndex, category, difficulty, feedbackCorrect, feedbackIncorrect }] }
export async function fetchQuestions(token, excludeIds = []) {
  let url = '/api/game/questions';
  if (excludeIds.length > 0) url += `?exclude=${excludeIds.join(',')}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar preguntas');
  return data.questions;
}

// ── POST /api/game/answer ─────────────────────────────────────────────────
// selectedOptionId: ID de opción en BD (null si se agotó el tiempo)
// Retorna: { isCorrect, pointsEarned }
export async function submitAnswer(token, questionId, selectedOptionId, timeSpent, currentStreak) {
  const res = await fetch('/api/game/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      questionId,
      selectedOptionId: selectedOptionId ?? null,
      timeSpent: parseFloat(timeSpent.toFixed(2)),
      currentStreak: currentStreak ?? 0,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al enviar respuesta');
  return data;
}

// ── GET /api/game/leaderboard ────────────────────────────────────────────
// Token en Authorization: Bearer header — no queda en logs ni historial del navegador.
// Retorna: { leaderboard: [{ name, score, precision, avatar }] }
export async function fetchLeaderboard(token) {
  const res = await fetch('/api/game/leaderboard', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al cargar ranking');
  return data.leaderboard;
}

// ── POST /api/game/finish ─────────────────────────────────────────────────
// Marca la partida como finalizada y actualiza estadísticas globales.
export async function finishGame(token) {
  try {
    await fetch('/api/game/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch {
    // No es crítico: los datos ya se guardaron respuesta a respuesta
  }
}
