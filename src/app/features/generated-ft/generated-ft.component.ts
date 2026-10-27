import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import * as go from 'gojs';
import {
  FtGenerationArtifacts,
  GeneratedFaultTreeNode
} from '../../core/ft-generation/ft-generation.models';
import {
  GENERATED_FT_STORAGE_KEY
} from '../../core/ft-generation/model-builder-ft-adapter';
import { runPtrLossOfFlowExample } from '../../core/ft-generation/ptr-loss-of-flow.example';

const AND_GEOMETRY = 'F M8 34 L8 18 Q8 6 20 6 L40 6 Q52 6 52 18 L52 34 Z';
const OR_GEOMETRY = 'F M6 34 Q12 18 28 8 Q44 18 50 34 Q28 28 6 34 Z';
const HOUSE_EVENT_GEOMETRY = 'F M22 0 L42 15 L42 38 L2 38 L2 15 Z';
const TRANSFER_GEOMETRY = 'F M22 0 L42 38 L2 38 Z';

@Component({
  selector: 'app-generated-ft',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="ft-shell">
      <header class="ft-toolbar">
        <div>
          <strong>{{ artifacts.undesiredEvent.name }}</strong>
          <span>{{ artifacts.undesiredEvent.id }} · {{ artifacts.undesiredEvent.criterion }} · {{ sourceLabel }}</span>
        </div>
        <div class="toolbar-actions">
          <span class="validation" [class.error]="errorCount > 0">
            {{ errorCount }} error{{ errorCount === 1 ? '' : 's' }} · {{ warningCount }} warning{{ warningCount === 1 ? '' : 's' }}
          </span>
          <button type="button" (click)="zoomOut()">−</button>
          <button type="button" (click)="fit()">Fit</button>
          <button type="button" (click)="zoomIn()">+</button>
          <a routerLink="/model-builder/hydraulic">← Hydraulic model</a>
        </div>
      </header>

      <div class="ft-grid">
        <aside class="summary-panel">
          <section>
            <h3>Generation chain</h3>
            <ol>
              <li class="done">Undesired Event</li>
              <li class="done">Model snapshot</li>
              <li class="done">Backward traversal</li>
              <li class="done">Success logic</li>
              <li class="done">Failure logic</li>
              <li class="done">Fault Tree model</li>
            </ol>
          </section>

          <section>
            <h3>Run summary</h3>
            <dl>
              <dt>Snapshot</dt><dd>{{ artifacts.snapshot.snapshotId }}</dd>
              <dt>Visited nodes</dt><dd>{{ artifacts.traversal.visitedNodeIds.length }}</dd>
              <dt>FT nodes</dt><dd>{{ artifacts.faultTree.nodes.length }}</dd>
              <dt>FT links</dt><dd>{{ artifacts.faultTree.links.length }}</dd>
              <dt>Trace records</dt><dd>{{ artifacts.traceability.length }}</dd>
            </dl>
          </section>

          <section>
            <h3>Validation</h3>
            <div class="empty" *ngIf="!artifacts.validation.length">No validation issue.</div>
            <div class="issue" *ngFor="let issue of artifacts.validation" [class.error]="issue.severity === 'ERROR'">
              <b>{{ issue.severity }}</b>
              <span>{{ issue.message }}</span>
            </div>
          </section>
        </aside>

        <main class="diagram-wrap">
          <div #diagramDiv class="diagram"></div>
          <div class="diagram-note">Generated model · GoJS renderer · select any event to inspect traceability</div>
        </main>

        <aside class="trace-panel">
          <header>
            <strong>Traceability</strong>
            <span>{{ selectedNode?.id || 'Select a FT node' }}</span>
          </header>

          <ng-container *ngIf="selectedNode; else noSelection">
            <section class="record">
              <label>Record</label>
              <strong>{{ selectedNode.id }}</strong>
              <p>{{ selectedNode.description }}</p>
              <code>{{ selectedNode.category }}{{ selectedNode.gateType ? ' · ' + selectedNode.gateType : '' }}</code>
            </section>

            <section *ngIf="selectedTrace.length">
              <h3>Generated from</h3>
              <div class="trace-card" *ngFor="let trace of selectedTrace">
                <b>{{ trace.modelNodeId || 'Logical gate' }}</b>
                <span *ngIf="trace.kbClass">{{ trace.kbClass }}</span>
                <span *ngIf="trace.kbFailureMode">Failure mode: {{ trace.kbFailureMode }}</span>
                <p>{{ trace.reason }}</p>
              </div>
            </section>

            <section *ngIf="!selectedTrace.length" class="empty">
              Logical/top gate generated from the Boolean structure of the Undesired Event.
            </section>
          </ng-container>

          <ng-template #noSelection>
            <div class="empty padded">Click a Top Event, Gate, Basic Event, House Event or Transfer in the diagram.</div>
          </ng-template>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block;width:100%;height:100%;min-height:0}
    .ft-shell{height:100%;display:grid;grid-template-rows:48px minmax(0,1fr);background:#eef3f8;color:#26364b}
    .ft-toolbar{display:flex;align-items:center;gap:12px;padding:0 12px;border-bottom:1px solid #cad7e5;background:#fff}
    .ft-toolbar>div:first-child{min-width:0;display:flex;flex-direction:column}
    .ft-toolbar strong{font-size:11px;color:#182b44}
    .ft-toolbar span{font-size:7px;color:#6b7d93;margin-top:2px}
    .toolbar-actions{margin-left:auto;display:flex;align-items:center;gap:5px}
    .toolbar-actions button,.toolbar-actions a{height:28px;display:inline-flex;align-items:center;padding:0 8px;border:1px solid #cbd8e6;border-radius:6px;background:#fff;color:#315170;text-decoration:none;font:700 8px Inter,sans-serif;cursor:pointer}
    .toolbar-actions a{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}
    .validation{margin-right:6px;padding:5px 8px;border-radius:999px;background:#f0fdf4;color:#166534!important;font-weight:800}
    .validation.error{background:#fef2f2;color:#b91c1c!important}
    .ft-grid{min-height:0;display:grid;grid-template-columns:235px minmax(0,1fr) 290px;gap:1px;background:#cbd8e6}
    .summary-panel,.trace-panel{min-height:0;overflow:auto;background:#fff}
    .summary-panel section,.trace-panel section{padding:12px;border-bottom:1px solid #e4ebf3}
    h3{margin:0 0 8px;color:#51657c;font-size:8px;text-transform:uppercase;letter-spacing:.06em}
    ol{margin:0;padding:0;list-style:none}
    li{position:relative;padding:6px 6px 6px 22px;color:#64748b;font-size:8px}
    li:before{content:'✓';position:absolute;left:2px;top:4px;width:14px;height:14px;display:grid;place-items:center;border-radius:50%;background:#dcfce7;color:#15803d;font-size:8px;font-weight:900}
    dl{display:grid;grid-template-columns:82px 1fr;gap:7px 8px;margin:0;font-size:7.5px}
    dt{color:#7b8ca2} dd{margin:0;color:#2f435b;font-weight:700;overflow-wrap:anywhere}
    .issue{display:flex;flex-direction:column;gap:3px;padding:7px;margin-bottom:5px;border:1px solid #fde68a;border-radius:6px;background:#fffbeb;font-size:7px}
    .issue b{color:#a16207}.issue.error{border-color:#fecaca;background:#fef2f2}.issue.error b{color:#b91c1c}
    .diagram-wrap{position:relative;min-width:0;min-height:0;background:#fff}
    .diagram{width:100%;height:100%;background:#fff}
    .diagram-note{position:absolute;right:10px;bottom:8px;padding:5px 7px;border:1px solid #dbe5ef;border-radius:5px;background:rgba(255,255,255,.94);color:#8a9aab;font-size:7px;pointer-events:none}
    .trace-panel header{padding:11px;border-bottom:1px solid #e4ebf3;background:#f8fbff}
    .trace-panel header strong,.trace-panel header span{display:block}
    .trace-panel header strong{font-size:10px;color:#24364b}.trace-panel header span{margin-top:2px;font-size:7px;color:#7b8ca2}
    .record label{display:block;margin-bottom:5px;color:#8798aa;font-size:7px;text-transform:uppercase}
    .record strong{display:block;color:#1f2f44;font-size:10px}.record p,.trace-card p{margin:5px 0;color:#5f7186;font-size:7.5px;line-height:1.45}
    code{display:inline-block;padding:3px 5px;border-radius:4px;background:#eef3f8;color:#315170;font:7px Inter,sans-serif}
    .trace-card{padding:8px;margin-bottom:6px;border:1px solid #dbe5ef;border-radius:6px;background:#fbfdff}
    .trace-card b,.trace-card span{display:block}.trace-card b{font-size:8px;color:#263b54}.trace-card span{margin-top:3px;color:#6f8298;font-size:7px}
    .empty{color:#91a0b0;font-size:7.5px;line-height:1.5}.padded{padding:16px}
    @media(max-width:1200px){.ft-grid{grid-template-columns:190px minmax(0,1fr) 240px}}
  `]
})
export class GeneratedFtComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef<HTMLDivElement>;

  readonly artifacts: FtGenerationArtifacts;
  readonly sourceLabel: string;
  selectedNode?: GeneratedFaultTreeNode;

  private diagram?: go.Diagram;

  constructor() {
    const stored = sessionStorage.getItem(GENERATED_FT_STORAGE_KEY);
    if (stored) {
      try {
        this.artifacts = JSON.parse(stored) as FtGenerationArtifacts;
        this.sourceLabel = 'Current Hydraulic P&ID';
        return;
      } catch {
        sessionStorage.removeItem(GENERATED_FT_STORAGE_KEY);
      }
    }

    this.artifacts = runPtrLossOfFlowExample();
    this.sourceLabel = 'PTR reference vertical slice';
  }

  get errorCount(): number {
    return this.artifacts.validation.filter(issue => issue.severity === 'ERROR').length;
  }

  get warningCount(): number {
    return this.artifacts.validation.filter(issue => issue.severity === 'WARNING').length;
  }

  get selectedTrace() {
    if (!this.selectedNode) return [];
    return this.artifacts.traceability.filter(trace => trace.generatedRecordId === this.selectedNode!.id);
  }

  ngAfterViewInit(): void {
    this.diagram = this.createDiagram(this.diagramDiv.nativeElement);
    const top = this.diagram.findNodeForKey('TOP-0001');
    if (top) this.diagram.select(top);
    this.diagram.zoomToFit();
  }

  zoomIn(): void {
    if (this.diagram) this.diagram.scale = Math.min(2.5, this.diagram.scale * 1.18);
  }

  zoomOut(): void {
    if (this.diagram) this.diagram.scale = Math.max(0.25, this.diagram.scale / 1.18);
  }

  fit(): void {
    this.diagram?.zoomToFit();
  }

  private createDiagram(host: HTMLDivElement): go.Diagram {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, host, {
      isReadOnly: true,
      allowSelect: true,
      allowZoom: true,
      minScale: 0.25,
      maxScale: 2.5,
      padding: 40,
      layout: $(go.TreeLayout, {
        angle: 90,
        layerSpacing: 84,
        nodeSpacing: 34,
        setsPortSpot: false,
        setsChildPortSpot: false
      })
    });

    diagram.toolManager.mouseWheelBehavior = go.WheelMode.Zoom;

    const recordPanel = () => $(go.Panel, 'Auto',
      { margin: new go.Margin(0, 0, 7, 0) },
      $(go.Shape, 'RoundedRectangle', {
        fill: '#ffffff',
        stroke: '#52677e',
        strokeWidth: 1,
        parameter1: 3,
        minSize: new go.Size(142, 38)
      }),
      $(go.Panel, 'Vertical', { margin: 5, maxSize: new go.Size(154, NaN) },
        $(go.TextBlock, {
          font: '700 8px Inter, sans-serif',
          stroke: '#1f2f44',
          textAlign: 'center',
          maxLines: 1,
          overflow: go.TextOverflow.Ellipsis
        }, new go.Binding('text', 'id')),
        $(go.TextBlock, {
          margin: new go.Margin(2, 0, 0, 0),
          font: '6.5px Inter, sans-serif',
          stroke: '#66788e',
          textAlign: 'center',
          maxSize: new go.Size(145, 28),
          wrap: go.Wrap.Fit,
          maxLines: 2,
          overflow: go.TextOverflow.Ellipsis
        }, new go.Binding('text', 'description'))
      )
    );

    const gateShape = () => $(go.Shape, {
      width: 48,
      height: 31,
      fill: '#ffffff',
      stroke: '#172033',
      strokeWidth: 1.25
    }, new go.Binding('geometryString', 'gateType', (type: string) => type === 'AND' ? AND_GEOMETRY : OR_GEOMETRY));

    diagram.nodeTemplateMap.add('TOP_EVENT', $(go.Node, 'Vertical',
      { selectionAdorned: true, selectionObjectName: 'RECORD' },
      $(go.Panel, 'Auto', { name: 'RECORD' },
        $(go.Shape, 'RoundedRectangle', { fill: '#eaf3ff', stroke: '#2563eb', strokeWidth: 1.5, parameter1: 4, minSize: new go.Size(168, 44) }),
        $(go.Panel, 'Vertical', { margin: 6 },
          $(go.TextBlock, { font: '800 9px Inter, sans-serif', stroke: '#153d7a', textAlign: 'center' }, new go.Binding('text', 'id')),
          $(go.TextBlock, { margin: new go.Margin(2,0,0,0), font: '7px Inter, sans-serif', stroke: '#47678c', maxSize: new go.Size(165, 32), textAlign: 'center', wrap: go.Wrap.Fit }, new go.Binding('text', 'description'))
        )
      ),
      gateShape(),
      $(go.Shape, 'LineV', { height: 8, stroke: '#172033', strokeWidth: 1, portId: 'OUT', fromSpot: go.Spot.Bottom, fromLinkable: true })
    ));

    diagram.nodeTemplateMap.add('GATE', $(go.Node, 'Vertical',
      { selectionAdorned: true, selectionObjectName: 'RECORD' },
      recordPanel(),
      gateShape(),
      $(go.Shape, 'LineV', { height: 8, stroke: '#172033', strokeWidth: 1, portId: 'OUT', fromSpot: go.Spot.Bottom, fromLinkable: true })
    ));

    diagram.nodeTemplateMap.add('BASIC_EVENT', $(go.Node, 'Vertical',
      { selectionAdorned: true, selectionObjectName: 'RECORD' },
      recordPanel(),
      $(go.Shape, 'Circle', { width: 36, height: 36, fill: '#fff', stroke: '#172033', strokeWidth: 1.2 })
    ));

    diagram.nodeTemplateMap.add('HOUSE_EVENT', $(go.Node, 'Vertical',
      { selectionAdorned: true, selectionObjectName: 'RECORD' },
      recordPanel(),
      $(go.Shape, { width: 38, height: 34, geometryString: HOUSE_EVENT_GEOMETRY, fill: '#fff', stroke: '#172033', strokeWidth: 1.2 })
    ));

    diagram.nodeTemplateMap.add('TRANSFER', $(go.Node, 'Vertical',
      { selectionAdorned: true, selectionObjectName: 'RECORD' },
      recordPanel(),
      $(go.Shape, { width: 38, height: 34, geometryString: TRANSFER_GEOMETRY, fill: '#fff', stroke: '#172033', strokeWidth: 1.2 })
    ));

    diagram.linkTemplate = $(go.Link,
      {
        routing: go.Routing.Orthogonal,
        corner: 0,
        selectable: false,
        fromSpot: go.Spot.Bottom,
        toSpot: go.Spot.Top
      },
      $(go.Shape, { stroke: '#27384d', strokeWidth: 1.05 })
    );

    diagram.model = new go.GraphLinksModel(
      this.artifacts.faultTree.nodes,
      this.artifacts.faultTree.links
    );

    diagram.addDiagramListener('ChangedSelection', () => {
      const part = diagram.selection.first();
      this.selectedNode = part instanceof go.Node ? part.data as GeneratedFaultTreeNode : undefined;
    });

    return diagram;
  }

  ngOnDestroy(): void {
    if (this.diagram) this.diagram.div = null;
  }
}
