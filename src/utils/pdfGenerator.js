import jsPDF from 'jspdf'
import { SECTIONS, CONDITION_COLORS } from '../constants'

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

const PAGE_W  = 210
const PAGE_H  = 297
const MARGIN  = 14
const CW      = PAGE_W - MARGIN * 2   // content width = 182

// ─── Drawing primitives ───────────────────────────────────────────────────────

function setFill(doc, c)  { doc.setFillColor(c.r, c.g, c.b) }
function setDraw(doc, c)  { doc.setDrawColor(c.r, c.g, c.b) }
function setColor(doc, c) { doc.setTextColor(c.r, c.g, c.b) }

function fillRect(doc, x, y, w, h, c) {
  setFill(doc, c)
  doc.rect(x, y, w, h, 'F')
}

function strokeRect(doc, x, y, w, h, c, lw = 0.3) {
  setDraw(doc, c)
  doc.setLineWidth(lw)
  doc.rect(x, y, w, h, 'S')
}

function fillStrokeRect(doc, x, y, w, h, fill, stroke, lw = 0.3) {
  setFill(doc, fill)
  setDraw(doc, stroke)
  doc.setLineWidth(lw)
  doc.rect(x, y, w, h, 'FD')
}

function text(doc, str, x, y, opts = {}) {
  doc.text(str, x, y, opts)
}

// ─── Page management ──────────────────────────────────────────────────────────

