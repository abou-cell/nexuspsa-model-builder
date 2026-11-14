import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  GeneratedFaultTreeModel,
  GeneratedFaultTreeNode
} from '../../core/ft-generation/ft-generation.models';
import { NexusFaultTreeEditorComponent } from '../../gojs/fault-tree/nexus-fault-tree-editor.component';

type WorkspaceMode = 'generation' | 'generated';

interface FtBrowserRecord {
  id: string;
  description: string;
  editedDate: string;
  editedBy: string;
  model: GeneratedFaultTreeModel;
  sourceEventId?: string;
}

const SELECTED_GENERATED_EI_KEY = 'nexuspsa.generated-ft.selected-ei';

function currentDateLabel(): string {
  return new Date().toLocaleDateString('en-GB');
}

function makeEiTree(
  id: string,
  description: string,
  system: string,
  trainAEvent: string,
  trainBEvent: string,
  supportEvent: string
): GeneratedFaultTreeModel {
  const nodes: GeneratedFaultTreeNode[] = [
    {
      key: 'TOP-0001',
      category: 'TOP_EVENT',
      id,
      description,
      state: 'NORMAL',
      gateType: 'OR',
      recordType: 'GAT'
    },
    {
      key: 'G-TRAIN',
      category: 'GATE',
      id: `G-${system}-TRAINS`,
      description: `Required ${system} trains unavailable`,
      state: 'NORMAL',
      gateType: 'AND',
      recordType: 'GAT',
      siblingOrder: 0
    },
    {
      key: 'BE-A',
      category: 'BASIC_EVENT',
      id: `${system}-A-FAIL`,
      description: trainAEvent,
      state: 'NORMAL',
      recordType: 'BEV',
      siblingOrder: 0
    },
    {
      key: 'BE-B',
      category: 'BASIC_EVENT',
      id: `${system}-B-FAIL`,
      description: trainBEvent,
      state: 'NORMAL',
      recordType: 'BEV',
      siblingOrder: 1
    },
    {
      key: 'G-SUPPORT',
      category: 'GATE',
      id: `G-${system}-SUPPORT`,
      description: `Loss of ${system} support functions`,
      state: 'NORMAL',
      gateType: 'OR',
      recordType: 'GAT',
      siblingOrder: 1
    },
    {
      key: 'BE-SUPPORT',
      category: 'BASIC_EVENT',
      id: `${system}-SUP-FAIL`,
      description: supportEvent,
      state: 'NORMAL',
      recordType: 'BEV',
      siblingOrder: 0
    },
    {
      key: 'HE-MAINT',
      category: 'HOUSE_EVENT',
      id: `HE-${system}-MAINT`,
      description: `${system} maintenance configuration active`,
      state: 'NORMAL',
      recordType: 'HEV',
      siblingOrder: 1
    },
    {
      key: 'XFR-EXT',
      category: 'TRANSFER',
      id: `XFR-${system}-AUX`,
      description: `Transfer to auxiliary ${system} support FT`,
      state: 'NORMAL',
      recordType: 'FTR',
      siblingOrder: 2
    },
    {
      key: 'TESTER',
      category: 'BASIC_EVENT',
      id: `TESTER-${system}`,
      description: `${system} logical tester / required function criterion`,
      state: 'NORMAL',
      recordType: 'BEV',
      symbol: 'DIAMOND',
      tester: true,
      siblingOrder: 3
    }
  ];

  return {
    id: `EI-TREE-${id}`,
    description,
    topGateId: id,
    nodes,
    links: [
      { key: 'L-T-TRAIN', from: 'TOP-0001', to: 'G-TRAIN', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-T-SUP', from: 'TOP-0001', to: 'G-SUPPORT', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-T-XFR', from: 'TOP-0001', to: 'XFR-EXT', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-T-TESTER', from: 'TOP-0001', to: 'TESTER', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-TRAIN-A', from: 'G-TRAIN', to: 'BE-A', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-TRAIN-B', from: 'G-TRAIN', to: 'BE-B', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-SUP-BE', from: 'G-SUPPORT', to: 'BE-SUPPORT', fromPort: 'OUT', toPort: 'IN' },
      { key: 'L-SUP-HE', from: 'G-SUPPORT', to: 'HE-MAINT', fromPort: 'OUT', toPort: 'IN' }
    ]
  };
}

