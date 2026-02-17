import jsPDF from 'jspdf'
import { SECTIONS, CONDITION_COLORS } from '../constants'
import { CHECKLIST_CATEGORIES, getCategoryScore } from '../checklistConstants'

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:    [15,  23,  42],
  navyMid: [30,  55,  90],
  blue:    [37,  99,  235],
  blueLt:  [219, 234, 254],
  white:   [255, 255, 255],
  offWhite:[250, 251, 253],
  gray50:  [248, 250, 252],
  gray100: [241, 245, 249],
  gray200: [226, 232, 240],
  gray400: [148, 163, 184],
  gray600: [100, 116, 139],
  gray800: [30,  41,  59],
  green:   [22,  163, 74],
  greenLt: [220, 252, 231],
  amber:   [180, 110, 0],
  amberLt: [254, 243, 199],
  red:     [185, 28,  28],
  redLt:   [254, 226, 226],
}

// Condition → colour
const COND_COLOR = {
  Excellent: C.green, Good: C.blue, Fair: C.amber, Poor: C.red,
}
const COND_BG = {
  Excellent: C.greenLt, Good: C.blueLt, Fair: C.amberLt, Poor: C.redLt,
}

// ─── jsPDF primitives ─────────────────────────────────────────────────────────
const f = (doc, c) => doc.setFillColor(...c)
const s = (doc, c) => doc.setDrawColor(...c)
const t = (doc, c) => doc.setTextColor(...c)

function rect(doc, x, y, w, h, c, mode = 'F') {
  f(doc, c); doc.rect(x, y, w, h, mode)
}

function rRect(doc, x, y, w, h, r, c, mode = 'F') {
  f(doc, c); doc.roundedRect(x, y, w, h, r, r, mode)
}

function line(doc, x1, y1, x2, y2, c, lw = 0.2) {
  s(doc, c); doc.setLineWidth(lw); doc.line(x1, y1, x2, y2)
}

function txt(doc, str, x, y, opts) {
  doc.text(String(str ?? '—'), x, y, opts ?? {})
}

// ─── Page constants ───────────────────────────────────────────────────────────
const PW = 210, PH = 297, M = 13, CW = PW - M * 2

// ─── Score helpers ────────────────────────────────────────────────────────────
function scoreColor(n) { return n > 85 ? C.green : n >= 70 ? C.amber : C.red }
function scoreColorLt(n) { return n > 85 ? C.greenLt : n >= 70 ? C.amberLt : C.redLt }
function scoreLabel(n)  { return n > 85 ? 'Excellent' : n >= 70 ? 'Good' : 'Needs Attention' }
function condScore(s) { return { Excellent:100,Good:85,Fair:65,Poor:40 }[s] ?? 85 }

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? [parseInt(r[1],16), parseInt(r[2],16), parseInt(r[3],16)] : C.gray800
}

// ─── Page chrome ──────────────────────────────────────────────────────────────
function pageHeader(doc, right = '') {
  rect(doc, 0, 0, PW, 7, C.navy)
  line(doc, 0, 7, PW, 7, C.blue, 0.5)
  t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(6)
  txt(doc, 'AryaInspectionService  ·  Professional Vehicle Inspection Report', M, 5)
  txt(doc, right, PW - M, 5, { align:'right' })
}

function pageFooter(doc, n, total, date) {
  rect(doc, 0, PH - 9, PW, 9, C.navy)
  line(doc, 0, PH - 9, PW, PH - 9, C.blue, 0.5)
  t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(6)
  txt(doc, `© ${new Date().getFullYear()} AryaInspectionService. All rights reserved.`, M, PH - 4)
  txt(doc, `Page ${n} of ${total}  ·  ${date}`, PW - M, PH - 4, { align:'right' })
}

function checkBreak(doc, y, need, sectionLabel = '') {
  if (y + need > PH - 14) {
    doc.addPage()
    pageHeader(doc, sectionLabel)
    return 12
  }
  return y
}

