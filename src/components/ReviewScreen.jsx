import { useState } from 'react'
import { SECTIONS, CONDITIONS, CONDITION_COLORS, CONDITION_BG } from '../constants'
import CaptureModal from './CaptureModal'

export default function ReviewScreen({ state, onUpdateSection, onRemovePhoto, onAddPhoto, onNavigate, onGenerateReport }) {
  const [addingTo, setAddingTo] = useState(null)

  const { sections } = state

  return (
    <div className="screen">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar-logo">
          <div className="logo-badge">AIS</div>
          <div>
            <div className="logo-text">Review & Rate</div>
            <div className="logo-sub">Confirm conditions and notes</div>
          </div>
        </div>
        <div className="app-bar-step">Step 3/4</div>
      </div>

      <div className="screen-body">
        <div className="review-sections">
          {SECTIONS.map((section) => {
            const sData = sections[section.id]
            const condColor = CONDITION_COLORS[sData.condition] || '#2563eb'
            const condBg = CONDITION_BG[sData.condition] || '#dbeafe'

            return (
              <div key={section.id} className="review-card">
                {/* Section header */}
                <div className="review-card-header">
                  <span className="review-section-icon">{section.icon}</span>
                  <span className="review-section-name">{section.name}</span>
                  <span className="photo-count-badge">
                    {sData.photos.length} photo{sData.photos.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Photos grid */}
                {sData.photos.length > 0 && (
                  <div className="review-photos-grid">
                    {sData.photos.map((photo, i) => (
                      <div key={i} className="review-photo-wrap">
                        <img src={photo} alt={`${section.name} ${i + 1}`} className="review-photo" />
                        <button
                          className="photo-remove-btn"
                          onClick={() => onRemovePhoto(section.id, i)}
                          aria-label="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Fields */}
                <div className="review-fields">
                  {/* Add more photos */}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setAddingTo(section)}
                    style={{ width: '100%' }}
                  >
                    + Add Photo
                  </button>

                  {/* Condition */}
                  <div>
                    <div className="review-field-label">Condition</div>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="condition-select"
                        value={sData.condition}
                        onChange={(e) => onUpdateSection(section.id, { condition: e.target.value })}
                        style={{
                          borderColor: condColor,
                          color: condColor,
                          fontWeight: 700,
                          background: condBg,
                          paddingRight: '32px',
                        }}
                      >
                        {CONDITIONS.map((c) => (
                          <option key={c} value={c} style={{ color: CONDITION_COLORS[c] }}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <span
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none',
                          fontSize: 12,
                          color: condColor,
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <div className="review-field-label">Notes (optional)</div>
                    <textarea
                      className="notes-textarea"
                      rows={2}
                      placeholder={`Any observations for ${section.name.toLowerCase()}…`}
                      value={sData.notes}
                      onChange={(e) => onUpdateSection(section.id, { notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          {/* Bottom padding for scroll */}
          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bottom-bar">
        <button
          className="btn btn-secondary"
          style={{ width: 'auto', flex: '0 0 auto', padding: '0 18px' }}
          onClick={() => onNavigate('sections')}
        >
          ← Back
        </button>
        <button className="btn btn-success" onClick={onGenerateReport}>
          Generate Report →
        </button>
      </div>

      {/* Add photo modal */}
      {addingTo && (
        <CaptureModal
          section={addingTo}
          onCapture={(dataUrl) => onAddPhoto(addingTo.id, dataUrl)}
          onClose={() => setAddingTo(null)}
        />
      )}
    </div>
  )
}
