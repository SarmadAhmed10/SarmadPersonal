import { useState } from 'react'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR - i)

export default function StartScreen({ state, onUpdateCarDetails, onNavigate, onNewInspection }) {
  const { carDetails } = state
  const hasSaved =
    carDetails.make && carDetails.model && state.sections
      ? Object.values(state.sections).some((s) => s.photos.length > 0)
      : false

  const isReady =
    carDetails.make.trim() &&
    carDetails.model.trim() &&
    carDetails.year &&
    carDetails.inspectorName.trim()

  const handleChange = (field) => (e) => {
    onUpdateCarDetails({ [field]: e.target.value })
  }

  return (
    <div className="screen">
      {/* Hero Header */}
      <div className="start-hero">
        <div className="start-logo-wrap">AIS</div>
        <div className="start-company">AryaInspectionService</div>
        <div className="start-tagline">Professional Vehicle Inspection Platform</div>
      </div>

      <div className="screen-body">
        {hasSaved && (
          <div style={{ padding: '12px 16px 0' }}>
            <div className="saved-banner">
              <span className="saved-banner-text">⚡ In-progress inspection found</span>
              <button className="saved-banner-btn" onClick={onNewInspection}>
                Clear & Restart
              </button>
            </div>
          </div>
        )}

        <div className="start-form">
          <p className="form-section-title">Vehicle Details</p>
          <div className="field-group">
            <div className="field-row">
              <div className="field">
                <label>Make *</label>
                <input
                  type="text"
                  placeholder="Toyota"
                  value={carDetails.make}
                  onChange={handleChange('make')}
                  autoCapitalize="words"
                />
              </div>
              <div className="field">
                <label>Model *</label>
                <input
                  type="text"
                  placeholder="Camry"
                  value={carDetails.model}
                  onChange={handleChange('model')}
                  autoCapitalize="words"
                />
              </div>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Year *</label>
                <select value={carDetails.year} onChange={handleChange('year')}>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Mileage (km)</label>
                <input
                  type="number"
                  placeholder="45000"
                  value={carDetails.mileage}
                  onChange={handleChange('mileage')}
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="field">
              <label>VIN / Chassis Number</label>
              <input
                type="text"
                placeholder="1HGBH41JXMN109186"
                value={carDetails.vin}
                onChange={handleChange('vin')}
                autoCapitalize="characters"
                style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px' }}
              />
            </div>
          </div>

          <p className="form-section-title">Inspector</p>
          <div className="field-group">
            <div className="field">
              <label>Inspector Name *</label>
              <input
                type="text"
                placeholder="Your full name"
                value={carDetails.inspectorName}
                onChange={handleChange('inspectorName')}
                autoCapitalize="words"
              />
            </div>
            <div className="field">
              <label>Inspection Date</label>
              <input
                type="date"
                value={carDetails.date}
                onChange={handleChange('date')}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-bar">
        <button
          className="btn btn-primary"
          disabled={!isReady}
          onClick={() => onNavigate('sections')}
        >
          Start Inspection →
        </button>
      </div>
    </div>
  )
}
