import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as go from 'gojs';
import { createIcDiagram, IcSystemId } from '../../gojs/model-builder/ic-diagram';
import { createIcPalette } from '../../gojs/model-builder/ic-palette';

interface IcSystem {
  id: IcSystemId;
  description: string;
  createdAt: string;
  creatorId: string;
}

const SYSTEMS: readonly IcSystem[] = [
  {
    id: 'IC-PROCESS',
    description: 'Process control and monitoring: field sensors, remote I/O, PLC, HMI and final actuators',
    createdAt: '2026-10-10',
    creatorId: 'AR-001'
  },
  {
    id: 'IC-SAFETY',
    description: 'Safety I&C chain: sensing, safety I/O, safety PLC, relay / trip and final actuation',
    createdAt: '2026-10-10',
    creatorId: 'AR-001'
  },
  {
    id: 'IC-HMI',
    description: 'Operator, engineering, historian, gateway and I&C communication architecture',
    createdAt: '2026-10-10',
    creatorId: 'AR-001'
  }
];

@Component({
  selector: 'app-ic-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="workspace-shell">
      <main class="workspace-grid inspector-hidden">
        <aside class="left-panel panel"
               [style.width.px]="paletteWidth"
               style="position:relative; overflow-x:hidden;">
          <section class="panel-section component-library-section">
            <div class="panel-heading">
              <span>Component library</span>
              <button type="button" class="icon-button">+</button>
            </div>
            <div class="search-box">⌕ Search I&amp;C components</div>

            <div class="gojs-palette-shell">
              <div class="palette-table-header">
                <span>Symbol</span>
                <span>Component / description</span>
              </div>
              <div #paletteDiv class="gojs-palette" style="overflow:hidden;"></div>
              <div class="palette-hint">Drag a component row onto the I&amp;C canvas</div>
            </div>
          </section>

          <div class="palette-resize-handle"
               role="separator"
               aria-orientation="vertical"
               title="Drag left or right to resize the component library"
               style="position:absolute; top:0; right:0; bottom:0; width:5px; cursor:col-resize; z-index:20; background:transparent;"
               (mousedown)="startPaletteResize($event)"></div>
        </aside>

        <section class="editor-area">
          <div class="editor-toolbar">
            <div class="workspace-name">
              <strong>I&amp;C Workspace</strong>
              <span>{{ selectedSystemId }}</span>
            </div>

            <div class="tool-group">
              <button type="button" (click)="undo()" title="Undo">↶</button>
              <button type="button" (click)="redo()" title="Redo">↷</button>
            </div>
            <div class="tool-group">
              <button type="button" (click)="selectAll()" title="Select all components">▣ All</button>
              <button type="button" (click)="clearSelection()" title="Clear selection">× Sel</button>
              <button type="button" title="Connect components">⌁</button>
              <button type="button" title="Delete selected components" (click)="deleteSelection()">⌫</button>
            </div>
            <div class="tool-group">
              <button type="button" (click)="zoomOut()" title="Zoom out">−</button>
              <button type="button" (click)="fit()" title="Fit diagram to viewport">Fit</button>
              <button type="button" (click)="zoomIn()" title="Zoom in">+</button>
            </div>

            <div class="toolbar-spacer"></div>
            <div class="inspector-actions" role="group" aria-label="Component inspector">
              <button type="button" class="properties-toggle inspector-action">▦ Properties</button>
              <button type="button" class="properties-toggle inspector-action">⚠ Failures</button>
              <button type="button" class="properties-toggle inspector-action">ƒ Rules</button>
            </div>
            <button type="button" class="validate">✓ Validate</button>
          </div>

          <div class="editor-main">
            <div class="canvas-stack">
              <div #diagramDiv class="diagram"></div>
              <div class="canvas-badge">I&amp;C workspace · field instrumentation · control &amp; protection · HMI/network · final actuators</div>
            </div>

            <section class="systems-panel">
              <header class="systems-header">
                <div>
                  <strong>I&amp;C systems</strong>
                  <span>3 systems · click a row to open its diagram</span>
                </div>
                <button type="button" class="new-system-button">+ New system</button>
              </header>

              <div class="systems-table-wrap">
                <table class="systems-table">
                  <thead>
                    <tr>
                      <th>System</th>
                      <th>Description</th>
                      <th>Creation date</th>
                      <th>Creator ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let system of systems"
                        (click)="selectSystem(system)"
                        [class.selected]="selectedSystemId === system.id">
                      <td><strong>{{ system.id }}</strong></td>
                      <td>{{ system.description }}</td>
                      <td>{{ system.createdAt }}</td>
                      <td><code>{{ system.creatorId }}</code></td>
                      <td><span class="table-status"><i></i>{{ selectedSystemId === system.id ? 'Open' : 'Valid' }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <footer class="editor-statusbar">
            <span>{{ componentCount }} components</span>
            <span>{{ selectedSystemId }} system</span>
            <span>{{ selectionCount }} selected</span>
            <span>0 validation errors</span>
            <span class="spacer"></span>
            <span>Snap: 10 px</span>
            <span>{{ zoomPercent }}%</span>
          </footer>
        </section>
      </main>
    </div>
  `,
  styleUrl: '../model-builder/model-builder.component.scss'
})
export class IcWorkspaceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('paletteDiv', { static: true }) paletteDiv!: ElementRef<HTMLDivElement>;

  readonly systems = SYSTEMS;
  selectedSystemId: IcSystemId = 'IC-PROCESS';
  paletteWidth = 300;
  zoomPercent = 100;
  selectionCount = 0;
  componentCount = 0;

  private diagram?: go.Diagram;
  private palette?: go.Palette;
  private paletteResizeStartX = 0;
  private paletteResizeStartWidth = 300;

  private readonly onPaletteResizeMove = (event: MouseEvent): void => {
    const maxWidth = Math.min(520, Math.max(320, window.innerWidth * 0.45));
    const delta = event.clientX - this.paletteResizeStartX;
    this.paletteWidth = Math.max(260, Math.min(maxWidth, this.paletteResizeStartWidth + delta));
    this.palette?.requestUpdate();
    this.diagram?.requestUpdate();
  };

  private readonly onPaletteResizeEnd = (): void => {
    document.removeEventListener('mousemove', this.onPaletteResizeMove);
    document.removeEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.remove('palette-resizing');
    this.palette?.requestUpdate();
    this.diagram?.requestUpdate();
  };

  ngAfterViewInit(): void {
    this.palette = createIcPalette(this.paletteDiv.nativeElement);
    this.rebuildDiagram();
  }

  startPaletteResize(event: MouseEvent): void {
    event.preventDefault();
    this.paletteResizeStartX = event.clientX;
    this.paletteResizeStartWidth = this.paletteWidth;
    document.addEventListener('mousemove', this.onPaletteResizeMove);
    document.addEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.add('palette-resizing');
  }

  selectSystem(system: IcSystem): void {
    if (this.selectedSystemId === system.id) return;
    this.selectedSystemId = system.id;
    this.rebuildDiagram();
  }

  undo(): void { this.diagram?.commandHandler.undo(); }
  redo(): void { this.diagram?.commandHandler.redo(); }

  selectAll(): void {
    if (!this.diagram) return;
    const nodes: go.Node[] = [];
    this.diagram.nodes.each(node => nodes.push(node));
    this.diagram.selectCollection(nodes);
    this.selectionCount = this.diagram.selection.count;
  }

  clearSelection(): void {
    this.diagram?.clearSelection();
    this.selectionCount = 0;
  }

  deleteSelection(): void {
    this.diagram?.commandHandler.deleteSelection();
  }

  zoomIn(): void { this.changeZoom(1.2); }
  zoomOut(): void { this.changeZoom(1 / 1.2); }

  fit(): void {
    if (!this.diagram) return;
    this.diagram.zoomToFit();
    this.syncZoom();
  }

  private changeZoom(factor: number): void {
    if (!this.diagram) return;
    this.diagram.scale = Math.min(this.diagram.maxScale, Math.max(this.diagram.minScale, this.diagram.scale * factor));
    this.syncZoom();
  }

  private syncZoom(): void {
    this.zoomPercent = this.diagram ? Math.round(this.diagram.scale * 100) : 100;
  }

  private rebuildDiagram(): void {
    if (this.diagram) this.diagram.div = null;
    this.diagram = createIcDiagram(this.diagramDiv.nativeElement, this.selectedSystemId);
    this.componentCount = this.diagram.model.nodeDataArray.length;
    this.selectionCount = 0;
    this.syncZoom();

    this.diagram.addDiagramListener('ChangedSelection', () => {
      this.selectionCount = this.diagram?.selection.count ?? 0;
    });
    this.diagram.addDiagramListener('ViewportBoundsChanged', () => this.syncZoom());
    this.diagram.addModelChangedListener(event => {
      if (event.isTransactionFinished && this.diagram) {
        this.componentCount = this.diagram.model.nodeDataArray.length;
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onPaletteResizeMove);
    document.removeEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.remove('palette-resizing');
    if (this.diagram) this.diagram.div = null;
    if (this.palette) this.palette.div = null;
  }
}
