import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as go from 'gojs';
import { createModelBuilderDiagram } from '../../gojs/model-builder/model-builder-diagram';

@Component({
  selector: 'app-model-builder',
  standalone: true,
  templateUrl: './model-builder.component.html',
  styleUrl: './model-builder.component.scss'
})
export class ModelBuilderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('diagramDiv', { static: true }) diagramDiv!: ElementRef<HTMLDivElement>;
  private diagram?: go.Diagram;

  ngAfterViewInit(): void {
    this.diagram = createModelBuilderDiagram(this.diagramDiv.nativeElement);
  }

  ngOnDestroy(): void {
    if (this.diagram) {
      this.diagram.div = null;
    }
  }
}
