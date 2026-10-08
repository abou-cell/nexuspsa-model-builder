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

export const ELECTRICAL_SYMBOLS: readonly ElectricalSymbolDefinition[] = [
  { category: 'Unit Generator', name: 'Unit Generator / Alternator', description: 'Main synchronous unit alternator', rating: '24 kV · 1300 MVA · 50 Hz', kbClass: 'ELECTRICAL.UNIT_GENERATOR', groupLabel: 'Sources', width: 100, height: 72, source: './electrical/unit-generator.svg?v=2' },
  { category: 'Main GES / GES-M / GES-DEC-A', name: 'Main GES / GES-M / GES-DEC-A', description: 'Emergency diesel generator set', rating: '10 kV · 6.3 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_MAIN', groupLabel: 'Sources', width: 112, height: 72, source: './electrical/ges.svg?v=2' },
  { category: 'GES DEC-B', name: 'GES DEC-B', description: 'Diversified emergency diesel generator', rating: '400 V · 1.5 MVA · 50 Hz', kbClass: 'ELECTRICAL.GES_DEC_B', groupLabel: 'Sources', width: 112, height: 72, source: './electrical/ges.svg?v=2' },

  { category: 'TS Transformer', name: 'TS Transformer', description: 'Unit / station auxiliary transformer', rating: '24/10 kV · 40 MVA · Δ/Yn', kbClass: 'ELECTRICAL.TRANSFORMER_TS', groupLabel: 'Transformers', width: 96, height: 78, source: './electrical/transformer-ts.svg?v=2' },
  { category: 'TA Transformer', name: 'TA Transformer', description: 'Three-winding / regulating auxiliary transformer', rating: '10/0.69 kV · 3150 kVA', kbClass: 'ELECTRICAL.TRANSFORMER_TA', groupLabel: 'Transformers', width: 110, height: 88, source: './electrical/transformer-ta.svg?v=2' },

  { category: 'LV Breaker', name: 'LV Circuit Breaker', description: 'Low-voltage feeder circuit breaker', rating: '400/690 V · 1600 A · 50 kA', kbClass: 'ELECTRICAL.LV_BREAKER', groupLabel: 'Protection & Switching', width: 92, height: 64, source: './electrical/breaker-lv.svg?v=2' },
  { category: 'AST Breaker', name: 'MV / AST Circuit Breaker', description: 'Medium-voltage AST circuit breaker', rating: '10 kV · 1250 A · 25 kA', kbClass: 'ELECTRICAL.AST_BREAKER', groupLabel: 'Protection & Switching', width: 92, height: 64, source: './electrical/breaker-mv.svg?v=2' },
  { category: 'Contactor', name: 'Power Contactor', description: 'Electromagnetic power contactor', rating: '400/690 V · 400 A', kbClass: 'ELECTRICAL.CONTACTOR', groupLabel: 'Protection & Switching', width: 92, height: 66, source: './electrical/contactor.svg?v=2' },

  { category: 'Charger / Rectifier', name: 'Charger / Rectifier', description: 'AC/DC charger and rectifier', rating: '400 Vac → 220 Vdc · 250 A', kbClass: 'ELECTRICAL.CHARGER_RECTIFIER', groupLabel: 'Conversion', width: 86, height: 64, source: './electrical/rectifier.svg?v=2' },
  { category: 'Inverter', name: 'Inverter', description: 'DC/AC static inverter', rating: '220 Vdc → 230 Vac · 20 kVA', kbClass: 'ELECTRICAL.INVERTER', groupLabel: 'Conversion', width: 86, height: 64, source: './electrical/inverter.svg?v=2' },
  { category: 'Converter', name: 'DC/DC Converter', description: 'Static DC/DC converter', rating: '220 Vdc → 125 Vdc · 100 A', kbClass: 'ELECTRICAL.CONVERTER', groupLabel: 'Conversion', width: 86, height: 64, source: './electrical/converter.svg?v=2' },

  { category: 'Battery', name: 'Battery Bank', description: 'Station DC battery bank', rating: '220 Vdc · 800 Ah', kbClass: 'ELECTRICAL.BATTERY', groupLabel: 'Storage', width: 96, height: 60, source: './electrical/battery.svg?v=2' },

  { category: '10 kV Switchboard', name: '10 kV Switchboard', description: 'Medium-voltage distribution switchboard', rating: '10 kV · 2500 A · 31.5 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_10KV', groupLabel: 'Distribution', width: 104, height: 72, source: './electrical/switchboard.svg?v=2' },
  { category: '690 V Switchboard', name: '690 V Switchboard / MCC', description: '690 V low-voltage motor distribution', rating: '690 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_690V', groupLabel: 'Distribution', width: 104, height: 72, source: './electrical/switchboard.svg?v=2' },
  { category: '400 V Switchboard', name: '400 V Switchboard', description: '400 V low-voltage distribution board', rating: '400 V · 3200 A · 65 kA', kbClass: 'ELECTRICAL.SWITCHBOARD_400V', groupLabel: 'Distribution', width: 104, height: 72, source: './electrical/switchboard.svg?v=2' },
  { category: '220 V DC Switchboard', name: '220 V DC Switchboard', description: 'Backed DC distribution switchboard', rating: '220 Vdc · 800 A', kbClass: 'ELECTRICAL.SWITCHBOARD_220VDC', groupLabel: 'Distribution', width: 104, height: 72, source: './electrical/switchboard.svg?v=2' },
  { category: '125 V DC Switchboard', name: '125 V DC Switchboard', description: 'Backed DC distribution switchboard', rating: '125 Vdc · 600 A', kbClass: 'ELECTRICAL.SWITCHBOARD_125VDC', groupLabel: 'Distribution', width: 104, height: 72, source: './electrical/switchboard.svg?v=2' }
];
