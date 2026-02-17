import { useState, useEffect } from 'react'
import StartScreen from './components/StartScreen'
import SectionsScreen from './components/SectionsScreen'
import ReviewScreen from './components/ReviewScreen'
import ReportScreen from './components/ReportScreen'
import { SECTIONS, CONDITION_SCORES } from './constants'

const STORAGE_KEY = 'ais_inspection_v1'

const initSections = () =>
  Object.fromEntries(
    SECTIONS.map((s) => [s.id, { photos: [], condition: 'Good', notes: '' }])
  )

const defaultState = {
  screen: 'start',
  carDetails: {
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    vin: '',
    mileage: '',
    inspectorName: '',
    date: new Date().toISOString().split('T')[0],
  },
  sections: initSections(),
  aiScore: null,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    // Merge to ensure new sections are present
    return {
      ...defaultState,
      ...parsed,
      sections: { ...initSections(), ...parsed.sections },
    }
  } catch {
    return defaultState
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('localStorage quota exceeded — photos may not persist after refresh')
  }
}

export default function App() {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const setScreen = (screen) => setState((prev) => ({ ...prev, screen }))

  const updateCarDetails = (updates) =>
    setState((prev) => ({
      ...prev,
      carDetails: { ...prev.carDetails, ...updates },
    }))

  const addPhoto = (sectionId, dataUrl) =>
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          photos: [...prev.sections[sectionId].photos, dataUrl],
        },
      },
    }))

  const removePhoto = (sectionId, photoIndex) =>
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: {
          ...prev.sections[sectionId],
          photos: prev.sections[sectionId].photos.filter((_, i) => i !== photoIndex),
        },
      },
    }))

  const updateSection = (sectionId, updates) =>
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [sectionId]: { ...prev.sections[sectionId], ...updates },
      },
    }))

  const generateReport = () => {
    const scores = SECTIONS.map(
      (s) => CONDITION_SCORES[state.sections[s.id].condition] ?? 85
    )
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    setState((prev) => ({ ...prev, aiScore: avg, screen: 'report' }))
  }

  const startNewInspection = () => {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
  }

  const sharedProps = {
    state,
    onUpdateCarDetails: updateCarDetails,
    onAddPhoto: addPhoto,
    onRemovePhoto: removePhoto,
    onUpdateSection: updateSection,
    onNavigate: setScreen,
    onGenerateReport: generateReport,
    onNewInspection: startNewInspection,
  }

  return (
    <div className="app-root">
      {state.screen === 'start' && <StartScreen {...sharedProps} />}
      {state.screen === 'sections' && <SectionsScreen {...sharedProps} />}
      {state.screen === 'review' && <ReviewScreen {...sharedProps} />}
      {state.screen === 'report' && <ReportScreen {...sharedProps} />}
    </div>
  )
}
