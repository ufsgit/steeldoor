import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BookingHistoryService, BookingHistoryRecord, ActionTypeRecord } from '../../../core/services/booking-history.service';
import { DataService } from '../../../core/data.service';
import { StatusOption } from '../../../core/models';
import { DropdownComponent, DropdownOption, BookingHistoryModalComponent } from '../../../shared/components';

type DatePreset = 'today' | 'this_week' | 'this_month' | 'custom';

@Component({
  selector: 'app-admin-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DropdownComponent, BookingHistoryModalComponent],
  template: `
    <div class="w-full flex-1 flex flex-col bg-white">
      
      <!-- Top Title & Subtitle Bar -->
      <div class="w-full px-7 sm:px-10 pt-6 pb-4 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-[20px] font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <span>Booking Activity & Audit History</span>
          </h1>
          <p class="text-[13px] text-gray-500 mt-0.5">
            Live audit trail of booking creations, status updates, transfers, date changes, and notes.
          </p>
        </div>

        <!-- Date Presets Segmented Pills -->
        <div class="inline-flex items-center p-1 bg-gray-100/90 rounded-lg border border-gray-200/60 self-start sm:self-auto">
          <button
            type="button"
            (click)="setDatePreset('today')"
            class="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all cursor-pointer select-none"
            [ngClass]="datePreset() === 'today' ? 'bg-[#0f9d58] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
          >
            Today
          </button>
          <button
            type="button"
            (click)="setDatePreset('this_week')"
            class="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all cursor-pointer select-none"
            [ngClass]="datePreset() === 'this_week' ? 'bg-[#0f9d58] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
          >
            This Week
          </button>
          <button
            type="button"
            (click)="setDatePreset('this_month')"
            class="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all cursor-pointer select-none"
            [ngClass]="datePreset() === 'this_month' ? 'bg-[#0f9d58] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
          >
            This Month
          </button>
          <button
            type="button"
            (click)="setDatePreset('custom')"
            class="px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-all cursor-pointer select-none"
            [ngClass]="datePreset() === 'custom' ? 'bg-[#0f9d58] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'"
          >
            Custom Date
          </button>
        </div>
      </div>

      <!-- Action & Filter Toolbar -->
      <div class="relative z-30 w-full flex items-center justify-between gap-3 px-7 sm:px-10 py-3.5 border-b border-gray-100 bg-white flex-wrap">
        <div class="flex items-center gap-3 flex-wrap flex-1 relative z-30">
          <!-- Search Input -->
          <div class="w-full sm:w-[320px] relative shrink-0">
            <span class="absolute left-3 top-2.5 text-gray-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange()"
              placeholder="Search by booking name..."
              class="w-full h-[38px] text-[13px] pl-9 pr-3.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f9d58] font-normal transition-colors"
            />
          </div>

          <!-- Activity Action Category Dropdown (loaded dynamically from action_types table) -->
          <div class="w-[230px] shrink-0 relative z-30">
            <app-dropdown
              [options]="activityFilterOptions()"
              [ngModel]="selectedActivityValue()"
              (ngModelChange)="onActivityChange($event)"
              placeholder="Filter by Activity"
            ></app-dropdown>
          </div>

          <!-- Status Dropdown (Displayed when Activity filter is 'Status Updated' (id=2), with 'All', 'New', 'Scheduled', 'Completed', 'Cancelled') -->
          @if (isStatusUpdateSelected()) {
            <div class="w-[180px] shrink-0 relative z-40">
              <app-dropdown
                [options]="statusFilterOptions()"
                [ngModel]="selectedStatusId()"
                (ngModelChange)="onStatusChange($event)"
                [searchable]="false"
                placeholder="Filter Status"
              ></app-dropdown>
            </div>
          }

          <!-- Custom Date Range Pickers (shown when custom is selected) -->
          @if (datePreset() === 'custom') {
            <div class="flex items-center gap-1.5 shrink-0">
              <!-- From Date -->
              <div
                (click)="dateFromInput.showPicker()"
                class="relative flex items-center justify-between w-[130px] h-[38px] px-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer"
              >
                <span class="text-[13px] font-normal select-none pointer-events-none" [ngClass]="fromDate ? 'text-gray-800' : 'text-gray-400'">
                  {{ fromDate ? formatDateDisplay(fromDate) : 'dd/mm/yyyy' }}
                </span>
                <svg class="w-3.5 h-3.5 text-gray-500 pointer-events-none shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input
                  #dateFromInput
                  type="date"
                  [(ngModel)]="fromDate"
                  (change)="applyFilters()"
                  class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>

              <span class="text-gray-400 font-normal select-none px-0.5">-</span>

              <!-- To Date -->
              <div
                (click)="dateToInput.showPicker()"
                class="relative flex items-center justify-between w-[130px] h-[38px] px-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer"
              >
                <span class="text-[13px] font-normal select-none pointer-events-none" [ngClass]="toDate ? 'text-gray-800' : 'text-gray-400'">
                  {{ toDate ? formatDateDisplay(toDate) : 'dd/mm/yyyy' }}
                </span>
                <svg class="w-3.5 h-3.5 text-gray-500 pointer-events-none shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input
                  #dateToInput
                  type="date"
                  [(ngModel)]="toDate"
                  (change)="applyFilters()"
                  class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
              </div>
            </div>
          }
        </div>

        <!-- Total Count Badge -->
        <div class="text-[12px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          Total Logs: <span class="text-[#0f9d58] font-bold">{{ historyList().length }}</span>
        </div>
      </div>

      <!-- Main Activity Feed Body -->
      <div class="w-full px-7 sm:px-10 py-6">
        @if (loading()) {
          <div class="py-16 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#0f9d58] border-t-transparent"></div>
            <p class="text-xs text-gray-500 mt-2 font-medium">Loading activity audit log...</p>
          </div>
        } @else if (historyList().length === 0) {
          <div class="py-16 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-gray-800">No Activity Logs Found</h3>
            <p class="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              No matching audit logs were recorded for the selected date range or filter criteria.
            </p>
          </div>
        } @else {
          <!-- Modern Timeline Activity Cards (Clickable to open Booking History Modal) -->
          <div class="space-y-3.5">
            @for (item of historyList(); track item.history_id) {
              <div
                (click)="openBookingTimeline(item)"
                class="group bg-white rounded-xl border border-gray-200/80 hover:border-[#0f9d58]/50 hover:shadow-md transition-all p-5 sm:p-6 cursor-pointer relative overflow-hidden"
                title="Click to view full history timeline for this booking"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- Left side: Avatar + Title & Action Badges -->
                  <div class="flex items-start gap-3.5 min-w-0 flex-1">
                    <!-- Avatar Initial Badge -->
                    <div class="w-10 h-10 rounded-full bg-emerald-50 text-[#0f9d58] border border-emerald-100/60 font-bold text-[14px] flex items-center justify-center shrink-0 uppercase select-none group-hover:scale-105 transition-transform">
                      {{ (item.booking_name || 'B').charAt(0) }}
                    </div>

                    <div class="min-w-0 flex-1">
                      <!-- Booking Name (without #ID badge) -->
                      <div class="flex items-center gap-2 flex-wrap min-w-0">
                        <span
                          class="text-[14px] font-bold text-gray-900 group-hover:text-[#0f9d58] transition-colors truncate max-w-[320px] sm:max-w-[480px] md:max-w-[600px]"
                          [title]="item.booking_name || 'Booking'"
                        >
                          {{ item.booking_name || 'Booking' }}
                        </span>
                        <!-- Visual indicator that row is clickable -->
                        <span class="text-[11px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium hidden sm:inline-flex items-center gap-1 shrink-0">
                          <span>View timeline</span>
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>

                      <!-- Subtitle: Status / Action Pill + Action Performed By -->
                      <div class="flex items-center gap-2 mt-1 flex-wrap text-[12px]">
                        <span
                          class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide shrink-0"
                          [style.backgroundColor]="getActionBadgeBg(item)"
                          [style.color]="getActionBadgeColor(item)"
                        >
                          {{ getActionBadgeLabel(item) }}
                        </span>

                        @if (item.action_by_name) {
                          <span class="text-gray-500 text-[12px] flex items-center gap-1 truncate max-w-[240px]" [title]="item.action_by_name">
                            <span>by</span>
                            <span class="font-semibold text-gray-700 truncate">{{ item.action_by_name }}</span>
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Right side: Timestamp -->
                  <div class="text-right shrink-0">
                    <div class="text-[12px] font-semibold text-gray-800">
                      {{ item.created_at | date:'dd/MM/yyyy' }}
                    </div>
                    <div class="text-[11px] text-gray-400 font-medium mt-0.5">
                      {{ item.created_at | date:'hh:mm a' }}
                    </div>
                  </div>
                </div>

                <!-- Dynamic Detail Container based on Action Type -->
                <div class="mt-3.5 pt-3 border-t border-gray-100 text-[12px] min-w-0">
                  
                  <!-- 1. New Booking Created -->
                  @if (isNewBooking(item.action_type)) {
                    <div class="flex items-center gap-4 flex-wrap text-gray-600 bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 break-words">
                      @if (item.to_branch_head_name) {
                        <div class="flex items-center gap-1.5">
                          <span class="text-gray-400">Assigned Branch Head:</span>
                          <span class="font-semibold text-gray-800">{{ item.to_branch_head_name }}</span>
                          @if (item.to_assigned_head_district_name) {
                            <span class="text-gray-400 font-normal">({{ item.to_assigned_head_district_name }})</span>
                          }
                        </div>
                      }
                      @if (item.customer_note) {
                        <div class="flex items-center gap-1.5 break-words max-h-24 overflow-y-auto">
                          <span class="text-gray-400 shrink-0">Initial Note:</span>
                          <span class="font-medium text-gray-700 italic break-words">"{{ item.customer_note }}"</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- 2. Status Updated -->
                  @else if (isStatusUpdated(item.action_type)) {
                    <div class="flex flex-col gap-2 bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 break-words">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-gray-400 font-medium">Transition:</span>
                        <span
                          class="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                          [style.backgroundColor]="item.old_status_color_code ? item.old_status_color_code + '1A' : '#f1f5f9'"
                          [style.color]="item.old_status_color_code || '#64748b'"
                        >
                          {{ item.old_status_label || item.old_status_code || 'Initial' }}
                        </span>
                        <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                        <span
                          class="px-2.5 py-0.5 rounded text-[11px] font-semibold"
                          [style.backgroundColor]="item.new_status_color_code ? item.new_status_color_code + '1A' : '#f1f5f9'"
                          [style.color]="item.new_status_color_code || '#64748b'"
                        >
                          {{ item.new_status_label || item.new_status_code }}
                        </span>
                      </div>
                      @if (item.new_schedule_date) {
                        <div class="flex items-center gap-1.5 text-gray-600">
                          <span class="text-gray-400">Scheduled Date:</span>
                          <span class="font-semibold text-gray-800">{{ item.new_schedule_date | date:'dd-MM-yyyy' }}</span>
                        </div>
                      }
                      @if (item.staff_note) {
                        <div class="flex items-start gap-1.5 text-gray-600 break-words max-h-24 overflow-y-auto">
                          <span class="text-gray-400 shrink-0">Staff Note:</span>
                          <span class="font-medium text-gray-700 italic break-words">"{{ item.staff_note }}"</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- 3. Transfered -->
                  @else if (isTransfered(item.action_type)) {
                    <div class="flex flex-col gap-1.5 bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 break-words">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-gray-400 font-medium">Reassigned:</span>
                        <span class="font-semibold text-gray-800">
                          {{ item.from_branch_head_name }}
                          @if (item.from_assigned_head_district_name) {
                            <span class="text-gray-400 font-normal">({{ item.from_assigned_head_district_name }})</span>
                          }
                        </span>
                        <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                        <span class="font-bold text-[#0f9d58]">
                          {{ item.to_branch_head_name }}
                          @if (item.to_assigned_head_district_name) {
                            <span class="text-gray-400 font-normal">({{ item.to_assigned_head_district_name }})</span>
                          }
                        </span>
                      </div>
                      @if (item.staff_note) {
                        <div class="flex items-start gap-1.5 text-gray-600 mt-0.5 break-words max-h-24 overflow-y-auto">
                          <span class="text-gray-400 shrink-0">Reason / Staff Note:</span>
                          <span class="font-medium text-gray-700 italic break-words">"{{ item.staff_note }}"</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- 4. Scheduled Date Changed -->
                  @else if (isDateChanged(item.action_type)) {
                    <div class="flex items-center gap-2 bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 break-words">
                      <span class="text-gray-400 shrink-0">Scheduled Date Changed:</span>
                      @if (item.old_schedule_date && item.new_schedule_date) {
                        <span class="line-through text-gray-400 font-semibold">{{ item.old_schedule_date | date:'dd-MM-yyyy' }}</span>
                        <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                        <span class="font-bold text-[#7c3aed]">{{ item.new_schedule_date | date:'dd-MM-yyyy' }}</span>
                      } @else {
                        <span class="font-medium text-gray-700">{{ item.action_type }}</span>
                      }
                    </div>
                  }

                  <!-- 5. Customer Name Updated -->
                  @else if (isNameUpdated(item.action_type)) {
                    <div class="bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 text-gray-700 break-words max-h-24 overflow-y-auto">
                      <span class="font-medium">{{ item.action_type }}</span>
                    </div>
                  }

                  <!-- 6. Customer Notes Updated -->
                  @else if (isNoteUpdated(item.action_type)) {
                    <div class="flex items-start gap-1.5 bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 text-gray-700 break-words max-h-24 overflow-y-auto">
                      <span class="text-gray-400 shrink-0">Customer Note:</span>
                      <span class="font-medium text-gray-800 italic break-words">"{{ item.customer_note }}"</span>
                    </div>
                  }

                  <!-- Fallback -->
                  @else {
                    <div class="bg-gray-50/80 rounded-lg px-3.5 py-2.5 border border-gray-100 text-gray-700 break-words max-h-24 overflow-y-auto">
                      {{ item.customer_note || item.staff_note || item.action_type }}
                    </div>
                  }

                </div>
              </div>
            }
          </div>

          <!-- Bottom Pagination Controls (Matching Google Sheet clean style) -->
          <div class="flex items-center justify-between gap-4 pt-6 border-t border-gray-200 mt-6 text-[13px] select-none">
            <div class="text-gray-500 font-medium">
              Showing <span class="font-bold text-gray-900">{{ historyList().length }}</span> logs on page {{ page() }}
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                [disabled]="page() <= 1 || loading()"
                (click)="prevPage()"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
              >
                ← Previous
              </button>
              
              <span class="px-2 font-bold text-gray-900 min-w-[20px] text-center">{{ page() }}</span>

              <button
                type="button"
                [disabled]="historyList().length < limit() || loading()"
                (click)="nextPage()"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Reusable Booking History Modal Component -->
      <app-booking-history-modal
        [isOpen]="isModalOpen()"
        [bookingId]="selectedBookingId()"
        [bookingName]="selectedBookingName()"
        (closeModal)="closeBookingTimeline()"
      ></app-booking-history-modal>

    </div>
  `
})
export class AdminHistoryComponent implements OnInit {
  private historyService = inject(BookingHistoryService);
  private dataService = inject(DataService);
  private title = inject(Title);

