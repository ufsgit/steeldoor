import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BookingHistoryRecord {
  history_id: number;
  booking_id: number;
  booking_name: string | null;
  action_type: string;
  customer_note?: string | null;
  staff_note?: string | null;
  old_status_id?: number | null;
  old_status_code?: string | null;
  old_status_label?: string | null;
  old_status_color_code?: string | null;
  new_status_id?: number | null;
  new_status_code?: string | null;
  new_status_label?: string | null;
  new_status_color_code?: string | null;
  old_schedule_date?: string | null;
  new_schedule_date?: string | null;
  from_branch_head_id?: number | null;
  from_branch_head_name?: string | null;
  to_branch_head_id?: number | null;
  to_branch_head_name?: string | null;
  from_assigned_head_district_id?: number | null;
  from_assigned_head_district_name?: string | null;
  to_assigned_head_district_id?: number | null;
  to_assigned_head_district_name?: string | null;
  action_by_id?: number | null;
  action_by_name?: string | null;
  action_by_role_id?: number | null;
  created_at: string;
}

export interface BookingHistoryResponse {
  success: boolean;
  data: {
    history: BookingHistoryRecord[];
    page: number;
    limit: number;
    count: number;
  };
}

export interface BookingHistoryFilterParams {
  search?: string;
  actionFilter?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingHistoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/booking-history`;

  getBookingHistory(params: BookingHistoryFilterParams): Observable<BookingHistoryResponse> {
    let httpParams = new HttpParams();

    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.actionFilter && params.actionFilter !== 'ALL') {
      httpParams = httpParams.set('actionFilter', params.actionFilter);
    }
    if (params.fromDate) {
      httpParams = httpParams.set('fromDate', params.fromDate);
    }
    if (params.toDate) {
      httpParams = httpParams.set('toDate', params.toDate);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<BookingHistoryResponse>(this.apiUrl, {
      params: httpParams,
      withCredentials: true
    });
  }
}

