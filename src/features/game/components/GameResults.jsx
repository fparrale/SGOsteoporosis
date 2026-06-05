import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Trophy, Medal, Target, Clock, TrendingUp, Globe, DoorOpen,
  RotateCcw, Home, XCircle, BarChart, Layers, ArrowLeft,
  CheckCircle, Timer, X, Check,
} from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import LanguageSelector from "../../../components/language/LanguageSelector";
import "./GameResults.css";

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  if (min > 0) return `${min}m ${sec}s`;
  return `${sec}s`;
}

function getMedal(rank) {
  if (rank === 1) return <Medal size={18} color="#f59e0b" />;
  if (rank === 2) return <Medal size={18} color="#94a3b8" />;
  if (rank === 3) return <Medal size={18} color="#cd7f32" />;
  return null;
}

const DIFF_CLASS = {
  very_easy:    "diff-easy",
  easy:         "diff-easy",
  intermediate: "diff-medium",
  medium:       "diff-medium",
  hard:         "diff-hard",
  very_hard:    "diff-hard",
};

const DIFF_NUM = {
  very_easy: 1, easy: 2, intermediate: 3, medium: 3, hard: 4, very_hard: 5,
};

const DIFF_KEY = {
  very_easy:    "diff_very_easy",
  easy:         "diff_easy",
  intermediate: "diff_intermediate",
  medium:       "diff_intermediate",
  hard:         "diff_hard",
  very_hard:    "diff_very_hard",
};

function useCategoryStats(answerHistory, allQuestions = []) {
  const totalByCategory = {};
  for (const q of allQuestions) {
    if (!totalByCategory[q.category]) totalByCategory[q.category] = 0;
    totalByCategory[q.category]++;
  }

  const catMap = {};
  for (const a of answerHistory) {
    if (!catMap[a.category]) {
      catMap[a.category] = { correct: 0, total: 0, totalTime: 0 };
    }
    catMap[a.category].total += 1;
    catMap[a.category].totalTime += a.timeSpent || 0;
    if (a.isCorrect) catMap[a.category].correct += 1;
  }
  return Object.entries(catMap).map(([name, st]) => ({
    name,
    correct: st.correct,
    total: st.total,
    totalInCategory: totalByCategory[name] || st.total,
    precision: st.total > 0 ? Math.round((st.correct / st.total) * 100) : 0,
    avgTime: st.total > 0 ? st.totalTime / st.total : 0,
  }));
}