// ─── Drawing components ───────────────────────────────────────────────────────

/** Thick left-accent heading (used for section pages & checklist categories) */
function sectionHeading(doc, x, y, w, h, label, badgeText, badgeColor) {
  rect(doc, x, y, w, h, C.gray100)
  rect(doc, x, y, 3, h, C.blue)        // left accent stripe
  t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(9.5)
  txt(doc, label.toUpperCase(), x + 7, y + h / 2 + 3.2)
  if (badgeText) {
    const bw = 26, bx = x + w - bw - 2
    rRect(doc, bx, y + (h-6)/2, bw, 6, 2, badgeColor ?? C.blue)
    t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
    txt(doc, badgeText.toUpperCase(), bx + bw/2, y + h/2 + 2, { align:'center' })
  }
  line(doc, x, y + h, x + w, y + h, C.gray200)
}

/** Subsection strip */
function subHeading(doc, x, y, w, label) {
  rect(doc, x, y, w, 6, C.gray100)
  rect(doc, x, y, 2, 6, C.gray400)
  t(doc, C.gray600); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
  txt(doc, label.toUpperCase(), x + 5, y + 4.3)
  line(doc, x, y + 6, x + w, y + 6, C.gray200, 0.15)
  return y + 7
}

/** Status dot */
function dot(doc, x, y, color) {
  f(doc, color); doc.circle(x, y, 1.3, 'F')
}

/** Horizontal score gauge */
function scoreGauge(doc, x, y, w, h, pct, color) {
  rRect(doc, x, y, w, h, h/2, C.gray200)
  if (pct > 0) rRect(doc, x, y, w * (pct / 100), h, h/2, color)
}

// ─── TABLE HELPERS ────────────────────────────────────────────────────────────
function tableHeader(doc, x, y, cols) {
  rect(doc, x, y, CW, 6.5, C.navy)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
  cols.forEach(([label, cx, align]) =>
    txt(doc, label.toUpperCase(), cx, y + 4.5, { align: align ?? 'left' })
  )
  return y + 6.5
}

