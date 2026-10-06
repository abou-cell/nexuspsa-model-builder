import * as go from 'gojs';

export type ModelDomain = 'hydraulic' | 'electrical' | 'ic' | 'hvac';

interface DomainSample {
  nodes: Array<{ key: number; name: string; type: string; loc: string }>;
  links: Array<{ from: number; to: number }>;
  accent: string;
}

const samples: Record<ModelDomain, DomainSample> = {
  hydraulic: {
    accent: '#2563eb',
    nodes: [
      { key: 1, name: 'PTR001PO', type: 'Pump', loc: '120 150' },
      { key: 2, name: 'PTR004VB', type: 'Motorized Valve', loc: '330 150' },
      { key: 3, name: 'RRI001RF', type: 'Heat Exchanger', loc: '555 150' },
      { key: 4, name: 'SFP', type: 'Pool / Source', loc: '120 310' }
    ],
    links: [
      { from: 4, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  },
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

export function createModelBuilderDiagram(host: HTMLDivElement, domain: ModelDomain): go.Diagram {
  const $ = go.GraphObject.make;
  const sample = samples[domain];

  const diagram = $(go.Diagram, host, {
    'undoManager.isEnabled': true,
    allowDrop: true,
    padding: 24,
    grid: $(go.Panel, 'Grid',
      $(go.Shape, 'LineH', { stroke: '#edf2f7', strokeWidth: 1 }),
      $(go.Shape, 'LineV', { stroke: '#edf2f7', strokeWidth: 1 })
    ),
    'draggingTool.isGridSnapEnabled': true,
    'resizingTool.isGridSnapEnabled': true,
    'linkingTool.isUnconnectedLinkValid': false,
    'relinkingTool.isUnconnectedLinkValid': false
  });

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
      corner: 6,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      selectionAdorned: true
    },
    $(go.Shape, { stroke: '#64748b', strokeWidth: 1.5 }),
    $(go.Shape, { toArrow: 'Standard', stroke: null, fill: '#64748b', scale: 0.75 })
  );

  diagram.model = new go.GraphLinksModel(sample.nodes, sample.links);
  return diagram;
}
