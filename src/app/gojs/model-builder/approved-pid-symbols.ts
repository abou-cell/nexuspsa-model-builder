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
    margin: new go.Margin(palette ? 1 : 3, 0, 0, 0),
    font: `${palette ? 6.8 : 8}px Inter, sans-serif`,
    stroke: '#172033',
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size(palette ? 112 : 135, NaN),
    wrap: go.Wrap.Fit
  }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay());

  const displaySizeFor = (category: string): go.Size => {
    let size: go.Size;
    switch (category) {
      case 'Motor Pump': size = new go.Size(60, 48); break;
      case 'Check Valve': size = new go.Size(52, 31); break;
      case 'Reheater': size = new go.Size(58, 32); break;
      case 'KD': size = new go.Size(52, 26); break;
      case 'Relief Valve': size = new go.Size(36, 52); break;
      case 'Reservoir': size = new go.Size(58, 42); break;
      case 'Diaphragm': size = new go.Size(56, 31); break;
      case 'Manual Valve': size = new go.Size(42, 48); break;
      case 'Tester': size = new go.Size(48, 32); break;
      case 'Filter': size = new go.Size(48, 42); break;
      case 'FIP': size = new go.Size(38, 48); break;
      case 'Transfer': size = new go.Size(58, 30); break;
      case 'Source': size = new go.Size(48, 32); break;
      case 'Motorized Valve': size = new go.Size(46, 52); break;
      case 'Electrical Supply Panel': size = new go.Size(48, 42); break;
      case 'I&C': size = new go.Size(58, 42); break;
      case 'Maintenance': size = new go.Size(46, 46); break;
      case 'Tank': size = new go.Size(42, 56); break;
      case 'Hydraulic Link':
      case 'Test Link': size = new go.Size(64, 11); break;
      default: size = new go.Size(50, 36);
    }
    if (!palette) return size;
    return new go.Size(Math.max(24, Math.round(size.width * 0.66)), Math.max(14, Math.round(size.height * 0.66)));
  };

  const addPictureSymbol = (spec: PictureSymbolSpec): void => {
    const pictureSize = displaySizeFor(spec.category);
    const panel = $(go.Panel, 'Spot', { width: pictureSize.width, height: pictureSize.height });
    panel.add($(go.Picture, spec.source, {
      desiredSize: pictureSize,
      maxSize: pictureSize,
      imageStretch: go.ImageStretch.Uniform,
      imageAlignment: go.Spot.Center,
      alignment: go.Spot.Center
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

    const stylePipe = (link: go.Link): void => {
      const instrument = link.data?.pidClass === 'instrument';
      link.routing = go.Routing.Orthogonal;
      link.corner = 0;
      link.fromEndSegmentLength = instrument ? 8 : 12;
      link.toEndSegmentLength = instrument ? 8 : 12;
      link.reshapable = true;
      link.adjusting = go.LinkAdjusting.End;
      link.selectionAdorned = false;

      const path = link.path;
      if (path) {
        path.stroke = instrument ? control : hydraulic;
        path.strokeWidth = instrument ? 1.35 : 2.2;
        path.strokeDashArray = instrument ? [5, 3] : null;
      }
    };

    const ensureLink = (
      model: go.GraphLinksModel,
      from: number,
      to: number,
      fromPort: string,
      toPort: string,
      pidClass?: string
    ): void => {
      const existing = (model.linkDataArray as Array<any>).some(link =>
        link.from === from && link.to === to && link.fromPort === fromPort && link.toPort === toPort
      );
      if (!existing) model.addLinkData({ from, to, fromPort, toPort, ...(pidClass ? { pidClass } : {}) });
    };

    const removeDirectLink = (model: go.GraphLinksModel, from: number, to: number): void => {
      const match = (model.linkDataArray as Array<any>).find(link => link.from === from && link.to === to);
      if (match) model.removeLinkData(match);
    };

    const setNodePosition = (model: go.GraphLinksModel, key: number, x: number, y: number): void => {
      const data = model.findNodeDataForKey(key) as any;
      if (data) model.setDataProperty(data, 'loc', `${x} ${y}`);
    };

    const enhancePidSample = (): void => {
      if (pidEnhanced) return;
      pidEnhanced = true;

      const model = diagram.model as go.GraphLinksModel;
      const nodeData = model.nodeDataArray as Array<any>;
      const names = nodeData.map(node => String(node.name ?? ''));
      const isPtr = names.some(name => /^PTR/i.test(name)) || names.includes('SFP');
      const isRri = names.some(name => /^RRI/i.test(name));
      const isSec = names.some(name => /^SEC/i.test(name)) || names.includes('ULTIMATE-HS');

      diagram.startTransaction('structure hydraulic P&ID');

      if (isPtr) {
        if (!model.findNodeDataForKey(7)) {
          model.addNodeData({ key: 7, name: 'SFP-RETURN', type: 'Transfer', category: 'Transfer', loc: '735 210', angle: 0 });
        }
        if (!model.findNodeDataForKey(8)) {
          model.addNodeData({ key: 8, name: 'PTR002VB', type: 'Manual Valve', category: 'Manual Valve', loc: '165 210', angle: 0 });
        }

        removeDirectLink(model, 5, 1);
        ensureLink(model, 5, 8, 'OUT', 'IN');
        ensureLink(model, 8, 1, 'OUT', 'IN');
        ensureLink(model, 4, 7, 'OUT', 'BND');
        ensureLink(model, 3, 6, 'OUT', 'PROC', 'instrument');

        setNodePosition(model, 5, 70, 210);
        setNodePosition(model, 8, 165, 210);
        setNodePosition(model, 1, 265, 210);
        setNodePosition(model, 2, 375, 210);
        setNodePosition(model, 3, 475, 210);
        setNodePosition(model, 4, 600, 210);
        setNodePosition(model, 7, 735, 210);
        setNodePosition(model, 6, 475, 95);
      } else if (isRri) {
        removeDirectLink(model, 3, 4);
        ensureLink(model, 3, 7, 'OUT', 'IN');
        ensureLink(model, 7, 4, 'OUT', 'IN');

        setNodePosition(model, 5, 70, 210);
        setNodePosition(model, 1, 165, 210);
        setNodePosition(model, 2, 265, 210);
        setNodePosition(model, 3, 380, 210);
        setNodePosition(model, 7, 490, 210);
        setNodePosition(model, 4, 610, 210);
        setNodePosition(model, 6, 745, 210);
      } else if (isSec) {
        removeDirectLink(model, 3, 4);
        ensureLink(model, 3, 7, 'OUT', 'IN');
        ensureLink(model, 7, 4, 'OUT', 'IN');

        setNodePosition(model, 5, 70, 210);
        setNodePosition(model, 1, 185, 210);
        setNodePosition(model, 2, 300, 210);
        setNodePosition(model, 3, 410, 210);
        setNodePosition(model, 7, 525, 210);
        setNodePosition(model, 4, 650, 210);
        setNodePosition(model, 6, 785, 210);
      }

      diagram.commitTransaction('structure hydraulic P&ID');

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
