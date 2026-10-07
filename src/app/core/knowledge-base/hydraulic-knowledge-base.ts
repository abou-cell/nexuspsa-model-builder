export type HydraulicPaletteGroup = 'Equipment' | 'Valves' | 'Instrumentation' | 'Interfaces';
export type HydraulicPortDomain = 'HYDRAULIC' | 'ELECTRICAL' | 'IC';
export type HydraulicPortDirection = 'IN' | 'OUT' | 'BIDIR';

export interface HydraulicPortDefinition {
  id: string;
  domain: HydraulicPortDomain;
  direction: HydraulicPortDirection;
  label: string;
}

export interface HydraulicFailureModeDefinition {
  code: string;
  name: string;
  category: 'Demand' | 'Mission' | 'Position' | 'Leakage' | 'Performance' | 'State' | 'Spurious';
}

export interface HydraulicRuleDefinition {
  id: string;
  name: string;
  condition: string;
  result: string;
}

export interface HydraulicComponentDefinition {
  id: string;
  type: string;
  label: string;
  group: HydraulicPaletteGroup;
  description: string;
  observedIn: readonly ('PTR' | 'RRI' | 'SEC')[];
  nominalWidth: number;
  nominalHeight: number;
  ports: readonly HydraulicPortDefinition[];
  failureModes: readonly HydraulicFailureModeDefinition[];
  rules: readonly HydraulicRuleDefinition[];
}

const hydraulicFlowPorts: readonly HydraulicPortDefinition[] = [
  { id: 'IN', domain: 'HYDRAULIC', direction: 'IN', label: 'Fluid inlet' },
  { id: 'OUT', domain: 'HYDRAULIC', direction: 'OUT', label: 'Fluid outlet' }
];

const passiveRules: readonly HydraulicRuleDefinition[] = [
  { id: 'HYD-R01', name: 'Upstream path dependency', condition: 'Required upstream hydraulic path unavailable', result: 'Propagate loss of hydraulic function' },
  { id: 'HYD-R02', name: 'Downstream path dependency', condition: 'Required downstream path unavailable', result: 'Propagate blocked or unavailable flow path' }
];

