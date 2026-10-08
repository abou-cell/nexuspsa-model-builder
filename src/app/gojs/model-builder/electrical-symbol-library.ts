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
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="${BLUE}" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

const generator = svg('0 0 100 80', `
  <line x1="5" y1="40" x2="20" y2="40"/>
  <circle cx="50" cy="40" r="27"/>
  <text x="50" y="35" fill="${BLUE}" stroke="none" font-size="13" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <path d="M36 49c4-7 8 7 12 0s8 7 12 0s8 7 12 0"/>
  <line x1="77" y1="40" x2="95" y2="40"/>
`);

const breaker = svg('0 0 100 58', `
  <line x1="5" y1="29" x2="30" y2="29"/>
  <circle cx="33" cy="29" r="2.3" fill="${BLUE}"/>
  <circle cx="67" cy="29" r="2.3" fill="${BLUE}"/>
  <line x1="35.5" y1="28" x2="62" y2="13"/>
  <path d="M47 8h12M53 8v5"/>
  <line x1="70" y1="29" x2="95" y2="29"/>
`);

const breakerMv = svg('0 0 100 64', `
  <line x1="5" y1="34" x2="29" y2="34"/>
  <circle cx="32" cy="34" r="2.4" fill="${BLUE}"/>
  <circle cx="68" cy="34" r="2.4" fill="${BLUE}"/>
  <line x1="34.5" y1="33" x2="63" y2="16"/>
  <rect x="45" y="4" width="16" height="8" rx="1"/>
  <text x="53" y="11" fill="${BLUE}" stroke="none" font-size="7" font-family="Arial,sans-serif" text-anchor="middle">52</text>
  <line x1="53" y1="12" x2="53" y2="16"/>
  <line x1="71" y1="34" x2="95" y2="34"/>
`);

const contactor = svg('0 0 100 64', `
  <line x1="5" y1="31" x2="30" y2="31"/>
  <circle cx="33" cy="31" r="2.2" fill="${BLUE}"/>
  <circle cx="67" cy="31" r="2.2" fill="${BLUE}"/>
  <line x1="35" y1="30" x2="61" y2="17"/>
  <rect x="43" y="43" width="20" height="10" rx="5"/>
  <text x="53" y="51" fill="${BLUE}" stroke="none" font-size="7" font-family="Arial,sans-serif" text-anchor="middle">KM</text>
  <line x1="70" y1="31" x2="95" y2="31"/>
`);

const transformerTs = svg('0 0 100 94', `
  <line x1="5" y1="47" x2="17" y2="47"/>
  <circle cx="42" cy="39" r="22"/>
  <circle cx="61" cy="55" r="22"/>
  <path d="M33 44l9-16 9 16z"/>
  <path d="M52 49l9 6 9-6M61 55v12"/>
  <line x1="83" y1="55" x2="95" y2="55"/>
`);

const transformerTa = svg('0 0 100 94', `
  <line x1="5" y1="47" x2="17" y2="47"/>
  <circle cx="42" cy="39" r="22"/>
  <circle cx="61" cy="55" r="22"/>
  <path d="M33 44l9-16 9 16z"/>
  <path d="M52 49l9 6 9-6M61 55v12"/>
  <line x1="83" y1="55" x2="95" y2="55"/>
  <line x1="69" y1="24" x2="84" y2="9"/>
  <path d="M79 9h5v5"/>
`);

const ges = svg('0 0 112 82', `
  <rect x="5" y="22" width="30" height="38" rx="2"/>
  <path d="M10 32h20M10 48h20M14 37v7M26 37v7"/>
  <line x1="35" y1="41" x2="43" y2="41"/>
  <circle cx="70" cy="41" r="25"/>
  <text x="70" y="36" fill="${BLUE}" stroke="none" font-size="11" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">G</text>
  <path d="M58 50c4-7 8 7 12 0s8 7 12 0"/>
  <line x1="95" y1="41" x2="107" y2="41"/>
`);

const rectifier = svg('0 0 100 74', `
  <line x1="4" y1="37" x2="14" y2="37"/>
  <rect x="14" y="8" width="72" height="58" rx="1.5"/>
  <line x1="19" y1="61" x2="81" y2="13"/>
  <path d="M24 24c4-6 8 6 12 0"/>
  <line x1="62" y1="46" x2="77" y2="46"/><line x1="64" y1="52" x2="75" y2="52"/>
  <text x="28" y="17" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <text x="72" y="61" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="86" y1="37" x2="96" y2="37"/>
`);

