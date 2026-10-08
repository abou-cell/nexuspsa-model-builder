import * as go from 'gojs';

export interface ApprovedPidSymbolOptions { palette?: boolean; }
interface PortSpec { id: string; spot: go.Spot; from: boolean; to: boolean; stroke?: string; }
interface PictureSymbolSpec { category: string; source: string; width: number; height: number; rotatable?: boolean; ports: PortSpec[]; }

export function installApprovedPidSymbols(target: go.Diagram | go.Palette, options: ApprovedPidSymbolOptions = {}): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;

  // Keep SVG master geometry unchanged. Canvas size remains unchanged while
  // palette symbols are displayed at exactly 50% of their previous size.
  const k = palette ? 0.36 : 0.78;

  const hydraulic = '#1647ff';
  const electrical = '#0f172a';
  const control = '#7c3aed';
  const gray = '#334155';
  const locationBinding = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify);
  const angleBinding = new go.Binding('angle', 'angle').makeTwoWay();

  const setPortsVisible = (node: go.Node | null, visible: boolean): void => {
    if (!node || palette) return;
    node.ports.each(p => { p.opacity = visible ? 1 : 0; });
  };

  const makePort = (spec: PortSpec): go.Shape => $(go.Shape, 'Circle', {
    alignment: spec.spot,
    width: 6 * k,
    height: 6 * k,
    fill: '#ffffff',
    stroke: spec.stroke ?? hydraulic,
    strokeWidth: 1.0,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  const makeCaption = (): go.TextBlock => $(go.TextBlock, {
    margin: new go.Margin(palette ? 2 : 3 * k, 0, 0, 0),
    font: `${palette ? 7.2 : 8.2}px Inter, sans-serif`,
    stroke: '#172033',
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size(palette ? 104 : 126 * k, NaN)
  }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay());

  const addPictureSymbol = (spec: PictureSymbolSpec): void => {
    const panel = $(go.Panel, 'Spot', { width: spec.width * k, height: spec.height * k });
    panel.add($(go.Picture, spec.source, {
      desiredSize: new go.Size(spec.width * k, spec.height * k),
      imageStretch: go.ImageStretch.Uniform,
      imageAlignment: go.Spot.Center
    }));
    for (const p of spec.ports) panel.add(makePort(p));

    const node = $(go.Node, 'Vertical', {
      locationSpot: go.Spot.Center,
      selectionAdorned: true,
      resizable: false,
      rotatable: !palette && (spec.rotatable ?? false),
      cursor: palette ? 'grab' : 'move',
      selectionChanged: (part: go.Part) => setPortsVisible(part as go.Node, part.isSelected),
      mouseEnter: (_e: go.InputEvent, obj: go.GraphObject) => setPortsVisible(obj.part as go.Node, true),
      mouseLeave: (_e: go.InputEvent, obj: go.GraphObject) => {
        const n = obj.part as go.Node;
        setPortsVisible(n, n.isSelected);
      }
    }, locationBinding, angleBinding, panel, makeCaption());

    target.nodeTemplateMap.add(spec.category, node);
  };

  const inlinePorts: PortSpec[] = [
    { id: 'IN', spot: go.Spot.Left, from: false, to: true },
    { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
  ];

  const specs: PictureSymbolSpec[] = [
    {
      category: 'Motor Pump', source: './pid/motor-pump.svg', width: 100, height: 80,
      ports: [
        { id: 'IN', spot: new go.Spot(0, 0.675), from: false, to: true },
        { id: 'OUT', spot: new go.Spot(1, 0.675), from: true, to: false },
        { id: 'PWR', spot: new go.Spot(0.5, 0.01), from: false, to: true, stroke: electrical },
        { id: 'CTRL', spot: new go.Spot(0.74, 0.18), from: false, to: true, stroke: control }
      ]
    },
    { category: 'Check Valve', source: './pid/check-valve.svg', width: 100, height: 60, rotatable: true, ports: inlinePorts },
    { category: 'Reheater', source: './pid/reheater.svg', width: 110, height: 60, rotatable: true, ports: inlinePorts },
    { category: 'KD', source: './pid/kd.svg', width: 100, height: 50, rotatable: true, ports: inlinePorts },
    { category: 'Relief Valve', source: './pid/relief-valve.svg', width: 70, height: 100, rotatable: true, ports: [
      { id: 'IN', spot: new go.Spot(0, 0.52), from: false, to: true },
      { id: 'OUT', spot: new go.Spot(0.56, 1), from: true, to: false }
    ]},
    { category: 'Reservoir', source: './pid/reservoir.svg', width: 110, height: 80, ports: [
      { id: 'IN', spot: go.Spot.Left, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
    ]},
    { category: 'Diaphragm', source: './pid/diaphragm.svg', width: 110, height: 60, rotatable: true, ports: inlinePorts },
    { category: 'Manual Valve', source: './pid/manual-valve.svg', width: 80, height: 90, rotatable: true, ports: inlinePorts },
    { category: 'Tester', source: './pid/tester.svg', width: 90, height: 60, ports: [{ id: 'TEST', spot: go.Spot.Bottom, from: true, to: true, stroke: gray }] },
    { category: 'Filter', source: './pid/filter.svg', width: 90, height: 80, rotatable: true, ports: inlinePorts },
    { category: 'FIP', source: './pid/fip.svg', width: 70, height: 90, rotatable: true, ports: [
      { id: 'PROC', spot: go.Spot.Bottom, from: false, to: true },
      { id: 'SIG', spot: new go.Spot(0.72, 0.63), from: true, to: false, stroke: control }
    ]},
    { category: 'Transfer', source: './pid/transfer.svg', width: 110, height: 55, rotatable: true, ports: [{ id: 'BND', spot: go.Spot.Right, from: true, to: true }] },
    { category: 'Source', source: './pid/source.svg', width: 90, height: 60, ports: [{ id: 'OUT', spot: go.Spot.Right, from: true, to: false }] },
    { category: 'Motorized Valve', source: './pid/motorized-valve.svg', width: 90, height: 100, rotatable: true, ports: [
      { id: 'IN', spot: new go.Spot(0, 0.70), from: false, to: true },
      { id: 'OUT', spot: new go.Spot(1, 0.70), from: true, to: false },
      { id: 'PWR', spot: new go.Spot(0.43, 0), from: false, to: true, stroke: electrical },
      { id: 'CTRL', spot: new go.Spot(0.57, 0), from: false, to: true, stroke: control }
    ]},
    { category: 'Electrical Supply Panel', source: './pid/electrical-supply-panel.svg', width: 90, height: 80, ports: [{ id: 'PWR', spot: go.Spot.Right, from: true, to: false, stroke: electrical }] },
    { category: 'I&C', source: './pid/ic.svg', width: 110, height: 80, ports: [
      { id: 'SIG_IN', spot: go.Spot.Left, from: false, to: true, stroke: control },
      { id: 'SIG_OUT', spot: go.Spot.Right, from: true, to: false, stroke: control },
      { id: 'SENSOR_A', spot: new go.Spot(0.25, 0), from: false, to: true, stroke: control },
      { id: 'SENSOR_B', spot: new go.Spot(0.75, 0), from: false, to: true, stroke: control }
    ]},
    { category: 'Maintenance', source: './pid/maintenance.svg', width: 90, height: 90, ports: [{ id: 'REF', spot: go.Spot.Right, from: true, to: true, stroke: gray }] },
    { category: 'Tank', source: './pid/tank.svg', width: 80, height: 110, ports: [
      { id: 'IN', spot: go.Spot.Top, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Bottom, from: true, to: false }
    ]},
    { category: 'Hydraulic Link', source: './pid/hydraulic-link.svg', width: 120, height: 20, rotatable: true, ports: [
      { id: 'A', spot: go.Spot.Left, from: true, to: true },
      { id: 'B', spot: go.Spot.Right, from: true, to: true }
    ]},
    { category: 'Test Link', source: './pid/test-link.svg', width: 120, height: 20, rotatable: true, ports: [
      { id: 'A', spot: go.Spot.Left, from: true, to: true, stroke: gray },
      { id: 'B', spot: go.Spot.Right, from: true, to: true, stroke: gray }
    ]}
  ];

  specs.forEach(addPictureSymbol);
}
