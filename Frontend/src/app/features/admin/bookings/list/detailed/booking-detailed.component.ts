import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, signal, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../../core/data.service';
import { BookingHistoryService, BookingHistoryRecord } from '../../../../../core/services/booking-history.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { Booking } from '../../../../../core/models';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-booking-detailed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal Backdrop overlay -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 lg:p-8 overscroll-contain animate-fadeIn"
      (click)="close.emit()"
    >
      <!-- Centered Modal Dialog (3 Column Wide Layout) -->
      <div
        class="w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 overscroll-contain"
        (click)="$event.stopPropagation()"
      >
        <!-- Top Drawer Header Bar -->
        <div class="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between gap-4 shrink-0">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-8 h-8 rounded-lg bg-[#e6f4ea] text-[#0f9d58] flex items-center justify-center font-bold text-sm shrink-0">
              #
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 min-w-0">
                <h2
                  class="text-base font-bold text-gray-900 tracking-tight truncate max-w-[320px] sm:max-w-[480px] md:max-w-[560px]"
                  [title]="booking.clientName || 'Booking Details'"
                >
                  {{ booking.clientName || 'Booking Details' }}
                </h2>
              </div>
              <div class="flex items-center gap-2.5 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                <span class="flex items-center gap-1">
                  <span>Created by:</span>
                  <strong class="text-gray-800 font-semibold">{{ booking.loginName || booking.createdByName || $any(booking).login_name || 'System' }}</strong>
                </span>
                <span class="text-gray-300">•</span>
                <span class="flex items-center gap-1 text-gray-500">
                  <span>Created at:</span>
                  <span class="text-gray-700 font-medium">{{ formatCreatedDateTime(booking.createdAt || $any(booking).created_at) }}</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Header Action Buttons -->
          <div class="flex items-center gap-2">
            @if (onEdit.observed) {
              <button
                type="button"
                (click)="onEdit.emit(booking)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0f9d58] text-white hover:bg-[#0c8248] shadow-2xs transition-colors cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Booking</span>
              </button>
            }

            @if (onDelete.observed) {
              <button
                type="button"
                (click)="onDelete.emit(booking)"
                class="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200/60 shadow-2xs transition-colors cursor-pointer"
                title="Delete Booking"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            }

            <button
              type="button"
              (click)="close.emit()"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close drawer"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 3-Column Content Body -->
        <div class="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200 overflow-hidden bg-white">
          
          <!-- ================= COLUMN 1: CONTACT & BOOKING DETAILS ================= -->
          <div class="flex flex-col h-full overflow-y-auto p-5 space-y-5 bg-[#fafafa]/50">
            <div class="flex items-center gap-2 pb-2 border-b border-gray-200">
              <svg class="w-4 h-4 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700">Contact & Booking Details</h3>
            </div>

            <!-- Details List -->
            <div class="space-y-3.5 text-xs">
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Phone</span>
                <span class="font-medium text-gray-900 text-sm">{{ booking.contactPhone || booking.mobile || '-' }}</span>
              </div>

              <!-- <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</span>
                <span class="font-medium text-gray-800 break-all">{{ booking.contactEmail || '-' }}</span>
              </div> -->

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Full Address</span>
                <p class="font-medium text-gray-800 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200 break-words max-h-28 overflow-y-auto">
                  {{ booking.address || '-' }}
                </p>
              </div>

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">District & Hub</span>
                <span class="font-medium text-gray-800 break-words">{{ booking.area ? (booking.area + ', ') : '' }}{{ booking.districtName }} Hub</span>
              </div>

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Assigned Head</span>
                <span class="font-medium text-gray-800 break-words">{{ booking.branchHeadName || 'Unassigned' }}</span>
              </div>

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Scheduled Date</span>
                @if (booking.scheduledDate) {
                  <span class="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-block">
                    {{ formatScheduledDate(booking.scheduledDate) }}
                  </span>
                } @else {
                  <span class="text-gray-400 italic font-medium">Pending</span>
                }
              </div>

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Current Status</span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#e6f4ea] text-[#137333]">
                  <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
                  <span>{{ booking.status || 'NEW' }}</span>
                </span>
              </div>

              @if (booking.notes) {
                <div>
                  <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Customer Notes</span>
                  <p class="text-xs text-gray-700 bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-lg leading-relaxed break-words max-h-28 overflow-y-auto">
                    {{ booking.notes }}
                  </p>
                </div>
              }
            </div>

            <!-- Quick Status Change Bar -->
            <div class="pt-3 border-t border-gray-200 space-y-2">
              <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Update Status</span>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  (click)="onStatusChange.emit('New')"
                  class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer text-center"
                  [class.ring-2]="booking.status.toLowerCase() === 'new'"
                  [class.ring-gray-400]="booking.status.toLowerCase() === 'new'"
                >
                  New
                </button>
                <button
                  type="button"
                  (click)="onStatusChange.emit('Scheduled')"
                  class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] transition-colors cursor-pointer text-center"
                  [class.ring-2]="booking.status.toLowerCase() === 'scheduled'"
                  [class.ring-[#1967d2]]="booking.status.toLowerCase() === 'scheduled'"
                >
                  Scheduled
                </button>
                <button
                  type="button"
                  (click)="onStatusChange.emit('Completed')"
                  class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e6f4ea] text-[#0f9d58] hover:bg-[#c9eed1] transition-colors cursor-pointer text-center"
                  [class.ring-2]="booking.status.toLowerCase() === 'completed' || booking.status.toLowerCase() === 'finished'"
                  [class.ring-[#0f9d58]]="booking.status.toLowerCase() === 'completed' || booking.status.toLowerCase() === 'finished'"
                >
                  Completed
                </button>
                <button
                  type="button"
                  (click)="onStatusChange.emit('Cancelled')"
                  class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#fce8e6] text-[#c5221f] hover:bg-[#fbd1cf] transition-colors cursor-pointer text-center"
                  [class.ring-2]="booking.status.toLowerCase() === 'cancelled' || booking.status.toLowerCase() === 'rejected'"
                  [class.ring-[#c5221f]]="booking.status.toLowerCase() === 'cancelled' || booking.status.toLowerCase() === 'rejected'"
                >
                  Cancelled
                </button>
              </div>
            </div>
          </div>

          <!-- ================= COLUMN 2: BOOKING HISTORY (INFINITE SCROLL) ================= -->
          <div
            #historyContainer
            (scroll)="onHistoryScroll($event)"
            class="flex flex-col h-full overflow-y-auto p-5 space-y-4 bg-white"
          >
            <!-- Column Header -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-200 shrink-0">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700">Booking History</h3>
              </div>
            </div>

            <!-- Initial Loading Spinner -->
            @if (isLoadingHistory()) {
              <div class="flex flex-col items-center justify-center py-12 space-y-2 text-gray-400">
                <svg class="animate-spin h-6 w-6 text-[#0f9d58]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span class="text-xs">Loading history audit...</span>
              </div>
            } @else if (timeline().length === 0) {
              <!-- Empty State -->
              <div class="p-6 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-xs">
                No status history or activity logged for this booking yet.
              </div>
            } @else {
              <!-- History Timeline List -->
              <div class="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200">
                @for (item of timeline(); track (item.history_id || $index)) {
                  <div class="relative flex items-start gap-3 text-xs pl-1">
                    <!-- Dot Marker -->
                    <div
                      class="w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-2xs"
                      [style.borderColor]="getItemDotColor(item)"
                    >
                      <div class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="getItemDotColor(item)"></div>
                    </div>

                    <!-- Item Content Card -->
                    <div class="flex-1 min-w-0 bg-white hover:bg-gray-50/50 border border-gray-200/90 rounded-xl p-3 space-y-2 transition-all shadow-2xs overflow-hidden">
                      
                      <!-- Top Line: Action Badge + Performed By + Date & Time -->
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                          <span
                            class="px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                            [style.backgroundColor]="getActionBadgeBg(item)"
                            [style.color]="getActionBadgeColor(item)"
                          >
                            {{ getActionBadgeLabel(item) }}
                          </span>

                          <span class="text-gray-500 text-[11px] truncate max-w-[170px]" [title]="item.action_by_name || 'System'">
                            by <strong class="text-gray-800 font-semibold">{{ item.action_by_name || 'System' }}</strong>
                          </span>
                        </div>

                        <!-- Date & Time -->
                        <div class="text-right shrink-0 text-[10px] text-gray-400">
                          <span class="font-bold text-gray-700 block">{{ item.created_at | date:'dd/MM/yyyy' }}</span>
                          <span class="font-medium block">{{ item.created_at | date:'hh:mm a' }}</span>
                        </div>
                      </div>

                      <!-- Contextual Details Body -->
                      <div class="text-[11px] pt-1.5 border-t border-gray-100 min-w-0">
                        
                        <!-- 1. New Booking Created -->
                        @if (isNewBooking(item.action_type)) {
                          <div class="flex flex-col gap-1 bg-gray-50/80 rounded-lg p-2 border border-gray-100 text-gray-600 break-words">
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
                              <div class="max-h-24 overflow-y-auto break-words">
                                <span class="text-gray-400">Initial Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.customer_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 2. Status Updated -->
                        @else if (isStatusUpdated(item.action_type)) {
                          <div class="flex flex-col gap-1.5 bg-gray-50/80 rounded-lg p-2 border border-gray-100 break-words">
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <span class="text-gray-400 font-medium">Status:</span>
                              <span
                                class="px-2 py-0.5 rounded text-[10px] font-semibold"
                                [style.backgroundColor]="item.old_status_color_code ? item.old_status_color_code + '1A' : '#f1f5f9'"
                                [style.color]="item.old_status_color_code || '#64748b'"
                              >
                                {{ item.old_status_label || item.old_status_code || 'Initial' }}
                              </span>
                              <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                              <div class="text-gray-600 max-h-24 overflow-y-auto break-words">
                                <span class="text-gray-400">Staff Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.staff_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 3. Transfered -->
                        @else if (isTransfered(item.action_type)) {
                          <div class="flex flex-col gap-1 bg-gray-50/80 rounded-lg p-2 border border-gray-100 break-words">
                            <div class="flex items-center gap-1 flex-wrap">
                              <span class="text-gray-400">Reassigned:</span>
                              <span class="font-semibold text-gray-800">
                                {{ item.from_branch_head_name }}
                                @if (item.from_assigned_head_district_name) {
                                  <span class="text-gray-400">({{ item.from_assigned_head_district_name }})</span>
                                }
                              </span>
                              <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                              <div class="text-gray-600 max-h-24 overflow-y-auto break-words">
                                <span class="text-gray-400">Staff Note:</span>
                                <span class="text-gray-700 italic font-medium ml-1">"{{ item.staff_note }}"</span>
                              </div>
                            }
                          </div>
                        }

                        <!-- 4. Scheduled Date Changed -->
                        @else if (isDateChanged(item.action_type)) {
                          <div class="flex items-center gap-2 bg-gray-50/80 rounded-lg p-2 border border-gray-100 break-words">
                            <span class="text-gray-400 shrink-0">Rescheduled:</span>
                            @if (item.old_schedule_date && item.new_schedule_date) {
                              <span class="line-through text-gray-400 font-semibold">{{ item.old_schedule_date | date:'dd-MM-yyyy' }}</span>
                              <svg class="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                          <div class="bg-gray-50/80 rounded-lg p-2 border border-gray-100 text-gray-800 font-medium break-words max-h-24 overflow-y-auto">
                            {{ item.action_type }}
                          </div>
                        }

                        <!-- 6. Customer Notes Updated -->
                        @else if (isNoteUpdated(item.action_type)) {
                          <div class="flex flex-col gap-1 bg-gray-50/80 rounded-lg p-2 border border-gray-100 text-gray-700 break-words max-h-24 overflow-y-auto">
                            <span class="text-gray-400 font-medium text-[10px]">Note:</span>
                            <span class="font-medium text-gray-800 italic">"{{ item.customer_note }}"</span>
                          </div>
                        }

                        <!-- Fallback / Notes -->
                        @else {
                          <div class="bg-gray-50/80 rounded-lg p-2 border border-gray-100 text-gray-700 break-words max-h-24 overflow-y-auto">
                            {{ item.customer_note || item.staff_note || item.action_type }}
                          </div>
                        }

                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Infinite Scroll Bottom Spinner -->
              @if (isLoadingMoreHistory()) {
                <div class="flex items-center justify-center py-3 gap-2 text-xs text-gray-500">
                  <svg class="animate-spin h-4 w-4 text-[#0f9d58]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Loading more history...</span>
                </div>
              }

              @if (!hasMoreHistory() && timeline().length >= 10) {
                <p class="text-center text-[10px] text-gray-400 pt-2 pb-1">
                  — End of history records —
                </p>
              }
            }
          </div>

          <!-- ================= COLUMN 3: DOCUMENTS & ATTACHMENTS ================= -->
          <div class="flex flex-col h-full overflow-y-auto p-5 space-y-4 bg-[#fafafa]/30">
            <!-- Column Header -->
            <div class="flex items-center justify-between pb-2 border-b border-gray-200 shrink-0">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700">Documents & Media</h3>
              </div>
              <span class="text-[11px] text-gray-400 font-medium">
                {{ documentsList().length }} file{{ documentsList().length === 1 ? '' : 's' }}
              </span>
            </div>

            <!-- Documents Loading Spinner -->
            @if (isLoadingDocs()) {
              <div class="flex flex-col items-center justify-center py-12 space-y-2 text-gray-400">
                <svg class="animate-spin h-6 w-6 text-[#0f9d58]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span class="text-xs">Fetching attached documents...</span>
              </div>
            } @else if (documentsList().length === 0) {
              <!-- Empty State -->
              <div class="p-6 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-xs">
                No documents, site photos, or files attached to this booking.
              </div>
            } @else {
              <!-- Documents List -->
              <div class="space-y-3">
                @for (doc of documentsList(); track $index) {
                  <div class="bg-white hover:bg-gray-50/80 border border-gray-200 rounded-xl p-2.5 transition-all space-y-2 shadow-2xs">
                    
                    <!-- Image Preview Thumbnail -->
                    @if (isImageFile(doc)) {
                      <div class="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <a [href]="getFullFileUrl(doc)" target="_blank" rel="noopener noreferrer" class="block w-full max-h-48 p-2 flex items-center justify-center cursor-pointer">
                          <img
                            [src]="getFullFileUrl(doc)"
                            [alt]="getDocumentName(doc)"
                            class="max-w-full max-h-44 object-contain rounded transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </a>
                        <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-medium pointer-events-none">
                          Click to expand
                        </div>
                      </div>
                    }

                    <!-- File Details Bar & Action Buttons -->
                    <div class="flex items-center justify-between gap-2 pt-0.5">
                      <div class="flex items-center gap-2 min-w-0">
                        @if (isImageFile(doc)) {
                          <div class="w-6 h-6 rounded-md bg-emerald-50 text-[#0f9d58] flex items-center justify-center shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                          </div>
                        } @else {
                          <div class="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                          </div>
                        }
                        <span class="truncate font-medium text-gray-800 text-xs" [title]="doc">
                          {{ getDocumentName(doc) }}
                        </span>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        @if (isImageFile(doc)) {
                          <a
                            [href]="getFullFileUrl(doc)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-white border border-gray-200 text-gray-700 hover:text-[#0f9d58] transition-colors shadow-2xs"
                            title="View full image"
                          >
                            View
                          </a>
                        }
                        <button
                          type="button"
                          (click)="downloadFile(doc, $event)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#0f9d58] text-white hover:bg-[#0c8248] transition-colors shadow-2xs cursor-pointer"
                          title="Download document"
                        >
                          Download
                        </button>
                      </div>
                    </div>

                  </div>
                }
              </div>
            }
          </div>

        </div>
      </div>
    </div>
  `
})
export class BookingDetailedComponent implements OnInit, OnDestroy {
  @Input({ required: true }) booking!: Booking;
  @Output() close = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Booking>();
  @Output() onDelete = new EventEmitter<Booking>();
  @Output() onStatusChange = new EventEmitter<string>();

  @ViewChild('historyContainer') historyContainer?: ElementRef<HTMLDivElement>;

  private historyService = inject(BookingHistoryService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private previousBodyOverflow = '';

  // History Timeline State with pagination
  timeline = signal<BookingHistoryRecord[]>([]);
  isLoadingHistory = signal(false);
  isLoadingMoreHistory = signal(false);
  page = 1;
  limit = 10;
  hasMoreHistory = signal(true);

  // Documents State
  documentsList = signal<string[]>([]);
  isLoadingDocs = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    if (this.booking?.id) {
      this.fetchInitialHistory();
      this.fetchDocuments();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.previousBodyOverflow || '';
    }
  }

  // Fetch initial history (page 1) using GET /api/booking-history/:bookingId
  fetchInitialHistory(): void {
    if (!this.booking?.id) return;
    this.isLoadingHistory.set(true);
    this.page = 1;
    this.hasMoreHistory.set(true);

    this.historyService.getHistoryByBookingId(this.booking.id, 1, this.limit).subscribe({
      next: (res) => {
        const rows = res?.data?.history || [];
        this.timeline.set(rows);
        this.hasMoreHistory.set(rows.length >= this.limit);
        this.isLoadingHistory.set(false);
      },
      error: (err) => {
        console.error('Error fetching booking history timeline:', err);
        this.timeline.set([]);
        this.hasMoreHistory.set(false);
        this.isLoadingHistory.set(false);
      }
    });
  }

  // Infinite scroll trigger when scrolling near bottom of history column
  onHistoryScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (!el || this.isLoadingHistory() || this.isLoadingMoreHistory() || !this.hasMoreHistory()) {
      return;
    }

    // Check if scrolled within 60px of bottom
    const threshold = 60;
    const reachedBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;

    if (reachedBottom) {
      this.loadMoreHistory();
    }
  }

  // Load next batch of history using GET /api/booking-history/:bookingId
  loadMoreHistory(): void {
    if (this.isLoadingMoreHistory() || !this.hasMoreHistory() || !this.booking?.id) return;

    this.isLoadingMoreHistory.set(true);
    const nextPage = this.page + 1;

    this.historyService.getHistoryByBookingId(this.booking.id, nextPage, this.limit).subscribe({
      next: (res) => {
        const rows = res?.data?.history || [];

        if (rows.length > 0) {
          this.timeline.update(curr => [...curr, ...rows]);
          this.page = nextPage;
        }

        if (rows.length < this.limit) {
          this.hasMoreHistory.set(false);
        }
        this.isLoadingMoreHistory.set(false);
      },
      error: () => {
        this.isLoadingMoreHistory.set(false);
        this.hasMoreHistory.set(false);
      }
    });
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
    return action ? action.startsWith('Scheduled Date Changed') : false;
  }

  isNameUpdated(action: string): boolean {
    return action ? action.startsWith('Customer Name Updated') : false;
  }

  isNoteUpdated(action: string): boolean {
    return action === 'Customer Notes Updated';
  }

  // --- Badge & Dot Styling matching /admin/history ---
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
    return item.action_type || 'Activity';
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
    if (this.isDateChanged(item.action_type)) return '#6d28d9';
    if (this.isNameUpdated(item.action_type)) return '#0369a1';
    return '#334155';
  }

  // Fetch Documents & Media (reads documents directly from booking, no extra booking endpoint call needed)
  fetchDocuments(): void {
    this.isLoadingDocs.set(true);
    const docs = this.extractDocuments(this.booking);
    this.documentsList.set(docs);
    this.isLoadingDocs.set(false);
  }

  private extractDocuments(b: any): string[] {
    if (!b) return [];
    let docs: string[] = [];
    if (b.documents) {
      if (Array.isArray(b.documents)) docs = b.documents;
      else if (typeof b.documents === 'string') {
        try { docs = JSON.parse(b.documents); } catch { docs = [b.documents]; }
      } else { docs = [b.documents]; }
    } else if (b.doorDetails?.documents) {
      docs = b.doorDetails.documents;
    }
    return docs.filter(Boolean);
  }

  // File helpers
  isImageFile(doc: string): boolean {
    if (!doc) return false;
    const clean = doc.split('?')[0].toLowerCase();
    return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.jpeg') ||
           clean.endsWith('.webp') || clean.endsWith('.gif') || clean.endsWith('.svg');
  }

  getDocumentName(doc: string): string {
    if (!doc) return 'Document';
    const clean = doc.split('?')[0];
    const parts = clean.split('/');
    const raw = parts[parts.length - 1] || 'Document';
    return raw.replace(/^\d+[-_]/, '');
  }

  getFullFileUrl(doc: string): string {
    if (!doc) return '';
    if (doc.startsWith('http://') || doc.startsWith('https://')) return doc;
    const cleanDoc = doc.startsWith('/') ? doc.slice(1) : doc;
    const baseApi = environment.apiUrl ? environment.apiUrl.replace(/\/api\/?$/, '') : '';
    return `${baseApi}/${cleanDoc}`;
  }

  downloadFile(doc: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const url = this.getFullFileUrl(doc);
    const fileName = this.getDocumentName(doc);

    // Fetch as blob to force browser file download instead of in-browser navigation
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        // Fallback to window link download if fetch is blocked
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  }

  formatCreatedDateTime(timestamp?: string | null): string {
    if (!timestamp) return '-';
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return timestamp;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp || '-';
    }
  }

  formatScheduledDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}