function tableRow(doc, x, y, h, i, cells) {
  rect(doc, x, y, CW, h, i % 2 === 0 ? C.white : C.gray50)
  cells.forEach(([str, cx, color, bold, align]) => {
    t(doc, color ?? C.gray800)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(7.5)
    txt(doc, str, cx, y + h / 2 + 2.6, { align: align ?? 'left' })
  })
  line(doc, x, y + h, x + CW, y + h, C.gray200, 0.1)
  return y + h
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export async function generatePDF({ carDetails, sections, checklist, aiScore }) {
  const doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' })

  const reportId = `AIS-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*9000+1000)}`
  const dateStr  = carDetails.date
    ? new Date(carDetails.date + 'T00:00:00').toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })
    : new Date().toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })

  const ai = aiScore ?? 0

  // ══════════════════════════════════════════════════════════════════════
  // ░░  PAGE 1 — COVER  ░░
  // ══════════════════════════════════════════════════════════════════════

  // ── Hero header ──────────────────────────────────────────────────────
  rect(doc, 0, 0, PW, 52, C.navy)

  // Left accent stripe
  rect(doc, 0, 0, 5, 52, C.blue)

  // Logo badge
  rRect(doc, M + 2, 10, 28, 28, 4, C.blue)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(14)
  txt(doc, 'AIS', M + 2 + 14, 27, { align:'center' })

  // Company name block
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(17)
  txt(doc, 'AryaInspectionService', M + 36, 21)
  doc.setFont('helvetica','normal'); doc.setFontSize(8)
  t(doc, C.gray400)
  txt(doc, 'Professional Vehicle Inspection Platform', M + 36, 29)

  // Right info block
  t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(7)
  txt(doc, 'REPORT ID', PW - M, 14, { align:'right' })
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(8)
  txt(doc, reportId, PW - M, 20, { align:'right' })
  t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(7)
  txt(doc, 'INSPECTION DATE', PW - M, 30, { align:'right' })
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(8)
  txt(doc, dateStr, PW - M, 36, { align:'right' })

  // Thin blue separator
  line(doc, 0, 52, PW, 52, C.blue, 1)

  // Title band
  rect(doc, 0, 52, PW, 9, C.blue)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(8.5)
  txt(doc, 'VEHICLE CONDITION INSPECTION REPORT', PW / 2, 58.5, { align:'center' })

  let y = 66

  // ── Vehicle info + AI Score ───────────────────────────────────────────
  const IW = CW * 0.56, SW = CW - IW - 4, SX = M + IW + 4

  // Vehicle info card
  rect(doc, M, y, IW, 54, C.gray50)
  rect(doc, M, y, IW, 54, C.gray200, 'S'); doc.setLineWidth(0.2)
  rect(doc, M, y, 3, 54, C.blue)  // accent

  t(doc, C.gray400); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
  txt(doc, 'VEHICLE', M + 7, y + 8)
  t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(14)
  const vName = `${carDetails.year || ''} ${carDetails.make || ''} ${carDetails.model || ''}`.trim()
  txt(doc, vName, M + 7, y + 18)

  const fields = [
    ['VIN / CHASSIS', carDetails.vin || 'Not provided'],
    ['MILEAGE',       carDetails.mileage ? `${Number(carDetails.mileage).toLocaleString()} km` : '—'],
    ['INSPECTOR',     carDetails.inspectorName || '—'],
    ['DATE',          dateStr],
  ]
  fields.forEach(([k, v], i) => {
    const ry = y + 26 + i * 7.2
    t(doc, C.gray400); doc.setFont('helvetica','bold'); doc.setFontSize(6)
    txt(doc, k, M + 7, ry)
    t(doc, C.gray800); doc.setFont('helvetica','normal'); doc.setFontSize(8)
    txt(doc, v, M + 7, ry + 4.5)
  })

  // Score card
  const sc = scoreColor(ai)
  rect(doc, SX, y, SW, 54, sc)

  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(7)
  txt(doc, 'AI CONDITION SCORE', SX + SW/2, y + 9, { align:'center' })

  // Big score number
  doc.setFontSize(40); doc.setFont('helvetica','bold')
  txt(doc, String(ai), SX + SW/2, y + 30, { align:'center' })
  doc.setFontSize(11); doc.setFont('helvetica','normal')
  txt(doc, '/ 100', SX + SW/2, y + 38, { align:'center' })

  // Gauge bar (inside score card)
  scoreGauge(doc, SX + 6, y + 41, SW - 12, 4, ai, C.white)

  // Status label
  doc.setFont('helvetica','bold'); doc.setFontSize(7)
  txt(doc, scoreLabel(ai).toUpperCase(), SX + SW/2, y + 50, { align:'center' })

  y += 60

  // ── Two-column summary tables (side by side) ──────────────────────────
  const TW = (CW - 4) / 2  // each table width
  const T2X = M + TW + 4   // right table x

  // Left: Photo section summary
  t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(8)
  txt(doc, 'PHOTO SECTIONS', M, y - 1)
  line(doc, M, y, M + TW, y, C.blue, 0.5); y += 3

  // header row
  rect(doc, M, y, TW, 6, C.navy)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(6)
  txt(doc, 'SECTION', M + 3, y + 4.3)
  txt(doc, 'CONDITION', M + TW * 0.56, y + 4.3)
  txt(doc, 'PCS', M + TW - 6, y + 4.3, { align:'right' })
  y += 6

  SECTIONS.forEach((sec, i) => {
    const sd = sections[sec.id]
    const cc = COND_COLOR[sd.condition] ?? C.blue
    const rowH = 6.8
    rect(doc, M, y, TW, rowH, i % 2 === 0 ? C.white : C.gray50)
    t(doc, C.gray800); doc.setFont('helvetica','normal'); doc.setFontSize(7)
    txt(doc, sec.name, M + 3, y + 4.5)
    dot(doc, M + TW * 0.53, y + rowH/2, cc)
    t(doc, cc); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
    txt(doc, sd.condition, M + TW * 0.56, y + 4.5)
    t(doc, C.gray600); doc.setFont('helvetica','normal'); doc.setFontSize(7)
    txt(doc, `${sd.photos.length}`, M + TW - 4, y + 4.5, { align:'right' })
    line(doc, M, y + rowH, M + TW, y + rowH, C.gray200, 0.1)
    y += rowH
  })

  // Right: Checklist scores (reset y to same start position)
  const rightStartY = y - SECTIONS.length * 6.8 - 9

  t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(8)
  txt(doc, 'CHECKLIST SCORES', T2X, rightStartY - 1)
  line(doc, T2X, rightStartY, T2X + TW, rightStartY, C.blue, 0.5)
  let ry = rightStartY + 3

  rect(doc, T2X, ry, TW, 6, C.navy)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(6)
  txt(doc, 'CATEGORY', T2X + 3, ry + 4.3)
  txt(doc, 'SCORE', T2X + TW * 0.7, ry + 4.3)
  txt(doc, 'STATUS', T2X + TW - 3, ry + 4.3, { align:'right' })
  ry += 6

  CHECKLIST_CATEGORIES.forEach((cat, i) => {
    const sc2 = getCategoryScore(cat, checklist)
    const cc  = scoreColor(sc2)
    const rowH = 6.8
    rect(doc, T2X, ry, TW, rowH, i % 2 === 0 ? C.white : C.gray50)
    t(doc, C.gray800); doc.setFont('helvetica','normal'); doc.setFontSize(6.5)
    const catLabel = cat.name.length > 18 ? cat.name.substring(0, 16) + '…' : cat.name
    txt(doc, catLabel, T2X + 3, ry + 4.5)
    // mini gauge
    scoreGauge(doc, T2X + TW * 0.55, ry + 2.2, TW * 0.22, 2.5, sc2, cc)
    t(doc, cc); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
    txt(doc, `${sc2}%`, T2X + TW * 0.78, ry + 4.5)
    const statusText = sc2 >= 85 ? '✓' : sc2 >= 70 ? '!' : '✗'
    txt(doc, statusText, T2X + TW - 3, ry + 4.5, { align:'right' })
    line(doc, T2X, ry + rowH, T2X + TW, ry + rowH, C.gray200, 0.1)
    ry += rowH
  })

  // ── Overall bottom divider / key facts strip ──────────────────────────
  const bottomY = Math.max(y, ry) + 4

  if (bottomY < PH - 50) {
    rect(doc, M, bottomY, CW, 20, C.gray50)
    s(doc, C.gray200); doc.setLineWidth(0.3); doc.rect(M, bottomY, CW, 20, 'S')
    rect(doc, M, bottomY, 3, 20, C.blue)

    const totalPhotos = SECTIONS.reduce((a, sec) => a + sections[sec.id].photos.length, 0)
    const avgCl = Math.round(CHECKLIST_CATEGORIES.reduce((a, c) => a + getCategoryScore(c, checklist), 0) / CHECKLIST_CATEGORIES.length)
    const stats = [
      ['TOTAL PHOTOS', String(totalPhotos)],
      ['SECTIONS INSPECTED', `${SECTIONS.length} / ${SECTIONS.length}`],
      ['CHECKLIST SCORE', `${avgCl}%`],
      ['AI SCORE', `${ai} / 100`],
    ]
    const statW = CW / stats.length
    stats.forEach(([k, v], i) => {
      const sx = M + 3 + i * statW
      t(doc, C.gray400); doc.setFont('helvetica','bold'); doc.setFontSize(6)
      txt(doc, k, sx, bottomY + 7)
      t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(11)
      txt(doc, v, sx, bottomY + 16)
    })
  }

  // ══════════════════════════════════════════════════════════════════════
  // ░░  PHOTO SECTION PAGES  ░░  3-column, tight grid
  // ══════════════════════════════════════════════════════════════════════

  const COL3 = 3
  const GAP  = 3
  const PW3  = (CW - GAP * (COL3 - 1)) / COL3   // ≈ 58.7mm per photo
  const PH3  = PW3 * (3 / 4)                      // 4:3 ratio ≈ 44mm

  for (const section of SECTIONS) {
    const sd = sections[section.id]
    if (!sd.photos?.length) continue

    doc.addPage()
    pageHeader(doc, section.name)
    y = 12

    // Section heading bar
    sectionHeading(doc, M, y, CW, 12,
      section.name,
      sd.condition,
      COND_COLOR[sd.condition] ?? C.blue
    )
    y += 16

    // Photos grid — 3 columns
    let col = 0
    for (let idx = 0; idx < sd.photos.length; idx++) {
      if (col === 0) y = checkBreak(doc, y, PH3 + 14, section.name)
      const px = M + col * (PW3 + GAP)

      // Photo frame
      rect(doc, px, y, PW3, PH3, C.gray100)
      s(doc, C.gray200); doc.setLineWidth(0.2); doc.rect(px, y, PW3, PH3, 'S')

      try {
        const fmt = sd.photos[idx].startsWith('data:image/png') ? 'PNG' : 'JPEG'
        doc.addImage(sd.photos[idx], fmt, px, y, PW3, PH3)
      } catch {
        t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(7)
        txt(doc, 'Photo unavailable', px + PW3/2, y + PH3/2, { align:'center' })
      }

      // Caption strip below photo
      rect(doc, px, y + PH3, PW3, 5.5, C.gray800)
      t(doc, C.gray400); doc.setFont('helvetica','normal'); doc.setFontSize(5.5)
      txt(doc, `Photo ${idx + 1}  ·  ${section.name}`, px + 2, y + PH3 + 3.7)

      col++
      if (col === COL3) {
        col = 0
        y += PH3 + 5.5 + 4
      }
    }
    if (col !== 0) y += PH3 + 5.5 + 4
    y += 3

    // ── Condition + Notes strip ───────────────────────────────────────
    y = checkBreak(doc, y, 22, section.name)
    const cc = COND_COLOR[sd.condition] ?? C.blue
    const bg = COND_BG[sd.condition]   ?? C.blueLt

    rect(doc, M, y, CW, 20, bg)
    s(doc, cc); doc.setLineWidth(0.4); doc.rect(M, y, CW, 20, 'S')
    rect(doc, M, y, 4, 20, cc)

    // Condition
    t(doc, C.gray400); doc.setFont('helvetica','bold'); doc.setFontSize(6)
    txt(doc, 'CONDITION RATING', M + 8, y + 7)
    t(doc, cc); doc.setFont('helvetica','bold'); doc.setFontSize(13)
    txt(doc, sd.condition, M + 8, y + 16)

    // Notes
    const noteX = M + CW * 0.35
    t(doc, C.gray400); doc.setFont('helvetica','bold'); doc.setFontSize(6)
    txt(doc, 'INSPECTOR NOTES', noteX, y + 7)
    if (sd.notes) {
      t(doc, C.gray800); doc.setFont('helvetica','normal'); doc.setFontSize(7.5)
      const noteLines = doc.splitTextToSize(sd.notes, CW * 0.62)
      doc.text(noteLines.slice(0, 2), noteX, y + 13.5)
    } else {
      t(doc, C.gray400); doc.setFont('helvetica','italic'); doc.setFontSize(7)
      txt(doc, 'No notes recorded', noteX, y + 14)
    }
    y += 26
  }

  // ══════════════════════════════════════════════════════════════════════
  // ░░  CHECKLIST PAGES — continuous flow  ░░
  // ══════════════════════════════════════════════════════════════════════

  doc.addPage()
  pageHeader(doc, 'Inspection Checklist')
  y = 12

  // Page title
  rect(doc, M, y, CW, 9, C.navy)
  rect(doc, M, y, 3, 9, C.blue)
  t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(9)
  txt(doc, 'DETAILED INSPECTION CHECKLIST', M + 7, y + 6.5)
  y += 13

  for (const cat of CHECKLIST_CATEGORIES) {
    const catData = checklist?.[cat.id] ?? {}
    const catScore = getCategoryScore(cat, checklist)
    const catColor = scoreColor(catScore)

    // Category heading
    y = checkBreak(doc, y, 16, 'Inspection Checklist')
    rect(doc, M, y, CW, 11, C.gray100)
    rect(doc, M, y, 4, 11, catColor)
    t(doc, C.navy); doc.setFont('helvetica','bold'); doc.setFontSize(9)
    txt(doc, `${cat.name}`, M + 8, y + 7.5)
    // Score badge
    rRect(doc, M + CW - 30, y + 2, 28, 7, 2, catColor)
    t(doc, C.white); doc.setFont('helvetica','bold'); doc.setFontSize(7)
    txt(doc, `${catScore}%  ${catScore >= 85 ? 'PASS' : catScore >= 70 ? 'CAUTION' : 'FAIL'}`, M + CW - 16, y + 7, { align:'center' })
    y += 13

    for (const sub of cat.subsections) {
      y = checkBreak(doc, y, 10, cat.name)
      y = subHeading(doc, M, y, CW, sub.name)

      // Items: 2 columns per row
      const ICOLS = 2
      const IW2   = (CW - 2) / ICOLS
      let col2 = 0

      for (let idx = 0; idx < sub.items.length; idx++) {
        const item = sub.items[idx]
        const val  = item.type === 'text'
          ? (catData[item.id] ?? '')
          : (catData[item.id] ?? item.options?.[0] ?? '')
        const isWarn = item.warnOptions?.includes(val)
        const valC   = isWarn ? C.red : (item.warnOptions ? C.green : C.gray800)

        if (col2 === 0) {
          y = checkBreak(doc, y, 6.2, cat.name)
          rect(doc, M, y, CW, 6.2, Math.floor(idx / ICOLS) % 2 === 0 ? C.white : C.gray50)
          line(doc, M, y + 6.2, M + CW, y + 6.2, C.gray200, 0.1)
        }

        const ix = M + col2 * (IW2 + 2)

        // Status dot
        dot(doc, ix + 3, y + 3.1, valC)
        // Label
        t(doc, C.gray800); doc.setFont('helvetica','normal'); doc.setFontSize(6.5)
        const lbl = doc.splitTextToSize(item.label, IW2 * 0.54)[0]
        txt(doc, lbl, ix + 7, y + 4.2)
        // Value
        t(doc, valC); doc.setFont('helvetica','bold'); doc.setFontSize(6.5)
        const v = doc.splitTextToSize(val || '—', IW2 * 0.44)[0]
        txt(doc, v, ix + IW2 - 2, y + 4.2, { align:'right' })

        // Vertical separator between cols
        if (col2 === 0) {
          line(doc, M + IW2 + 1, y, M + IW2 + 1, y + 6.2, C.gray200, 0.15)
        }

        col2++
        if (col2 === ICOLS) { col2 = 0; y += 6.2 }
      }
      if (col2 !== 0) { y += 6.2 }
      y += 2
    }
    y += 3
  }

  // ── Add footers ────────────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    pageFooter(doc, i, total, dateStr)
  }

  // ── Save ───────────────────────────────────────────────────────────────
  const make  = (carDetails.make  || 'Vehicle').replace(/\s+/g, '')
  const model = (carDetails.model || 'Report').replace(/\s+/g, '')
  const yr    = carDetails.year || new Date().getFullYear()
  doc.save(`AIS_${make}_${model}_${yr}_${reportId}.pdf`)
}
