export const SECTIONS = [
  {
    id: 'front_exterior',
    name: 'Front Exterior',
    instruction: 'Align the front bumper and headlights inside the frame',
    icon: '🚗',
    hint: 'Stand 3–4m away, capture full front view',
  },
  {
    id: 'rear_exterior',
    name: 'Rear Exterior',
    instruction: 'Align the rear bumper and tail lights inside the frame',
    icon: '🚙',
    hint: 'Stand 3–4m away, capture full rear view',
  },
  {
    id: 'left_side',
    name: 'Left Side',
    instruction: 'Align the full left profile of the vehicle inside the frame',
    icon: '◀',
    hint: 'Stand back enough to see all 4 doors / full panel',
  },
  {
    id: 'right_side',
    name: 'Right Side',
    instruction: 'Align the full right profile of the vehicle inside the frame',
    icon: '▶',
    hint: 'Stand back enough to see all 4 doors / full panel',
  },
  {
    id: 'interior_dashboard',
    name: 'Interior / Dashboard',
    instruction: 'Align the dashboard and steering wheel inside the frame',
    icon: '🎛',
    hint: 'Sit in driver seat, capture full dashboard view',
  },
  {
    id: 'engine_bay',
    name: 'Engine Bay',
    instruction: 'Align the engine bay inside the frame with hood fully open',
    icon: '⚙',
    hint: 'Capture entire engine compartment from above',
  },
  {
    id: 'tires',
    name: 'Tires & Wheels',
    instruction: 'Align the tire tread and rim inside the frame',
    icon: '⭕',
    hint: 'Capture close-up of tread depth and rim condition',
  },
  {
    id: 'side_mirrors',
    name: 'Side Mirrors',
    instruction: 'Align the side mirror inside the frame',
    icon: '🔲',
    hint: 'Capture both mirrors — take one photo each',
  },
]

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

export const CONDITION_SCORES = {
  Excellent: 100,
  Good: 85,
  Fair: 65,
  Poor: 40,
}

export const CONDITION_COLORS = {
  Excellent: '#16a34a',
  Good: '#2563eb',
  Fair: '#ca8a04',
  Poor: '#dc2626',
}

export const CONDITION_BG = {
  Excellent: '#dcfce7',
  Good: '#dbeafe',
  Fair: '#fef9c3',
  Poor: '#fee2e2',
}
