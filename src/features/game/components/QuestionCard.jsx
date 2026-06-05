import { useTranslation } from "react-i18next";
import { Zap } from "lucide-react";
import "./QuestionCard.css";

const DIFF_COLOR = {
  very_easy:    "#86efac",
  easy:         "#22c55e",
  intermediate: "#f59e0b",
  hard:         "#ef4444",
  very_hard:    "#b91c1c",
  medium:       "#f59e0b",
};

const DIFF_KEY = {
  very_easy:    "diff_very_easy",
  easy:         "diff_easy",
  intermediate: "diff_intermediate",
  hard:         "diff_hard",
  very_hard:    "diff_very_hard",
  medium:       "diff_intermediate",
};

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function QuestionCard({ question, selectedOption, onSelectOption, disabled = false }) {
  const { t } = useTranslation("game");

  if (!question) {
    return (
      <div className="question-card question-card--empty">
        <p>{t("loading_title")}</p>
      </div>
    );
  }

  const color     = DIFF_COLOR[question.difficulty] || DIFF_COLOR.intermediate;
  const diffLabel = t(DIFF_KEY[question.difficulty] || "diff_intermediate");

  return (
    <div className="question-card">
      <div className="question-card__header">
        <span className="question-card__category">{question.category}</span>
        <span
          className="question-card__difficulty"
          style={{ color, borderColor: color }}
        >
          <Zap size={11} />
          {diffLabel}
        </span>
      </div>

      <h2 className="question-card__text">{question.text}</h2>

      <div className="question-card__options">
        {question.options.map((optText, index) => {
          const isSelected = selectedOption === index;
          const isTimeOut  = selectedOption === -1;

          return (
            <button
              key={index}
              className={`
                question-card__option
                ${isSelected ? "question-card__option--selected" : ""}
                ${disabled && !isSelected ? "question-card__option--disabled" : ""}
                ${isTimeOut ? "question-card__option--timeout" : ""}
              `}
              onClick={() => !disabled && onSelectOption(index)}
              disabled={disabled}
            >
              <span className="question-card__option-letter">{OPTION_LABELS[index]}</span>
              <span className="question-card__option-text">{optText}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
