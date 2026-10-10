import * as go from 'gojs';
import { installIcSymbols } from './ic-symbols';

export type IcSystemId = 'IC-PROCESS' | 'IC-SAFETY' | 'IC-HMI';

interface IcNode {
  key: number;
  name: string;
  type: string;
  loc: string;
  angle?: number;
}

interface IcLink {
  from: number;
  to: number;
  fromPort?: string;
  toPort?: string;
  kind?: 'process' | 'safety' | 'network' | 'power';
}

interface IcSample {
  nodes: IcNode[];
  links: IcLink[];
}

const IC_SAMPLES: Record<IcSystemId, IcSample> = {
  'IC-PROCESS': {
    nodes: [
      { key: 1, name: 'TT-101', type: 'Temperature Sensor', loc: '90 90' },
      { key: 2, name: 'PT-101', type: 'Pressure Sensor', loc: '90 170' },
      { key: 3, name: 'FT-101', type: 'Flow Sensor', loc: '90 250' },
      { key: 4, name: 'LT-101', type: 'Level Sensor', loc: '90 330' },
      { key: 5, name: 'RIO-1', type: 'Remote I/O Panel', loc: '265 210' },
      { key: 6, name: 'PLC-1', type: 'PLC / Control Cabinet', loc: '435 210' },
      { key: 7, name: 'SW-1', type: 'Network Switch', loc: '595 115' },
      { key: 8, name: 'HMI-1', type: 'HMI Terminal', loc: '755 115' },
      { key: 9, name: 'POS-101', type: 'Positioner', loc: '605 285' },
      { key: 10, name: 'MOV-101', type: 'Motorized Valve Actuator', loc: '770 285' },
      { key: 11, name: 'PS24-1', type: '24 VDC Power Supply', loc: '435 360' }
    ],
    links: [
      { from: 1, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 2, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 3, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 4, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 5, to: 6, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 6, to: 7, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 7, to: 8, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 6, to: 9, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 9, to: 10, fromPort: 'OUT', toPort: 'IN', kind: 'process' },
      { from: 11, to: 6, fromPort: 'OUT', toPort: 'IN', kind: 'power' }
    ]
  },
  'IC-SAFETY': {
    nodes: [
      { key: 1, name: 'PT-S1', type: 'Smart Transmitter', loc: '90 120' },
      { key: 2, name: 'LS-S1', type: 'Position / Limit Switch', loc: '90 245' },
      { key: 3, name: 'SIO-1', type: 'I/O Module', loc: '260 180' },
      { key: 4, name: 'SPLC-1', type: 'Safety PLC / Protection Cabinet', loc: '430 180' },
      { key: 5, name: 'REL-1', type: 'Interposing Relay', loc: '600 135' },
      { key: 6, name: 'TRIP-1', type: 'Trip / Shutdown Device', loc: '760 135' },
      { key: 7, name: 'SDV-101', type: 'Solenoid Actuator / Solenoid Valve', loc: '760 280' },
      { key: 8, name: 'UPS-IC', type: 'UPS / Battery-backed Supply', loc: '430 340' },
      { key: 9, name: 'ANN-1', type: 'Alarm / Annunciator Panel', loc: '600 300' }
    ],
    links: [
      { from: 1, to: 3, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 4, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 5, to: 6, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 4, to: 7, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 4, to: 9, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 8, to: 4, fromPort: 'OUT', toPort: 'IN', kind: 'power' }
    ]
  },
  'IC-HMI': {
    nodes: [
      { key: 1, name: 'PLC-A', type: 'PLC / Control Cabinet', loc: '105 200' },
      { key: 2, name: 'SPLC-A', type: 'Safety PLC / Protection Cabinet', loc: '105 330' },
      { key: 3, name: 'SW-A', type: 'Network Switch', loc: '290 200' },
      { key: 4, name: 'GW-A', type: 'Gateway / Protocol Converter', loc: '460 200' },
      { key: 5, name: 'HMI-A', type: 'HMI Terminal', loc: '640 80' },
      { key: 6, name: 'ENG-A', type: 'Engineering Workstation', loc: '640 180' },
      { key: 7, name: 'HIST-A', type: 'Historian / Server', loc: '640 280' },
      { key: 8, name: 'ANN-A', type: 'Alarm / Annunciator Panel', loc: '640 380' },
      { key: 9, name: 'MT-A', type: 'Maintenance / Test Terminal', loc: '820 180' },
      { key: 10, name: 'PDP-IC', type: 'Power Distribution Panel', loc: '290 365' }
    ],
    links: [
      { from: 1, to: 3, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN', kind: 'safety' },
      { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 4, to: 5, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 4, to: 6, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 4, to: 7, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 4, to: 8, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 4, to: 9, fromPort: 'OUT', toPort: 'IN', kind: 'network' },
      { from: 10, to: 3, fromPort: 'OUT', toPort: 'IN', kind: 'power' }
    ]
  }
};

export function createIcDiagram(host: HTMLDivElement, systemId: IcSystemId = 'IC-PROCESS'): go.Diagram {
  const $ = go.GraphObject.make;
  const sample = IC_SAMPLES[systemId] ?? IC_SAMPLES['IC-PROCESS'];

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

  installIcSymbols(diagram);

  diagram.nodeTemplate = $(go.Node, 'Auto',
    {
      locationSpot: go.Spot.Center,
      selectionAdorned: true,
      fromLinkable: true,
      toLinkable: true,
      cursor: 'move'
    },
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, 'RoundedRectangle', {
      fill: '#ffffff',
      stroke: '#2563eb',
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
        editable: true
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
      corner: 2,
      relinkableFrom: true,
      relinkableTo: true,
      reshapable: true,
      selectionAdorned: true,
      adjusting: go.LinkAdjusting.End
    },
    $(go.Shape, { strokeWidth: 1.6 },
      new go.Binding('stroke', 'kind', kind =>
        kind === 'safety' ? '#dc2626' :
        kind === 'power' ? '#64748b' :
        kind === 'network' ? '#2563eb' : '#0f766e')
    ),
    $(go.Shape, {
      toArrow: 'Standard',
      scale: 0.7,
      strokeWidth: 1.3
    },
      new go.Binding('stroke', 'kind', kind =>
        kind === 'safety' ? '#dc2626' :
        kind === 'power' ? '#64748b' :
        kind === 'network' ? '#2563eb' : '#0f766e'),
      new go.Binding('fill', 'kind', kind =>
        kind === 'safety' ? '#dc2626' :
        kind === 'power' ? '#64748b' :
        kind === 'network' ? '#2563eb' : '#0f766e')
    )
  );

  const nodeData = sample.nodes.map(node => ({ ...node, category: node.type, angle: node.angle ?? 0 }));
  const model = new go.GraphLinksModel(nodeData, sample.links);
  model.linkFromPortIdProperty = 'fromPort';
  model.linkToPortIdProperty = 'toPort';
  diagram.model = model;
  return diagram;
}
