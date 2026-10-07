import * as go from 'gojs';

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
      { key: 2, name: 'PTR003VB', type: 'Check Valve', loc: '315 150' },
      { key: 3, name: 'PTR004VB', type: 'Motorized Valve', loc: '480 150' },
      { key: 4, name: 'PTR006RF', type: 'Heat Exchanger', loc: '655 150' },
      { key: 5, name: 'SFP', type: 'Pool / Source', loc: '150 325' }
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
      { key: 1, name: 'RRI009VB', type: 'Manual Valve', loc: '125 155' },
      { key: 2, name: 'RRI001PO', type: 'Pump', loc: '285 155' },
      { key: 3, name: 'RRI010VB', type: 'Motorized Valve', loc: '455 155' },
      { key: 4, name: 'RRI001RF', type: 'Heat Exchanger', loc: '635 155' },
      { key: 5, name: 'RRI-SOURCE', type: 'Tank / Pool', loc: '125 325' },
      { key: 6, name: 'PTR-HX', type: 'Boundary', loc: '635 325' }
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
      { key: 1, name: 'SEC001PO', type: 'Pump', loc: '150 150' },
      { key: 2, name: 'SEC003VB', type: 'Check Valve', loc: '315 150' },
      { key: 3, name: 'SEC005VB', type: 'Motorized Valve', loc: '480 150' },
      { key: 4, name: 'SEC001RF', type: 'Heat Exchanger', loc: '655 150' },
      { key: 5, name: 'ULTIMATE-HS', type: 'Boundary', loc: '150 325' },
      { key: 6, name: 'RRI-HX', type: 'Boundary', loc: '655 325' }
    ],
    links: [
      { from: 5, to: 1, fromPort: 'BND', toPort: 'IN' },
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

  const makePort = (
    id: string,
    spot: go.Spot,
    fromLinkable: boolean,
    toLinkable: boolean,
    stroke = sample.accent
  ): go.Shape => $(go.Shape, 'Circle', {
    alignment: spot,
    width: 8,
    height: 8,
    fill: '#ffffff',
    stroke,
    strokeWidth: 1.5,
    portId: id,
    fromLinkable,
    toLinkable,
    fromSpot: spot,
    toSpot: spot,
    cursor: 'crosshair'
  });

  const makeCaption = (typeLabel: string): go.Panel => $(go.Panel, 'Vertical',
    { margin: new go.Margin(5, 0, 0, 0) },
    $(go.TextBlock, {
      font: '600 10px Inter, sans-serif',
      stroke: '#172033',
      editable: true,
      textAlign: 'center',
      maxSize: new go.Size(130, NaN)
    }, new go.Binding('text', 'name').makeTwoWay()),
    $(go.TextBlock, typeLabel, {
      font: '8px Inter, sans-serif',
      stroke: '#718198',
      margin: new go.Margin(2, 0, 0, 0),
      textAlign: 'center'
    })
  );

  const hydraulicNodeBase = {
    locationSpot: go.Spot.Center,
    selectionAdorned: true,
    cursor: 'move'
  };

  diagram.nodeTemplateMap.add('Pump',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 96, height: 64 },
        $(go.Shape, 'LineH', { width: 88, stroke: '#334155', strokeWidth: 2 }),
        $(go.Shape, 'Circle', {
          width: 46,
          height: 46,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2.2
        }),
        $(go.Shape, 'TriangleRight', {
          width: 17,
          height: 16,
          fill: sample.accent,
          stroke: sample.accent,
          alignment: new go.Spot(0.52, 0.5)
        }),
        makePort('IN', new go.Spot(0, 0.5), false, true),
        makePort('OUT', new go.Spot(1, 0.5), true, false),
        makePort('PWR', new go.Spot(0.5, 1), false, true, '#d97706')
      ),
      makeCaption('Pump')
    )
  );

  diagram.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 104, height: 76 },
        $(go.Shape, 'LineH', {
          width: 94,
          stroke: '#334155',
          strokeWidth: 2,
          alignment: new go.Spot(0.5, 0.65)
        }),
        $(go.Shape, 'TriangleRight', {
          width: 25,
          height: 25,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2,
          alignment: new go.Spot(0.39, 0.65)
        }),
        $(go.Shape, 'TriangleLeft', {
          width: 25,
          height: 25,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2,
          alignment: new go.Spot(0.61, 0.65)
        }),
        $(go.Shape, 'LineV', {
          height: 22,
          stroke: '#334155',
          strokeWidth: 1.5,
          alignment: new go.Spot(0.5, 0.42)
        }),
        $(go.Shape, 'RoundedRectangle', {
          width: 28,
          height: 20,
          fill: '#eff6ff',
          stroke: sample.accent,
          strokeWidth: 1.5,
          parameter1: 3,
          alignment: new go.Spot(0.5, 0.14)
        }),
        $(go.TextBlock, 'M', {
          font: '700 9px Inter, sans-serif',
          stroke: sample.accent,
          alignment: new go.Spot(0.5, 0.14)
        }),
        makePort('IN', new go.Spot(0, 0.65), false, true),
        makePort('OUT', new go.Spot(1, 0.65), true, false),
        makePort('PWR', new go.Spot(0.35, 0), false, true, '#d97706'),
        makePort('CTRL', new go.Spot(0.65, 0), false, true, '#7c3aed')
      ),
      makeCaption('Motorized Valve')
    )
  );

  diagram.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 100, height: 72 },
        $(go.Shape, 'LineH', {
          width: 90,
          stroke: '#334155',
          strokeWidth: 2,
          alignment: new go.Spot(0.5, 0.68)
        }),
        $(go.Shape, 'TriangleRight', {
          width: 24,
          height: 24,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2,
          alignment: new go.Spot(0.39, 0.68)
        }),
        $(go.Shape, 'TriangleLeft', {
          width: 24,
          height: 24,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2,
          alignment: new go.Spot(0.61, 0.68)
        }),
        $(go.Shape, 'LineV', {
          height: 24,
          stroke: '#334155',
          strokeWidth: 1.5,
          alignment: new go.Spot(0.5, 0.44)
        }),
        $(go.Shape, 'Ellipse', {
          width: 28,
          height: 9,
          fill: '#ffffff',
          stroke: '#334155',
          strokeWidth: 1.5,
          alignment: new go.Spot(0.5, 0.21)
        }),
        makePort('IN', new go.Spot(0, 0.68), false, true),
        makePort('OUT', new go.Spot(1, 0.68), true, false)
      ),
      makeCaption('Manual Valve')
    )
  );

  diagram.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 96, height: 58 },
        $(go.Shape, 'LineH', { width: 88, stroke: '#334155', strokeWidth: 2 }),
        $(go.Shape, 'TriangleRight', {
          width: 24,
          height: 24,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2,
          alignment: new go.Spot(0.46, 0.5)
        }),
        $(go.Shape, 'LineV', {
          height: 30,
          stroke: sample.accent,
          strokeWidth: 2.2,
          alignment: new go.Spot(0.60, 0.5)
        }),
        makePort('IN', new go.Spot(0, 0.5), false, true),
        makePort('OUT', new go.Spot(1, 0.5), true, false)
      ),
      makeCaption('Check Valve')
    )
  );

  diagram.nodeTemplateMap.add('Heat Exchanger',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 100, height: 72 },
        $(go.Shape, 'LineH', { width: 92, stroke: '#334155', strokeWidth: 2 }),
        $(go.Shape, 'Circle', {
          width: 54,
          height: 54,
          fill: '#ffffff',
          stroke: sample.accent,
          strokeWidth: 2.2
        }),
        $(go.Shape, {
          geometryString: 'M 0 0 L 34 34 M 34 0 L 0 34',
          desiredSize: new go.Size(34, 34),
          stroke: sample.accent,
          strokeWidth: 1.6,
          fill: null
        }),
        makePort('IN', new go.Spot(0, 0.5), false, true),
        makePort('OUT', new go.Spot(1, 0.5), true, false),
        makePort('SUPPLY', new go.Spot(0.5, 0), false, true, '#0891b2'),
        makePort('RETURN', new go.Spot(0.5, 1), true, false, '#0891b2')
      ),
      makeCaption('Heat Exchanger')
    )
  );

  const tankTemplate = (caption: string): go.Node => $(go.Node, 'Vertical', hydraulicNodeBase,
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Panel, 'Spot', { name: 'SYMBOL', width: 100, height: 74 },
      $(go.Shape, {
        geometryString: 'M 14 8 L 14 56 L 78 56 L 78 8',
        desiredSize: new go.Size(64, 48),
        stroke: sample.accent,
        strokeWidth: 2.2,
        fill: null
      }),
      $(go.Shape, 'LineH', {
        width: 50,
        stroke: '#60a5fa',
        strokeWidth: 2,
        alignment: new go.Spot(0.5, 0.54)
      }),
      makePort('IN', new go.Spot(0, 0.5), false, true),
      makePort('OUT', new go.Spot(1, 0.5), true, false)
    ),
    makeCaption(caption)
  );

  diagram.nodeTemplateMap.add('Tank / Pool', tankTemplate('Tank / Pool'));
  diagram.nodeTemplateMap.add('Pool / Source', tankTemplate('Pool / Source'));

  diagram.nodeTemplateMap.add('Boundary',
    $(go.Node, 'Vertical', hydraulicNodeBase,
      new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
      $(go.Panel, 'Spot', { name: 'SYMBOL', width: 92, height: 58 },
        $(go.Shape, 'LineH', { width: 72, stroke: '#334155', strokeWidth: 2 }),
        $(go.Shape, 'Rectangle', {
          width: 7,
          height: 44,
          fill: '#334155',
          stroke: '#334155',
          alignment: new go.Spot(0.5, 0.5)
        }),
        makePort('BND', new go.Spot(0.5, 0.5), true, true, '#334155')
      ),
      makeCaption('Boundary')
    )
  );

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
      corner: 4,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      selectionAdorned: true,
      adjusting: go.LinkAdjusting.End
    },
    $(go.Shape, {
      stroke: domain === 'hydraulic' ? '#475569' : '#64748b',
      strokeWidth: domain === 'hydraulic' ? 2.2 : 1.5
    }),
    $(go.Shape, {
      toArrow: domain === 'hydraulic' ? 'OpenTriangle' : 'Standard',
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
