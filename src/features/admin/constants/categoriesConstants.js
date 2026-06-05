// ─── Datos estáticos de la feature Categories ───────────────────────────

import { HeartPulse, Bone, Shield, Megaphone, BookOpen } from "lucide-react";

export const INITIAL_CATEGORIES = [
  { id: "CAT-001", name: "Salud y Bienestar", icon: "heart_pulse", description: "Conceptos generales sobre salud y bienestar.",             questions: 12 },
  { id: "CAT-002", name: "Salud Ósea",        icon: "bone",        description: "Información específica sobre la salud de los huesos.",        questions: 25 },
  { id: "CAT-003", name: "Prevención",         icon: "shield",      description: "Métodos y consejos para prevenir la osteoporosis.",          questions: 30 },
  { id: "CAT-004", name: "Concientización",    icon: "megaphone",   description: "Importancia de la concientización sobre la osteoporosis.",   questions: 15 },
];

export const SUGERENCIAS_BASE = [
  { nombre: "Fisiopatología del Hueso",          descripcion: "Densidad ósea, remodelado óseo y metabolismo del calcio.",         icon: "bone"       },
  { nombre: "Diagnóstico y Tratamiento",          descripcion: "Densitometría DXA, criterios OMS, bifosfonatos y manejo clínico.", icon: "heart_pulse" },
  { nombre: "Nutrición y Suplementación",         descripcion: "Calcio, vitamina D, magnesio y dieta para prevenir osteoporosis.", icon: "shield"     },
  { nombre: "Actividad Física y Rehabilitación",  descripcion: "Ejercicio terapéutico, prevención de caídas y fracturas.",         icon: "shield"     },
  { nombre: "Mecánicas del Juego Educativo",      descripcion: "Gamificación, niveles, recompensas y retroalimentación.",          icon: "book"       },
  { nombre: "Conocimiento en Estudiantes",        descripcion: "Percepción y actitudes universitarias sobre osteoporosis.",        icon: "megaphone"  },
];

export const EXTRA_SUGERENCIAS = [
  { nombre: "Factores Genéticos y Hormonales",  descripcion: "Influencia hormonal y predisposición genética en la osteoporosis.", icon: "bone"       },
  { nombre: "Impacto Psicosocial",              descripcion: "Calidad de vida, adherencia y aspectos emocionales del paciente.",  icon: "heart_pulse" },
  { nombre: "Tecnología y Salud Ósea",          descripcion: "Apps, wearables y herramientas digitales para monitoreo óseo.",    icon: "book"       },
];

export const ICON_MAP = {
  heart_pulse: HeartPulse,
  bone:        Bone,
  shield:      Shield,
  megaphone:   Megaphone,
  book:        BookOpen,
};