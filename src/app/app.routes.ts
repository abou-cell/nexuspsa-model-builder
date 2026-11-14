import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'model-builder/hydraulic', pathMatch: 'full' },
  {
    path: 'model-builder/ic',
    loadComponent: () => import('./features/ic-workspace/ic-workspace.component')
      .then(m => m.IcWorkspaceComponent)
  },
  {
    path: 'model-builder/:domain',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent)
  },
  {
    path: 'generation',
    loadComponent: () => import('./features/fault-tree-workspace/fault-tree-workspace.component')
      .then(m => m.FaultTreeWorkspaceComponent),
    data: { mode: 'generation' }
  },
  {
    path: 'generated-ft',
    loadComponent: () => import('./features/fault-tree-workspace/fault-tree-workspace.component')
      .then(m => m.FaultTreeWorkspaceComponent),
    data: { mode: 'generated' }
  },
  {
    path: 'knowledge-base',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent),
    data: { workspace: 'knowledge-base' }
  },
  {
    path: 'knowledge-base/rules',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent),
    data: { workspace: 'rules' }
  },
  { path: '**', redirectTo: 'model-builder/hydraulic' }
];
