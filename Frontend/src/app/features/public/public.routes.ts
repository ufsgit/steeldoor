import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ServicesComponent } from './services/services.component';
import { BookNowComponent } from './book-now/book-now.component';
import { RegisterComponent } from './register/register.component';
import { guestGuard } from '../../core/guards/auth.guard';
import {
  branchHeadsResolver,
  districtsResolver,
  servicesResolver,
  testimonialsResolver,
  siteContentResolver
} from '../../core/resolvers/data.resolvers';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    resolve: {
      services: servicesResolver,
      testimonials: testimonialsResolver,
      siteContent: siteContentResolver
    }
  },
  {
    path: 'about',
    component: AboutComponent,
    resolve: {
      districts: districtsResolver
    }
  },
  {
    path: 'contact',
    loadComponent: () => import('./contact/contact.component').then(m => m.ContactComponent),
    resolve: {
      districts: districtsResolver
    }
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
    loadComponent: () => import('../admin/bookings/add/admin-booking-new.component').then(m => m.AdminBookingNewComponent),
    resolve: {
      districts: districtsResolver,
      branchHeads: branchHeadsResolver
    }
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
