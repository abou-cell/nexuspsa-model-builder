import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as go from 'gojs';
import {
  GeneratedFaultTreeModel,
  GeneratedFaultTreeNode
} from '../../core/ft-generation/ft-generation.models';

type FtLayoutMode = 'LEFT' | 'CENTERED';
type EditorNode = GeneratedFaultTreeNode & {
  k?: number;
  negated?: boolean;
  tagColor?: string | null;
};

const AND_GEOMETRY = 'F M8 34 L8 18 Q8 6 20 6 L40 6 Q52 6 52 18 L52 34 Z';
const OR_GEOMETRY = 'F M6 34 Q12 18 28 8 Q44 18 50 34 Q28 28 6 34 Z';
const HOUSE_EVENT_GEOMETRY = 'F M22 0 L42 15 L42 38 L2 38 L2 15 Z';
const TRANSFER_GEOMETRY = 'F M22 0 L42 38 L2 38 Z';

class RiskSpectrumBranchLink extends go.Link {
  static readonly PARENT_DROP = 20;

  override computePoints(): boolean {
    const fromPort = this.fromPort;
    const toPort = this.toPort;
    if (!fromPort || !toPort) return super.computePoints();

    const start = fromPort.getDocumentPoint(go.Spot.Center);
    const end = toPort.getDocumentPoint(go.Spot.Center);
    if (![start.x, start.y, end.x, end.y].every(Number.isFinite)) {
      return super.computePoints();
    }

    this.clearPoints();
    this.addPoint(start);

    if (Math.abs(start.x - end.x) < 0.5) {
      this.addPoint(end);
      return true;
    }

    const railY = start.y + RiskSpectrumBranchLink.PARENT_DROP;
    this.addPoint(new go.Point(start.x, railY));
    this.addPoint(new go.Point(end.x, railY));
    this.addPoint(end);
    return true;
  }
}

