export interface ElectricalSymbolDefinition {
  category: string;
  name: string;
  description: string;
  kbClass: string;
  groupLabel: 'Sources' | 'Protection' | 'Transformers' | 'Conversion' | 'Storage' | 'Distribution';
  width: number;
  height: number;
  source: string;
}

const BLUE = '#1647ff';

function svg(viewBox: string, body: string): string {
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="none" stroke="${BLUE}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
}

const generator = svg('0 0 100 74', `
  <line x1="5" y1="37" x2="22" y2="37"/><circle cx="50" cy="37" r="26"/>
  <path d="M34 38c6-14 12 14 18 0s12 14 18 0"/><line x1="76" y1="37" x2="95" y2="37"/>
`);

const breaker = svg('0 0 100 56', `
  <line x1="5" y1="28" x2="31" y2="28"/><circle cx="34" cy="28" r="2.5" fill="${BLUE}"/>
  <circle cx="66" cy="28" r="2.5" fill="${BLUE}"/><line x1="69" y1="28" x2="95" y2="28"/>
  <line x1="36" y1="27" x2="61" y2="13"/><path d="M45 9h12"/>
`);

const breakerAst = svg('0 0 100 62', `
  <line x1="5" y1="34" x2="30" y2="34"/><circle cx="33" cy="34" r="2.5" fill="${BLUE}"/>
  <circle cx="67" cy="34" r="2.5" fill="${BLUE}"/><line x1="70" y1="34" x2="95" y2="34"/>
  <line x1="35" y1="33" x2="61" y2="17"/><rect x="45" y="4" width="14" height="9" rx="1"/>
  <line x1="52" y1="13" x2="52" y2="17"/>
`);

const transformerTs = svg('0 0 100 92', `
  <line x1="6" y1="46" x2="20" y2="46"/><circle cx="42" cy="38" r="21"/><circle cx="60" cy="54" r="21"/>
  <path d="M34 40l8-14 8 14z"/><path d="M53 49l7 5 7-5M60 54v11"/><line x1="80" y1="54" x2="94" y2="54"/>
`);

const transformerTa = svg('0 0 100 92', `
  <line x1="6" y1="46" x2="20" y2="46"/><circle cx="42" cy="42" r="22"/><circle cx="62" cy="50" r="22"/>
  <line x1="83" y1="50" x2="94" y2="50"/><line x1="67" y1="17" x2="82" y2="7"/><path d="M77 7h5v5"/>
`);

const gesMain = svg('0 0 110 76', `
  <rect x="5" y="20" width="30" height="36" rx="3"/><path d="M10 46h20M10 31h8M23 31h7"/>
  <line x1="35" y1="38" x2="43" y2="38"/><circle cx="68" cy="38" r="24"/>
  <path d="M57 39c4-9 8 9 12 0s8 9 12 0"/><line x1="92" y1="38" x2="105" y2="38"/>
`);

const gesDecB = svg('0 0 110 76', `
  <rect x="5" y="20" width="30" height="36" rx="3"/><path d="M10 46h20M10 31h20"/>
  <line x1="35" y1="38" x2="43" y2="38"/><circle cx="68" cy="38" r="24"/>
  <path d="M57 39c4-9 8 9 12 0s8 9 12 0"/><line x1="92" y1="38" x2="105" y2="38"/>
  <path d="M62 57h12"/>
`);

const rectifier = svg('0 0 100 72', `
  <line x1="4" y1="36" x2="15" y2="36"/><rect x="15" y="8" width="70" height="56" rx="2"/>
  <line x1="20" y1="59" x2="80" y2="13"/><path d="M25 23c4-6 8 6 12 0"/>
  <line x1="62" y1="47" x2="76" y2="47"/><line x1="64" y1="53" x2="74" y2="53"/><line x1="85" y1="36" x2="96" y2="36"/>
`);

const battery = svg('0 0 100 66', `
  <line x1="5" y1="33" x2="27" y2="33"/><line x1="31" y1="17" x2="31" y2="49"/><line x1="39" y1="23" x2="39" y2="43"/>
  <line x1="49" y1="17" x2="49" y2="49"/><line x1="57" y1="23" x2="57" y2="43"/>
  <line x1="67" y1="17" x2="67" y2="49"/><line x1="75" y1="23" x2="75" y2="43"/><line x1="75" y1="33" x2="95" y2="33"/>
`);

const inverter = svg('0 0 100 72', `
  <line x1="4" y1="36" x2="15" y2="36"/><rect x="15" y="8" width="70" height="56" rx="2"/>
  <line x1="20" y1="59" x2="80" y2="13"/><line x1="25" y1="25" x2="39" y2="25"/><line x1="27" y1="31" x2="37" y2="31"/>
  <path d="M61 49c4-6 8 6 12 0"/><line x1="85" y1="36" x2="96" y2="36"/>
`);

const converter = svg('0 0 100 72', `
  <line x1="4" y1="36" x2="15" y2="36"/><rect x="15" y="8" width="70" height="56" rx="2"/>
  <path d="M28 26h13M30 32h9M59 26h13M61 32h9"/><path d="M43 45h14M52 41l5 4-5 4"/>
  <line x1="85" y1="36" x2="96" y2="36"/>
`);

