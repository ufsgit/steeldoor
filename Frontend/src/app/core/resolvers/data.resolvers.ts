import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DataService } from '../data.service';
import {
  Booking,
  BookingHistoryEntry,
  BranchHead,
  Client,
  District,
  ServiceItem,
  SiteContent,
  TestimonialItem
} from '../models';

export const districtsResolver: ResolveFn<District[]> = () => {
  return inject(DataService).getDistricts().pipe(
    catchError(() => of([]))
  );
};

export const usersResolver: ResolveFn<any> = () => {
  return inject(DataService).getUsers({ page: 1, limit: 10 }).pipe(
    catchError(() => of({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } }))
  );
};

export const branchHeadsResolver: ResolveFn<BranchHead[]> = () => {
  return inject(DataService).getBranchHeads().pipe(
    catchError(() => of([]))
  );
};

export const clientsResolver: ResolveFn<Client[]> = () => {
  return inject(DataService).getClients().pipe(
    catchError(() => of([]))
  );
};

export const bookingsResolver: ResolveFn<Booking[]> = (route: ActivatedRouteSnapshot) => {
  const status = route.queryParamMap.get('status') || undefined;
  const districtId = route.queryParamMap.get('districtId') || undefined;
  const branchHeadId = route.queryParamMap.get('branchHeadId') || undefined;
  const clientId = route.queryParamMap.get('clientId') || undefined;
  const clientType = route.queryParamMap.get('clientType') || undefined;
  const search = route.queryParamMap.get('search') || undefined;

  return inject(DataService).getBookings({ status, districtId, branchHeadId, clientId, clientType, search }).pipe(
    catchError(() => of([]))
  );
};

export const bookingDetailResolver: ResolveFn<Booking | null> = (route: ActivatedRouteSnapshot) => {
  const id = route.paramMap.get('id');
  if (!id) return of(null);
  return inject(DataService).getBookingById(id).pipe(
    catchError(() => of(null))
  );
};

export const historyResolver: ResolveFn<BookingHistoryEntry[]> = () => {
  return inject(DataService).getHistory().pipe(
    catchError(() => of([]))
  );
};

export const servicesResolver: ResolveFn<ServiceItem[]> = () => {
  return inject(DataService).getServices().pipe(
    catchError(() => of([]))
  );
};

export const testimonialsResolver: ResolveFn<TestimonialItem[]> = () => {
  return inject(DataService).getTestimonials().pipe(
    catchError(() => of([]))
  );
};

export const siteContentResolver: ResolveFn<SiteContent | null> = () => {
  return inject(DataService).getSiteContent().pipe(
    catchError(() => of(null))
  );
};
