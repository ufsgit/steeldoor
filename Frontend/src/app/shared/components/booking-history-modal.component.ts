import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingHistoryService, BookingHistoryRecord } from '../../core/services/booking-history.service';

@Component({
  selector: 'app-booking-history-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity"
        (click)="close()"
      ></div>

      <!-- Modal Dialog -->
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
        <div
          class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-emerald-50 text-[#0f9d58] border border-emerald-100 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                {{ (bookingName || 'B').charAt(0) }}
              </div>
              <div>
                <h3 class="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span>{{ bookingName || 'Booking' }}</span>
                  <span class="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    #{{ bookingId }}
                  </span>
                </h3>
                <p class="text-[12px] text-gray-500 mt-0.5">
                  Complete activity audit timeline for this order
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              (click)="close()"
              class="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body (Scrollable Timeline with Infinite Scroll) -->
          <div
            #scrollContainer
            (scroll)="onScroll(scrollContainer)"
            class="px-6 py-5 overflow-y-auto flex-1 bg-gray-50/40 relative"
          >
            <!-- Initial First Page Loader -->
            @if (loading() && timeline().length === 0) {
              <div class="py-16 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#0f9d58] border-t-transparent"></div>
                <p class="text-xs text-gray-500 mt-3 font-semibold">Loading booking timeline...</p>
              </div>
            } @else if (errorMsg()) {
              <div class="py-10 text-center">
                <p class="text-xs text-red-500">{{ errorMsg() }}</p>
              </div>
            } @else if (timeline().length === 0) {
              <div class="py-14 text-center">
                <div class="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2.5">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-xs font-bold text-gray-700">No History Recorded Yet</p>
                <p class="text-[11px] text-gray-400 mt-0.5">Events and status changes will appear here as they occur.</p>
              </div>
            } @else {
              <!-- Timeline vertical line container -->
              <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                @for (item of timeline(); track item.history_id) {
                  <div class="relative group">
                    <!-- Dot marker on timeline line -->
                    <div
                      class="absolute -left-[19px] top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs"
                      [style.backgroundColor]="getItemDotColor(item)"
                    ></div>

                    <!-- Event Card -->
                    <div class="bg-white rounded-xl border border-gray-200/90 p-4 shadow-2xs hover:border-gray-300 transition-all">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <!-- Action Pill & Performed By -->
                          <div class="flex items-center gap-2 flex-wrap">
                            <span
                              class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                              [style.backgroundColor]="getActionBadgeBg(item)"
                              [style.color]="getActionBadgeColor(item)"
                            >
                              {{ getActionBadgeLabel(item) }}
                            </span>

                            @if (item.action_by_name) {
                              <span class="text-gray-500 text-[11px]">
                                by <span class="font-semibold text-gray-800">{{ item.action_by_name }}</span>
                              </span>
                            }
                          </div>
                        </div>

                        <!-- Date & Time -->
                        <div class="text-right shrink-0">
                          <span class="text-[11px] font-bold text-gray-800">
                            {{ item.created_at | date:'dd/MM/yyyy' }}
                          </span>
                          <span class="text-[10px] text-gray-400 ml-1.5 font-medium">
                            {{ item.created_at | date:'hh:mm a' }}
                          </span>
                        </div>
                      </div>

                      <!-- Context-Aware Details per Action -->
                      <div class="mt-3 pt-2.5 border-t border-gray-100 text-[12px]">
                        
                        <!-- 1. New Booking Created -->
                        @if (isNewBooking(item.action_type)) {
                          <div class="flex flex-col gap-1 text-[11px] text-gray-600 bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
                            @if (item.to_branch_head_name) {
                              <div>
                                <span class="text-gray-400">Assigned Branch Head:</span>
                                <span class="font-semibold text-gray-800 ml-1">{{ item.to_branch_head_name }}</span>
                                @if (item.to_assigned_head_district_name) {
                                  <span class="text-gray-400">({{ item.to_assigned_head_district_name }})</span>
                                }
                              </div>
                            }
                            @if (item.customer_note) {
                              <div>
                                <span class="text-gray-400">Initial Customer Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.customer_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 2. Status Updated -->
                        @else if (isStatusUpdated(item.action_type)) {
                          <div class="flex flex-col gap-1.5 text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
                            <div class="flex items-center gap-2 flex-wrap">
                              <span class="text-gray-400 font-medium">Status Changed:</span>
                              <span
                                class="px-2 py-0.5 rounded text-[10px] font-semibold"
                                [style.backgroundColor]="item.old_status_color_code ? item.old_status_color_code + '1A' : '#f1f5f9'"
                                [style.color]="item.old_status_color_code || '#64748b'"
                              >
                                {{ item.old_status_label || item.old_status_code || 'Initial' }}
                              </span>
                              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                              </svg>
                              <span
                                class="px-2 py-0.5 rounded text-[10px] font-semibold"
                                [style.backgroundColor]="item.new_status_color_code ? item.new_status_color_code + '1A' : '#f1f5f9'"
                                [style.color]="item.new_status_color_code || '#64748b'"
                              >
                                {{ item.new_status_label || item.new_status_code }}
                              </span>
                            </div>
                            @if (item.new_schedule_date) {
                              <div class="text-gray-600">
                                <span class="text-gray-400">Scheduled Date:</span>
                                <span class="font-semibold text-gray-800 ml-1">{{ item.new_schedule_date | date:'dd-MM-yyyy' }}</span>
                              </div>
                            }
                            @if (item.staff_note) {
                              <div class="text-gray-600">
                                <span class="text-gray-400">Staff Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.staff_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 3. Transfered -->
                        @else if (isTransfered(item.action_type)) {
                          <div class="flex flex-col gap-1 text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span class="text-gray-400">Reassigned:</span>
                              <span class="font-semibold text-gray-800">
                                {{ item.from_branch_head_name }}
                                @if (item.from_assigned_head_district_name) {
                                  <span class="text-gray-400">({{ item.from_assigned_head_district_name }})</span>
                                }
                              </span>
                              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                              </svg>
                              <span class="font-bold text-[#0f9d58]">
                                {{ item.to_branch_head_name }}
                                @if (item.to_assigned_head_district_name) {
                                  <span class="text-gray-400">({{ item.to_assigned_head_district_name }})</span>
                                }
                              </span>
                            </div>
                            @if (item.staff_note) {
                              <div class="text-gray-600">
                                <span class="text-gray-400">Staff Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.staff_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 4. Scheduled Date Changed -->
                        @else if (isDateChanged(item.action_type)) {
                          <div class="flex items-center gap-2 text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100">
                            <span class="text-gray-400">Date Rescheduled:</span>
                            @if (item.old_schedule_date && item.new_schedule_date) {
                              <span class="line-through text-gray-400 font-semibold">{{ item.old_schedule_date | date:'dd-MM-yyyy' }}</span>
                              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                              </svg>
                              <span class="font-bold text-[#7c3aed]">{{ item.new_schedule_date | date:'dd-MM-yyyy' }}</span>
                            } @else {
                              <span class="font-medium text-gray-800">{{ item.action_type }}</span>
                            }
                          </div>
                        }

                        <!-- 5. Customer Name Updated -->
                        @else if (isNameUpdated(item.action_type)) {
                          <div class="text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 text-gray-800 font-medium">
                            {{ item.action_type }}
                          </div>
                        }

                        <!-- 6. Customer Notes Updated -->
                        @else if (isNoteUpdated(item.action_type)) {
                          <div class="flex items-center gap-1.5 text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 text-gray-700">
                            <span class="text-gray-400">Note:</span>
                            <span class="font-medium text-gray-800 italic">"{{ item.customer_note }}"</span>
                          </div>
                        }

                        <!-- Fallback -->
                        @else {
                          <div class="text-[11px] bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 text-gray-700">
                            {{ item.customer_note || item.staff_note || item.action_type }}
                          </div>
                        }

                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Next Page Waiting Loading Spinner -->
              @if (loadingMore()) {
                <div class="py-5 flex items-center justify-center gap-2.5 bg-white/70 rounded-xl border border-gray-200/60 my-3 shadow-2xs animate-fadeIn">
                  <div class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#0f9d58] border-t-transparent"></div>
                  <span class="text-[12px] font-semibold text-gray-600">Loading next events...</span>
                </div>
              }

              <!-- End of History notice -->
              @if (!hasMore() && timeline().length > 0 && !loadingMore()) {
                <div class="text-center py-4 text-[11px] text-gray-400 font-medium select-none">
                  • Beginning of booking history •
                </div>
              }
            }
          </div>

          <!-- Footer -->
          <div class="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between shrink-0 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-gray-500 font-medium">
                Loaded: <span class="font-bold text-gray-900">{{ timeline().length }}</span> events
              </span>
              @if (loadingMore()) {
                <span class="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-[#0f9d58] border-t-transparent"></span>
              }
            </div>
            <button
              type="button"
              (click)="close()"
              class="px-4 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class BookingHistoryModalComponent implements OnChanges {
  private historyService = inject(BookingHistoryService);

  @Input() isOpen = false;
  @Input() bookingId: number | null = null;
  @Input() bookingName: string | null = null;
  @Output() closeModal = new EventEmitter<void>();

  timeline = signal<BookingHistoryRecord[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  page = 1;
  readonly limit = 10;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] && this.isOpen && this.bookingId) || 
        (changes['bookingId'] && this.isOpen && this.bookingId)) {
      this.resetAndLoad();
    }
  }

  resetAndLoad() {
    this.page = 1;
    this.hasMore.set(true);
    this.timeline.set([]);
    this.loadFirstPage();
  }

  loadFirstPage() {
    if (!this.bookingId) return;

    this.loading.set(true);
    this.errorMsg.set(null);

    this.historyService.getHistoryByBookingId(this.bookingId, this.page, this.limit).subscribe({
      next: (res) => {
        const rows = res?.data?.history || [];
        if (rows.length < this.limit) {
          this.hasMore.set(false);
        } else {
          this.page++;
        }

        this.timeline.set(rows);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching booking history timeline:', err);
        this.errorMsg.set('Unable to load history for this booking.');
        this.loading.set(false);
      }
    });
  }

  loadNextPage() {
    if (!this.bookingId || this.loading() || this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);

    this.historyService.getHistoryByBookingId(this.bookingId, this.page, this.limit).subscribe({
      next: (res) => {
        const rows = res?.data?.history || [];
        if (rows.length < this.limit) {
          this.hasMore.set(false);
        } else {
          this.page++;
        }

        this.timeline.update(existing => [...existing, ...rows]);
        this.loadingMore.set(false);
      },
      error: (err) => {
        console.error('Error fetching next page booking history:', err);
        this.loadingMore.set(false);
      }
    });
  }

  onScroll(element: HTMLElement) {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

    // Detect when scrolled close to bottom (within 80px)
    const threshold = 80;
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (position > height - threshold) {
      this.loadNextPage();
    }
  }

  close() {
    this.closeModal.emit();
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

  // --- Badge & Dot Styling ---
  getItemDotColor(item: BookingHistoryRecord): string {
    if (item.new_status_color_code) return item.new_status_color_code;
    if (this.isTransfered(item.action_type)) return '#f59e0b';
    if (this.isDateChanged(item.action_type)) return '#7c3aed';
    if (this.isNameUpdated(item.action_type)) return '#0284c7';
    return '#10b981';
  }

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
    return '#f8fafc';
  }

  getActionBadgeColor(item: BookingHistoryRecord): string {
    if (item.new_status_color_code) return item.new_status_color_code;
    if (this.isTransfered(item.action_type)) return '#b45309';
    if (this.isDateChanged(item.action_type)) return '#7c3aed';
    if (this.isNameUpdated(item.action_type)) return '#0284c7';
    return '#475569';
  }
}