function generatedFromEi(record: FtBrowserRecord): FtBrowserRecord {
  return {
    id: `FT-${record.id}`,
    description: `Generated FT — ${record.description}`,
    sourceEventId: record.id,
    editedDate: currentDateLabel(),
    editedBy: 'AR',
    model: {
      ...record.model,
      id: `FT-${record.id}`,
      description: `Generated FT — ${record.description}`,
      nodes: record.model.nodes.map(node => ({ ...node })),
      links: record.model.links.map(link => ({ ...link }))
    }
  };
}

@Component({
  selector: 'app-fault-tree-workspace',
  standalone: true,
  imports: [CommonModule, NexusFaultTreeEditorComponent],
  template: `
    <section class="feature-page">
      <div class="workspace-tabs">
        <button type="button" class="workspace-tab" [class.active]="mode === 'generation'"
                (click)="openGeneration()">FT Generation Workspace</button>
        <button type="button" class="workspace-tab" [class.active]="mode === 'generated'"
                (click)="openGenerated()">Generated FT Workspace</button>

        <div class="workspace-actions">
          <button type="button">Validate</button>
          <button type="button" class="generate" *ngIf="mode === 'generation'" (click)="generateSelected()">
            Generate selected FT
          </button>
          <button type="button" class="primary" *ngIf="mode === 'generation'">Save model</button>
          <span class="readonly-label" *ngIf="mode === 'generated'">Read-only generated trees</span>
        </div>
      </div>

      <div class="workspace-body"
           [style.grid-template-rows]="'minmax(0, 1fr) 8px ' + browserHeight + 'px'">
        <main class="diagram-panel" [class.properties-open]="propertiesOpen">
          <app-nexus-fault-tree-editor
            [model]="selectedRecord.model"
            [readOnly]="mode === 'generated'"
            [showPalette]="mode === 'generation'"
            (selectedNodeChange)="selectedNode = $event"
            (propertiesRequested)="propertiesOpen = !propertiesOpen">
          </app-nexus-fault-tree-editor>

          <aside class="properties-window" *ngIf="propertiesOpen">
            <header>
              <strong>Properties</strong>
              <button type="button" (click)="propertiesOpen = false">×</button>
            </header>
            <ng-container *ngIf="selectedNode; else noSelection">
              <section>
                <h3>General</h3>
                <div class="property-row"><span>ID</span><b>{{ selectedNode.id }}</b></div>
                <div class="property-row"><span>Description</span><b>{{ selectedNode.description }}</b></div>
                <div class="property-row"><span>Category</span><b>{{ selectedNode.category }}</b></div>
                <div class="property-row" *ngIf="selectedNode.gateType"><span>Gate type</span><b>{{ selectedNode.gateType }}</b></div>
              </section>
            </ng-container>
            <ng-template #noSelection>
              <div class="properties-empty">Select a Gate, Basic Event, House Event or Transfer in the FT editor.</div>
            </ng-template>
          </aside>
        </main>

        <div class="browser-resizer"
             [class.dragging]="isResizingBrowser"
             (pointerdown)="startBrowserResize($event)">
          <span></span>
        </div>

        <section class="fault-tree-browser-panel">
          <div class="ft-table-wrap">
            <table class="ft-table" [attr.aria-label]="mode === 'generation' ? 'Undesired Event Trees in project' : 'Generated Fault Trees in project'">
              <thead>
                <tr>
                  <th>{{ mode === 'generation' ? 'ID EI Tree' : 'ID Fault Tree' }}</th>
                  <th>Description</th>
                  <th>Edited date</th>
                  <th>Edited by</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let record of records"
                    [class.selected]="record.id === selectedRecord.id"
                    tabindex="0"
                    (click)="selectRecord(record)"
                    (keydown.enter)="selectRecord(record)">
                  <td class="ft-id">{{ record.id }}</td>
                  <td class="ft-description">{{ record.description }}</td>
                  <td>{{ record.editedDate }}</td>
                  <td>{{ record.editedBy }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="browser-footer">
            <strong>
              {{ mode === 'generation' ? 'EI Trees in project' : 'Generated Fault Trees in project' }}
              ({{ records.length }})
            </strong>
            <span *ngIf="mode === 'generation'">Editable EI / Top Event trees · palette: OR, AND, K/N, BE, House Event, Transfer</span>
            <span *ngIf="mode === 'generated'">Visualization only · generated from the EI list · no construction palette</span>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block;height:100%;min-height:0}
    .feature-page{height:100%;display:grid;grid-template-rows:42px minmax(0,1fr);min-height:0;background:#fff}
    .workspace-tabs{min-height:42px;display:flex;align-items:flex-end;gap:4px;padding:0 10px;background:#f3f7fb;border-bottom:1px solid var(--nps-border);overflow-x:auto}
    .workspace-tab{height:36px;min-width:165px;padding:0 12px;border:1px solid transparent;border-radius:7px 7px 0 0;background:transparent;color:var(--nps-text-muted);font:600 10px Inter,sans-serif;text-align:left;cursor:pointer}
    .workspace-tab:hover{background:#eaf2ff;color:var(--nps-blue)}
    .workspace-tab.active{background:#fff;border-color:var(--nps-border);border-bottom-color:#fff;color:var(--nps-text);font-weight:800}
    .workspace-actions{margin-left:auto;display:flex;align-items:center;gap:7px;padding:0 6px 4px 12px}
    .workspace-actions button{height:31px;border:1px solid var(--nps-border);border-radius:8px;background:#fff;color:var(--nps-text);padding:0 12px;font-size:10px;cursor:pointer}
    .workspace-actions .primary{background:var(--nps-blue);border-color:var(--nps-blue);color:#fff;font-weight:700}
    .workspace-actions .generate{background:#eff6ff;border-color:#93c5fd;color:#1d4ed8;font-weight:700}
    .readonly-label{padding:6px 9px;border:1px solid #d7e0ea;border-radius:7px;background:#f8fafc;color:#64748b;font-size:9px;font-weight:700}
    .workspace-body{min-height:0;display:grid;background:var(--nps-app-bg);overflow:hidden}
    .diagram-panel{position:relative;min-width:0;min-height:0;overflow:hidden;background:#fff}
    .diagram-panel.properties-open{display:grid;grid-template-columns:minmax(0,1fr) 310px}
    .properties-window{min-width:0;height:100%;overflow:auto;background:#fff;border-left:1px solid var(--nps-border)}
    .properties-window header{height:38px;display:flex;align-items:center;padding:0 10px;background:#f8fbff;border-bottom:1px solid var(--nps-border)}
    .properties-window header strong{font-size:10px}.properties-window header button{margin-left:auto;width:25px;height:25px;border:1px solid var(--nps-border);border-radius:5px;background:#fff;cursor:pointer}
    .properties-window section{padding:12px}.properties-window h3{margin:0 0 9px;color:#64748b;font-size:8px;text-transform:uppercase}
    .property-row{display:grid;grid-template-columns:85px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #edf2f7;font-size:8px}
    .property-row span{color:#7b8ca2}.property-row b{color:#24364b;overflow-wrap:anywhere}.properties-empty{padding:16px;color:#94a3b8;font-size:8px;line-height:1.5}
    .browser-resizer{position:relative;z-index:8;cursor:row-resize;background:#eef3f8;border-top:1px solid #d5dee8;border-bottom:1px solid #d5dee8;touch-action:none}
    .browser-resizer:hover,.browser-resizer.dragging{background:#dbeafe}.browser-resizer span{position:absolute;left:50%;top:50%;width:42px;height:3px;border-radius:999px;background:#94a3b8;transform:translate(-50%,-50%)}
    .fault-tree-browser-panel{min-width:0;min-height:0;overflow:hidden;background:#fff;display:grid;grid-template-rows:minmax(0,1fr) 24px}
    .ft-table-wrap{min-height:0;overflow:auto;background:#fff}.ft-table{width:100%;border-collapse:collapse;table-layout:fixed;background:#fff;color:#111827}
    .ft-table th,.ft-table td{height:27px;padding:0 14px;border-bottom:1px solid #dfe6ee;border-right:1px solid #dfe6ee;text-align:left;vertical-align:middle;font-size:11px}
    .ft-table th:last-child,.ft-table td:last-child{border-right:0}.ft-table thead th{position:sticky;top:0;z-index:3;background:#f3f6fa;color:#1f2937;font-weight:800}
    .ft-table th:nth-child(1){width:220px}.ft-table th:nth-child(2){width:auto}.ft-table th:nth-child(3){width:175px}.ft-table th:nth-child(4){width:140px}
    .ft-table tbody tr{cursor:pointer;background:#fff}.ft-table tbody tr:hover{background:#f6f9fd}.ft-table tbody tr.selected{outline:1px solid #93c5fd;outline-offset:-1px;box-shadow:inset 3px 0 0 var(--nps-blue);background:#eef6ff}
    .ft-table tbody tr.selected .ft-id{color:var(--nps-blue);font-weight:800}.ft-id{font-weight:700}.ft-description{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .browser-footer{display:flex;align-items:center;gap:12px;min-height:24px;padding:0 8px;border-top:1px solid var(--nps-border);background:#f8fafc;overflow:hidden}
    .browser-footer strong{font-size:9px;color:var(--nps-text);white-space:nowrap}.browser-footer span{font-size:8px;color:var(--nps-text-muted)}
  `]
})
export class FaultTreeWorkspaceComponent implements OnDestroy {
  mode: WorkspaceMode = 'generation';
  records: FtBrowserRecord[] = [];
  selectedRecord!: FtBrowserRecord;
  selectedNode: GeneratedFaultTreeNode | null = null;
  propertiesOpen = false;
  browserHeight = 165;
  isResizingBrowser = false;

