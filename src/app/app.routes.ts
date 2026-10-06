import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'model-builder/hydraulic', pathMatch: 'full' },
  {
    path: 'model-builder/:domain',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent)
  },
  {
    path: 'generation',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent),
    data: { workspace: 'generation' }
  },
  {
    path: 'generated-ft',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent),
    data: { workspace: 'generated-ft' }
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
