import * as go from 'gojs';

export interface ApprovedPidSymbolOptions {
  palette?: boolean;
}

/**
 * Approved P&ID symbols.
 *
 * Workflow:
 * 1. validate the SVG master outside GoJS;
 * 2. render that exact SVG in GoJS as a Picture;
 * 3. overlay invisible ports for editor interactions.
 *
 * This avoids proportional drift caused by composing a symbol from multiple
 * independently stretched GoJS primitives.
 */
export function installApprovedPidSymbols(
  target: go.Diagram | go.Palette,
  options: ApprovedPidSymbolOptions = {}
): void {
  const $ = go.GraphObject.make;
  const palette = options.palette ?? false;
  const k = palette ? 0.9 : 1;

  const locationBinding = new go.Binding('location', 'loc', go.Point.parse)
    .makeTwoWay(go.Point.stringify);
  const angleBinding = new go.Binding('angle', 'angle').makeTwoWay();

  const setPortsVisible = (node: go.Node | null, visible: boolean): void => {
    if (!node || palette) return;
    node.ports.each(portObject => {
      portObject.opacity = visible ? 1 : 0;
    });
  };

  const nodeBehavior = (rotatable: boolean) => ({
    locationSpot: go.Spot.Center,
    selectionAdorned: true,
    resizable: false,
    rotatable: !palette && rotatable,
    cursor: palette ? 'grab' : 'move',
    selectionChanged: (part: go.Part) => setPortsVisible(part as go.Node, part.isSelected),
    mouseEnter: (_e: go.InputEvent, obj: go.GraphObject) => setPortsVisible(obj.part as go.Node, true),
    mouseLeave: (_e: go.InputEvent, obj: go.GraphObject) => {
      const node = obj.part as go.Node;
      setPortsVisible(node, node.isSelected);
    }
  });

  const port = (
    id: string,
    spot: go.Spot,
    from: boolean,
    to: boolean,
    stroke: string
  ): go.Shape => $(go.Shape, 'Circle', {
    alignment: spot,
    width: 6 * k,
    height: 6 * k,
    fill: '#ffffff',
    stroke,
    strokeWidth: 1.1,
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
    stroke: '#172033',
    textAlign: 'center',
    editable: !palette,
    maxSize: new go.Size((palette ? 104 : 126) * k, NaN)
  }, palette
    ? new go.Binding('text', 'type')
    : new go.Binding('text', 'name').makeTwoWay());

  // 01 — MOTOR PUMP (validated)
  target.nodeTemplateMap.add('Motor Pump',
    $(go.Node, 'Vertical',
      nodeBehavior(false),
      locationBinding,
      $(go.Panel, 'Spot',
        {
          width: 100 * k,
          height: 80 * k
        },
        $(go.Picture, './pid/motor-pump.svg', {
          desiredSize: new go.Size(100 * k, 80 * k),
          imageStretch: go.ImageStretch.Uniform,
          imageAlignment: go.Spot.Center
        }),
        port('IN', new go.Spot(0, 0.675), false, true, '#1647ff'),
        port('OUT', new go.Spot(1, 0.675), true, false, '#1647ff'),
        port('PWR', new go.Spot(0.5, 0.01), false, true, '#0f172a'),
        port('CTRL', new go.Spot(0.74, 0.18), false, true, '#7c3aed')
      ),
      caption()
    )
  );

  // 02 — CHECK VALVE (candidate for validation)
  // Exact SVG silhouette traced from the user's reference legend.
  target.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical',
      nodeBehavior(true),
      locationBinding,
      angleBinding,
      $(go.Panel, 'Spot',
        {
          width: 100 * k,
          height: 60 * k
        },
        $(go.Picture, './pid/check-valve.svg', {
          desiredSize: new go.Size(100 * k, 60 * k),
          imageStretch: go.ImageStretch.Uniform,
          imageAlignment: go.Spot.Center
        }),
        port('IN', new go.Spot(0.06, 0.52), false, true, '#1647ff'),
        port('OUT', new go.Spot(0.94, 0.52), true, false, '#1647ff')
      ),
      caption()
    )
  );
}
