import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

// ─── Traducciones ──────────────────────────────────────────────────────────────
const L = {
  es: {
    diff: {
      very_easy:    "Muy Fácil",
      easy:         "Fácil",
      intermediate: "Intermedio",
      hard:         "Difícil",
      very_hard:    "Muy Difícil",
    },
    reportTitle: "Reporte de Sala",
    generatedOn: "Generado el",
    roomId:      "ID",
    metrics: {
      players:   "Jugadores",
      sessions:  "Sesiones",
      responses: "Respuestas",
      precision: "Precisión",
      maxScore:  "Punt. Máx.",
    },
    sec: {
      categories: "Rendimiento por Categoría",
      players:    "Clasificación de Jugadores",
      top5:       "Top 5 · Preguntas con Mayor Error",
      hardest:    "Preguntas más difíciles  —  mayor tasa de error",
      easiest:    "Preguntas más fáciles  —  mayor tasa de éxito",
    },
    col: {
      category:    "Categoría",
      precision:   "Precisión",
      correct:     "Correctas",
      incorrect:   "Incorrectas",
      total:       "Total",
      catPrec:     "Prec. Cat.",
      rank:        "#",
      player:      "Jugador",
      sessions:    "Ses.",
      responses:   "Resp.",
      avgPts:      "Prom. Pts",
      maxPts:      "Máx. Pts",
      avgTime:     "T. Prom.",
      question:    "Pregunta",
      difficulty:  "Dificultad",
      errorRate:   "% Error",
      successRate: "% Éxito",
      attempts:    "Intentos",
    },
    errWord: "Error",
    sucWord: "Éxito",
    footer:  "OsteoApp · Sistema de Aprendizaje Preventivo",
    page:    "Página",
    of:      "/",
    sheets: {
      summary: "Resumen",
      players: "Jugadores",
      hardest: "Preg. Difíciles",
      easiest: "Preg. Fáciles",
    },
    xls: {
      roomLabel:      "Sala ID",
      metric:         "Métrica",
      value:          "Valor",
      uniquePlayers:  "Jugadores Únicos",
      totalSessions:  "Total Sesiones",
      totalResponses: "Total Respuestas",
      globalPrec:     "Precisión Global",
      maxScore:       "Puntaje Máximo",
      coverage:       "Cobertura",
    },
  },
  en: {
    diff: {
      very_easy:    "Very Easy",
      easy:         "Easy",
      intermediate: "Intermediate",
      hard:         "Hard",
      very_hard:    "Very Hard",
    },
    reportTitle: "Room Report",
    generatedOn: "Generated on",
    roomId:      "ID",
    metrics: {
      players:   "Players",
      sessions:  "Sessions",
      responses: "Responses",
      precision: "Precision",
      maxScore:  "Max Score",
    },
    sec: {
      categories: "Performance by Category",
      players:    "Player Rankings",
      top5:       "Top 5 · Questions with Highest Error Rate",
      hardest:    "Hardest Questions  —  highest error rate",
      easiest:    "Easiest Questions  —  highest success rate",
    },
    col: {
      category:    "Category",
      precision:   "Precision",
      correct:     "Correct",
      incorrect:   "Incorrect",
      total:       "Total",
      catPrec:     "Cat. Prec.",
      rank:        "#",
      player:      "Player",
      sessions:    "Ses.",
      responses:   "Resp.",
      avgPts:      "Avg. Pts",
      maxPts:      "Max. Pts",
      avgTime:     "Avg. Time",
      question:    "Question",
      difficulty:  "Difficulty",
      errorRate:   "% Error",
      successRate: "% Success",
      attempts:    "Attempts",
    },
    errWord: "Error",
    sucWord: "Success",
    footer:  "OsteoApp · Preventive Learning System",
    page:    "Page",
    of:      "/",
    sheets: {
      summary: "Summary",
      players: "Players",
      hardest: "Hard Questions",
      easiest: "Easy Questions",
    },
    xls: {
      roomLabel:      "Room ID",
      metric:         "Metric",
      value:          "Value",
      uniquePlayers:  "Unique Players",
      totalSessions:  "Total Sessions",
      totalResponses: "Total Responses",
      globalPrec:     "Global Precision",
      maxScore:       "Max Score",
      coverage:       "Coverage",
    },
  },
};

