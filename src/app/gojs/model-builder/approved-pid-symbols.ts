import * as go from 'gojs';

export interface ApprovedPidSymbolOptions { palette?: boolean; }
interface PortSpec { id: string; spot: go.Spot; from: boolean; to: boolean; stroke?: string; }
interface PictureSymbolSpec { category: string; source: string; width: number; height: number; rotatable?: boolean; ports: PortSpec[]; }

/**
 * Hydraulic canvas rendering uses fixed GoJS display boxes, matching the
 * Electrical / HVAC / I&C workspaces. The SVG masters remain unchanged; only
 * their presentation size is normalized so all domains have comparable visual
 * weight and readable captions.
 */
export function installApprovedPidSymbols(target: go.Diagram | go.Palette, options: ApprovedPidSymbolOptions = {}): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;

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
    width: palette ? 3 : 5,
    height: palette ? 3 : 5,
    fill: '#ffffff',
    stroke: spec.stroke ?? hydraulic,
    strokeWidth: 0.9,
    opacity: 0,
    portId: spec.id,
    fromLinkable: !palette && spec.from,
    toLinkable: !palette && spec.to,
    fromSpot: spec.spot,
    toSpot: spec.spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  const makeCaption = (): go.TextBlock => $(go.TextBlock, {
    margin: new go.Margin(palette ? 1 : 4, 0, 0, 0),
    font: `${palette ? 6.8 : 8.5}px Inter, sans-serif`,
    stroke: '#172033',
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size(palette ? 112 : 145, NaN),
    wrap: go.Wrap.Fit
  }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay());

  const displaySizeFor = (category: string): go.Size => {
    // Palette sizing remains independent from editor sizing.
    if (palette) {
      switch (category) {
        case 'Motor Pump': return new go.Size(40, 32);
        case 'Check Valve': return new go.Size(34, 20);
        case 'Reheater': return new go.Size(38, 21);
        case 'KD': return new go.Size(34, 17);
        case 'Relief Valve': return new go.Size(24, 34);
        case 'Reservoir': return new go.Size(38, 28);
        case 'Diaphragm': return new go.Size(37, 20);
        case 'Manual Valve': return new go.Size(28, 32);
        case 'Tester': return new go.Size(32, 21);
        case 'Filter': return new go.Size(32, 28);
        case 'FIP': return new go.Size(25, 32);
        case 'Transfer': return new go.Size(38, 20);
        case 'Source': return new go.Size(32, 21);
        case 'Motorized Valve': return new go.Size(30, 34);
        case 'Electrical Supply Panel': return new go.Size(32, 28);
        case 'I&C': return new go.Size(38, 28);
        case 'Maintenance': return new go.Size(30, 30);
        case 'Tank': return new go.Size(28, 37);
        case 'Hydraulic Link':
        case 'Test Link': return new go.Size(42, 14);
        default: return new go.Size(33, 24);
      }
    }

    // Editor hierarchy: major process equipment is intentionally larger.
    // Pump, heat exchanger and basin/tank are the visual anchors of the P&ID.
    switch (category) {
      case 'Motor Pump': return new go.Size(76, 61);
      case 'Check Valve': return new go.Size(56, 34);
      case 'Reheater': return new go.Size(82, 45);
      case 'KD': return new go.Size(56, 28);
      case 'Relief Valve': return new go.Size(38, 56);
      case 'Reservoir': return new go.Size(82, 60);
      case 'Diaphragm': return new go.Size(60, 33);
      case 'Manual Valve': return new go.Size(42, 47);
      case 'Tester': return new go.Size(52, 35);
      case 'Filter': return new go.Size(52, 46);
      case 'FIP': return new go.Size(40, 52);
      case 'Transfer': return new go.Size(64, 32);
      case 'Source': return new go.Size(54, 36);
      case 'Motorized Valve': return new go.Size(45, 50);
      case 'Electrical Supply Panel': return new go.Size(52, 46);
      case 'I&C': return new go.Size(62, 45);
      case 'Maintenance': return new go.Size(44, 44);
      case 'Tank': return new go.Size(60, 66);
      case 'Hydraulic Link':
      case 'Test Link': return new go.Size(68, 11);
      default: return new go.Size(54, 38);
    }
  };

  const addPictureSymbol = (spec: PictureSymbolSpec): void => {
    const pictureSize = displaySizeFor(spec.category);
    const panel = $(go.Panel, 'Spot', {
      name: 'SYMBOL_PANEL',
      width: pictureSize.width,
      height: pictureSize.height
    });
    panel.add($(go.Picture, spec.source, {
      desiredSize: pictureSize,
      maxSize: pictureSize,
      imageStretch: go.ImageStretch.Uniform,
      imageAlignment: go.Spot.Center,
      alignment: go.Spot.Center
    }));
    for (const p of spec.ports) panel.add(makePort(p));

    const node = $(go.Node, 'Vertical', {
      locationObjectName: 'SYMBOL_PANEL',
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
    { category: 'Transfer', source: './pid/transfer.svg', width: 110, height: 55, rotatable: true, ports: [{ id: 'BND', spot: go.Spot.Left, from: true, to: true }] },
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
    { category: 'Maintenance', source: './pid/maintenance.svg?v=4', width: 90, height: 90, ports: [{ id: 'REF', spot: go.Spot.Right, from: true, to: true, stroke: gray }] },
    { category: 'Tank', source: './pid/tank.svg', width: 80, height: 110, ports: [
      { id: 'IN', spot: go.Spot.Left, from: false, to: true },
      { id: 'OUT', spot: go.Spot.Right, from: true, to: false }
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

  if (!palette) {
    const diagram = target as go.Diagram;
    let pidEnhanced = false;

    const processPortFraction = (category: string): number => {
      if (category === 'Motor Pump') return 0.675;
      if (category === 'Motorized Valve') return 0.70;
      return 0.5;
    };

    const stylePipe = (link: go.Link): void => {
      const instrument = link.data?.pidClass === 'instrument';
      link.routing = instrument ? go.Routing.Orthogonal : go.Routing.Normal;
      link.corner = 0;
      link.fromEndSegmentLength = instrument ? 8 : 0;
      link.toEndSegmentLength = instrument ? 8 : 0;
      link.reshapable = true;
      link.adjusting = go.LinkAdjusting.End;
      link.selectionAdorned = false;

      const path = link.path;
      if (path) {
        path.stroke = instrument ? control : hydraulic;
        path.strokeWidth = instrument ? 1.35 : 2.2;
        path.strokeDashArray = instrument ? [5, 3] : null;
      }
      link.invalidateRoute();
    };

    const rebuildLinks = (model: go.GraphLinksModel, links: Array<any>): void => {
      const existing = model.linkDataArray.slice();
      if (existing.length) model.removeLinkDataCollection(existing);
      model.addLinkDataCollection(links);
    };

    const setNodePosition = (model: go.GraphLinksModel, key: number, x: number, y: number): void => {
      const data = model.findNodeDataForKey(key) as any;
      if (data) model.setDataProperty(data, 'loc', `${x} ${y}`);
    };

    const setNodeOnBaseline = (model: go.GraphLinksModel, key: number, x: number, category: string, baseline: number): void => {
      const size = displaySizeFor(category);
      const fraction = processPortFraction(category);
      const panelCenterY = baseline - ((fraction - 0.5) * size.height);
      setNodePosition(model, key, x, panelCenterY);
    };

    const enhancePidSample = (): void => {
      if (pidEnhanced) return;
      pidEnhanced = true;

      const model = diagram.model as go.GraphLinksModel;
      const nodeData = model.nodeDataArray as Array<any>;
      const names = nodeData.map(node => String(node.name ?? ''));
      const isPtr = names.includes('SFP');
      const isRri = names.includes('RRI-SOURCE');
      const isSec = names.includes('ULTIMATE-HS');
      const baseline = 210;

      diagram.startTransaction('align hydraulic P&ID');

      if (isPtr) {
        if (!model.findNodeDataForKey(7)) {
          model.addNodeData({ key: 7, name: 'SFP-RETURN', type: 'Transfer', category: 'Transfer', loc: '830 210', angle: 0 });
        }
        if (!model.findNodeDataForKey(8)) {
          model.addNodeData({ key: 8, name: 'PTR002VB', type: 'Manual Valve', category: 'Manual Valve', loc: '190 210', angle: 0 });
        }

        setNodeOnBaseline(model, 5, 78, 'Reservoir', baseline);
        setNodeOnBaseline(model, 8, 190, 'Manual Valve', baseline);
        setNodeOnBaseline(model, 1, 315, 'Motor Pump', baseline);
        setNodeOnBaseline(model, 2, 455, 'Check Valve', baseline);
        setNodeOnBaseline(model, 3, 565, 'Motorized Valve', baseline);
        setNodeOnBaseline(model, 4, 705, 'Reheater', baseline);
        setNodeOnBaseline(model, 7, 840, 'Transfer', baseline);
        setNodePosition(model, 6, 565, 82);

        rebuildLinks(model, [
          { from: 5, to: 8, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 8, to: 1, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 4, to: 7, fromPort: 'OUT', toPort: 'BND', pidClass: 'pipe' },
          { from: 3, to: 6, fromPort: 'CTRL', toPort: 'PROC', pidClass: 'instrument' }
        ]);
      } else if (isRri) {
        setNodeOnBaseline(model, 5, 78, 'Tank', baseline);
        setNodeOnBaseline(model, 1, 190, 'Manual Valve', baseline);
        setNodeOnBaseline(model, 2, 315, 'Motor Pump', baseline);
        setNodeOnBaseline(model, 7, 450, 'KD', baseline);
        setNodeOnBaseline(model, 3, 560, 'Motorized Valve', baseline);
        setNodeOnBaseline(model, 4, 700, 'Reheater', baseline);
        setNodeOnBaseline(model, 6, 835, 'Transfer', baseline);

        rebuildLinks(model, [
          { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 2, to: 7, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 7, to: 3, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 3, to: 4, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 4, to: 6, fromPort: 'OUT', toPort: 'BND', pidClass: 'pipe' }
        ]);
      } else if (isSec) {
        setNodeOnBaseline(model, 5, 78, 'Reservoir', baseline);
        setNodeOnBaseline(model, 1, 225, 'Motor Pump', baseline);
        setNodeOnBaseline(model, 2, 370, 'Check Valve', baseline);
        setNodeOnBaseline(model, 3, 485, 'Motorized Valve', baseline);
        setNodeOnBaseline(model, 7, 605, 'Filter', baseline);
        setNodeOnBaseline(model, 4, 735, 'Reheater', baseline);
        setNodeOnBaseline(model, 6, 875, 'Transfer', baseline);

        rebuildLinks(model, [
          { from: 5, to: 1, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 1, to: 2, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 2, to: 3, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 3, to: 7, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 7, to: 4, fromPort: 'OUT', toPort: 'IN', pidClass: 'pipe' },
          { from: 4, to: 6, fromPort: 'OUT', toPort: 'BND', pidClass: 'pipe' }
        ]);
      }

      diagram.commitTransaction('align hydraulic P&ID');

      diagram.nodes.each(node => {
        const data = node.data as any;
        if (data?.loc) node.location = go.Point.parse(data.loc);
      });
      diagram.links.each(stylePipe);
      diagram.requestUpdate();
    };

    diagram.addDiagramListener('InitialLayoutCompleted', enhancePidSample);
    diagram.addDiagramListener('LinkDrawn', event => {
      const link = event.subject as go.Link;
      if (link) stylePipe(link);
    });
  }
}