  private readonly subscriptions = new Subscription();
  private resizeStartY = 0;
  private resizeStartHeight = 165;

  private readonly generationRecords: FtBrowserRecord[] = [
    {
      id: 'UE-PTR-LOSS-FLOW',
      description: 'Loss of PTR cooling flow',
      editedDate: currentDateLabel(),
      editedBy: 'AR',
      model: makeEiTree(
        'UE-PTR-LOSS-FLOW',
        'Loss of PTR cooling flow',
        'PTR',
        'PTR train A pump / flow path unavailable',
        'PTR train B pump / flow path unavailable',
        'Loss of PTR electrical or I&C support'
      )
    },
    {
      id: 'UE-RRI-LOSS-COOLING',
      description: 'Loss of RRI component cooling water',
      editedDate: currentDateLabel(),
      editedBy: 'AR',
      model: makeEiTree(
        'UE-RRI-LOSS-COOLING',
        'Loss of RRI component cooling water',
        'RRI',
        'RRI train A cooling function unavailable',
        'RRI train B cooling function unavailable',
        'Loss of RRI electrical / heat-sink support'
      )
    },
    {
      id: 'UE-SEC-LOSS-UHS',
      description: 'Loss of SEC ultimate heat-sink supply',
      editedDate: currentDateLabel(),
      editedBy: 'AR',
      model: makeEiTree(
        'UE-SEC-LOSS-UHS',
        'Loss of SEC ultimate heat-sink supply',
        'SEC',
        'SEC train A service-water path unavailable',
        'SEC train B service-water path unavailable',
        'Loss of SEC power / ultimate heat-sink support'
      )
    }
  ];

