import { useState } from 'react'
import { CHECKLIST_CATEGORIES, getCategoryScore } from '../checklistConstants'

export default function ChecklistScreen({ state, onUpdateChecklist, onNavigate }) {
  const [openCats, setOpenCats] = useState({ [CHECKLIST_CATEGORIES[0].id]: true })

  const { checklist } = state

  const toggleCat = (id) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }))

  const handleChange = (catId, itemId, value) => {
    onUpdateChecklist(catId, itemId, value)
  }

  const totalScore = Math.round(
    CHECKLIST_CATEGORIES.reduce((sum, cat) => sum + getCategoryScore(cat, checklist), 0) /
      CHECKLIST_CATEGORIES.length
  )

  return (
    <div className="screen">
      {/* App Bar */}
      <div className="app-bar">
        <div className="app-bar-logo">
          <div className="logo-badge">AIS</div>
          <div>
            <div className="logo-text">Inspection Checklist</div>
            <div className="logo-sub">
              {state.carDetails.year} {state.carDetails.make} {state.carDetails.model}
            </div>
          </div>
        </div>
        <div className="app-bar-step">Step 3/5</div>
      </div>

      {/* Overall score strip */}
      <div className="progress-wrap">
        <div className="progress-label">
          Overall checklist score — {totalScore}%
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${totalScore}%`,
              background: totalScore >= 85 ? '#16a34a' : totalScore >= 70 ? '#ca8a04' : '#dc2626',
            }}
          />
        </div>
      </div>

      <div className="screen-body">
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHECKLIST_CATEGORIES.map((cat) => {
            const score = getCategoryScore(cat, checklist)
            const isOpen = !!openCats[cat.id]
            const catData = checklist?.[cat.id] ?? {}

            return (
              <div key={cat.id} className="cl-accordion">
                {/* Accordion header */}
                <button className="cl-acc-header" onClick={() => toggleCat(cat.id)}>
                  <span className="cl-acc-icon">{cat.icon}</span>
                  <span className="cl-acc-name">{cat.name}</span>
                  <span
                    className="cl-score-pill"
                    style={{
                      background:
                        score >= 85 ? '#dcfce7' : score >= 70 ? '#fef9c3' : '#fee2e2',
                      color:
                        score >= 85 ? '#15803d' : score >= 70 ? '#854d0e' : '#991b1b',
                    }}
                  >
                    {score}%
                  </span>
                  <span className="cl-chevron" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    ▾
                  </span>
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="cl-acc-body">
                    {cat.subsections.map((sub) => (
                      <div key={sub.name}>
                        <div className="cl-subsection-label">{sub.name}</div>
                        {sub.items.map((item) => {
                          const value = catData[item.id] ?? (item.type === 'text' ? '' : item.options?.[0] ?? '')
                          const isWarn = item.warnOptions?.includes(value)

                          return (
                            <div key={item.id} className={`cl-item ${isWarn ? 'cl-item-warn' : ''}`}>
                              <span className="cl-item-label">{item.label}</span>
                              {item.type === 'text' ? (
                                <input
                                  type="text"
                                  className="cl-text-input"
                                  value={value}
                                  placeholder={item.placeholder || ''}
                                  onChange={(e) => handleChange(cat.id, item.id, e.target.value)}
                                />
                              ) : item.options.length === 2 ? (
                                <div className="cl-toggle">
                                  {item.options.map((opt) => (
                                    <button
                                      key={opt}
                                      className={`cl-toggle-btn ${value === opt ? 'active' : ''} ${item.warnOptions?.includes(opt) && value === opt ? 'warn-active' : ''}`}
                                      onClick={() => handleChange(cat.id, item.id, opt)}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <select
                                  className="cl-select"
                                  value={value}
                                  onChange={(e) => handleChange(cat.id, item.id, e.target.value)}
                                  style={isWarn ? { borderColor: '#dc2626', color: '#dc2626' } : {}}
                                >
                                  {item.options.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
        <button className="btn btn-primary" onClick={() => onNavigate('review')}>
          Review Photos →
        </button>
      </div>
    </div>
  )
}
