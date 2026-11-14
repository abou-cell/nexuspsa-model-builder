import { CommonModule } from '@angular/common';
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
  GeneratedFaultTreeNode,
  GeneratedGateType
} from '../../core/ft-generation/ft-generation.models';

type FtLayoutMode = 'LEFT' | 'CENTERED';
type EditorNode = GeneratedFaultTreeNode & {
  templateCategory?: string;
  label?: string;
};

const AND_GEOMETRY = 'F M8 34 L8 18 Q8 6 20 6 L40 6 Q52 6 52 18 L52 34 Z';
const OR_GEOMETRY = 'F M6 34 Q12 18 28 8 Q44 18 50 34 Q28 28 6 34 Z';
const XOR_GEOMETRY =
  'F M10 34 Q16 18 28 8 Q40 18 46 34 Q28 28 10 34 Z M5 34 Q28 25 51 34';
const HOUSE_EVENT_GEOMETRY = 'F M22 0 L42 15 L42 38 L2 38 L2 15 Z';
const TRANSFER_GEOMETRY = 'F M22 0 L42 38 L2 38 Z';

function gateGeometry(type: GeneratedGateType | undefined): string {
  switch (type) {
    case 'AND':
    case 'NAND':
      return AND_GEOMETRY;
    case 'XOR':
      return XOR_GEOMETRY;
    default:
      return OR_GEOMETRY;
  }
}

function hasOutputNegationBubble(type: GeneratedGateType | undefined): boolean {
  return type === 'NAND' || type === 'NOR';
}

class RiskSpectrumBranchLink extends go.Link {
  static readonly PARENT_DROP = 22;

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

