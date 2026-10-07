import * as go from 'gojs';
import { installHydraulicPidTemplates } from './hydraulic-pid-symbols';

export type ModelDomain = 'hydraulic' | 'electrical' | 'ic' | 'hvac';
export type HydraulicSystemId = 'PTR' | 'RRI' | 'SEC';

interface DomainNode {
  key: number;
  name: string;
  type: string;
  loc: string;
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
    accent: '#2563eb',
    nodes: [
      { key: 1, name: 'PTR001PO', type: 'Pump', loc: '150 150' },
      { key: 2, name: 'PTR003VB', type: 'Check Valve', loc: '305 150' },
      { key: 3, name: 'PTR004VB', type: 'Motorized Valve', loc: '455 150' },
      { key: 4, name: 'PTR006EX', type: 'Heat Exchanger', loc: '625 150' },
      { key: 5, name: 'SFP', type: 'Pool / Source', loc: '150 325' },
      { key: 6, name: 'PTR-FE', type: 'Flow Element', loc: '455 290' }
    ],
    links: [
      { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN' },
      { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN' }
    ]
  },
  RRI: {
    accent: '#2563eb',
    nodes: [
      { key: 1, name: 'RRI009VB', type: 'Manual Valve', loc: '105 155' },
      { key: 2, name: 'RRI001PO', type: 'Pump', loc: '250 155' },
      { key: 3, name: 'RRI010VB', type: 'Motorized Valve', loc: '405 155' },
      { key: 4, name: 'RRI001EX', type: 'Heat Exchanger', loc: '575 155' },
      { key: 5, name: 'RRI-SOURCE', type: 'Tank / Vessel', loc: '105 325' },
      { key: 6, name: 'PTR-HX', type: 'Off-page Connector', loc: '650 325' },
      { key: 7, name: 'RRI-INST', type: 'Instrument', loc: '405 300' }
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
    accent: '#2563eb',
    nodes: [
      { key: 1, name: 'SEC001PO', type: 'Vertical Pump', loc: '145 155' },
      { key: 2, name: 'SEC003VB', type: 'Check Valve', loc: '285 155' },
      { key: 3, name: 'SEC005VB', type: 'Motorized Valve', loc: '430 155' },
      { key: 4, name: 'SEC001EX', type: 'Heat Exchanger', loc: '585 155' },
      { key: 5, name: 'ULTIMATE-HS', type: 'Pool / Source', loc: '145 325' },
      { key: 6, name: 'RRI-HX', type: 'Off-page Connector', loc: '665 325' },
      { key: 7, name: 'SEC-FLT', type: 'Filter / Strainer', loc: '430 320' }
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

const samples: Record<Exclude<ModelDomain, 'hydraulic'>, DomainSample> = {
  electrical: {
    accent: '#d97706',
    nodes: [
      { key: 1, name: 'LLI205JA', type: '6.6 kV Bus', loc: '130 150' },
      { key: 2, name: 'CB-PTR001', type: 'Breaker', loc: '350 150' },
      { key: 3, name: 'PTR001MO', type: 'Motor', loc: '565 150' },
      { key: 4, name: 'DG-A', type: 'Diesel Generator', loc: '130 310' }
    ],
    links: [
      { from: 4, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
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
  hydraulicSystem: HydraulicSystemId = 'PTR'
): go.Diagram {
  const $ = go.GraphObject.make;
  const sample = domain === 'hydraulic' ? hydraulicSamples[hydraulicSystem] : samples[domain];

  const diagram = $(go.Diagram, host, {
    'undoManager.isEnabled': true,
    allowDrop: true,
    padding: 34,
    grid: $(go.Panel, 'Grid',
      $(go.Shape, 'LineH', { stroke: '#edf2f7', strokeWidth: 1 }),
      $(go.Shape, 'LineV', { stroke: '#edf2f7', strokeWidth: 1 })
    ),
    'draggingTool.isGridSnapEnabled': true,
    'resizingTool.isGridSnapEnabled': true,
    'linkingTool.isUnconnectedLinkValid': false,
    'relinkingTool.isUnconnectedLinkValid': false
  });

  if (domain === 'hydraulic') {
    installHydraulicPidTemplates(diagram, { accent: sample.accent });
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

  diagram.linkTemplate = $(go.Link,
    {
      routing: go.Routing.Orthogonal,
      corner: domain === 'hydraulic' ? 0 : 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      selectionAdorned: true,
      adjusting: go.LinkAdjusting.End
    },
    $(go.Shape, {
      stroke: domain === 'hydraulic' ? '#2563eb' : '#64748b',
      strokeWidth: domain === 'hydraulic' ? 1.7 : 1.5
    }),
    $(go.Shape, {
      toArrow: domain === 'hydraulic' ? '' : 'Standard',
      stroke: '#64748b',
      fill: domain === 'hydraulic' ? null : '#64748b',
      scale: 0.72
    })
  );

  const nodeData = sample.nodes.map(node => domain === 'hydraulic'
    ? { ...node, category: node.type }
    : node
  );

  const model = new go.GraphLinksModel(nodeData, sample.links);
  model.linkFromPortIdProperty = 'fromPort';
  model.linkToPortIdProperty = 'toPort';
  diagram.model = model;

  return diagram;
}