  constructor(
    route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.subscriptions.add(route.data.subscribe(data => {
      this.mode = data['mode'] === 'generated' ? 'generated' : 'generation';
      this.loadRecords();
    }));
  }

  selectRecord(record: FtBrowserRecord): void {
    this.selectedRecord = record;
    this.selectedNode = null;
  }

  openGeneration(): void { void this.router.navigateByUrl('/generation'); }
  openGenerated(): void { void this.router.navigateByUrl('/generated-ft'); }

  generateSelected(): void {
    sessionStorage.setItem(SELECTED_GENERATED_EI_KEY, this.selectedRecord.id);
    void this.router.navigateByUrl('/generated-ft');
  }

  startBrowserResize(event: PointerEvent): void {
    event.preventDefault();
    this.isResizingBrowser = true;
    this.resizeStartY = event.clientY;
    this.resizeStartHeight = this.browserHeight;
    document.addEventListener('pointermove', this.onBrowserResizeMove);
    document.addEventListener('pointerup', this.onBrowserResizeEnd);
  }

  private readonly onBrowserResizeMove = (event: PointerEvent): void => {
    const delta = this.resizeStartY - event.clientY;
    this.browserHeight = Math.max(105, Math.min(330, this.resizeStartHeight + delta));
  };

  private readonly onBrowserResizeEnd = (): void => {
    this.isResizingBrowser = false;
    document.removeEventListener('pointermove', this.onBrowserResizeMove);
    document.removeEventListener('pointerup', this.onBrowserResizeEnd);
  };

  private loadRecords(): void {
    if (this.mode === 'generation') {
      this.records = this.generationRecords.map(record => ({
        ...record,
        model: {
          ...record.model,
          nodes: record.model.nodes.map(node => ({ ...node })),
          links: record.model.links.map(link => ({ ...link }))
        }
      }));
      this.selectedRecord = this.records[0];
      return;
    }

    this.records = this.generationRecords.map(generatedFromEi);
    const requestedEi = sessionStorage.getItem(SELECTED_GENERATED_EI_KEY);
    this.selectedRecord =
      this.records.find(record => record.sourceEventId === requestedEi)
      ?? this.records[0];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    document.removeEventListener('pointermove', this.onBrowserResizeMove);
    document.removeEventListener('pointerup', this.onBrowserResizeEnd);
  }
}
