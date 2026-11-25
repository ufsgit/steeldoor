import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy, inject, signal, computed, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../../core/data.service';
import { BookingHistoryService, BookingHistoryRecord } from '../../../../../core/services/booking-history.service';
import { ToastService } from '../../../../../shared/toast/toast.service';
import { Booking, StatusOption } from '../../../../../core/models';
import { environment } from '../../../../../../environments/environment';
import { AuthService } from '../../../../../core/auth.service';
import { BrochuresService, Brochure } from '../../../../../core/services/brochures.service';

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
            <div class="w-8 h-8 rounded-lg bg-red-50 text-[#ea1f25] flex items-center justify-center font-bold text-sm shrink-0">
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
            <!-- Share Dropdown Button -->
            <div class="relative inline-block text-left" (click)="$event.stopPropagation()">
              <button
                type="button"
                (click)="toggleShareDropdown()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#ea1f25] hover:border-[#ea1f25]/40 shadow-2xs transition-all cursor-pointer"
                title="Share Options"
              >
                <svg class="w-3.5 h-3.5 text-[#ea1f25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
                <svg class="w-3 h-3 text-gray-400 transition-transform duration-200" [class.rotate-180]="shareDropdownOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (shareDropdownOpen()) {
                <div
                  class="fixed inset-0 z-40"
                  (click)="shareDropdownOpen.set(false)"
                ></div>

                <div
                  class="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn"
                  (click)="$event.stopPropagation()"
                >
                  <!-- Option 1: Normal Share -->
                  <button
                    type="button"
                    (click)="openNormalShareModal()"
                    class="w-full px-3.5 py-2.5 text-left text-xs hover:bg-red-50/60 flex items-start gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div class="w-8 h-8 rounded-lg bg-red-50 text-[#ea1f25] group-hover:bg-[#ea1f25] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span class="font-bold text-gray-900 group-hover:text-[#ea1f25] transition-colors block">Share Booking Details</span>
                      <span class="text-[11px] text-gray-500 block leading-tight mt-0.5">Name, number, location, notes & attached documents</span>
                    </div>
                  </button>

                  <div class="h-px bg-gray-100 my-1"></div>

                  <!-- Option 2: Brochure Sharing -->
                  <button
                    type="button"
                    (click)="openBrochureShareModal()"
                    class="w-full px-3.5 py-2.5 text-left text-xs hover:bg-blue-50/60 flex items-start gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors block">Share Brochures / Catalogue</span>
                      <span class="text-[11px] text-gray-500 block leading-tight mt-0.5">Select PDF brochures from checklist to send to enquiry</span>
                    </div>
                  </button>
                </div>
              }
            </div>

            @if (onEdit.observed) {
              <button
                type="button"
                (click)="onEdit.emit(booking)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ea1f25] text-white hover:bg-[#c5161b] shadow-2xs transition-colors cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>Edit Booking</span>
              </button>
            }

            @if (canDelete() && onDelete.observed) {
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
              <svg class="w-4 h-4 text-[#ea1f25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700">Contact & Booking Details</h3>
            </div>

            <!-- Details List -->
            <div class="space-y-3.5 text-xs">
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact Phone</span>
                <span class="font-medium text-gray-900 text-sm block truncate" [title]="booking.contactPhone || booking.mobile || ''">{{ booking.contactPhone || booking.mobile || '-' }}</span>
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

              <!-- Google Map Location Link -->
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#ea1f25]"></span>
                  <span>Google Map Location</span>
                </span>
                @if (getMapLink()) {
                  <a
                    [href]="getFormattedMapUrl(getMapLink())"
                    target="_blank"
                    rel="noopener noreferrer"
                    (click)="$event.stopPropagation()"
                    class="inline-flex items-center gap-2 text-xs font-semibold text-[#ea1f25] hover:text-[#c5161b] bg-red-50 hover:bg-red-100 border border-[#ea1f25]/30 px-3 py-2 rounded-lg transition-colors break-all w-full group shadow-2xs"
                    title="Open location in Google Maps"
                  >
                    <svg class="w-4 h-4 text-[#ea1f25] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="truncate flex-1 font-medium">{{ getMapLink() }}</span>
                    <svg class="w-3.5 h-3.5 text-[#ea1f25]/70 shrink-0 ml-auto group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                } @else {
                  <span class="text-xs text-gray-400 italic font-medium">Not provided</span>
                }
              </div>

              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">District</span>
                <span class="font-medium text-gray-800 break-words">{{ booking.area ? (booking.area + ', ') : '' }}{{ booking.districtName }}</span>
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
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#fef2f2] text-[#c5161b]">
                  <span class="w-2 h-2 rounded-full bg-[#ea1f25]"></span>
                  <span>{{ booking.status || 'NEW' }}</span>
                </span>
              </div>

              @if (getCleanNotes()) {
                <div>
                  <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Installation Description</span>
                  <p class="text-xs text-gray-700 bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-lg leading-relaxed break-words max-h-28 overflow-y-auto">
                    {{ getCleanNotes() }}
                  </p>
                </div>
              }

              @if (booking.staffNotes || booking.staff_notes) {
                <div>
                  <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Staff Notes / Status Note</span>
                  <p class="text-xs text-gray-700 bg-blue-50/60 border border-blue-200/80 p-2.5 rounded-lg leading-relaxed break-words max-h-28 overflow-y-auto">
                    {{ booking.staffNotes || booking.staff_notes }}
                  </p>
                </div>
              }
            </div>

            <!-- Quick Status Change Bar (Visible only for Role ID 1) -->
            @if (canUpdateStatus()) {
              <div class="pt-3 border-t border-gray-200 space-y-2">
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Update Status</span>
                <div class="grid grid-cols-2 gap-1.5">
                  @if (statusOptions && statusOptions.length > 0) {
                    @for (opt of statusOptions; track opt.id) {
                      <button
                        type="button"
                        (click)="onStatusChange.emit(opt.code || opt.label)"
                        class="py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center border border-transparent"
                        [style.backgroundColor]="opt.colorCode ? opt.colorCode + '18' : '#f3f4f6'"
                        [style.color]="opt.colorCode || '#374151'"
                        [class.ring-2]="booking.statusId === opt.id || booking.status.toLowerCase() === (opt.code || opt.label).toLowerCase()"
                        [style.ringColor]="opt.colorCode || '#9ca3af'"
                      >
                        {{ opt.label || opt.code }}
                      </button>
                    }
                  } @else {
                    <button
                      type="button"
                      (click)="onStatusChange.emit('New')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer text-center"
                      [class.ring-2]="booking.status.toLowerCase() === 'new'"
                    >
                      New
                    </button>
                    <button
                      type="button"
                      (click)="onStatusChange.emit('Scheduled')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] transition-colors cursor-pointer text-center"
                      [class.ring-2]="booking.status.toLowerCase() === 'scheduled'"
                    >
                      Scheduled
                    </button>
                    <button
                      type="button"
                      (click)="onStatusChange.emit('Completed')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-red-50 text-[#ea1f25] hover:bg-red-100 transition-colors cursor-pointer text-center"
                      [class.ring-2]="booking.status.toLowerCase() === 'completed'"
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      (click)="onStatusChange.emit('Cancelled')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#fce8e6] text-[#c5221f] hover:bg-[#fbd1cf] transition-colors cursor-pointer text-center"
                      [class.ring-2]="booking.status.toLowerCase() === 'cancelled'"
                    >
                      Cancelled
                    </button>
                  }
                </div>
              </div>
            }
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
                <svg class="w-4 h-4 text-[#ea1f25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-xs font-bold uppercase tracking-wider text-gray-700">Booking History</h3>
              </div>
            </div>

            <!-- Initial Loading Spinner -->
            @if (isLoadingHistory()) {
              <div class="flex flex-col items-center justify-center py-12 space-y-2 text-gray-400">
                <svg class="animate-spin h-6 w-6 text-[#ea1f25]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                              <span class="font-bold text-[#ea1f25]">
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
                  <svg class="animate-spin h-4 w-4 text-[#ea1f25]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <svg class="w-4 h-4 text-[#ea1f25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <svg class="animate-spin h-6 w-6 text-[#ea1f25]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                          <div class="w-6 h-6 rounded-md bg-red-50 text-[#ea1f25] flex items-center justify-center shrink-0">
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
                            class="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-white border border-gray-200 text-gray-700 hover:text-[#ea1f25] transition-colors shadow-2xs"
                            title="View full image"
                          >
                            View
                          </a>
                        }
                        <button
                          type="button"
                          (click)="downloadFile(doc, $event)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-[#ea1f25] text-white hover:bg-[#c5161b] transition-colors shadow-2xs cursor-pointer"
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

      <!-- ================= MODAL 1: SHARE BOOKING DETAILS ================= -->
      @if (showNormalShareModal()) {
        <div
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          (click)="showNormalShareModal.set(false)"
        >
          <div
            class="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[88vh] overflow-hidden animate-modalIn"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-red-50 text-[#ea1f25] flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">Share Booking Details</h3>
                  <p class="text-[11px] text-gray-500">
                    {{ booking.clientName || 'Customer' }} ({{ booking.contactPhone || booking.mobile || 'No Phone' }})
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="showNormalShareModal.set(false)"
                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <!-- Mode Selector Tabs -->
              <div class="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    (click)="normalShareMode.set('full')"
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    [ngClass]="normalShareMode() === 'full' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
                  >
                    Full Details
                  </button>
                  @if (documentsList().length > 0) {
                    <button
                      type="button"
                      (click)="normalShareMode.set('docsOnly')"
                      class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      [ngClass]="normalShareMode() === 'docsOnly' ? 'bg-white text-[#ea1f25] shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
                    >
                      Document Link(s) Only
                    </button>
                  }
                </div>

                <span class="text-[11px] text-gray-400 font-medium">
                  {{ normalShareMode() === 'docsOnly' ? 'Sending direct file link' : 'Sending complete details' }}
                </span>
              </div>

              <!-- Include Docs Checkbox (Only when Full Details mode is active) -->
              @if (normalShareMode() === 'full' && documentsList().length > 0) {
                <label class="flex items-center gap-2.5 text-xs font-semibold text-gray-700 select-none cursor-pointer p-3 rounded-xl bg-red-50/50 border border-red-100">
                  <input
                    type="checkbox"
                    [checked]="includeDocsInNormalShare()"
                    (change)="includeDocsInNormalShare.set(!includeDocsInNormalShare())"
                    class="rounded text-[#ea1f25] focus:ring-[#ea1f25] h-4 w-4 cursor-pointer"
                  />
                  <div class="flex-1">
                    <span class="text-gray-900 font-bold block">Include Attached Documents & Media</span>
                    <span class="text-[11px] text-gray-500 font-normal">Append links to {{ documentsList().length }} attached file{{ documentsList().length === 1 ? '' : 's' }}</span>
                  </div>
                </label>
              }

              <!-- Message Preview Box -->
              <div>
                <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Formatted Message Preview</span>
                <div class="bg-gray-50 rounded-xl border border-gray-200 p-3.5 text-xs text-gray-800 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
                  {{ getNormalShareText(includeDocsInNormalShare()) }}
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                (click)="showNormalShareModal.set(false)"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="copyText(getNormalShareText(includeDocsInNormalShare()), 'Booking details have been copied to your clipboard and are ready to paste.', 'Booking Details Copied!')"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Text</span>
                </button>

                <button
                  type="button"
                  (click)="sendWhatsApp(getNormalShareText(includeDocsInNormalShare()), booking.contactPhone || booking.mobile)"
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ================= MODAL 2: SHARE BROCHURES (CHECKLIST) ================= -->
      @if (showBrochureShareModal()) {
        <div
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          (click)="showBrochureShareModal.set(false)"
        >
          <div
            class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-modalIn"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">Share Brochures to Enquiry</h3>
                  <p class="text-[11px] text-gray-500">
                    Send selected catalogue documents to {{ booking.clientName || 'Customer' }} ({{ booking.contactPhone || booking.mobile || 'No Phone' }})
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="showBrochureShareModal.set(false)"
                class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Close"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              <!-- Mode Selector Tabs: Complete Message vs Direct Link(s) Only -->
              <div class="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    (click)="brochureShareMode.set('full')"
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    [ngClass]="brochureShareMode() === 'full' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
                  >
                    Complete Message
                  </button>
                  <button
                    type="button"
                    (click)="brochureShareMode.set('linksOnly')"
                    class="px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    [ngClass]="brochureShareMode() === 'linksOnly' ? 'bg-white text-[#ea1f25] shadow-2xs' : 'text-gray-500 hover:text-gray-900'"
                  >
                    Direct Link(s) Only
                  </button>
                </div>

                <span class="text-[11px] text-gray-400 font-medium">
                  {{ brochureShareMode() === 'linksOnly' ? 'Sending direct public link' : 'Sending message with links' }}
                </span>
              </div>

              <!-- Search & Selection Control Toolbar -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                <div class="relative flex-1 sm:max-w-xs">
                  <svg class="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    [ngModel]="brochureSearchQuery()"
                    (ngModelChange)="brochureSearchQuery.set($event)"
                    placeholder="Search brochures..."
                    class="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ea1f25]/20 focus:border-[#ea1f25] transition-colors"
                  />
                </div>

                <div class="flex items-center gap-2 self-end sm:self-auto">
                  <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {{ selectedBrochureIds().size }} of {{ availableBrochures().length }} Selected
                  </span>
                  <button
                    type="button"
                    (click)="selectAllBrochures()"
                    class="text-xs text-[#ea1f25] hover:text-[#c5161b] font-semibold hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span class="text-gray-300">•</span>
                  <button
                    type="button"
                    (click)="clearAllBrochures()"
                    class="text-xs text-gray-500 hover:text-gray-700 font-medium hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <!-- Brochure Checklist Items -->
              @if (isLoadingBrochures()) {
                <div class="py-10 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                  <svg class="animate-spin w-5 h-5 text-[#ea1f25]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Loading available brochures...</span>
                </div>
              } @else if (filteredBrochures().length === 0) {
                <div class="py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200 p-4">
                  @if (availableBrochures().length === 0) {
                    <span>No brochure documents have been uploaded yet. Please add brochures under <strong>Brochure Docs</strong>.</span>
                  } @else {
                    <span>No brochures matched your search "{{ brochureSearchQuery() }}".</span>
                  }
                </div>
              } @else {
                <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
                  @for (b of filteredBrochures(); track b.id) {
                    @let badge = getFileTypeBadge(b.file_name || b.original_name, b.mime_type || '');
                    @let isChecked = selectedBrochureIds().has(b.id);
                    <div
                      (click)="toggleBrochureSelection(b.id)"
                      class="flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none"
                      [ngClass]="isChecked 
                        ? 'border-[#ea1f25]/60 bg-red-50/30 shadow-2xs' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'"
                    >
                      <!-- Checkbox -->
                      <input
                        type="checkbox"
                        [checked]="isChecked"
                        (click)="$event.stopPropagation()"
                        (change)="toggleBrochureSelection(b.id)"
                        class="rounded text-[#ea1f25] focus:ring-[#ea1f25] h-4 w-4 cursor-pointer shrink-0"
                      />

                      <!-- Type Badge -->
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 border"
                        [ngClass]="[badge.bg, badge.text, badge.border]"
                      >
                        {{ badge.label }}
                      </div>

                      <!-- Info -->
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-gray-900 truncate" [title]="b.title">{{ b.title }}</p>
                        <p class="text-[11px] text-gray-500 truncate mt-0.5">
                          {{ b.description || b.original_name }}
                        </p>
                      </div>

                      <!-- Size & Date -->
                      <div class="text-right shrink-0">
                        <span class="text-[11px] font-medium text-gray-500 block">{{ formatFileSize(b.file_size) }}</span>
                        <span class="text-[10px] text-gray-400 block">{{ b.created_at | date:'dd MMM yyyy' }}</span>
                      </div>

                      <!-- Copy Direct Link Button -->
                      <button
                        type="button"
                        (click)="copySingleBrochureLink(b, $event)"
                        class="p-1.5 rounded-lg border border-gray-200 hover:border-[#ea1f25] hover:text-[#ea1f25] hover:bg-red-50 text-gray-500 transition-colors cursor-pointer shrink-0 ml-1"
                        [title]="'Copy direct public link: ' + b.title"
                      >
                        @if (copiedBrochureId() === b.id) {
                          <svg class="w-3.5 h-3.5 text-[#ea1f25]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        } @else {
                          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        }
                      </button>
                    </div>
                  }
                </div>
              }

              <!-- Message Preview Box -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Message Preview</span>
                  <span class="text-[11px] text-gray-400">
                    {{ brochureShareMode() === 'linksOnly' ? 'Direct clickable link' : 'Message with clickable links' }}
                  </span>
                </div>
                <div class="bg-gray-50 rounded-xl border border-gray-200 p-3.5 text-xs text-gray-800 font-mono whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto select-all">
                  {{ getBrochureShareText() }}
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                (click)="showBrochureShareModal.set(false)"
                class="px-3.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="copyText(getBrochureShareText(), 'Selected brochure links have been copied to your clipboard and are ready to share.', 'Brochure Links Copied!')"
                  [disabled]="selectedBrochureIds().size === 0"
                  class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-gray-700 shadow-2xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy Message</span>
                </button>

                <button
                  type="button"
                  (click)="sendWhatsApp(getBrochureShareText(), booking.contactPhone || booking.mobile)"
                  [disabled]="selectedBrochureIds().size === 0"
                  class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class BookingDetailedComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) booking!: Booking;
  @Input() statusOptions: StatusOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() onEdit = new EventEmitter<Booking>();
  @Output() onDelete = new EventEmitter<Booking>();
  @Output() onStatusChange = new EventEmitter<string>();

  @ViewChild('historyContainer') historyContainer?: ElementRef<HTMLDivElement>;

  private historyService = inject(BookingHistoryService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private brochuresService = inject(BrochuresService);
  private previousBodyOverflow = '';

  // Share Dropdown & Modals State
  shareDropdownOpen = signal<boolean>(false);
  showNormalShareModal = signal<boolean>(false);
  showBrochureShareModal = signal<boolean>(false);
  includeDocsInNormalShare = signal<boolean>(true);
  normalShareMode = signal<'full' | 'docsOnly'>('full');
  brochureShareMode = signal<'full' | 'linksOnly'>('full');
  copiedBrochureId = signal<number | null>(null);

  // Brochure Checklist State
  availableBrochures = signal<Brochure[]>([]);
  isLoadingBrochures = signal<boolean>(false);
  selectedBrochureIds = signal<Set<number>>(new Set<number>());
  brochureSearchQuery = signal<string>('');

  filteredBrochures = computed(() => {
    const query = this.brochureSearchQuery().toLowerCase().trim();
    if (!query) return this.availableBrochures();
    return this.availableBrochures().filter(b =>
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.description && b.description.toLowerCase().includes(query)) ||
      (b.original_name && b.original_name.toLowerCase().includes(query))
    );
  });

  // Only allow role_id === 1 (Company Admin) to see and change status
  canUpdateStatus = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const roleId = Number(user.roleId ?? user.dbRoleId ?? (user as any).role_id ?? null);
    return roleId === 1;
  });

  // Only allow role_id === 1 (Company Admin) to see the delete button
  canDelete = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const roleId = Number(user.roleId ?? user.dbRoleId ?? (user as any).role_id ?? null);
    return roleId === 1;
  });

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking'] && !changes['booking'].firstChange) {
      if (this.booking?.id) {
        this.fetchInitialHistory();
        this.fetchDocuments();
      }
    }
  }

  /**
   * Public method to reload history from parent after status or booking updates
   */
  reloadHistory(): void {
    if (this.booking?.id) {
      this.fetchInitialHistory();
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
    return '#ea1f25';
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
    const baseApi = environment.apiUrl ? environment.apiUrl.replace(/\/api\/?$/, '') : '';
    const uploadMatch = doc.match(/^https?:\/\/[^/]+(\/uploads\/.+)$/i);
    if (uploadMatch && !environment.production && baseApi.includes('localhost')) {
      return encodeURI(`${baseApi}${uploadMatch[1]}`);
    }
    if (doc.startsWith('http://') || doc.startsWith('https://')) return encodeURI(doc);
    let cleanDoc = doc.startsWith('/') ? doc.slice(1) : doc;
    if (!cleanDoc.startsWith('uploads/')) {
      cleanDoc = `uploads/${cleanDoc}`;
    }
    return encodeURI(`${baseApi}/${cleanDoc}`);
  }

  getPublicShareFileUrl(doc: string): string {
    return this.brochuresService.getPublicFileShareUrl(doc);
  }

  copySingleBrochureLink(b: Brochure, event: Event): void {
    event.stopPropagation();
    const url = this.brochuresService.getShareUrl(b);
    this.copyText(url, `Direct share link for "${b.title}" is copied to your clipboard.`, 'Link Copied!');
    this.copiedBrochureId.set(b.id);
    setTimeout(() => {
      if (this.copiedBrochureId() === b.id) {
        this.copiedBrochureId.set(null);
      }
    }, 2500);
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

  getMapLink(): string {
    if (!this.booking) return '';
    const b = this.booking as any;
    const direct = (b.mapLink || b.map_link || b.locationUrl || b.location_url || '').trim();
    if (direct) return direct;
    if (b.notes) {
      const match = String(b.notes).match(/(?:(?:Google )?Maps? Link:\s*)?(https?:\/\/[^\s\n]+)/i);
      if (match) return match[1].trim();
    }
    return '';
  }

  getFormattedMapUrl(link: string): string {
    if (!link) return '';
    const trimmed = link.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (/^(maps\.app\.goo\.gl|goo\.gl\/maps|(www\.)?google\.[a-z.]+\/maps)/i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
  }

  getCleanNotes(): string {
    if (!this.booking?.notes) return '';
    const notes = String(this.booking.notes);
    const match = notes.match(/(?:(?:Google )?Maps? Link:\s*)?(https?:\/\/[^\s\n]+)/i);
    if (match) {
      return notes.replace(match[0], '').replace(/\n\s*\n/g, '\n').trim();
    }
    return notes;
  }

  // ================= SHARE FUNCTIONALITY =================

  toggleShareDropdown(): void {
    this.shareDropdownOpen.set(!this.shareDropdownOpen());
  }

  openNormalShareModal(): void {
    this.shareDropdownOpen.set(false);
    this.showNormalShareModal.set(true);
  }

  openBrochureShareModal(): void {
    this.shareDropdownOpen.set(false);
    this.showBrochureShareModal.set(true);
    this.loadActiveBrochures();
  }

  loadActiveBrochures(): void {
    this.isLoadingBrochures.set(true);
    this.brochuresService.getBrochures('', 1, 100).subscribe({
      next: (res) => {
        const list = res.data || [];
        this.availableBrochures.set(list);
        if (list.length > 0 && this.selectedBrochureIds().size === 0) {
          this.selectedBrochureIds.set(new Set(list.map(b => b.id)));
        }
        this.isLoadingBrochures.set(false);
      },
      error: (err) => {
        console.error('Failed to load brochures for sharing:', err);
        this.isLoadingBrochures.set(false);
      }
    });
  }

  toggleBrochureSelection(id: number): void {
    this.selectedBrochureIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  selectAllBrochures(): void {
    this.selectedBrochureIds.set(new Set(this.availableBrochures().map(b => b.id)));
  }

  clearAllBrochures(): void {
    this.selectedBrochureIds.set(new Set());
  }

  getNormalShareText(includeDocs = true): string {
    const b = this.booking;
    if (!b) return '';
    const clientName = b.clientName || b.name || 'Customer';
    const docs = this.documentsList();

    // Mode: Document Links Only
    if (this.normalShareMode() === 'docsOnly') {
      if (docs.length === 0) {
        return `No attached documents for ${clientName}.`;
      }
      if (docs.length === 1) {
        // Return purely the link itself
        return this.getPublicShareFileUrl(docs[0]);
      }
      const lines: string[] = [
        `📎 *Attached Documents for ${clientName}:*`,
        ``
      ];
      docs.forEach((doc, idx) => {
        const name = this.getDocumentName(doc);
        const url = this.getPublicShareFileUrl(doc);
        lines.push(`${idx + 1}. *${name}*`);
        lines.push(url);
        lines.push(``);
      });
      return lines.join('\n').trim();
    }

    // Mode: Full Details
    const phone = b.contactPhone || b.mobile || 'Not provided';
    const address = b.address || 'Not provided';
    const mapLink = this.getMapLink();
    const districtParts = [b.area, b.districtName].filter(Boolean);
    const district = districtParts.join(', ') || 'Not specified';
    const assignedHead = b.branchHeadName || 'Unassigned';
    const scheduledDate = b.scheduledDate ? this.formatScheduledDate(b.scheduledDate) : 'Pending';
    const status = b.status || 'New';
    const notes = this.getCleanNotes();
    const staffNotes = b.staffNotes || (b as any).staff_notes;

    const lines: string[] = [
      `📋 *BOOKING DETAILS*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Client Name:* ${clientName}`,
      `📞 *Contact Number:* ${phone}`,
      `📍 *Full Address:* ${address}`
    ];

    if (mapLink) {
      lines.push(`🗺️ *Google Maps:* ${this.getFormattedMapUrl(mapLink)}`);
    }

    lines.push(`🏙️ *District:* ${district}`);
    lines.push(`👔 *Assigned Head:* ${assignedHead}`);
    lines.push(`📅 *Scheduled Date:* ${scheduledDate}`);
    lines.push(`⚡ *Current Status:* ${status}`);

    if (notes) {
      lines.push(`📝 *Customer Notes:* ${notes}`);
    }

    if (staffNotes) {
      lines.push(`💬 *Staff Note:* ${staffNotes}`);
    }

    if (includeDocs) {
      lines.push(``);
      if (docs.length > 0) {
        lines.push(`📎 *Attached Documents & Media (${docs.length}):*`);
        docs.forEach((doc, idx) => {
          const name = this.getDocumentName(doc);
          const url = this.getPublicShareFileUrl(doc);
          lines.push(`${idx + 1}. *${name}*`);
          lines.push(url);
          lines.push(``);
        });
      } else {
        lines.push(`📎 *Attached Documents:* None`);
      }
    }

    lines.push(`━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`Shared via FitMate`);

    return lines.join('\n');
  }

  getBrochureShareText(): string {
    const clientName = this.booking?.clientName || this.booking?.name || 'Customer';
    const selected = this.availableBrochures().filter(b => this.selectedBrochureIds().has(b.id));

    if (selected.length === 0) {
      return `Hello ${clientName},\n\nThank you for reaching out to FitMate Steel Doors!`;
    }

    // Mode: Direct Links Only
    if (this.brochureShareMode() === 'linksOnly') {
      if (selected.length === 1) {
        // Return directly the link itself
        return this.brochuresService.getShareUrl(selected[0]);
      }
      const lines: string[] = [];
      selected.forEach((b, index) => {
        const url = this.brochuresService.getShareUrl(b);
        lines.push(`${index + 1}. *${b.title}*`);
        lines.push(url);
        lines.push(``);
      });
      return lines.join('\n').trim();
    }

    // Mode: Complete Formatted Message
    const lines: string[] = [
      `Hello ${clientName},`,
      ``,
      `Thank you for your enquiry with *FitMate Steel Doors*! Here are the product catalogues and brochure documents you requested:`,
      ``
    ];

    selected.forEach((b, index) => {
      const url = this.brochuresService.getShareUrl(b);
      lines.push(`${index + 1}. *${b.title}*`);
      if (b.description) {
        lines.push(`_${b.description}_`);
      }
      lines.push(url);
      lines.push(``);
    });

    lines.push(`Please let us know if you have any questions or would like to schedule a site measurement.`);
    lines.push(`Best regards,`);
    lines.push(`*FitMate Team*`);

    return lines.join('\n');
  }

  sendWhatsApp(text: string, phone?: string): void {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);

    // Check if phone has at least 10 digits and is not all zeroes (placeholder)
    const isValidPhone = cleanPhone.length >= 10 && !/^0+$/.test(cleanPhone);

    let targetUrl = '';
    if (isValidPhone) {
      const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      targetUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    } else {
      // Direct general WhatsApp share
      targetUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    if (isPlatformBrowser(this.platformId)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }

  copyText(text: string, successMessage = 'Copied to your clipboard and ready to share!', title = 'Copied!'): void {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.toastService.success(successMessage, title);
      }).catch(() => {
        this.fallbackCopy(text, successMessage, title);
      });
    } else {
      this.fallbackCopy(text, successMessage, title);
    }
  }

  private fallbackCopy(text: string, successMessage: string, title = 'Copied!'): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.toastService.success(successMessage, title);
    } catch {
      this.toastService.error('Could not copy automatically.');
    }
    document.body.removeChild(textarea);
  }

  getFileTypeBadge(filename = '', mimetype = ''): { label: string; bg: string; text: string; border: string } {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf' || mimetype === 'application/pdf') {
      return { label: 'PDF', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' };
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || mimetype.startsWith('image/')) {
      return { label: 'IMG', bg: 'bg-red-50', text: 'text-[#ea1f25]', border: 'border-red-200' };
    }
    if (['doc', 'docx'].includes(ext) || mimetype.includes('word') || mimetype.includes('officedocument')) {
      return { label: 'DOC', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' };
    }
    return { label: 'DOC', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

