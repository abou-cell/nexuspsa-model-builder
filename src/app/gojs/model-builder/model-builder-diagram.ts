import * as go from 'gojs';
import { installHydraulicPidTemplates } from './hydraulic-pid-symbols';
import { installValidatedHydraulicTemplates } from './validated-hydraulic-symbols';
import { installApprovedPidSymbols } from './approved-pid-symbols';
import { installElectricalSymbols } from './electrical-symbols';

export type ModelDomain = 'hydraulic' | 'electrical' | 'ic' | 'hvac';
export type HydraulicSystemId = 'PTR' | 'RRI' | 'SEC';
export type ElectricalSystemId = 'ELEC-10KV' | 'ELEC-LV' | 'ELEC-DC';

interface DomainNode {
  key: number;
  name: string;
  type: string;
  loc: string;
  angle?: number;
}

interface DomainLink {
  from: number;
  to: number;
  fromPort?: string;
  toPort?: string;
}

interface DomainSample {
  nodes: DomainNode[];
  links: DomainLink[];
  accent: string;
}

const hydraulicSamples: Record<HydraulicSystemId, DomainSample> = {
  PTR: {
    accent: '#1d4ed8',
    nodes: [
      { key: 1, name: 'PTR001PO', type: 'Motor Pump', loc: '150 145' },
      { key: 2, name: 'PTR003VB', type: 'Check Valve', loc: '275 145' },
      { key: 3, name: 'PTR004VB', type: 'Motorized Valve', loc: '395 145' },
      { key: 4, name: 'PTR006EX', type: 'Reheater', loc: '545 145' },
      { key: 5, name: 'SFP', type: 'Reservoir', loc: '150 300' },
      { key: 6, name: 'PTR-FIP', type: 'FIP', loc: '395 270' }
    ],
    links: [
      { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN' },
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' }
    ]
  },
  RRI: {
    accent: '#1d4ed8',
    nodes: [
      { key: 1, name: 'RRI009VB', type: 'Manual Valve', loc: '105 150' },
      { key: 2, name: 'RRI001PO', type: 'Motor Pump', loc: '230 150' },
      { key: 3, name: 'RRI010VB', type: 'Motorized Valve', loc: '355 150' },
      { key: 4, name: 'RRI001EX', type: 'Reheater', loc: '505 150' },
      { key: 5, name: 'RRI-SOURCE', type: 'Tank', loc: '105 300' },
      { key: 6, name: 'PTR', type: 'Transfer', loc: '635 300' },
      { key: 7, name: 'RRI-KD', type: 'KD', loc: '355 275' }
    ],
    links: [
      { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN' },
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' },
      { from: 4, to: 6, fromPort: 'OUT', toPort: 'BND' }
    ]
  },
  SEC: {
    accent: '#1d4ed8',
    nodes: [
      { key: 1, name: 'SEC001PO', type: 'Motor Pump', loc: '145 150' },
      { key: 2, name: 'SEC003VB', type: 'Check Valve', loc: '265 150' },
      { key: 3, name: 'SEC005VB', type: 'Motorized Valve', loc: '385 150' },
      { key: 4, name: 'SEC001EX', type: 'Reheater', loc: '535 150' },
      { key: 5, name: 'ULTIMATE-HS', type: 'Reservoir', loc: '145 305' },
      { key: 6, name: 'RRI', type: 'Transfer', loc: '650 305' },
      { key: 7, name: 'SEC-FLT', type: 'Filter', loc: '385 290' }
    ],
    links: [
      { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN' },
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' },
      { from: 4, to: 6, fromPort: 'OUT', toPort: 'BND' }
    ]
  }
};

const electricalSamples: Record<ElectricalSystemId, DomainSample> = {
  'ELEC-10KV': {
    accent: '#1647ff',
    nodes: [
      { key: 1, name: 'ALT-UNIT', type: 'Unit Generator', loc: '110 145' },
      { key: 2, name: 'CB-LP-01', type: 'LV Breaker', loc: '245 145' },
      { key: 3, name: 'TS-01', type: 'TS Transformer', loc: '380 145' },
      { key: 4, name: 'CB-AST-01', type: 'AST Breaker', loc: '515 145' },
      { key: 5, name: '10KV-A', type: '10 kV Switchboard', loc: '675 145' },
      { key: 6, name: 'GES-A', type: 'Main GES / GES-M / GES-DEC-A', loc: '380 300' }
    ],
    links: [
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' },
      { from: 4, to: 5, fromPort: 'OUT', toPort: 'IN' },
      { from: 6, to: 5, fromPort: 'OUT', toPort: 'IN' }
    ]
  },
  'ELEC-LV': {
    accent: '#1647ff',
    nodes: [
      { key: 1, name: '10KV-B', type: '10 kV Switchboard', loc: '105 145' },
      { key: 2, name: 'TA-01', type: 'TA Transformer', loc: '250 145' },
      { key: 3, name: 'CB-LP-02', type: 'LV Breaker', loc: '390 145' },
      { key: 4, name: '690V-A', type: '690 V Switchboard', loc: '535 145' },
      { key: 5, name: '400V-A', type: '400 V Switchboard', loc: '680 145' },
      { key: 6, name: 'GES-M-A', type: 'Main GES / GES-M / GES-DEC-A', loc: '390 305' },
      { key: 7, name: 'CONV-LV', type: 'Converter', loc: '585 305' }
    ],
    links: [
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' },
      { from: 4, to: 5, fromPort: 'OUT', toPort: 'IN' },
      { from: 6, to: 5, fromPort: 'OUT', toPort: 'IN' },
      { from: 4, to: 7, fromPort: 'FEEDER_A', toPort: 'IN' }
    ]
  },
  'ELEC-DC': {
    accent: '#1647ff',
    nodes: [
      { key: 1, name: '400V-B', type: '400 V Switchboard', loc: '105 145' },
      { key: 2, name: 'CHG-220', type: 'Charger / Rectifier', loc: '245 145' },
      { key: 3, name: 'BAT-220', type: 'Battery', loc: '390 260' },
      { key: 4, name: '220VDC-A', type: '220 V DC Switchboard', loc: '430 145' },
      { key: 5, name: 'INV-01', type: 'Inverter', loc: '600 95' },
      { key: 6, name: 'CONV-125', type: 'Converter', loc: '600 210' },
      { key: 7, name: '125VDC-A', type: '125 V DC Switchboard', loc: '750 210' },
      { key: 8, name: 'GES-DEC-B', type: 'GES DEC-B', loc: '245 320' }
    ],
    links: [
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 4, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'DC_OUT', toPort: 'IN' },
      { from: 4, to: 5, fromPort: 'FEEDER_A', toPort: 'IN' },
      { from: 4, to: 6, fromPort: 'FEEDER_B', toPort: 'IN' },
      { from: 6, to: 7, fromPort: 'OUT', toPort: 'IN' },
      { from: 8, to: 1, fromPort: 'OUT', toPort: 'IN' }
    ]
  }
};

const samples: Record<'ic' | 'hvac', DomainSample> = {
  ic: {
    accent: '#7c3aed',
    nodes: [
      { key: 1, name: 'LS-001', type: 'Sensor', loc: '130 150' },
      { key: 2, name: 'LOGIC-A', type: '2oo3 Logic', loc: '350 150' },
      { key: 3, name: 'ACT-PTR', type: 'Actuation Signal', loc: '565 150' },
      { key: 4, name: 'PS-001', type: 'Power Supply', loc: '350 310' }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 4, to: 2 },
      { from: 2, to: 3 }
    ]
  },
  hvac: {
    accent: '#0891b2',
    nodes: [
      { key: 1, name: 'DVL001ZV', type: 'Damper', loc: '130 150' },
      { key: 2, name: 'DVL001ZV-FAN', type: 'Fan', loc: '350 150' },
      { key: 3, name: 'FILTER-A', type: 'Filter', loc: '565 150' },
      { key: 4, name: 'ROOM-A', type: 'Protected Room', loc: '565 310' }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 }
    ]
  }
};

