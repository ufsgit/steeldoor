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
   * Returns the complete ready-to-share URL (backend already returns full URLs in file_url/documents;
   * safely falls back to environment.fileUrl only if an older relative path is encountered).
   */
  getPublicFileShareUrl(rawPath: string): string {
    if (!rawPath) return '';
    const trimmed = rawPath.trim();

    // Only accept external http(s) URLs directly if they aren't stale local/IP upload URLs
    if (/^https?:\/\//i.test(trimmed) && !/(localhost|127\.0\.0\.1|192\.168\.|\.sslip\.io)/i.test(trimmed)) {
      return encodeURI(trimmed);
    }

    let cleanPath = trimmed.replace(/^https?:\/\/[^/]+\//, '').replace(/^\/+/, '');
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    let base = environment.fileUrl || 'https://steeldoorapi.ufstech.co.in';
    if (base.includes('localhost') || base.includes('127.0.0.1')) {
      base = 'https://steeldoorapi.ufstech.co.in';
    }
    base = base.replace(/\/+$/, '');
    return encodeURI(`${base}/${cleanPath}`);
  }

  /**
   * Formats the shareable public URL for brochures
   */
  getShareUrl(brochure: Brochure): string {
    const rawPath = brochure.file_url || brochure.file_path || `/uploads/brochures/${brochure.file_name}`;
    return this.getPublicFileShareUrl(rawPath);
  }

  /**
   * Formats internal in-browser view URL for opening documents directly in the admin tab
   */
  getViewUrl(brochure: Brochure): string {
    const rawPath = brochure.file_url || brochure.file_path || `/uploads/brochures/${brochure.file_name}`;
    if (!rawPath) return '';

    const baseApi = environment.apiUrl ? environment.apiUrl.replace(/\/api\/?$/, '') : '';
    const uploadMatch = rawPath.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/i);
    if (uploadMatch && !environment.production && baseApi.includes('localhost')) {
      return encodeURI(`${baseApi}${uploadMatch[1]}`);
    }

    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return encodeURI(rawPath);
    }
    const cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    const base = (environment.fileUrl || 'https://steeldoorapi.ufstech.co.in').replace(/\/+$/, '');
    return encodeURI(`${base}/${cleanPath}`);
  }
}

