import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { Booking, District } from '../../../core/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 animate-fadeIn">
      
      <!-- 1. Google Sheet Status Tabs Bar (From Screenshot) -->
      <div class="flex items-center gap-6 border-b border-gray-200 pb-3 overflow-x-auto text-xs font-medium text-gray-500 select-none">
        <!-- All Orders Tab with List/Grid icon -->
        <button
          type="button"
          id="tab-all-orders"
          (click)="setStatus('')"
          class="flex items-center gap-2 pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === '' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          <svg class="w-4 h-4 text-inherit" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>All Orders</span>
        </button>

        <button
          type="button"
          id="tab-pending"
          (click)="setStatus('Pending')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Pending' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Pending
        </button>

        <button
          type="button"
          id="tab-accepted"
          (click)="setStatus('Accepted')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Accepted' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Accepted
        </button>

        <button
          type="button"
          id="tab-scheduled"
          (click)="setStatus('Scheduled')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Scheduled' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Scheduled
        </button>

        <button
          type="button"
          id="tab-finished"
          (click)="setStatus('Finished')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Finished' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Finished
        </button>

        <button
          type="button"
          id="tab-delayed"
          (click)="setStatus('Delayed')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Delayed' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Delayed
        </button>

        <button
          type="button"
          id="tab-rejected"
          (click)="setStatus('Rejected')"
          class="pb-2.5 -mb-3 transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Rejected' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'hover:text-gray-900 border-b-2 border-transparent'"
        >
          Rejected
        </button>
      </div>

      <!-- 2. Google Sheet Filter & Action Toolbar (Exact layout from screenshot) -->
      <div class="flex flex-wrap items-center gap-2.5 pt-1 text-xs">
        <!-- Search Input -->
        <div class="flex-1 min-w-[260px]">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event); currentPage.set(1)"
            placeholder="Search sheet (e.g. client, door, hub)..."
            class="w-full text-xs px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] font-medium"
          />
        </div>

        <!-- Date Range Pickers: [dd/mm/yyyy 📅] - [dd/mm/yyyy 📅] -->
        <div class="flex items-center gap-1.5">
          <input
            type="date"
            [ngModel]="dateFrom()"
            (ngModelChange)="dateFrom.set($event); currentPage.set(1)"
            class="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
            title="Start date"
          />
          <span class="text-gray-400 font-bold">-</span>
          <input
            type="date"
            [ngModel]="dateTo()"
            (ngModelChange)="dateTo.set($event); currentPage.set(1)"
            class="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
            title="End date"
          />
        </div>

        <!-- District Hubs Dropdown -->
        <div class="w-40 sm:w-44">
          <div class="relative">
            <select
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event); currentPage.set(1)"
              class="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] font-medium appearance-none"
            >
              <option value="">All Districts Hubs</option>
              @for (d of districts; track d.id) {
                <option [value]="d.id">{{ d.name }} Hub</option>
              }
            </select>
            <div class="absolute right-2.5 top-2.5 pointer-events-none text-gray-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Client Types Dropdown -->
        <div class="w-36">
          <div class="relative">
            <select
              [ngModel]="selectedClientType()"
              (ngModelChange)="selectedClientType.set($event); currentPage.set(1)"
              class="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] font-medium appearance-none"
            >
              <option value="">All Client Types</option>
              <option value="dealer">Dealers</option>
              <option value="customer">Customers</option>
              <option value="company">Company</option>
            </select>
            <div class="absolute right-2.5 top-2.5 pointer-events-none text-gray-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Search Action Button -->
        <button
          type="button"
          (click)="currentPage.set(1)"
          class="px-3.5 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
        >
          <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span>Search</span>
        </button>

        <!-- + New Enquiry Green Button (From Screenshot) -->
        <a
          routerLink="/admin/bookings/new"
          class="px-4 py-2 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          <span>New Enquiry</span>
        </a>
      </div>

      <!-- 3. Google Sheet Data Table (Exact columns: A · CLIENT NAME, B · PHONE NUMBER, C · DISTRICT & AREA, D · ASSIGNED HEAD, E · SCHEDULED FITTING, F · STATUS) -->
      <div class="overflow-x-auto pt-2">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-[11px] font-bold text-gray-600 select-none">
              <!-- Left Row Number Header -->
              <th class="w-10 py-3 px-2 text-center text-gray-400 font-normal"></th>

              <!-- Column A -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">A ·</span>
                <span class="uppercase tracking-wider">CLIENT NAME</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>

              <!-- Column B -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">B ·</span>
                <span class="uppercase tracking-wider">PHONE NUMBER</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>

              <!-- Column C -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">C ·</span>
                <span class="uppercase tracking-wider">DISTRICT & AREA</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>

              <!-- Column D -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">D ·</span>
                <span class="uppercase tracking-wider">ASSIGNED HEAD</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>

              <!-- Column E -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">E ·</span>
                <span class="uppercase tracking-wider">SCHEDULED FITTING</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>

              <!-- Column F -->
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">F ·</span>
                <span class="uppercase tracking-wider">STATUS</span>
                <svg class="w-3 h-3 text-gray-400 inline-block ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </th>
            </tr>
          </thead>

          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
            @for (b of paginatedBookings(); track b.id; let idx = $index) {
              <tr
                (click)="openBooking(b)"
                class="hover:bg-gray-50/80 transition-colors cursor-pointer group"
              >
                <!-- Row Number Index (1, 2, 3...) -->
                <td class="w-10 py-3.5 px-2 text-center font-mono text-gray-400 text-xs select-none">
                  {{ (currentPage() - 1) * pageSize + idx + 1 }}
                </td>

                <!-- A · CLIENT NAME -->
                <td class="py-3.5 px-4 font-bold text-gray-900 group-hover:text-[#0f9d58] transition-colors whitespace-nowrap">
                  {{ b.clientName }}
                </td>

                <!-- B · PHONE NUMBER -->
                <td class="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                  {{ b.contactPhone }}
                </td>

                <!-- C · DISTRICT & AREA -->
                <td class="py-3.5 px-4 text-gray-700 whitespace-nowrap">
                  {{ b.area }}, {{ b.districtName }} Hub
                </td>

                <!-- D · ASSIGNED HEAD -->
                <td class="py-3.5 px-4 text-gray-800 whitespace-nowrap">
                  {{ b.branchHeadName || 'Rajesh Menon' }}
                </td>

                <!-- E · SCHEDULED FITTING -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  @if (b.scheduledDate) {
                    <span class="text-gray-700 font-medium">{{ formatScheduledDate(b.scheduledDate) }}</span>
                  } @else {
                    <span class="text-gray-400 italic">Pending</span>
                  }
                </td>

                <!-- F · STATUS (Clean pill matching screenshot) -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <!-- Pending -->
                  @if (b.status === 'Pending' && !b.isDelayed) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fff7ed] text-[#ea580c] border border-[#ffedd5]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#ea580c]"></span>
                      <span>Pending</span>
                    </span>
                  }

                  <!-- Scheduled -->
                  @if (b.status === 'Scheduled' && !b.isDelayed) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
                      <span>Scheduled</span>
                    </span>
                  }

                  <!-- Accepted -->
                  @if (b.status === 'Accepted' && !b.isDelayed) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                      <span>Accepted</span>
                    </span>
                  }

                  <!-- Delayed -->
                  @if (b.isDelayed) {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf5ff] text-[#9333ea] border border-[#f3e8ff]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#9333ea]"></span>
                      <span>Delayed</span>
                    </span>
                  }

                  <!-- Finished -->
                  @if (b.status === 'Finished') {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
                      <span>Finished</span>
                    </span>
                  }

                  <!-- Rejected -->
                  @if (b.status === 'Rejected') {
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fee2e2]">
                      <span class="w-1.5 h-1.5 rounded-full bg-[#dc2626]"></span>
                      <span>Rejected</span>
                    </span>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="py-12 text-center text-gray-400">
                  No records match your filter criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- 4. Subtle Google Sheet Bottom Bar with record count & pagination -->
      <div class="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div>
          Showing <strong class="text-gray-800">{{ (currentPage() - 1) * pageSize + 1 }}</strong> to
          <strong class="text-gray-800">{{ getEndIndex() }}</strong> of
          <strong class="text-gray-800">{{ filteredBookings().length }}</strong> orders
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="prevPage()"
            [disabled]="currentPage() === 1"
            class="px-3 py-1 rounded border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span class="px-1 text-gray-700 font-semibold">
            {{ currentPage() }} / {{ totalPages() || 1 }}
          </span>
          <button
            type="button"
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages()"
            class="px-3 py-1 rounded border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  `
})
export class AdminBookingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private titleService = inject(Title);

  bookings = signal<Booking[]>([]);
  districts: District[] = [];

  // Filter signals
  searchQuery = signal('');
  selectedStatus = signal('');
  selectedDistrict = signal('');
  selectedClientType = signal('');
  dateFrom = signal('');
  dateTo = signal('');

  // Pagination
  currentPage = signal(1);
  pageSize = 15;

  setStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  filteredBookings = computed(() => {
    let list = [...this.bookings()];

    // Search query
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(b =>
        b.clientName.toLowerCase().includes(q) ||
        b.contactPhone.toLowerCase().includes(q) ||
        b.area.toLowerCase().includes(q) ||
        b.districtName.toLowerCase().includes(q) ||
        (b.branchHeadName && b.branchHeadName.toLowerCase().includes(q)) ||
        (b.doorDetails && b.doorDetails.doorType && b.doorDetails.doorType.toLowerCase().includes(q)) ||
        b.id.toLowerCase().includes(q)
      );
    }

    // Status tab filter
    const status = this.selectedStatus();
    if (status) {
      if (status === 'Delayed') {
        list = list.filter(b => b.isDelayed);
      } else if (status === 'Pending') {
        list = list.filter(b => b.status === 'Pending' && !b.isDelayed);
      } else {
        list = list.filter(b => b.status === status);
      }
    }

    // District
    const dist = this.selectedDistrict();
    if (dist) {
      list = list.filter(b => b.districtId === dist);
    }

    // Client Type
    const clientType = this.selectedClientType();
    if (clientType) {
      list = list.filter(b => b.clientType === clientType);
    }

    // Date range
    const dFrom = this.dateFrom();
    if (dFrom) {
      const fromTime = new Date(dFrom).getTime();
      list = list.filter(b => new Date(b.createdAt).getTime() >= fromTime);
    }
    const dTo = this.dateTo();
    if (dTo) {
      const toTime = new Date(dTo).setHours(23, 59, 59, 999);
      list = list.filter(b => new Date(b.createdAt).getTime() <= toTime);
    }

    return list;
  });

  totalPages = computed(() => Math.ceil(this.filteredBookings().length / this.pageSize));

  paginatedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredBookings().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.titleService.setTitle('SteelGuard Orders Sheet');

    const resolvedBookings = this.route.snapshot.data['bookings'];
    if (resolvedBookings && resolvedBookings.length > 0) {
      this.bookings.set(resolvedBookings);
    }
    // Fetch fresh bookings to ensure latest database updates are reflected
    this.dataService.getBookings().subscribe(b => this.bookings.set(b));

    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts) {
      this.districts = resolvedDistricts;
    } else {
      this.dataService.getDistricts().subscribe(d => this.districts = d);
    }

    const initialStatus = this.route.snapshot.queryParamMap.get('status');
    if (initialStatus) {
      this.selectedStatus.set(initialStatus);
    }
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize, this.filteredBookings().length);
  }

  formatScheduledDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  openBooking(b: Booking): void {
    this.router.navigate(['/admin/bookings', b.id]);
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
