import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../../core/data.service';
import { AuthService } from '../../../../core/auth.service';
import { ToastService } from '../../../../shared/toast/toast.service';
import { DistrictDropdownComponent, DropdownComponent, DropdownOption } from '../../../../shared/components';
import { District, AreaItem, Booking, CreateBookingPayload } from '../../../../core/models';

@Component({
  selector: 'app-booking-new',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DistrictDropdownComponent, DropdownComponent],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
      
      <!-- Back Link & Header -->
      <div class="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span>{{ authService.isAuthenticated() ? 'Back to Bookings' : 'Back to Home' }}</span>
          </button>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">New Booking</h1>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="goBack()"
            class="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="saveBooking()"
            [disabled]="isSubmitting || !name.trim() || !mobile.trim() || !address.trim()"
            class="px-5 py-2 rounded-xl bg-[#246b3f] hover:bg-[#1e5834] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            @if (isSubmitting) {
              <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Saving...</span>
            } @else {
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Save Booking</span>
            }
          </button>
        </div>
      </div>

      <!-- Main Form Card -->
      <form (ngSubmit)="saveBooking()" class="bg-white rounded-2xl border border-gray-200 shadow-xs p-6 space-y-6">
        
        <!-- Section 1: Customer Details & Fitting Locality (4 Columns) -->
        <div>
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
            <span>Customer & Location Details</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Col 1: Customer Name (name) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Customer Name <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                [(ngModel)]="name"
                required
                maxlength="150"
                placeholder="e.g. John Mathew"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
              />
            </div>

            <!-- Col 2: Mobile (mobile) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Mobile Number <span class="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                [(ngModel)]="mobile"
                required
                maxlength="25"
                placeholder="e.g. +91 98470 12345"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
              />
            </div>

            <!-- Col 3: District Dropdown (Searchable) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                District <span class="text-red-500">*</span>
              </label>
              <app-district-dropdown
                [districts]="districts()"
                [selectedDistrict]="selectedDistrictObj()"
                placeholder="Select District"
                (districtChange)="onDistrictChange($event)"
              ></app-district-dropdown>
            </div>

            <!-- Col 4: Area Dropdown (Searchable, filtered by district) -->
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Area / Locality <span class="text-red-500">*</span>
                @if (!districtId) {
                  <span class="text-[10px] text-amber-600 font-normal italic ml-1">Select district first</span>
                }
              </label>
              <app-dropdown
                [options]="areaDropdownOptions()"
                [ngModel]="areaName"
                name="area"
                [searchable]="true"
                [disabled]="!districtId"
                placeholder="Select Area"
                (ngModelChange)="onAreaSelected($event)"
              ></app-dropdown>
            </div>
          </div>

          <!-- Full Width Address (address) -->
          <div class="mt-4">
            <label class="block text-xs font-bold text-gray-700 mb-1.5">
              Full Address <span class="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              [(ngModel)]="address"
              required
              rows="2"
              placeholder="Door No, Street Name, Landmark, Post"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
            ></textarea>
          </div>
        </div>

        <!-- Section 2: Notes / Instructions (notes) -->
        <div>
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
            <span>Notes</span>
          </h2>
          <textarea
            name="notes"
            [(ngModel)]="notes"
            rows="3"
            placeholder="Fitting requirements, door specifications, masonry status, delivery notes..."
            class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
          ></textarea>
        </div>

        <!-- Section 3: Documents / Uploads (documents) -->
        <div>
          <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
            <span>Documents</span>
          </h2>

          <div class="space-y-3">
            <label
              class="border-2 border-dashed border-gray-300 hover:border-[#0f9d58] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#0f9d58]/5"
            >
              <input
                type="file"
                multiple
                (change)="onFilesSelected($event)"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
              <span class="text-xs font-semibold text-gray-700">Click or drag files here to upload</span>
              <span class="text-[11px] text-gray-400 mt-0.5">Images, PDFs, site measurements (Up to 10 files)</span>
            </label>

            @if (isUploading()) {
              <div class="text-xs text-[#0f9d58] font-semibold flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Uploading files...</span>
              </div>
            }

            @if (documents().length > 0) {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                @for (doc of documents(); track doc; let i = $index) {
                  <div class="flex items-center justify-between p-2.5 rounded-xl border border-gray-200 bg-white text-xs">
                    <div class="flex items-center gap-2 truncate">
                      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span class="truncate font-medium text-gray-800">{{ getFilename(doc) }}</span>
                    </div>
                    <button
                      type="button"
                      (click)="removeDoc(i)"
                      class="text-red-500 hover:text-red-700 ml-2 cursor-pointer p-1"
                      title="Remove"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

      </form>
    </div>
  `
})
export class BookingNewComponent implements OnInit {
  private dataService = inject(DataService);
  authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private title = inject(Title);

  // Form Fields matching create_booking SP
  name: string = '';
  mobile: string = '';
  address: string = '';
  notes: string = '';
  status: string = 'NEW';

  // System auto-resolved location fields
  stateId: number = 1;
  stateName: string = 'Kerala';
  districtId: number | null = null;
  districtName: string = '';
  areaId: number | null = null;
  areaName: string = '';

  // Branch Head assignment
  branchHeadId: number | null = null;
  branchHeadName: string = '';

  // Auth context
  loginRoleId: number | null = null;
  loginId: number | null = null;
  loginName: string | null = null;

  // Documents
  documents = signal<string[]>([]);
  isUploading = signal(false);
  isSubmitting = false;

  // Options
  districts = signal<District[]>([]);
  districtAreas = signal<AreaItem[]>([]);

  selectedDistrictObj = computed(() => {
    return this.districts().find(d => d.name === this.districtName || Number(d.id) === this.districtId) || null;
  });

  areaDropdownOptions = computed<DropdownOption[]>(() => {
    return this.districtAreas().map(a => ({
      label: a.name,
      value: a.name,
      subtext: a.pincode ? `PIN: ${a.pincode}` : undefined
    }));
  });

  ngOnInit(): void {
    this.title.setTitle('New Booking | SteelGuard');

    // Auto-resolve identity from authenticated session
    const u = this.authService.currentUser();
    if (u) {
      this.loginRoleId = Number(u.roleId ?? u.dbRoleId) || null;
      this.loginId = Number(u.id) || null;
      this.loginName = u.name || u.username || null;
      this.stateId = Number(u.stateId) || 1;
      this.stateName = u.stateName || 'Kerala';

      // If branch head, lock district
      if (this.loginRoleId === 3) {
        if (u.districtName) {
          this.districtName = u.districtName.replace(/\s+Hub$/i, '').trim();
        }
        if (u.districtId) {
          this.districtId = Number(u.districtId) || null;
        }
        if (u.name) {
          this.branchHeadName = u.name;
          this.branchHeadId = this.loginId;
        }
      }
    } else {
      this.loginRoleId = 5;
      this.loginId = null;
      this.loginName = 'customer';
    }

    this.loadDistricts();
  }

  loadDistricts(): void {
    this.dataService.getDropdownDistricts().subscribe({
      next: dists => {
        this.districts.set(dists);
        if (this.districtId) {
          this.loadAreasForDistrict(this.districtId);
        }
      }
    });
  }

  loadAreasForDistrict(districtId: number | string): void {
    this.dataService.getDropdownAreas(districtId).subscribe({
      next: areas => {
        this.districtAreas.set(areas);
      }
    });
  }

  onDistrictChange(district: District | null): void {
    if (!district) return;
    this.districtName = district.name;
    this.districtId = Number(district.id) || null;
    this.areaName = '';
    this.areaId = null;
    this.branchHeadName = district.name === 'Trivandrum' ? 'Suresh Kumar' : 'Rajesh Menon';
    this.loadAreasForDistrict(district.id);
  }

  onAreaSelected(selectedName: string): void {
    const matched = this.districtAreas().find(a => a.name === selectedName);
    if (matched) {
      this.areaId = Number(matched.id) || null;
      this.areaName = matched.name;
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isUploading.set(true);

    this.dataService.uploadDocuments(files).subscribe({
      next: res => {
        this.isUploading.set(false);
        if (res && res.urls && res.urls.length > 0) {
          this.documents.update(prev => [...prev, ...res.urls]);
        } else {
          const fallback = files.map(f => `/uploads/${f.name}`);
          this.documents.update(prev => [...prev, ...fallback]);
        }
      },
      error: () => {
        this.isUploading.set(false);
        const fallback = files.map(f => `/uploads/${f.name}`);
        this.documents.update(prev => [...prev, ...fallback]);
      }
    });
    input.value = '';
  }

  removeDoc(index: number): void {
    this.documents.update(prev => prev.filter((_, i) => i !== index));
  }

  getFilename(url: string): string {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || url;
    } catch {
      return url;
    }
  }

  goBack(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/bookings']);
    } else {
      this.router.navigate(['/']);
    }
  }

  saveBooking(): void {
    if (!this.name.trim() || !this.mobile.trim() || !this.address.trim()) {
      this.toast.error('Please fill in Name, Mobile Number, and Address.');
      return;
    }

    this.isSubmitting = true;

    // DDL matching payload
    const payload: CreateBookingPayload = {
      name: this.name.trim(),
      mobile: this.mobile.trim(),
      address: this.address.trim(),
      notes: this.notes.trim() || null,
      status: this.status || 'NEW',
      loginRoleId: this.loginRoleId,
      loginId: this.loginId,
      loginName: this.loginName,
      stateId: this.stateId,
      stateName: this.stateName,
      districtId: this.districtId,
      district_id: this.districtId,
      districtName: this.districtName,
      district_name: this.districtName,
      areaId: this.areaId,
      area_id: this.areaId,
      areaName: this.areaName.trim() || undefined,
      area_name: this.areaName.trim() || undefined,
      area: this.areaName.trim() || undefined,
      branchHeadId: this.branchHeadId,
      branch_head_id: this.branchHeadId,
      branchHeadName: this.branchHeadName || undefined,
      branch_head_name: this.branchHeadName || undefined,
      documents: this.documents(),

      // UI compatibility aliases
      clientName: this.name.trim(),
      contactPhone: this.mobile.trim()
    };

    this.dataService.createBooking(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toast.success('Booking created successfully!');
        if (this.authService.isAuthenticated()) {
          this.router.navigate(['/admin/bookings']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.toast.error(err?.error?.error || 'Failed to create booking. Please try again.');
      }
    });
  }
}

// Backward compatibility alias
export const AdminBookingNewComponent = BookingNewComponent;
export type AdminBookingNewComponent = BookingNewComponent;
