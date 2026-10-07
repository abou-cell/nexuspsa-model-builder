import * as go from 'gojs';

export interface ValidatedHydraulicTemplateOptions {
  accent?: string;
  palette?: boolean;
}

/**
 * Validated NexusPSA component symbol set.
 * These templates reproduce the approved legend used for the hydraulic palette.
 * The same symbols are installed in the palette and in the editor canvas.
 */
export function installValidatedHydraulicTemplates(
  target: go.Diagram | go.Palette,
  options: ValidatedHydraulicTemplateOptions = {}
): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;
  const blue = options.accent ?? '#1d4ed8';
  const ink = '#172033';
  const gray = '#475569';
  const electric = '#0f172a';
  const control = '#2563eb';
  const k = palette ? 0.82 : 1;

  const dim = (w: number, h: number) => new go.Size(w * k, h * k);
  const loc = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify);
  const angle = new go.Binding('angle', 'angle').makeTwoWay();

  const base = {
    locationSpot: go.Spot.Center,
    selectionAdorned: true,
    resizable: false,
    rotatable: !palette,
    cursor: palette ? 'grab' : 'move'
  };

  const port = (id: string, spot: go.Spot, from: boolean, to: boolean, stroke = blue) =>
    $(go.Shape, 'Circle', {
      alignment: spot,
      width: 5 * k,
      height: 5 * k,
      fill: '#fff',
      stroke,
      strokeWidth: 1,
      opacity: palette ? 0 : 0.9,
      portId: id,
      fromLinkable: !palette && from,
      toLinkable: !palette && to,
      fromSpot: spot,
      toSpot: spot,
      cursor: palette ? 'grab' : 'crosshair'
    });

  const caption = () => $(go.TextBlock, {
    margin: new go.Margin(3 * k, 0, 0, 0),
    font: `${palette ? 7.4 : 8.5}px Inter, sans-serif`,
    stroke: ink,
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size((palette ? 96 : 116) * k, NaN)
  }, palette ? new go.Binding('text', 'type') : new go.Binding('text', 'name').makeTwoWay());

  const motorBubble = (spot: go.Spot) => $(go.Panel, 'Auto', { alignment: spot },
    $(go.Shape, 'Circle', { width: 18 * k, height: 18 * k, fill: '#fff', stroke: blue, strokeWidth: 1.4 }),
    $(go.TextBlock, 'M', { font: `600 ${7.4 * k}px Inter, sans-serif`, stroke: ink })
  );

  const bowTie = (spot = go.Spot.Center) => $(go.Panel, 'Spot', { alignment: spot, width: 36 * k, height: 20 * k },
    $(go.Shape, 'LineH', { width: 36 * k, stroke: blue, strokeWidth: 1.45 }),
    $(go.Shape, 'TriangleRight', { width: 15 * k, height: 15 * k, fill: '#fff', stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.39, 0.5) }),
    $(go.Shape, 'TriangleLeft', { width: 15 * k, height: 15 * k, fill: '#fff', stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.61, 0.5) })
  );

  target.nodeTemplateMap.add('Motor Pump',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(72, 62) },
        $(go.Shape, 'LineH', { width: 68 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.5, 0.61) }),
        $(go.Shape, 'Circle', { width: 38 * k, height: 38 * k, fill: '#fff', stroke: blue, strokeWidth: 1.7, alignment: new go.Spot(0.5, 0.61) }),
        $(go.Shape, 'TriangleRight', { width: 22 * k, height: 18 * k, fill: '#fff', stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.52, 0.61) }),
        motorBubble(new go.Spot(0.5, 0.15)),
        port('IN', new go.Spot(0, 0.61), false, true),
        port('OUT', new go.Spot(1, 0.61), true, false),
        port('PWR', new go.Spot(0.5, 0), false, true, electric),
        port('CTRL', new go.Spot(0.72, 0.18), false, true, control)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(52, 30) },
        $(go.Shape, 'LineH', { width: 50 * k, stroke: blue, strokeWidth: 1.5 }),
        $(go.Shape, 'TriangleRight', { width: 13 * k, height: 13 * k, fill: blue, stroke: blue, alignment: new go.Spot(0.43, 0.5) }),
        $(go.Shape, 'LineV', { height: 22 * k, stroke: blue, strokeWidth: 1.6, angle: -25, alignment: new go.Spot(0.58, 0.5) }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Reheater',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(76, 46) },
        $(go.Shape, 'LineH', { width: 74 * k, stroke: blue, strokeWidth: 1.4 }),
        $(go.Shape, 'Rectangle', { width: 56 * k, height: 34 * k, fill: '#fff', stroke: blue, strokeWidth: 1.5 }),
        $(go.Shape, {
          geometryString: 'M0 24 L0 4 L10 4 L10 28 L20 28 L20 4 L30 4 L30 28 L40 28 L40 4 L50 4 L50 24',
          desiredSize: dim(42, 26), stroke: blue, strokeWidth: 1.3, fill: null
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('KD',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(54, 28) },
        $(go.Shape, 'LineH', { width: 52 * k, stroke: blue, strokeWidth: 1.4 }),
        $(go.Shape, 'LineV', { height: 20 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.43, 0.5) }),
        $(go.Shape, 'LineV', { height: 20 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.57, 0.5) }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Relief Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(46, 58) },
        $(go.Shape, 'TriangleRight', { width: 13 * k, height: 13 * k, fill: '#fff', stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.36, 0.52) }),
        $(go.Shape, 'TriangleUp', { width: 15 * k, height: 14 * k, fill: '#fff', stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.58, 0.60) }),
        $(go.Shape, 'LineV', { height: 35 * k, stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.58, 0.35) }),
        $(go.Shape, { geometryString: 'M0 0 L6 4 L0 8 L6 12 L0 16 L6 20', desiredSize: dim(7, 21), stroke: blue, strokeWidth: 1.2, fill: null, alignment: new go.Spot(0.58, 0.18) }),
        $(go.Shape, 'LineH', { width: 18 * k, stroke: blue, strokeWidth: 1.35, alignment: new go.Spot(0.20, 0.52) }),
        port('IN', new go.Spot(0, 0.52), false, true),
        port('OUT', new go.Spot(0.58, 1), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Reservoir',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(74, 52) },
        $(go.Shape, { geometryString: 'M0 0 L0 40 L62 40 L62 0', desiredSize: dim(62, 40), stroke: blue, strokeWidth: 1.5, fill: null }),
        $(go.Shape, 'LineH', { width: 47 * k, stroke: blue, strokeWidth: 1.0, strokeDashArray: [9, 5], alignment: new go.Spot(0.5, 0.54) }),
        $(go.Shape, 'LineH', { width: 44 * k, stroke: blue, strokeWidth: 1.0, strokeDashArray: [7, 6], alignment: new go.Spot(0.5, 0.69) }),
        port('IN', new go.Spot(0.2, 0), false, true),
        port('OUT', new go.Spot(0.8, 0), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Diaphragm',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(70, 40) },
        $(go.Shape, 'LineH', { width: 68 * k, stroke: blue, strokeWidth: 1.4 }),
        $(go.Shape, 'Rectangle', { width: 54 * k, height: 28 * k, fill: '#fff', stroke: blue, strokeWidth: 1.45 }),
        $(go.Shape, { geometryString: 'M4 0 L4 24 L14 24 L14 4 L26 4 L26 24 L38 24 L38 4 L50 4', desiredSize: dim(43, 22), stroke: blue, strokeWidth: 1.15, fill: null }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(56, 48) },
        $(go.Shape, 'LineH', { width: 52 * k, stroke: blue, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.68) }),
        bowTie(new go.Spot(0.5, 0.68)),
        $(go.Shape, 'LineV', { height: 18 * k, stroke: blue, strokeWidth: 1.25, alignment: new go.Spot(0.5, 0.39) }),
        $(go.Shape, 'Rectangle', { width: 22 * k, height: 5 * k, fill: '#fff', stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.16) }),
        port('IN', new go.Spot(0, 0.68), false, true),
        port('OUT', new go.Spot(1, 0.68), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Tester',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(54, 38) },
        $(go.Shape, 'Ellipse', { width: 42 * k, height: 30 * k, fill: '#fff', stroke: blue, strokeWidth: 1.45 }),
        $(go.Shape, 'TriangleDown', { width: 10 * k, height: 9 * k, angle: 25, fill: '#fff', stroke: blue, strokeWidth: 1.2, alignment: new go.Spot(0.30, 0.84) }),
        port('TEST', new go.Spot(0.5, 1), true, true)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Filter',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 48) },
        $(go.Shape, 'LineH', { width: 56 * k, stroke: blue, strokeWidth: 1.4 }),
        $(go.Shape, 'Rectangle', { width: 34 * k, height: 32 * k, fill: '#fff', stroke: blue, strokeWidth: 1.45 }),
        $(go.Shape, { geometryString: 'M0 0 L28 24', desiredSize: dim(27, 24), stroke: blue, strokeWidth: 1.1, strokeDashArray: [4, 2] }),
        $(go.Shape, 'LineH', { width: 37 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.5, 0.14) }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('FIP',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(42, 52) },
        $(go.Shape, 'LineV', { height: 37 * k, stroke: blue, strokeWidth: 1.45, alignment: new go.Spot(0.5, 0.66) }),
        $(go.Shape, 'Ellipse', { width: 27 * k, height: 15 * k, fill: '#fff', stroke: blue, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.25) }),
        $(go.Shape, 'LineH', { width: 14 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.67, 0.67) }),
        port('PROC', new go.Spot(0.5, 1), false, true),
        port('SIG', new go.Spot(0.83, 0.67), true, false, control)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Transfer',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(74, 34) },
        $(go.Shape, { geometryString: 'M0 14 L10 2 L58 2 L58 26 L10 26 Z', desiredSize: dim(59, 28), stroke: blue, strokeWidth: 1.4, fill: '#fff' }),
        $(go.Shape, 'LineH', { width: 10 * k, stroke: blue, strokeWidth: 1.4, alignment: new go.Spot(0.91, 0.5) }),
        port('BND', new go.Spot(1, 0.5), true, true)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Source',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 38) },
        $(go.Shape, 'Circle', { width: 31 * k, height: 31 * k, fill: '#fff', stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.35, 0.5) }),
        $(go.TextBlock, 'S', { font: `700 ${11 * k}px Inter, sans-serif`, stroke: blue, alignment: new go.Spot(0.35, 0.5) }),
        $(go.Shape, 'LineH', { width: 23 * k, stroke: blue, strokeWidth: 1.45, alignment: new go.Spot(0.79, 0.5) }),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 54) },
        $(go.Shape, 'LineH', { width: 54 * k, stroke: blue, strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.70) }),
        bowTie(new go.Spot(0.5, 0.70)),
        $(go.Shape, 'LineV', { height: 12 * k, stroke: blue, strokeWidth: 1.2, alignment: new go.Spot(0.5, 0.47) }),
        motorBubble(new go.Spot(0.5, 0.16)),
        port('IN', new go.Spot(0, 0.70), false, true),
        port('OUT', new go.Spot(1, 0.70), true, false),
        port('PWR', new go.Spot(0.38, 0), false, true, electric),
        port('CTRL', new go.Spot(0.62, 0), false, true, control)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Electrical Supply Panel',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 48) },
        $(go.Shape, 'Rectangle', { width: 44 * k, height: 38 * k, fill: '#fff', stroke: blue, strokeWidth: 1.5 }),
        $(go.Shape, { geometryString: 'M8 0 L0 14 L8 14 L3 28 L18 10 L10 10 Z', desiredSize: dim(15, 25), fill: blue, stroke: blue, alignment: new go.Spot(0.33, 0.5) }),
        $(go.Shape, 'LineH', { width: 14 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.68, 0.40) }),
        $(go.Shape, 'LineH', { width: 14 * k, stroke: blue, strokeWidth: 1.5, alignment: new go.Spot(0.68, 0.62) }),
        port('PWR', new go.Spot(1, 0.5), true, false, electric)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('I&C',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(72, 52) },
        $(go.Shape, 'Circle', { width: 39 * k, height: 39 * k, fill: '#fff', stroke: blue, strokeWidth: 1.6 }),
        $(go.TextBlock, 'I&C', { font: `700 ${9.5 * k}px Inter, sans-serif`, stroke: blue }),
        $(go.Shape, 'LineH', { width: 18 * k, stroke: blue, strokeWidth: 1.2, strokeDashArray: [4, 3], alignment: new go.Spot(0.17, 0.5) }),
        $(go.Shape, 'LineH', { width: 18 * k, stroke: blue, strokeWidth: 1.2, strokeDashArray: [4, 3], alignment: new go.Spot(0.83, 0.5) }),
        $(go.Shape, 'Rectangle', { width: 7 * k, height: 7 * k, fill: '#fff', stroke: blue, strokeWidth: 1.2, alignment: new go.Spot(0.04, 0.5) }),
        $(go.Shape, 'Rectangle', { width: 7 * k, height: 7 * k, fill: '#fff', stroke: blue, strokeWidth: 1.2, alignment: new go.Spot(0.96, 0.5) }),
        $(go.Shape, 'LineV', { height: 15 * k, stroke: blue, strokeWidth: 1.1, strokeDashArray: [4, 3], alignment: new go.Spot(0.20, 0.22) }),
        $(go.Shape, 'LineV', { height: 15 * k, stroke: blue, strokeWidth: 1.1, strokeDashArray: [4, 3], alignment: new go.Spot(0.80, 0.22) }),
        $(go.Shape, 'Circle', { width: 6 * k, height: 6 * k, fill: '#fff', stroke: blue, strokeWidth: 1.1, alignment: new go.Spot(0.20, 0.05) }),
        $(go.Shape, 'Circle', { width: 6 * k, height: 6 * k, fill: '#fff', stroke: blue, strokeWidth: 1.1, alignment: new go.Spot(0.80, 0.05) }),
        port('SIG_IN', new go.Spot(0, 0.5), false, true, control),
        port('SIG_OUT', new go.Spot(1, 0.5), true, false, control)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Maintenance',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 52) },
        $(go.Shape, 'LineH', { width: 48 * k, stroke: blue, strokeWidth: 5 * k, angle: 45, strokeCap: 'round' }),
        $(go.Shape, 'LineH', { width: 48 * k, stroke: blue, strokeWidth: 4 * k, angle: -45, strokeCap: 'round' }),
        $(go.Shape, 'Circle', { width: 13 * k, height: 13 * k, fill: '#fff', stroke: blue, strokeWidth: 3 * k, alignment: new go.Spot(0.18, 0.18) }),
        port('REF', new go.Spot(1, 0.5), true, true, gray)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Tank',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(52, 62) },
        $(go.Shape, 'RoundedRectangle', { width: 34 * k, height: 46 * k, parameter1: 14 * k, fill: '#fff', stroke: blue, strokeWidth: 1.55 }),
        $(go.Shape, 'LineV', { height: 7 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.02) }),
        $(go.Shape, 'LineH', { width: 9 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.5, 0.02) }),
        $(go.Shape, 'LineV', { height: 8 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.31, 0.91) }),
        $(go.Shape, 'LineV', { height: 8 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.69, 0.91) }),
        $(go.Shape, 'LineH', { width: 15 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.23, 0.99) }),
        $(go.Shape, 'LineH', { width: 15 * k, stroke: blue, strokeWidth: 1.3, alignment: new go.Spot(0.77, 0.99) }),
        port('IN', new go.Spot(0.5, 0), false, true),
        port('OUT', new go.Spot(0.5, 1), true, false)
      ),
      caption()
    )
  );

  // Visual connection tools kept in the palette as dedicated line objects.
  target.nodeTemplateMap.add('Hydraulic Link',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(68, 24) },
        $(go.Shape, 'LineH', { width: 62 * k, stroke: blue, strokeWidth: 1.8 }),
        port('A', new go.Spot(0, 0.5), true, true),
        port('B', new go.Spot(1, 0.5), true, true)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Test Link',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(68, 24) },
        $(go.Shape, 'LineH', { width: 62 * k, stroke: gray, strokeWidth: 1.5, strokeDashArray: [7, 5] }),
        port('A', new go.Spot(0, 0.5), true, true, gray),
        port('B', new go.Spot(1, 0.5), true, true, gray)
      ),
      caption()
    )
  );
}
