import * as go from 'gojs';
import { IC_SYMBOLS } from './ic-symbol-library';

interface PortSpec {
  id: string;
  spot: go.Spot;
  from: boolean;
  to: boolean;
}

function portsFor(category: string, groupLabel: string): PortSpec[] {
  if (groupLabel === 'Reliability Structure') {
    if (category === 'Signal Source') return [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }];
    if (category === 'Signal Node') {
      return [
        { id: 'LEFT', spot: go.Spot.Left, from: true, to: true },
        { id: 'RIGHT', spot: go.Spot.Right, from: true, to: true },
        { id: 'TOP', spot: go.Spot.Top, from: true, to: true },
        { id: 'BOTTOM', spot: go.Spot.Bottom, from: true, to: true }
      ];
    }
    if (category === 'Command Target') return [{ id: 'IN', spot: go.Spot.Left, from: false, to: true }];
    if (category === 'Signal Tester') return [{ id: 'TEST', spot: go.Spot.Left, from: true, to: true }];
    if (category === 'IC Tester Link') {
      return [
        { id: 'A', spot: go.Spot.Left, from: true, to: true },
        { id: 'B', spot: go.Spot.Right, from: true, to: true }
      ];
    }
    if (category === 'IC Flag' || category === 'Detected Failure Flag' || category === 'Permissive / Interlock') {
      return [{ id: 'COND', spot: go.Spot.Right, from: true, to: false }];
    }
    if (category === 'IC Boundary') {
      return [
        { id: 'IN', spot: go.Spot.Left, from: true, to: true },
        { id: 'OUT', spot: go.Spot.Right, from: true, to: true }
      ];
    }
    return [
      { id: 'IN', spot: go.Spot.Left, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
    ];
  }
  if (groupLabel === 'Field Sensors & Instruments') {
    return [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }];
  }
  if (groupLabel === 'Final Elements & Actuators') {
    if (category === 'Positioner') {
      return [
        { id: 'IN', spot: go.Spot.Left, from: false, to: true },
        { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
      ];
    }
    return [{ id: 'IN', spot: go.Spot.Left, from: false, to: true }];
  }
  if (groupLabel === 'Power & Support' && category !== 'Maintenance / Test Terminal') {
    return [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }];
  }
  return [
    { id: 'IN', spot: go.Spot.Left, from: false, to: true },
    { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
  ];
}

export function installIcSymbols(target: go.Diagram | go.Palette, palette = false): void {
  const $ = go.GraphObject.make;
  const k = palette ? 0.46 : 0.66;

  const setPortsVisible = (node: go.Node | null, visible: boolean): void => {
    if (!node || palette) return;
    node.ports.each(port => { port.opacity = visible ? 1 : 0; });
  };

  const makePort = (spec: PortSpec): go.Shape => $(go.Shape, 'Circle', {
    alignment: spec.spot,
    width: palette ? 4 : 7,
    height: palette ? 4 : 7,
    fill: '#ffffff',
    stroke: '#2563eb',
    strokeWidth: palette ? 1 : 1.15,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  for (const symbol of IC_SYMBOLS) {
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

    if (symbol.symbolCode) {
      panel.add($(go.TextBlock, symbol.symbolCode, {
        alignment: go.Spot.Center,
        font: `800 ${palette ? 7 : 9}px Inter, sans-serif`,
        stroke: '#0b223d',
        background: 'rgba(255,255,255,0.76)',
        margin: 1
      }));
    }

    for (const port of portsFor(symbol.category, symbol.groupLabel)) panel.add(makePort(port));

    target.nodeTemplateMap.add(symbol.category,
      $(go.Node, 'Vertical', {
          locationSpot: go.Spot.Center,
          selectionAdorned: true,
          resizable: false,
          rotatable: !palette,
          cursor: palette ? 'grab' : 'move',
          selectionChanged: (part: go.Part) => setPortsVisible(part as go.Node, part.isSelected),
          mouseEnter: (_e: go.InputEvent, obj: go.GraphObject) => setPortsVisible(obj.part as go.Node, true),
          mouseLeave: (_e: go.InputEvent, obj: go.GraphObject) => {
            const node = obj.part as go.Node;
            setPortsVisible(node, node.isSelected);
          }
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
            maxSize: new go.Size(palette ? 116 : 155, NaN),
            wrap: go.Wrap.Fit
          }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
        $(go.TextBlock, symbol.rating, {
          margin: new go.Margin(1, 0, 0, 0),
          font: `${palette ? 6.2 : 6.8}px Inter, sans-serif`,
          stroke: '#2563eb',
          textAlign: 'center',
          maxSize: new go.Size(palette ? 122 : 165, NaN),
          wrap: go.Wrap.Fit
        })
      )
    );
  }
}