@Component({
  selector: 'app-nexus-fault-tree-editor',
  standalone: true,
  template: `
    <div class="ft-shell">
      <section class="diagram-shell">
        <div class="diagram-toolbar">
          <div class="toolbar-group">
            <button type="button" title="Undo" (click)="undo()">↶</button>
            <button type="button" title="Redo" (click)="redo()">↷</button>
          </div>
          <div class="toolbar-separator"></div>
          <div class="toolbar-group">
            <button type="button" title="Zoom out" (click)="zoom(-0.1)">−</button>
            <span class="zoom-label">{{ zoomPercent }}%</span>
            <button type="button" title="Zoom in" (click)="zoom(0.1)">+</button>
            <button type="button" (click)="fit()">Fit</button>
            <button
              type="button"
              class="negate-button"
              [class.active]="selectedNegated"
              [disabled]="!canNegateSelection"
              title="Toggle Negate / NOT on selected component"
              (click)="toggleNegateSelection()">
              {{ selectedNegated ? '✓ Negate' : '○ Negate' }}
            </button>

            <div class="tag-color-control" [class.open]="tagPaletteOpen">
              <button type="button" class="tag-color-button" title="Tag colour" (click)="tagPaletteOpen = !tagPaletteOpen">
                <span class="tag-color-preview" [style.background]="activeTagColor"></span>
                <span>▾</span>
              </button>
              <div class="tag-color-menu">
                <button type="button" *ngFor="let color of tagColors" (click)="applyTag(color)">
                  <span [style.background]="color"></span>
                </button>
              </div>
            </div>

            <button type="button" class="layout-toggle" [class.active]="layoutMode === 'LEFT'"
                    title="Left-aligned RiskSpectrum layout" (click)="setLayoutMode('LEFT')">
              <svg viewBox="0 0 26 18"><path d="M5 2v5h16M5 7v9M13 7v9M21 7v9"></path></svg>
            </button>
            <button type="button" class="layout-toggle" [class.active]="layoutMode === 'CENTERED'"
                    title="Centered pyramid layout" (click)="setLayoutMode('CENTERED')">
              <svg viewBox="0 0 26 18"><path d="M13 2v5M4 7h18M4 7v9M13 7v9M22 7v9"></path></svg>
            </button>
            <button type="button" class="properties-toggle" title="Open properties" (click)="propertiesRequested.emit()">
              <svg viewBox="0 0 24 24">
                <path d="M4 5h10M18 5h2M4 12h2M10 12h10M4 19h7M15 19h5"></path>
                <circle cx="16" cy="5" r="2"></circle>
                <circle cx="8" cy="12" r="2"></circle>
                <circle cx="13" cy="19" r="2"></circle>
              </svg>
            </button>
          </div>
          <div class="toolbar-group push-right"><span class="status-dot"></span> GoJS Fault Tree</div>
        </div>

        <div class="palette-toolbar">
          <div class="palette-toolbar-left"><strong>Fault Tree Symbols</strong></div>
          <div class="palette-toolbar-center">
            <div #paletteDiv class="palette-toolbar-canvas" aria-label="Fault Tree symbol palette"></div>
          </div>
          <div class="palette-toolbar-right">
            <span>{{ selectedParentId ? ('Parent: ' + selectedParentId + ' → drag a symbol') : 'Select a Gate, then drag a symbol' }}</span>
          </div>
        </div>

        <div #diagramDiv class="diagram-canvas" aria-label="NexusPSA fault tree diagram"></div>
      </section>
    </div>
  `,
  styles: [`
    :host{display:block;height:100%;min-height:0;overflow:hidden}
    .ft-shell{height:100%;min-height:0;overflow:hidden;background:#fff}
    .diagram-shell{height:100%;min-width:0;min-height:0;overflow:hidden;display:grid;grid-template-rows:42px 56px minmax(0,1fr)}
    .diagram-toolbar{display:flex;align-items:center;gap:10px;padding:0 10px;border-bottom:1px solid var(--nps-border);background:#fff;color:var(--nps-text-muted);font-size:10px}
    .toolbar-group{display:flex;align-items:center;gap:5px}.toolbar-separator{width:1px;height:25px;background:var(--nps-border)}
    .toolbar-group button{height:28px;min-width:30px;border:1px solid var(--nps-border);border-radius:6px;background:#fff;color:var(--nps-text);cursor:pointer;font-weight:600}
    .toolbar-group button:hover{background:#eef5ff;border-color:#b6cdf7}.toolbar-group button:disabled{opacity:.4;cursor:default}
    .push-right{margin-left:auto}.status-dot{width:7px;height:7px;border-radius:50%;background:#22c55e}.zoom-label{min-width:36px;text-align:center;color:#64748b}
    .negate-button{min-width:72px!important;padding:0 8px}.negate-button.active{color:#0f5bd8;border-color:#6ea2f8!important;background:#eaf2ff!important}
    .tag-color-control{position:relative;display:inline-flex}.tag-color-button{width:54px;display:flex;align-items:center;justify-content:space-between;padding:3px 5px}
    .tag-color-preview{width:30px;height:14px;border:1px solid #111827;display:inline-block}.tag-color-menu{position:absolute;top:31px;left:0;z-index:50;display:none;flex-direction:column;gap:2px;padding:3px;border:1px solid #94a3b8;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.18)}
    .tag-color-control.open .tag-color-menu{display:flex}.tag-color-menu button{width:48px!important;min-width:48px!important;height:20px!important;padding:1px 3px!important;border-radius:0!important}.tag-color-menu span{display:block;width:38px;height:14px;border:1px solid #334155}
    .layout-toggle,.properties-toggle{width:34px;min-width:34px!important;padding:4px!important;display:flex;align-items:center;justify-content:center}.layout-toggle svg,.properties-toggle svg{width:24px;height:17px;fill:none;stroke:currentColor;stroke-width:2}
    .layout-toggle.active{color:#0f5bd8;border-color:#6ea2f8!important;background:#eaf2ff!important}
    .palette-toolbar{display:grid;grid-template-columns:220px minmax(500px,1fr) 270px;align-items:center;border-bottom:1px solid var(--nps-border);background:#fbfdff;overflow:hidden}
    .palette-toolbar-left{padding:0 12px}.palette-toolbar-left strong{font-size:12px;color:#111827}.palette-toolbar-center{height:55px;min-width:0;overflow:hidden}.palette-toolbar-canvas{width:100%;height:55px;background:#fbfdff}
    .palette-toolbar-right{padding:0 12px;text-align:right;color:#6b7d93;font-size:9px;white-space:nowrap}.diagram-canvas{width:100%;height:100%;min-height:0;background:#fff}
    @media(max-width:1200px){.palette-toolbar{grid-template-columns:170px minmax(420px,1fr) 220px}.palette-toolbar-right{font-size:8px}}
  `]
})
export class NexusFaultTreeEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) private diagramDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('paletteDiv', { static: true }) private paletteDiv!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) model!: GeneratedFaultTreeModel;
  @Input() readOnly = false;
  @Output() readonly selectedNodeChange = new EventEmitter<GeneratedFaultTreeNode | null>();
  @Output() readonly propertiesRequested = new EventEmitter<void>();

  zoomPercent = 100;
  layoutMode: FtLayoutMode = 'CENTERED';
  tagPaletteOpen = false;
  activeTagColor = '#fff200';
  readonly tagColors = ['#fff200', '#ffb4a8', '#ffd6a3', '#73e3ea', '#48c4d4'];
  selectedParentId: string | null = null;
  selectedNegated = false;
  canNegateSelection = false;

  private diagram?: go.Diagram;
  private palette?: go.Palette;
  private serial = 0;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.diagram = this.createDiagram(this.diagramDiv.nativeElement);
    this.palette = this.createPalette(this.paletteDiv.nativeElement);
    this.applyModel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && !changes['model'].firstChange) this.applyModel();
  }

  undo(): void { this.diagram?.commandHandler.undo(); }
  redo(): void { this.diagram?.commandHandler.redo(); }

  zoom(delta: number): void {
    if (!this.diagram) return;
    this.diagram.scale = Math.max(.25, Math.min(3, this.diagram.scale + delta));
    this.updateZoomLabel();
  }

  fit(): void {
    this.diagram?.commandHandler.zoomToFit();
    this.updateZoomLabel();
  }

  setLayoutMode(mode: FtLayoutMode): void {
    this.layoutMode = mode;
    if (!this.diagram) return;
    this.diagram.layout = this.makeLayout(mode);
    this.diagram.layoutDiagram(true);
    this.fit();
  }

  toggleNegateSelection(): void {
    if (!this.diagram || !this.canNegateSelection) return;
    const node = this.diagram.selection.first();
    if (!(node instanceof go.Node)) return;
    const data = node.data as EditorNode;
    this.diagram.model.commit(model => model.set(data, 'negated', !data.negated), 'Toggle negate');
    this.syncSelectionState(node);
  }

  applyTag(color: string): void {
    this.activeTagColor = color;
    this.tagPaletteOpen = false;
    const node = this.diagram?.selection.first();
    if (!(node instanceof go.Node) || !this.diagram) return;
    this.diagram.model.commit(model => model.set(node.data, 'tagColor', color), 'Tag FT record');
  }

  private createDiagram(host: HTMLDivElement): go.Diagram {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, host, {
      'undoManager.isEnabled': true,
      allowDrop: !this.readOnly,
      allowSelect: true,
      allowZoom: true,
      isReadOnly: this.readOnly,
      minScale: .25,
      maxScale: 3,
      padding: 38,
      layout: this.makeLayout(this.layoutMode)
    });

    diagram.toolManager.mouseWheelBehavior = go.WheelMode.Zoom;
    diagram.linkTemplate = $(RiskSpectrumBranchLink,
      { selectable: false, fromSpot: go.Spot.Bottom, toSpot: go.Spot.Top },
      $(go.Shape, { stroke: '#1f2937', strokeWidth: 1.05 })
    );

    const inputPort = () => $(go.Shape, 'Rectangle', {
      portId: 'IN', width: 1, height: 1, fill: null, stroke: null,
      toLinkable: true, toSpot: go.Spot.Top
    });
    const outputPort = () => $(go.Shape, 'Rectangle', {
      portId: 'OUT', width: 1, height: 1, fill: null, stroke: null,
      fromLinkable: true, fromSpot: go.Spot.Bottom
    });

    const recordBox = (top = false) => $(go.Panel, 'Auto',
      { name: 'RECORD', margin: new go.Margin(0, 0, 5, 0) },
      $(go.Shape, 'Rectangle', {
        fill: top ? '#d9d9d9' : '#f8f8f8',
        stroke: '#111827',
        strokeWidth: 1,
        minSize: new go.Size(132, 54)
      }, new go.Binding('fill', 'tagColor', c => c || (top ? '#d9d9d9' : '#f8f8f8'))),
      $(go.Panel, 'Vertical', { margin: 5, width: 122 },
        $(go.TextBlock, {
          width: 122, font: '8px Arial, sans-serif', stroke: '#111827',
          wrap: go.Wrap.Fit, maxLines: 3, overflow: go.TextOverflow.Ellipsis
        }, new go.Binding('text', 'description')),
        $(go.TextBlock, {
          margin: new go.Margin(4, 0, 0, 0), width: 122,
          font: '7px Arial, sans-serif', stroke: '#374151', textAlign: 'center'
        }, new go.Binding('text', 'id'))
      )
    );

    const gateArtwork = () => $(go.Panel, 'Spot',
      { width: 48, height: 38 },
      $(go.Shape, {
        width: 46, height: 34, fill: '#fff', stroke: '#111827', strokeWidth: 1.2
      }, new go.Binding('geometryString', 'gateType', (type: string) => type === 'AND' ? AND_GEOMETRY : OR_GEOMETRY)),
      $(go.TextBlock, {
        font: '700 7px Arial, sans-serif', stroke: '#111827',
        visible: false
      },
        new go.Binding('visible', 'gateType', type => type === 'KOFN'),
        new go.Binding('text', 'k', k => `${k ?? 2}/N`)
      )
    );

    const commonNode = {
      selectionAdorned: true,
      selectionObjectName: 'RECORD',
      deletable: !this.readOnly,
      movable: false
    };

    diagram.nodeTemplateMap.add('TOP_EVENT', $(go.Node, 'Vertical', commonNode,
      inputPort(), recordBox(true), gateArtwork(), outputPort()
    ));
    diagram.nodeTemplateMap.add('GATE', $(go.Node, 'Vertical', commonNode,
      inputPort(), recordBox(false), gateArtwork(), outputPort()
    ));
    diagram.nodeTemplateMap.add('BASIC_EVENT', $(go.Node, 'Vertical', commonNode,
      inputPort(), recordBox(false),
      $(go.Shape, 'Circle', { width: 34, height: 34, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 })
    ));
    diagram.nodeTemplateMap.add('HOUSE_EVENT', $(go.Node, 'Vertical', commonNode,
      inputPort(), recordBox(false),
      $(go.Shape, { width: 38, height: 34, geometryString: HOUSE_EVENT_GEOMETRY, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 })
    ));
    diagram.nodeTemplateMap.add('TRANSFER', $(go.Node, 'Vertical', commonNode,
      inputPort(), recordBox(false),
      $(go.Shape, { width: 38, height: 34, geometryString: TRANSFER_GEOMETRY, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 })
    ));

    diagram.addDiagramListener('ChangedSelection', () => {
      const part = diagram.selection.first();
      this.zone.run(() => {
        const data = part instanceof go.Node ? part.data as EditorNode : null;
        this.selectedNodeChange.emit(data);
        this.syncSelectionState(part instanceof go.Node ? part : null);
      });
    });

    diagram.addDiagramListener('ViewportBoundsChanged', () => this.zone.run(() => this.updateZoomLabel()));

    diagram.addDiagramListener('ExternalObjectsDropped', () => {
      if (this.readOnly) return;
      const dropped: go.Node[] = [];
      diagram.selection.each(part => { if (part instanceof go.Node) dropped.push(part); });
      const parent = this.findSelectedParentExcluding(dropped);

      diagram.startTransaction('Normalize FT palette drop');
      for (const node of dropped) {
        const data = node.data as EditorNode;
        const serial = ++this.serial;
        const prefix = data.category === 'BASIC_EVENT' ? 'BE'
          : data.category === 'HOUSE_EVENT' ? 'HE'
          : data.category === 'TRANSFER' ? 'XFR'
          : 'G';
        const newKey = `FTNODE-${prefix}-${serial}`;
        const newId = `NEW-${prefix}-${String(serial).padStart(3, '0')}`;
        (diagram.model as go.GraphLinksModel).setKeyForNodeData(data, newKey);
        diagram.model.set(data, 'id', newId);
        diagram.model.set(data, 'description', `New ${data.category.toLowerCase().replace('_', ' ')}`);

        if (parent) {
          (diagram.model as go.GraphLinksModel).addLinkData({
            key: `L-${parent.key}-${newKey}`,
            from: String(parent.key), to: newKey, fromPort: 'OUT', toPort: 'IN'
          });
        }
      }
      diagram.commitTransaction('Normalize FT palette drop');
      diagram.layoutDiagram(true);
    });

    return diagram;
  }

  private createPalette(host: HTMLDivElement): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette, host, {
      layout: $(go.GridLayout, {
        wrappingRow: 1,
        spacing: new go.Size(18, 0),
        alignment: go.GridAlignment.Position
      }),
      contentAlignment: go.Spot.Center,
      initialScale: .82
    });

    const gateTemplate = $(go.Node, 'Vertical',
      $(go.Shape, { width: 38, height: 28, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 },
        new go.Binding('geometryString', 'gateType', (type: string) => type === 'AND' ? AND_GEOMETRY : OR_GEOMETRY)),
      $(go.TextBlock, { font: '7px Arial, sans-serif', margin: new go.Margin(2,0,0,0) }, new go.Binding('text', 'label'))
    );
    const circleTemplate = $(go.Node, 'Vertical',
      $(go.Shape, 'Circle', { width: 28, height: 28, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 }),
      $(go.TextBlock, { font: '7px Arial, sans-serif', margin: new go.Margin(2,0,0,0) }, new go.Binding('text', 'label'))
    );
    const houseTemplate = $(go.Node, 'Vertical',
      $(go.Shape, { width: 30, height: 27, geometryString: HOUSE_EVENT_GEOMETRY, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 }),
      $(go.TextBlock, { font: '7px Arial, sans-serif', margin: new go.Margin(2,0,0,0) }, new go.Binding('text', 'label'))
    );
    const transferTemplate = $(go.Node, 'Vertical',
      $(go.Shape, { width: 30, height: 27, geometryString: TRANSFER_GEOMETRY, fill: '#fff', stroke: '#111827', strokeWidth: 1.2 }),
      $(go.TextBlock, { font: '7px Arial, sans-serif', margin: new go.Margin(2,0,0,0) }, new go.Binding('text', 'label'))
    );

    palette.nodeTemplateMap.add('GATE', gateTemplate);
    palette.nodeTemplateMap.add('BASIC_EVENT', circleTemplate);
    palette.nodeTemplateMap.add('HOUSE_EVENT', houseTemplate);
    palette.nodeTemplateMap.add('TRANSFER', transferTemplate);

    const model = new go.GraphLinksModel([
      { key: 'PAL-OR', category: 'GATE', id: 'OR gate', label: 'OR', description: 'OR gate', state: 'NORMAL', gateType: 'OR', recordType: 'GAT' },
      { key: 'PAL-AND', category: 'GATE', id: 'AND gate', label: 'AND', description: 'AND gate', state: 'NORMAL', gateType: 'AND', recordType: 'GAT' },
      { key: 'PAL-KN', category: 'GATE', id: 'K/N gate', label: 'K/N', description: 'K/N gate', state: 'NORMAL', gateType: 'KOFN', k: 2, recordType: 'GAT' },
      { key: 'PAL-BE', category: 'BASIC_EVENT', id: 'Basic Event', label: 'BE', description: 'Basic Event', state: 'NORMAL', recordType: 'BEV' },
      { key: 'PAL-HE', category: 'HOUSE_EVENT', id: 'House Event', label: 'HE', description: 'House Event', state: 'NORMAL', recordType: 'HEV' },
      { key: 'PAL-XFR', category: 'TRANSFER', id: 'Transfer', label: 'Transfer', description: 'Transfer', state: 'NORMAL', recordType: 'FTR' }
    ]);
    model.nodeCategoryProperty = 'category';
    palette.model = model;
    return palette;
  }

  private makeLayout(mode: FtLayoutMode): go.TreeLayout {
    return new go.TreeLayout({
      angle: 90,
      layerSpacing: 62,
      nodeSpacing: 30,
      alignment: mode === 'CENTERED' ? go.TreeAlignment.CenterChildren : go.TreeAlignment.Start,
      arrangement: go.TreeArrangement.FixedRoots,
      setsPortSpot: false,
      setsChildPortSpot: false
    });
  }

  private applyModel(): void {
    if (!this.diagram || !this.model) return;

    const graphModel = new go.GraphLinksModel(
      this.model.nodes.map(node => ({ ...node })),
      this.model.links.map(link => ({ ...link, fromPort: 'OUT', toPort: 'IN' }))
    );
    graphModel.nodeCategoryProperty = 'category';
    graphModel.linkKeyProperty = 'key';
    graphModel.linkFromPortIdProperty = 'fromPort';
    graphModel.linkToPortIdProperty = 'toPort';

    this.diagram.model = graphModel;
    this.diagram.layout = this.makeLayout(this.layoutMode);
    this.diagram.layoutDiagram(true);
    setTimeout(() => this.fit());
  }

  private findSelectedParentExcluding(excluded: readonly go.Node[]): go.Node | null {
    if (!this.diagram) return null;
    const excludedKeys = new Set(excluded.map(node => String(node.key)));
    let candidate: go.Node | null = null;
    this.diagram.nodes.each(node => {
      if (excludedKeys.has(String(node.key))) return;
      const data = node.data as EditorNode;
      if ((data.category === 'TOP_EVENT' || data.category === 'GATE') && node.isSelected) {
        candidate = node;
      }
    });
    if (candidate) return candidate;

    const top = this.diagram.findNodeForKey('TOP-0001');
    return top instanceof go.Node ? top : null;
  }

  private syncSelectionState(node: go.Node | null): void {
    const data = node?.data as EditorNode | undefined;
    this.selectedParentId =
      data && (data.category === 'TOP_EVENT' || data.category === 'GATE')
        ? data.id
        : null;
    this.canNegateSelection = Boolean(data && data.category !== 'TOP_EVENT');
    this.selectedNegated = Boolean(data?.negated);
  }

  private updateZoomLabel(): void {
    this.zoomPercent = Math.round((this.diagram?.scale ?? 1) * 100);
  }

  ngOnDestroy(): void {
    if (this.diagram) this.diagram.div = null;
    if (this.palette) this.palette.div = null;
  }
}
