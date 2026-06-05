import { useTranslation } from "react-i18next";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./FeedbackModal.css";

export default function FeedbackModal({
  isCorrect,
  selectedOption,
  question,
  pointsEarned = 0,
  onNext,
}) {
  const { t } = useTranslation("game");

  if (!question) return null;

  const isTimeOut = selectedOption === -1;
  const feedbackText = isCorrect ? question.feedbackCorrect : question.feedbackIncorrect;
  const correctAnswerText = question.options[question.correctIndex];

  return (
    <div className="feedback-overlay">
      <div
        className={`feedback-modal ${
          isCorrect ? "feedback-modal--success" : "feedback-modal--error"
        }`}
      >
        <div className="feedback-modal__icon-wrapper">
          {isCorrect ? (
            <CheckCircle size={40} className="feedback-modal__icon feedback-modal__icon--success" />
          ) : (
            <DotLottieReact
              src={import.meta.env.BASE_URL + "animations/heartx.json"}
              loop
              autoplay
              style={{ width: 90, height: 90, margin: "0 auto" }}
            />
          )}
        </div>

        <h2 className="feedback-modal__title">
          {isCorrect
            ? t("feedback_correct")
            : isTimeOut
            ? t("feedback_timeout")
            : t("feedback_incorrect")}
        </h2>

        {isCorrect && pointsEarned > 0 && (
          <div className="feedback-modal__points">
            +{pointsEarned} {t("results_pts")}
          </div>
        )}

        {!isCorrect && (
          <div className="feedback-modal__correct-answer">
            <AlertTriangle size={14} />
            <span>
              {t("feedback_correct_answer")} <strong>{correctAnswerText}</strong>
            </span>
          </div>
        )}

        <p className="feedback-modal__text">{feedbackText}</p>

        <button className="feedback-modal__btn" onClick={onNext}>
          {isCorrect ? t("feedback_next") : t("feedback_continue")}
        </button>
      </div>
    </div>
  );
}
