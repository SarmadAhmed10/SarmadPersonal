import { useState } from 'react'
import { SECTIONS } from '../constants'
import CaptureModal from './CaptureModal'

export default function SectionsScreen({ state, onAddPhoto, onNavigate }) {
  const [activeSection, setActiveSection] = useState(null)

  const { sections } = state
  const capturedCount = SECTIONS.filter((s) => sections[s.id].photos.length > 0).length
  const allCaptured = capturedCount === SECTIONS.length

  return (
    <div className="screen">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar-logo">
          <div className="logo-badge">AIS</div>
          <div>
            <div className="logo-text">Photo Capture</div>
            <div className="logo-sub">
              {state.carDetails.year} {state.carDetails.make} {state.carDetails.model}
            </div>
          </div>
        </div>
        <div className="app-bar-step">Step 2/5</div>
      </div>

      {/* Progress */}
      <div className="progress-wrap">
        <div className="progress-label">{capturedCount} of {SECTIONS.length} sections captured</div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${(capturedCount / SECTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Section cards */}
      <div className="screen-body">
        <div className="sections-list">
          {SECTIONS.map((section) => {
            const sData = sections[section.id]
            const hasPics = sData.photos.length > 0

            return (
              <div key={section.id} className={`section-card ${hasPics ? 'captured' : ''}`}>
                <div className="section-card-header">
                  <div className={`section-icon ${hasPics ? 'captured' : ''}`}>
                    {section.icon}
                  </div>
                  <div className="section-info">
                    <div className="section-name">{section.name}</div>
                    <div className={`section-status ${hasPics ? 'done' : ''}`}>
                      <span className={`status-dot ${hasPics ? 'done' : ''}`} />
                      {hasPics
                        ? `${sData.photos.length} photo${sData.photos.length > 1 ? 's' : ''} captured`
                        : 'Not captured'}
                    </div>
                  </div>
                  {hasPics ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: 'auto', minHeight: 36, padding: '0 12px' }}
                      onClick={() => setActiveSection(section)}
                    >
                      + Add
                    </button>
                  ) : null}
                </div>

                {/* Thumbnails */}
                {hasPics && (
                  <div className="section-thumb-strip">
                    {sData.photos.map((photo, i) => (
                      <img key={i} src={photo} alt={`${section.name} ${i + 1}`} className="section-thumb" />
                    ))}
                  </div>
                )}

                {/* Capture button */}
                {!hasPics && (
                  <div className="section-actions">
                    <button
                      className="btn btn-primary"
                      style={{ minHeight: 46 }}
                      onClick={() => setActiveSection(section)}
                    >
                      📷 Capture Photo
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bottom-bar">
        <button
          className="btn btn-secondary"
          style={{ width: 'auto', flex: '0 0 auto', padding: '0 18px' }}
          onClick={() => onNavigate('start')}
        >
          ← Back
        </button>
        <button
          className="btn btn-primary"
          disabled={!allCaptured}
          onClick={() => onNavigate('checklist')}
        >
          {allCaptured ? 'Inspection Checklist →' : `${SECTIONS.length - capturedCount} section${SECTIONS.length - capturedCount !== 1 ? 's' : ''} remaining`}
        </button>
      </div>

      {/* Capture Modal */}
      {activeSection && (
        <CaptureModal
          section={activeSection}
          onCapture={(dataUrl) => {
            onAddPhoto(activeSection.id, dataUrl)
          }}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  )
}
