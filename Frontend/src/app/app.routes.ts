import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./features/public/public.routes').then(m => m.PUBLIC_ROUTES)
      }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'orders',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'website',
    redirectTo: '',
    pathMatch: 'prefix'
  },
  {
    path: 'branch',
    loadChildren: () => import('./features/branch/branch.routes').then(m => m.BRANCH_ROUTES)
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then(m => m.CLIENT_ROUTES)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
