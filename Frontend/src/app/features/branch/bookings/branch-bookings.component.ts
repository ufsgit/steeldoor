import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { Booking } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-branch-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusChipComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl sm:text-3xl font-black text-text tracking-tight">
              District Jobs Worksheet
            </h1>
            <span class="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase">
              {{ userDistrictName() }} HUB
            </span>
          </div>
          <p class="text-xs sm:text-sm text-text-muted mt-0.5 font-medium">
            Live operational ledger for door installations, schedules, and fittings in your district.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="printWorksheet()"
            class="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs sm:text-sm font-bold shadow-soft transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            <span>Print Worksheet</span>
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Total District Jobs</span>
          <div class="text-3xl font-black text-primary">{{ bookings().length }}</div>
        </div>
        <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Pending Review</span>
          <div class="text-3xl font-black text-warning">{{ getTabCount('Pending') }}</div>
        </div>
        <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Scheduled Fittings</span>
          <div class="text-3xl font-black text-status-scheduled">{{ getTabCount('Scheduled') }}</div>
        </div>
        <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
          <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Completed</span>
          <div class="text-3xl font-black text-success">{{ getTabCount('Finished') }}</div>
        </div>
      </div>

      <!-- Full Spreadsheet / Ledger Table Section -->
      <div class="space-y-4 animate-fadeIn">
        <!-- Table Toolbar -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border-2 border-border shadow-xs">
          <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            @for (st of filterTabs; track st.val) {
              <button
                type="button"
                (click)="activeStatusFilter = st.val"
                class="px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                [ngClass]="activeStatusFilter === st.val
                  ? 'bg-primary text-text-inverted border-primary shadow-xs'
                  : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-primary/40'"
              >
                <span>{{ st.label }}</span>
                <span
                  class="px-2 py-0.5 rounded-md text-[11px] font-black"
                  [ngClass]="activeStatusFilter === st.val ? 'bg-text-inverted/20 text-text-inverted' : 'bg-surface-muted text-text-muted'"
                >
                  {{ getTabCount(st.val) }}
                </span>
              </button>
            }
          </div>

          <div class="flex items-center gap-3">
            <div class="relative w-full sm:w-72">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Search jobs, client, area..."
                class="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              />
              <svg class="w-4 h-4 text-text-muted absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Full Spreadsheet / Ledger Table -->
        <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                  <th class="py-4 px-4">Job ID</th>
                  <th class="py-4 px-4">Client Name & Type</th>
                  <th class="py-4 px-4">Door Model</th>
                  <th class="py-4 px-4 text-center">Qty</th>
                  <th class="py-4 px-4">Installation Area</th>
                  <th class="py-4 px-4">Booking Date</th>
                  <th class="py-4 px-4">Scheduled Fitting</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                @for (b of filteredBookings(); track b.id; let idx = $index) {
                  <tr
                    (click)="selectedBooking.set(b)"
                    class="cursor-pointer transition-colors"
                    [ngClass]="selectedBooking()?.id === b.id
                      ? 'bg-primary/10 font-bold border-l-[8px] border-l-primary'
                      : (idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60 border-l-[8px] border-l-transparent' : 'bg-surface-muted/30 hover:bg-surface-muted/60 border-l-[8px] border-l-transparent')"
                  >
                    <!-- Job ID -->
                    <td class="py-4 px-4 font-mono font-black text-primary">#{{ b.id }}</td>

                    <!-- Client Name & Type -->
                    <td class="py-4 px-4">
                      <div class="font-bold text-text">{{ b.clientName }}</div>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-surface-muted border border-border text-text-muted">
                          {{ b.clientType }}
                        </span>
                        <span class="text-[11px] text-text-muted">{{ b.contactPhone }}</span>
                      </div>
                    </td>

                    <!-- Door Model -->
                    <td class="py-4 px-4 font-bold text-text">{{ b.doorDetails.doorType }}</td>

                    <!-- Quantity -->
                    <td class="py-4 px-4 text-center">
                      <span class="inline-block px-2.5 py-1 rounded-md bg-surface-muted border border-border font-black text-xs">
                        {{ b.doorDetails.quantity }}
                      </span>
                    </td>

                    <!-- Area -->
                    <td class="py-4 px-4 text-text font-semibold">{{ b.area }}</td>

                    <!-- Booking Date -->
                    <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ formatDate(b.createdAt) }}</td>

                    <!-- Scheduled Fitting Date -->
                    <td class="py-4 px-4 font-mono text-xs">
                      @if (b.scheduledDate) {
                        <span class="text-status-scheduled font-bold">{{ formatDate(b.scheduledDate) }}</span>
                      } @else {
                        <span class="text-text-muted italic">Not Scheduled</span>
                      }
                    </td>

                    <!-- Status Chip -->
                    <td class="py-4 px-4">
                      <app-status-chip
                        [status]="b.status"
                        [isDelayed]="b.isDelayed || false"
                        [hoursSinceSubmitted]="b.hoursSinceSubmitted"
                        size="sm"
                      ></app-status-chip>
                    </td>

                    <!-- Actions -->
                    <td class="py-4 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="selectedBooking.set(b); $event.stopPropagation()"
                          class="px-3 py-1.5 rounded-lg border border-border text-xs font-bold transition-all cursor-pointer"
                          [ngClass]="selectedBooking()?.id === b.id ? 'bg-primary text-text-inverted' : 'bg-surface hover:bg-surface-muted text-text'"
                        >
                          {{ selectedBooking()?.id === b.id ? 'Viewing' : 'Inspect' }}
                        </button>
                        <a
                          [routerLink]="['/branch/bookings', b.id]"
                          (click)="$event.stopPropagation()"
                          class="px-3 py-1.5 rounded-lg bg-surface-muted hover:bg-primary hover:text-text-inverted text-text border border-border text-xs font-bold transition-colors cursor-pointer"
                          title="Manage job actions"
                        >
                          Manage
                        </a>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="p-8 text-center text-text-muted">
                      No district jobs match the current filter.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Full Selected Job Details Drawer below the worksheet table -->
        @if (selectedBooking(); as b) {
          <div class="p-6 sm:p-7 rounded-3xl bg-surface border-2 border-primary/40 shadow-card space-y-6 animate-fadeIn">
            <!-- Top Details Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-border pb-4">
              <div class="flex items-center gap-3">
                <span class="font-mono text-lg font-black text-primary bg-primary/10 border border-primary/25 px-3 py-1 rounded-lg">
                  #{{ b.id }}
                </span>
                <div>
                  <h3 class="text-lg sm:text-xl font-black text-text">{{ b.doorDetails.doorType }}</h3>
                  <span class="text-xs text-text-muted font-medium">District Fitting Scope & Status</span>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border text-text font-black text-xs sm:text-sm">
                  {{ b.doorDetails.quantity }} Unit(s)
                </span>
                <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="lg"></app-status-chip>
                <a
                  [routerLink]="['/branch/bookings', b.id]"
                  class="px-4 py-2 rounded-xl bg-primary text-text-inverted text-xs font-bold hover:bg-primary-hover shadow-soft transition-all"
                >
                  Manage Job & Stepper →
                </a>
              </div>
            </div>

            <!-- Scheduled Date Banner if present -->
            @if (b.scheduledDate) {
              <div class="p-4 rounded-2xl bg-status-scheduled/10 border-2 border-status-scheduled/30 flex items-center justify-between">
                <div>
                  <span class="font-black text-status-scheduled text-xs uppercase tracking-wider block">Scheduled Fitting Date</span>
                  <strong class="text-base text-text font-black">{{ formatFullDate(b.scheduledDate) }}</strong>
                </div>
                <span class="text-status-scheduled text-xs font-black px-3.5 py-1.5 rounded-xl bg-surface shadow-xs border border-status-scheduled/30">
                  Crew Dispatched
                </span>
              </div>
            }

            <!-- 4-step progress stepper -->
            <div class="space-y-3.5 p-5 rounded-2xl bg-surface-muted/50 border border-border">
              <span class="text-xs font-black uppercase tracking-wider text-text-muted block">Installation Progress</span>
              <div class="grid grid-cols-4 gap-2 text-center text-xs">
                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-sm shadow-xs" [ngClass]="getStepClass(b, 1)">✓</div>
                  <span class="block font-bold text-xs" [ngClass]="getStepTextClass(b, 1)">Placed</span>
                </div>
                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-sm shadow-xs" [ngClass]="getStepClass(b, 2)">
                    @if (isStepComplete(b, 2)) { ✓ } @else { 2 }
                  </div>
                  <span class="block font-bold text-xs" [ngClass]="getStepTextClass(b, 2)">Accepted</span>
                </div>
                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-sm shadow-xs" [ngClass]="getStepClass(b, 3)">
                    @if (isStepComplete(b, 3)) { ✓ } @else { 3 }
                  </div>
                  <span class="block font-bold text-xs" [ngClass]="getStepTextClass(b, 3)">Scheduled</span>
                </div>
                <div class="space-y-2">
                  <div class="w-10 h-10 mx-auto rounded-full flex items-center justify-center font-black text-sm shadow-xs" [ngClass]="getStepClass(b, 4)">
                    @if (isStepComplete(b, 4)) { ✓ } @else { 4 }
                  </div>
                  <span class="block font-bold text-xs" [ngClass]="getStepTextClass(b, 4)">Installed</span>
                </div>
              </div>
            </div>

            <!-- Client & Job Information Grid -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 rounded-2xl bg-background border border-border text-xs sm:text-sm">
              <div>
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Brand</span>
                <strong class="text-text font-black text-sm sm:text-base">{{ b.doorDetails.brand || 'Tata Pravesh' }}</strong>
                <span class="text-[11px] text-text-muted block mt-0.5">{{ b.doorDetails.doorType }}</span>
              </div>
              <div>
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Quantity</span>
                <strong class="text-primary font-black text-sm sm:text-base">{{ b.doorDetails.quantity }} Unit(s)</strong>
                @if (b.doorDetails.dimensions) {
                  <span class="text-[11px] text-text-muted block">Size: {{ b.doorDetails.dimensions }}</span>
                }
              </div>
              <div>
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Client</span>
                <strong class="text-text font-black text-sm sm:text-base">{{ b.clientName }}</strong>
                <span class="text-[11px] text-text-muted block mt-0.5">{{ b.clientType }}</span>
              </div>
              <div>
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Contact Phone</span>
                <a href="tel:{{ b.contactPhone }}" class="text-primary font-black hover:underline block mt-0.5">
                  {{ b.contactPhone }}
                </a>
              </div>
              <div>
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Location / Area</span>
                <strong class="text-text font-black">{{ b.area }}</strong>
                <span class="text-[11px] text-text-muted block">{{ b.address }}</span>
              </div>
            </div>

            <!-- Attached Site Photos -->
            @if (b.doorDetails.images && b.doorDetails.images.length > 0) {
              <div class="space-y-2 p-5 rounded-2xl bg-background border border-border">
                <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Site / Door Photos ({{ b.doorDetails.images.length }})</span>
                <div class="flex flex-wrap gap-3 pt-1">
                  @for (img of b.doorDetails.images; track $index) {
                    <a [href]="img" target="_blank" class="block w-20 h-20 rounded-xl overflow-hidden border border-border hover:border-primary shadow-xs transition-all hover:scale-105 cursor-pointer group" title="Click to view full photo">
                      <img [src]="img" alt="Site photo" class="w-full h-full object-cover group-hover:opacity-90"/>
                    </a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class BranchBookingsComponent implements OnInit {
  auth = inject(AuthService);
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  bookings = signal<Booking[]>([]);
  selectedBooking = signal<Booking | null>(null);

  activeStatusFilter = '';
  searchQuery = '';

  filterTabs = [
    { label: 'All Jobs', val: '' },
    { label: 'Pending', val: 'Pending' },
    { label: 'Delayed', val: 'Delayed' },
    { label: 'Accepted', val: 'Accepted' },
    { label: 'Scheduled', val: 'Scheduled' },
    { label: 'Finished', val: 'Finished' },
    { label: 'Rejected', val: 'Rejected' }
  ];

  userDistrictName = () => {
    const dId = this.auth.currentUser()?.districtId;
    return dId ? dId.replace('dist-', '').toUpperCase() : 'District';
  };

  getTabCount(statusVal: string): number {
    if (!statusVal) return this.bookings().length;
    if (statusVal === 'Delayed') return this.bookings().filter(b => b.isDelayed).length;
    return this.bookings().filter(b => b.status === statusVal).length;
  }

  filteredBookings = () => {
    return this.bookings().filter(b => {
      if (this.activeStatusFilter) {
        if (this.activeStatusFilter === 'Delayed') {
          if (!b.isDelayed) return false;
        } else if (b.status !== this.activeStatusFilter) {
          return false;
        }
      }

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        return (
          b.clientName.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.doorDetails.doorType.toLowerCase().includes(q)
        );
      }

      return true;
    });
  };

  ngOnInit(): void {
    this.titleService.setTitle('District Jobs Worksheet | SteelGuard');

    const currentUser = this.auth.currentUser();
    const districtId = currentUser?.districtId || undefined;
    const branchHeadId = currentUser?.branchHeadId || undefined;

    this.dataService.getBookings({ districtId, branchHeadId }).subscribe(list => {
      this.bookings.set(list);
      if (list.length > 0 && !this.selectedBooking()) {
        this.selectedBooking.set(list[0]);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const st = params.get('status');
      if (st) this.activeStatusFilter = st;
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  printWorksheet(): void {
    window.print();
  }

  isStepComplete(b: Booking, step: number): boolean {
    const status = b.status;
    if (step === 1) return true;
    if (step === 2) return status === 'Accepted' || status === 'Scheduled' || status === 'Finished';
    if (step === 3) return status === 'Scheduled' || status === 'Finished';
    if (step === 4) return status === 'Finished';
    return false;
  }

  getStepClass(b: Booking, step: number): string {
    const isComp = this.isStepComplete(b, step);
    if (isComp) return 'bg-success text-text-inverted border-2 border-success';
    return 'bg-surface-muted text-text-muted border-2 border-border';
  }

  getStepTextClass(b: Booking, step: number): string {
    const isComp = this.isStepComplete(b, step);
    if (isComp) return 'text-success font-black';
    return 'text-text-muted';
  }
}