  historyList = signal<BookingHistoryRecord[]>([]);
  loading = signal<boolean>(false);

  // Modal signals for clicking a row
  isModalOpen = signal<boolean>(false);
  selectedBookingId = signal<number | null>(null);
  selectedBookingName = signal<string | null>(null);

  datePreset = signal<DatePreset>('today');
  fromDate: string = '';
  toDate: string = '';
  searchTerm: string = '';

  // Dynamic Activity Action Types from action_types table
  actionTypesList = signal<ActionTypeRecord[]>([]);
  activityFilterOptions = signal<DropdownOption[]>([
    { label: 'All Activities', value: 0 },
    { label: 'New Booking Created', value: 1 },
    { label: 'Status Updated', value: 2 },
    { label: 'Transfered', value: 3 },
    { label: 'Scheduled Date Changed', value: 4 },
    { label: 'Customer Name Updated', value: 5 },
    { label: 'Customer Notes Updated', value: 6 }
  ]);
  selectedActivityValue = signal<number>(0);

  // Status Filter Options for Status Updated activity (All, New, Scheduled, Completed, Cancelled)
  statusFilterOptions = signal<DropdownOption[]>([
    { label: 'All', value: 0 },
    { label: 'New', value: 1 },
    { label: 'Scheduled', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Cancelled', value: 4 }
  ]);
  selectedStatusId = signal<number>(0);

  page = signal<number>(1);
  limit = signal<number>(20);

  // Checks whether selected activity is 'Status Updated' (id 2 or code/name)
  isStatusUpdateSelected = computed(() => {
    const val = Number(this.selectedActivityValue());
    if (val === 2) return true;
    if (!val || val === 0) return false;
    const match = this.actionTypesList().find(t => Number(t.id) === val);
    if (!match) return false;
    const code = (match.code || '').toUpperCase();
    const name = (match.name || '').toLowerCase();
    return code === 'STATUS_UPDATED' || name === 'status updated' || name.includes('status');
  });

  private searchDebounceTimer: any;

  ngOnInit(): void {
    this.title.setTitle('Booking Activity History | SteelGuard');
    this.loadActionTypes();
    this.loadStatusOptions();
    this.setDatePreset('today');
  }

  loadActionTypes(): void {
    this.historyService.getActionTypes().subscribe({
      next: (res) => {
        const types = res?.data || [];
        this.actionTypesList.set(types);
        const options: DropdownOption[] = [
          { label: 'All Activities', value: 0 },
          ...types.map(t => ({
            label: t.name,
            value: Number(t.id)
          }))
        ];
        this.activityFilterOptions.set(options);
      },
      error: (err) => {
        console.error('Failed to load dynamic action types:', err);
      }
    });
  }

  loadStatusOptions(): void {
    this.dataService.getStatusOptions().subscribe({
      next: (statuses: any) => {
        const list: StatusOption[] = Array.isArray(statuses)
          ? statuses
          : (Array.isArray(statuses?.data) ? statuses.data : []);
        if (list && list.length > 0) {
          const options: DropdownOption[] = [
            { label: 'All', value: 0 },
            ...list.map(s => ({
              label: s.label || s.code,
              value: Number(s.id)
            }))
          ];
          this.statusFilterOptions.set(options);
        }
      },
      error: (err) => {
        console.error('Failed to load status options from /api/status:', err);
      }
    });
  }

  onActivityChange(val: any): void {
    const num = Number(val) || 0;
    this.selectedActivityValue.set(num);
    if (this.isStatusUpdateSelected()) {
      // Whenever Status Updated is clicked/selected, call http://localhost:5000/api/status
      this.selectedStatusId.set(0);
      this.loadStatusOptions();
    } else {
      this.selectedStatusId.set(0);
    }
    this.applyFilters();
  }

  onStatusChange(val: any): void {
    const num = Number(val) || 0;
    this.selectedStatusId.set(num);
    this.applyFilters();
  }

  setDatePreset(preset: DatePreset) {
    this.datePreset.set(preset);
    const now = new Date();

    if (preset === 'today') {
      const todayStr = this.formatDate(now);
      this.fromDate = todayStr;
      this.toDate = todayStr;
    } else if (preset === 'this_week') {
      const firstDay = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      firstDay.setDate(diff);
      this.fromDate = this.formatDate(firstDay);
      this.toDate = this.formatDate(now);
    } else if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      this.fromDate = this.formatDate(firstDay);
      this.toDate = this.formatDate(now);
    } else if (preset === 'custom') {
      if (!this.fromDate) {
        this.fromDate = this.formatDate(now);
        this.toDate = this.formatDate(now);
      }
    }

    this.page.set(1);
    this.loadHistory();
  }

