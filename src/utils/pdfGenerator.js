import jsPDF from 'jspdf'
import { SECTIONS, CONDITION_COLORS } from '../constants'
import { CHECKLIST_CATEGORIES, getCategoryScore } from '../checklistConstants'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

const NAVY   = { r: 15,  g: 23,  b: 42  }
const BLUE   = { r: 37,  g: 99,  b: 235 }
const WHITE  = { r: 255, g: 255, b: 255 }
const LGRAY  = { r: 248, g: 250, b: 252 }
const BORDER = { r: 226, g: 232, b: 240 }
const DARK   = { r: 30,  g: 41,  b: 59  }
const MUTED  = { r: 100, g: 116, b: 139 }
const GREEN  = { r: 22,  g: 163, b: 74  }
const RED    = { r: 220, g: 38,  b: 38  }
const AMBER  = { r: 202, g: 138, b: 4   }

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 14
const CW     = PAGE_W - MARGIN * 2

function setFill(doc, c)  { doc.setFillColor(c.r, c.g, c.b) }
function setDraw(doc, c)  { doc.setDrawColor(c.r, c.g, c.b) }
function setColor(doc, c) { doc.setTextColor(c.r, c.g, c.b) }
function txt(doc, s, x, y, opts) { doc.text(String(s ?? ''), x, y, opts) }

function fillRect(doc, x, y, w, h, c) {
  setFill(doc, c); doc.rect(x, y, w, h, 'F')
}
function fillStrokeRect(doc, x, y, w, h, fill, stroke, lw = 0.3) {
  setFill(doc, fill); setDraw(doc, stroke); doc.setLineWidth(lw); doc.rect(x, y, w, h, 'FD')
}

function checkBreak(doc, y, needed) {
  if (y + needed > PAGE_H - 16) {
    doc.addPage()
    addBandHeader(doc)
    return 14
  }
  return y
}

