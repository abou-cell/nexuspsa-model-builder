import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as go from 'gojs';
import {
  createModelBuilderDiagram,
  ElectricalSystemId,
  HydraulicSystemId,
  ModelDomain
} from '../../gojs/model-builder/model-builder-diagram';
import { createHydraulicPalette } from '../../gojs/model-builder/hydraulic-palette';
import { createElectricalPalette } from '../../gojs/model-builder/electrical-palette';

interface PaletteItem {
  label: string;
  symbol: string;
}

interface SystemTableRow {
  key: number;
  identifier: string;
  componentType: string;
  kbClass: string;
  train: string;
  inputs: number;
  outputs: number;
  support: string;
  status: string;
}

interface EngineeringSystem {
  id: string;
  description: string;
  createdAt: string;
  creatorId: string;
  domain: ModelDomain;
}

interface FailureModeRow {
  code: string;
  name: string;
  category: string;
  enabled: boolean;
}

interface RuleRow {
  id: string;
  name: string;
  condition: string;
  result: string;
}

type InspectorTab = 'properties' | 'failures' | 'rules';

const DOMAIN_TITLES: Record<ModelDomain, string> = {
  hydraulic: 'Hydraulic Knowledge-Base Editor',
  electrical: 'Electrical Architecture Editor',
  ic: 'I&C / Control & Instrumentation Editor',
  hvac: 'HVAC Knowledge-Base Editor'
};

const DOMAIN_PALETTES: Record<ModelDomain, readonly PaletteItem[]> = {
  hydraulic: [],
  electrical: [],
  ic: [
    { label: 'Sensor', symbol: '◈' },
    { label: 'Transmitter', symbol: 'T' },
    { label: 'Logic', symbol: 'ƒ' },
    { label: '2oo3 Vote', symbol: '⅔' },
    { label: 'Actuation', symbol: '▶' },
    { label: 'Relay', symbol: 'R' },
    { label: 'Signal', symbol: '→' },
    { label: 'I&C Power', symbol: 'ϟ' }
  ],
  hvac: [
    { label: 'Fan', symbol: '✣' },
    { label: 'Damper', symbol: '⋈' },
    { label: 'Filter', symbol: '▦' },
    { label: 'Duct', symbol: '━' },
    { label: 'Cooler', symbol: '❄' },
    { label: 'Room', symbol: '▣' },
    { label: 'Boundary', symbol: '⊣' },
    { label: 'Sensor', symbol: '◈' }
  ]
};

const SYSTEMS: EngineeringSystem[] = [
  { id: 'PTR', description: 'Spent Fuel Pool cooling and purification system', createdAt: '2026-10-07', creatorId: 'AR-001', domain: 'hydraulic' },
  { id: 'RRI', description: 'Component cooling water system', createdAt: '2026-10-07', creatorId: 'AR-001', domain: 'hydraulic' },
  { id: 'SEC', description: 'Essential service water / ultimate heat sink system', createdAt: '2026-10-07', creatorId: 'AR-001', domain: 'hydraulic' },
  { id: 'ELEC-10KV', description: 'Main 10 kV generation and distribution architecture', createdAt: '2026-10-08', creatorId: 'AR-001', domain: 'electrical' },
  { id: 'ELEC-LV', description: '690 V / 400 V essential low-voltage distribution', createdAt: '2026-10-08', creatorId: 'AR-001', domain: 'electrical' },
  { id: 'ELEC-DC', description: '220 Vdc / 125 Vdc backed power and conversion system', createdAt: '2026-10-08', creatorId: 'AR-001', domain: 'electrical' },
  { id: 'IC-A', description: 'Example control and instrumentation architecture', createdAt: '2026-10-07', creatorId: 'AR-001', domain: 'ic' },
  { id: 'HVAC-A', description: 'Example ventilation architecture', createdAt: '2026-10-07', creatorId: 'AR-001', domain: 'hvac' }
];

