export interface HvacSymbolDefinition {
  category: string;
  name: string;
  description: string;
  rating: string;
  kbClass: string;
  groupLabel: 'Air Movement' | 'Air Control' | 'Filtration' | 'Thermal Treatment' | 'Air Treatment' | 'Terminal & Boundary';
  width: number;
  height: number;
  source: string;
}

export const HVAC_SYMBOLS: readonly HvacSymbolDefinition[] = [
  { category: 'Supply Fan', name: 'Supply Fan', description: 'Motor-driven supply-air fan', rating: '25 000 m³/h · 1 200 Pa', kbClass: 'HVAC.SUPPLY_FAN', groupLabel: 'Air Movement', width: 78, height: 54, source: './hvac/fan.svg' },
  { category: 'Extract Fan', name: 'Extract / Exhaust Fan', description: 'Motor-driven extract-air fan', rating: '22 000 m³/h · 1 000 Pa', kbClass: 'HVAC.EXTRACT_FAN', groupLabel: 'Air Movement', width: 78, height: 54, source: './hvac/fan.svg' },
  { category: 'Air Handling Unit', name: 'Air Handling Unit (AHU)', description: 'Packaged ventilation and air-treatment unit', rating: '25 000 m³/h', kbClass: 'HVAC.AHU', groupLabel: 'Air Movement', width: 96, height: 54, source: './hvac/ahu.svg' },

  { category: 'Shutoff Damper', name: 'Shutoff Damper', description: 'Motorized isolation / shutoff damper', rating: '1000 × 800 mm', kbClass: 'HVAC.SHUTOFF_DAMPER', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/damper.svg' },
  { category: 'Fire Damper', name: 'Fire Damper', description: 'Fire-rated duct isolation damper', rating: 'EI 120 S · motorized', kbClass: 'HVAC.FIRE_DAMPER', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/fire-damper.svg' },
  { category: 'VAV Box', name: 'VAV Terminal Box', description: 'Variable-air-volume terminal control box', rating: '500–4 000 m³/h', kbClass: 'HVAC.VAV_BOX', groupLabel: 'Air Control', width: 78, height: 54, source: './hvac/vav-box.svg' },

  { category: 'Air Filter', name: 'Air Filter', description: 'General ventilation particulate filter', rating: 'ISO ePM10 60%', kbClass: 'HVAC.AIR_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/filter.svg' },
  { category: 'HEPA Filter', name: 'HEPA Filter', description: 'High-efficiency particulate air filter', rating: 'H13 · ≥99.95% MPPS', kbClass: 'HVAC.HEPA_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/hepa-filter.svg' },
  { category: 'Activated Carbon Filter', name: 'Activated Carbon Filter', description: 'Adsorber / iodine-retention filter bank', rating: '300 mm bed', kbClass: 'HVAC.CARBON_FILTER', groupLabel: 'Filtration', width: 78, height: 54, source: './hvac/charcoal-filter.svg' },

  { category: 'Heating Coil', name: 'Heating Coil', description: 'Hot-water air heating coil', rating: '150 kW · 80/60 °C', kbClass: 'HVAC.HEATING_COIL', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/heating-coil.svg' },
  { category: 'Cooling Coil', name: 'Cooling Coil', description: 'Chilled-water air cooling coil', rating: '120 kW · 7/12 °C', kbClass: 'HVAC.COOLING_COIL', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/cooling-coil.svg' },
  { category: 'Electric Heater', name: 'Electric Air Heater', description: 'Electric duct heater / reheater', rating: '60 kW · 400 Vac', kbClass: 'HVAC.ELECTRIC_HEATER', groupLabel: 'Thermal Treatment', width: 78, height: 54, source: './hvac/electric-heater.svg' },
  { category: 'Heat Recovery', name: 'Heat Recovery Unit', description: 'Rotary / sensible heat recovery device', rating: 'η ≈ 75%', kbClass: 'HVAC.HEAT_RECOVERY', groupLabel: 'Thermal Treatment', width: 82, height: 56, source: './hvac/heat-recovery.svg' },

  { category: 'Humidifier', name: 'Humidifier', description: 'Steam / adiabatic air humidifier', rating: '30 kg/h', kbClass: 'HVAC.HUMIDIFIER', groupLabel: 'Air Treatment', width: 78, height: 54, source: './hvac/humidifier.svg' },

  { category: 'Air Intake', name: 'Outdoor Air Intake / Louver', description: 'Outdoor-air boundary and weather louver', rating: 'Design intake boundary', kbClass: 'HVAC.AIR_INTAKE', groupLabel: 'Terminal & Boundary', width: 72, height: 54, source: './hvac/air-intake.svg' },
  { category: 'Protected Room', name: 'Protected Room / Zone', description: 'Ventilated room or pressure-controlled zone', rating: '22 °C · ΔP controlled', kbClass: 'HVAC.PROTECTED_ROOM', groupLabel: 'Terminal & Boundary', width: 78, height: 54, source: './hvac/protected-room.svg' }
];