function addBandHeader(doc) {
  fillRect(doc, 0, 0, PAGE_W, 8, NAVY)
  setColor(doc, MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  txt(doc, 'AryaInspectionService  ·  Vehicle Inspection Report', MARGIN, 5.5)
}

function addBandFooter(doc, pageNum, total) {
  fillRect(doc, 0, PAGE_H - 8, PAGE_W, 8, NAVY)
  setColor(doc, MUTED)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  txt(doc, '© AryaInspectionService — Confidential', MARGIN, PAGE_H - 3.5)
  txt(doc, `Page ${pageNum} of ${total}`, PAGE_W - MARGIN, PAGE_H - 3.5, { align: 'right' })
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generatePDF({ carDetails, sections, checklist, aiScore }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const reportId = `AIS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`
  const dateStr = carDetails.date
    ? new Date(carDetails.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // ══════════════════════════════════════════════════════════════════════
  // PAGE 1 — COVER
  // ══════════════════════════════════════════════════════════════════════

  fillRect(doc, 0, 0, PAGE_W, 42, NAVY)

  setFill(doc, BLUE)
  doc.roundedRect(MARGIN, 8, 22, 22, 3, 3, 'F')
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  txt(doc, 'AIS', MARGIN + 11, 22, { align: 'center' })

  doc.setFontSize(16)
  txt(doc, 'AryaInspectionService', MARGIN + 27, 17)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColor(doc, MUTED)
  txt(doc, 'Professional Vehicle Inspection Platform', MARGIN + 27, 24)
  txt(doc, reportId, PAGE_W - MARGIN, 15, { align: 'right' })
  txt(doc, dateStr, PAGE_W - MARGIN, 23, { align: 'right' })

  fillRect(doc, 0, 42, PAGE_W, 10, BLUE)
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  txt(doc, 'VEHICLE CONDITION INSPECTION REPORT', PAGE_W / 2, 49, { align: 'center' })

  let y = 58

  // ── Vehicle info + AI score ──────────────────────────────────────────
  const infoW = CW * 0.55
  const scoreW = CW * 0.42
  const scoreX = MARGIN + infoW + CW * 0.03

  fillStrokeRect(doc, MARGIN, y, infoW, 48, LGRAY, BORDER)
  setColor(doc, MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  txt(doc, 'VEHICLE', MARGIN + 4, y + 7)

  setColor(doc, DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(13)
  txt(doc, `${carDetails.year || ''} ${carDetails.make || ''} ${carDetails.model || ''}`.trim(), MARGIN + 4, y + 15)

  const infoRows = [
    ['VIN / CHASSIS', carDetails.vin || 'Not provided'],
    ['MILEAGE', carDetails.mileage ? `${Number(carDetails.mileage).toLocaleString()} km` : '—'],
    ['INSPECTOR', carDetails.inspectorName || '—'],
    ['INSPECTION DATE', dateStr],
  ]
  infoRows.forEach(([label, value], i) => {
    const ry = y + 22 + i * 6.5
    setColor(doc, MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
    txt(doc, label, MARGIN + 4, ry)
    setColor(doc, DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
    txt(doc, value, MARGIN + 4, ry + 4)
  })

  const scoreColor = aiScore > 85 ? GREEN : aiScore >= 70 ? AMBER : RED
  const scoreLabel = aiScore > 85 ? 'Excellent Condition' : aiScore >= 70 ? 'Good Condition' : 'Needs Attention'
  fillRect(doc, scoreX, y, scoreW, 48, scoreColor)
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  txt(doc, 'AI CONDITION SCORE', scoreX + scoreW / 2, y + 10, { align: 'center' })
  doc.setFontSize(36)
  txt(doc, String(aiScore ?? '--'), scoreX + scoreW / 2, y + 30, { align: 'center' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
  txt(doc, '/ 100', scoreX + scoreW / 2, y + 38, { align: 'center' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5)
  txt(doc, scoreLabel.toUpperCase(), scoreX + scoreW / 2, y + 45, { align: 'center' })

  y += 54

  // ── Photo sections summary table ──────────────────────────────────────
  setColor(doc, DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
  txt(doc, 'PHOTO INSPECTION SUMMARY', MARGIN, y); y += 5

  fillRect(doc, MARGIN, y, CW, 7, NAVY)
  setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  txt(doc, 'SECTION', MARGIN + 3, y + 5)
  txt(doc, 'CONDITION', MARGIN + CW * 0.5, y + 5)
  txt(doc, 'PHOTOS', MARGIN + CW * 0.75, y + 5)
  txt(doc, 'NOTES', MARGIN + CW * 0.87, y + 5)
  y += 7

  SECTIONS.forEach((section, i) => {
    const sData = sections[section.id]
    fillRect(doc, MARGIN, y, CW, 6.5, i % 2 === 0 ? WHITE : LGRAY)
    setColor(doc, DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
    txt(doc, section.name, MARGIN + 3, y + 4.5)
    const condRgb = hexToRgb(CONDITION_COLORS[sData.condition] || '#2563eb')
    setColor(doc, condRgb); doc.setFont('helvetica', 'bold')
    txt(doc, sData.condition, MARGIN + CW * 0.5, y + 4.5)
    setColor(doc, MUTED); doc.setFont('helvetica', 'normal')
    txt(doc, `${sData.photos.length}`, MARGIN + CW * 0.77, y + 4.5)
    const note = sData.notes ? sData.notes.substring(0, 25) + (sData.notes.length > 25 ? '…' : '') : '—'
    doc.setFontSize(6.5)
    txt(doc, note, MARGIN + CW * 0.87, y + 4.5)
    doc.setFontSize(7.5)
    setDraw(doc, BORDER); doc.setLineWidth(0.1)
    doc.line(MARGIN, y + 6.5, MARGIN + CW, y + 6.5)
    y += 6.5
  })

  y += 5

  // ── Checklist category scores table ──────────────────────────────────
  y = checkBreak(doc, y, 14 + CHECKLIST_CATEGORIES.length * 6.5)

  setColor(doc, DARK); doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
  txt(doc, 'CHECKLIST CATEGORY SCORES', MARGIN, y); y += 5

  fillRect(doc, MARGIN, y, CW, 7, NAVY)
  setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  txt(doc, 'CATEGORY', MARGIN + 3, y + 5)
  txt(doc, 'SCORE', MARGIN + CW * 0.6, y + 5)
  txt(doc, 'STATUS', MARGIN + CW * 0.78, y + 5)
  y += 7

  CHECKLIST_CATEGORIES.forEach((cat, i) => {
    const score = getCategoryScore(cat, checklist)
    const scoreRgb = score >= 85 ? GREEN : score >= 70 ? AMBER : RED
    fillRect(doc, MARGIN, y, CW, 6.5, i % 2 === 0 ? WHITE : LGRAY)
    setColor(doc, DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
    txt(doc, cat.name, MARGIN + 3, y + 4.5)
    setColor(doc, scoreRgb); doc.setFont('helvetica', 'bold')
    txt(doc, `${score}%`, MARGIN + CW * 0.6, y + 4.5)
    setColor(doc, scoreRgb)
    const status = score >= 85 ? 'Pass' : score >= 70 ? 'Caution' : 'Fail'
    txt(doc, status, MARGIN + CW * 0.78, y + 4.5)
    setDraw(doc, BORDER); doc.setLineWidth(0.1)
    doc.line(MARGIN, y + 6.5, MARGIN + CW, y + 6.5)
    y += 6.5
  })

  // ══════════════════════════════════════════════════════════════════════
  // PHOTO SECTION PAGES
  // ══════════════════════════════════════════════════════════════════════

  for (const section of SECTIONS) {
    const sData = sections[section.id]
    if (!sData.photos?.length) continue

    doc.addPage()
    addBandHeader(doc)
    y = 14

    // Section heading
    fillRect(doc, MARGIN, y, CW, 11, NAVY)
    setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    txt(doc, section.name.toUpperCase(), MARGIN + 4, y + 7.5)
    const condRgb = hexToRgb(CONDITION_COLORS[sData.condition] || '#2563eb')
    const badgeW = 28
    setFill(doc, condRgb)
    doc.roundedRect(MARGIN + CW - badgeW - 3, y + 2, badgeW, 7, 2, 2, 'F')
    setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
    txt(doc, sData.condition.toUpperCase(), MARGIN + CW - badgeW / 2 - 3, y + 7, { align: 'center' })
    y += 15

    // Photos 2-col
    const photoW = (CW - 6) / 2
    const photoH = photoW * (3 / 4)
    let col = 0

    for (let idx = 0; idx < sData.photos.length; idx++) {
      y = checkBreak(doc, y, photoH + 14)
      const x = MARGIN + col * (photoW + 6)
      fillStrokeRect(doc, x, y, photoW, photoH, LGRAY, BORDER)
      try {
        const fmt = sData.photos[idx].startsWith('data:image/png') ? 'PNG' : 'JPEG'
        doc.addImage(sData.photos[idx], fmt, x, y, photoW, photoH)
      } catch {
        setColor(doc, MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
        txt(doc, 'Photo unavailable', x + photoW / 2, y + photoH / 2, { align: 'center' })
      }
      setColor(doc, MUTED); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5)
      txt(doc, `Photo ${idx + 1} — ${section.name}`, x + photoW / 2, y + photoH + 4, { align: 'center' })
      col++
      if (col === 2) { col = 0; y += photoH + 10 }
    }
    if (col !== 0) y += photoH + 10
    y += 2

    // Condition + Notes block
    y = checkBreak(doc, y, 24)
    fillStrokeRect(doc, MARGIN, y, CW, 22, LGRAY, BORDER)
    setColor(doc, MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
    txt(doc, 'CONDITION RATING', MARGIN + 4, y + 6)
    setColor(doc, hexToRgb(CONDITION_COLORS[sData.condition] || '#2563eb'))
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
    txt(doc, sData.condition, MARGIN + 4, y + 14)
    if (sData.notes) {
      setColor(doc, MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
      txt(doc, 'INSPECTOR NOTES', MARGIN + CW * 0.35, y + 6)
      setColor(doc, DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
      const noteLines = doc.splitTextToSize(sData.notes, CW * 0.62)
      doc.text(noteLines.slice(0, 2), MARGIN + CW * 0.35, y + 13)
    }
    y += 28
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHECKLIST DETAIL PAGES (one page per category)
  // ══════════════════════════════════════════════════════════════════════

  for (const cat of CHECKLIST_CATEGORIES) {
    const catData = checklist?.[cat.id] ?? {}
    const score = getCategoryScore(cat, checklist)
    const scoreRgb = score >= 85 ? GREEN : score >= 70 ? AMBER : RED

    doc.addPage()
    addBandHeader(doc)
    y = 14

    // Category header
    fillRect(doc, MARGIN, y, CW, 13, NAVY)
    setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    txt(doc, cat.name.toUpperCase(), MARGIN + 4, y + 9)

    // Score badge
    const sBadgeW = 32
    setFill(doc, scoreRgb)
    doc.roundedRect(MARGIN + CW - sBadgeW - 3, y + 3, sBadgeW, 7, 2, 2, 'F')
    setColor(doc, WHITE); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
    txt(doc, `${score}%`, MARGIN + CW - sBadgeW / 2 - 3, y + 8, { align: 'center' })
    y += 17

    for (const sub of cat.subsections) {
      // Subsection label
      y = checkBreak(doc, y, 12)
      fillRect(doc, MARGIN, y, CW, 7, { r: 241, g: 245, b: 249 })
      setColor(doc, MUTED); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
      txt(doc, sub.name.toUpperCase(), MARGIN + 3, y + 5)
      setDraw(doc, BORDER); doc.setLineWidth(0.2)
      doc.line(MARGIN, y + 7, MARGIN + CW, y + 7)
      y += 9

      // Items table: 2 columns per row
      const COL = 2
      const colW = (CW - 4) / COL
      let col2 = 0

      for (let idx = 0; idx < sub.items.length; idx++) {
        const item = sub.items[idx]
        const val = item.type === 'text'
          ? (catData[item.id] ?? '')
          : (catData[item.id] ?? item.options?.[0] ?? '')
        const isWarn = item.warnOptions?.includes(val)
        const valColor = isWarn ? RED : (item.warnOptions ? GREEN : DARK)

        if (col2 === 0) {
          y = checkBreak(doc, y, 7)
          fillRect(doc, MARGIN, y, CW, 7, Math.floor(idx / COL) % 2 === 0 ? WHITE : LGRAY)
        }

        const x = MARGIN + col2 * (colW + 4)

        setColor(doc, DARK); doc.setFont('helvetica', 'normal'); doc.setFontSize(7)
        const labelStr = doc.splitTextToSize(item.label, colW * 0.58)[0]
        txt(doc, labelStr, x + 2, y + 4.5)

        setColor(doc, valColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
        const valStr = doc.splitTextToSize(val || '—', colW * 0.4)[0]
        txt(doc, valStr, x + colW - 2, y + 4.5, { align: 'right' })

        col2++
        if (col2 === COL) {
          setDraw(doc, BORDER); doc.setLineWidth(0.1)
          doc.line(MARGIN, y + 7, MARGIN + CW, y + 7)
          col2 = 0
          y += 7
        }
      }

      // Flush last partial row
      if (col2 !== 0) {
        setDraw(doc, BORDER); doc.setLineWidth(0.1)
        doc.line(MARGIN, y + 7, MARGIN + CW, y + 7)
        y += 7
      }
      y += 3
    }
  }

  // ── Footers on all pages ───────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    addBandFooter(doc, i, total)
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const make  = (carDetails.make  || 'Vehicle').replace(/\s+/g, '')
  const model = (carDetails.model || 'Report').replace(/\s+/g, '')
  const yr    = carDetails.year || new Date().getFullYear()
  doc.save(`AIS_${make}_${model}_${yr}_${reportId}.pdf`)
}