function addPageHeader(doc, title) {
  fillRect(doc, 0, 0, PAGE_W, 8, NAVY)
  setColor(doc, { r: 71, g: 85, b: 105 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  text(doc, 'AryaInspectionService  ·  Professional Vehicle Inspection', MARGIN, 5.5)
  text(doc, title, PAGE_W - MARGIN, 5.5, { align: 'right' })
}

function addPageFooter(doc, pageNum, total) {
  const y = PAGE_H - 8
  fillRect(doc, 0, y, PAGE_W, 8, NAVY)
  setColor(doc, { r: 100, g: 116, b: 139 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  text(doc, '© AryaInspectionService — Confidential Inspection Report', MARGIN, y + 5.5)
  text(doc, `Page ${pageNum} of ${total}`, PAGE_W - MARGIN, y + 5.5, { align: 'right' })
}

function checkBreak(doc, y, needed) {
  if (y + needed > PAGE_H - 16) {
    doc.addPage()
    addPageHeader(doc, 'Continued')
    return 14
  }
  return y
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generatePDF({ carDetails, sections, aiScore }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const reportId = `AIS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000 + 1000)}`
  const dateStr = carDetails.date
    ? new Date(carDetails.date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // ── PAGE 1 ────────────────────────────────────────────────────────────────

  // === HERO HEADER ===
  fillRect(doc, 0, 0, PAGE_W, 42, NAVY)

  // Company badge
  const badgeRgb = BLUE
  setFill(doc, badgeRgb)
  doc.roundedRect(MARGIN, 8, 22, 22, 3, 3, 'F')
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  text(doc, 'AIS', MARGIN + 11, 22, { align: 'center' })

  // Company name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  setColor(doc, WHITE)
  text(doc, 'AryaInspectionService', MARGIN + 27, 17)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColor(doc, { r: 148, g: 163, b: 184 })
  text(doc, 'Professional Vehicle Inspection Platform', MARGIN + 27, 24)

  // Right side: report ID + date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  setColor(doc, { r: 148, g: 163, b: 184 })
  text(doc, reportId, PAGE_W - MARGIN, 15, { align: 'right' })
  text(doc, dateStr, PAGE_W - MARGIN, 23, { align: 'right' })

  // Report title bar
  fillRect(doc, 0, 42, PAGE_W, 10, BLUE)
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  text(doc, 'VEHICLE CONDITION INSPECTION REPORT', PAGE_W / 2, 49, { align: 'center' })

  let y = 58

  // === VEHICLE INFO + AI SCORE SIDE BY SIDE ===
  const infoW = CW * 0.55
  const scoreW = CW * 0.42
  const scoreX = MARGIN + infoW + CW * 0.03

  // Vehicle info box
  fillStrokeRect(doc, MARGIN, y, infoW, 48, LGRAY, BORDER)

  setColor(doc, MUTED)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  text(doc, 'VEHICLE', MARGIN + 4, y + 7)

  setColor(doc, DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  const vehicleName = `${carDetails.year || ''} ${carDetails.make || ''} ${carDetails.model || ''}`
  text(doc, vehicleName.trim(), MARGIN + 4, y + 15)

  const infoRows = [
    ['VIN / CHASSIS', carDetails.vin || 'Not provided'],
    ['MILEAGE', carDetails.mileage ? `${Number(carDetails.mileage).toLocaleString()} km` : '—'],
    ['INSPECTOR', carDetails.inspectorName || '—'],
    ['INSPECTION DATE', dateStr],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  infoRows.forEach(([label, value], i) => {
    const ry = y + 22 + i * 6.5
    setColor(doc, MUTED)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    text(doc, label, MARGIN + 4, ry)
    setColor(doc, DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    text(doc, String(value), MARGIN + 4, ry + 4)
  })

  // AI Score box
  const scoreColor =
    aiScore > 85
      ? { r: 22, g: 163, b: 74 }
      : aiScore >= 70
      ? { r: 202, g: 138, b: 4 }
      : { r: 220, g: 38, b: 38 }
  const scoreLabel =
    aiScore > 85 ? 'Excellent Condition' : aiScore >= 70 ? 'Good Condition' : 'Needs Attention'

  fillRect(doc, scoreX, y, scoreW, 48, scoreColor)

  setColor(doc, { r: 255, g: 255, b: 255, a: 0.7 })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  setColor(doc, { r: 255, g: 255, b: 255 })
  text(doc, 'AI CONDITION SCORE', scoreX + scoreW / 2, y + 10, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  text(doc, String(aiScore ?? '--'), scoreX + scoreW / 2, y + 30, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  text(doc, '/ 100', scoreX + scoreW / 2, y + 38, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  setColor(doc, { r: 255, g: 255, b: 255, a: 0.8 })
  text(doc, scoreLabel.toUpperCase(), scoreX + scoreW / 2, y + 45, { align: 'center' })

  y += 54

  // === SUMMARY TABLE ===
  setColor(doc, DARK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  text(doc, 'INSPECTION SUMMARY', MARGIN, y)
  y += 5

  // Table header
  fillRect(doc, MARGIN, y, CW, 8, NAVY)
  setColor(doc, WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  text(doc, 'SECTION', MARGIN + 4, y + 5.5)
  text(doc, 'CONDITION', MARGIN + CW * 0.55, y + 5.5)
  text(doc, 'PHOTOS', MARGIN + CW * 0.75, y + 5.5)
  text(doc, 'NOTES', MARGIN + CW * 0.86, y + 5.5)
  y += 8

  SECTIONS.forEach((section, i) => {
    const sData = sections[section.id]
    const rowH = 7.5
    fillRect(doc, MARGIN, y, CW, rowH, i % 2 === 0 ? WHITE : LGRAY)

    setColor(doc, DARK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    text(doc, section.name, MARGIN + 4, y + 5)

    // Condition pill
    const condHex = CONDITION_COLORS[sData.condition] || '#2563eb'
    const condRgb = hexToRgb(condHex)
    setColor(doc, condRgb)
    doc.setFont('helvetica', 'bold')
    text(doc, sData.condition, MARGIN + CW * 0.55, y + 5)

    setColor(doc, MUTED)
    doc.setFont('helvetica', 'normal')
    text(doc, `${sData.photos.length}`, MARGIN + CW * 0.77, y + 5)

    // Notes preview (truncate)
    const notePreview = sData.notes ? sData.notes.substring(0, 28) + (sData.notes.length > 28 ? '…' : '') : '—'
    setColor(doc, MUTED)
    doc.setFontSize(6.5)
    text(doc, notePreview, MARGIN + CW * 0.86, y + 5)
    doc.setFontSize(7.5)

    // Row border
    setDraw(doc, BORDER)
    doc.setLineWidth(0.1)
    doc.line(MARGIN, y + rowH, MARGIN + CW, y + rowH)

    y += rowH
  })

  y += 6

  // ── SECTION DETAIL PAGES ──────────────────────────────────────────────────

  for (const section of SECTIONS) {
    const sData = sections[section.id]
    if (!sData.photos || sData.photos.length === 0) continue

    // New page for each section
    doc.addPage()
    addPageHeader(doc, section.name)
    y = 14

    // Section heading bar
    fillRect(doc, MARGIN, y, CW, 11, NAVY)
    setColor(doc, WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    text(doc, section.name.toUpperCase(), MARGIN + 4, y + 7.5)

    // Condition badge on right of heading
    const condHex = CONDITION_COLORS[sData.condition] || '#2563eb'
    const condRgb = hexToRgb(condHex)
    const badgeW = 28
    setFill(doc, condRgb)
    doc.roundedRect(MARGIN + CW - badgeW - 3, y + 2, badgeW, 7, 2, 2, 'F')
    setColor(doc, WHITE)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    text(doc, sData.condition.toUpperCase(), MARGIN + CW - badgeW / 2 - 3, y + 7, { align: 'center' })

    y += 15

    // Photos grid: 2 per row
    const photoW = (CW - 6) / 2
    const photoH = photoW * (3 / 4) // 4:3 ratio

    let col = 0
    for (let idx = 0; idx < sData.photos.length; idx++) {
      const photoDataUrl = sData.photos[idx]
      y = checkBreak(doc, y, photoH + 14)

      const x = MARGIN + col * (photoW + 6)

      // Photo border / placeholder bg
      fillStrokeRect(doc, x, y, photoW, photoH, { r: 241, g: 245, b: 249 }, BORDER)

      try {
        // Detect format from data URL
        const fmt = photoDataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
        doc.addImage(photoDataUrl, fmt, x, y, photoW, photoH)
      } catch (err) {
        // Placeholder
        setColor(doc, MUTED)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        text(doc, 'Photo unavailable', x + photoW / 2, y + photoH / 2, { align: 'center' })
      }

      // Photo label below
      setColor(doc, MUTED)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      text(doc, `Photo ${idx + 1} — ${section.name}`, x + photoW / 2, y + photoH + 4, {
        align: 'center',
      })

      col++
      if (col === 2) {
        col = 0
        y += photoH + 10
      }
    }

    // Flush last row
    if (col !== 0) {
      y += photoH + 10
    }

    y += 2

    // Condition + Notes block
    y = checkBreak(doc, y, 24)
    fillStrokeRect(doc, MARGIN, y, CW, 22, LGRAY, BORDER)

    // Condition
    setColor(doc, MUTED)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    text(doc, 'CONDITION RATING', MARGIN + 4, y + 6)
    const condRgb2 = hexToRgb(CONDITION_COLORS[sData.condition] || '#2563eb')
    setColor(doc, condRgb2)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    text(doc, sData.condition, MARGIN + 4, y + 14)

    // Notes
    if (sData.notes) {
      setColor(doc, MUTED)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      text(doc, 'INSPECTOR NOTES', MARGIN + CW * 0.35, y + 6)

      setColor(doc, DARK)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      const noteLines = doc.splitTextToSize(sData.notes, CW * 0.62)
      text(doc, noteLines.slice(0, 2), MARGIN + CW * 0.35, y + 13)
    }

    y += 28
  }

  // ── ADD FOOTERS TO ALL PAGES ──────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    addPageFooter(doc, i, total)
  }

  // ── SAVE ──────────────────────────────────────────────────────────────────
  const safeMake  = (carDetails.make  || 'Vehicle').replace(/\s+/g, '')
  const safeModel = (carDetails.model || 'Inspection').replace(/\s+/g, '')
  const safeYear  = carDetails.year || new Date().getFullYear()
  doc.save(`AIS_${safeMake}_${safeModel}_${safeYear}_${reportId}.pdf`)
}
