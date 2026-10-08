import * as go from 'gojs';
import { ELECTRICAL_SYMBOLS, ElectricalSymbolDefinition } from './electrical-symbol-library';

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

/**
 * GoJS rendering uses fixed display boxes rather than multiplying the source
 * SVG dimensions. This keeps every equipment family readable and prevents a
 * large intrinsic SVG/viewBox from producing oversized or clipped nodes.
 */
function displaySizeFor(symbol: ElectricalSymbolDefinition, palette: boolean): go.Size {
  if (palette) {
    if (/TA Transformer/.test(symbol.category)) return new go.Size(38, 31);
    if (/Transformer/.test(symbol.category)) return new go.Size(36, 30);
    if (/GES/.test(symbol.category)) return new go.Size(40, 28);
    if (/Switchboard/.test(symbol.category)) return new go.Size(38, 27);
    return new go.Size(36, 26);
  }

  if (/TA Transformer/.test(symbol.category)) return new go.Size(58, 46);
  if (/Transformer/.test(symbol.category)) return new go.Size(54, 44);
  if (/GES/.test(symbol.category)) return new go.Size(64, 42);
  if (/Unit Generator/.test(symbol.category)) return new go.Size(56, 40);
  if (/Switchboard/.test(symbol.category)) return new go.Size(58, 40);
  if (/Battery/.test(symbol.category)) return new go.Size(52, 32);
  if (/Breaker|Contactor/.test(symbol.category)) return new go.Size(48, 34);
  return new go.Size(48, 36);
}

export function installElectricalSymbols(target: go.Diagram | go.Palette, palette = false): void {
  const $ = go.GraphObject.make;

  const makePort = (spec: PortSpec): go.Shape => $(go.Shape, 'Circle', {
    alignment: spec.spot,
    width: palette ? 3 : 5,
    height: palette ? 3 : 5,
    fill: '#ffffff',
    stroke: '#1647ff',
    strokeWidth: 0.9,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  for (const symbol of ELECTRICAL_SYMBOLS) {
    const pictureSize = displaySizeFor(symbol, palette);
    const panel = $(go.Panel, 'Spot', {
      width: pictureSize.width,
      height: pictureSize.height
    });

    panel.add($(go.Picture, symbol.source, {
      desiredSize: pictureSize,
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
            margin: new go.Margin(palette ? 1 : 3, 0, 0, 0),
            font: `${palette ? 6.8 : 8}px Inter, sans-serif`,
            stroke: '#172033',
            textAlign: 'center',
            editable: !palette,
            maxSize: new go.Size(palette ? 112 : 135, NaN),
            wrap: go.Wrap.Fit
          }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
        $(go.TextBlock, symbol.rating, {
          margin: new go.Margin(1, 0, 0, 0),
          font: `${palette ? 5.8 : 6.5}px Inter, sans-serif`,
          stroke: '#1647ff',
          textAlign: 'center',
          maxSize: new go.Size(palette ? 116 : 145, NaN),
          wrap: go.Wrap.Fit
        })
      )
    );
  }
}
