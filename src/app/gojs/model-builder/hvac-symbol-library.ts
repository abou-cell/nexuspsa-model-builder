export interface HvacSymbolDefinition {
  category: string;
  name: string;
  description: string;
  rating: string;
  kbClass: string;
  groupLabel: 'Reliability Structure' | 'Air Movement' | 'Air Control' | 'Filtration' | 'Thermal Treatment' | 'Air Treatment' | 'Terminal & Boundary';
  width: number;
  height: number;
  source: string;
  reliabilityRole?: string;
  testCriterion?: string;
}

export const HVAC_SYMBOLS: readonly HvacSymbolDefinition[] = [
  { category: 'Air Source', name: 'Air Source', description: 'Generic source of an available ventilation air path', rating: 'Air boundary', kbClass: 'HVAC.AIR_SOURCE', groupLabel: 'Reliability Structure', width: 92, height: 64, source: './reliability/air-source.svg?v=1', reliabilityRole: 'SOURCE' },
  { category: 'Air Node', name: 'Air Node / Junction', description: 'Topology node for splitting or merging duct paths', rating: 'Duct junction', kbClass: 'HVAC.AIR_NODE', groupLabel: 'Reliability Structure', width: 90, height: 54, source: './reliability/node.svg?v=1', reliabilityRole: 'NODE' },
  { category: 'Zone Consumer', name: 'Zone / Room Consumer', description: 'Terminal zone requiring ventilation or conditioned air', rating: 'Functional zone', kbClass: 'HVAC.ZONE_CONSUMER', groupLabel: 'Reliability Structure', width: 92, height: 64, source: './reliability/zone.svg?v=1', reliabilityRole: 'TARGET' },
  { category: 'Airflow Tester', name: 'Airflow Tester', description: 'Reliability test point for airflow availability', rating: 'Test: airflow available', kbClass: 'HVAC.AIRFLOW_TESTER', groupLabel: 'Reliability Structure', width: 82, height: 68, source: './reliability/tester.svg?v=1', reliabilityRole: 'TESTER', testCriterion: 'AIRFLOW_AVAILABLE' },
  { category: 'Delta-P Tester', name: 'ΔP / Confinement Tester', description: 'Reliability test point for pressure differential or confinement', rating: 'Test: ΔP available', kbClass: 'HVAC.DELTA_P_TESTER', groupLabel: 'Reliability Structure', width: 82, height: 68, source: './reliability/dp-tester.svg?v=1', reliabilityRole: 'TESTER', testCriterion: 'DELTA_P_AVAILABLE' },
  { category: 'HVAC Tester Link', name: 'Tester Link', description: 'Logical connection between an HVAC point and its Tester', rating: 'Reliability relation', kbClass: 'HVAC.TEST_LINK', groupLabel: 'Reliability Structure', width: 96, height: 40, source: './reliability/test-link.svg?v=1', reliabilityRole: 'TEST_LINK' },
  { category: 'HVAC Flag', name: 'Flag / Operating Mode', description: 'Normal, emergency, fire or confinement condition', rating: 'Boolean condition', kbClass: 'HVAC.FLAG', groupLabel: 'Reliability Structure', width: 72, height: 72, source: './reliability/flag.svg?v=1', reliabilityRole: 'FLAG' },
  { category: 'HVAC Boundary', name: 'System Boundary', description: 'Explicit HVAC system or model boundary', rating: 'Boundary', kbClass: 'HVAC.BOUNDARY', groupLabel: 'Reliability Structure', width: 70, height: 88, source: './reliability/boundary.svg?v=1', reliabilityRole: 'BOUNDARY' },
  { category: 'HVAC Off-page', name: 'Off-page Connector', description: 'Continuation to another HVAC drawing or system view', rating: 'Drawing reference', kbClass: 'HVAC.OFF_PAGE', groupLabel: 'Reliability Structure', width: 92, height: 60, source: './reliability/off-page.svg?v=1', reliabilityRole: 'OFF_PAGE' },
  { category: 'Supply Fan', name: 'Supply Fan', description: 'Motor-driven supply-air fan', rating: '25 000 m³/h · 1 200 Pa', kbClass: 'HVAC.SUPPLY_FAN', groupLabel: 'Air Movement', width: 78, height: 54, source: './hvac/fan.svg?v=2' },
  { category: 'Extract Fan', name: 'Extract / Exhaust Fan', description: 'Motor-driven extract-air fan', rating: '22 000 m³/h · 1 000 Pa', kbClass: 'HVAC.EXTRACT_FAN', groupLabel: 'Air Movement', width: 78, height: 54, source: './hvac/fan.svg?v=2' },
  { category: 'Air Handling Unit', name: 'Air Handling Unit (AHU)', description: 'Packaged ventilation and air-treatment unit', rating: '25 000 m³/h', kbClass: 'HVAC.AHU', groupLabel: 'Air Movement', width: 96, height: 54, source: './hvac/ahu.svg?v=2' },

  { category: 'Shutoff Damper', name: 'Shutoff Damper', description: 'Motorized isolation / shutoff damper', rating: '1000 × 800 mm', kbClass: 'HVAC.SHUTOFF_DAMPER', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/damper.svg?v=2' },
  { category: 'Fire Damper', name: 'Fire Damper', description: 'Fire-rated duct isolation damper', rating: 'EI 120 S · motorized', kbClass: 'HVAC.FIRE_DAMPER', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/fire-damper.svg?v=2' },
  { category: 'VAV Box', name: 'VAV Terminal Box', description: 'Variable-air-volume terminal control box', rating: '500–4 000 m³/h', kbClass: 'HVAC.VAV_BOX', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/vav-box.svg?v=2' },

  { category: 'Air Filter', name: 'Air Filter', description: 'General ventilation particulate filter', rating: 'ISO ePM10 60%', kbClass: 'HVAC.AIR_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/filter.svg?v=2' },
  { category: 'HEPA Filter', name: 'HEPA Filter', description: 'High-efficiency particulate air filter', rating: 'H13 · ≥99.95% MPPS', kbClass: 'HVAC.HEPA_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/hepa-filter.svg?v=2' },
  { category: 'Activated Carbon Filter', name: 'Activated Carbon Filter', description: 'Adsorber / iodine-retention filter bank', rating: '300 mm bed', kbClass: 'HVAC.CARBON_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/charcoal-filter.svg?v=2' },

  { category: 'Heating Coil', name: 'Heating Coil', description: 'Hot-water air heating coil', rating: '150 kW · 80/60 °C', kbClass: 'HVAC.HEATING_COIL', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/heating-coil.svg?v=2' },
  { category: 'Cooling Coil', name: 'Cooling Coil', description: 'Chilled-water air cooling coil', rating: '120 kW · 7/12 °C', kbClass: 'HVAC.COOLING_COIL', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/cooling-coil.svg?v=2' },
  { category: 'Electric Heater', name: 'Electric Air Heater', description: 'Electric duct heater / reheater', rating: '60 kW · 400 Vac', kbClass: 'HVAC.ELECTRIC_HEATER', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/electric-heater.svg?v=2' },
  { category: 'Heat Recovery', name: 'Heat Recovery Unit', description: 'Rotary / sensible heat recovery device', rating: 'η ≈ 75%', kbClass: 'HVAC.HEAT_RECOVERY', groupLabel: 'Thermal Treatment', width: 82, height: 56, source: './hvac/heat-recovery.svg?v=2' },

  { category: 'Humidifier', name: 'Humidifier', description: 'Steam / adiabatic air humidifier', rating: '30 kg/h', kbClass: 'HVAC.HUMIDIFIER', groupLabel: 'Air Treatment', width: 78, height: 54, source: './hvac/humidifier.svg?v=2' },

  { category: 'Air Intake', name: 'Outdoor Air Intake / Louver', description: 'Outdoor-air boundary and weather louver', rating: 'Design intake boundary', kbClass: 'HVAC.AIR_INTAKE', groupLabel: 'Terminal & Boundary', width: 72, height: 54, source: './hvac/air-intake.svg?v=2' },
  { category: 'Protected Room', name: 'Protected Room / Zone', description: 'Ventilated room or pressure-controlled zone', rating: '22 °C · ΔP controlled', kbClass: 'HVAC.PROTECTED_ROOM', groupLabel: 'Terminal & Boundary', width: 78, height: 54, source: './hvac/protected-room.svg?v=2' }
];