import * as go from 'gojs';
import { ELECTRICAL_SYMBOLS } from './electrical-symbol-library';

interface PortSpec {
  id: string;
  spot: go.Spot;
  from: boolean;
  to: boolean;
}

function portsFor(category: string): PortSpec[] {
  if (/Generator|GES/.test(category)) {
    return [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }];
  }
  if (/Battery/.test(category)) {
    return [
      { id: 'DC_IN', spot: go.Spot.Left, from: false, to: true },
      { id: 'DC_OUT', spot: go.Spot.Right, from: true, to: false }
    ];
  }
  if (/Switchboard/.test(category)) {
    return [
      { id: 'IN', spot: go.Spot.Top, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Right, from: true, to: false },
      { id: 'FEEDER_A', spot: new go.Spot(0.35, 1), from: true, to: false },
      { id: 'FEEDER_B', spot: new go.Spot(0.65, 1), from: true, to: false }
    ];
  }
  return [
    { id: 'IN', spot: go.Spot.Left, from: false, to: true },
    { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
  ];
}

export function installElectricalSymbols(target: go.Diagram | go.Palette, palette = false): void {
  const $ = go.GraphObject.make;
  // Restored to the readable pre-reduction GoJS scale.
  // Angular controls the available workspace; GoJS keeps engineering symbols legible.
  const k = palette ? 0.42 : 0.68;

  const makePort = (spec: PortSpec): go.Shape => $(go.Shape, 'Circle', {
    alignment: spec.spot,
    width: Math.max(4, 6 * k),
    height: Math.max(4, 6 * k),
    fill: '#ffffff',
    stroke: '#1647ff',
    strokeWidth: 1,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  for (const symbol of ELECTRICAL_SYMBOLS) {
    const panel = $(go.Panel, 'Spot', {
      width: symbol.width * k,
      height: symbol.height * k
    });

    panel.add($(go.Picture, symbol.source, {
      desiredSize: new go.Size(symbol.width * k, symbol.height * k),
      imageStretch: go.ImageStretch.Uniform,
      imageAlignment: go.Spot.Center,
      alignment: go.Spot.Center
    }));

    for (const port of portsFor(symbol.category)) panel.add(makePort(port));

    target.nodeTemplateMap.add(symbol.category,
      $(go.Node, 'Vertical', {
          locationSpot: go.Spot.Center,
          selectionAdorned: true,
          resizable: false,
          rotatable: !palette,
          cursor: palette ? 'grab' : 'move'
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        new go.Binding('angle', 'angle').makeTwoWay(),
        panel,
        $(go.TextBlock, {
            margin: new go.Margin(palette ? 2 : 4, 0, 0, 0),
            font: `${palette ? 7.2 : 8.2}px Inter, sans-serif`,
            stroke: '#172033',
            textAlign: 'center',
            editable: !palette,
            maxSize: new go.Size(palette ? 115 : 150, NaN),
            wrap: go.Wrap.Fit
          }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
        $(go.TextBlock, symbol.rating, {
          margin: new go.Margin(2, 0, 0, 0),
          font: `${palette ? 6.4 : 7}px Inter, sans-serif`,
          stroke: '#1647ff',
          textAlign: 'center',
          maxSize: new go.Size(palette ? 120 : 165, NaN),
          wrap: go.Wrap.Fit
        })
      )
    );
  }
}
