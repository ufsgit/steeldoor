import { Routes } from '@angular/router';
import { ClientLayoutComponent } from '../../layouts/client-layout.component';
import { ClientDashboardComponent } from './dashboard/client-dashboard.component';
import { ClientProfileComponent } from './profile/client-profile.component';
import { roleGuard } from '../../core/guards/auth.guard';
import { bookingsResolver } from '../../core/resolvers/data.resolvers';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    canActivate: [roleGuard(['user', 'client'])],
    children: [
      {
        path: '',
        component: ClientDashboardComponent,
        resolve: {
          bookings: bookingsResolver
        }
      },
      {
        path: 'profile',
        component: ClientProfileComponent
      }
    ]
  }
];