@Component({
  selector: 'app-model-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-builder.component.html',
  styleUrl: './model-builder.component.scss'
})
export class ModelBuilderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('paletteDiv') paletteDiv?: ElementRef<HTMLDivElement>;

  domain: ModelDomain = 'hydraulic';
  workspace = 'editor';
  systemRows: SystemTableRow[] = [];
  selectedTableKey?: number;
  selectedSystemId = 'PTR';
  inspectorTab: InspectorTab = 'properties';
  inspectorVisible = false;
  zoomPercent = 100;
  selectionCount = 0;
  paletteWidth = 300;

  private diagram?: go.Diagram;
  private componentPalette?: go.Palette;
  private readonly subscriptions = new Subscription();
  private viewReady = false;
  private paletteResizeStartX = 0;
  private paletteResizeStartWidth = 300;

  private readonly onPaletteResizeMove = (event: MouseEvent): void => {
    const maxWidth = Math.min(520, Math.max(320, window.innerWidth * 0.45));
    const delta = event.clientX - this.paletteResizeStartX;
    this.paletteWidth = Math.max(240, Math.min(maxWidth, this.paletteResizeStartWidth + delta));
    this.componentPalette?.requestUpdate();
    this.diagram?.requestUpdate();
  };

  private readonly onPaletteResizeEnd = (): void => {
    document.removeEventListener('mousemove', this.onPaletteResizeMove);
    document.removeEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.remove('palette-resizing');
    this.componentPalette?.requestUpdate();
    this.diagram?.requestUpdate();
  };

  constructor(private readonly route: ActivatedRoute) {
    this.subscriptions.add(this.route.params.subscribe(params => {
      const candidate = params['domain'] as ModelDomain | undefined;
      if (candidate && ['hydraulic', 'electrical', 'ic', 'hvac'].includes(candidate)) {
        this.domain = candidate;
        this.workspace = 'editor';
        this.selectedSystemId = this.systems[0]?.id ?? 'PTR';
        this.inspectorTab = 'properties';
        this.rebuildDiagram();
        setTimeout(() => this.rebuildPalette());
      }
    }));

    this.subscriptions.add(this.route.data.subscribe(data => {
      if (data['workspace']) this.workspace = data['workspace'];
    }));
  }

  get title(): string {
    if (this.workspace === 'generation') return 'Fault Tree Generation';
    if (this.workspace === 'generated-ft') return 'Generated Fault Tree Viewer';
    if (this.workspace === 'knowledge-base') return 'Knowledge Base — Component Classes';
    if (this.workspace === 'rules') return 'Knowledge Base — Rules & Failure Modes';
    return DOMAIN_TITLES[this.domain];
  }

  get palette(): readonly PaletteItem[] { return DOMAIN_PALETTES[this.domain]; }

  get domainLabel(): string {
    return this.domain === 'ic' ? 'I&C' : this.domain.charAt(0).toUpperCase() + this.domain.slice(1);
  }

  get workspaceLabel(): string {
    if (this.workspace === 'generation') return 'FT Generation Workspace';
    if (this.workspace === 'generated-ft') return 'Generated FT Workspace';
    if (this.workspace === 'knowledge-base') return 'Knowledge Base Workspace';
    if (this.workspace === 'rules') return 'Rules Workspace';
    return `${this.domainLabel} Workspace`;
  }

  get systems(): EngineeringSystem[] { return SYSTEMS.filter(system => system.domain === this.domain); }

  get selectedComponent(): SystemTableRow | undefined {
    return this.systemRows.find(row => row.key === this.selectedTableKey) ?? this.systemRows[0];
  }

  get failureModes(): FailureModeRow[] {
    const component = this.selectedComponent;
    if (!component) return [];
    const type = component.componentType.toUpperCase();
    if (/PUMP|FAN|MOTOR|DIESEL|GENERATOR|GES/.test(type)) {
      return [
        { code: 'FTS', name: 'Fail to start / energize', category: 'Demand', enabled: true },
        { code: 'FTR', name: 'Fail to run / supply', category: 'Mission', enabled: true },
        { code: 'SS', name: 'Spurious stop / trip', category: 'Spurious', enabled: true }
      ];
    }
    if (/VALVE|DAMPER|BREAKER/.test(type)) {
      return [
        { code: 'FTC', name: 'Fail to change state', category: 'Demand', enabled: true },
        { code: 'FO', name: 'Fail open', category: 'Position', enabled: true },
        { code: 'FC', name: 'Fail closed', category: 'Position', enabled: true }
      ];
    }
    if (/HEAT EXCHANGER|FILTER|TRANSFORMER|RECTIFIER|INVERTER|CONVERTER/.test(type)) {
      return [
        { code: 'DEG', name: 'Degraded function', category: 'Performance', enabled: true },
        { code: 'LOF', name: 'Loss of function', category: 'Mission', enabled: true }
      ];
    }
    if (/BATTERY/.test(type)) {
      return [
        { code: 'LC', name: 'Loss of capacity', category: 'Performance', enabled: true },
        { code: 'LOF', name: 'Loss of DC supply', category: 'Mission', enabled: true }
      ];
    }
    return [
      { code: 'LOF', name: 'Loss of function', category: 'Mission', enabled: true },
      { code: 'UNAV', name: 'Unavailable', category: 'State', enabled: true }
    ];
  }

  get rules(): RuleRow[] {
    const component = this.selectedComponent;
    if (!component) return [];
    const rows: RuleRow[] = [
      { id: 'R-01', name: 'Component availability', condition: `${component.identifier} required`, result: `Include ${component.identifier} failure modes` }
    ];
    if (component.inputs > 0) rows.push({ id: 'R-02', name: 'Upstream dependency', condition: 'Required upstream path unavailable', result: 'Propagate loss of function' });
    if (component.support !== '—') rows.push({ id: 'R-03', name: 'Support dependency', condition: `${component.support} unavailable`, result: `Set ${component.identifier} unavailable` });
    if (/VALVE|BREAKER|DAMPER/i.test(component.componentType)) rows.push({ id: 'R-04', name: 'Command dependency', condition: 'Required command not received', result: 'Generate actuation failure branch' });
    return rows;
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.rebuildDiagram();
    setTimeout(() => this.rebuildPalette());
  }

  startPaletteResize(event: MouseEvent): void {
    event.preventDefault();
    this.paletteResizeStartX = event.clientX;
    this.paletteResizeStartWidth = this.paletteWidth;
    document.addEventListener('mousemove', this.onPaletteResizeMove);
    document.addEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.add('palette-resizing');
  }

  undo(): void { this.diagram?.commandHandler.undo(); }
  redo(): void { this.diagram?.commandHandler.redo(); }
  zoomIn(): void { this.changeZoom(1.2); }
  zoomOut(): void { this.changeZoom(1 / 1.2); }

  fit(): void {
    if (!this.diagram) return;
    this.diagram.zoomToFit();
    this.syncZoomPercent();
  }

  selectAllComponents(): void {
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

  setInspectorTab(tab: InspectorTab): void {
    if (this.inspectorVisible && this.inspectorTab === tab) {
      this.inspectorVisible = false;
    } else {
      this.inspectorTab = tab;
      this.inspectorVisible = true;
    }
    setTimeout(() => this.diagram?.requestUpdate());
  }

  toggleInspector(): void {
    this.inspectorVisible = !this.inspectorVisible;
    setTimeout(() => this.diagram?.requestUpdate());
  }

  selectSystem(system: EngineeringSystem): void {
    if (this.selectedSystemId === system.id) return;
    this.selectedSystemId = system.id;
    this.selectedTableKey = undefined;
    this.inspectorTab = 'properties';
    this.rebuildDiagram();
  }

  selectSystemRow(row: SystemTableRow): void {
    this.selectedTableKey = row.key;
    const node = this.diagram?.findNodeForKey(row.key);
    if (!node || !this.diagram) return;
    this.diagram.select(node);
    this.diagram.centerRect(node.actualBounds);
  }

  private changeZoom(factor: number): void {
    if (!this.diagram) return;
    const center = this.diagram.viewportBounds.center;
    const nextScale = Math.min(this.diagram.maxScale, Math.max(this.diagram.minScale, this.diagram.scale * factor));
    this.diagram.scale = nextScale;
    const viewport = this.diagram.viewportBounds;
    this.diagram.position = new go.Point(center.x - viewport.width / 2, center.y - viewport.height / 2);
    this.syncZoomPercent();
  }

  private syncZoomPercent(): void {
    this.zoomPercent = this.diagram ? Math.round(this.diagram.scale * 100) : 100;
  }

  private rebuildPalette(): void {
    if (this.componentPalette) {
      this.componentPalette.div = null;
      this.componentPalette = undefined;
    }
    if (!this.viewReady || !['hydraulic', 'electrical'].includes(this.domain)) return;
    const host = this.paletteDiv?.nativeElement;
    if (!host) return;
    this.componentPalette = this.domain === 'hydraulic'
      ? createHydraulicPalette(host)
      : createElectricalPalette(host);
  }

  private rebuildDiagram(): void {
    if (!this.viewReady || !this.diagramDiv) return;
    if (this.diagram) this.diagram.div = null;

    let systemId: HydraulicSystemId | ElectricalSystemId = 'PTR';
    if (this.domain === 'hydraulic') systemId = this.selectedSystemId as HydraulicSystemId;
    if (this.domain === 'electrical') systemId = this.selectedSystemId as ElectricalSystemId;

    this.diagram = createModelBuilderDiagram(this.diagramDiv.nativeElement, this.domain, systemId);
    this.syncSystemTable();
    this.selectedTableKey = this.systemRows[0]?.key;
    this.syncZoomPercent();
    this.selectionCount = 0;

    this.diagram.addModelChangedListener(event => {
      if (event.isTransactionFinished) this.syncSystemTable();
    });

    this.diagram.addDiagramListener('ChangedSelection', () => {
      this.selectionCount = this.diagram?.selection.count ?? 0;
      const selected = this.diagram?.selection.first();
      if (selected instanceof go.Node) this.selectedTableKey = Number(selected.data?.key);
    });

    this.diagram.addDiagramListener('ViewportBoundsChanged', () => {
      this.syncZoomPercent();
    });
  }

  private syncSystemTable(): void {
    if (!this.diagram) return;
    const model = this.diagram.model as go.GraphLinksModel;
    const nodes = model.nodeDataArray as Array<{ key: number; name: string; type: string }>;
    const links = model.linkDataArray as Array<{ from: number; to: number }>;

    this.systemRows = nodes.map(node => ({
      key: node.key,
      identifier: node.name,
      componentType: node.type,
      kbClass: this.resolveKbClass(node.type),
      train: this.resolveTrain(node.name),
      inputs: links.filter(link => link.to === node.key).length,
      outputs: links.filter(link => link.from === node.key).length,
      support: this.resolveSupport(node.name, node.type),
      status: 'Valid'
    }));

    if (this.selectedTableKey !== undefined && !this.systemRows.some(row => row.key === this.selectedTableKey)) {
      this.selectedTableKey = this.systemRows[0]?.key;
    }
  }

  private resolveKbClass(type: string): string {
    const normalized = type.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
    const prefixes: Record<ModelDomain, string> = { hydraulic: 'HYDRAULIC', electrical: 'ELECTRICAL', ic: 'IC', hvac: 'HVAC' };
    return `${prefixes[this.domain]}.${normalized}`;
  }

  private resolveTrain(identifier: string): string {
    if (/(-B|002|B$)/i.test(identifier)) return 'Train B';
    if (/ROOM|SFP|SOURCE|ULTIMATE|HX$/i.test(identifier)) return 'Common';
    return 'Train A';
  }

  private resolveSupport(identifier: string, type: string): string {
    if (this.domain === 'hydraulic') {
      if (/PUMP/i.test(type)) return 'Electrical supply';
      if (/VALVE/i.test(type)) return 'I&C / power';
      if (/EXCHANGER/i.test(type)) return this.selectedSystemId === 'SEC' ? 'Ultimate heat sink' : 'Cooling support';
      return '—';
    }
    if (this.domain === 'electrical') {
      if (/GENERATOR|GES/i.test(type)) return 'Fuel / auxiliaries / start';
      if (/BREAKER/i.test(type)) return 'Protection / I&C';
      if (/TRANSFORMER/i.test(type)) return 'Upstream AC supply';
      if (/CHARGER|RECTIFIER|INVERTER|CONVERTER/i.test(type)) return 'Upstream supply / cooling';
      if (/BATTERY/i.test(type)) return 'Charger / room conditions';
      if (/SWITCHBOARD/i.test(type)) return 'Upstream electrical supply';
      return 'Upstream supply';
    }
    if (this.domain === 'ic') {
      if (/POWER/i.test(type)) return 'DC / AC supply';
      if (/SENSOR/i.test(type)) return 'Process input';
      if (/LOGIC/i.test(type)) return 'I&C power';
      return 'Logic channel';
    }
    if (/FAN/i.test(type)) return 'Electrical supply';
    if (/DAMPER/i.test(type)) return 'Actuation / I&C';
    if (/ROOM/i.test(identifier)) return 'Boundary condition';
    return 'Air path';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    document.removeEventListener('mousemove', this.onPaletteResizeMove);
    document.removeEventListener('mouseup', this.onPaletteResizeEnd);
    document.body.classList.remove('palette-resizing');
    if (this.diagram) this.diagram.div = null;
    if (this.componentPalette) this.componentPalette.div = null;
  }
}
