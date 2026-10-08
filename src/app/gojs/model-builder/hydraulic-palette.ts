import * as go from 'gojs';

interface PaletteNodeData {
  key: string;
  name: string;
  type: string;
  category: string;
  kbClass: string;
  groupLabel: string;
  description: string;
  source: string;
}

/**
 * Hydraulic P&ID palette presented as a compact engineering catalogue.
 * Each row keeps the component category used by the main GoJS diagram, so a
 * dragged item automatically switches to the full engineering template when
 * it is dropped on the canvas.
 */
const ITEMS: PaletteNodeData[] = [
  { key: 'tpl-motor-pump', name: 'NEW-PO', type: 'Motor Pump', category: 'Motor Pump', kbClass: 'HYDRAULIC.MOTOR_PUMP', groupLabel: 'Equipment', description: 'Motor-driven hydraulic pump', source: './pid/motor-pump.svg' },
  { key: 'tpl-reheater', name: 'NEW-RH', type: 'Reheater', category: 'Reheater', kbClass: 'HYDRAULIC.REHEATER', groupLabel: 'Equipment', description: 'Process fluid heating / reheating equipment', source: './pid/reheater.svg' },
  { key: 'tpl-reservoir', name: 'NEW-RES', type: 'Reservoir', category: 'Reservoir', kbClass: 'HYDRAULIC.RESERVOIR', groupLabel: 'Equipment', description: 'Open reservoir or water storage basin', source: './pid/reservoir.svg' },
  { key: 'tpl-tank', name: 'NEW-TANK', type: 'Tank', category: 'Tank', kbClass: 'HYDRAULIC.TANK', groupLabel: 'Equipment', description: 'Closed process storage vessel', source: './pid/tank.svg' },
  { key: 'tpl-filter', name: 'NEW-FLT', type: 'Filter', category: 'Filter', kbClass: 'HYDRAULIC.FILTER', groupLabel: 'Equipment', description: 'Removes solids or debris from the fluid', source: './pid/filter.svg' },
  { key: 'tpl-diaphragm', name: 'NEW-DIA', type: 'Diaphragm', category: 'Diaphragm', kbClass: 'HYDRAULIC.DIAPHRAGM', groupLabel: 'Equipment', description: 'Restriction / diaphragm element in process line', source: './pid/diaphragm.svg' },

  { key: 'tpl-check-valve', name: 'NEW-CV', type: 'Check Valve', category: 'Check Valve', kbClass: 'HYDRAULIC.CHECK_VALVE', groupLabel: 'Valves', description: 'Prevents reverse flow in the hydraulic line', source: './pid/check-valve.svg' },
  { key: 'tpl-manual-valve', name: 'NEW-HV', type: 'Manual Valve', category: 'Manual Valve', kbClass: 'HYDRAULIC.MANUAL_VALVE', groupLabel: 'Valves', description: 'Manually operated isolation valve', source: './pid/manual-valve.svg' },
  { key: 'tpl-motorized-valve', name: 'NEW-MOV', type: 'Motorized Valve', category: 'Motorized Valve', kbClass: 'HYDRAULIC.MOTORIZED_VALVE', groupLabel: 'Valves', description: 'Electrically actuated isolation / control valve', source: './pid/motorized-valve.svg' },
  { key: 'tpl-relief-valve', name: 'NEW-RV', type: 'Relief Valve', category: 'Relief Valve', kbClass: 'HYDRAULIC.RELIEF_VALVE', groupLabel: 'Valves', description: 'Overpressure protection / relief device', source: './pid/relief-valve.svg' },
  { key: 'tpl-kd', name: 'NEW-KD', type: 'KD', category: 'KD', kbClass: 'HYDRAULIC.KD', groupLabel: 'Valves', description: 'Project-specific in-line hydraulic device', source: './pid/kd.svg' },
  { key: 'tpl-fip', name: 'NEW-FIP', type: 'FIP', category: 'FIP', kbClass: 'HYDRAULIC.FIP', groupLabel: 'Instrumentation', description: 'Process instrumentation / interface point', source: './pid/fip.svg' },

  { key: 'tpl-source', name: 'NEW-SOURCE', type: 'Source', category: 'Source', kbClass: 'HYDRAULIC.SOURCE', groupLabel: 'Interfaces', description: 'Hydraulic source or boundary condition', source: './pid/source.svg' },
  { key: 'tpl-transfer', name: 'NEW-TRANSFER', type: 'Transfer', category: 'Transfer', kbClass: 'HYDRAULIC.TRANSFER', groupLabel: 'Interfaces', description: 'Off-page or inter-system transfer connection', source: './pid/transfer.svg' },
  { key: 'tpl-tester', name: 'NEW-TEST', type: 'Tester', category: 'Tester', kbClass: 'HYDRAULIC.TESTER', groupLabel: 'Interfaces', description: 'Test or temporary connection point', source: './pid/tester.svg' },
  { key: 'tpl-hydraulic-link', name: 'HYD-LINK', type: 'Hydraulic Link', category: 'Hydraulic Link', kbClass: 'HYDRAULIC.LINK', groupLabel: 'Connections', description: 'Standard hydraulic process connection', source: './pid/hydraulic-link.svg' },
  { key: 'tpl-test-link', name: 'TEST-LINK', type: 'Test Link', category: 'Test Link', kbClass: 'HYDRAULIC.TEST_LINK', groupLabel: 'Connections', description: 'Dedicated test / temporary connection', source: './pid/test-link.svg' },

  { key: 'tpl-ic', name: 'I&C-SUPPORT', type: 'I&C', category: 'I&C', kbClass: 'SUPPORT.IC', groupLabel: 'Support', description: 'Instrumentation and control dependency', source: './pid/ic.svg' },
  { key: 'tpl-electrical-panel', name: 'ELEC-PANEL', type: 'Electrical Supply Panel', category: 'Electrical Supply Panel', kbClass: 'SUPPORT.ELECTRICAL_SUPPLY_PANEL', groupLabel: 'Support', description: 'Electrical power supply dependency', source: './pid/electrical-supply-panel.svg' },
  { key: 'tpl-maintenance', name: 'MAINT', type: 'Maintenance', category: 'Maintenance', kbClass: 'SUPPORT.MAINTENANCE', groupLabel: 'Support', description: 'Maintenance or out-of-service state', source: './pid/maintenance.svg' }
];

