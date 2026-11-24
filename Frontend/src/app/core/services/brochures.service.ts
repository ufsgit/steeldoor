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
  private dynamicShareBaseUrl: string | null = null;

  constructor() {
    this.fetchShareConfig();
  }

  fetchShareConfig(): void {
    const configUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/api/uploads/share-config`;
    this.http.get<{ success: boolean; shareBaseUrl: string }>(configUrl).subscribe({
      next: (res) => {
        if (res?.shareBaseUrl) {
          this.dynamicShareBaseUrl = res.shareBaseUrl;
        }
      },
      error: () => {
        // Keep fallback based on environment and hostname
      }
    });
  }

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
   * Universal method to format any public file URL (documents, brochures, images, PDFs)
   * for WhatsApp sharing and external viewing using the live production domain.
   */
  getPublicFileShareUrl(rawPath: string): string {
    if (!rawPath) return '';

    let cleanPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath;
    cleanPath = cleanPath.replace(/^https?:\/\/[^\/]+\//, '');

    // Ensure it begins with uploads/ if it's a relative filename
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }

    // Determine base URL: prioritize dynamic config or environment.fileUrl, falling back to official live domain
    let base = this.dynamicShareBaseUrl || environment.fileUrl || 'https://steeldoorapi.ufstech.co.in';

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