export function createModelBuilderDiagram(
  host: HTMLDivElement,
  domain: ModelDomain,
  systemId: HydraulicSystemId | ElectricalSystemId = 'PTR'
): go.Diagram {
  const $ = go.GraphObject.make;
  const sample = domain === 'hydraulic'
    ? hydraulicSamples[(systemId as HydraulicSystemId) in hydraulicSamples ? systemId as HydraulicSystemId : 'PTR']
    : domain === 'electrical'
      ? electricalSamples[(systemId as ElectricalSystemId) in electricalSamples ? systemId as ElectricalSystemId : 'ELEC-10KV']
      : samples[domain];

  const diagram = $(go.Diagram, host, {
    'undoManager.isEnabled': true,
    allowDrop: true,
    allowSelect: true,
    allowZoom: true,
    maxSelectionCount: Infinity,
    minScale: 0.25,
    maxScale: 4,
    initialScale: 1,
    padding: 34,
    grid: $(go.Panel, 'Grid',
      { gridCellSize: new go.Size(10, 10), visible: true },
      $(go.Shape, 'LineH', { stroke: '#edf2f7', strokeWidth: 0.8 }),
      $(go.Shape, 'LineV', { stroke: '#edf2f7', strokeWidth: 0.8 })
    ),
    'draggingTool.isGridSnapEnabled': true,
    'resizingTool.isGridSnapEnabled': true,
    'linkingTool.isUnconnectedLinkValid': false,
    'relinkingTool.isUnconnectedLinkValid': false
  });

  diagram.toolManager.mouseWheelBehavior = go.WheelMode.Zoom;
  diagram.toolManager.dragSelectingTool.isEnabled = true;
  diagram.toolManager.dragSelectingTool.isPartialInclusion = true;
  diagram.toolManager.dragSelectingTool.box = $(go.Part,
    { layerName: 'Tool' },
    $(go.Shape, {
      name: 'SHAPE',
      fill: 'rgba(37,99,235,0.08)',
      stroke: '#2563eb',
      strokeWidth: 1
    })
  );

  if (domain === 'hydraulic') {
    installHydraulicPidTemplates(diagram, { accent: sample.accent });
    installValidatedHydraulicTemplates(diagram, { accent: sample.accent });
    installApprovedPidSymbols(diagram);
  } else if (domain === 'electrical') {
    installElectricalSymbols(diagram);
  }

  diagram.nodeTemplate = $(go.Node, 'Auto',
    {
      locationSpot: go.Spot.Center,
      resizable: true,
      selectionAdorned: true,
      fromLinkable: true,
      toLinkable: true,
      cursor: 'move'
    },
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, 'RoundedRectangle', {
      fill: '#ffffff',
      stroke: sample.accent,
      strokeWidth: 1.5,
      minSize: new go.Size(122, 58),
      portId: '',
      fromSpot: go.Spot.AllSides,
      toSpot: go.Spot.AllSides
    }),
    $(go.Panel, 'Vertical', { margin: 8 },
      $(go.TextBlock, {
        font: '600 11px Inter, sans-serif',
        stroke: '#172033',
        editable: true,
        maxSize: new go.Size(150, NaN)
      }, new go.Binding('text', 'name').makeTwoWay()),
      $(go.TextBlock, {
        font: '9px Inter, sans-serif',
        stroke: '#64748b',
        margin: new go.Margin(3, 0, 0, 0)
      }, new go.Binding('text', 'type'))
    )
  );

  const engineeringLine = domain === 'hydraulic' || domain === 'electrical';
  diagram.linkTemplate = $(go.Link,
    {
      routing: go.Routing.Orthogonal,
      corner: engineeringLine ? 0 : 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      selectionAdorned: true,
      adjusting: go.LinkAdjusting.End
    },
    $(go.Shape, {
      stroke: engineeringLine ? '#1647ff' : '#64748b',
      strokeWidth: engineeringLine ? 1.4 : 1.5
    }),
    $(go.Shape, {
      toArrow: engineeringLine ? '' : 'Standard',
      stroke: '#64748b',
      fill: engineeringLine ? null : '#64748b',
      scale: 0.72
    })
  );

  const nodeData = sample.nodes.map(node => engineeringLine
    ? { ...node, category: node.type, angle: node.angle ?? 0 }
    : node
  );

  const model = new go.GraphLinksModel(nodeData, sample.links);
  model.linkFromPortIdProperty = 'fromPort';
  model.linkToPortIdProperty = 'toPort';
  diagram.model = model;

  return diagram;
}