function switchboard(label: string): string {
  return svg('0 0 110 68', `
    <line x1="5" y1="34" x2="18" y2="34"/><rect x="18" y="12" width="74" height="44" rx="2"/>
    <line x1="27" y1="25" x2="83" y2="25" stroke-width="4"/><line x1="35" y1="25" x2="35" y2="45"/><line x1="55" y1="25" x2="55" y2="45"/><line x1="75" y1="25" x2="75" y2="45"/>
    <text x="55" y="53" fill="${BLUE}" stroke="none" font-size="9" font-family="Arial, sans-serif" text-anchor="middle">${label}</text>
    <line x1="92" y1="34" x2="105" y2="34"/>
  `);
}

export const ELECTRICAL_SYMBOLS: readonly ElectricalSymbolDefinition[] = [
  { category: 'Unit Generator', name: 'Unit Generator', description: 'Main unit alternator / generator', kbClass: 'ELECTRICAL.UNIT_GENERATOR', groupLabel: 'Sources', width: 92, height: 68, source: generator },
  { category: 'LV Breaker', name: 'LV Breaker', description: 'Low-voltage circuit breaker', kbClass: 'ELECTRICAL.LV_BREAKER', groupLabel: 'Protection', width: 88, height: 52, source: breaker },
  { category: 'TS Transformer', name: 'TS Transformer', description: 'TS auxiliary transformer', kbClass: 'ELECTRICAL.TRANSFORMER_TS', groupLabel: 'Transformers', width: 82, height: 78, source: transformerTs },
  { category: 'AST Breaker', name: 'AST Breaker', description: 'AST supply circuit breaker', kbClass: 'ELECTRICAL.AST_BREAKER', groupLabel: 'Protection', width: 88, height: 56, source: breakerAst },
  { category: 'TA Transformer', name: 'TA Transformer', description: 'TA auxiliary transformer with tap regulation', kbClass: 'ELECTRICAL.TRANSFORMER_TA', groupLabel: 'Transformers', width: 84, height: 80, source: transformerTa },
  { category: 'Main GES / GES-M / GES-DEC-A', name: 'Main GES / GES-M / GES-DEC-A', description: 'Main and diversified emergency generator sets', kbClass: 'ELECTRICAL.GES_MAIN', groupLabel: 'Sources', width: 100, height: 68, source: gesMain },
  { category: 'GES DEC-B', name: 'GES DEC-B', description: 'DEC-B diversified emergency generator set', kbClass: 'ELECTRICAL.GES_DEC_B', groupLabel: 'Sources', width: 100, height: 68, source: gesDecB },
  { category: 'Charger / Rectifier', name: 'Charger / Rectifier', description: 'AC/DC battery charger and rectifier', kbClass: 'ELECTRICAL.CHARGER_RECTIFIER', groupLabel: 'Conversion', width: 86, height: 64, source: rectifier },
  { category: 'Battery', name: 'Battery', description: 'Station DC battery bank', kbClass: 'ELECTRICAL.BATTERY', groupLabel: 'Storage', width: 92, height: 56, source: battery },
  { category: 'Inverter', name: 'Inverter', description: 'DC/AC inverter for backed AC supply', kbClass: 'ELECTRICAL.INVERTER', groupLabel: 'Conversion', width: 86, height: 64, source: inverter },
  { category: 'Converter', name: 'Converter', description: 'Static DC/DC or AC/DC power converter', kbClass: 'ELECTRICAL.CONVERTER', groupLabel: 'Conversion', width: 86, height: 64, source: converter },
  { category: '10 kV Switchboard', name: '10 kV Switchboard', description: 'Medium-voltage 10 kV distribution board', kbClass: 'ELECTRICAL.SWITCHBOARD_10KV', groupLabel: 'Distribution', width: 100, height: 62, source: switchboard('10 kV') },
  { category: '400 V Switchboard', name: '400 V Switchboard', description: 'Low-voltage 400 V distribution board', kbClass: 'ELECTRICAL.SWITCHBOARD_400V', groupLabel: 'Distribution', width: 100, height: 62, source: switchboard('400 V') },
  { category: '690 V Switchboard', name: '690 V Switchboard', description: 'Low-voltage 690 V distribution board', kbClass: 'ELECTRICAL.SWITCHBOARD_690V', groupLabel: 'Distribution', width: 100, height: 62, source: switchboard('690 V') },
  { category: '220 V DC Switchboard', name: '220 V DC Switchboard', description: 'Backed 220 V DC distribution board', kbClass: 'ELECTRICAL.SWITCHBOARD_220VDC', groupLabel: 'Distribution', width: 100, height: 62, source: switchboard('220 Vdc') },
  { category: '125 V DC Switchboard', name: '125 V DC Switchboard', description: 'Backed 125 V DC distribution board', kbClass: 'ELECTRICAL.SWITCHBOARD_125VDC', groupLabel: 'Distribution', width: 100, height: 62, source: switchboard('125 Vdc') }
];
