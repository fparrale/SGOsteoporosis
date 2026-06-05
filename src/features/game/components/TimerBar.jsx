import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./TimerBar.css";

export default function TimerBar({ progress = 1, timeLeft = 0 }) {
  // Color: verde > 50%, amarillo 25-50%, rojo < 25%
  const getColor = () => {
    if (progress > 0.5) return "#22c55e";
    if (progress > 0.25) return "#f59e0b";
    return "#ef4444";
  };

  // Animación de pulso cuando queda poco tiempo
  const isUrgent = progress <= 0.25;

  return (
    <div className={`timer-bar ${isUrgent ? "timer-bar--urgent" : ""}`}>
      <div className="timer-bar__track">
        <div
          className="timer-bar__fill"
          style={{
            width: `${Math.max(progress * 100, 0)}%`,
            background: getColor(),
          }}
        />
      </div>
      <div className="timer-bar__time">
        <DotLottieReact
          src={import.meta.env.BASE_URL + "animations/clock.lottie"}
          loop
          autoplay
          style={{ width: 28, height: 28, flexShrink: 0 }}
        />
        <span className="timer-bar__label" style={{ color: getColor() }}>
          {timeLeft}s
        </span>
      </div>
    </div>
  );
}
