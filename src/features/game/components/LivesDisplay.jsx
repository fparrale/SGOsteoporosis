import { Heart } from "lucide-react";
import "./LivesDisplay.css";

// ─── LivesDisplay ────────────────────────────────────────────────────────
// Muestra las vidas restantes como corazones.
// Props:
//   - lives: número de vidas actuales
//   - maxLives: número máximo de vidas (para mostrar vacías)
// ─────────────────────────────────────────────────────────────────────────

export default function LivesDisplay({ lives = 3, maxLives = 3 }) {
  return (
    <div className="lives-display">
      <span className="lives-display__label">Vidas</span>
      <div className="lives-display__hearts">
        {Array.from({ length: maxLives }, (_, i) => (
          <Heart
            key={i}
            size={22}
            className={`lives-display__heart ${
              i < lives ? "lives-display__heart--active" : "lives-display__heart--lost"
            }`}
            fill={i < lives ? "#ef4444" : "none"}
          />
        ))}
      </div>
    </div>
  );
}
