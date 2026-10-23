import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminBookingsComponent } from './bookings/admin-bookings.component';
import { AdminBookingDetailComponent } from './bookings/booking-detail.component';
import { BookNowComponent } from '../public/book-now/book-now.component';
import { AdminBranchHeadsComponent } from './branch-heads/branch-heads.component';
import { AdminClientsComponent } from './clients/clients.component';
import { AdminAreasComponent } from './areas/areas.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminHistoryComponent } from './history/history.component';
import { authGuard } from '../../core/guards/auth.guard';
import {
  bookingDetailResolver,
  bookingsResolver,
  branchHeadsResolver,
  clientsResolver,
  districtsResolver,
  historyResolver,
  usersResolver
} from '../../core/resolvers/data.resolvers';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: AdminBookingsComponent,
        resolve: {
          bookings: bookingsResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'bookings',
        component: AdminBookingsComponent,
        resolve: {
          bookings: bookingsResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'reports',
        component: AdminDashboardComponent,
        resolve: {
          bookings: bookingsResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'bookings/new',
        component: BookNowComponent,
        resolve: {
          districts: districtsResolver,
          branchHeads: branchHeadsResolver
        }
      },
      {
        path: 'bookings/:id',
        component: AdminBookingDetailComponent,
        resolve: {
          booking: bookingDetailResolver
        }
      },
      {
        path: 'branch-heads',
        component: AdminBranchHeadsComponent,
        resolve: {
          branchHeads: branchHeadsResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'clients',
        component: AdminClientsComponent,
        resolve: {
          clients: clientsResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'areas',
        component: AdminAreasComponent,
        resolve: {
          districts: districtsResolver
        }
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        resolve: {
          users: usersResolver,
          districts: districtsResolver
        }
      },
      {
        path: 'history',
        component: AdminHistoryComponent,
        resolve: {
          history: historyResolver
        }
      }
    ]
  }
];
