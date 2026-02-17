// ─── Option shorthands ────────────────────────────────────────────────────────
const ACCIDENT   = { options: ['Non-Accidented', 'Accidented'],          warn: ['Accidented'] }
const OK         = { options: ['Ok', 'Not Ok'],                           warn: ['Not Ok'] }
const WORKING    = { options: ['Working', 'Not Working'],                 warn: ['Not Working'] }
const NO_LEAK    = { options: ['No Leakage', 'Leakage'],                  warn: ['Leakage'] }
const WARN_LIGHT = { options: ['Not Present', 'Present'],                 warn: ['Present'] }
const PRESENT    = { options: ['Present', 'Not Present'],                 warn: ['Not Present'] }
const NO_NOISE   = { options: ['No Noise', 'Noise Present'],              warn: ['Noise Present'] }
const SMOOTH     = { options: ['Smooth', 'Worn', 'Damaged'],              warn: ['Worn', 'Damaged'] }

function i(id, label, opts, type) {
  if (type === 'text') return { id, label, type: 'text' }
  return { id, label, options: opts.options, warnOptions: opts.warn }
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CHECKLIST_CATEGORIES = [
  {
    id: 'body_damage',
    name: 'Body Damage',
    icon: '🔴',
    subsections: [
      {
        name: 'Damage Assessment',
        items: [
          i('big_scratches',   'Big Scratches',         { options: ['None', 'Few', 'Many', 'Severe'],  warn: ['Many', 'Severe'] }),
          i('minor_scratches', 'Minor Scratches / Dents',{ options: ['None', 'Few', 'Many', 'Severe'], warn: ['Many', 'Severe'] }),
        ],
      },
    ],
  },

  {
    id: 'body_frame',
    name: 'Body Frame Accident',
    icon: '🚗',
    subsections: [
      {
        name: 'Frame Checklist',
        items: [
          i('radiator_core',     'Radiator Core Support',   ACCIDENT),
          i('right_strut_tower', 'Right Strut Tower Apron', ACCIDENT),
          i('left_strut_tower',  'Left Strut Tower Apron',  ACCIDENT),
          i('right_front_rail',  'Right Front Rail',        ACCIDENT),
          i('left_front_rail',   'Left Front Rail',         ACCIDENT),
          i('cowl_panel',        'Cowl Panel Firewall',     ACCIDENT),
          i('right_a_pillar',    'Right A Pillar',          ACCIDENT),
          i('left_a_pillar',     'Left A Pillar',           ACCIDENT),
          i('right_b_pillar',    'Right B Pillar',          ACCIDENT),
          i('left_b_pillar',     'Left B Pillar',           ACCIDENT),
          i('right_c_pillar',    'Right C Pillar',          ACCIDENT),
          i('left_c_pillar',     'Left C Pillar',           ACCIDENT),
          i('right_d_pillar',    'Right D Pillar',          ACCIDENT),
          i('left_d_pillar',     'Left D Pillar',           ACCIDENT),
          i('boot_floor',        'Boot Floor',              ACCIDENT),
          i('boot_lock_pillar',  'Boot Lock Pillar',        ACCIDENT),
          i('rear_sub_frame',    'Rear Sub Frame',          ACCIDENT),
          i('front_sub_frame',   'Front Sub Frame',         ACCIDENT),
        ],
      },
    ],
  },

  {
    id: 'engine',
    name: 'Engine / Transmission',
    icon: '⚙️',
    subsections: [
      {
        name: 'Fluids & Filters',
        items: [
          i('oil_level',        'Engine Oil Level',         { options: ['Complete and Clean', 'Low', 'Dirty', 'Low and Dirty'], warn: ['Low', 'Dirty', 'Low and Dirty'] }),
          i('oil_leakage',      'Engine Oil Leakage',       NO_LEAK),
          i('trans_oil',        'Transmission Oil Leakage', NO_LEAK),
          i('coolant',          'Coolant Leakage',          NO_LEAK),
          i('brake_oil',        'Brake Oil Leakage',        NO_LEAK),
        ],
      },
      {
        name: 'Mechanical Check',
        items: [
          i('belts',            'Belts (Fan)',               OK),
          i('wiring',           'Wires (Wiring Harness)',    OK),
          i('engine_blow',      'Engine Blow (Manual Check)',{ options: ['Not Present', 'Present'],   warn: ['Present'] }),
          i('engine_noise',     'Engine Noise',              { options: ['No Noise', 'Noise Present'], warn: ['Noise Present'] }),
          i('engine_vibration', 'Engine Vibration',          { options: ['No Vibration', 'Vibration Present'], warn: ['Vibration Present'] }),
          i('cold_start',       'Cold Start',                OK),
          i('engine_mounts',    'Engine Mounts',             OK),
          i('pulleys',          'Pulleys (Adjuster)',         OK),
          i('hoses',            'Hoses',                     OK),
        ],
      },
      {
        name: 'Exhaust & Cooling',
        items: [
          i('exhaust_sound',    'Exhaust Sound',    OK),
          i('radiator_eng',     'Radiator',         OK),
          i('suction_fan',      'Suction Fan',      WORKING),
        ],
      },
      {
        name: 'Engine Electronics',
        items: [
          i('starter',          'Starter Operation', OK),
        ],
      },
    ],
  },

  {
    id: 'brakes',
    name: 'Brakes',
    icon: '🛑',
    subsections: [
      {
        name: 'Disc & Pads',
        items: [
          i('fr_disc', 'Front Right Disc',      { options: ['Smooth', 'Worn', 'Scored', 'Damaged'],      warn: ['Worn', 'Scored', 'Damaged'] }),
          i('fl_disc', 'Front Left Disc',       { options: ['Smooth', 'Worn', 'Scored', 'Damaged'],      warn: ['Worn', 'Scored', 'Damaged'] }),
          i('fr_pad',  'Front Right Brake Pad', { options: ['More than 50%', 'Less than 50%', 'Critical'], warn: ['Less than 50%', 'Critical'] }),
          i('fl_pad',  'Front Left Brake Pad',  { options: ['More than 50%', 'Less than 50%', 'Critical'], warn: ['Less than 50%', 'Critical'] }),
        ],
      },
    ],
  },

  {
    id: 'suspension',
    name: 'Suspension / Steering',
    icon: '🔩',
    subsections: [
      {
        name: 'Front Suspension',
        items: [
          i('steering_play',     'Steering Wheel Play',    { options: ['Ok', 'Excessive'],    warn: ['Excessive'] }),
          i('right_ball_joint',  'Right Ball Joint',       SMOOTH),
          i('left_ball_joint',   'Left Ball Joint',        SMOOTH),
          i('right_z_links',     'Right Z Links',          SMOOTH),
          i('left_z_links',      'Left Z Links',           SMOOTH),
          i('right_tie_rod',     'Right Tie Rod End',      SMOOTH),
          i('left_tie_rod',      'Left Tie Rod End',       SMOOTH),
          i('fr_boots',          'Front Right Boots',      { options: ['Ok', 'Torn', 'Damaged'], warn: ['Torn', 'Damaged'] }),
          i('fl_boots',          'Front Left Boots',       { options: ['Ok', 'Torn', 'Damaged'], warn: ['Torn', 'Damaged'] }),
          i('fr_bushes',         'Front Right Bushes',     SMOOTH),
          i('fl_bushes',         'Front Left Bushes',      SMOOTH),
          i('fr_shock',          'Front Right Shock',      { options: ['Ok', 'Leaking', 'Worn', 'Damaged'], warn: ['Leaking', 'Worn', 'Damaged'] }),
          i('fl_shock',          'Front Left Shock',       { options: ['Ok', 'Leaking', 'Worn', 'Damaged'], warn: ['Leaking', 'Worn', 'Damaged'] }),
        ],
      },
      {
        name: 'Rear Suspension',
        items: [
          i('rr_bushes',  'Rear Right Bushes', { options: ['No Damage Found', 'Worn', 'Damaged'], warn: ['Worn', 'Damaged'] }),
          i('rl_bushes',  'Rear Left Bushes',  { options: ['No Damage Found', 'Worn', 'Damaged'], warn: ['Worn', 'Damaged'] }),
          i('rr_shock',   'Rear Right Shock',  { options: ['Ok', 'Leaking', 'Worn', 'Damaged'],   warn: ['Leaking', 'Worn', 'Damaged'] }),
          i('rl_shock',   'Rear Left Shock',   { options: ['Ok', 'Leaking', 'Worn', 'Damaged'],   warn: ['Leaking', 'Worn', 'Damaged'] }),
        ],
      },
    ],
  },

  {
    id: 'interior',
    name: 'Interior',
    icon: '🎛️',
    subsections: [
      {
        name: 'Steering Controls',
        items: [
          i('steer_wheel_cond',  'Steering Wheel Condition',     { options: ['Perfect', 'Scratched', 'Damaged'], warn: ['Damaged'] }),
          i('steer_buttons',     'Steering Wheel Buttons',       WORKING),
          i('horn',              'Horn',                         WORKING),
          i('lights_lever',      'Lights Lever / Switch',        WORKING),
          i('wiper_lever',       'Wiper / Washer Lever',         WORKING),
        ],
      },
      {
        name: 'Mirrors',
        items: [
          i('right_mirror',       'Right Side Mirror',       WORKING),
          i('left_mirror',        'Left Side Mirror',        WORKING),
          i('rear_mirror_dimmer', 'Rear View Mirror Dimmer', { options: ['Showing Reflection', 'Not Working'], warn: ['Not Working'] }),
        ],
      },
      {
        name: 'Seats & Belts',
        items: [
          i('rf_seat_electric',  'Right Front Seat Electric',  { options: ['Working', 'Not Working', 'N/A'], warn: ['Not Working'] }),
          i('lf_seat_electric',  'Left Front Seat Electric',   { options: ['Working', 'Not Working', 'N/A'], warn: ['Not Working'] }),
          i('right_seatbelt',    'Right Seat Belt',            WORKING),
          i('left_seatbelt',     'Left Seat Belt',             WORKING),
          i('rear_seatbelts',    'Rear Seat Belts',            WORKING),
          i('glove_box',         'Glove Box',                  WORKING),
        ],
      },
      {
        name: 'Windows & Locking',
        items: [
          i('fr_window',  'Front Right Power Window', { options: ['Working Properly', 'Slow', 'Not Working'], warn: ['Slow', 'Not Working'] }),
          i('fl_window',  'Front Left Power Window',  { options: ['Working Properly', 'Slow', 'Not Working'], warn: ['Slow', 'Not Working'] }),
          i('rr_window',  'Rear Right Power Window',  { options: ['Working Properly', 'Slow', 'Not Working'], warn: ['Slow', 'Not Working'] }),
          i('rl_window',  'Rear Left Power Window',   { options: ['Working Properly', 'Slow', 'Not Working'], warn: ['Slow', 'Not Working'] }),
          i('auto_lock',  'Auto Lock Button',         WORKING),
          i('safety_lock','Window Safety Lock',       WORKING),
        ],
      },
      {
        name: 'Dash / Roof Controls',
        items: [
          i('interior_lights', 'Interior Lightings',          WORKING),
          i('dash_ac',         'Dash Controls — A/C',         WORKING),
          i('dash_defog',      'Dash Controls — De-Fog',      WORKING),
          i('dash_hazard',     'Dash Controls — Hazard Lights',WORKING),
          i('dash_parking',    'Dash Controls — Parking Button',{ options: ['Working', 'Not Working', 'N/A'], warn: ['Not Working'] }),
          i('dash_others',     'Dash Controls — Others',      WORKING),
          i('audio_video',     'Audio / Video',               WORKING),
          i('rear_camera',     'Rear View Camera',            { options: ['Working', 'Not Working', 'N/A'], warn: ['Not Working'] }),
          i('trunk_release',   'Trunk Release Lever / Button',WORKING),
          i('fuel_release',    'Fuel Cap Release Lever',      WORKING),
          i('bonnet_release',  'Bonnet Release Lever',        WORKING),
          i('sunroof_ctrl',    'Sun Roof Control Button',     { options: ['Working', 'Not Working', 'N/A'], warn: ['Not Working'] }),
        ],
      },
      {
        name: 'Interior Trim (Poshish)',
        items: [
          i('roof_poshish',      'Roof Poshish',              { options: ['Perfect', 'Good', 'Fair', 'Dirty', 'Torn'],    warn: ['Dirty', 'Torn'] }),
          i('floor_mat',         'Floor Mat',                 { options: ['Perfect', 'Good', 'Fair', 'Dirty', 'Missing'], warn: ['Dirty', 'Missing'] }),
          i('rf_seat_poshish',   'Front Right Seat Poshish',  { options: ['Perfect', 'Good', 'Fair', 'Dirty', 'Torn'],    warn: ['Dirty', 'Torn'] }),
          i('lf_seat_poshish',   'Front Left Seat Poshish',   { options: ['Perfect', 'Good', 'Fair', 'Dirty', 'Torn'],    warn: ['Dirty', 'Torn'] }),
          i('rear_seat_poshish', 'Rear Seat Poshish',         { options: ['Perfect', 'Good', 'Fair', 'Dirty', 'Torn'],    warn: ['Dirty', 'Torn'] }),
          i('dashboard_cond',    'Dashboard Condition',        { options: ['Perfect', 'Good', 'Fair', 'Cracked', 'Damaged'], warn: ['Cracked', 'Damaged'] }),
        ],
      },
      {
        name: 'Equipment',
        items: [
          i('spare_tire', 'Spare Tire', PRESENT),
          i('tools',      'Tools',      { options: ['Complete', 'Incomplete', 'Not Present'], warn: ['Incomplete', 'Not Present'] }),
          i('jack',       'Jack',       PRESENT),
        ],
      },
    ],
  },

  {
    id: 'ac_heater',
    name: 'AC / Heater',
    icon: '❄️',
    subsections: [
      {
        name: 'AC & Heater Check',
        items: [
          i('ac_fitted',   'AC Fitted',   { options: ['Yes', 'No'], warn: ['No'] }),
          i('ac_operation','AC Operational',{ options: ['Yes', 'No'], warn: ['No'] }),
          i('blower',      'Blower',      { options: ['Excellent Air Throw', 'Good', 'Weak', 'Not Working'], warn: ['Weak', 'Not Working'] }),
          i('cooling',     'Cooling',     { options: ['Excellent', 'Good', 'Fair', 'Not Cooling'],           warn: ['Not Cooling'] }),
          i('heating',     'Heating',     { options: ['Excellent', 'Good', 'Fair', 'Not Heating'],           warn: ['Not Heating'] }),
        ],
      },
    ],
  },

  {
    id: 'electrical',
    name: 'Electrical & Electronics',
    icon: '⚡',
    subsections: [
      {
        name: 'Computer / Warning Lights',
        items: [
          i('computer_check',      'Computer Check / Malfunction', { options: ['Clear', 'Error'],          warn: ['Error'] }),
          i('battery_warning',     'Battery Warning Light',         WARN_LIGHT),
          i('oil_pressure_warning','Oil Pressure Low Warning Light',WARN_LIGHT),
          i('temp_warning',        'Temperature Warning Light',     WARN_LIGHT),
          i('airbag_warning',      'Air Bag Warning Light',         WARN_LIGHT),
          i('ps_warning',          'Power Steering Warning Light',  WARN_LIGHT),
          i('abs_warning',         'ABS Warning Light',             WARN_LIGHT),
          i('keyfob_warning',      'Key Fob Battery Low Light',     WARN_LIGHT),
        ],
      },
      {
        name: 'Battery',
        items: [
          { id: 'battery_voltage', label: 'Voltage', type: 'text', placeholder: 'e.g., 12.4V' },
          i('terminals',  'Terminals Condition',  { options: ['Ok', 'Corroded', 'Damaged'],  warn: ['Corroded', 'Damaged'] }),
          i('charging',   'Charging',             { options: ['Ok', 'Not Charging'],         warn: ['Not Charging'] }),
          i('alternator', 'Alternator Operation', { options: ['Ok', 'Not Working'],          warn: ['Not Working'] }),
        ],
      },
      {
        name: 'Instrument Cluster',
        items: [
          i('gauges', 'Gauges', { options: ['Working', 'Partial', 'Not Working'], warn: ['Partial', 'Not Working'] }),
        ],
      },
    ],
  },

  {
    id: 'exterior',
    name: 'Exterior & Body',
    icon: '🚙',
    subsections: [
      {
        name: 'Glass & Wipers',
        items: [
          i('trunk_lock',       'Trunk Lock',                  OK),
          i('front_windshield', 'Front Windshield Condition',  { options: ['Clear', 'Scratches', 'Chipped', 'Cracked'], warn: ['Scratches', 'Chipped', 'Cracked'] }),
          i('rear_windshield',  'Rear Windshield Condition',   { options: ['Clear', 'Scratches', 'Chipped', 'Cracked'], warn: ['Scratches', 'Chipped', 'Cracked'] }),
          i('fr_door_window',   'Front Right Door Window',     { options: ['Ok', 'Scratched', 'Cracked'], warn: ['Scratched', 'Cracked'] }),
          i('fl_door_window',   'Front Left Door Window',      { options: ['Ok', 'Scratched', 'Cracked'], warn: ['Scratched', 'Cracked'] }),
          i('rr_door_window',   'Rear Right Door Window',      { options: ['Ok', 'Scratched', 'Cracked'], warn: ['Scratched', 'Cracked'] }),
          i('rl_door_window',   'Rear Left Door Window',       { options: ['Ok', 'Scratched', 'Cracked'], warn: ['Scratched', 'Cracked'] }),
          i('wiper',            'Windscreen Wiper',            { options: ['Working', 'Not Cleaning Properly', 'Not Working'], warn: ['Not Cleaning Properly', 'Not Working'] }),
          i('sunroof_glass',    'Sun Roof Glass',              { options: ['Clear', 'Scratches', 'Cracked', 'N/A'],            warn: ['Scratches', 'Cracked'] }),
        ],
      },
      {
        name: 'Exterior Lights',
        items: [
          i('rh_working',  'Right Headlight (Working)',    WORKING),
          i('lh_working',  'Left Headlight (Working)',     WORKING),
          i('rh_cond',     'Right Headlight (Condition)',  { options: ['Perfect', 'Scratches', 'Cracked', 'Foggy'], warn: ['Scratches', 'Cracked', 'Foggy'] }),
          i('lh_cond',     'Left Headlight (Condition)',   { options: ['Perfect', 'Scratches', 'Cracked', 'Foggy'], warn: ['Scratches', 'Cracked', 'Foggy'] }),
          i('rt_working',  'Right Taillight (Working)',    WORKING),
          i('lt_working',  'Left Taillight (Working)',     WORKING),
          i('rt_cond',     'Right Taillight (Condition)',  { options: ['Perfect', 'Scratches', 'Cracked'], warn: ['Scratches', 'Cracked'] }),
          i('lt_cond',     'Left Taillight (Condition)',   { options: ['Perfect', 'Scratches', 'Cracked'], warn: ['Scratches', 'Cracked'] }),
          i('fog_lights',  'Fog Lights (Working)',         { options: ['Working', 'Not Working', 'N/A'],   warn: ['Not Working'] }),
        ],
      },
    ],
  },

  {
    id: 'tyres',
    name: 'Tyres & Wheels',
    icon: '⭕',
    subsections: [
      {
        name: 'Tyre Details',
        items: [
          { id: 'fr_tyre_brand', label: 'Front Right Tyre Brand',        type: 'text', placeholder: 'e.g., Continental' },
          { id: 'fr_tyre_tread', label: 'Front Right Tread Depth',       type: 'text', placeholder: 'e.g., 6.0mm' },
          { id: 'fl_tyre_brand', label: 'Front Left Tyre Brand',         type: 'text', placeholder: 'e.g., Continental' },
          { id: 'fl_tyre_tread', label: 'Front Left Tread Depth',        type: 'text', placeholder: 'e.g., 6.0mm' },
          { id: 'rr_tyre_brand', label: 'Rear Right Tyre Brand',         type: 'text', placeholder: 'e.g., Continental' },
          { id: 'rr_tyre_tread', label: 'Rear Right Tread Depth',        type: 'text', placeholder: 'e.g., 6.0mm' },
          { id: 'rl_tyre_brand', label: 'Rear Left Tyre Brand',          type: 'text', placeholder: 'e.g., Continental' },
          { id: 'rl_tyre_tread', label: 'Rear Left Tread Depth',         type: 'text', placeholder: 'e.g., 6.0mm' },
          { id: 'tyre_size',     label: 'Tyre Size',                     type: 'text', placeholder: 'e.g., 245/40/R18' },
          i('rims',       'Rims',        { options: ['Alloy', 'Steel', 'Damaged', 'Missing'], warn: ['Damaged', 'Missing'] }),
          i('wheel_caps',  'Wheel Caps', PRESENT),
        ],
      },
    ],
  },

  {
    id: 'test_drive',
    name: 'Test Drive',
    icon: '🏁',
    subsections: [
      {
        name: 'Test Drive Observations',
        items: [
          i('engine_pick',        'Engine Pick',                           OK),
          i('drive_shaft_noise',  'Drive Shaft Noise',                     NO_NOISE),
          i('gear_shifting',      'Gear Shifting',                         { options: ['Smooth', 'Jerky', 'Delayed', 'Hard'], warn: ['Jerky', 'Delayed', 'Hard'] }),
          i('brake_pedal',        'Brake Pedal Operation',                 { options: ['Timely Response', 'Delayed', 'Spongy', 'Hard'], warn: ['Delayed', 'Spongy', 'Hard'] }),
          i('abs_operation',      'ABS Operation',                         { options: ['Timely Response', 'Delayed', 'Not Working'], warn: ['Delayed', 'Not Working'] }),
          i('front_susp_driving', 'Front Suspension (While Driving)',      NO_NOISE),
          i('rear_susp_driving',  'Rear Suspension (While Driving)',       NO_NOISE),
          i('steering_driving',   'Steering Operation (While Driving)',    { options: ['Smooth', 'Heavy', 'Vibrating'], warn: ['Heavy', 'Vibrating'] }),
          i('steering_alignment', 'Steering Wheel Alignment',              { options: ['Centered', 'Pulls Left', 'Pulls Right'], warn: ['Pulls Left', 'Pulls Right'] }),
          i('ac_driving',         'AC Operation (While Driving)',          { options: ['Perfect', 'Weak', 'Not Working'], warn: ['Weak', 'Not Working'] }),
          i('heater_driving',     'Heater Operation (While Driving)',      { options: ['Perfect', 'Weak', 'Not Working'], warn: ['Weak', 'Not Working'] }),
          i('speedometer',        'Speedometer (While Driving)',           WORKING),
          i('test_drive_by',      'Test Drive Done By',                   { options: ['Inspector', 'Seller', 'Both', 'Not Done'], warn: [] }),
        ],
      },
    ],
  },
]

// ─── Init helper ──────────────────────────────────────────────────────────────
export function initChecklist() {
  const result = {}
  for (const cat of CHECKLIST_CATEGORIES) {
    result[cat.id] = {}
    for (const sub of cat.subsections) {
      for (const item of sub.items) {
        result[cat.id][item.id] =
          item.type === 'text' ? '' : (item.options?.[0] ?? '')
      }
    }
  }
  return result
}

// ─── Score helper ─────────────────────────────────────────────────────────────
export function getCategoryScore(category, checklistData) {
  const catData = checklistData?.[category.id] ?? {}
  let total = 0
  let good  = 0
  for (const sub of category.subsections) {
    for (const item of sub.items) {
      if (item.type === 'text' || !item.warnOptions) continue
      total++
      const val = catData[item.id] ?? item.options[0]
      if (!item.warnOptions.includes(val)) good++
    }
  }
  return total === 0 ? 100 : Math.round((good / total) * 100)
}
