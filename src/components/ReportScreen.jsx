import { useState } from 'react'
import { SECTIONS, CONDITION_COLORS, CONDITION_BG } from '../constants'
import { CHECKLIST_CATEGORIES, getCategoryScore } from '../checklistConstants'
import { generatePDF } from '../utils/pdfGenerator'

function getScoreStyle(score) {
  if (score > 85) return { bg: '#16a34a', color: '#fff', badge: '#bbf7d0', badgeText: '#15803d', label: 'Excellent Condition' }
  if (score >= 70) return { bg: '#ca8a04', color: '#fff', badge: '#fef08a', badgeText: '#854d0e', label: 'Good Condition' }
  return { bg: '#dc2626', color: '#fff', badge: '#fecaca', badgeText: '#991b1b', label: 'Needs Attention' }
}

function scorePill(score) {
  if (score >= 85) return { bg: '#dcfce7', color: '#15803d' }
  if (score >= 70) return { bg: '#fef9c3', color: '#854d0e' }
  return { bg: '#fee2e2', color: '#991b1b' }
}

export default function ReportScreen({ state, onNavigate, onNewInspection }) {
  const [generating, setGenerating] = useState(false)
  const { carDetails, sections, checklist, aiScore } = state
  const style = getScoreStyle(aiScore ?? 0)

  const handleDownloadPDF = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 80))
    try {
      await generatePDF({ carDetails, sections, checklist, aiScore })
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="screen">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar-logo">
          <div className="logo-badge">AIS</div>
          <div>
            <div className="logo-text">Inspection Report</div>
            <div className="logo-sub">AryaInspectionService</div>
          </div>
        </div>
        <div className="app-bar-step">Step 5/5</div>
      </div>

      <div className="screen-body">
        <div className="report-body">
          {/* AI Score Hero */}
          <div className="score-hero" style={{ background: style.bg, color: style.color }}>
            <div className="score-label">AI Condition Score</div>
            <div>
              <span className="score-number">{aiScore}</span>
              <span className="score-denom"> /100</span>
            </div>
            <div className="score-badge" style={{ background: style.badge, color: style.badgeText }}>
              {style.label}
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="report-car-card">
            <div className="car-card-title">Vehicle Information</div>
            <div className="car-card-vehicle">
              {carDetails.year} {carDetails.make} {carDetails.model}
            </div>
            <div className="car-meta-grid">
              <div className="car-meta-item">
                <span className="car-meta-key">VIN</span>
                <span className="car-meta-val" style={{ fontSize: 12, letterSpacing: '0.5px' }}>
                  {carDetails.vin || '—'}
                </span>
              </div>
              <div className="car-meta-item">
                <span className="car-meta-key">Mileage</span>
                <span className="car-meta-val">
                  {carDetails.mileage ? `${Number(carDetails.mileage).toLocaleString()} km` : '—'}
                </span>
              </div>
              <div className="car-meta-item">
                <span className="car-meta-key">Inspector</span>
                <span className="car-meta-val">{carDetails.inspectorName || '—'}</span>
              </div>
              <div className="car-meta-item">
                <span className="car-meta-key">Date</span>
                <span className="car-meta-val">
                  {carDetails.date
                    ? new Date(carDetails.date + 'T00:00:00').toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Photo section summary */}
          <div className="report-section-summary">
            <div className="summary-title">Photo Inspection Breakdown</div>
            {SECTIONS.map((section) => {
              const sData = sections[section.id]
              const condColor = CONDITION_COLORS[sData.condition] || '#2563eb'
              const condBg = CONDITION_BG[sData.condition] || '#dbeafe'
              return (
                <div key={section.id} className="summary-row">
                  <span className="summary-row-icon">{section.icon}</span>
                  <span className="summary-row-name">{section.name}</span>
                  <span className="condition-pill" style={{ background: condBg, color: condColor }}>
                    {sData.condition}
                  </span>
                  <span className="photos-count">{sData.photos.length}📷</span>
                </div>
              )
            })}
          </div>

          {/* Checklist category scores */}
          <div className="report-section-summary">
            <div className="summary-title">Checklist Category Scores</div>
            {CHECKLIST_CATEGORIES.map((cat) => {
              const score = getCategoryScore(cat, checklist)
              const pill = scorePill(score)
              return (
                <div key={cat.id} className="summary-row">
                  <span className="summary-row-icon">{cat.icon}</span>
                  <span className="summary-row-name">{cat.name}</span>
                  <span className="condition-pill" style={{ background: pill.bg, color: pill.color }}>
                    {score}%
                  </span>
                </div>
              )
            })}
          </div>

          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bottom-bar" style={{ flexDirection: 'column', gap: 8 }}>
        <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={generating}>
          ⬇ Download PDF Report
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => onNavigate('review')}
          >
            ← Edit Review
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={onNewInspection}
          >
            New Inspection
          </button>
        </div>
      </div>

      {generating && (
        <div className="generating-overlay">
          <div className="generating-spinner" />
          <div className="generating-text">Generating PDF…</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>This may take a moment</div>
        </div>
      )}
    </div>
  )
}
