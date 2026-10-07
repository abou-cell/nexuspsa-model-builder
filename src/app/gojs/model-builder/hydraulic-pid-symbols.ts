import * as go from 'gojs';

export interface HydraulicPidTemplateOptions {
  accent?: string;
  palette?: boolean;
}

export function installHydraulicPidTemplates(
  target: go.Diagram | go.Palette,
  options: HydraulicPidTemplateOptions = {}
): void {
  const $ = go.GraphObject.make;
  const accent = options.accent ?? '#2563eb';
  const palette = options.palette ?? false;
  const process = '#2563eb';
  const ink = '#172033';
  const muted = '#64748b';
  const electric = '#d97706';
  const control = '#7c3aed';
  const support = '#0891b2';
  const s = palette ? 0.74 : 1;

  const locationBinding = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify);
  const base = {
    locationSpot: go.Spot.Center,
    selectionAdorned: true,
    cursor: palette ? 'grab' : 'move'
  };

  const port = (
    id: string,
    spot: go.Spot,
    fromLinkable: boolean,
    toLinkable: boolean,
    stroke = accent
  ): go.Shape => $(go.Shape, 'Circle', {
    alignment: spot,
    width: 7 * s,
    height: 7 * s,
    fill: '#ffffff',
    stroke,
    strokeWidth: 1.35,
    portId: id,
    visible: !palette,
    fromLinkable: !palette && fromLinkable,
    toLinkable: !palette && toLinkable,
    fromSpot: spot,
    toSpot: spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  const caption = (label: string): go.Panel => $(go.Panel, 'Vertical',
    { margin: new go.Margin(4 * s, 0, 0, 0) },
    $(go.TextBlock, {
      font: `${palette ? 7.5 : 9.5}px Inter, sans-serif`,
      stroke: ink,
      editable: !palette,
      textAlign: 'center',
      maxSize: new go.Size((palette ? 100 : 140) * s, NaN)
    }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay()),
    $(go.TextBlock, label, {
      visible: !palette,
      font: '7.5px Inter, sans-serif',
      stroke: muted,
      margin: new go.Margin(2, 0, 0, 0),
      textAlign: 'center'
    })
  );

  const motorBubble = (alignment: go.Spot): go.Panel => $(go.Panel, 'Auto', { alignment },
    $(go.Shape, 'Circle', {
      width: 19 * s,
      height: 19 * s,
      fill: '#fff',
      stroke: process,
      strokeWidth: 1.5
    }),
    $(go.TextBlock, 'M', {
      font: `700 ${palette ? 7 : 8}px Inter, sans-serif`,
      stroke: ink
    })
  );

  target.nodeTemplateMap.add('Pump',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 96 * s, height: 66 * s },
        $(go.Shape, 'LineH', { width: 88 * s, stroke: process, strokeWidth: 1.6 }),
        $(go.Shape, 'Circle', { width: 42 * s, height: 42 * s, fill: '#fff', stroke: process, strokeWidth: 1.8 }),
        $(go.Shape, {
          geometryString: 'M0 26 L26 13 L0 0 Z',
          desiredSize: new go.Size(22 * s, 22 * s),
          fill: '#fff',
          stroke: process,
          strokeWidth: 1.5,
          angle: 18,
          alignment: new go.Spot(0.51, 0.51)
        }),
        $(go.Shape, 'LineV', { height: 16 * s, stroke: process, strokeWidth: 1.2, alignment: new go.Spot(0.66, 0.23) }),
        motorBubble(new go.Spot(0.73, 0.10)),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false),
        port('PWR', new go.Spot(0.73, 0), false, true, electric),
        port('CTRL', new go.Spot(0.56, 0), false, true, control)
      ),
      caption('Centrifugal Pump')
    )
  );

  target.nodeTemplateMap.add('Vertical Pump',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 72 * s, height: 84 * s },
        $(go.Shape, 'LineV', { height: 70 * s, stroke: process, strokeWidth: 1.6 }),
        $(go.Shape, 'Circle', { width: 40 * s, height: 40 * s, fill: '#fff', stroke: process, strokeWidth: 1.8, alignment: new go.Spot(0.5, 0.58) }),
        $(go.Shape, 'TriangleUp', { width: 18 * s, height: 18 * s, fill: '#fff', stroke: process, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.58) }),
        motorBubble(new go.Spot(0.76, 0.18)),
        port('IN', new go.Spot(0.5, 1), false, true),
        port('OUT', new go.Spot(1, 0.58), true, false),
        port('PWR', new go.Spot(0.76, 0), false, true, electric),
        port('CTRL', new go.Spot(0.36, 0), false, true, control)
      ),
      caption('Vertical Pump')
    )
  );

  const valveBody = (y = 0.62): go.Panel => $(go.Panel, 'Spot', { width: 70 * s, height: 28 * s, alignment: new go.Spot(0.5, y) },
    $(go.Shape, 'LineH', { width: 68 * s, stroke: process, strokeWidth: 1.55 }),
    $(go.Shape, 'TriangleRight', { width: 20 * s, height: 20 * s, fill: '#fff', stroke: process, strokeWidth: 1.5, alignment: new go.Spot(0.39, 0.5) }),
    $(go.Shape, 'TriangleLeft', { width: 20 * s, height: 20 * s, fill: '#fff', stroke: process, strokeWidth: 1.5, alignment: new go.Spot(0.61, 0.5) })
  );

  target.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 88 * s, height: 62 * s },
        valveBody(0.68),
        $(go.Shape, 'LineV', { height: 20 * s, stroke: process, strokeWidth: 1.25, alignment: new go.Spot(0.5, 0.42) }),
        motorBubble(new go.Spot(0.5, 0.13)),
        port('IN', new go.Spot(0, 0.68), false, true),
        port('OUT', new go.Spot(1, 0.68), true, false),
        port('PWR', new go.Spot(0.35, 0), false, true, electric),
        port('CTRL', new go.Spot(0.65, 0), false, true, control)
      ),
      caption('Motorized Valve')
    )
  );

  target.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 70 * s, height: 42 * s },
        valveBody(0.65),
        $(go.Shape, 'LineV', { height: 13 * s, stroke: process, strokeWidth: 1.15, alignment: new go.Spot(0.5, 0.40) }),
        $(go.Shape, 'Ellipse', { width: 20 * s, height: 6 * s, fill: '#fff', stroke: process, strokeWidth: 1.2, alignment: new go.Spot(0.5, 0.20) }),
        port('IN', new go.Spot(0, 0.65), false, true),
        port('OUT', new go.Spot(1, 0.65), true, false)
      ),
      caption('Manual Valve')
    )
  );

  target.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 64 * s, height: 34 * s },
        $(go.Shape, 'LineH', { width: 62 * s, stroke: process, strokeWidth: 1.55 }),
        $(go.Shape, 'TriangleRight', { width: 17 * s, height: 17 * s, fill: '#fff', stroke: process, strokeWidth: 1.4, alignment: new go.Spot(0.45, 0.5) }),
        $(go.Shape, 'LineV', { height: 22 * s, stroke: process, strokeWidth: 1.7, alignment: new go.Spot(0.59, 0.5) }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption('Check Valve')
    )
  );

  target.nodeTemplateMap.add('Control Valve',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 76 * s, height: 58 * s },
        valveBody(0.70),
        $(go.Shape, 'LineV', { height: 17 * s, stroke: process, strokeWidth: 1.15, alignment: new go.Spot(0.5, 0.47) }),
        $(go.Shape, 'Ellipse', { width: 24 * s, height: 14 * s, fill: '#fff', stroke: control, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.20) }),
        $(go.TextBlock, 'C', { font: `700 ${palette ? 6.5 : 7.5}px Inter, sans-serif`, stroke: control, alignment: new go.Spot(0.5, 0.20) }),
        port('IN', new go.Spot(0, 0.70), false, true),
        port('OUT', new go.Spot(1, 0.70), true, false),
        port('CTRL', new go.Spot(0.5, 0), false, true, control)
      ),
      caption('Control Valve')
    )
  );

  target.nodeTemplateMap.add('Relief Valve',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 54 * s, height: 62 * s },
        $(go.Shape, 'LineV', { height: 52 * s, stroke: process, strokeWidth: 1.45 }),
        $(go.Shape, 'TriangleUp', { width: 18 * s, height: 16 * s, fill: '#fff', stroke: process, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.52) }),
        $(go.Shape, { geometryString: 'M0 0 L8 6 L0 12 L8 18 L0 24', desiredSize: new go.Size(8 * s, 24 * s), stroke: process, strokeWidth: 1.1, fill: null, alignment: new go.Spot(0.67, 0.28) }),
        port('IN', new go.Spot(0.5, 1), false, true),
        port('OUT', new go.Spot(0.5, 0), true, false)
      ),
      caption('Relief / Safety Valve')
    )
  );

  target.nodeTemplateMap.add('Heat Exchanger',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 98 * s, height: 58 * s },
        $(go.Shape, 'LineH', { width: 96 * s, stroke: process, strokeWidth: 1.55 }),
        $(go.Shape, 'Rectangle', { width: 58 * s, height: 40 * s, fill: '#fff', stroke: process, strokeWidth: 1.6 }),
        $(go.Shape, { geometryString: 'M0 20 L12 4 L24 36 L36 4 L48 36 L58 20', desiredSize: new go.Size(46 * s, 30 * s), stroke: process, strokeWidth: 1.25, fill: null }),
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
      locationBinding,
      $(go.Panel, 'Spot', { width: 62 * s, height: 74 * s },
        $(go.Shape, 'LineV', { height: 70 * s, stroke: process, strokeWidth: 1.45 }),
        $(go.Shape, { geometryString: 'M10 0 L34 0 L42 9 L42 48 L34 58 L10 58 L2 48 L2 9 Z', desiredSize: new go.Size(34 * s, 54 * s), fill: '#fff', stroke: process, strokeWidth: 1.45 }),
        $(go.Shape, { geometryString: 'M0 0 L24 24 M0 8 L16 24 M8 0 L24 16', desiredSize: new go.Size(22 * s, 22 * s), stroke: process, strokeWidth: 0.9, fill: null, alignment: new go.Spot(0.5, 0.5) }),
        port('IN', new go.Spot(0.5, 0), false, true),
        port('OUT', new go.Spot(0.5, 1), true, false)
      ),
      caption('Filter / Strainer')
    )
  );

  target.nodeTemplateMap.add('Tank / Vessel',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 70 * s, height: 84 * s },
        $(go.Shape, 'RoundedRectangle', { width: 46 * s, height: 68 * s, fill: '#fff', stroke: process, strokeWidth: 1.55, parameter1: 14 * s }),
        $(go.Shape, 'LineH', { width: 36 * s, stroke: '#60a5fa', strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.62) }),
        port('IN', new go.Spot(0, 0.40), false, true),
        port('OUT', new go.Spot(1, 0.62), true, false),
        port('VENT', new go.Spot(0.5, 0), true, false),
        port('DRAIN', new go.Spot(0.5, 1), true, false)
      ),
      caption('Tank / Vessel')
    )
  );

  const poolTemplate = (label: string): go.Node => $(go.Node, 'Vertical', base,
    locationBinding,
    $(go.Panel, 'Spot', { width: 94 * s, height: 72 * s },
      $(go.Shape, { geometryString: 'M8 4 L8 58 L80 58 L80 4', desiredSize: new go.Size(72 * s, 54 * s), stroke: process, strokeWidth: 1.55, fill: null }),
      $(go.Shape, 'LineH', { width: 58 * s, stroke: '#60a5fa', strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.56) }),
      port('IN', new go.Spot(0, 0.5), false, true),
      port('OUT', new go.Spot(1, 0.5), true, false)
    ),
    caption(label)
  );
  target.nodeTemplateMap.add('Pool / Source', poolTemplate('Pool / Reservoir'));
  target.nodeTemplateMap.add('Tank / Pool', poolTemplate('Pool / Reservoir'));

  target.nodeTemplateMap.add('Instrument',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 44 * s, height: 44 * s },
        $(go.Shape, 'Circle', { width: 34 * s, height: 34 * s, fill: '#fff', stroke: process, strokeWidth: 1.45 }),
        $(go.TextBlock, 'I', { font: `700 ${palette ? 8 : 9}px Inter, sans-serif`, stroke: process }),
        port('PROC', new go.Spot(0.5, 1), false, true),
        port('SIG', new go.Spot(1, 0.5), true, false, control)
      ),
      caption('Instrument Bubble')
    )
  );

  target.nodeTemplateMap.add('Flow Element',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 58 * s, height: 34 * s },
        $(go.Shape, 'LineH', { width: 56 * s, stroke: process, strokeWidth: 1.45 }),
        $(go.Shape, 'Rectangle', { width: 20 * s, height: 20 * s, fill: '#fff', stroke: process, strokeWidth: 1.35 }),
        $(go.Shape, 'LineV', { height: 15 * s, stroke: process, strokeWidth: 1.0 }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false),
        port('SIG', new go.Spot(0.5, 0), true, false, control)
      ),
      caption('Flow Element / Meter')
    )
  );

  target.nodeTemplateMap.add('Pipe Junction',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 34 * s, height: 34 * s },
        $(go.Shape, 'LineH', { width: 30 * s, stroke: process, strokeWidth: 1.6 }),
        $(go.Shape, 'LineV', { height: 30 * s, stroke: process, strokeWidth: 1.6 }),
        $(go.Shape, 'Circle', { width: 7 * s, height: 7 * s, fill: process, stroke: process }),
        port('A', new go.Spot(0, 0.5), true, true),
        port('B', new go.Spot(1, 0.5), true, true),
        port('C', new go.Spot(0.5, 1), true, true)
      ),
      caption('Pipe Junction / Tee')
    )
  );

  target.nodeTemplateMap.add('Off-page Connector',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 82 * s, height: 34 * s },
        $(go.Shape, { geometryString: 'M0 0 L58 0 L76 14 L58 28 L0 28 Z', desiredSize: new go.Size(76 * s, 28 * s), fill: '#fff', stroke: process, strokeWidth: 1.4 }),
        $(go.TextBlock, 'SYS', { font: `600 ${palette ? 6.5 : 7.5}px Inter, sans-serif`, stroke: ink }),
        port('BND', new go.Spot(1, 0.5), true, true)
      ),
      caption('Off-page Connector')
    )
  );

  target.nodeTemplateMap.add('Boundary',
    $(go.Node, 'Vertical', base,
      locationBinding,
      $(go.Panel, 'Spot', { width: 52 * s, height: 70 * s },
        $(go.Shape, 'LineH', { width: 48 * s, stroke: process, strokeWidth: 1.45 }),
        $(go.Shape, 'Rectangle', { width: 9 * s, height: 56 * s, fill: '#fff', stroke: '#334155', strokeWidth: 1.25 }),
        $(go.Shape, { geometryString: 'M0 0 L8 8 M0 10 L8 18 M0 20 L8 28 M0 30 L8 38 M0 40 L8 48', desiredSize: new go.Size(8 * s, 48 * s), stroke: '#94a3b8', strokeWidth: 0.8, fill: null }),
        port('BND', new go.Spot(0.5, 0.5), true, true, '#334155')
      ),
      caption('Wall / System Boundary')
    )
  );
}