export function createHydraulicPalette(host: HTMLDivElement): go.Palette {
  const $ = go.GraphObject.make;

  const palette = $(go.Palette, host, {
    contentAlignment: go.Spot.TopLeft,
    padding: new go.Margin(4, 4, 8, 4),
    initialScale: 1,
    layout: $(go.GridLayout, {
      wrappingColumn: 1,
      spacing: new go.Size(0, 3),
      cellSize: new go.Size(1, 1),
      alignment: go.GridAlignment.Position,
      sorting: go.GridSorting.Ascending,
      comparer: (a: go.Part, b: go.Part) => {
        const order = ['Equipment', 'Valves', 'Instrumentation', 'Interfaces', 'Connections', 'Support'];
        const ga = order.indexOf(a.data?.groupLabel ?? '');
        const gb = order.indexOf(b.data?.groupLabel ?? '');
        if (ga !== gb) return ga - gb;
        return String(a.data?.type ?? '').localeCompare(String(b.data?.type ?? ''));
      }
    })
  });

  const rowTemplate = $(go.Node, 'Auto', {
      cursor: 'grab',
      selectionAdorned: false,
      copyable: true,
      movable: true
    },
    $(go.Shape, 'RoundedRectangle', {
      fill: '#ffffff',
      stroke: '#d9e3ee',
      strokeWidth: 1,
      parameter1: 4
    }),
    $(go.Panel, 'Table', {
        width: 276,
        minSize: new go.Size(276, 54),
        padding: new go.Margin(4, 7, 4, 5),
        defaultAlignment: go.Spot.Left
      },
      $(go.RowColumnDefinition, { column: 0, width: 58 }),
      $(go.RowColumnDefinition, { column: 1, width: 198 }),
      $(go.Panel, 'Spot', {
          column: 0,
          width: 54,
          height: 44,
          alignment: go.Spot.Center
        },
        $(go.Picture, {
            desiredSize: new go.Size(48, 38),
            imageStretch: go.ImageStretch.Uniform,
            imageAlignment: go.Spot.Center
          },
          new go.Binding('source', 'source')
        )
      ),
      $(go.Panel, 'Vertical', {
          column: 1,
          alignment: go.Spot.Left,
          defaultAlignment: go.Spot.Left,
          stretch: go.Stretch.Horizontal
        },
        $(go.TextBlock, {
            font: '700 8px Inter, sans-serif',
            stroke: '#172033',
            maxLines: 1,
            overflow: go.TextOverflow.Ellipsis
          },
          new go.Binding('text', 'type')
        ),
        $(go.TextBlock, {
            margin: new go.Margin(3, 0, 0, 0),
            width: 194,
            font: '7px Inter, sans-serif',
            stroke: '#64748b',
            wrap: go.Wrap.Fit,
            maxLines: 2,
            overflow: go.TextOverflow.Ellipsis
          },
          new go.Binding('text', 'description')
        )
      )
    )
  );

  // The palette is a catalogue view, while the main diagram keeps the full
  // category-specific P&ID templates.  Register the same catalogue row for
  // every draggable category so all components align like a table.
  for (const category of new Set(ITEMS.map(item => item.category))) {
    palette.nodeTemplateMap.add(category, rowTemplate.copy());
  }

  const model = new go.GraphLinksModel(ITEMS);
  model.copiesKey = false;
  palette.model = model;

  return palette;
}
