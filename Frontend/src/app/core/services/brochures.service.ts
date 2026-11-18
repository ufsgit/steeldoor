import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Brochure {
  id: number;
  title: string;
  description?: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
  is_active?: number;
  created_at: string;
  updated_at?: string;
  file_url?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BrochuresResponse {
  success: boolean;
  count: number;
  pagination?: PaginationInfo;
  data: Brochure[];
}

@Injectable({
  providedIn: 'root'
})
export class BrochuresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl.replace(/\/$/, '')}/brochures`;

  /**
   * Fetch all brochures with optional search query and pagination
   */
  getBrochures(search = '', page = 1, limit = 9): Observable<{ data: Brochure[]; pagination?: PaginationInfo }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<BrochuresResponse>(this.apiUrl, { params }).pipe(
      map(res => ({
        data: res.data || [],
        pagination: res.pagination
      }))
    );
  }

  /**
   * Upload a new brochure with title, description and file
   */
  uploadBrochure(title: string, description: string, file: File): Observable<Brochure> {
    const formData = new FormData();
    formData.append('title', title);
    if (description) {
      formData.append('description', description);
    }
    formData.append('file', file);

    return this.http.post<{ success: boolean; data: Brochure }>(this.apiUrl, formData).pipe(
      map(res => res.data)
    );
  }

  /**
   * Soft-delete a brochure by ID
   */
  deleteBrochure(id: number): Observable<boolean> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`).pipe(
      map(res => !!res.success)
    );
  }

  /**
   * Formats the shareable public URL that can be copied and sent to customers via WhatsApp.
   * Ensures:
   * 1. In local dev, uses a wildcard DNS domain (192.168.2.147.sslip.io) so WhatsApp detects a valid
   *    public TLD (.io) and renders it as an active, clickable blue hyperlink (not plain text),
   *    which automatically navigates to the browser and resolves to your local server to load the actual image.
   * 2. In production, uses environment.fileUrl (https://steeldoorapi.ufstech.co.in).
   * 3. Spaces and special characters are percent-encoded with encodeURI() so WhatsApp links don't break.
   */
  getShareUrl(brochure: Brochure): string {
    const rawPath = brochure.file_url || brochure.file_path || `/uploads/brochures/${brochure.file_name}`;
    let cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;

    // Strip any existing domain if rawPath is already absolute
    cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+\//, '');

    let base = environment.fileUrl || 'http://localhost:5000';

    if (!environment.production) {
      if (typeof window !== 'undefined' && window.location?.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const h = window.location.hostname;
        const domainHost = /^\d+\.\d+\.\d+\.\d+$/.test(h) ? `${h}.sslip.io` : h;
        base = `http://${domainHost}:5000`;
      } else {
        base = 'http://192.168.2.147.sslip.io:5000';
      }
    }

    base = base.replace(/\/+$/, '');
    const fullUrl = `${base}/${cleanPath}`;
    return encodeURI(fullUrl);
  }

  /**
   * Formats internal in-browser view URL for opening documents directly in the local admin tab
   */
  getViewUrl(brochure: Brochure): string {
    const rawPath = brochure.file_url || brochure.file_path || `/uploads/brochures/${brochure.file_name}`;
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return encodeURI(rawPath);
    }
    const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    const base = (environment.fileUrl || 'http://localhost:5000').replace(/\/+$/, '');
    return encodeURI(`${base}/${cleanPath}`);
  }
}