  onSearchChange() {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page.set(1);
      this.loadHistory();
    }, 350);
  }

  applyFilters() {
    this.page.set(1);
    this.loadHistory();
  }

  loadHistory() {
    this.loading.set(true);

    let actId = Number(this.selectedActivityValue()) || 0;
    const isStatus = this.isStatusUpdateSelected();
    const stId = isStatus ? (Number(this.selectedStatusId()) || 0) : 0;

    let statusIdParam = 0;
    if (isStatus) {
      if (stId > 0) {
        actId = 2; // Status Updated
        statusIdParam = stId; // 1: New, 2: Scheduled, 3: Completed, 4: Cancelled
      } else {
        // When 'All' (stId === 0) is selected in Status Updated dropdown:
        // As requested: "in the status update all dropdown show all datas as same as in the all activities page"
        actId = 0;
        statusIdParam = 0;
      }
    }

    this.historyService.getBookingHistory({
      search: this.searchTerm,
      actionTypeId: actId,
      statusId: statusIdParam,
      fromDate: this.fromDate,
      toDate: this.toDate,
      page: this.page(),
      limit: this.limit()
    }).subscribe({
      next: (res) => {
        let history = res?.data?.history || [];

        // If a specific status id is selected (1: New, 2: Scheduled, 3: Completed, 4: Cancelled), filter by new_status_id
        if (isStatus && stId > 0) {
          history = history.filter(item => Number(item.new_status_id) === stId);
        }

        this.historyList.set(history);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load history:', err);
        this.historyList.set([]);
        this.loading.set(false);
      }
    });
  }

  // --- Row Click to Open Booking History Modal ---
  openBookingTimeline(item: BookingHistoryRecord) {
    this.selectedBookingId.set(item.booking_id);
    this.selectedBookingName.set(item.booking_name);
    this.isModalOpen.set(true);
  }

  closeBookingTimeline() {
    this.isModalOpen.set(false);
    this.selectedBookingId.set(null);
    this.selectedBookingName.set(null);
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(p => p - 1);
      this.loadHistory();
    }
  }

  nextPage() {
    this.page.update(p => p + 1);
    this.loadHistory();
  }

  // --- Action Type Detectors ---
  isNewBooking(action: string): boolean {
    return action === 'New Booking Created';
  }

  isStatusUpdated(action: string): boolean {
    return action === 'Status Updated';
  }

  isTransfered(action: string): boolean {
    return action === 'Transfered';
  }

  isDateChanged(action: string): boolean {
    return action.startsWith('Scheduled Date Changed');
  }

  isNameUpdated(action: string): boolean {
    return action.startsWith('Customer Name Updated');
  }

  isNoteUpdated(action: string): boolean {
    return action === 'Customer Notes Updated';
  }

  // --- Badge styling ---
  getActionBadgeLabel(item: BookingHistoryRecord): string {
    if (this.isNewBooking(item.action_type)) return item.new_status_label || 'New Booking';
    if (this.isStatusUpdated(item.action_type)) return item.new_status_label || 'Status Updated';
    if (this.isTransfered(item.action_type)) return 'Transferred';
    if (this.isDateChanged(item.action_type)) return 'Rescheduled';
    if (this.isNameUpdated(item.action_type)) return 'Name Changed';
    if (this.isNoteUpdated(item.action_type)) return 'Note Added';
    return item.action_type;
  }

  getActionBadgeBg(item: BookingHistoryRecord): string {
    if (item.new_status_color_code) return item.new_status_color_code + '1A';
    if (this.isTransfered(item.action_type)) return '#fffbeb';
    if (this.isDateChanged(item.action_type)) return '#f5f3ff';
    if (this.isNameUpdated(item.action_type)) return '#f0f9ff';
    if (this.isNoteUpdated(item.action_type)) return '#f8fafc';
    return '#f8fafc';
  }

  getActionBadgeColor(item: BookingHistoryRecord): string {
    if (item.new_status_color_code) return item.new_status_color_code;
    if (this.isTransfered(item.action_type)) return '#b45309';
    if (this.isDateChanged(item.action_type)) return '#7c3aed';
    if (this.isNameUpdated(item.action_type)) return '#0284c7';
    if (this.isNoteUpdated(item.action_type)) return '#475569';
    return '#334155';
  }

  formatDateDisplay(dateStr: string): string {
    if (!dateStr) return 'dd/mm/yyyy';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}