import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminBookingsComponent } from './bookings/list/admin-bookings.component';
import { AdminBookingDetailComponent } from './bookings/booking-detail.component';
import { BookingNewComponent } from './bookings/add/booking-new.component';
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
        component: BookingNewComponent
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
        component: AdminAreasComponent
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        resolve: {
          users: usersResolver
        }
      },
      {
        path: 'history',
        component: AdminHistoryComponent
      }
    ]
  }
];
