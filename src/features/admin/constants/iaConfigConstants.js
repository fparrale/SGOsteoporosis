// ─── iaConfigConstants.js ─────────────────────────────────────────────────────

export const DEFAULT_PROMPT =
`Eres un experto en salud ósea y educador sanitario especializado en Osteoporosis y prevención.
Genera EXACTAMENTE {cantidad} pregunta(s) de opción múltiple sobre la categoría "{categoria}" con nivel de dificultad "{dificultad}" en idioma "{idioma}".

Contexto educativo: Concientización sobre Osteoporosis
Audiencia: Estudiantes sin formación médica
Estándares: Generales, Guías MSP Ecuador, OPS/OMS y literatura científica validada

Niveles de dificultad:
- muy_facil: definiciones simples, recordar hechos básicos
- facil: comprensión general de conceptos cotidianos
- intermedio: aplicación de conceptos, requiere conocimiento específico
- dificil: análisis técnico detallado, terminología clínica
- muy_dificil: síntesis y evaluación crítica, nivel especializado

INSTRUCCIONES CRÍTICAS:
1. Responde SOLO con un array JSON válido — sin markdown, sin comentarios, sin texto adicional
2. Genera exactamente {cantidad} objeto(s) en el array
3. Estructura EXACTA de cada objeto:
   {"statement":"...","options":[{"text":"...","is_correct":bool}],"explanation_correct":"...","explanation_incorrect":"...","source_ref":"..."}
4. Cada pregunta tiene exactamente 4 opciones
5. Una sola opción por pregunta tiene is_correct: true
6. Enunciado claro y conciso (100-300 caracteres)
7. Opciones balanceadas — ninguna trivialmente incorrecta
8. explanation_correct: por qué esa opción es correcta (150-250 caracteres)
9. explanation_incorrect: orientación general para respuestas incorrectas (150-250 caracteres)
10. source_ref: cita breve — "MSP Ecuador", "OPS/OMS" o literatura médica validada

JSON ESTRICTO (sin markdown, sin texto antes ni después):`;
  
  export const DEFAULT_TEMPERATURE = 0.5;
  
  export const TEMPERATURE_THRESHOLDS = {
    precise: 0.33,
    balanced: 0.66,
  };
  
  // Claves de traducción para los niveles de temperatura.
  // El hook las resuelve con t() para no acoplar i18n a las constantes.
  export const TEMPERATURE_LEVEL_KEYS = {
    precise: { label: "temp_precise", desc: "temp_precise_desc" },
    balanced: { label: "temp_balanced", desc: "temp_balanced_desc" },
    creative: { label: "temp_creative", desc: "temp_creative_desc" },
  };
  
  export const PRO_TIP_URL = "https://shorturl.at/tL2b1";