    if (Math.abs(start.x - end.x) <= 0.01) {
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
  imports: [CommonModule],
  template: `
    <div class="ft-shell">
      <section class="diagram-shell" [class.no-palette]="!showPalette">
        <div class="diagram-toolbar">
          <ng-container *ngIf="!readOnly">
            <div class="toolbar-group">
              <button type="button" title="Undo" (click)="undo()">↶</button>
              <button type="button" title="Redo" (click)="redo()">↷</button>
            </div>
            <div class="toolbar-separator"></div>
          </ng-container>

          <div class="toolbar-group">
            <button type="button" title="Zoom out" (click)="zoom(-0.1)">−</button>
            <span class="zoom-label">{{ zoomPercent }}%</span>
            <button type="button" title="Zoom in" (click)="zoom(0.1)">+</button>
            <button type="button" (click)="fit()">Fit</button>

            <ng-container *ngIf="!readOnly">
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
            </ng-container>

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

          <div class="toolbar-group push-right">
            <span class="status-dot"></span>
            {{ readOnly ? 'Generated FT · read-only' : 'GoJS Fault Tree' }}
          </div>
        </div>

        <div class="palette-toolbar" *ngIf="showPalette">
          <div class="palette-toolbar-left">
            <strong>Fault Tree Symbols</strong>
          </div>
          <div class="palette-toolbar-center">
            <div #paletteDiv class="palette-toolbar-canvas" aria-label="Fault Tree symbol palette"></div>
          </div>
          <div class="palette-toolbar-right">
            <span [class.armed-parent]="!!selectedParentId">
              {{ selectedParentId ? ('Parent: ' + selectedParentId + ' → click or drag a symbol') : 'Select a Gate, then click or drag a symbol' }}
            </span>
          </div>
        </div>

        <div #diagramDiv class="diagram-canvas" aria-label="NexusPSA fault tree diagram"></div>
      </section>
    </div>
  `,
  styles: [`
    :host{display:block;height:100%;min-height:0;overflow:hidden}
    .ft-shell{height:100%;min-height:0;overflow:hidden;background:#fff}
    .diagram-shell{min-width:0;min-height:0;height:100%;overflow:hidden;display:grid;grid-template-rows:42px 56px minmax(0,1fr)}
    .diagram-shell.no-palette{grid-template-rows:42px minmax(0,1fr)}
    .diagram-toolbar{display:flex;align-items:center;gap:10px;padding:0 10px;border-bottom:1px solid var(--nps-border);background:#fff;color:var(--nps-text-muted);font-size:10px}
    .toolbar-group{display:flex;align-items:center;gap:5px}.toolbar-separator{width:1px;height:20px;background:var(--nps-border)}
    .toolbar-group button{height:28px;min-width:30px;border:1px solid var(--nps-border);border-radius:6px;background:#fff;color:var(--nps-text);cursor:pointer;font-weight:600}
    .toolbar-group button:hover{background:#eef5ff;border-color:#b6cdf7}.toolbar-group button:disabled{opacity:.42;cursor:default}
    .push-right{margin-left:auto;white-space:nowrap}.status-dot{width:7px;height:7px;border-radius:50%;background:#22c55e}.zoom-label{min-width:38px;text-align:center;font-variant-numeric:tabular-nums}
    .negate-button{min-width:72px!important;padding:0 8px}.negate-button.active{color:#0f5bd8;border-color:#6ea2f8!important;background:#eaf2ff!important}
    .tag-color-control{position:relative;display:inline-flex;align-items:center}.tag-color-button{width:54px!important;min-width:54px!important;padding:3px 5px!important;display:inline-flex;align-items:center;justify-content:space-between}
    .tag-color-preview{width:30px;height:14px;border:1px solid #111827;display:inline-block}.tag-color-menu{position:absolute;top:31px;left:0;z-index:50;display:none;flex-direction:column;gap:2px;min-width:54px;padding:3px;border:1px solid #94a3b8;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.18)}
    .tag-color-control.open .tag-color-menu{display:flex}.tag-color-menu button{width:48px!important;min-width:48px!important;height:20px!important;padding:1px 3px!important;border-radius:0!important}.tag-color-menu button span{display:block;width:38px;height:14px;border:1px solid #334155}
    .layout-toggle,.properties-toggle{width:34px;min-width:34px!important;padding:4px!important;display:inline-flex;align-items:center;justify-content:center}
    .layout-toggle svg{width:24px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:square;stroke-linejoin:miter}
    .properties-toggle svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8}
    .layout-toggle.active{color:#0f5bd8;border-color:#6ea2f8!important;background:#eaf2ff!important}
    .palette-toolbar{display:grid;grid-template-columns:220px minmax(0,1fr) 260px;align-items:center;gap:8px;min-height:56px;padding:0 10px;border-bottom:1px solid #d7dee7;background:#f8fafc}
    .palette-toolbar-left{display:flex;align-items:center;font-size:14px;color:#0f172a}
    .palette-toolbar-center{min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .palette-toolbar-canvas{width:100%;height:44px;max-width:850px;background:transparent}
    .palette-toolbar-right{display:flex;align-items:center;justify-content:flex-end;font-size:11px;color:#64748b;white-space:nowrap}
    .palette-toolbar-right .armed-parent{color:#0f5bd8;font-weight:700}
    .diagram-canvas{min-width:0;min-height:0;width:100%;height:100%;overflow:hidden;background:#fff}
    @media(max-width:1180px){.palette-toolbar{grid-template-columns:150px minmax(0,1fr) 190px}.palette-toolbar-left{font-size:12px}.palette-toolbar-right{font-size:9px}}
  `]
})
export class NexusFaultTreeEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) private diagramDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('paletteDiv') private paletteDiv?: ElementRef<HTMLDivElement>;

  @Input({ required: true }) model!: GeneratedFaultTreeModel;
  @Input() readOnly = false;
  @Input() showPalette = true;
  @Output() readonly selectedNodeChange = new EventEmitter<GeneratedFaultTreeNode | null>();
  @Output() readonly propertiesRequested = new EventEmitter<void>();

  zoomPercent = 100;
  layoutMode: FtLayoutMode = 'LEFT';
  tagPaletteOpen = false;
  activeTagColor = '#fff200';
  readonly tagColors = ['#fff200', '#ffb4a8', '#ffd6a3', '#73e3ea', '#48c4d4'];
  selectedParentId: string | null = null;
  selectedNegated = false;
  canNegateSelection = false;

  private diagram?: go.Diagram;
  private palette?: go.Palette;
  private insertionParentKey: go.Key | null = null;
  private serial = 0;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initializeDiagram();
    this.applyModel();
    if (this.showPalette && this.paletteDiv) {
      this.initializePalette();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.diagram) this.applyModel();
  }

  undo(): void { this.diagram?.commandHandler.undo(); }
  redo(): void { this.diagram?.commandHandler.redo(); }

  zoom(delta: number): void {
    if (!this.diagram) return;
    this.diagram.scale = Math.min(2.5, Math.max(.35, this.diagram.scale + delta));
    this.updateZoomLabel();
  }

  fit(): void {
    this.diagram?.commandHandler.zoomToFit();
    this.updateZoomLabel();
  }

  setLayoutMode(mode: FtLayoutMode): void {
    this.layoutMode = mode;
    if (!this.diagram) return;
    const layout = this.diagram.layout as go.TreeLayout;
    layout.alignment = mode === 'LEFT' ? go.TreeAlignment.Start : go.TreeAlignment.CenterChildren;
    layout.invalidateLayout();
    this.diagram.layoutDiagram(true);
    if (mode === 'CENTERED') this.fit();
  }

  toggleNegateSelection(): void {
    if (!this.diagram || !this.canNegateSelection) return;
    const node = this.diagram.selection.first();
    if (!(node instanceof go.Node)) return;
    const data = node.data as EditorNode;
    this.diagram.model.commit(model => model.set(data, 'negated', !data.negated), 'Toggle negate');
    this.syncSourceNode(data);
    this.syncSelectionState(node);
  }

  applyTag(color: string): void {
    this.activeTagColor = color;
    this.tagPaletteOpen = false;
    const node = this.diagram?.selection.first();
    if (!(node instanceof go.Node) || !this.diagram) return;
    this.diagram.model.commit(model => model.set(node.data, 'tagColor', color), 'Tag FT record');
    this.syncSourceNode(node.data as EditorNode);
  }

  private makeTopPort(): go.Shape {
    const $ = go.GraphObject.make;
    return $(go.Shape, 'Rectangle', {
      portId: 'IN', width: 12, height: 8, fill: 'transparent', stroke: null, opacity: 0,
      alignment: go.Spot.Top, alignmentFocus: go.Spot.Center,
      fromLinkable: false, toLinkable: true, toSpot: go.Spot.Top
    });
  }

  private makeBottomPort(alignment: go.Spot = go.Spot.Bottom): go.Shape {
    const $ = go.GraphObject.make;
    return $(go.Shape, 'Rectangle', {
      portId: 'OUT', width: 12, height: 8, fill: 'transparent', stroke: null, opacity: 0,
      alignment, alignmentFocus: go.Spot.Center,
      fromLinkable: true, toLinkable: false, fromSpot: go.Spot.Bottom
    });
  }

  private initializeDiagram(): void {
    const $ = go.GraphObject.make;

    const labelPanel = (fill = '#ffffff', stroke = '#111827') =>
      $(go.Panel, 'Auto',
        { name: 'LABEL', width: 132, height: 69 },
        $(go.Shape, 'RoundedRectangle', {
          fill, stroke, strokeWidth: 1, parameter1: 2
        }, new go.Binding('fill', 'tagColor', (tag: string | null | undefined) => tag || fill)),
        $(go.Panel, 'Table',
          { width: 132, height: 69, defaultStretch: go.Stretch.Horizontal },
          $(go.RowColumnDefinition, { row: 0, height: 50 }),
          $(go.RowColumnDefinition, { row: 1, height: 19 }),
          $(go.TextBlock, {
            row: 0, margin: new go.Margin(3,4,2,4),
            font: '10px Inter, "Segoe UI", sans-serif', stroke: '#111111',
            textAlign: 'left', verticalAlignment: go.Spot.Top,
            wrap: go.Wrap.Fit, overflow: go.TextOverflow.Ellipsis, maxLines: 3
          }, new go.Binding('text', 'description')),
          $(go.Shape, 'LineH', {
            row: 1, alignment: go.Spot.Top, stretch: go.Stretch.Horizontal,
            stroke, strokeWidth: 1
          }),
          $(go.TextBlock, {
            row: 1, margin: new go.Margin(2,3,1,3),
            font: '10px Inter, "Segoe UI", sans-serif', stroke: '#111111',
            textAlign: 'center', verticalAlignment: go.Spot.Center
          }, new go.Binding('text', 'id'))
        )
      );

    const tagFillBinding = () =>
      new go.Binding('fill', 'tagColor', (tag: string | null | undefined) => tag || '#ffffff');

    const gateArtwork = (gateType: GeneratedGateType, includeOutputPort = true) => {
      const kofn = gateType === 'KOFN';
      const outputAlignment = kofn
        ? new go.Spot(.5, 0, 0, 20.8)
        : (gateType === 'OR' || gateType === 'NOR' || gateType === 'XOR')
          ? new go.Spot(.5, .925)
          : go.Spot.Bottom;

      return $(go.Panel, 'Spot',
        { width: 40, height: kofn ? 22 : 34 },
        $(go.Shape, {
          width: 32, height: 27, stretch: go.Stretch.Fill,
          fill: '#ffffff', stroke: '#111111', strokeWidth: 1.25,
          alignment: new go.Spot(.5, .62),
          visible: !kofn,
          geometryString: gateGeometry(gateType)
        }, tagFillBinding()),
        $(go.Shape, 'Circle', {
          desiredSize: new go.Size(6,6), fill: '#ffffff', stroke: '#111111',
          strokeWidth: 1.1, alignment: new go.Spot(.5, 0, 0, 3),
          visible: hasOutputNegationBubble(gateType)
        }, tagFillBinding()),
        $(go.Shape, 'Rectangle', {
          desiredSize: new go.Size(28,20), fill: '#ffffff', stroke: '#111111',
          strokeWidth: 1.1, alignment: new go.Spot(.5,0,0,.8),
          alignmentFocus: go.Spot.Top, visible: kofn
        }, tagFillBinding()),
        $(go.TextBlock, {
          font: '8px Inter, sans-serif', stroke: '#111111',
          alignment: new go.Spot(.5,0,0,10.8), visible: kofn
        }, new go.Binding('text', 'k', (k: number | undefined) => `${k ?? 2}/N`)),
        ...(includeOutputPort ? [this.makeBottomPort(outputAlignment)] : [])
      );
    };

    const basicCircleArtwork = () => $(go.Shape, 'Circle', {
      desiredSize: new go.Size(28,28), fill: '#ffffff', stroke: '#111111', strokeWidth: 1.2
    }, tagFillBinding());

    const diamondArtwork = () => $(go.Shape, 'Diamond', {
      desiredSize: new go.Size(26,26), fill: '#ffffff', stroke: '#111111', strokeWidth: 1.2
    }, tagFillBinding());

    const houseArtwork = () => $(go.Shape, {
      geometryString: HOUSE_EVENT_GEOMETRY, desiredSize: new go.Size(28,24),
      stretch: go.Stretch.Fill, fill: '#ffffff', stroke: '#111111', strokeWidth: 1.2
    }, tagFillBinding());

    const transferArtwork = () => $(go.Shape, {
      geometryString: TRANSFER_GEOMETRY, desiredSize: new go.Size(26,26),
      stretch: go.Stretch.Fill, fill: '#ffffff', stroke: '#111111', strokeWidth: 1.2
    }, tagFillBinding());

    const makeGateNodeTemplate = (gateType: GeneratedGateType, topEvent = false) =>
      $(go.Node, 'Spot',
        {
          selectionAdorned: true,
          selectionObjectName: 'LABEL',
          locationSpot: go.Spot.Center,
          movable: !this.readOnly && !topEvent,
          copyable: !this.readOnly && !topEvent,
          deletable: !this.readOnly && !topEvent,
          cursor: topEvent || this.readOnly ? 'default' : 'move',
          selectionChanged: node => this.onNodeSelection(node)
        },
        $(go.Panel, 'Vertical',
          labelPanel(topEvent ? '#d0d0d0' : '#ffffff', '#111111'),
          gateArtwork(gateType, true)
        ),
        this.makeTopPort()
      );

    const makeTerminalNodeTemplate = (artwork: go.GraphObject) =>
      $(go.Node, 'Spot',
        {
          selectionAdorned: true,
          selectionObjectName: 'LABEL',
          locationSpot: go.Spot.Center,
          movable: !this.readOnly,
          copyable: !this.readOnly,
          deletable: !this.readOnly,
          cursor: this.readOnly ? 'default' : 'move',
          selectionChanged: node => this.onNodeSelection(node)
        },
        $(go.Panel, 'Vertical',
          labelPanel('#ffffff', '#111111'),
          $(go.Panel, 'Spot', { width:34, height:32 }, artwork)
        ),
        this.makeTopPort()
      );

    const layout = $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 28,
      nodeSpacing: 14,
      alignment: go.TreeAlignment.Start,
      compaction: go.TreeCompaction.Block,
      sorting: go.TreeSorting.Ascending,
      comparer: (a: go.TreeVertex, b: go.TreeVertex) => {
        const ao = Number((a.node?.data as EditorNode | undefined)?.siblingOrder ?? 0);
        const bo = Number((b.node?.data as EditorNode | undefined)?.siblingOrder ?? 0);
        return ao - bo;
      },
      setsPortSpot: false,
      setsChildPortSpot: false
    });

    const diagram = $(go.Diagram, this.diagramDiv.nativeElement, {
      allowDrop: !this.readOnly,
      initialAutoScale: go.AutoScale.Uniform,
      contentAlignment: go.Spot.TopCenter,
      padding: 42,
      'undoManager.isEnabled': !this.readOnly,
      layout
    });

    diagram.toolManager.mouseWheelBehavior = go.WheelMode.Zoom;

    (['AND','OR','NAND','NOR','XOR','KOFN'] as GeneratedGateType[]).forEach(type => {
      diagram.nodeTemplateMap.add(`GATE_${type}`, makeGateNodeTemplate(type));
      diagram.nodeTemplateMap.add(`TOP_EVENT_${type}`, makeGateNodeTemplate(type, true));
    });
    diagram.nodeTemplateMap.add('GATE_DEFAULT', makeGateNodeTemplate('OR'));
    diagram.nodeTemplateMap.add('TOP_EVENT_DEFAULT', makeGateNodeTemplate('OR', true));
    diagram.nodeTemplateMap.add('BASIC_EVENT_CIRCLE', makeTerminalNodeTemplate(basicCircleArtwork()));
    diagram.nodeTemplateMap.add('BASIC_EVENT_DIAMOND', makeTerminalNodeTemplate(diamondArtwork()));
    diagram.nodeTemplateMap.add('HOUSE_EVENT', makeTerminalNodeTemplate(houseArtwork()));
    diagram.nodeTemplateMap.add('TRANSFER', makeTerminalNodeTemplate(transferArtwork()));

    diagram.linkTemplate = $(RiskSpectrumBranchLink,
      { selectable: !this.readOnly, relinkableFrom: false, relinkableTo: false },
      $(go.Shape, { stroke:'#111111', strokeWidth:1.05 })
    );

    diagram.addDiagramListener('ViewportBoundsChanged', () => this.zone.run(() => this.updateZoomLabel()));

    diagram.addDiagramListener('ExternalObjectsDropped', () => {
      if (this.readOnly) return;
      const dropped: go.Node[] = [];
      diagram.selection.each(part => { if (part instanceof go.Node) dropped.push(part); });
      dropped.forEach(node => this.normalizeAndAttachDroppedNode(node));
      diagram.layoutDiagram(true);
    });

    this.diagram = diagram;
  }

  private initializePalette(): void {
    if (!this.paletteDiv || !this.diagram) return;
    const $ = go.GraphObject.make;

    const reinforcePaletteStrokes = (object: go.GraphObject): void => {
      if (object instanceof go.Shape && object.stroke) {
        object.strokeWidth = Math.max(3.4, object.strokeWidth * 2.35);
      }
      if (object instanceof go.Panel) {
        object.elements.each(child => reinforcePaletteStrokes(child));
      }
    };

    const simpleGate = (type: GeneratedGateType) => {
      const kofn = type === 'KOFN';
      const panel = $(go.Panel, 'Spot', { width:40, height:kofn ? 22 : 34 },
        $(go.Shape, {
          width:32, height:27, stretch:go.Stretch.Fill,
          fill:'#fff', stroke:'#111', strokeWidth:1.25,
          visible:!kofn, geometryString:gateGeometry(type)
        }),
        $(go.Shape, 'Rectangle', {
          desiredSize:new go.Size(28,20), fill:'#fff', stroke:'#111',
          strokeWidth:1.1, visible:kofn
        }),
        $(go.TextBlock, type === 'KOFN' ? '2/N' : '', {
          font:'8px Inter, sans-serif', stroke:'#111', visible:kofn
        })
      );
      reinforcePaletteStrokes(panel);
      panel.scale = .46125;
      return panel;
    };

    const simpleCircle = () => {
      const shape = $(go.Shape, 'Circle', { desiredSize:new go.Size(28,28), fill:'#fff', stroke:'#111', strokeWidth:1.2 });
      reinforcePaletteStrokes(shape); shape.scale = .46125; return shape;
    };
    const simpleDiamond = () => {
      const shape = $(go.Shape, 'Diamond', { desiredSize:new go.Size(26,26), fill:'#fff', stroke:'#111', strokeWidth:1.2 });
      reinforcePaletteStrokes(shape); shape.scale = .46125; return shape;
    };
    const simpleHouse = () => {
      const shape = $(go.Shape, { geometryString:HOUSE_EVENT_GEOMETRY, desiredSize:new go.Size(28,24), stretch:go.Stretch.Fill, fill:'#fff', stroke:'#111', strokeWidth:1.2 });
      reinforcePaletteStrokes(shape); shape.scale = .46125; return shape;
    };
    const simpleTransfer = () => {
      const shape = $(go.Shape, { geometryString:TRANSFER_GEOMETRY, desiredSize:new go.Size(26,26), stretch:go.Stretch.Fill, fill:'#fff', stroke:'#111', strokeWidth:1.2 });
      reinforcePaletteStrokes(shape); shape.scale = .46125; return shape;
    };

    const makePaletteNode = (artwork: go.GraphObject) =>
      $(go.Node, 'Spot',
        {
          width:56, height:40, selectionAdorned:true, cursor:'pointer',
          locationSpot:go.Spot.Center,
          toolTip: $('ToolTip',
            $(go.Panel, 'Auto',
              $(go.Shape, 'RoundedRectangle', { fill:'#0f172a', stroke:null, parameter1:5 }),
              $(go.TextBlock, { margin:new go.Margin(5,8), font:'600 9px Inter, sans-serif', stroke:'#fff' },
                new go.Binding('text','id'))
            )
          ),
          click: (_event, obj) => {
            const node = obj.part;
            if (node instanceof go.Node) this.insertPaletteNodeFromClick(node.data as EditorNode);
          }
        },
        $(go.Panel, 'Spot', { width:56, height:40, alignment:go.Spot.Center }, artwork)
      );

    const palette = $(go.Palette, this.paletteDiv.nativeElement, {
      allowMove:false,
      allowDelete:false,
      contentAlignment:go.Spot.Center,
      padding:new go.Margin(0),
      layout:$(go.GridLayout, {
        wrappingColumn:11,
        spacing:new go.Size(12,0),
        cellSize:new go.Size(56,40),
        alignment:go.GridAlignment.Location
      })
    });

    (['AND','OR','NAND','NOR','XOR','KOFN'] as GeneratedGateType[]).forEach(type => {
      palette.nodeTemplateMap.add(`GATE_${type}`, makePaletteNode(simpleGate(type)));
    });
    palette.nodeTemplateMap.add('BASIC_EVENT_CIRCLE', makePaletteNode(simpleCircle()));
    palette.nodeTemplateMap.add('BASIC_EVENT_DIAMOND', makePaletteNode(simpleDiamond()));
    palette.nodeTemplateMap.add('HOUSE_EVENT', makePaletteNode(simpleHouse()));
    palette.nodeTemplateMap.add('TRANSFER', makePaletteNode(simpleTransfer()));

    const paletteData: EditorNode[] = [
      { key:'palette-and', category:'GATE', id:'AND gate', description:'All inputs TRUE', gateType:'AND', state:'NORMAL', recordType:'GAT' },
      { key:'palette-or', category:'GATE', id:'OR gate', description:'At least one input TRUE', gateType:'OR', state:'NORMAL', recordType:'GAT' },
      { key:'palette-nand', category:'GATE', id:'NAND (NOT AND)', description:'Negated AND', gateType:'NAND', state:'NORMAL', recordType:'GAT' },
      { key:'palette-nor', category:'GATE', id:'NOR (NOT OR)', description:'Negated OR', gateType:'NOR', state:'NORMAL', recordType:'GAT' },
      { key:'palette-xor', category:'GATE', id:'XOR gate', description:'Exactly one input TRUE', gateType:'XOR', state:'NORMAL', recordType:'GAT' },
      { key:'palette-kn', category:'GATE', id:'K/N gate', description:'K out of N inputs', gateType:'KOFN', k:2, state:'NORMAL', recordType:'GAT' },
      { key:'palette-be', category:'BASIC_EVENT', id:'Basic Event', description:'Root-cause event', symbol:'CIRCLE', state:'NORMAL', recordType:'BEV' },
      { key:'palette-undeveloped', category:'BASIC_EVENT', id:'Undeveloped Event', description:'Undeveloped fault-tree branch', symbol:'DIAMOND', state:'NORMAL', recordType:'BEV' },
      { key:'palette-tester', category:'BASIC_EVENT', id:'Tester', description:'NexusPSA logical tester / success criterion', symbol:'DIAMOND', tester:true, state:'NORMAL', recordType:'BEV' },
      { key:'palette-he', category:'HOUSE_EVENT', id:'House Event', description:'TRUE / FALSE logical switch', state:'NORMAL', recordType:'HEV' },
      { key:'palette-xfr', category:'TRANSFER', id:'Transfer', description:'Link to another fault tree', state:'NORMAL', recordType:'FTR' }
    ];

    const model = new go.GraphLinksModel(paletteData.map(node => ({
      ...node,
      templateCategory:this.resolveTemplateCategory(node)
    })));
    model.nodeCategoryProperty = 'templateCategory';
    palette.model = model;
    this.palette = palette;
  }

  private resolveTemplateCategory(node: EditorNode): string {
    if (node.category === 'TOP_EVENT') return `TOP_EVENT_${node.gateType ?? 'OR'}`;
    if (node.category === 'GATE') return `GATE_${node.gateType ?? 'OR'}`;
    if (node.category === 'BASIC_EVENT') return node.symbol === 'DIAMOND'
      ? 'BASIC_EVENT_DIAMOND'
      : 'BASIC_EVENT_CIRCLE';
    if (node.category === 'HOUSE_EVENT') return 'HOUSE_EVENT';
    if (node.category === 'TRANSFER') return 'TRANSFER';
    return 'GATE_DEFAULT';
  }

  private onNodeSelection(node: go.Node): void {
    const data = node.isSelected ? node.data as EditorNode : null;
    this.zone.run(() => {
      this.selectedNodeChange.emit(data);
      if (data && (data.category === 'TOP_EVENT' || data.category === 'GATE')) {
        this.insertionParentKey = node.key;
        this.selectedParentId = data.id;
      } else if (node.isSelected) {
        this.insertionParentKey = null;
        this.selectedParentId = null;
      }
      this.syncSelectionState(node.isSelected ? node : null);
    });
  }

  private insertPaletteNodeFromClick(source: EditorNode): void {
    if (!this.diagram || this.readOnly || !this.insertionParentKey) return;
    const graphModel = this.diagram.model as go.GraphLinksModel;
    const parentData = graphModel.findNodeDataForKey(this.insertionParentKey) as EditorNode | null;
    if (!parentData) return;

    const node = this.clonePaletteNode(source);
    const link = {
      key:`L-${String(this.insertionParentKey)}-${node.key}-${this.serial}`,
      from:String(this.insertionParentKey),
      to:String(node.key),
      fromPort:'OUT' as const,
      toPort:'IN' as const
    };

    this.diagram.startTransaction('Insert FT palette node');
    graphModel.addNodeData({ ...node, templateCategory:this.resolveTemplateCategory(node) });
    graphModel.addLinkData(link);
    this.diagram.commitTransaction('Insert FT palette node');

    this.model.nodes.push({ ...node });
    this.model.links.push({ ...link });
    this.diagram.layoutDiagram(true);
  }

  private normalizeAndAttachDroppedNode(node: go.Node): void {
    if (!this.diagram) return;
    const graphModel = this.diagram.model as go.GraphLinksModel;
    const source = node.data as EditorNode;
    const normalized = this.clonePaletteNode(source);

    this.diagram.startTransaction('Normalize palette drop');
    graphModel.setKeyForNodeData(source, normalized.key);
    Object.entries(normalized).forEach(([key,value]) => graphModel.setDataProperty(source, key, value));

    if (this.insertionParentKey) {
      const link = {
        key:`L-${String(this.insertionParentKey)}-${normalized.key}-${this.serial}`,
        from:String(this.insertionParentKey),
        to:String(normalized.key),
        fromPort:'OUT' as const,
        toPort:'IN' as const
      };
      graphModel.addLinkData(link);
      this.model.links.push({ ...link });
    }
    this.diagram.commitTransaction('Normalize palette drop');

    this.model.nodes.push({ ...normalized });
  }

  private clonePaletteNode(source: EditorNode): EditorNode {
    const serial = ++this.serial;
    const prefix = source.tester ? 'TESTER'
      : source.category === 'BASIC_EVENT' ? (source.symbol === 'DIAMOND' ? 'DEV' : 'BE')
      : source.category === 'HOUSE_EVENT' ? 'HE'
      : source.category === 'TRANSFER' ? 'XFR'
      : 'G';

    return {
      ...source,
      key:`FTNODE-${prefix}-${serial}`,
      id:source.tester
        ? `TESTER-${String(serial).padStart(3,'0')}`
        : `NEW-${prefix}-${String(serial).padStart(3,'0')}`,
      description:source.tester ? 'Logical tester / success criterion' : source.description,
      siblingOrder:serial
    };
  }

  private applyModel(): void {
    if (!this.diagram || !this.model) return;

    const graphModel = new go.GraphLinksModel(
      this.model.nodes.map(node => ({
        ...node,
        templateCategory:this.resolveTemplateCategory(node as EditorNode)
      })),
      this.model.links.map(link => ({ ...link, fromPort:'OUT', toPort:'IN' }))
    );
    graphModel.nodeCategoryProperty = 'templateCategory';
    graphModel.linkKeyProperty = 'key';
    graphModel.linkFromPortIdProperty = 'fromPort';
    graphModel.linkToPortIdProperty = 'toPort';

    this.diagram.model = graphModel;
    this.diagram.layoutDiagram(true);
    setTimeout(() => this.fit());
  }

  private syncSourceNode(data: EditorNode): void {
    const source = this.model.nodes.find(node => node.key === data.key);
    if (source) Object.assign(source, data);
  }

  private syncSelectionState(node: go.Node | null): void {
    const data = node?.data as EditorNode | undefined;
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
