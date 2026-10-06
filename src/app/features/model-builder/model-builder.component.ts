import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as go from 'gojs';
import { createModelBuilderDiagram, ModelDomain } from '../../gojs/model-builder/model-builder-diagram';

interface PaletteItem {
  label: string;
  symbol: string;
}

const DOMAIN_TITLES: Record<ModelDomain, string> = {
  hydraulic: 'Hydraulic Knowledge-Base Editor',
  electrical: 'Electrical Architecture Editor',
  ic: 'I&C / Control & Instrumentation Editor',
  hvac: 'HVAC Knowledge-Base Editor'
};

const DOMAIN_PALETTES: Record<ModelDomain, readonly PaletteItem[]> = {
  hydraulic: [
    { label: 'Pump', symbol: '◉' },
    { label: 'Motorized Valve', symbol: '⋈' },
    { label: 'Manual Valve', symbol: '◇' },
    { label: 'Check Valve', symbol: '▷' },
    { label: 'Heat Exchanger', symbol: '▥' },
    { label: 'Tank / Pool', symbol: '▱' },
    { label: 'Pipe Junction', symbol: '●' },
    { label: 'Boundary', symbol: '⊣' }
  ],
  electrical: [
    { label: 'Busbar', symbol: '━' },
    { label: 'Breaker', symbol: '□' },
    { label: 'Transformer', symbol: '◎' },
    { label: 'Motor', symbol: 'M' },
    { label: 'Diesel Generator', symbol: 'G' },
    { label: 'Battery', symbol: '▥' },
    { label: 'Inverter', symbol: '⌁' },
    { label: 'Power Supply', symbol: 'ϟ' }
  ],
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

@Component({
  selector: 'app-model-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-builder.component.html',
  styleUrl: './model-builder.component.scss'
})
export class ModelBuilderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef<HTMLDivElement>;

  domain: ModelDomain = 'hydraulic';
  workspace = 'editor';
  private diagram?: go.Diagram;
  private readonly subscriptions = new Subscription();
  private viewReady = false;

  constructor(private readonly route: ActivatedRoute) {
    this.subscriptions.add(this.route.params.subscribe(params => {
      const candidate = params['domain'] as ModelDomain | undefined;
      if (candidate && ['hydraulic', 'electrical', 'ic', 'hvac'].includes(candidate)) {
        this.domain = candidate;
        this.workspace = 'editor';
        this.rebuildDiagram();
      }
    }));

    this.subscriptions.add(this.route.data.subscribe(data => {
      if (data['workspace']) {
        this.workspace = data['workspace'];
      }
    }));
  }

  get title(): string {
    if (this.workspace === 'generation') return 'Fault Tree Generation';
    if (this.workspace === 'generated-ft') return 'Generated Fault Tree Viewer';
    if (this.workspace === 'knowledge-base') return 'Knowledge Base — Component Classes';
    if (this.workspace === 'rules') return 'Knowledge Base — Rules & Failure Modes';
    return DOMAIN_TITLES[this.domain];
  }

  get palette(): readonly PaletteItem[] {
    return DOMAIN_PALETTES[this.domain];
  }

  get domainLabel(): string {
    return this.domain === 'ic' ? 'I&C' : this.domain.charAt(0).toUpperCase() + this.domain.slice(1);
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.rebuildDiagram();
  }

  undo(): void {
    this.diagram?.commandHandler.undo();
  }

  redo(): void {
    this.diagram?.commandHandler.redo();
  }

  zoomIn(): void {
    if (this.diagram) this.diagram.scale *= 1.1;
  }

  zoomOut(): void {
    if (this.diagram) this.diagram.scale /= 1.1;
  }

  fit(): void {
    this.diagram?.zoomToFit();
  }

  private rebuildDiagram(): void {
    if (!this.viewReady || !this.diagramDiv) return;
    if (this.diagram) this.diagram.div = null;
    this.diagram = createModelBuilderDiagram(this.diagramDiv.nativeElement, this.domain);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.diagram) this.diagram.div = null;
  }
}
