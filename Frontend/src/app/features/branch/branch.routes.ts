import { Routes } from '@angular/router';
import { BranchLayoutComponent } from '../../layouts/branch-layout.component';
import { BranchDashboardComponent } from './dashboard/branch-dashboard.component';
import { BranchBookingsComponent } from './bookings/branch-bookings.component';
import { BranchBookingDetailComponent } from './bookings/branch-booking-detail.component';
import { BranchProfileComponent } from './profile/branch-profile.component';
import { roleGuard } from '../../core/guards/auth.guard';
import { bookingDetailResolver, bookingsResolver } from '../../core/resolvers/data.resolvers';

export const BRANCH_ROUTES: Routes = [
  {
    path: '',
    component: BranchLayoutComponent,
    canActivate: [roleGuard(['branch_head'])],
    children: [
      {
        path: '',
        component: BranchDashboardComponent,
        resolve: {
          bookings: bookingsResolver
        }
      },
      {
        path: 'bookings',
        component: BranchBookingsComponent,
        resolve: {
          bookings: bookingsResolver
        }
      },
      {
        path: 'bookings/:id',
        component: BranchBookingDetailComponent,
        resolve: {
          booking: bookingDetailResolver
        }
      },
      {
        path: 'profile',
        component: BranchProfileComponent
      }
    ]
  }
];
