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

function svg(viewBox: string, body: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="${BLUE}" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

// Synchronous alternator / generator: machine circle on the one-line conductor.
const generator = svg('0 0 120 90', `
  <line x1="8" y1="45" x2="29" y2="45"/>
  <circle cx="60" cy="45" r="29"/>
  <text x="60" y="43" fill="${BLUE}" stroke="none" font-size="21" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <text x="60" y="59" fill="${BLUE}" stroke="none" font-size="10" font-family="Arial,sans-serif" text-anchor="middle">3~</text>
  <line x1="89" y1="45" x2="112" y2="45"/>
`);

// Emergency diesel generator: diesel prime mover mechanically coupled to generator.
const ges = svg('0 0 130 90', `
  <line x1="6" y1="45" x2="14" y2="45"/>
  <rect x="14" y="25" width="34" height="40" rx="3"/>
  <path d="M20 34h22M20 55h22M24 39v11M38 39v11"/>
  <text x="31" y="61" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DIESEL</text>
  <line x1="48" y1="45" x2="56" y2="45"/>
  <circle cx="84" cy="45" r="27"/>
  <text x="84" y="43" fill="${BLUE}" stroke="none" font-size="18" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <text x="84" y="57" fill="${BLUE}" stroke="none" font-size="9" font-family="Arial,sans-serif" text-anchor="middle">3~</text>
  <line x1="111" y1="45" x2="124" y2="45"/>
`);

// LV breaker inspired by the user's breaker example: device body + internal moving contact.
const breaker = svg('0 0 120 76', `
  <line x1="8" y1="38" x2="34" y2="38"/>
  <rect x="34" y="18" width="52" height="40" rx="2"/>
  <circle cx="44" cy="46" r="2.3" fill="${BLUE}"/>
  <circle cx="76" cy="30" r="2.3" fill="${BLUE}"/>
  <line x1="46" y1="45" x2="72" y2="32"/>
  <path d="M53 24h14"/>
  <text x="60" y="55" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">Q</text>
  <line x1="86" y1="38" x2="112" y2="38"/>
`);

// MV/AST breaker: ANSI/industrial single-line convention with device number 52.
const breakerMv = svg('0 0 120 76', `
  <line x1="8" y1="38" x2="36" y2="38"/>
  <rect x="36" y="18" width="48" height="40" rx="2"/>
  <line x1="46" y1="48" x2="73" y2="29"/>
  <circle cx="45" cy="49" r="2.2" fill="${BLUE}"/>
  <circle cx="75" cy="28" r="2.2" fill="${BLUE}"/>
  <text x="60" y="55" fill="${BLUE}" stroke="none" font-size="11" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">52</text>
  <line x1="84" y1="38" x2="112" y2="38"/>
`);

// Contactor: power contact plus electromagnetic coil designation KM.
const contactor = svg('0 0 120 80', `
  <line x1="8" y1="32" x2="34" y2="32"/>
  <circle cx="38" cy="32" r="2.3" fill="${BLUE}"/>
  <circle cx="74" cy="32" r="2.3" fill="${BLUE}"/>
  <line x1="40" y1="31" x2="69" y2="18"/>
  <line x1="78" y1="32" x2="112" y2="32"/>
  <line x1="56" y1="37" x2="56" y2="48" stroke-dasharray="3 3"/>
  <rect x="43" y="49" width="26" height="14" rx="7"/>
  <text x="56" y="59" fill="${BLUE}" stroke="none" font-size="8" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">KM</text>
`);

// Two-winding station transformer, close to the user's stacked Δ/Y reference.
const transformerTs = svg('0 0 120 100', `
  <line x1="7" y1="48" x2="20" y2="48"/>
  <circle cx="47" cy="38" r="25"/>
  <circle cx="70" cy="62" r="25"/>
  <path d="M36 43l11-19 11 19z"/>
  <path d="M60 57l10 6 10-6M70 63v13"/>
  <line x1="95" y1="62" x2="113" y2="62"/>
`);

// Three-winding / regulating auxiliary transformer inspired directly by the supplied reference.
const transformerTa = svg('0 0 128 108', `
  <line x1="5" y1="42" x2="22" y2="42"/>
  <circle cx="63" cy="42" r="31"/>
  <path d="M63 24v18M63 42l-15 13M63 42l15 13"/>
  <circle cx="38" cy="78" r="20"/>
  <path d="M29 84l9-16 9 16z"/>
  <circle cx="89" cy="78" r="20"/>
  <path d="M80 84l9-16 9 16z"/>
  <line x1="38" y1="98" x2="38" y2="106"/>
  <line x1="89" y1="98" x2="89" y2="106"/>
  <line x1="86" y1="28" x2="119" y2="15"/>
  <path d="M111 12l8 3-5 7"/>
`);

// AC/DC conversion symbols mirror the square-with-diagonal reference provided by the user.
const rectifier = svg('0 0 110 86', `
  <line x1="5" y1="43" x2="23" y2="43"/>
  <rect x="23" y="12" width="64" height="62" rx="1"/>
  <line x1="27" y1="69" x2="83" y2="17"/>
  <path d="M31 29c4-6 8 6 12 0"/>
  <line x1="66" y1="53" x2="78" y2="53"/><line x1="68" y1="59" x2="76" y2="59"/>
  <text x="36" y="21" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <text x="74" y="69" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="87" y1="43" x2="105" y2="43"/>
`);

const inverter = svg('0 0 110 86', `
  <line x1="5" y1="43" x2="23" y2="43"/>
  <rect x="23" y="12" width="64" height="62" rx="1"/>
  <line x1="27" y1="69" x2="83" y2="17"/>
  <line x1="31" y1="27" x2="43" y2="27"/><line x1="33" y1="33" x2="41" y2="33"/>
  <path d="M66 57c4-6 8 6 12 0"/>
  <text x="36" y="21" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="74" y="69" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <line x1="87" y1="43" x2="105" y2="43"/>
`);

const converter = svg('0 0 110 86', `
  <line x1="5" y1="43" x2="23" y2="43"/>
  <rect x="23" y="12" width="64" height="62" rx="1"/>
  <line x1="27" y1="69" x2="83" y2="17"/>
  <line x1="31" y1="27" x2="43" y2="27"/><line x1="33" y1="33" x2="41" y2="33"/>
  <line x1="66" y1="53" x2="78" y2="53"/><line x1="68" y1="59" x2="76" y2="59"/>
  <text x="36" y="21" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="74" y="69" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="87" y1="43" x2="105" y2="43"/>
`);

// IEC-style battery bank: repeated long/short cell plates, not a consumer battery pictogram.
const battery = svg('0 0 120 74', `
  <line x1="7" y1="37" x2="24" y2="37"/>
  <line x1="28" y1="17" x2="28" y2="57"/><line x1="36" y1="25" x2="36" y2="49"/>
  <line x1="46" y1="17" x2="46" y2="57"/><line x1="54" y1="25" x2="54" y2="49"/>
  <line x1="64" y1="17" x2="64" y2="57"/><line x1="72" y1="25" x2="72" y2="49"/>
  <line x1="82" y1="17" x2="82" y2="57"/><line x1="90" y1="25" x2="90" y2="49"/>
  <line x1="94" y1="37" x2="113" y2="37"/>
  <text x="24" y="14" fill="${BLUE}" stroke="none" font-size="9" font-family="Arial,sans-serif">+</text>
  <text x="92" y="14" fill="${BLUE}" stroke="none" font-size="10" font-family="Arial,sans-serif">−</text>
`);

// Switchboard represented as a real one-line bus section with incomer and protected feeders.
function switchboard(label: string, dc = false): string {
  return svg('0 0 130 96', `
    <rect x="13" y="8" width="104" height="78" rx="2"/>
    <line x1="65" y1="2" x2="65" y2="18"/>
    <rect x="59" y="18" width="12" height="12"/>
    <line x1="62" y1="27" x2="68" y2="21"/>
    <line x1="65" y1="30" x2="65" y2="38"/>
    <line x1="25" y1="38" x2="105" y2="38" stroke-width="5"/>
    <line x1="34" y1="38" x2="34" y2="52"/><rect x="28" y="52" width="12" height="12"/><line x1="31" y1="61" x2="37" y2="55"/><line x1="34" y1="64" x2="34" y2="82"/>
    <line x1="65" y1="38" x2="65" y2="52"/><rect x="59" y="52" width="12" height="12"/><line x1="62" y1="61" x2="68" y2="55"/><line x1="65" y1="64" x2="65" y2="82"/>
    <line x1="96" y1="38" x2="96" y2="52"/><rect x="90" y="52" width="12" height="12"/><line x1="93" y1="61" x2="99" y2="55"/><line x1="96" y1="64" x2="96" y2="82"/>
    <text x="65" y="78" fill="${BLUE}" stroke="none" font-size="10" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">${label}</text>
    ${dc ? `<text x="108" y="20" fill="${BLUE}" stroke="none" font-size="8" font-weight="700" font-family="Arial,sans-serif" text-anchor="end">DC</text>` : ''}
  `);
}

export const ELECTRICAL_SYMBOLS: readonly ElectricalSymbolDefinition[] = [
  { category: 'Unit Generator', name: 'Unit Generator / Alternator', description: 'Main synchronous unit alternator', rating: '24 kV · 1300 MVA · 50 Hz', kbClass: 'ELECTRICAL.UNIT_GENERATOR', groupLabel: 'Sources', width: 92, height: 68, source: generator },
  { category: 'Main GES / GES-M / GES-DEC-A', name: 'Main GES / GES-M / GES-DEC-A', description: 'Emergency diesel generator set', rating: '10 kV · 6.3 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_MAIN', groupLabel: 'Sources', width: 104, height: 70, source: ges },
  { category: 'GES DEC-B', name: 'GES DEC-B', description: 'Diversified emergency diesel generator', rating: '400 V · 1.5 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_DEC_B', groupLabel: 'Sources', width: 104, height: 70, source: ges },

  { category: 'TS Transformer', name: 'TS Transformer', description: 'Unit / station auxiliary transformer', rating: '24/10 kV · 40 MVA · Δ/Yn', kbClass: 'ELECTRICAL.TRANSFORMER_TS', groupLabel: 'Transformers', width: 86, height: 78, source: transformerTs },
  { category: 'TA Transformer', name: 'TA Transformer', description: 'Three-winding auxiliary transformer / tap regulation', rating: '10/0.69 kV · 3150 kVA', kbClass: 'ELECTRICAL.TRANSFORMER_TA', groupLabel: 'Transformers', width: 92, height: 80, source: transformerTa },

  { category: 'LV Breaker', name: 'LV Circuit Breaker', description: 'Low-voltage feeder circuit breaker', rating: '400/690 V · 1600 A · 50 kA', kbClass: 'ELECTRICAL.LV_BREAKER', groupLabel: 'Protection & Switching', width: 88, height: 56, source: breaker },
  { category: 'AST Breaker', name: 'MV / AST Circuit Breaker', description: 'Medium-voltage AST circuit breaker', rating: '10 kV · 1250 A · 25 kA', kbClass: 'ELECTRICAL.AST_BREAKER', groupLabel: 'Protection & Switching', width: 88, height: 56, source: breakerMv },
  { category: 'Contactor', name: 'Power Contactor', description: 'Electromagnetic switching device / motor feeder', rating: '400/690 V · 400 A', kbClass: 'ELECTRICAL.CONTACTOR', groupLabel: 'Protection & Switching', width: 88, height: 58, source: contactor },

  { category: 'Charger / Rectifier', name: 'Charger / Rectifier', description: 'AC/DC battery charger and rectifier', rating: '400 Vac → 220 Vdc · 250 A', kbClass: 'ELECTRICAL.CHARGER_RECTIFIER', groupLabel: 'Conversion', width: 78, height: 62, source: rectifier },
  { category: 'Inverter', name: 'Inverter', description: 'DC/AC static inverter for backed AC supply', rating: '220 Vdc → 230 Vac · 20 kVA', kbClass: 'ELECTRICAL.INVERTER', groupLabel: 'Conversion', width: 78, height: 62, source: inverter },
  { category: 'Converter', name: 'DC/DC Converter', description: 'Static DC/DC converter', rating: '220 Vdc → 125 Vdc · 100 A', kbClass: 'ELECTRICAL.CONVERTER', groupLabel: 'Conversion', width: 78, height: 62, source: converter },

  { category: 'Battery', name: 'Battery Bank', description: 'Station DC battery bank', rating: '220 Vdc · 800 Ah', kbClass: 'ELECTRICAL.BATTERY', groupLabel: 'Storage', width: 94, height: 58, source: battery },

  { category: '10 kV Switchboard', name: '10 kV Switchboard', description: 'MV busbar and protected feeder distribution', rating: '10 kV · 2500 A · 31.5 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_10KV', groupLabel: 'Distribution', width: 96, height: 72, source: switchboard('10 kV') },
  { category: '690 V Switchboard', name: '690 V Switchboard / MCC', description: 'LV motor and auxiliary distribution board', rating: '690 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_690V', groupLabel: 'Distribution', width: 96, height: 72, source: switchboard('690 V') },
  { category: '400 V Switchboard', name: '400 V Switchboard', description: 'LV auxiliary distribution board', rating: '400 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_400V', groupLabel: 'Distribution', width: 96, height: 72, source: switchboard('400 V') },
  { category: '220 V DC Switchboard', name: '220 V DC Switchboard', description: 'Backed DC bus and protected feeder board', rating: '220 Vdc · 800 A', kbClass: 'ELECTRICAL.SWITCHBOARD_220VDC', groupLabel: 'Distribution', width: 96, height: 72, source: switchboard('220 Vdc', true) },
  { category: '125 V DC Switchboard', name: '125 V DC Switchboard', description: 'Backed DC bus and protected feeder board', rating: '125 Vdc · 600 A', kbClass: 'ELECTRICAL.SWITCHBOARD_125VDC', groupLabel: 'Distribution', width: 96, height: 72, source: switchboard('125 Vdc', true) }
];
