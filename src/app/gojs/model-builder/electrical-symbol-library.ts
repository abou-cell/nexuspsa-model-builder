export interface ElectricalSymbolDefinition {
  category: string;
  name: string;
  description: string;
  rating: string;
  kbClass: string;
  groupLabel: 'Sources' | 'Protection & Switching' | 'Transformers' | 'Conversion' | 'Storage' | 'Distribution';
  width: number;
  height: number;
  source: string;
}

const BLUE = '#1647ff';
const BLUE_DARK = '#0d36c7';
const BLUE_FILL = '#eaf0ff';
const BLUE_FILL_2 = '#dbe6ff';
const CONVERSION_FILL = '#fff7d6';
const WHITE = '#ffffff';

function svg(viewBox: string, body: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="${BLUE}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

// Large synchronous-machine pictogram: visually recognisable at palette scale.
const generator = svg('0 0 120 90', `
  <line x1="5" y1="45" x2="25" y2="45" stroke-width="3.5"/>
  <circle cx="60" cy="45" r="31" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <circle cx="60" cy="45" r="24" stroke="${BLUE_DARK}" stroke-width="1.5" opacity="0.45"/>
  <text x="60" y="44" fill="${BLUE_DARK}" stroke="none" font-size="23" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <path d="M43 57c5-7 10 7 15 0s10 7 15 0" stroke-width="2.3"/>
  <line x1="91" y1="45" x2="115" y2="45" stroke-width="3.5"/>
`);

// Diesel generator set: prime mover + coupling + electrical generator.
const ges = svg('0 0 138 92', `
  <rect x="7" y="25" width="43" height="42" rx="5" fill="${BLUE_FILL_2}" stroke-width="3"/>
  <rect x="13" y="31" width="31" height="11" rx="2" fill="${WHITE}"/>
  <path d="M16 48h25M18 54h21M18 60h21" stroke-width="2"/>
  <circle cx="17" cy="69" r="4" fill="${BLUE}"/><circle cx="40" cy="69" r="4" fill="${BLUE}"/>
  <line x1="50" y1="46" x2="61" y2="46" stroke-width="4"/>
  <circle cx="92" cy="46" r="30" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <text x="92" y="45" fill="${BLUE_DARK}" stroke="none" font-size="21" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <path d="M77 58c4-6 8 6 12 0s8 6 12 0" stroke-width="2.2"/>
  <line x1="122" y1="46" x2="133" y2="46" stroke-width="3.5"/>
`);

// LV breaker: visible device body with moving blade and actuator.
const breaker = svg('0 0 120 84', `
  <line x1="5" y1="42" x2="27" y2="42" stroke-width="3.5"/>
  <rect x="27" y="13" width="66" height="58" rx="5" fill="${BLUE_FILL}" stroke-width="3.2"/>
  <rect x="38" y="20" width="44" height="12" rx="3" fill="${BLUE}" stroke="none"/>
  <circle cx="42" cy="53" r="3.2" fill="${BLUE}" stroke="none"/>
  <circle cx="77" cy="36" r="3.2" fill="${BLUE}" stroke="none"/>
  <line x1="45" y1="51" x2="73" y2="38" stroke="${BLUE_DARK}" stroke-width="4.5"/>
  <text x="60" y="66" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">CB</text>
  <line x1="93" y1="42" x2="115" y2="42" stroke-width="3.5"/>
`);

// MV/AST breaker: same physical family, explicit 52 device designation.
const breakerMv = svg('0 0 120 84', `
  <line x1="5" y1="42" x2="27" y2="42" stroke-width="3.5"/>
  <rect x="27" y="13" width="66" height="58" rx="5" fill="${BLUE_FILL}" stroke-width="3.2"/>
  <rect x="36" y="19" width="48" height="15" rx="3" fill="${BLUE}" stroke="none"/>
  <text x="60" y="30" fill="${WHITE}" stroke="none" font-size="11" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">52</text>
  <circle cx="42" cy="55" r="3.2" fill="${BLUE}" stroke="none"/>
  <circle cx="78" cy="38" r="3.2" fill="${BLUE}" stroke="none"/>
  <line x1="45" y1="53" x2="74" y2="40" stroke="${BLUE_DARK}" stroke-width="4.5"/>
  <line x1="93" y1="42" x2="115" y2="42" stroke-width="3.5"/>
`);

// Contactor: body + main contact + electromagnetic coil, much more visual than a bare contact line.
const contactor = svg('0 0 120 86', `
  <line x1="5" y1="42" x2="26" y2="42" stroke-width="3.5"/>
  <rect x="26" y="12" width="68" height="62" rx="5" fill="${BLUE_FILL}" stroke-width="3.2"/>
  <circle cx="42" cy="35" r="3" fill="${BLUE}" stroke="none"/>
  <circle cx="77" cy="35" r="3" fill="${BLUE}" stroke="none"/>
  <line x1="45" y1="34" x2="72" y2="23" stroke="${BLUE_DARK}" stroke-width="4"/>
  <line x1="60" y1="38" x2="60" y2="48" stroke-dasharray="3 3"/>
  <rect x="43" y="49" width="34" height="15" rx="7" fill="${WHITE}" stroke-width="2.4"/>
  <text x="60" y="60" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">KM</text>
  <line x1="94" y1="42" x2="115" y2="42" stroke-width="3.5"/>
`);

// Two-winding transformer matching the user's overlapping-circle Δ/Y visual language.
const transformerTs = svg('0 0 120 104', `
  <line x1="5" y1="50" x2="18" y2="50" stroke-width="3.5"/>
  <circle cx="45" cy="38" r="27" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <circle cx="72" cy="65" r="27" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <path d="M33 44l12-21 12 21z" stroke="${BLUE_DARK}" stroke-width="3.2"/>
  <path d="M60 58l12 8 12-8M72 66v16" stroke="${BLUE_DARK}" stroke-width="3.2"/>
  <line x1="99" y1="65" x2="115" y2="65" stroke-width="3.5"/>
`);

// Three-winding transformer close to the supplied EDF-style reference.
const transformerTa = svg('0 0 132 112', `
  <line x1="4" y1="39" x2="20" y2="39" stroke-width="3.5"/>
  <circle cx="65" cy="39" r="33" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <path d="M65 18v22M65 40l-17 14M65 40l17 14" stroke="${BLUE_DARK}" stroke-width="3.2"/>
  <circle cx="38" cy="81" r="22" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <path d="M27 88l11-19 11 19z" stroke="${BLUE_DARK}" stroke-width="3.2"/>
  <circle cx="94" cy="81" r="22" fill="${BLUE_FILL}" stroke-width="3.5"/>
  <path d="M83 88l11-19 11 19z" stroke="${BLUE_DARK}" stroke-width="3.2"/>
  <line x1="38" y1="103" x2="38" y2="110" stroke-width="3.5"/>
  <line x1="94" y1="103" x2="94" y2="110" stroke-width="3.5"/>
  <line x1="91" y1="24" x2="126" y2="10" stroke-width="2.8"/>
  <path d="M118 7l8 3-5 7" fill="${BLUE}"/>
`);

// Conversion devices reproduce the user's square-with-diagonal convention and add a strong equipment body.
const rectifier = svg('0 0 110 88', `
  <line x1="4" y1="44" x2="19" y2="44" stroke-width="3.5"/>
  <rect x="19" y="9" width="72" height="70" rx="3" fill="${CONVERSION_FILL}" stroke-width="3.4"/>
  <line x1="24" y1="73" x2="86" y2="15" stroke="${BLUE_DARK}" stroke-width="3.4"/>
  <path d="M29 29c4-7 8 7 12 0s8 7 12 0" stroke="${BLUE_DARK}" stroke-width="2.5"/>
  <line x1="65" y1="53" x2="80" y2="53" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="68" y1="60" x2="77" y2="60" stroke="${BLUE_DARK}" stroke-width="3"/>
  <text x="35" y="20" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <text x="76" y="73" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="91" y1="44" x2="106" y2="44" stroke-width="3.5"/>
`);

const inverter = svg('0 0 110 88', `
  <line x1="4" y1="44" x2="19" y2="44" stroke-width="3.5"/>
  <rect x="19" y="9" width="72" height="70" rx="3" fill="${CONVERSION_FILL}" stroke-width="3.4"/>
  <line x1="24" y1="73" x2="86" y2="15" stroke="${BLUE_DARK}" stroke-width="3.4"/>
  <line x1="29" y1="27" x2="45" y2="27" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="32" y1="34" x2="42" y2="34" stroke="${BLUE_DARK}" stroke-width="3"/>
  <path d="M63 58c4-7 8 7 12 0s8 7 12 0" stroke="${BLUE_DARK}" stroke-width="2.5"/>
  <text x="35" y="20" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="76" y="73" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <line x1="91" y1="44" x2="106" y2="44" stroke-width="3.5"/>
`);

const converter = svg('0 0 110 88', `
  <line x1="4" y1="44" x2="19" y2="44" stroke-width="3.5"/>
  <rect x="19" y="9" width="72" height="70" rx="3" fill="${CONVERSION_FILL}" stroke-width="3.4"/>
  <line x1="24" y1="73" x2="86" y2="15" stroke="${BLUE_DARK}" stroke-width="3.4"/>
  <line x1="29" y1="27" x2="45" y2="27" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="32" y1="34" x2="42" y2="34" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="65" y1="53" x2="80" y2="53" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="68" y1="60" x2="77" y2="60" stroke="${BLUE_DARK}" stroke-width="3"/>
  <text x="35" y="20" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="76" y="73" fill="${BLUE_DARK}" stroke="none" font-size="9" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="91" y1="44" x2="106" y2="44" stroke-width="3.5"/>
`);

// Battery bank shown as a physical rack containing IEC cell pairs, readable at icon scale.
const battery = svg('0 0 120 84', `
  <line x1="5" y1="42" x2="18" y2="42" stroke-width="3.5"/>
  <rect x="18" y="12" width="84" height="60" rx="4" fill="${BLUE_FILL}" stroke-width="3.2"/>
  <line x1="31" y1="23" x2="31" y2="61" stroke="${BLUE_DARK}" stroke-width="4"/><line x1="39" y1="30" x2="39" y2="54" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="51" y1="23" x2="51" y2="61" stroke="${BLUE_DARK}" stroke-width="4"/><line x1="59" y1="30" x2="59" y2="54" stroke="${BLUE_DARK}" stroke-width="3"/>
  <line x1="71" y1="23" x2="71" y2="61" stroke="${BLUE_DARK}" stroke-width="4"/><line x1="79" y1="30" x2="79" y2="54" stroke="${BLUE_DARK}" stroke-width="3"/>
  <text x="25" y="24" fill="${BLUE_DARK}" stroke="none" font-size="10" font-weight="800" font-family="Arial,sans-serif">+</text>
  <text x="91" y="24" fill="${BLUE_DARK}" stroke="none" font-size="12" font-weight="800" font-family="Arial,sans-serif">−</text>
  <line x1="102" y1="42" x2="115" y2="42" stroke-width="3.5"/>
`);

// Cabinet-like switchboard pictogram with clearly visible busbar and feeder breakers.
function switchboard(label: string, dc = false): string {
  return svg('0 0 132 100', `
    <rect x="10" y="6" width="112" height="88" rx="5" fill="${BLUE_FILL}" stroke-width="3.2"/>
    <rect x="18" y="13" width="96" height="18" rx="3" fill="${WHITE}" stroke-width="2.2"/>
    <text x="66" y="26" fill="${BLUE_DARK}" stroke="none" font-size="12" font-weight="800" font-family="Arial,sans-serif" text-anchor="middle">${label}</text>
    ${dc ? `<text x="107" y="26" fill="${BLUE_DARK}" stroke="none" font-size="8" font-weight="800" font-family="Arial,sans-serif" text-anchor="end">DC</text>` : ''}
    <line x1="25" y1="42" x2="107" y2="42" stroke="${BLUE_DARK}" stroke-width="7"/>
    <line x1="40" y1="42" x2="40" y2="56" stroke-width="3"/><rect x="32" y="56" width="16" height="16" rx="2" fill="${WHITE}" stroke-width="2.5"/><line x1="35" y1="69" x2="45" y2="59" stroke="${BLUE_DARK}" stroke-width="2.7"/><line x1="40" y1="72" x2="40" y2="88" stroke-width="3.2"/>
    <line x1="66" y1="42" x2="66" y2="56" stroke-width="3"/><rect x="58" y="56" width="16" height="16" rx="2" fill="${WHITE}" stroke-width="2.5"/><line x1="61" y1="69" x2="71" y2="59" stroke="${BLUE_DARK}" stroke-width="2.7"/><line x1="66" y1="72" x2="66" y2="88" stroke-width="3.2"/>
    <line x1="92" y1="42" x2="92" y2="56" stroke-width="3"/><rect x="84" y="56" width="16" height="16" rx="2" fill="${WHITE}" stroke-width="2.5"/><line x1="87" y1="69" x2="97" y2="59" stroke="${BLUE_DARK}" stroke-width="2.7"/><line x1="92" y1="72" x2="92" y2="88" stroke-width="3.2"/>
  `);
}

export const ELECTRICAL_SYMBOLS: readonly ElectricalSymbolDefinition[] = [
  { category: 'Unit Generator', name: 'Unit Generator / Alternator', description: 'Main synchronous unit alternator', rating: '24 kV · 1300 MVA · 50 Hz', kbClass: 'ELECTRICAL.UNIT_GENERATOR', groupLabel: 'Sources', width: 96, height: 72, source: generator },
  { category: 'Main GES / GES-M / GES-DEC-A', name: 'Main GES / GES-M / GES-DEC-A', description: 'Emergency diesel generator set', rating: '10 kV · 6.3 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_MAIN', groupLabel: 'Sources', width: 108, height: 72, source: ges },
  { category: 'GES DEC-B', name: 'GES DEC-B', description: 'Diversified emergency diesel generator', rating: '400 V · 1.5 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_DEC_B', groupLabel: 'Sources', width: 108, height: 72, source: ges },

  { category: 'TS Transformer', name: 'TS Transformer', description: 'Unit / station auxiliary transformer', rating: '24/10 kV · 40 MVA · Δ/Yn', kbClass: 'ELECTRICAL.TRANSFORMER_TS', groupLabel: 'Transformers', width: 88, height: 82, source: transformerTs },
  { category: 'TA Transformer', name: 'TA Transformer', description: 'Three-winding / regulating auxiliary transformer', rating: '10/0.69 kV · 3150 kVA', kbClass: 'ELECTRICAL.TRANSFORMER_TA', groupLabel: 'Transformers', width: 96, height: 86, source: transformerTa },

  { category: 'LV Breaker', name: 'LV Circuit Breaker', description: 'Low-voltage feeder circuit breaker', rating: '400/690 V · 1600 A · 50 kA', kbClass: 'ELECTRICAL.LV_BREAKER', groupLabel: 'Protection & Switching', width: 92, height: 64, source: breaker },
  { category: 'AST Breaker', name: 'MV / AST Circuit Breaker', description: 'Medium-voltage AST circuit breaker', rating: '10 kV · 1250 A · 25 kA', kbClass: 'ELECTRICAL.AST_BREAKER', groupLabel: 'Protection & Switching', width: 92, height: 64, source: breakerMv },
  { category: 'Contactor', name: 'Power Contactor', description: 'Electromagnetic power contactor', rating: '400/690 V · 400 A', kbClass: 'ELECTRICAL.CONTACTOR', groupLabel: 'Protection & Switching', width: 92, height: 64, source: contactor },

  { category: 'Charger / Rectifier', name: 'Charger / Rectifier', description: 'AC/DC charger and rectifier', rating: '400 Vac → 220 Vdc · 250 A', kbClass: 'ELECTRICAL.CHARGER_RECTIFIER', groupLabel: 'Conversion', width: 84, height: 68, source: rectifier },
  { category: 'Inverter', name: 'Inverter', description: 'DC/AC static inverter', rating: '220 Vdc → 230 Vac · 20 kVA', kbClass: 'ELECTRICAL.INVERTER', groupLabel: 'Conversion', width: 84, height: 68, source: inverter },
  { category: 'Converter', name: 'DC/DC Converter', description: 'Static DC/DC converter', rating: '220 Vdc → 125 Vdc · 100 A', kbClass: 'ELECTRICAL.CONVERTER', groupLabel: 'Conversion', width: 84, height: 68, source: converter },

  { category: 'Battery', name: 'Battery Bank', description: 'Station DC battery bank', rating: '220 Vdc · 800 Ah', kbClass: 'ELECTRICAL.BATTERY', groupLabel: 'Storage', width: 96, height: 66, source: battery },

  { category: '10 kV Switchboard', name: '10 kV Switchboard', description: 'Medium-voltage distribution switchboard', rating: '10 kV · 2500 A · 31.5 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_10KV', groupLabel: 'Distribution', width: 102, height: 76, source: switchboard('10 kV') },
  { category: '690 V Switchboard', name: '690 V Switchboard / MCC', description: '690 V low-voltage motor distribution', rating: '690 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_690V', groupLabel: 'Distribution', width: 102, height: 76, source: switchboard('690 V') },
  { category: '400 V Switchboard', name: '400 V Switchboard', description: '400 V low-voltage distribution board', rating: '400 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_400V', groupLabel: 'Distribution', width: 102, height: 76, source: switchboard('400 V') },
  { category: '220 V DC Switchboard', name: '220 V DC Switchboard', description: 'Backed DC distribution switchboard', rating: '220 Vdc · 800 A', kbClass: 'ELECTRICAL.SWITCHBOARD_220VDC', groupLabel: 'Distribution', width: 102, height: 76, source: switchboard('220 Vdc', true) },
  { category: '125 V DC Switchboard', name: '125 V DC Switchboard', description: 'Backed DC distribution switchboard', rating: '125 Vdc · 600 A', kbClass: 'ELECTRICAL.SWITCHBOARD_125VDC', groupLabel: 'Distribution', width: 102, height: 76, source: switchboard('125 Vdc', true) }
];
