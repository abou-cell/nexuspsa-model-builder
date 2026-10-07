import * as go from 'gojs';
import { HYDRAULIC_COMPONENT_CLASSES } from '../../core/knowledge-base/hydraulic-knowledge-base';
import { installHydraulicPidTemplates } from './hydraulic-pid-symbols';

interface PaletteNodeData {
  key: string;
  name: string;
  type: string;
  category: string;
  kbClass: string;
  groupLabel: string;
}

const DEFAULT_NAMES: Record<string, string> = {
  'Pump': 'NEW-PO',
  'Vertical Pump': 'NEW-VP',
  'Motorized Valve': 'NEW-MOV',
  'Manual Valve': 'NEW-HV',
  'Check Valve': 'NEW-CV',
  'Control Valve': 'NEW-CVLV',
  'Relief Valve': 'NEW-RV',
  'Heat Exchanger': 'NEW-HX',
  'Filter / Strainer': 'NEW-FLT',
  'Tank / Vessel': 'NEW-TANK',
  'Pool / Source': 'NEW-POOL',
  'Instrument': 'NEW-INST',
  'Flow Element': 'NEW-FE',
  'Pipe Junction': 'NEW-JCT',
  'Off-page Connector': 'NEW-OFFPAGE',
  'Boundary': 'NEW-BND'
};

const ITEMS: PaletteNodeData[] = HYDRAULIC_COMPONENT_CLASSES.map((component, index) => ({
  key: `tpl-${index}-${component.type.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: DEFAULT_NAMES[component.type] ?? `NEW-${index + 1}`,
  type: component.type,
  category: component.type,
  kbClass: component.id,
  groupLabel: component.group
}));

export function createHydraulicPalette(host: HTMLDivElement): go.Palette {
  const $ = go.GraphObject.make;

  const palette = $(go.Palette, host, {
    contentAlignment: go.Spot.TopLeft,
    padding: new go.Margin(8, 5, 8, 5),
    initialScale: 0.92,
    layout: $(go.GridLayout, {
      wrappingColumn: 2,
      spacing: new go.Size(6, 9),
      cellSize: new go.Size(102, 92),
      alignment: go.GridAlignment.Position,
      sorting: go.GridSorting.Ascending,
      comparer: (a: go.Part, b: go.Part) => {
        const order = ['Equipment', 'Valves', 'Instrumentation', 'Interfaces'];
        const ga = order.indexOf(a.data?.groupLabel ?? '');
        const gb = order.indexOf(b.data?.groupLabel ?? '');
        if (ga !== gb) return ga - gb;
        return String(a.data?.type ?? '').localeCompare(String(b.data?.type ?? ''));
      }
    })
  });

  installHydraulicPidTemplates(palette, { palette: true, accent: '#2563eb' });

  const model = new go.GraphLinksModel(ITEMS);
  model.copiesKey = false;
  palette.model = model;

  return palette;
}
