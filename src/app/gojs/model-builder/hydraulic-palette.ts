import * as go from 'gojs';

interface PaletteNodeData {
  key: string;
  name: string;
  type: string;
  category: string;
}

const ITEMS: PaletteNodeData[] = [
  { key: 'tpl-pump', name: 'NEW-PUMP', type: 'Pump', category: 'Pump' },
  { key: 'tpl-motorized-valve', name: 'NEW-MV', type: 'Motorized Valve', category: 'Motorized Valve' },
  { key: 'tpl-manual-valve', name: 'NEW-HV', type: 'Manual Valve', category: 'Manual Valve' },
  { key: 'tpl-check-valve', name: 'NEW-CV', type: 'Check Valve', category: 'Check Valve' },
  { key: 'tpl-heat-exchanger', name: 'NEW-HX', type: 'Heat Exchanger', category: 'Heat Exchanger' },
  { key: 'tpl-tank', name: 'NEW-TANK', type: 'Tank / Pool', category: 'Tank / Pool' },
  { key: 'tpl-boundary', name: 'NEW-BND', type: 'Boundary', category: 'Boundary' }
];

export function createHydraulicPalette(host: HTMLDivElement): go.Palette {
  const $ = go.GraphObject.make;
  const accent = '#2563eb';

  const palette = $(go.Palette, host, {
    contentAlignment: go.Spot.TopLeft,
    padding: new go.Margin(6, 4, 6, 4),
    initialScale: 0.9,
    layout: $(go.GridLayout, {
      wrappingColumn: 2,
      spacing: new go.Size(4, 6),
      cellSize: new go.Size(94, 84),
      alignment: go.GridAlignment.Position
    })
  });

  const caption = (label: string): go.TextBlock => $(go.TextBlock, label, {
    font: '600 8px Inter, sans-serif',
    stroke: '#334155',
    margin: new go.Margin(4, 0, 0, 0),
    textAlign: 'center',
    maxSize: new go.Size(86, 28),
    wrap: go.Wrap.Fit
  });

  const base = {
    selectionAdorned: true,
    cursor: 'grab',
    background: 'transparent'
  };

  palette.nodeTemplateMap.add('Pump',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 78, height: 48 },
        $(go.Shape, 'LineH', { width: 70, stroke: '#475569', strokeWidth: 1.8 }),
        $(go.Shape, 'Circle', { width: 36, height: 36, fill: '#fff', stroke: accent, strokeWidth: 2 }),
        $(go.Shape, 'TriangleRight', { width: 13, height: 12, fill: accent, stroke: accent })
      ),
      caption('Pump')
    )
  );

  palette.nodeTemplateMap.add('Motorized Valve',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 82, height: 54 },
        $(go.Shape, 'LineH', { width: 74, stroke: '#475569', strokeWidth: 1.8, alignment: new go.Spot(0.5, 0.68) }),
        $(go.Shape, 'TriangleRight', { width: 19, height: 19, fill: '#fff', stroke: accent, strokeWidth: 1.8, alignment: new go.Spot(0.40, 0.68) }),
        $(go.Shape, 'TriangleLeft', { width: 19, height: 19, fill: '#fff', stroke: accent, strokeWidth: 1.8, alignment: new go.Spot(0.60, 0.68) }),
        $(go.Shape, 'LineV', { height: 16, stroke: '#475569', strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.43) }),
        $(go.Shape, 'RoundedRectangle', { width: 24, height: 16, fill: '#eff6ff', stroke: accent, parameter1: 3, alignment: new go.Spot(0.5, 0.16) }),
        $(go.TextBlock, 'M', { font: '700 8px Inter, sans-serif', stroke: accent, alignment: new go.Spot(0.5, 0.16) })
      ),
      caption('Motorized Valve')
    )
  );

  palette.nodeTemplateMap.add('Manual Valve',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 82, height: 54 },
        $(go.Shape, 'LineH', { width: 74, stroke: '#475569', strokeWidth: 1.8, alignment: new go.Spot(0.5, 0.70) }),
        $(go.Shape, 'TriangleRight', { width: 19, height: 19, fill: '#fff', stroke: accent, strokeWidth: 1.8, alignment: new go.Spot(0.40, 0.70) }),
        $(go.Shape, 'TriangleLeft', { width: 19, height: 19, fill: '#fff', stroke: accent, strokeWidth: 1.8, alignment: new go.Spot(0.60, 0.70) }),
        $(go.Shape, 'LineV', { height: 17, stroke: '#475569', strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.45) }),
        $(go.Shape, 'Ellipse', { width: 24, height: 8, fill: '#fff', stroke: '#475569', strokeWidth: 1.4, alignment: new go.Spot(0.5, 0.20) })
      ),
      caption('Manual Valve')
    )
  );

  palette.nodeTemplateMap.add('Check Valve',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 78, height: 44 },
        $(go.Shape, 'LineH', { width: 70, stroke: '#475569', strokeWidth: 1.8 }),
        $(go.Shape, 'TriangleRight', { width: 19, height: 19, fill: '#fff', stroke: accent, strokeWidth: 1.8, alignment: new go.Spot(0.46, 0.5) }),
        $(go.Shape, 'LineV', { height: 24, stroke: accent, strokeWidth: 2, alignment: new go.Spot(0.61, 0.5) })
      ),
      caption('Check Valve')
    )
  );

  palette.nodeTemplateMap.add('Heat Exchanger',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 78, height: 48 },
        $(go.Shape, 'LineH', { width: 70, stroke: '#475569', strokeWidth: 1.8 }),
        $(go.Shape, 'Circle', { width: 38, height: 38, fill: '#fff', stroke: accent, strokeWidth: 2 }),
        $(go.Shape, {
          geometryString: 'M 0 0 L 24 24 M 24 0 L 0 24',
          desiredSize: new go.Size(24, 24),
          stroke: accent,
          strokeWidth: 1.4
        })
      ),
      caption('Heat Exchanger')
    )
  );

  palette.nodeTemplateMap.add('Tank / Pool',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 78, height: 50 },
        $(go.Shape, {
          geometryString: 'M 10 5 L 10 42 L 60 42 L 60 5',
          desiredSize: new go.Size(50, 37),
          stroke: accent,
          strokeWidth: 2,
          fill: null
        }),
        $(go.Shape, 'LineH', { width: 38, stroke: '#60a5fa', strokeWidth: 2, alignment: new go.Spot(0.5, 0.58) })
      ),
      caption('Tank / Pool')
    )
  );

  palette.nodeTemplateMap.add('Boundary',
    $(go.Node, 'Vertical', base,
      $(go.Panel, 'Spot', { width: 78, height: 44 },
        $(go.Shape, 'LineH', { width: 56, stroke: '#475569', strokeWidth: 1.8 }),
        $(go.Shape, 'Rectangle', { width: 6, height: 34, fill: '#475569', stroke: '#475569' })
      ),
      caption('Boundary')
    )
  );

  const model = new go.GraphLinksModel(ITEMS);
  model.copiesKey = false;
  palette.model = model;
  return palette;
}