// ─── Colores ───────────────────────────────────────────────────────────────────
const C = {
  purple: [124, 58, 237],
  blue:   [14, 165, 233],
  green:  [16, 185, 129],
  amber:  [245, 158, 11],
  red:    [239, 68, 68],
  gray:   [148, 163, 184],
  dark:   [51, 65, 85],
  white:  [255, 255, 255],
  slate:  [241, 245, 249],
};

const XC = {
  purple:   "FF7C3AED",
  blue:     "FF0EA5E9",
  green:    "FF10B981",
  amber:    "FFF59E0B",
  red:      "FFEF4444",
  gray:     "FF94A3B8",
  dark:     "FF334155",
  white:    "FFFFFFFF",
  slate:    "FFF1F5F9",
  gold:     "FFFFF8E1",
  silver:   "FFF8FAFC",
  bronze:   "FFFFF7ED",
  purpleBg: "FFF5F0FF",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function precColor(v)  { return v >= 80 ? C.green  : v >= 60 ? C.amber  : C.red; }
function errColor(v)   { return v >= 60 ? C.red    : v >= 30 ? C.amber  : C.green; }
function precArgb(v)   { return v >= 80 ? XC.green : v >= 60 ? XC.amber : XC.red; }
function errArgb(v)    { return v >= 60 ? XC.red   : v >= 30 ? XC.amber : XC.green; }

function fmtDiff(t, diff) {
  return (diff && t.diff[diff]) ? t.diff[diff] : (diff || "—");
}

function fmtTime(s) {
  if (!s && s !== 0) return "—";
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return min > 0 ? `${min}m ${sec.toFixed(0)}s` : `${Number(s).toFixed(1)}s`;
}

function fmtDate(lang) {
  return new Date().toLocaleDateString(lang === "en" ? "en-US" : "es-ES", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function safeName(room) {
  return (room.name || "sala").replace(/[^a-zA-Z0-9_-]/g, "_");
}

// Mapa: nombre de categoría → precisión
function buildCatMap(room) {
  return Object.fromEntries((room.categories ?? []).map((c) => [c.name, c.precision]));
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF
// ═══════════════════════════════════════════════════════════════════════════════

export function exportPDF(room, lang = "es") {
  const t   = L[lang] ?? L.es;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw  = doc.internal.pageSize.getWidth();
  const date = fmtDate(lang);
  const catMap = buildCatMap(room);

  // ── Header ──────────────────────────────────────────────────────────────────
  const hasDesc = !!room.desc?.trim();
  const headerH = hasDesc ? 48 : 40;

  doc.setFillColor(...C.purple);
  doc.rect(0, 0, pw, headerH, "F");
  doc.setFillColor(...C.amber);
  doc.rect(0, headerH - 3, pw, 3, "F");

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(t.reportTitle, 15, 14);

  doc.setFontSize(13);
  doc.text(room.name, 15, 23);

  if (hasDesc) {
    const descTxt = room.desc.length > 100 ? room.desc.slice(0, 100) + "…" : room.desc;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(220, 210, 255);
    doc.text(descTxt, 15, 31);
  }

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(210, 195, 255);
  doc.text(`${t.roomId}: #${room.id}  ·  ${t.generatedOn} ${date}`, 15, hasDesc ? 40 : 34);

  let y = headerH + 12;

  // ── Métricas ────────────────────────────────────────────────────────────────
  const metrics = [
    { label: t.metrics.players,   value: String(room.totalPlayers),              col: C.purple },
    { label: t.metrics.sessions,  value: String(room.totalSessions),             col: C.blue   },
    { label: t.metrics.responses, value: String(room.totalResponses),            col: C.green  },
    { label: t.metrics.precision, value: `${room.avgPrecision}%`,               col: C.amber  },
    { label: t.metrics.maxScore,  value: room.maxScore.toLocaleString(),         col: C.red    },
  ];

  const gap   = 3;
  const cardW = (pw - 30 - gap * (metrics.length - 1)) / metrics.length;

  metrics.forEach(({ label, value, col }, i) => {
    const x = 15 + i * (cardW + gap);
    doc.setFillColor(252, 250, 255);
    doc.roundedRect(x, y, cardW, 24, 2, 2, "F");
    doc.setFillColor(...col);
    doc.roundedRect(x, y, 3.5, 24, 1, 1, "F");
    doc.setTextColor(...col);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(value, x + 6.5, y + 14);
    doc.setTextColor(...C.gray);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(label, x + 6.5, y + 21);
  });

  y += 34;

  // ── Helper: título de sección ────────────────────────────────────────────────
  const section = (title) => {
    if (y > 250) { doc.addPage(); y = 18; }
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(title, 15, y);
    doc.setDrawColor(...C.slate);
    doc.setLineWidth(0.5);
    doc.line(15, y + 2, pw - 15, y + 2);
    y += 9;
  };

  // ── Categorías ───────────────────────────────────────────────────────────────
  if (room.categories?.length) {
    section(t.sec.categories);

    autoTable(doc, {
      startY: y,
      head: [[t.col.category, t.col.precision, t.col.correct, t.col.total]],
      body: room.categories.map((c) => [
        c.name,
        `${c.precision}%`,
        String(c.correctAnswers),
        String(c.totalQuestions),
      ]),
      headStyles: {
        fillColor: C.purple, textColor: C.white,
        fontStyle: "bold", fontSize: 9, cellPadding: 3.5,
      },
      bodyStyles:         { fontSize: 9, textColor: C.dark, cellPadding: 3 },
      alternateRowStyles: { fillColor: C.slate },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 1) {
          const prec = room.categories[d.row.index]?.precision ?? 0;
          d.cell.styles.textColor = precColor(prec);
          d.cell.styles.fontStyle = "bold";
        }
      },
      columnStyles: {
        1: { halign: "center" },
        2: { halign: "center" },
        3: { halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    y = doc.lastAutoTable.finalY + 12;
  }

  // ── Jugadores ────────────────────────────────────────────────────────────────
  if (room.players?.length) {
    if (y > 210) { doc.addPage(); y = 18; }
    section(t.sec.players);

    const sorted = [...room.players].sort((a, b) => b.precision - a.precision);

    autoTable(doc, {
      startY: y,
      head: [[t.col.rank, t.col.player, t.col.sessions, t.col.responses,
              t.col.precision, t.col.avgPts, t.col.maxPts, t.col.avgTime]],
      body: sorted.map((p, i) => [
        i === 0 ? "1°" : i === 1 ? "2°" : i === 2 ? "3°" : String(i + 1),
        p.name,
        String(p.sessions),
        String(p.responses),
        `${p.precision}%`,
        String(p.avgScore),
        String(p.maxScore),
        fmtTime(p.avgTime),
      ]),
      headStyles: {
        fillColor: C.blue, textColor: C.white,
        fontStyle: "bold", fontSize: 8.5, cellPadding: 3,
      },
      bodyStyles:         { fontSize: 8.5, textColor: C.dark, cellPadding: 2.5 },
      alternateRowStyles: { fillColor: C.slate },
      didParseCell: (d) => {
        if (d.section !== "body") return;
        const p = sorted[d.row.index];
        if (!p) return;
        if (d.row.index === 0) d.cell.styles.fillColor = [255, 251, 235];
        if (d.row.index === 1) d.cell.styles.fillColor = [248, 250, 252];
        if (d.row.index === 2) d.cell.styles.fillColor = [255, 247, 237];
        if (d.column.index === 4) {
          d.cell.styles.textColor = precColor(p.precision);
          d.cell.styles.fontStyle = "bold";
        }
        if (d.column.index === 0 && d.row.index < 3) {
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.textColor =
            d.row.index === 0 ? [180, 120, 0] :
            d.row.index === 1 ? [100, 116, 139] : [120, 80, 40];
        }
      },
      columnStyles: {
        0: { cellWidth: 11, halign: "center" },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 14, halign: "center" },
        4: { cellWidth: 22, halign: "center" },
        5: { cellWidth: 20, halign: "center" },
        6: { cellWidth: 20, halign: "center" },
        7: { cellWidth: 20, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    y = doc.lastAutoTable.finalY + 12;
  }

  // ── Top 5 · Preguntas con Mayor Error (visual con barra) ─────────────────────
  if (room.questions?.length) {
    if (y > 185) { doc.addPage(); y = 18; }
    section(t.sec.top5);

    const top5    = [...room.questions].sort((a, b) => b.errorRate - a.errorRate).slice(0, 5);
    const cardH   = 20;
    const cardGap = 2;
    const margin  = 15;
    const cardW   = pw - margin * 2;
    const barW    = 58;
    const barX    = margin + cardW - barW - 2;

    if (y + top5.length * (cardH + cardGap) > 275) { doc.addPage(); y = 18; }

    top5.forEach((q, i) => {
      const cy = y + i * (cardH + cardGap);

      // Fondo de tarjeta
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, cy, cardW, cardH, 2, 2, "F");

      // Barra izquierda roja
      doc.setFillColor(...C.red);
      doc.roundedRect(margin, cy, 3.5, cardH, 1, 1, "F");

      // Círculo con número
      doc.setFillColor(...C.red);
      doc.circle(margin + 10.5, cy + 10, 5, "F");
      doc.setTextColor(...C.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(String(i + 1), margin + 10.5, cy + 11, { align: "center" });

      // Texto de la pregunta
      const textX  = margin + 20;
      const textW  = cardW - 20 - barW - 10;
      const qText  = q.text.length > 52 ? q.text.slice(0, 52) + "…" : q.text;
      doc.setTextColor(...C.dark);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(qText, textX, cy + 8);

      // Categoría + precisión de categoría
      const catPrecVal = catMap[q.category];
      const catLabel   = catPrecVal !== undefined
        ? `${q.category || "—"}  (${t.col.catPrec}: ${catPrecVal}%)`
        : (q.category || "—");
      doc.setTextColor(...C.gray);
      doc.setFontSize(7.5);
      doc.text(catLabel, textX, cy + 15);

      // ── Barra de error/éxito ────────────────────────────────────────────────
      const successRate = q.successRate ?? (100 - q.errorRate);
      const errW = Math.max(0, (q.errorRate / 100) * barW);
      const sucW = barW - errW;
      const bY   = cy + (cardH - 5) / 2;

      if (errW > 0) {
        doc.setFillColor(...C.red);
        doc.rect(barX, bY, errW, 5, "F");
      }
      if (sucW > 0) {
        doc.setFillColor(...C.green);
        doc.rect(barX + errW, bY, sucW, 5, "F");
      }
      // Borde sutil de la barra
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.roundedRect(barX, bY, barW, 5, 1, 1, "S");

      // Etiquetas encima de la barra
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...C.red);
      doc.text(`${q.errorRate}% ${t.errWord}`, barX, bY - 1.5);
      doc.setTextColor(...C.green);
      doc.text(`${successRate}% ${t.sucWord}`, barX + barW, bY - 1.5, { align: "right" });
    });

    y += top5.length * (cardH + cardGap) + 10;

    // ── Tabla completa: mayor tasa de ERROR ──────────────────────────────────
    if (y > 200) { doc.addPage(); y = 18; }
    section(t.sec.hardest);

    const byError = [...room.questions].sort((a, b) => b.errorRate - a.errorRate);

    autoTable(doc, {
      startY: y,
      head: [[t.col.rank, t.col.question, t.col.category, t.col.catPrec,
              t.col.difficulty, t.col.errorRate, t.col.incorrect, t.col.attempts]],
      body: byError.map((q, i) => [
        String(i + 1),
        q.text.length > 55 ? q.text.slice(0, 55) + "…" : q.text,
        q.category  || "—",
        catMap[q.category] !== undefined ? `${catMap[q.category]}%` : "—",
        fmtDiff(t, q.difficulty),
        `${q.errorRate}%`,
        String(q.incorrectAttempts),
        String(q.totalAttempts),
      ]),
      headStyles: {
        fillColor: C.red, textColor: C.white,
        fontStyle: "bold", fontSize: 8, cellPadding: 2.5,
      },
      bodyStyles:         { fontSize: 7.5, textColor: C.dark, cellPadding: 2 },
      alternateRowStyles: { fillColor: C.slate },
      didParseCell: (d) => {
        if (d.section !== "body") return;
        const q = byError[d.row.index];
        if (!q) return;
        if (d.column.index === 3) {
          const cp = catMap[q.category];
          if (cp !== undefined) {
            d.cell.styles.textColor = precColor(cp);
            d.cell.styles.fontStyle = "bold";
          }
        }
        if (d.column.index === 5) {
          d.cell.styles.textColor = errColor(q.errorRate);
          d.cell.styles.fontStyle = "bold";
        }
      },
      columnStyles: {
        0: { cellWidth: 8,  halign: "center" },
        1: { cellWidth: 58 },
        2: { cellWidth: 22 },
        3: { cellWidth: 17, halign: "center" },
        4: { cellWidth: 18 },
        5: { cellWidth: 17, halign: "center" },
        6: { cellWidth: 14, halign: "center" },
        7: { cellWidth: 14, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    y = doc.lastAutoTable.finalY + 12;

    // ── Tabla completa: mayor tasa de ÉXITO ──────────────────────────────────
    if (y > 200) { doc.addPage(); y = 18; }
    section(t.sec.easiest);

    const bySuccess = [...room.questions].sort((a, b) => a.errorRate - b.errorRate);

    autoTable(doc, {
      startY: y,
      head: [[t.col.rank, t.col.question, t.col.category, t.col.catPrec,
              t.col.difficulty, t.col.successRate, t.col.correct, t.col.attempts]],
      body: bySuccess.map((q, i) => {
        const sr = q.successRate   ?? (100 - q.errorRate);
        const cc = q.correctAnswers ?? (q.totalAttempts - q.incorrectAttempts);
        return [
          String(i + 1),
          q.text.length > 55 ? q.text.slice(0, 55) + "…" : q.text,
          q.category  || "—",
          catMap[q.category] !== undefined ? `${catMap[q.category]}%` : "—",
          fmtDiff(t, q.difficulty),
          `${sr}%`,
          String(cc),
          String(q.totalAttempts),
        ];
      }),
      headStyles: {
        fillColor: C.green, textColor: C.white,
        fontStyle: "bold", fontSize: 8, cellPadding: 2.5,
      },
      bodyStyles:         { fontSize: 7.5, textColor: C.dark, cellPadding: 2 },
      alternateRowStyles: { fillColor: C.slate },
      didParseCell: (d) => {
        if (d.section !== "body") return;
        const q = bySuccess[d.row.index];
        if (!q) return;
        if (d.column.index === 3) {
          const cp = catMap[q.category];
          if (cp !== undefined) {
            d.cell.styles.textColor = precColor(cp);
            d.cell.styles.fontStyle = "bold";
          }
        }
        if (d.column.index === 5) {
          const sr = q.successRate ?? (100 - q.errorRate);
          d.cell.styles.textColor = precColor(sr);
          d.cell.styles.fontStyle = "bold";
        }
      },
      columnStyles: {
        0: { cellWidth: 8,  halign: "center" },
        1: { cellWidth: 58 },
        2: { cellWidth: 22 },
        3: { cellWidth: 17, halign: "center" },
        4: { cellWidth: 18 },
        5: { cellWidth: 17, halign: "center" },
        6: { cellWidth: 14, halign: "center" },
        7: { cellWidth: 14, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFillColor(...C.slate);
    doc.rect(0, ph - 10, pw, 10, "F");
    doc.setTextColor(...C.gray);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(t.footer, 15, ph - 3.5);
    doc.text(`${t.page} ${i} ${t.of} ${total}`, pw - 15, ph - 3.5, { align: "right" });
  }

  doc.save(`reporte_${safeName(room)}_${room.id}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXCEL
// ═══════════════════════════════════════════════════════════════════════════════

export async function exportExcel(room, lang = "es") {
  const t    = L[lang] ?? L.es;
  const wb   = new ExcelJS.Workbook();
  wb.creator = "OsteoApp";
  wb.created = new Date();

  const date   = fmtDate(lang);
  const catMap = buildCatMap(room);

  // ── Helpers de estilo ────────────────────────────────────────────────────────
  const fill = (argb) => ({ type: "pattern", pattern: "solid", fgColor: { argb } });

  const thinBorder = () => ({
    top:    { style: "thin", color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
    left:   { style: "thin", color: { argb: "FFE2E8F0" } },
    right:  { style: "thin", color: { argb: "FFE2E8F0" } },
  });

  const hairBorder = () => ({
    bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
    right:  { style: "hair", color: { argb: "FFE2E8F0" } },
  });

  const styleHeader = (row, fillArgb) => {
    row.height = 24;
    row.eachCell((cell) => {
      cell.fill      = fill(fillArgb);
      cell.font      = { bold: true, color: { argb: XC.white }, size: 10 };
      cell.border    = thinBorder();
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
  };

  const styleRow = (row, isAlt = false, forceFill = null) => {
    row.height = 20;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill   = fill(forceFill ?? (isAlt ? XC.slate : XC.white));
      cell.border = hairBorder();
      cell.alignment = { vertical: "middle" };
    });
  };

  const sheetTitle = (ws, text, fillArgb, lastCol) => {
    ws.mergeCells(`A1:${lastCol}1`);
    const c = ws.getCell("A1");
    c.value     = text;
    c.font      = { bold: true, size: 13, color: { argb: XC.white } };
    c.fill      = fill(fillArgb);
    c.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws.getRow(1).height = 30;

    ws.mergeCells(`A2:${lastCol}2`);
    const sub = ws.getCell("A2");
    sub.value     = `${t.xls.roomLabel}: #${room.id}  ·  ${date}`;
    sub.font      = { size: 9, color: { argb: XC.gray } };
    sub.fill      = fill(XC.purpleBg);
    sub.alignment = { vertical: "middle", indent: 1 };
    ws.getRow(2).height = 16;

    if (room.desc?.trim()) {
      ws.mergeCells(`A3:${lastCol}3`);
      const dc = ws.getCell("A3");
      dc.value     = room.desc.trim();
      dc.font      = { size: 9, italic: true, color: { argb: XC.dark } };
      dc.fill      = fill("FFFAF5FF");
      dc.alignment = { vertical: "middle", indent: 1, wrapText: true };
      ws.getRow(3).height = 18;
    }

    ws.addRow([]); // espaciador
  };

  // ── Hoja 1: Resumen ──────────────────────────────────────────────────────────
  const wsRes = wb.addWorksheet(t.sheets.summary);
  wsRes.properties.defaultRowHeight = 20;
  sheetTitle(wsRes, `OsteoApp · ${t.reportTitle}: ${room.name}`, XC.purple, "E");

  const mHead = wsRes.addRow([t.xls.metric, t.xls.value, "", "", ""]);
  wsRes.mergeCells(`C${mHead.number}:E${mHead.number}`);
  styleHeader(mHead, XC.purple);

  const metricsRows = [
    [t.xls.uniquePlayers,  room.totalPlayers,       null],
    [t.xls.totalSessions,  room.totalSessions,       null],
    [t.xls.totalResponses, room.totalResponses,      null],
    [t.xls.globalPrec,     room.avgPrecision / 100,  "0%"],
    [t.xls.maxScore,       room.maxScore,            "0"],
  ];

  metricsRows.forEach(([label, val, fmt], i) => {
    const r = wsRes.addRow([label, val]);
    styleRow(r, i % 2 === 1);
    r.getCell(1).font = { size: 10, color: { argb: XC.dark } };
    const vc = r.getCell(2);
    vc.font = { bold: true, size: 11, color: { argb: XC.purple } };
    if (fmt) vc.numFmt = fmt;
    if (label === t.xls.globalPrec) vc.font.color = { argb: precArgb(room.avgPrecision) };
  });

  wsRes.addRow([]);

  // Categorías en Resumen
  if (room.categories?.length) {
    const cHead = wsRes.addRow([t.col.category, t.col.precision, t.col.correct, t.col.total, t.xls.coverage]);
    styleHeader(cHead, XC.purple);

    room.categories.forEach((c, i) => {
      const r = wsRes.addRow([
        c.name,
        c.precision / 100,
        c.correctAnswers,
        c.totalQuestions,
        room.totalResponses > 0 ? c.totalQuestions / room.totalResponses : 0,
      ]);
      styleRow(r, i % 2 === 1);
      const pc = r.getCell(2);
      pc.numFmt = "0%";
      pc.font   = { bold: true, color: { argb: precArgb(c.precision) } };
      r.getCell(3).numFmt = "0";
      r.getCell(4).numFmt = "0";
      r.getCell(5).numFmt = "0.0%";
    });
  }

  wsRes.getColumn(1).width = 26;
  wsRes.getColumn(2).width = 16;
  wsRes.getColumn(3).width = 18;
  wsRes.getColumn(4).width = 16;
  wsRes.getColumn(5).width = 14;

  // ── Hoja 2: Jugadores ────────────────────────────────────────────────────────
  const wsJug = wb.addWorksheet(t.sheets.players);
  wsJug.properties.defaultRowHeight = 20;
  sheetTitle(wsJug, `${t.sec.players} · ${room.name}`, XC.blue, "H");

  const jHead = wsJug.addRow([
    t.col.rank, t.col.player, t.col.sessions, t.col.responses,
    t.col.precision, t.col.avgPts, t.col.maxPts, t.col.avgTime,
  ]);
  styleHeader(jHead, XC.blue);

  const sorted = [...(room.players ?? [])].sort((a, b) => b.precision - a.precision);

  sorted.forEach((p, i) => {
    const topFill = i === 0 ? XC.gold : i === 1 ? XC.silver : i === 2 ? XC.bronze : null;
    const r = wsJug.addRow([i + 1, p.name, p.sessions, p.responses,
      p.precision / 100, p.avgScore, p.maxScore, fmtTime(p.avgTime)]);

    styleRow(r, i % 2 === 1, topFill);

    const rankC = r.getCell(1);
    rankC.alignment = { vertical: "middle", horizontal: "center" };
    if (i < 3) rankC.font = {
      bold: true,
      color: { argb: i === 0 ? "FFB45309" : i === 1 ? "FF64748B" : "FF92400E" },
    };

    const pc = r.getCell(5);
    pc.numFmt    = "0%";
    pc.font      = { bold: true, color: { argb: precArgb(p.precision) } };
    pc.alignment = { vertical: "middle", horizontal: "center" };

    r.getCell(6).numFmt = "0.0";
    r.getCell(7).numFmt = "0";
    r.getCell(8).alignment = { vertical: "middle", horizontal: "center" };
  });

  [6, 26, 12, 14, 13, 13, 13, 14].forEach((w, i) => { wsJug.getColumn(i + 1).width = w; });
  wsJug.autoFilter = { from: { row: jHead.number, column: 1 }, to: { row: jHead.number, column: 8 } };

  // ── Hoja 3: Preguntas difíciles (% Error) ────────────────────────────────────
  const wsErr = wb.addWorksheet(t.sheets.hardest);
  wsErr.properties.defaultRowHeight = 20;
  sheetTitle(wsErr, `${t.sec.hardest} · ${room.name}`, XC.red, "H");

  const eHead = wsErr.addRow([
    t.col.rank, t.col.question, t.col.category, t.col.catPrec,
    t.col.difficulty, t.col.errorRate, t.col.incorrect, t.col.attempts,
  ]);
  styleHeader(eHead, XC.red);

  const byError = [...(room.questions ?? [])].sort((a, b) => b.errorRate - a.errorRate);

  byError.forEach((q, i) => {
    const cp = catMap[q.category];
    const r  = wsErr.addRow([
      i + 1, q.text, q.category || "—",
      cp !== undefined ? cp / 100 : null,
      fmtDiff(t, q.difficulty),
      q.errorRate / 100, q.incorrectAttempts, q.totalAttempts,
    ]);
    styleRow(r, i % 2 === 1);

    r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(2).alignment = { vertical: "middle", wrapText: true };

    if (cp !== undefined) {
      const cpc = r.getCell(4);
      cpc.numFmt    = "0%";
      cpc.font      = { bold: true, color: { argb: precArgb(cp) } };
      cpc.alignment = { vertical: "middle", horizontal: "center" };
    }

    const ec = r.getCell(6);
    ec.numFmt    = "0%";
    ec.font      = { bold: true, color: { argb: errArgb(q.errorRate) } };
    ec.alignment = { vertical: "middle", horizontal: "center" };

    r.getCell(7).numFmt    = "0";
    r.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(8).numFmt    = "0";
    r.getCell(8).alignment = { vertical: "middle", horizontal: "center" };

    if (q.text.length > 80) r.height = 36;
  });

  [6, 52, 22, 14, 16, 13, 20, 16].forEach((w, i) => { wsErr.getColumn(i + 1).width = w; });
  wsErr.autoFilter = { from: { row: eHead.number, column: 1 }, to: { row: eHead.number, column: 8 } };

  // ── Hoja 4: Preguntas fáciles (% Éxito) ──────────────────────────────────────
  const wsSuc = wb.addWorksheet(t.sheets.easiest);
  wsSuc.properties.defaultRowHeight = 20;
  sheetTitle(wsSuc, `${t.sec.easiest} · ${room.name}`, XC.green, "H");

  const sHead = wsSuc.addRow([
    t.col.rank, t.col.question, t.col.category, t.col.catPrec,
    t.col.difficulty, t.col.successRate, t.col.correct, t.col.attempts,
  ]);
  styleHeader(sHead, XC.green);

  const bySuccess = [...(room.questions ?? [])].sort((a, b) => a.errorRate - b.errorRate);

  bySuccess.forEach((q, i) => {
    const sr = q.successRate   ?? (100 - q.errorRate);
    const cc = q.correctAnswers ?? (q.totalAttempts - q.incorrectAttempts);
    const cp = catMap[q.category];
    const r  = wsSuc.addRow([
      i + 1, q.text, q.category || "—",
      cp !== undefined ? cp / 100 : null,
      fmtDiff(t, q.difficulty),
      sr / 100, cc, q.totalAttempts,
    ]);
    styleRow(r, i % 2 === 1);

    r.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(2).alignment = { vertical: "middle", wrapText: true };

    if (cp !== undefined) {
      const cpc = r.getCell(4);
      cpc.numFmt    = "0%";
      cpc.font      = { bold: true, color: { argb: precArgb(cp) } };
      cpc.alignment = { vertical: "middle", horizontal: "center" };
    }

    const sc = r.getCell(6);
    sc.numFmt    = "0%";
    sc.font      = { bold: true, color: { argb: precArgb(sr) } };
    sc.alignment = { vertical: "middle", horizontal: "center" };

    r.getCell(7).numFmt    = "0";
    r.getCell(7).alignment = { vertical: "middle", horizontal: "center" };
    r.getCell(8).numFmt    = "0";
    r.getCell(8).alignment = { vertical: "middle", horizontal: "center" };

    if (q.text.length > 80) r.height = 36;
  });

  [6, 52, 22, 14, 16, 13, 18, 16].forEach((w, i) => { wsSuc.getColumn(i + 1).width = w; });
  wsSuc.autoFilter = { from: { row: sHead.number, column: 1 }, to: { row: sHead.number, column: 8 } };

  // ── Generar y descargar ──────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = `reporte_${safeName(room)}_${room.id}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