const inverter = svg('0 0 100 74', `
  <line x1="4" y1="37" x2="14" y2="37"/>
  <rect x="14" y="8" width="72" height="58" rx="1.5"/>
  <line x1="19" y1="61" x2="81" y2="13"/>
  <line x1="24" y1="24" x2="39" y2="24"/><line x1="26" y1="30" x2="37" y2="30"/>
  <path d="M62 50c4-6 8 6 12 0"/>
  <text x="28" y="17" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="72" y="61" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">AC</text>
  <line x1="86" y1="37" x2="96" y2="37"/>
`);

const converter = svg('0 0 100 74', `
  <line x1="4" y1="37" x2="14" y2="37"/>
  <rect x="14" y="8" width="72" height="58" rx="1.5"/>
  <line x1="19" y1="61" x2="81" y2="13"/>
  <line x1="24" y1="24" x2="39" y2="24"/><line x1="26" y1="30" x2="37" y2="30"/>
  <line x1="62" y1="46" x2="77" y2="46"/><line x1="64" y1="52" x2="75" y2="52"/>
  <text x="28" y="17" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <text x="72" y="61" fill="${BLUE}" stroke="none" font-size="8" font-family="Arial,sans-serif" text-anchor="middle">DC</text>
  <line x1="86" y1="37" x2="96" y2="37"/>
`);

const battery = svg('0 0 100 68', `
  <line x1="5" y1="34" x2="22" y2="34"/>
  <line x1="27" y1="17" x2="27" y2="51"/><line x1="35" y1="23" x2="35" y2="45"/>
  <line x1="45" y1="17" x2="45" y2="51"/><line x1="53" y1="23" x2="53" y2="45"/>
  <line x1="63" y1="17" x2="63" y2="51"/><line x1="71" y1="23" x2="71" y2="45"/>
  <line x1="76" y1="34" x2="95" y2="34"/>
  <text x="49" y="64" fill="${BLUE}" stroke="none" font-size="7" font-family="Arial,sans-serif" text-anchor="middle">BATTERY BANK</text>
`);

function switchboard(label: string, dc = false): string {
  return svg('0 0 112 76', `
    <line x1="5" y1="38" x2="16" y2="38"/>
    <rect x="16" y="10" width="80" height="56" rx="1.5"/>
    <line x1="25" y1="24" x2="87" y2="24" stroke-width="4"/>
    <line x1="32" y1="24" x2="32" y2="48"/><line x1="56" y1="24" x2="56" y2="48"/><line x1="80" y1="24" x2="80" y2="48"/>
    <rect x="27" y="34" width="10" height="8"/><rect x="51" y="34" width="10" height="8"/><rect x="75" y="34" width="10" height="8"/>
    <text x="56" y="59" fill="${BLUE}" stroke="none" font-size="9" font-weight="700" font-family="Arial,sans-serif" text-anchor="middle">${label}</text>
    ${dc ? `<text x="88" y="18" fill="${BLUE}" stroke="none" font-size="7" font-family="Arial,sans-serif">DC</text>` : ''}
    <line x1="96" y1="38" x2="107" y2="38"/>
  `);
}

