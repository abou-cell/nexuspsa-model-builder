import * as go from 'gojs';
import { HVAC_SYMBOLS } from './hvac-symbol-library';

interface PortSpec {
  id: string;
  spot: go.Spot;
  from: boolean;
  to: boolean;
}

function portsFor(category: string): PortSpec[] {
  if (/Air Intake/.test(category)) {
    return [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }];
  }
  if (/Protected Room/.test(category)) {
    return [
      { id: 'IN', spot: go.Spot.Left, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
    ];
  }
  if (/Heat Recovery/.test(category)) {
    return [
      { id: 'SUP_IN', spot: new go.Spot(0, 0.32), from: false, to: true },
      { id: 'SUP_OUT', spot: new go.Spot(1, 0.32), from: true, to: false },
      { id: 'EXT_IN', spot: new go.Spot(1, 0.68), from: false, to: true },
      { id: 'EXT_OUT', spot: new go.Spot(0, 0.68), from: true, to: false }
    ];
  }
  return [
    { id: 'IN', spot: go.Spot.Left, from: false, to: true },
    { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
  ];
}

export function installHvacSymbols(target: go.Diagram | go.Palette, palette = false): void {
  const $ = go.GraphObject.make;
  const k = palette ? 0.46 : 0.72;

  const makePort = (spec: PortSpec): go.Shape => $(go.Shape, 'Circle', {
    alignment: spec.spot,
    width: Math.max(4, 6 * k),
    height: Math.max(4, 6 * k),
    fill: '#ffffff',
    stroke: '#0891b2',
    strokeWidth: 1,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  for (const symbol of HVAC_SYMBOLS) {
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
            font: `${palette ? 7.1 : 8.2}px Inter, sans-serif`,
            stroke: '#172033',
            textAlign: 'center',
            editable: !palette,
            maxSize: new go.Size(palette ? 116 : 150, NaN),
            wrap: go.Wrap.Fit
          }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
        $(go.TextBlock, symbol.rating, {
          margin: new go.Margin(1, 0, 0, 0),
          font: `${palette ? 6.2 : 6.8}px Inter, sans-serif`,
          stroke: '#0891b2',
          textAlign: 'center',
          maxSize: new go.Size(palette ? 122 : 160, NaN),
          wrap: go.Wrap.Fit
        })
      )
    );
  }
}
