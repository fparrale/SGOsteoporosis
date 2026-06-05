import {
  Bone,
  BookOpen,
  HeartPulse,
  Megaphone,
  Shield,
} from "lucide-react";

export const diffColor = (d, t) =>
  ({
    [t("difficulty_very_easy")]:    { bg: "#f0fdf4", color: "#16a34a" },
    [t("difficulty_easy")]:         { bg: "#dcfce7", color: "#15803d" },
    [t("difficulty_basic")]:        { bg: "#eef2ff", color: "#4338ca" },
    [t("difficulty_intermediate")]: { bg: "#fffbeb", color: "#d97706" },
    [t("difficulty_advanced")]:     { bg: "#fef2f2", color: "#dc2626" },
  }[d] || { bg: "#f1f5f9", color: "#64748b" });

export const statusStyle = (s, t) =>
  ({
    [t("status_verified")]:   { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    [t("status_unverified")]: { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    [t("status_draft")]:      { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" },
  }[s] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" });

export const catIcon = (cat) => {
  const map = {
    "Salud y Bienestar": HeartPulse,
    "Salud Ósea":        Bone,
    "Prevención":        Shield,
    "Concientización":   Megaphone,
    "Aprender":          BookOpen,
  };
  const Icon = map[cat] || BookOpen;
  return <Icon size={13} />;
};
