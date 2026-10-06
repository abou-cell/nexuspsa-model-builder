import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/model-builder/model-builder.component')
      .then(m => m.ModelBuilderComponent)
  },
  { path: '**', redirectTo: '' }
];
