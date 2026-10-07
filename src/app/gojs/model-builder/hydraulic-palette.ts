import * as go from 'gojs';
import { installHydraulicPidTemplates } from './hydraulic-pid-symbols';
import { installValidatedHydraulicTemplates } from './validated-hydraulic-symbols';
import { installApprovedPidSymbols } from './approved-pid-symbols';

interface PaletteNodeData {
  key: string;
  name: string;
  type: string;
  category: string;
  kbClass: string;
  groupLabel: string;
}

/**
 * Palette validated by the user from the P&ID symbol review sheet.
 * Hydraulic Link and Test Link are currently represented as draggable visual
 * tools; they can later be promoted to dedicated link-tool modes.
 */
const ITEMS: PaletteNodeData[] = [
  { key: 'tpl-motor-pump', name: 'NEW-PO', type: 'Motor Pump', category: 'Motor Pump', kbClass: 'HYDRAULIC.MOTOR_PUMP', groupLabel: 'Equipment' },
  { key: 'tpl-reheater', name: 'NEW-RH', type: 'Reheater', category: 'Reheater', kbClass: 'HYDRAULIC.REHEATER', groupLabel: 'Equipment' },
  { key: 'tpl-reservoir', name: 'NEW-RES', type: 'Reservoir', category: 'Reservoir', kbClass: 'HYDRAULIC.RESERVOIR', groupLabel: 'Equipment' },
  { key: 'tpl-tank', name: 'NEW-TANK', type: 'Tank', category: 'Tank', kbClass: 'HYDRAULIC.TANK', groupLabel: 'Equipment' },
  { key: 'tpl-filter', name: 'NEW-FLT', type: 'Filter', category: 'Filter', kbClass: 'HYDRAULIC.FILTER', groupLabel: 'Equipment' },
  { key: 'tpl-diaphragm', name: 'NEW-DIA', type: 'Diaphragm', category: 'Diaphragm', kbClass: 'HYDRAULIC.DIAPHRAGM', groupLabel: 'Equipment' },

  { key: 'tpl-check-valve', name: 'NEW-CV', type: 'Check Valve', category: 'Check Valve', kbClass: 'HYDRAULIC.CHECK_VALVE', groupLabel: 'Valves' },
  { key: 'tpl-manual-valve', name: 'NEW-HV', type: 'Manual Valve', category: 'Manual Valve', kbClass: 'HYDRAULIC.MANUAL_VALVE', groupLabel: 'Valves' },
  { key: 'tpl-motorized-valve', name: 'NEW-MOV', type: 'Motorized Valve', category: 'Motorized Valve', kbClass: 'HYDRAULIC.MOTORIZED_VALVE', groupLabel: 'Valves' },
  { key: 'tpl-relief-valve', name: 'NEW-RV', type: 'Relief Valve', category: 'Relief Valve', kbClass: 'HYDRAULIC.RELIEF_VALVE', groupLabel: 'Valves' },
  { key: 'tpl-kd', name: 'NEW-KD', type: 'KD', category: 'KD', kbClass: 'HYDRAULIC.KD', groupLabel: 'Valves' },
  { key: 'tpl-fip', name: 'NEW-FIP', type: 'FIP', category: 'FIP', kbClass: 'HYDRAULIC.FIP', groupLabel: 'Instrumentation' },

  { key: 'tpl-source', name: 'NEW-SOURCE', type: 'Source', category: 'Source', kbClass: 'HYDRAULIC.SOURCE', groupLabel: 'Interfaces' },
  { key: 'tpl-transfer', name: 'NEW-TRANSFER', type: 'Transfer', category: 'Transfer', kbClass: 'HYDRAULIC.TRANSFER', groupLabel: 'Interfaces' },
  { key: 'tpl-tester', name: 'NEW-TEST', type: 'Tester', category: 'Tester', kbClass: 'HYDRAULIC.TESTER', groupLabel: 'Interfaces' },
  { key: 'tpl-hydraulic-link', name: 'HYD-LINK', type: 'Hydraulic Link', category: 'Hydraulic Link', kbClass: 'HYDRAULIC.LINK', groupLabel: 'Connections' },
  { key: 'tpl-test-link', name: 'TEST-LINK', type: 'Test Link', category: 'Test Link', kbClass: 'HYDRAULIC.TEST_LINK', groupLabel: 'Connections' },

  { key: 'tpl-ic', name: 'I&C-SUPPORT', type: 'I&C', category: 'I&C', kbClass: 'SUPPORT.IC', groupLabel: 'Support' },
  { key: 'tpl-electrical-panel', name: 'ELEC-PANEL', type: 'Electrical Supply Panel', category: 'Electrical Supply Panel', kbClass: 'SUPPORT.ELECTRICAL_SUPPLY_PANEL', groupLabel: 'Support' },
  { key: 'tpl-maintenance', name: 'MAINT', type: 'Maintenance', category: 'Maintenance', kbClass: 'SUPPORT.MAINTENANCE', groupLabel: 'Support' }
];

export function createHydraulicPalette(host: HTMLDivElement): go.Palette {
  const $ = go.GraphObject.make;

  const palette = $(go.Palette, host, {
    contentAlignment: go.Spot.TopLeft,
    padding: new go.Margin(8, 5, 8, 5),
    initialScale: 0.9,
    layout: $(go.GridLayout, {
      wrappingColumn: 2,
      spacing: new go.Size(6, 9),
      cellSize: new go.Size(108, 94),
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

  installHydraulicPidTemplates(palette, { palette: true, accent: '#1d4ed8' });
  installValidatedHydraulicTemplates(palette, { palette: true, accent: '#1d4ed8' });

  // Approved symbols are installed last so they override earlier approximations.
  // The Motor Pump now renders from the exact SVG master validated by the user.
  installApprovedPidSymbols(palette, { palette: true });

  const model = new go.GraphLinksModel(ITEMS);
  model.copiesKey = false;
  palette.model = model;

  return palette;
}