export default function GameResults({
  score = 0,
  correctCount = 0,
  incorrectCount = 0,
  precision = 0,
  maxStreak = 0,
  totalTime = 0,
  leaderboard = [],
  playerRank = 0,
  playerName = "",
  playerAvatar = "",
  answerHistory = [],
  questions = [],
  isRoomMode = false,
  onRestart,
  onExit,
}) {
  const { t } = useTranslation("game");
  const [view, setView] = useState("summary");
  const totalAnswered = correctCount + incorrectCount;
  const errors = answerHistory.filter((a) => !a.isCorrect);
  const categoryStats = useCategoryStats(answerHistory, questions);

  const avgDiffNum = answerHistory.length > 0
    ? answerHistory.reduce((sum, a) => sum + (DIFF_NUM[a.difficulty] ?? 3), 0) / answerHistory.length
    : null;

  if (view === "details") {
    return (
      <div className="results-root">
        <LanguageSelector />
        <div className="results-inner">
          <div className="results-header">
            <div className="results-header__player">
              {playerAvatar && (
                <img src={playerAvatar} alt={playerName} className="results-header__avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
              <div className="results-header__info">
                <h1 className="results-title">{t("results_details_title")}</h1>
                <p className="results-subtitle">{playerName}</p>
              </div>
            </div>
            <button className="results-back-btn" onClick={() => setView("summary")}>
              <ArrowLeft size={18} />
              {t("results_back")}
            </button>
          </div>

          {/* ── Tus Errores ── */}
          {errors.length > 0 && (
            <div className="results-errors">
              <h2 className="results-section-title">
                <XCircle size={18} color="#ef4444" />
                {t("results_errors_title")} ({errors.length})
              </h2>
              <div className="results-errors__list">
                {errors.map((err, i) => (
                  <div key={i} className="results-errors__item">
                    <div className="results-errors__item-header">
                      <span className="results-errors__number">
                        {t("results_question_num", { n: i + 1 })}
                      </span>
                      <span className={`results-errors__badge ${DIFF_CLASS[err.difficulty] || ""}`}>
                        {t(DIFF_KEY[err.difficulty] || "diff_intermediate")}
                      </span>
                      <span className="results-errors__category">{err.category}</span>
                    </div>
                    <p className="results-errors__question">{err.questionText}</p>
                    {err.selectedIndex === -1 ? (
                      <div className="results-errors__timeout">
                        <Timer size={14} />
                        {t("results_timeout")}
                      </div>
                    ) : (
                      <div className="results-errors__answers">
                        <span className="results-errors__answer results-errors__answer--wrong">
                          <X size={14} />
                          {err.options?.[err.selectedIndex] || `Opción ${String.fromCharCode(65 + err.selectedIndex)}`}
                        </span>
                        <span className="results-errors__answer results-errors__answer--correct">
                          <Check size={14} />
                          {err.options?.[err.correctIndex] || `Opción ${String.fromCharCode(65 + err.correctIndex)}`}
                        </span>
                      </div>
                    )}
                    <span className="results-errors__time">
                      {err.timeSpent?.toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Dificultad Promedio ── */}
          {avgDiffNum != null && (
            <div className="results-avg-diff">
              <h2 className="results-section-title">
                <TrendingUp size={18} />
                {t("results_avg_diff_title")}
              </h2>
              <p className="results-avg-diff__label">{t("results_avg_diff_level")}</p>
              <div className="results-avg-diff__value">{avgDiffNum.toFixed(2)} / 5.00</div>
              <div className="results-avg-diff__track">
                <div
                  className="results-avg-diff__fill"
                  style={{ width: `${(avgDiffNum / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Desempeño por Categoría ── */}
          {categoryStats.length > 0 && (
            <div className="results-categories">
              <h2 className="results-section-title">
                <Layers size={18} />
                {t("results_categories_title")}
              </h2>
              <div className="results-categories__grid">
                {categoryStats.map((cat) => (
                  <div key={cat.name} className="results-categories__card">
                    <div className="results-categories__card-header">
                      <span className="results-categories__name">{cat.name}</span>
                      <span className={`results-categories__prec ${
                        cat.precision >= 80 ? "prec-high" : cat.precision >= 50 ? "prec-mid" : "prec-low"
                      }`}>
                        {cat.precision}%
                      </span>
                    </div>
                    <div className="results-categories__bar-track">
                      <div
                        className={`results-categories__bar-fill ${
                          cat.precision >= 80 ? "fill-high" : cat.precision >= 50 ? "fill-mid" : "fill-low"
                        }`}
                        style={{ width: `${cat.precision}%` }}
                      />
                    </div>
                    <div className="results-categories__stats">
                      <span>
                        {t("results_hits", { correct: cat.correct, total: cat.total })}
                        {" · "}{cat.totalInCategory} {t("results_questions_abbr")}
                      </span>
                      <span className="results-cat-time">
                        <Timer size={12} />
                        {cat.avgTime.toFixed(1)}s {t("results_avg_abbr")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sin errores ── */}
          {errors.length === 0 && (
            <div className="results-errors">
              <div className="results-no-errors">
                <Target size={48} color="#22c55e" />
                <h3>{t("results_perfect_title")}</h3>
                <p>{t("results_perfect_sub")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const rankingTitle = isRoomMode ? t("results_ranking_room") : t("results_ranking_global");
  const rankingIcon  = isRoomMode ? <DoorOpen size={18} /> : <Globe size={18} />;

  return (
    <div className="results-root">
      <LanguageSelector />
      <div className="results-inner">
        {/* ── Header ── */}
        <div className="results-header">
          <div className="results-header__player">
            {playerAvatar && (
              <img src={playerAvatar} alt={playerName} className="results-header__avatar" />
            )}
            <div className="results-header__info">
              <h1 className="results-title">{t("results_title")}</h1>
              <p className="results-subtitle">
                {playerName},{" "}
                <strong>
                  {t("results_rank", { rank: playerRank })} {getMedal(playerRank)}
                </strong>
              </p>
            </div>
          </div>
          <div className="results-trophy">
            <Trophy size={36} className="results-trophy__icon" />
          </div>
        </div>

        {/* ── Grid: Resumen + Ranking ── */}
        <div className="results-grid">
          {/* ── Columna izquierda: Resumen ── */}
          <div className="results-summary">
            <h2 className="results-section-title">
              <BarChart size={18} />
              {t("results_summary_title")}
            </h2>

            <div className="results-stats">
              <div className="results-stat">
                <div className="results-stat__icon results-stat__icon--score">
                  <Trophy size={20} />
                </div>
                <div className="results-stat__body">
                  <span className="results-stat__label">{t("results_final_score")}</span>
                  <span className="results-stat__value">{score.toLocaleString()} {t("results_pts")}</span>
                </div>
              </div>

              <div className="results-stat">
                <div className="results-stat__icon results-stat__icon--correct">
                  <Target size={20} />
                </div>
                <div className="results-stat__body">
                  <span className="results-stat__label">{t("results_correct")}</span>
                  <span className="results-stat__value">{correctCount}/{totalAnswered}</span>
                </div>
              </div>

              <div className="results-stat">
                <div className="results-stat__icon results-stat__icon--precision">
                  <TrendingUp size={20} />
                </div>
                <div className="results-stat__body">
                  <span className="results-stat__label">{t("results_precision")}</span>
                  <span className="results-stat__value">{precision}%</span>
                </div>
              </div>

              <div className="results-stat">
                <div className="results-stat__icon results-stat__icon--streak">
                  <DotLottieReact
                    src={import.meta.env.BASE_URL + "animations/flame.lottie"}
                    autoplay
                    loop
                    style={{ width: 32, height: 32 }}
                  />
                </div>
                <div className="results-stat__body">
                  <span className="results-stat__label">{t("results_max_streak")}</span>
                  <span className="results-stat__value">{maxStreak} {t("results_streak_unit")}</span>
                </div>
              </div>

              <div className="results-stat">
                <div className="results-stat__icon results-stat__icon--time">
                  <Clock size={20} />
                </div>
                <div className="results-stat__body">
                  <span className="results-stat__label">{t("results_total_time")}</span>
                  <span className="results-stat__value">{formatTime(totalTime)}</span>
                </div>
              </div>

              <button className="results-details-btn" onClick={() => setView("details")}>
                <XCircle size={16} />
                {t("results_details_btn")}
              </button>
            </div>
          </div>

          {/* ── Columna derecha: Ranking ── */}
          <div className="results-leaderboard">
            <h2 className="results-section-title">
              {rankingIcon}
              {rankingTitle}
            </h2>
            <p className="results-leaderboard__subtitle">
              {isRoomMode ? t("results_ranking_room_sub") : t("results_ranking_global_sub")}
            </p>

            <div className="results-leaderboard__list">
              {leaderboard.slice(0, 10).map((player, i) => {
                const isMe = player.name === playerName;
                return (
                  <div
                    key={i}
                    className={`results-leaderboard__row ${isMe ? "results-leaderboard__row--me" : ""}`}
                  >
                    <div className="results-leaderboard__rank">
                      {getMedal(i + 1) || <span>#{i + 1}</span>}
                    </div>
                    <div className="results-leaderboard__avatar">
                      {player.avatar ? (
                        <img src={player.avatar} alt={player.name} className="results-leaderboard__img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : (
                        <div className="results-leaderboard__initial">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="results-leaderboard__info">
                      <span className="results-leaderboard__name">
                        {player.name} {isMe && t("results_you")}
                      </span>
                      <span className="results-leaderboard__detail">
                        {player.score.toLocaleString()} {t("results_pts")} · {player.precision}{t("results_precision_abbr")}
                      </span>
                    </div>
                    {isMe && (
                      <div className="results-leaderboard__badge">{t("results_you_badge")}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {leaderboard.length > 10 && (
              <p className="results-leaderboard__more">
                {t("results_more_players", { n: leaderboard.length - 10 })}
              </p>
            )}
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className="results-actions">
          <button className="results-btn results-btn--primary" onClick={onRestart}>
            <RotateCcw size={16} />
            {t("results_restart")}
          </button>
          <button className="results-btn results-btn--secondary" onClick={onExit}>
            <Home size={16} />
            {t("results_exit")}
          </button>
        </div>
      </div>
    </div>
  );
}
