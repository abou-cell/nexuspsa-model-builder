import * as go from 'gojs';

export function createModelBuilderDiagram(host: HTMLDivElement): go.Diagram {
  const $ = go.GraphObject.make;

  const diagram = $(go.Diagram, host, {
    'undoManager.isEnabled': true,
    allowDrop: true,
    grid: $(go.Panel, 'Grid',
      $(go.Shape, 'LineH', { stroke: '#edf2f7', strokeWidth: 1 }),
      $(go.Shape, 'LineV', { stroke: '#edf2f7', strokeWidth: 1 })
    ),
    'draggingTool.isGridSnapEnabled': true,
    'resizingTool.isGridSnapEnabled': true
  });

  diagram.nodeTemplate = $(go.Node, 'Auto',
    { locationSpot: go.Spot.Center },
    new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
    $(go.Shape, 'RoundedRectangle', {
      fill: '#ffffff', stroke: '#2563eb', strokeWidth: 1.5,
      minSize: new go.Size(110, 54)
    }),
    $(go.Panel, 'Vertical', { margin: 8 },
      $(go.TextBlock, { font: '600 12px Inter, sans-serif', stroke: '#172033' },
        new go.Binding('text', 'name')),
      $(go.TextBlock, { font: '10px Inter, sans-serif', stroke: '#64748b', margin: new go.Margin(3, 0, 0, 0) },
        new go.Binding('text', 'type'))
    )
  );

  diagram.linkTemplate = $(go.Link,
    { routing: go.Routing.Orthogonal, corner: 6, relinkableFrom: true, relinkableTo: true },
    $(go.Shape, { stroke: '#64748b', strokeWidth: 1.5 }),
    $(go.Shape, { toArrow: 'Standard', stroke: null, fill: '#64748b' })
  );

  diagram.model = new go.GraphLinksModel(
    [
      { key: 1, name: 'PTR001PO', type: 'Pump', loc: '100 120' },
      { key: 2, name: 'PTR004VB', type: 'Valve', loc: '300 120' },
      { key: 3, name: 'RRI HX', type: 'Heat Exchanger', loc: '500 120' }
    ],
    [
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ]
  );

  return diagram;
}
