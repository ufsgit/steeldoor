import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { RegisterComponent } from './register/register.component';
import { guestGuard, rootGuard } from '../../core/guards/auth.guard';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [rootGuard]
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'services',
    redirectTo: 'bookings/new',
    pathMatch: 'full'
  },
  {
    path: 'book-now',
    redirectTo: 'bookings/new',
    pathMatch: 'full'
  },
  {
    path: 'bookings/new',
    loadComponent: () => import('../admin/bookings/add/booking-new.component').then(m => m.BookingNewComponent)
  },
  {
    path: 'login',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [guestGuard]
  }
];
