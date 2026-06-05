import { useCallback } from "react";
import { useNavigate, useSearchParams, useLocation, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";
import { useGameLogic, PHASE } from "../hooks/useGameLogic";
import TimerBar from "../components/TimerBar";
import LivesDisplay from "../components/LivesDisplay";
import QuestionCard from "../components/QuestionCard";
import FeedbackModal from "../components/FeedbackModal";
import GameResults from "../components/GameResults";
import GameError from "../components/GameError";
import LanguageSelector from "../../../components/language/LanguageSelector";
import "./GameScreen.css";

export default function GameScreen() {
  const { t } = useTranslation("game");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const state = location.state;

  const roomCode     = searchParams.get("room") || "";
  const playerName   = state?.name     || "";
  const playerAge    = state?.age      || "";
  const playerAvatar = state?.avatar   || "";
  const avatarId     = parseInt(state?.avatarId, 10) || 1;
  const isRoomMode   = Boolean(roomCode && roomCode.length >= 6);

  const game = useGameLogic(roomCode, playerName, playerAge, avatarId);

  const handleSelectAnswer = useCallback(
    (optionIndex) => { game.selectAnswer(optionIndex); },
    [game]
  );

  const handleNext = useCallback(() => { game.nextQuestion(); }, [game]);

  const handleRestart = useCallback(() => { game.restartGame(); }, [game]);

  const handleExit = useCallback(() => {
    game.exitGame();
    navigate("/");
  }, [game, navigate]);

  if (!state?.name) {
    return <Navigate replace to="/" />;
  }

  if (game.phase === PHASE.LOADING) {
    return (
      <div className="game-screen">
        <LanguageSelector />
        <div className="game-loading">
          <Loader size={36} className="game-loading__spinner" />
          <h2>{t("loading_title")}</h2>
          <p>{t("loading_sub")}</p>
        </div>
      </div>
    );
  }

  if (game.phase === PHASE.ERROR) {
    const BACKEND_ERROR_MAP = {
      'La sala está pausada o finalizada':                                         'error_room_paused',
      'Código de sala inválido. Verifica el código e inténtalo de nuevo.':         'error_invalid_code',
      'La sala está llena':                                                        'error_room_full',
      'Nombre y edad son requeridos':                                              'error_name_required',
      'El nombre no puede superar 50 caracteres':                                  'error_name_too_long',
      'El nombre contiene caracteres no permitidos':                               'error_name_invalid',
    };
    const errKey = game.error ? BACKEND_ERROR_MAP[game.error] : null;
    const errorMessage = errKey ? t(errKey) : (game.error || t("error_default"));
    return (
      <GameError
        message={errorMessage}
        onBack={handleExit}
      />
    );
  }

  if (game.phase === PHASE.RESULTS) {
    return (
      <GameResults
        score={game.score}
        correctCount={game.correctCount}
        incorrectCount={game.incorrectCount}
        precision={game.precision}
        maxStreak={game.maxStreak}
        totalTime={game.totalTime}
        leaderboard={game.leaderboard}
        playerRank={game.playerRank}
        playerName={playerName}
        playerAvatar={playerAvatar}
        answerHistory={game.answerHistory}
        questions={game.questions || []}
        isRoomMode={isRoomMode}
        onRestart={handleRestart}
        onExit={handleExit}
      />
    );
  }

  const isFeedbackPhase = game.phase === PHASE.FEEDBACK;
  const currentQ = game.currentQuestion;

  return (
    <div className="game-screen">
      <LanguageSelector />
      <div className="game-screen__inner">
        {/* ── Barra superior ── */}
        <div className="game-screen__top-bar">
          <div className="game-screen__progress">
            <span className="game-screen__progress-text">
              {t("question_counter", {
                current: game.currentIndex + 1,
                total: game.totalQuestions,
              })}
            </span>
            <div className="game-screen__progress-track">
              <div
                className="game-screen__progress-fill"
                style={{
                  width: `${((game.currentIndex + (isFeedbackPhase ? 1 : 0)) / game.totalQuestions) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="game-screen__top-right">
            <LivesDisplay lives={game.lives} maxLives={game.maxLives} />
            <div className="game-screen__score">
              <span className="game-screen__score-label">{t("score_label")}</span>
              <span className="game-screen__score-value">{game.score.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Temporizador ── */}
        <TimerBar progress={game.timerProgress} timeLeft={game.timeLeft} />

        {/* ── Información del jugador ── */}
        <div className="game-screen__player-info">
          {playerAvatar && (
            <img
              src={playerAvatar}
              alt={playerName}
              className="game-screen__player-avatar"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <div className="game-screen__player-details">
            <span className="game-screen__player-name">{playerName}</span>
            <div className="game-screen__player-meta">
              {playerAge && (
                <span className="game-screen__player-age">
                  {playerAge} {t("years")}
                </span>
              )}
              <span className={`game-screen__mode-badge ${isRoomMode ? "room" : "public"}`}>
                {isRoomMode ? t("mode_private") : t("mode_public")}
              </span>
            </div>
          </div>
          {game.currentStreak >= 2 && (
            <div className="game-screen__streak">
              <DotLottieReact
                src={import.meta.env.BASE_URL + "animations/flame.lottie"}
                loop
                autoplay
                style={{ width: 24, height: 24, display: "block", transform: "translateY(-4px)" }}
              />
              {t("streak")}: {game.currentStreak}
            </div>
          )}
        </div>

        {/* ── Pregunta ── */}
        {currentQ && (
          <QuestionCard
            key={currentQ.id}
            question={currentQ}
            selectedOption={game.selectedOption}
            onSelectOption={handleSelectAnswer}
            disabled={isFeedbackPhase}
          />
        )}

        {/* ── Modal de Feedback ── */}
        {isFeedbackPhase && (
          <FeedbackModal
            isCorrect={game.isCorrect}
            selectedOption={game.selectedOption}
            question={currentQ}
            pointsEarned={game.isCorrect ? game.lastPoints : 0}
            onNext={handleNext}
          />
        )}
      </div>
    </div>
  );
}
