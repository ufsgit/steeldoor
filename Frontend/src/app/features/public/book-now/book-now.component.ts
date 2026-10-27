import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { DistrictDropdownComponent } from '../../../shared/components';
import { District, AreaItem, Booking, CreateBookingPayload } from '../../../core/models';

@Component({
  selector: 'app-book-now',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DistrictDropdownComponent],
  template: `
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">

      @if (submittedBooking()) {
        <!-- Success Confirmation Screen -->
        <div class="max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-scaleUp">
          <div class="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0f9d58] border border-emerald-100 mx-auto flex items-center justify-center shadow-xs">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-1.5">
            <span class="text-xs font-bold uppercase tracking-wider text-[#0f9d58]">Installation Enquiry Registered</span>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Booking Confirmed!</h2>
            <p class="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
              Your steel door installation request has been recorded. Our regional district branch team will contact you shortly to confirm the installation schedule.
            </p>
          </div>

          <!-- Highlight Booking Summary Box -->
          <div class="max-w-md mx-auto p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 text-left">
            <div class="flex items-center justify-between text-xs border-b border-gray-200 pb-2.5">
              <span class="text-gray-500 font-medium">Booking ID:</span>
              <span class="font-mono font-bold text-sm text-[#0f9d58]">#{{ submittedBooking()?.id || 'NEW' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-gray-200 pb-2.5">
              <span class="text-gray-500 font-medium">Customer Name:</span>
              <span class="font-bold text-gray-900">{{ submittedBooking()?.name || name }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-gray-200 pb-2.5">
              <span class="text-gray-500 font-medium">Mobile Number:</span>
              <span class="font-semibold text-gray-900">{{ submittedBooking()?.mobile || mobile }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-gray-200 pb-2.5">
              <span class="text-gray-500 font-medium">District & Area:</span>
              <span class="font-semibold text-gray-900">
                {{ submittedBooking()?.districtName || districtName }} {{ areaName ? '· ' + areaName : '' }}
              </span>
            </div>
            <div class="flex items-start justify-between text-xs pt-0.5">
              <span class="text-gray-500 font-medium shrink-0 mr-4">Address:</span>
              <span class="text-gray-800 text-right truncate max-w-[240px]">{{ submittedBooking()?.address || address }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              (click)="resetForm()"
              class="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Book Another Door
            </button>
            <a
              routerLink="/"
              class="px-6 py-2.5 rounded-xl bg-[#246b3f] hover:bg-[#1e5834] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Return to Home
            </a>
          </div>
        </div>
      } @else {
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
              <span>Back</span>
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

              <!-- Col 3: District Hub (district_id / district_name) -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  District <span class="text-red-500">*</span>
                </label>
                <app-district-dropdown
                  [(ngModel)]="districtName"
                  [districts]="districts()"
                  valueField="name"
                  suffix="Hub"
                  placeholder="Select District"
                  searchPlaceholder="Search district..."
                  (districtChange)="onDistrictChange($event)"
                ></app-district-dropdown>
              </div>

              <!-- Col 4: Area / Locality (area_id / area_name) -->
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Area / Locality <span class="text-red-500">*</span></span>
                  @if (!districtId) {
                    <span class="text-[10px] font-normal text-amber-600 italic">Select district first</span>
                  }
                </label>

                @if (districtAreas().length > 0) {
                  <select
                    name="areaName"
                    [(ngModel)]="areaName"
                    (ngModelChange)="onAreaSelected($event)"
                    [disabled]="!districtId"
                    class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58] cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
                  >
                    <option value="">{{ !districtId ? 'Select District First...' : '-- Select Registered Area --' }}</option>
                    @for (a of districtAreas(); track a.id) {
                      <option [value]="a.name">{{ a.name }} {{ a.pincode ? '(' + a.pincode + ')' : '' }}</option>
                    }
                  </select>
                } @else {
                  <input
                    type="text"
                    name="areaName"
                    [(ngModel)]="areaName"
                    required
                    [disabled]="!districtId"
                    [placeholder]="!districtId ? 'Select district first...' : 'e.g. Edapally'"
                    class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed transition-colors"
                  />
                }
              </div>

              <!-- Full Address (address) spans all 4 columns -->
              <div class="sm:col-span-2 lg:col-span-4">
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
          </div>

          <!-- Section 2: Notes & Instructions (4 Columns) -->
          <div>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
              <span>Notes</span>
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="sm:col-span-2 lg:col-span-4">
                <label class="block text-xs font-bold text-gray-700 mb-1.5">
                  Notes / Instructions
                </label>
                <textarea
                  name="notes"
                  [(ngModel)]="notes"
                  rows="3"
                  placeholder="Fitting requirements, door specifications, masonry status, delivery notes..."
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Section 3: Documents (JSON) -->
          <div>
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
              <span>Documents</span>
            </h2>

            <div class="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl p-5 bg-gray-50/50 hover:bg-gray-50 text-center transition-colors">
              <input
                type="file"
                multiple
                #fileInput
                (change)="onFilesSelected($event)"
                class="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <div class="flex flex-col items-center justify-center gap-1.5 cursor-pointer" (click)="fileInput.click()">
                <div class="w-10 h-10 rounded-full bg-emerald-50 text-[#0f9d58] flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span class="text-xs text-gray-700 font-semibold">Click to select documents or site photos</span>
                <span class="text-[10px] text-gray-400">Upload door frame pictures or architectural site documents</span>
              </div>
            </div>

            @if (documents.length > 0) {
              <div class="flex flex-wrap gap-2 mt-3">
                @for (doc of documents; track $index) {
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-800">
                    <svg class="w-3.5 h-3.5 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <span class="truncate max-w-[200px] font-medium">{{ getFilename(doc) }}</span>
                    <button
                      type="button"
                      (click)="removeDoc($index)"
                      class="p-0.5 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                      title="Remove"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Bottom Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              (click)="goBack()"
              class="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSubmitting || !name.trim() || !mobile.trim() || !address.trim()"
              class="px-6 py-2.5 rounded-xl bg-[#246b3f] hover:bg-[#1e5834] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              @if (isSubmitting) {
                <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Saving Booking...</span>
              } @else {
                <span>Submit & Create Booking</span>
              }
            </button>
          </div>

        </form>
      }
    </div>
  `
})
export class BookNowComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private titleService = inject(Title);

  districts = signal<District[]>([]);
  districtAreas = signal<AreaItem[]>([]);
  submittedBooking = signal<any>(null);

  // Form fields matching admin/bookings/new
  name = '';
  mobile = '';
  address = '';
  notes = '';
  status = 'NEW';
  loginRoleId: number | null = 5;
  loginId: number | null = null;
  loginName: string | null = 'customer';
  stateId: number | null = 1;
  stateName = 'Kerala';
  districtId: number | null = null;
  districtName = '';
  areaId: number | null = null;
  areaName = '';
  branchHeadId: number | null = null;
  branchHeadName = 'Rajesh Menon';
  documents: string[] = [];

  isSubmitting = false;

  ngOnInit(): void {
    this.titleService.setTitle('Book Installation & Door Fitting | SteelGuard');
    this.loadDistricts();
  }

  loadDistricts(): void {
    this.dataService.getDistricts().subscribe({
      next: dists => {
        this.districts.set(dists);
        if (this.districtId) {
          this.loadAreasForDistrict(this.districtId);
        }
      }
    });
  }

  loadAreasForDistrict(districtId: number | string): void {
    this.dataService.getAreasByDistrict(districtId).subscribe({
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
    this.dataService.uploadDocuments(files).subscribe({
      next: res => {
        if (res && res.urls && res.urls.length > 0) {
          this.documents = [...this.documents, ...res.urls];
        } else {
          const fallback = files.map(f => `/uploads/${f.name}`);
          this.documents = [...this.documents, ...fallback];
        }
      },
      error: () => {
        const fallback = files.map(f => `/uploads/${f.name}`);
        this.documents = [...this.documents, ...fallback];
      }
    });
    input.value = '';
  }

  removeDoc(index: number): void {
    this.documents.splice(index, 1);
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
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/bookings']);
    } else {
      this.router.navigate(['/']);
    }
  }

  resetForm(): void {
    this.name = '';
    this.mobile = '';
    this.address = '';
    this.notes = '';
    this.districtId = null;
    this.districtName = '';
    this.areaId = null;
    this.areaName = '';
    this.documents = [];
    this.submittedBooking.set(null);
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
      loginRoleId: 5,
      loginId: null,
      loginName: 'customer',
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
      documents: this.documents,

      // UI compatibility aliases
      clientName: this.name.trim(),
      contactPhone: this.mobile.trim(),
      clientType: 'customer'
    };

    this.dataService.createPublicBooking(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.toast.success('Booking created successfully!');
        this.submittedBooking.set(res?.data || res || payload);
      },
      error: err => {
        this.isSubmitting = false;
        this.toast.error(err?.error?.error || 'Failed to create booking. Please try again.');
      }
    });
  }
}