export const ELECTRICAL_SYMBOLS: readonly ElectricalSymbolDefinition[] = [
  { category: 'Unit Generator', name: 'Unit Generator', description: 'Main unit alternator / synchronous generator', rating: '24 kV · 1300 MVA · 50 Hz', kbClass: 'ELECTRICAL.UNIT_GENERATOR', groupLabel: 'Sources', width: 94, height: 72, source: generator },
  { category: 'Main GES / GES-M / GES-DEC-A', name: 'Main GES / GES-M / GES-DEC-A', description: 'Emergency diesel generator set', rating: '10 kV · 6.3 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_MAIN', groupLabel: 'Sources', width: 104, height: 72, source: ges },
  { category: 'GES DEC-B', name: 'GES DEC-B', description: 'Diversified emergency generator set', rating: '400 V · 1.5 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_DEC_B', groupLabel: 'Sources', width: 104, height: 72, source: ges },

  { category: 'LV Breaker', name: 'LV Circuit Breaker', description: 'Low-voltage circuit breaker / feeder protection', rating: '400/690 V · 1600 A · 50 kA', kbClass: 'ELECTRICAL.LV_BREAKER', groupLabel: 'Protection & Switching', width: 90, height: 54, source: breaker },
  { category: 'AST Breaker', name: 'MV / AST Circuit Breaker', description: 'Medium-voltage AST circuit breaker', rating: '10 kV · 1250 A · 25 kA', kbClass: 'ELECTRICAL.AST_BREAKER', groupLabel: 'Protection & Switching', width: 90, height: 58, source: breakerMv },
  { category: 'Contactor', name: 'Power Contactor', description: 'Electromagnetic power contactor for motor/load feeders', rating: '400/690 V · 400 A', kbClass: 'ELECTRICAL.CONTACTOR', groupLabel: 'Protection & Switching', width: 90, height: 58, source: contactor },

  { category: 'TS Transformer', name: 'TS Transformer', description: 'Unit / station auxiliary transformer', rating: '24/10 kV · 40 MVA · Δ/Yn', kbClass: 'ELECTRICAL.TRANSFORMER_TS', groupLabel: 'Transformers', width: 86, height: 82, source: transformerTs },
  { category: 'TA Transformer', name: 'TA Transformer', description: 'Auxiliary distribution transformer with tap regulation', rating: '10/0.69 kV · 3150 kVA · Δ/Yn', kbClass: 'ELECTRICAL.TRANSFORMER_TA', groupLabel: 'Transformers', width: 86, height: 82, source: transformerTa },

  { category: 'Charger / Rectifier', name: 'Charger / Rectifier', description: 'AC/DC battery charger and rectifier', rating: '400 Vac → 220 Vdc · 250 A', kbClass: 'ELECTRICAL.CHARGER_RECTIFIER', groupLabel: 'Conversion', width: 88, height: 66, source: rectifier },
  { category: 'Inverter', name: 'Inverter', description: 'DC/AC static inverter for backed AC supply', rating: '220 Vdc → 230 Vac · 20 kVA', kbClass: 'ELECTRICAL.INVERTER', groupLabel: 'Conversion', width: 88, height: 66, source: inverter },
  { category: 'Converter', name: 'DC/DC Converter', description: 'Static DC/DC converter for diversified DC voltage', rating: '220 Vdc → 125 Vdc · 100 A', kbClass: 'ELECTRICAL.CONVERTER', groupLabel: 'Conversion', width: 88, height: 66, source: converter },

  { category: 'Battery', name: 'Battery Bank', description: 'Station DC battery bank', rating: '220 Vdc · 800 Ah', kbClass: 'ELECTRICAL.BATTERY', groupLabel: 'Storage', width: 96, height: 60, source: battery },

  { category: '10 kV Switchboard', name: '10 kV Switchboard', description: 'Medium-voltage switchgear / distribution board', rating: '10 kV · 2500 A · 31.5 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_10KV', groupLabel: 'Distribution', width: 104, height: 68, source: switchboard('10 kV') },
  { category: '690 V Switchboard', name: '690 V Switchboard', description: 'Low-voltage power / motor control distribution board', rating: '690 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_690V', groupLabel: 'Distribution', width: 104, height: 68, source: switchboard('690 V') },
  { category: '400 V Switchboard', name: '400 V Switchboard', description: 'Low-voltage AC distribution board', rating: '400 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_400V', groupLabel: 'Distribution', width: 104, height: 68, source: switchboard('400 V') },
  { category: '220 V DC Switchboard', name: '220 V DC Switchboard', description: 'Backed DC distribution board', rating: '220 Vdc · 1000 A', kbClass: 'ELECTRICAL.SWITCHBOARD_220VDC', groupLabel: 'Distribution', width: 104, height: 68, source: switchboard('220 V', true) },
  { category: '125 V DC Switchboard', name: '125 V DC Switchboard', description: 'Diversified DC distribution board', rating: '125 Vdc · 800 A', kbClass: 'ELECTRICAL.SWITCHBOARD_125VDC', groupLabel: 'Distribution', width: 104, height: 68, source: switchboard('125 V', true) }
];
