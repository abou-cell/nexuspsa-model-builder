import * as go from 'gojs';

export interface ValidatedHydraulicTemplateOptions {
  accent?: string;
  palette?: boolean;
}

/**
 * High-fidelity NexusPSA symbol library.
 *
 * These symbols are intentionally redrawn from the user-approved P&ID legend.
 * Palette and editor share exactly the same vector templates so a component
 * never changes appearance after drag & drop.
 */
export function installValidatedHydraulicTemplates(
  target: go.Diagram | go.Palette,
  options: ValidatedHydraulicTemplateOptions = {}
): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;

  const blue = options.accent ?? '#1647ff';
  const ink = '#111827';
  const gray = '#334155';
  const electric = '#0f172a';
  const control = '#1647ff';
  const white = '#ffffff';
  const k = palette ? 0.88 : 1;
  const sw = 1.75 * k;
  const swFine = 1.35 * k;

  const dim = (w: number, h: number): go.Size => new go.Size(w * k, h * k);
  const loc = new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify);
  const angle = new go.Binding('angle', 'angle').makeTwoWay();

  const setPortsVisible = (node: go.Node | null, visible: boolean): void => {
    if (!node || palette) return;
    node.ports.each(p => { p.opacity = visible ? 1 : 0; });
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
    from: boolean,
    to: boolean,
    stroke = blue
  ): go.Shape => $(go.Shape, 'Circle', {
    alignment: spot,
    width: 5.5 * k,
    height: 5.5 * k,
    fill: white,
    stroke,
    strokeWidth: 1.1 * k,
    opacity: 0,
    portId: id,
    fromLinkable: !palette && from,
    toLinkable: !palette && to,
    fromSpot: spot,
    toSpot: spot,
    cursor: palette ? 'grab' : 'crosshair'
  });

  const caption = (): go.TextBlock => $(go.TextBlock, {
    margin: new go.Margin(4 * k, 0, 0, 0),
    font: `${palette ? 7.6 : 8.8}px Inter, sans-serif`,
    stroke: ink,
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size((palette ? 98 : 122) * k, NaN)
  }, palette
    ? new go.Binding('text', 'type')
    : new go.Binding('text', 'name').makeTwoWay());

  const motorBubble = (spot: go.Spot): go.Panel => $(go.Panel, 'Auto', { alignment: spot },
    $(go.Shape, 'Circle', {
      width: 20 * k,
      height: 20 * k,
      fill: white,
      stroke: blue,
      strokeWidth: sw
    }),
    $(go.TextBlock, 'M', {
      font: `600 ${8.2 * k}px Inter, sans-serif`,
      stroke: ink
    })
  );

  const valveBody = (spot: go.Spot): go.Panel => $(go.Panel, 'Spot', {
      alignment: spot,
      width: 39 * k,
      height: 22 * k
    },
    $(go.Shape, 'LineH', { width: 39 * k, stroke: blue, strokeWidth: swFine }),
    $(go.Shape, 'TriangleRight', {
      width: 16 * k,
      height: 16 * k,
      fill: white,
      stroke: blue,
      strokeWidth: swFine,
      alignment: new go.Spot(0.39, 0.5)
    }),
    $(go.Shape, 'TriangleLeft', {
      width: 16 * k,
      height: 16 * k,
      fill: white,
      stroke: blue,
      strokeWidth: swFine,
      alignment: new go.Spot(0.61, 0.5)
    })
  );

  // ---------------------------------------------------------------------------
  // MOTOR PUMP — approved legend: circular pump, outlined flow arrow, M bubble.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('Motor Pump',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(82, 70) },
        $(go.Shape, 'LineH', {
          width: 78 * k,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.5, 0.64)
        }),
        // small flange marks at both pipe connections
        $(go.Shape, 'LineV', { height: 10 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.09, 0.64) }),
        $(go.Shape, 'LineV', { height: 10 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.91, 0.64) }),
        $(go.Shape, 'Circle', {
          width: 44 * k,
          height: 44 * k,
          fill: white,
          stroke: blue,
          strokeWidth: sw,
          alignment: new go.Spot(0.5, 0.64)
        }),
        // open arrow exactly in the style of the validated legend
        $(go.Shape, {
          geometryString: 'M0 8 L24 8 L24 2 L42 14 L24 26 L24 20 L0 20 Z',
          desiredSize: dim(31, 20),
          fill: white,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.51, 0.64)
        }),
        $(go.Shape, 'LineV', {
          height: 9 * k,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.5, 0.30)
        }),
        motorBubble(new go.Spot(0.5, 0.13)),
        port('IN', new go.Spot(0, 0.64), false, true),
        port('OUT', new go.Spot(1, 0.64), true, false),
        port('PWR', new go.Spot(0.5, 0), false, true, electric),
        port('CTRL', new go.Spot(0.72, 0.18), false, true, control)
      ),
      caption()
    )
  );

  // ---------------------------------------------------------------------------
  // CHECK VALVE — pivot + flap + downstream stop, as on approved legend.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(66, 42) },
        $(go.Shape, 'LineH', { width: 62 * k, stroke: blue, strokeWidth: swFine }),
        $(go.Shape, 'LineV', { height: 25 * k, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.24, 0.50) }),
        $(go.Shape, 'LineV', { height: 25 * k, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.78, 0.50) }),
        $(go.Shape, {
          geometryString: 'M0 0 L38 22',
          desiredSize: dim(35, 20),
          stroke: blue,
          strokeWidth: sw,
          fill: null,
          alignment: new go.Spot(0.51, 0.48)
        }),
        $(go.Shape, 'TriangleRight', {
          width: 11 * k,
          height: 11 * k,
          fill: blue,
          stroke: blue,
          alignment: new go.Spot(0.30, 0.50)
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // ---------------------------------------------------------------------------
  // REHEATER — rectangular body with smooth three-loop heating element.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('Reheater',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(82, 48) },
        $(go.Shape, 'LineH', { width: 80 * k, stroke: blue, strokeWidth: swFine }),
        $(go.Shape, 'Rectangle', {
          width: 61 * k,
          height: 38 * k,
          fill: white,
          stroke: blue,
          strokeWidth: sw
        }),
        $(go.Shape, {
          geometryString: 'M0 27 L0 8 C0 2 10 2 10 8 L10 27 C10 33 20 33 20 27 L20 8 C20 2 30 2 30 8 L30 27 C30 33 40 33 40 27 L40 8 C40 2 50 2 50 8 L50 27',
          desiredSize: dim(44, 27),
          stroke: blue,
          strokeWidth: swFine,
          fill: null
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // KD — two plates across the hydraulic line.
  target.nodeTemplateMap.add('KD',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(62, 32) },
        $(go.Shape, 'LineH', { width: 60 * k, stroke: blue, strokeWidth: swFine }),
        $(go.Shape, 'LineV', { height: 24 * k, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.43, 0.5) }),
        $(go.Shape, 'LineV', { height: 24 * k, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.57, 0.5) }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // ---------------------------------------------------------------------------
  // RELIEF VALVE — inlet arrow, valve seat, spring and discharge branch.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('Relief Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(54, 68) },
        $(go.Shape, 'LineH', { width: 21 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.17, 0.54) }),
        $(go.Shape, 'TriangleRight', {
          width: 14 * k,
          height: 14 * k,
          fill: white,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.36, 0.54)
        }),
        $(go.Shape, 'Circle', {
          width: 5 * k,
          height: 5 * k,
          fill: blue,
          stroke: blue,
          alignment: new go.Spot(0.55, 0.54)
        }),
        $(go.Shape, 'TriangleUp', {
          width: 17 * k,
          height: 17 * k,
          fill: white,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.55, 0.67)
        }),
        $(go.Shape, 'LineV', { height: 24 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.55, 0.32) }),
        $(go.Shape, {
          geometryString: 'M0 0 L7 4 L0 8 L7 12 L0 16 L7 20 L0 24',
          desiredSize: dim(8, 26),
          stroke: blue,
          strokeWidth: swFine,
          fill: null,
          alignment: new go.Spot(0.55, 0.16)
        }),
        $(go.Shape, 'LineH', { width: 12 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.55, 0.02) }),
        port('IN', new go.Spot(0, 0.54), false, true),
        port('OUT', new go.Spot(0.55, 1), true, false)
      ),
      caption()
    )
  );

  // RESERVOIR — open-top basin and three liquid-level strokes.
  target.nodeTemplateMap.add('Reservoir',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(82, 55) },
        $(go.Shape, {
          geometryString: 'M0 0 L0 42 L68 42 L68 0',
          desiredSize: dim(68, 42),
          stroke: blue,
          strokeWidth: sw,
          fill: null
        }),
        $(go.Shape, 'LineH', { width: 47 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [9, 6], alignment: new go.Spot(0.5, 0.46) }),
        $(go.Shape, 'LineH', { width: 40 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [7, 6], alignment: new go.Spot(0.5, 0.63) }),
        $(go.Shape, 'LineH', { width: 48 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [8, 6], alignment: new go.Spot(0.5, 0.79) }),
        port('IN', new go.Spot(0.22, 0), false, true),
        port('OUT', new go.Spot(0.78, 0), true, false)
      ),
      caption()
    )
  );

  // DIAPHRAGM — rectangular inline body with alternating internal plates.
  target.nodeTemplateMap.add('Diaphragm',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(80, 44) },
        $(go.Shape, 'LineH', { width: 78 * k, stroke: blue, strokeWidth: swFine }),
        $(go.Shape, 'Rectangle', { width: 58 * k, height: 31 * k, fill: white, stroke: blue, strokeWidth: sw }),
        $(go.Shape, {
          geometryString: 'M0 0 L0 25 M14 0 L14 13 M28 12 L28 25 M42 0 L42 14 M56 0 L56 25',
          desiredSize: dim(49, 23),
          stroke: blue,
          strokeWidth: swFine,
          fill: null
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // MANUAL VALVE — bow-tie body, long stem and rectangular handwheel.
  target.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(62, 56) },
        $(go.Shape, 'LineH', { width: 58 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.72) }),
        valveBody(new go.Spot(0.5, 0.72)),
        $(go.Shape, 'LineV', { height: 22 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.43) }),
        $(go.Shape, 'Rectangle', { width: 24 * k, height: 5 * k, fill: white, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.14) }),
        port('IN', new go.Spot(0, 0.72), false, true),
        port('OUT', new go.Spot(1, 0.72), true, false)
      ),
      caption()
    )
  );

  // TESTER — clean callout/speech-bubble form from approved legend.
  target.nodeTemplateMap.add('Tester',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(60, 44) },
        $(go.Shape, 'Ellipse', { width: 47 * k, height: 32 * k, fill: white, stroke: blue, strokeWidth: sw }),
        $(go.Shape, {
          geometryString: 'M0 0 L10 1 L0 10 Z',
          desiredSize: dim(11, 10),
          fill: white,
          stroke: blue,
          strokeWidth: swFine,
          alignment: new go.Spot(0.30, 0.86)
        }),
        port('TEST', new go.Spot(0.5, 1), true, true)
      ),
      caption()
    )
  );

  // FILTER — capped rectangular body and dashed diagonal filter medium.
  target.nodeTemplateMap.add('Filter',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(66, 52) },
        $(go.Shape, 'LineH', { width: 64 * k, stroke: blue, strokeWidth: swFine }),
        $(go.Shape, 'Rectangle', { width: 37 * k, height: 35 * k, fill: white, stroke: blue, strokeWidth: sw }),
        $(go.Shape, 'LineH', { width: 41 * k, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.5, 0.13) }),
        $(go.Shape, {
          geometryString: 'M0 0 L30 26',
          desiredSize: dim(29, 25),
          stroke: blue,
          strokeWidth: swFine,
          strokeDashArray: [4, 3],
          fill: null
        }),
        port('IN', new go.Spot(0, 0.5), false, true),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // FIP — half-dome with process stem and side signal branch.
  target.nodeTemplateMap.add('FIP',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(48, 58) },
        $(go.Shape, {
          geometryString: 'M0 14 C0 5 7 0 16 0 C25 0 32 5 32 14 Z',
          desiredSize: dim(31, 15),
          fill: white,
          stroke: blue,
          strokeWidth: sw,
          alignment: new go.Spot(0.5, 0.23)
        }),
        $(go.Shape, 'LineV', { height: 38 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.68) }),
        $(go.Shape, 'LineH', { width: 15 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.67, 0.69) }),
        port('PROC', new go.Spot(0.5, 1), false, true),
        port('SIG', new go.Spot(0.83, 0.69), true, false, control)
      ),
      caption()
    )
  );

  // TRANSFER — off-page/transfer connector with short outlet line.
  target.nodeTemplateMap.add('Transfer',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(84, 38) },
        $(go.Shape, {
          geometryString: 'M0 16 L14 2 L68 2 L68 30 L14 30 Z',
          desiredSize: dim(68, 32),
          stroke: blue,
          strokeWidth: sw,
          fill: white,
          alignment: new go.Spot(0.44, 0.5)
        }),
        $(go.Shape, 'LineH', { width: 12 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.91, 0.5) }),
        port('BND', new go.Spot(1, 0.5), true, true)
      ),
      caption()
    )
  );

  // SOURCE — S bubble and outlet branch.
  target.nodeTemplateMap.add('Source',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(64, 42) },
        $(go.Shape, 'Circle', { width: 36 * k, height: 36 * k, fill: white, stroke: blue, strokeWidth: sw, alignment: new go.Spot(0.36, 0.5) }),
        $(go.TextBlock, 'S', { font: `700 ${12 * k}px Inter, sans-serif`, stroke: blue, alignment: new go.Spot(0.36, 0.5) }),
        $(go.Shape, 'LineH', { width: 25 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.80, 0.5) }),
        port('OUT', new go.Spot(1, 0.5), true, false)
      ),
      caption()
    )
  );

  // MOTORIZED VALVE — same valve body + stem + separate circular M actuator.
  target.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(64, 62) },
        $(go.Shape, 'LineH', { width: 60 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.75) }),
        valveBody(new go.Spot(0.5, 0.75)),
        $(go.Shape, 'LineV', { height: 13 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.53) }),
        motorBubble(new go.Spot(0.5, 0.19)),
        port('IN', new go.Spot(0, 0.75), false, true),
        port('OUT', new go.Spot(1, 0.75), true, false),
        port('PWR', new go.Spot(0.38, 0), false, true, electric),
        port('CTRL', new go.Spot(0.62, 0), false, true, control)
      ),
      caption()
    )
  );

  // ---------------------------------------------------------------------------
  // ELECTRICAL SUPPLY PANEL — approved panel: border, lightning + bus lines.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('Electrical Supply Panel',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(64, 56) },
        $(go.Shape, 'Rectangle', { width: 49 * k, height: 43 * k, fill: white, stroke: blue, strokeWidth: sw }),
        $(go.Shape, {
          geometryString: 'M11 0 L0 20 L9 20 L4 38 L24 14 L14 14 L20 0 Z',
          desiredSize: dim(18, 29),
          fill: blue,
          stroke: blue,
          alignment: new go.Spot(0.32, 0.50)
        }),
        $(go.Shape, 'LineH', { width: 17 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.69, 0.38) }),
        $(go.Shape, 'LineH', { width: 17 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.69, 0.55) }),
        $(go.Shape, 'LineH', { width: 17 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.69, 0.72) }),
        port('PWR', new go.Spot(1, 0.5), true, false, electric)
      ),
      caption()
    )
  );

  // ---------------------------------------------------------------------------
  // I&C — approved control node: central bubble, signal lines, terminals,
  // instrument taps above. This is intentionally more distinctive than a
  // simple text circle.
  // ---------------------------------------------------------------------------
  target.nodeTemplateMap.add('I&C',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(88, 60) },
        $(go.Shape, 'Circle', { width: 44 * k, height: 44 * k, fill: white, stroke: blue, strokeWidth: 1.9 * k }),
        $(go.TextBlock, 'I&C', { font: `700 ${10.5 * k}px Inter, sans-serif`, stroke: blue }),
        // horizontal signal chains
        $(go.Shape, 'LineH', { width: 21 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [4, 3], alignment: new go.Spot(0.20, 0.54) }),
        $(go.Shape, 'LineH', { width: 21 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [4, 3], alignment: new go.Spot(0.80, 0.54) }),
        // terminal squares
        $(go.Shape, 'Rectangle', { width: 9 * k, height: 9 * k, fill: white, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.05, 0.54) }),
        $(go.Shape, 'Rectangle', { width: 9 * k, height: 9 * k, fill: white, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.95, 0.54) }),
        // upper instrumentation taps
        $(go.Shape, 'LineV', { height: 18 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [4, 3], alignment: new go.Spot(0.22, 0.25) }),
        $(go.Shape, 'LineV', { height: 18 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [4, 3], alignment: new go.Spot(0.78, 0.25) }),
        $(go.Shape, 'Circle', { width: 7 * k, height: 7 * k, fill: white, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.22, 0.05) }),
        $(go.Shape, 'Circle', { width: 7 * k, height: 7 * k, fill: white, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.78, 0.05) }),
        port('SIG_IN', new go.Spot(0, 0.54), false, true, control),
        port('SIG_OUT', new go.Spot(1, 0.54), true, false, control),
        port('SENSOR_A', new go.Spot(0.22, 0), false, true, control),
        port('SENSOR_B', new go.Spot(0.78, 0), false, true, control)
      ),
      caption()
    )
  );

  // MAINTENANCE — crossed wrench + screwdriver, drawn as actual tool outlines.
  target.nodeTemplateMap.add('Maintenance',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(68, 60) },
        $(go.Shape, {
          geometryString: 'M4 2 C9 0 14 2 17 6 L12 11 L17 16 L22 11 C25 16 24 22 20 26 L44 50 L37 57 L13 33 C7 35 2 32 0 27 C-1 22 0 18 3 15 L8 20 L13 15 L8 10 L3 15 C1 11 1 6 4 2 Z',
          desiredSize: dim(47, 55),
          fill: white,
          stroke: blue,
          strokeWidth: sw,
          alignment: new go.Spot(0.43, 0.50)
        }),
        $(go.Shape, {
          geometryString: 'M37 0 L47 10 L20 37 L12 29 Z',
          desiredSize: dim(38, 39),
          fill: white,
          stroke: blue,
          strokeWidth: sw,
          alignment: new go.Spot(0.62, 0.43)
        }),
        port('REF', new go.Spot(1, 0.5), true, true, gray)
      ),
      caption()
    )
  );

  // TANK — enclosed vertical vessel, domed ends, nozzle and two support legs.
  target.nodeTemplateMap.add('Tank',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(58, 72) },
        $(go.Shape, {
          geometryString: 'M5 12 C5 5 12 1 23 1 C34 1 41 5 41 12 L41 50 C41 57 34 61 23 61 C12 61 5 57 5 50 Z',
          desiredSize: dim(39, 61),
          fill: white,
          stroke: blue,
          strokeWidth: sw,
          alignment: new go.Spot(0.5, 0.49)
        }),
        $(go.Shape, 'LineH', { width: 33 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.24) }),
        $(go.Shape, 'LineV', { height: 8 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.03) }),
        $(go.Shape, 'LineH', { width: 10 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.5, 0.03) }),
        $(go.Shape, 'LineV', { height: 9 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.32, 0.91) }),
        $(go.Shape, 'LineV', { height: 9 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.68, 0.91) }),
        $(go.Shape, 'LineH', { width: 16 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.24, 0.99) }),
        $(go.Shape, 'LineH', { width: 16 * k, stroke: blue, strokeWidth: swFine, alignment: new go.Spot(0.76, 0.99) }),
        port('IN', new go.Spot(0.5, 0), false, true),
        port('OUT', new go.Spot(0.5, 1), true, false)
      ),
      caption()
    )
  );

  // Connection symbols in the approved legend. They remain draggable palette
  // objects for now; dedicated link-tool modes are the next step.
  target.nodeTemplateMap.add('Hydraulic Link',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(78, 24) },
        $(go.Shape, 'LineH', { width: 70 * k, stroke: blue, strokeWidth: 2 * k }),
        port('A', new go.Spot(0, 0.5), true, true),
        port('B', new go.Spot(1, 0.5), true, true)
      ),
      caption()
    )
  );

  target.nodeTemplateMap.add('Test Link',
    $(go.Node, 'Vertical', base, loc, angle,
      $(go.Panel, 'Spot', { desiredSize: dim(78, 24) },
        $(go.Shape, 'LineH', { width: 70 * k, stroke: blue, strokeWidth: swFine, strokeDashArray: [8, 5] }),
        port('A', new go.Spot(0, 0.5), true, true, blue),
        port('B', new go.Spot(1, 0.5), true, true, blue)
      ),
      caption()
    )
  );
}
