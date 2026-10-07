import * as go from 'gojs';

export interface HydraulicPidTemplateOptions {
  accent?: string;
  palette?: boolean;
}

/**
 * P&ID visual library for PTR / RRI / SEC.
 * One canonical symbol is shared by palette and canvas. Hydraulic nodes are
 * deliberately non-resizable so the P&ID family proportions remain stable.
 */
export function installHydraulicPidTemplates(
  target: go.Diagram | go.Palette,
  options: HydraulicPidTemplateOptions = {}
): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;
  const process = options.accent ?? '#2563eb';
  const ink = '#172033';
  const muted = '#64748b';
  const electric = '#d97706';
  const control = '#7c3aed';
  const support = '#0891b2';
  const k = palette ? 0.82 : 1;

  const dim = (w: number, h: number): go.Size => new go.Size(w * k, h * k);
  const locationBinding = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify);
  const angleBinding = new go.Binding('angle', 'angle').makeTwoWay();

  const setPortsVisible = (node: go.Node, visible: boolean): void => {
    if (palette) return;
    node.ports.each(portObject => {
      portObject.opacity = visible ? 1 : 0;
    });
  };

  const base = {
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
  };

  const port = (
    id: string,
    spot: go.Spot,
    fromLinkable: boolean,
    toLinkable: boolean,
    stroke = process
  ): go.Shape => $(go.Shape, 'Circle', {
    alignment: spot,
    width: 6 * k,
    height: 6 * k,
    fill: '#ffffff',
    stroke,
    strokeWidth: 1.1,
    opacity: 0,
    portId: id,
    fromLinkable: !palette && fromLinkable,
    toLinkable: !palette && toLinkable,
    fromSpot: spot,
    toSpot: spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  const caption = (label: string): go.Panel => $(go.Panel, 'Vertical',
    { margin: new go.Margin(3 * k, 0, 0, 0) },
    $(go.TextBlock, {
      font: `${palette ? 7.2 : 8.2}px Inter, sans-serif`,
      stroke: ink,
      editable: !palette,
      textAlign: 'center',
      maxSize: new go.Size((palette ? 90 : 105) * k, NaN)
    }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
    $(go.TextBlock, label, {
      visible: false,
      font: '7px Inter, sans-serif',
      stroke: muted
    })
  );

  const motorBubble = (alignment: go.Spot): go.Panel => $(go.Panel, 'Auto', { alignment },
    $(go.Shape, 'Circle', {
      width: 17 * k,
      height: 17 * k,
      fill: '#fff',
      stroke: process,
      strokeWidth: 1.25
    }),
    $(go.TextBlock, 'M', {
      font: `600 ${palette ? 6.5 : 7}px Inter, sans-serif`,
      stroke: ink
    })
  );

  const valveBody = (alignment: go.Spot = go.Spot.Center): go.Panel => $(go.Panel, 'Spot',
    { width: 34 * k, height: 18 * k, alignment },
    $(go.Shape, 'LineH', { width: 34 * k, stroke: process, strokeWidth: 1.35 }),
    $(go.Shape, 'TriangleRight', {
      width: 13 * k, height: 13 * k, fill: '#fff', stroke: process, strokeWidth: 1.25,
      alignment: new go.Spot(0.39, 0.5)
    }),
    $(go.Shape, 'TriangleLeft', {
      width: 13 * k, height: 13 * k, fill: '#fff', stroke: process, strokeWidth: 1.25,
      alignment: new go.Spot(0.61, 0.5)
    })
  );

  target.nodeTemplateMap.add('Pump',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(70, 50) },
        $(go.Shape, 'LineH', { width: 64 * k, stroke: process, strokeWidth: 1.35 }),
        $(go.Shape, 'Circle', {
          width: 31 * k, height: 31 * k, fill: '#fff', stroke: process, strokeWidth: 1.55
        }),
        $(go.Shape, {
          geometryString: 'M2 24 C11 8 24 7 31 16 M2 24 C13 20 23 24 31 31',
          desiredSize: dim(23, 23), stroke: process, strokeWidth: 1.25, fill: null,
          alignment: new go.Spot(0.49, 0.51)
        }),
        $(go.Shape, 'LineV', {
          height: 12 * k, stroke: process, strokeWidth: 1.0, alignment: new go.Spot(0.66, 0.25)
        }),
        motorBubble(new go.Spot(0.73, 0.11)),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false),
        port('PWR', new go.Spot(0.73, 0), false, true, electric),
        port('CTRL', new go.Spot(0.54, 0), false, true, control)
      ),
      caption('Centrifugal Pump')
    )
  );

  target.nodeTemplateMap.add('Vertical Pump',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(50, 68) },
        $(go.Shape, 'LineV', { height: 60 * k, stroke: process, strokeWidth: 1.35 }),
        $(go.Shape, 'Circle', {
          width: 30 * k, height: 30 * k, fill: '#fff', stroke: process, strokeWidth: 1.55,
          alignment: new go.Spot(0.5, 0.62)
        }),
        $(go.Shape, {
          geometryString: 'M3 21 C11 7 22 7 28 15 M3 21 C12 18 21 22 28 28',
          desiredSize: dim(20, 20), stroke: process, strokeWidth: 1.15, fill: null,
          alignment: new go.Spot(0.5, 0.62)
        }),
        motorBubble(new go.Spot(0.78, 0.18)),
        port('IN', new go.Spot(0.5, 1), false, true),
        port('OUT', new go.Spot(1, 0.62), true, false),
        port('PWR', new go.Spot(0.78, 0), false, true, electric),
        port('CTRL', new go.Spot(0.34, 0), false, true, control)
      ),
      caption('Vertical Pump')
    )
  );

  target.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(52, 44) },
        $(go.Shape, 'LineH', { width: 48 * k, stroke: process, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.69) }),
        valveBody(new go.Spot(0.5, 0.69)),
        $(go.Shape, 'LineV', { height: 13 * k, stroke: process, strokeWidth: 1.0, alignment: new go.Spot(0.5, 0.43) }),
        motorBubble(new go.Spot(0.5, 0.16)),
        port('IN', new go.Spot(0, 0.69), false, true),
        port('OUT', new go.Spot(1, 0.69), true, false),
        port('PWR', new go.Spot(0.35, 0), false, true, electric),
        port('CTRL', new go.Spot(0.65, 0), false, true, control)
      ),
      caption('Motorized Valve')
    )
  );

  target.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(44, 30) },
        $(go.Shape, 'LineH', { width: 42 * k, stroke: process, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.69) }),
        valveBody(new go.Spot(0.5, 0.69)),
        $(go.Shape, 'LineV', { height: 9 * k, stroke: process, strokeWidth: 0.95, alignment: new go.Spot(0.5, 0.43) }),
        $(go.Shape, 'Ellipse', {
          width: 15 * k, height: 4 * k, fill: '#fff', stroke: process, strokeWidth: 1.0,
          alignment: new go.Spot(0.5, 0.20)
        }),
        port('IN', new go.Spot(0, 0.69), false, true),
        port('OUT', new go.Spot(1, 0.69), true, false)
      ),
      caption('Manual Valve')
    )
  );

  target.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(40, 24) },
        $(go.Shape, 'LineH', { width: 38 * k, stroke: process, strokeWidth: 1.3 }),
        $(go.Shape, 'TriangleRight', {
          width: 12 * k, height: 12 * k, fill: '#fff', stroke: process, strokeWidth: 1.15,
          alignment: new go.Spot(0.45, 0.5)
        }),
        $(go.Shape, 'LineV', {
          height: 15 * k, stroke: process, strokeWidth: 1.35, alignment: new go.Spot(0.59, 0.5)
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption('Check Valve')
    )
  );

  target.nodeTemplateMap.add('Control Valve',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(48, 42) },
        $(go.Shape, 'LineH', { width: 44 * k, stroke: process, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.72) }),
        valveBody(new go.Spot(0.5, 0.72)),
        $(go.Shape, 'LineV', { height: 12 * k, stroke: process, strokeWidth: 0.95, alignment: new go.Spot(0.5, 0.47) }),
        $(go.Shape, 'Ellipse', {
          width: 18 * k, height: 11 * k, fill: '#fff', stroke: control, strokeWidth: 1.1,
          alignment: new go.Spot(0.5, 0.20)
        }),
        port('IN', new go.Spot(0, 0.72), false, true),
        port('OUT', new go.Spot(1, 0.72), true, false),
        port('CTRL', new go.Spot(0.5, 0), false, true, control)
      ),
      caption('Control Valve')
    )
  );

  target.nodeTemplateMap.add('Relief Valve',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(36, 48) },
        $(go.Shape, 'LineV', { height: 43 * k, stroke: process, strokeWidth: 1.2 }),
        $(go.Shape, 'TriangleUp', {
          width: 13 * k, height: 12 * k, fill: '#fff', stroke: process, strokeWidth: 1.15,
          alignment: new go.Spot(0.5, 0.56)
        }),
        $(go.Shape, {
          geometryString: 'M0 0 L6 4 L0 8 L6 12 L0 16',
          desiredSize: dim(6, 16), stroke: process, strokeWidth: 0.9, fill: null,
          alignment: new go.Spot(0.68, 0.30)
        }),
        port('IN', new go.Spot(0.5, 1), false, true),
        port('OUT', new go.Spot(0.5, 0), true, false)
      ),
      caption('Relief / Safety Valve')
    )
  );

  target.nodeTemplateMap.add('Heat Exchanger',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(72, 40) },
        $(go.Shape, 'LineH', { width: 70 * k, stroke: process, strokeWidth: 1.3 }),
        $(go.Shape, 'Rectangle', {
          width: 50 * k, height: 30 * k, fill: '#fff', stroke: process, strokeWidth: 1.35
        }),
        $(go.Shape, {
          geometryString: 'M0 2 L16 2 L32 28 L48 28',
          desiredSize: dim(42, 24), stroke: process, strokeWidth: 1.1, fill: null
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false),
        port('SUPPLY', new go.Spot(0.5, 0), false, true, support),
        port('RETURN', new go.Spot(0.5, 1), true, false, support)
      ),
      caption('Heat Exchanger')
    )
  );

  target.nodeTemplateMap.add('Filter / Strainer',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(36, 58) },
        $(go.Shape, 'LineV', { height: 54 * k, stroke: process, strokeWidth: 1.2 }),
        $(go.Shape, {
          geometryString: 'M7 0 L25 0 L31 7 L31 43 L25 50 L7 50 L1 43 L1 7 Z',
          desiredSize: dim(28, 48), fill: '#fff', stroke: process, strokeWidth: 1.2
        }),
        port('IN', new go.Spot(0.5, 0), false, true),
        port('OUT', new go.Spot(0.5, 1), true, false)
      ),
      caption('Filter / Strainer')
    )
  );

  target.nodeTemplateMap.add('Tank / Vessel',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(42, 70) },
        $(go.Shape, {
          geometryString: 'M7 0 L29 0 L35 8 L35 54 L29 62 L7 62 L1 54 L1 8 Z',
          desiredSize: dim(34, 62), fill: '#fff', stroke: process, strokeWidth: 1.25
        }),
        port('IN', new go.Spot(0, 0.40), false, true),
        port('OUT', new go.Spot(1, 0.62), true, false),
        port('VENT', new go.Spot(0.5, 0), true, false),
        port('DRAIN', new go.Spot(0.5, 1), true, false)
      ),
      caption('Tank / Vessel')
    )
  );

  const poolTemplate = (label: string): go.Node => $(go.Node, 'Vertical', base,
    locationBinding, angleBinding,
    $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(86, 56) },
      $(go.Shape, {
        geometryString: 'M5 2 L5 48 L79 48 L79 2',
        desiredSize: dim(74, 46), stroke: process, strokeWidth: 1.3, fill: null
      }),
      $(go.Shape, 'LineH', {
        width: 61 * k, stroke: '#60a5fa', strokeWidth: 1.1, alignment: new go.Spot(0.5, 0.60)
      }),
      port('IN', new go.Spot(0, 0.5), false, true),
      port('OUT', new go.Spot(1, 0.5), true, false)
    ),
    caption(label)
  );
  target.nodeTemplateMap.add('Pool / Source', poolTemplate('Pool / Reservoir'));
  target.nodeTemplateMap.add('Tank / Pool', poolTemplate('Pool / Reservoir'));

  target.nodeTemplateMap.add('Instrument',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(32, 32) },
        $(go.Shape, 'Circle', {
          width: 25 * k, height: 25 * k, fill: '#fff', stroke: process, strokeWidth: 1.25
        }),
        $(go.TextBlock, 'I', { font: `${palette ? 6.3 : 7}px Inter, sans-serif`, stroke: process }),
        port('PROC', new go.Spot(0.5, 1), false, true),
        port('SIG', new go.Spot(1, 0.5), true, false, control)
      ),
      caption('Instrument')
    )
  );

  target.nodeTemplateMap.add('Flow Element',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(46, 32) },
        $(go.Shape, 'LineH', { width: 44 * k, stroke: process, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.66) }),
        $(go.Shape, 'LineV', { height: 14 * k, stroke: process, strokeWidth: 1.0, alignment: new go.Spot(0.46, 0.66) }),
        $(go.Shape, 'LineV', { height: 14 * k, stroke: process, strokeWidth: 1.0, alignment: new go.Spot(0.54, 0.66) }),
        $(go.Shape, 'LineV', { height: 9 * k, stroke: process, strokeWidth: 0.9, alignment: new go.Spot(0.5, 0.39) }),
        $(go.Panel, 'Auto', { alignment: new go.Spot(0.5, 0.16) },
          $(go.Shape, 'Circle', { width: 14 * k, height: 14 * k, fill: '#fff', stroke: process, strokeWidth: 1.0 }),
          $(go.TextBlock, 'F', { font: `${palette ? 5.5 : 6}px Inter, sans-serif`, stroke: ink })
        ),
        port('IN', new go.Spot(0, 0.66), false, true),
        port('OUT', new go.Spot(1, 0.66), true, false),
        port('SIG', new go.Spot(0.5, 0), true, false, control)
      ),
      caption('Flow Element')
    )
  );

  target.nodeTemplateMap.add('Pipe Junction',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(24, 24) },
        $(go.Shape, 'LineH', { width: 22 * k, stroke: process, strokeWidth: 1.35 }),
        $(go.Shape, 'LineV', { height: 22 * k, stroke: process, strokeWidth: 1.35 }),
        $(go.Shape, 'Circle', { width: 4 * k, height: 4 * k, fill: process, stroke: process }),
        port('A', new go.Spot(0, 0.5), true, true),
        port('B', new go.Spot(1, 0.5), true, true),
        port('C', new go.Spot(0.5, 1), true, true)
      ),
      caption('Pipe Junction')
    )
  );

  target.nodeTemplateMap.add('Off-page Connector',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(76, 26) },
        $(go.Shape, {
          geometryString: 'M0 0 L57 0 L72 12 L57 24 L0 24 Z',
          desiredSize: dim(72, 24), fill: '#fff', stroke: process, strokeWidth: 1.2
        }),
        $(go.TextBlock, {
          font: `${palette ? 5.7 : 6.2}px Inter, sans-serif`, stroke: ink, maxSize: dim(45, 18)
        }, new go.Binding('text', 'name')),
        port('BND', new go.Spot(1, 0.5), true, true)
      ),
      caption('Off-page Connector')
    )
  );

  target.nodeTemplateMap.add('Boundary',
    $(go.Node, 'Vertical', base,
      locationBinding, angleBinding,
      $(go.Panel, 'Spot', { name: 'SYMBOL', desiredSize: dim(28, 60) },
        $(go.Shape, 'LineH', { width: 26 * k, stroke: process, strokeWidth: 1.15 }),
        $(go.Shape, 'Rectangle', {
          width: 7 * k, height: 52 * k, fill: '#fff', stroke: '#334155', strokeWidth: 1.0
        }),
        $(go.Shape, {
          geometryString: 'M0 0 L7 7 M0 9 L7 16 M0 18 L7 25 M0 27 L7 34 M0 36 L7 43',
          desiredSize: dim(7, 43), stroke: '#94a3b8', strokeWidth: 0.7, fill: null
        }),
        port('BND', new go.Spot(0.5, 0.5), true, true, '#334155')
      ),
      caption('Boundary')
    )
  );
}