export const HYDRAULIC_COMPONENT_CLASSES: readonly HydraulicComponentDefinition[] = [
  {
    id: 'HYDRAULIC.CENTRIFUGAL_PUMP',
    type: 'Pump',
    label: 'Centrifugal Pump',
    group: 'Equipment',
    description: 'Main hydraulic pump with separate motor indication, matching the compact pump/motor assemblies used on PTR, RRI and SEC P&IDs.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 92,
    nominalHeight: 68,
    ports: [...hydraulicFlowPorts, { id: 'PWR', domain: 'ELECTRICAL', direction: 'IN', label: 'Motor power supply' }, { id: 'CTRL', domain: 'IC', direction: 'IN', label: 'Start/stop command' }],
    failureModes: [
      { code: 'FTS', name: 'Fail to start', category: 'Demand' },
      { code: 'FTR', name: 'Fail to run', category: 'Mission' },
      { code: 'LF', name: 'Loss of hydraulic performance', category: 'Performance' },
      { code: 'LEAK', name: 'External leakage', category: 'Leakage' }
    ],
    rules: [
      ...passiveRules,
      { id: 'HYD-P01', name: 'Electrical support', condition: 'Required motor power unavailable', result: 'Pump unavailable' },
      { id: 'HYD-P02', name: 'Control support', condition: 'Required start command unavailable', result: 'Generate fail-to-start branch' }
    ]
  },
  {
    id: 'HYDRAULIC.VERTICAL_PUMP',
    type: 'Vertical Pump',
    label: 'Vertical Pump',
    group: 'Equipment',
    description: 'Vertical pump arrangement for sump, basin or cooling-water intake service.',
    observedIn: ['SEC'],
    nominalWidth: 78,
    nominalHeight: 86,
    ports: [...hydraulicFlowPorts, { id: 'PWR', domain: 'ELECTRICAL', direction: 'IN', label: 'Motor power supply' }, { id: 'CTRL', domain: 'IC', direction: 'IN', label: 'Start/stop command' }],
    failureModes: [
      { code: 'FTS', name: 'Fail to start', category: 'Demand' },
      { code: 'FTR', name: 'Fail to run', category: 'Mission' },
      { code: 'LF', name: 'Loss of hydraulic performance', category: 'Performance' }
    ],
    rules: [
      ...passiveRules,
      { id: 'HYD-VP01', name: 'Electrical support', condition: 'Required motor power unavailable', result: 'Vertical pump unavailable' }
    ]
  },
  {
    id: 'HYDRAULIC.MOTORIZED_VALVE',
    type: 'Motorized Valve',
    label: 'Motorized Valve',
    group: 'Valves',
    description: 'Inline isolation valve with motor actuator shown separately above the valve body.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 88,
    nominalHeight: 62,
    ports: [...hydraulicFlowPorts, { id: 'PWR', domain: 'ELECTRICAL', direction: 'IN', label: 'Actuator power' }, { id: 'CTRL', domain: 'IC', direction: 'IN', label: 'Open/close command' }],
    failureModes: [
      { code: 'FTO', name: 'Fail to open', category: 'Demand' },
      { code: 'FTC', name: 'Fail to close', category: 'Demand' },
      { code: 'SO', name: 'Spurious opening', category: 'Spurious' },
      { code: 'SC', name: 'Spurious closing', category: 'Spurious' },
      { code: 'LEAK', name: 'Internal/external leakage', category: 'Leakage' }
    ],
    rules: [
      ...passiveRules,
      { id: 'HYD-MV01', name: 'Actuator power dependency', condition: 'Actuator power unavailable', result: 'Valve movement unavailable' },
      { id: 'HYD-MV02', name: 'Command dependency', condition: 'Required command unavailable', result: 'Generate actuation failure branch' }
    ]
  },
  {
    id: 'HYDRAULIC.MANUAL_VALVE',
    type: 'Manual Valve',
    label: 'Manual Valve',
    group: 'Valves',
    description: 'Compact inline manual isolation valve using the bow-tie P&ID convention.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 64,
    nominalHeight: 40,
    ports: hydraulicFlowPorts,
    failureModes: [
      { code: 'FO', name: 'Fail open / remains closed', category: 'Position' },
      { code: 'FC', name: 'Fail closed / remains open', category: 'Position' },
      { code: 'LEAK', name: 'Leakage', category: 'Leakage' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.CHECK_VALVE',
    type: 'Check Valve',
    label: 'Check Valve',
    group: 'Valves',
    description: 'Non-return valve represented as a directional closure element on the process line.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 62,
    nominalHeight: 34,
    ports: hydraulicFlowPorts,
    failureModes: [
      { code: 'FTC', name: 'Fail closed', category: 'Position' },
      { code: 'FTO', name: 'Fail open / reverse-flow isolation lost', category: 'Position' },
      { code: 'LEAK', name: 'Seat leakage', category: 'Leakage' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.CONTROL_VALVE',
    type: 'Control Valve',
    label: 'Control Valve',
    group: 'Valves',
    description: 'Modulating valve with control actuator for flow or pressure regulation.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 74,
    nominalHeight: 58,
    ports: [...hydraulicFlowPorts, { id: 'CTRL', domain: 'IC', direction: 'IN', label: 'Control signal' }],
    failureModes: [
      { code: 'FTR', name: 'Fail to regulate', category: 'Performance' },
      { code: 'FO', name: 'Fail open', category: 'Position' },
      { code: 'FC', name: 'Fail closed', category: 'Position' }
    ],
    rules: [...passiveRules, { id: 'HYD-CV01', name: 'Control signal dependency', condition: 'Control signal unavailable', result: 'Control function unavailable' }]
  },
  {
    id: 'HYDRAULIC.RELIEF_VALVE',
    type: 'Relief Valve',
    label: 'Relief / Safety Valve',
    group: 'Valves',
    description: 'Spring-loaded pressure relief element connected to a process line or vessel.',
    observedIn: ['PTR', 'RRI'],
    nominalWidth: 52,
    nominalHeight: 62,
    ports: [{ id: 'IN', domain: 'HYDRAULIC', direction: 'IN', label: 'Protected side' }, { id: 'OUT', domain: 'HYDRAULIC', direction: 'OUT', label: 'Relief discharge' }],
    failureModes: [
      { code: 'FTO', name: 'Fail to open on demand', category: 'Demand' },
      { code: 'FTC', name: 'Fail to reseat', category: 'Position' },
      { code: 'LEAK', name: 'Leakage', category: 'Leakage' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.HEAT_EXCHANGER',
    type: 'Heat Exchanger',
    label: 'Heat Exchanger',
    group: 'Equipment',
    description: 'Rectangular exchanger with internal transfer surface, matching the compact exchanger blocks used throughout PTR/RRI/SEC drawings.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 92,
    nominalHeight: 58,
    ports: [...hydraulicFlowPorts, { id: 'SUPPLY', domain: 'HYDRAULIC', direction: 'IN', label: 'Secondary/support inlet' }, { id: 'RETURN', domain: 'HYDRAULIC', direction: 'OUT', label: 'Secondary/support outlet' }],
    failureModes: [
      { code: 'LOF', name: 'Loss of heat transfer', category: 'Performance' },
      { code: 'BLOCK', name: 'Flow blockage', category: 'Performance' },
      { code: 'LEAK', name: 'Tube/plate leakage', category: 'Leakage' }
    ],
    rules: [...passiveRules, { id: 'HYD-HX01', name: 'Support-side dependency', condition: 'Required cooling support unavailable', result: 'Heat-removal function unavailable' }]
  },
  {
    id: 'HYDRAULIC.FILTER_STRAINER',
    type: 'Filter / Strainer',
    label: 'Filter / Strainer',
    group: 'Equipment',
    description: 'Inline filtration element or vertical strainer/filter vessel used on cooling-water and purification paths.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 58,
    nominalHeight: 72,
    ports: hydraulicFlowPorts,
    failureModes: [
      { code: 'BLOCK', name: 'Clogging / blockage', category: 'Performance' },
      { code: 'BYP', name: 'Loss of filtration / bypass', category: 'Performance' },
      { code: 'LEAK', name: 'Leakage', category: 'Leakage' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.TANK',
    type: 'Tank / Vessel',
    label: 'Tank / Vessel',
    group: 'Equipment',
    description: 'Closed hydraulic vessel or tank connected to process lines.',
    observedIn: ['PTR', 'RRI'],
    nominalWidth: 66,
    nominalHeight: 82,
    ports: [{ id: 'IN', domain: 'HYDRAULIC', direction: 'IN', label: 'Inlet' }, { id: 'OUT', domain: 'HYDRAULIC', direction: 'OUT', label: 'Outlet' }, { id: 'VENT', domain: 'HYDRAULIC', direction: 'OUT', label: 'Vent' }, { id: 'DRAIN', domain: 'HYDRAULIC', direction: 'OUT', label: 'Drain' }],
    failureModes: [
      { code: 'LOW', name: 'Insufficient inventory', category: 'State' },
      { code: 'LEAK', name: 'Leakage / loss of inventory', category: 'Leakage' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.OPEN_POOL',
    type: 'Pool / Source',
    label: 'Pool / Reservoir',
    group: 'Equipment',
    description: 'Open pool, basin or reservoir boundary used for spent-fuel-pool and service-water source/sink representation.',
    observedIn: ['PTR', 'SEC'],
    nominalWidth: 92,
    nominalHeight: 72,
    ports: [{ id: 'IN', domain: 'HYDRAULIC', direction: 'IN', label: 'Return' }, { id: 'OUT', domain: 'HYDRAULIC', direction: 'OUT', label: 'Suction/source' }],
    failureModes: [
      { code: 'LOW', name: 'Low level / insufficient inventory', category: 'State' },
      { code: 'UNAV', name: 'Source unavailable', category: 'State' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.INSTRUMENT',
    type: 'Instrument',
    label: 'Instrument Bubble',
    group: 'Instrumentation',
    description: 'Circular local/remote measurement bubble used for pressure, temperature, flow and level indications.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 42,
    nominalHeight: 42,
    ports: [{ id: 'PROC', domain: 'HYDRAULIC', direction: 'IN', label: 'Process tapping' }, { id: 'SIG', domain: 'IC', direction: 'OUT', label: 'Measurement signal' }],
    failureModes: [
      { code: 'FAIL', name: 'Measurement unavailable', category: 'State' },
      { code: 'BIAS', name: 'Biased / erroneous measurement', category: 'Performance' }
    ],
    rules: [{ id: 'HYD-I01', name: 'Signal propagation', condition: 'Instrument output required', result: 'Expose I&C measurement dependency' }]
  },
  {
    id: 'HYDRAULIC.FLOW_ELEMENT',
    type: 'Flow Element',
    label: 'Flow Element / Meter',
    group: 'Instrumentation',
    description: 'Compact inline flow-measurement primary element with optional signal output.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 56,
    nominalHeight: 34,
    ports: [...hydraulicFlowPorts, { id: 'SIG', domain: 'IC', direction: 'OUT', label: 'Flow signal' }],
    failureModes: [
      { code: 'FAIL', name: 'Flow measurement unavailable', category: 'State' },
      { code: 'BIAS', name: 'Erroneous flow indication', category: 'Performance' }
    ],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.PIPE_JUNCTION',
    type: 'Pipe Junction',
    label: 'Pipe Junction / Tee',
    group: 'Interfaces',
    description: 'Hydraulic tee, branch or merge point.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 28,
    nominalHeight: 28,
    ports: [{ id: 'A', domain: 'HYDRAULIC', direction: 'BIDIR', label: 'Port A' }, { id: 'B', domain: 'HYDRAULIC', direction: 'BIDIR', label: 'Port B' }, { id: 'C', domain: 'HYDRAULIC', direction: 'BIDIR', label: 'Branch C' }],
    failureModes: [],
    rules: passiveRules
  },
  {
    id: 'HYDRAULIC.OFFPAGE_CONNECTOR',
    type: 'Off-page Connector',
    label: 'Off-page Connector',
    group: 'Interfaces',
    description: 'Arrow-shaped continuation to another P&ID page, system or train.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 78,
    nominalHeight: 32,
    ports: [{ id: 'BND', domain: 'HYDRAULIC', direction: 'BIDIR', label: 'External hydraulic connection' }],
    failureModes: [],
    rules: [{ id: 'HYD-B01', name: 'External boundary dependency', condition: 'External connected system unavailable', result: 'Propagate boundary unavailability' }]
  },
  {
    id: 'HYDRAULIC.BOUNDARY_PENETRATION',
    type: 'Boundary',
    label: 'Wall / System Boundary',
    group: 'Interfaces',
    description: 'Physical or functional boundary/penetration used when a line crosses a building or system boundary.',
    observedIn: ['PTR', 'RRI', 'SEC'],
    nominalWidth: 44,
    nominalHeight: 68,
    ports: [{ id: 'BND', domain: 'HYDRAULIC', direction: 'BIDIR', label: 'Boundary connection' }],
    failureModes: [],
    rules: [{ id: 'HYD-B02', name: 'Boundary continuity', condition: 'Connected boundary path unavailable', result: 'Propagate hydraulic isolation' }]
  }
];

export function getHydraulicComponentByType(type: string): HydraulicComponentDefinition | undefined {
  return HYDRAULIC_COMPONENT_CLASSES.find(component => component.type === type);
}

export function getHydraulicComponentById(id: string): HydraulicComponentDefinition | undefined {
  return HYDRAULIC_COMPONENT_CLASSES.find(component => component.id === id);
}
