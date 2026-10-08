import * as go from 'gojs';
import { HVAC_SYMBOLS } from './hvac-symbol-library';

interface HvacPaletteNodeData {
  key: string;
  name: string;
  type: string;
  category: string;
  kbClass: string;
  groupLabel: string;
  description: string;
  rating: string;
  source: string;
}

const ITEMS: HvacPaletteNodeData[] = HVAC_SYMBOLS.map((symbol, index) => ({
  key: `hvac-${index + 1}`,
  name: `NEW-${index + 1}`,
  type: symbol.name,
  category: symbol.category,
  kbClass: symbol.kbClass,
  groupLabel: symbol.groupLabel,
  description: symbol.description,
  rating: symbol.rating,
  source: symbol.source
}));

export function createHvacPalette(host: HTMLDivElement): go.Palette {
  const $ = go.GraphObject.make;
  const palette = $(go.Palette, host, {
    contentAlignment: go.Spot.TopLeft,
    padding: new go.Margin(4, 2, 6, 2),
    scrollMargin: new go.Margin(0),
    initialScale: 1,
    allowHorizontalScroll: false,
    hasHorizontalScrollbar: false,
    allowVerticalScroll: true,
    hasVerticalScrollbar: true,
    layout: $(go.GridLayout, {
      wrappingColumn: 1,
      // Keep layout independent from the viewport width so palette resizing
      // does not trigger horizontal-scrollbar/layout oscillation.
      wrappingWidth: 100000,
      spacing: new go.Size(0, 4),
      cellSize: new go.Size(1, 1),
      alignment: go.GridAlignment.Position,
      sorting: go.GridSorting.Ascending,
      comparer: (a: go.Part, b: go.Part) => {
        const order = ['Air Movement', 'Air Control', 'Filtration', 'Thermal Treatment', 'Air Treatment', 'Terminal & Boundary'];
        const ga = order.indexOf(a.data?.groupLabel ?? '');
        const gb = order.indexOf(b.data?.groupLabel ?? '');
        if (ga !== gb) return ga - gb;
        return String(a.data?.type ?? '').localeCompare(String(b.data?.type ?? ''));
      }
    })
  });

  const makeRowTemplate = (): go.Node => $(go.Node, 'Auto', {
      cursor: 'grab',
      selectionAdorned: false,
      copyable: true,
      movable: true,
      minSize: new go.Size(196, 60)
    },
    $(go.Shape, 'RoundedRectangle', {
      name: 'ROW_BACKGROUND',
      fill: '#ffffff',
      stroke: '#d9e3ee',
      strokeWidth: 1,
      parameter1: 4,
      stretch: go.Stretch.Fill
    }),
    $(go.Panel, 'Table', {
        name: 'ROW_TABLE',
        width: 250,
        height: 60,
        padding: new go.Margin(4, 6, 4, 4),
        defaultAlignment: go.Spot.Left
      },
      $(go.RowColumnDefinition, { column: 0, width: 52 }),
      $(go.RowColumnDefinition, { column: 1 }),
      $(go.Panel, 'Spot', {
          name: 'SYMBOL_CELL',
          column: 0,
          width: 48,
          height: 44,
          alignment: go.Spot.Center
        },
        $(go.Picture, {
            name: 'SYMBOL_PICTURE',
            desiredSize: new go.Size(38, 30),
            maxSize: new go.Size(40, 32),
            imageStretch: go.ImageStretch.Uniform,
            imageAlignment: go.Spot.Center,
            alignment: go.Spot.Center
          }, new go.Binding('source', 'source'))
      ),
      $(go.Panel, 'Vertical', {
          column: 1,
          alignment: go.Spot.Left,
          defaultAlignment: go.Spot.Left,
          stretch: go.Stretch.Horizontal
        },
        $(go.TextBlock, {
            name: 'TYPE_TEXT',
            width: 178,
            font: '700 8.6px Inter, sans-serif',
            stroke: '#172033',
            maxLines: 1,
            overflow: go.TextOverflow.Ellipsis
          }, new go.Binding('text', 'type')),
        $(go.TextBlock, {
            name: 'RATING_TEXT',
            margin: new go.Margin(2, 0, 0, 0),
            width: 178,
            font: '700 7px Inter, sans-serif',
            stroke: '#0891b2',
            maxLines: 1,
            overflow: go.TextOverflow.Ellipsis
          }, new go.Binding('text', 'rating')),
        $(go.TextBlock, {
            name: 'DESC_TEXT',
            margin: new go.Margin(2, 0, 0, 0),
            width: 178,
            font: '6.3px Inter, sans-serif',
            stroke: '#64748b',
            wrap: go.Wrap.Fit,
            maxLines: 2,
            overflow: go.TextOverflow.Ellipsis
          }, new go.Binding('text', 'description'))
      )
    )
  );

  for (const category of new Set(ITEMS.map(item => item.category))) {
    palette.nodeTemplateMap.add(category, makeRowTemplate());
  }

  const model = new go.GraphLinksModel(ITEMS);
  model.copiesKey = false;
  palette.model = model;

  const syncRowWidths = (): void => {
    const rowWidth = Math.max(196, host.clientWidth - 10);
    const narrow = rowWidth < 250;
    const symbolColumn = narrow ? 48 : 52;
    const textWidth = Math.max(126, rowWidth - symbolColumn - 16);
    const pictureWidth = narrow ? 34 : 38;
    const pictureHeight = narrow ? 27 : 30;

    palette.nodes.each(node => {
      const row = node.findObject('ROW_TABLE');
      const symbolCell = node.findObject('SYMBOL_CELL');
      const picture = node.findObject('SYMBOL_PICTURE') as go.Picture | null;
      const typeText = node.findObject('TYPE_TEXT') as go.TextBlock | null;
      const ratingText = node.findObject('RATING_TEXT') as go.TextBlock | null;
      const descText = node.findObject('DESC_TEXT') as go.TextBlock | null;
      if (row) row.width = rowWidth;
      if (symbolCell) symbolCell.width = symbolColumn - 4;
      if (picture) {
        picture.desiredSize = new go.Size(pictureWidth, pictureHeight);
        picture.maxSize = new go.Size(pictureWidth + 2, pictureHeight + 2);
      }
      if (typeText) typeText.width = textWidth;
      if (ratingText) ratingText.width = textWidth;
      if (descText) descText.width = textWidth;
    });
    palette.requestUpdate();
  };

  palette.addDiagramListener('InitialLayoutCompleted', syncRowWidths);
  const resizeObserver = new ResizeObserver(() => syncRowWidths());
  resizeObserver.observe(host);
  setTimeout(syncRowWidths);
  return palette;
}
