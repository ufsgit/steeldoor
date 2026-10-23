import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { Booking, District, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="w-full flex-1 flex flex-col bg-white">
      
      <!-- 1. Google Sheet Status Tabs Bar (Exact Font, Spacing & Styling from Screenshot) -->
      <div class="w-full flex items-center gap-7 px-7 sm:px-10 border-b border-gray-200 overflow-x-auto text-[14px] select-none bg-white">
        <!-- All Orders Tab with Google Sheet table icon -->
        <button
          type="button"
          id="tab-all-orders"
          (click)="setStatus('')"
          class="flex items-center gap-2 pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === '' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          <svg class="w-4.5 h-4.5 text-[#0f9d58]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-4h7v4zm0-6H5V7h7v4zm7 6h-5v-4h5v4zm0-6h-5V7h5v4z"/>
          </svg>
          <span>All Orders</span>
        </button>

        <button
          type="button"
          id="tab-pending"
          (click)="setStatus('Pending')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Pending' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Pending
        </button>

        <button
          type="button"
          id="tab-accepted"
          (click)="setStatus('Accepted')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Accepted' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Accepted
        </button>

        <button
          type="button"
          id="tab-scheduled"
          (click)="setStatus('Scheduled')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Scheduled' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Scheduled
        </button>

        <button
          type="button"
          id="tab-finished"
          (click)="setStatus('Finished')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Finished' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Finished
        </button>

        <button
          type="button"
          id="tab-delayed"
          (click)="setStatus('Delayed')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Delayed' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Delayed
        </button>

        <button
          type="button"
          id="tab-rejected"
          (click)="setStatus('Rejected')"
          class="pb-3 pt-3.5 -mb-px transition-colors cursor-pointer shrink-0"
          [ngClass]="selectedStatus() === 'Rejected' ? 'text-[#0f9d58] border-b-2 border-[#0f9d58] font-bold' : 'text-gray-600 hover:text-gray-900 font-semibold border-b-2 border-transparent'"
        >
          Rejected
        </button>
      </div>

      <!-- 2. Filter & Action Toolbar (Balanced, matching Image 1) -->
      <div class="w-full flex items-center justify-between gap-3 px-7 sm:px-10 py-3.5 border-b border-gray-100 bg-white">
        <!-- Left Filter Controls -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Search Input -->
          <div class="w-[300px] sm:w-[340px] shrink-0">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set($event); currentPage.set(1)"
              placeholder="Search sheet (e.g. client, door, hub)..."
              class="w-full h-[36px] text-[13px] px-3.5 rounded-md border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0f9d58] font-normal"
            />
          </div>

          <!-- Date Range Pickers: [dd/mm/yyyy 📅] - [dd/mm/yyyy 📅] -->
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- From Date -->
            <div class="relative flex items-center justify-between w-[125px] h-[36px] px-3 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer group">
              <span class="text-[13px] font-normal select-none pointer-events-none" [ngClass]="dateFrom() ? 'text-gray-800' : 'text-gray-400'">
                {{ dateFrom() ? formatDateDisplay(dateFrom()) : 'dd/mm/yyyy' }}
              </span>
              <!-- Clean Outline Calendar Icon -->
              <svg class="w-3.5 h-3.5 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                type="date"
                [ngModel]="dateFrom()"
                (ngModelChange)="dateFrom.set($event); currentPage.set(1)"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Select From Date"
              />
            </div>

            <!-- Separator Dash -->
            <span class="text-gray-400 font-normal select-none px-0.5">-</span>

            <!-- To Date -->
            <div class="relative flex items-center justify-between w-[125px] h-[36px] px-3 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-pointer group">
              <span class="text-[13px] font-normal select-none pointer-events-none" [ngClass]="dateTo() ? 'text-gray-800' : 'text-gray-400'">
                {{ dateTo() ? formatDateDisplay(dateTo()) : 'dd/mm/yyyy' }}
              </span>
              <!-- Clean Outline Calendar Icon -->
              <svg class="w-3.5 h-3.5 text-gray-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2.5" ry="2.5"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <input
                type="date"
                [ngModel]="dateTo()"
                (ngModelChange)="dateTo.set($event); currentPage.set(1)"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                title="Select To Date"
              />
            </div>
          </div>

          <!-- District Hubs Dropdown -->
          <div class="w-40 sm:w-44 h-[36px] relative shrink-0">
            <select
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event); currentPage.set(1)"
              class="w-full h-full text-[13px] px-3 pr-7 rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0f9d58] font-normal appearance-none cursor-pointer"
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

          <!-- Client Types Dropdown -->
          <div class="w-36 sm:w-40 h-[36px] relative shrink-0">
            <select
              [ngModel]="selectedClientType()"
              (ngModelChange)="selectedClientType.set($event); currentPage.set(1)"
              class="w-full h-full text-[13px] px-3 pr-7 rounded-md border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-[#0f9d58] font-normal appearance-none cursor-pointer"
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

        <!-- Right Action Buttons -->
        <div class="flex items-center gap-2.5 shrink-0">
          <!-- Search Action Button -->
          <button
            type="button"
            (click)="currentPage.set(1)"
            class="h-[36px] px-3.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-[13px] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Search</span>
          </button>

          <!-- + New Enquiry Green Button -->
          <button
            type="button"
            (click)="openNewEnquiryModal()"
            class="h-[36px] px-4 rounded-md bg-[#246b3f] hover:bg-[#1e5834] text-white font-semibold text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <svg class="w-4 h-4 fill-none shrink-0" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M12 4v16m8-8H4"/>
            </svg>
            <span>New Enquiry</span>
          </button>
        </div>
      </div>

      <!-- 3. Google Sheet Data Table with vertical separators & rounded border box matching reference -->
      <div class="w-full px-7 sm:px-10 pt-1 pb-2 overflow-x-auto">
        <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <table class="w-full min-w-[1000px] text-left border-collapse" style="table-layout: fixed;">
            <colgroup>
              <col style="width: 44px;">
              <col style="width: 18%;">
              <col style="width: 16%;">
              <col style="width: 21%;">
              <col style="width: 18%;">
              <col style="width: 14%;">
              <col style="width: 13%;">
            </colgroup>
            <thead class="bg-[#f8fafc]">
              <tr class="border-b border-gray-200 text-[11px] font-semibold text-gray-600 select-none h-10">
                <!-- Left Row Number Header -->
                <th class="py-2 px-1 text-center bg-[#f8fafc] border-r border-gray-200"></th>

                <!-- Column A -->
                <th class="py-2 px-3.5 whitespace-nowrap border-r border-gray-200 bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">A ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">CLIENT NAME</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>

                <!-- Column B -->
                <th class="py-2 px-3.5 whitespace-nowrap border-r border-gray-200 bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">B ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">PHONE NUMBER</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>

                <!-- Column C -->
                <th class="py-2 px-3.5 whitespace-nowrap border-r border-gray-200 bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">C ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">DISTRICT & AREA</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>

                <!-- Column D -->
                <th class="py-2 px-3.5 whitespace-nowrap border-r border-gray-200 bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">D ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">ASSIGNED HEAD</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>

                <!-- Column E -->
                <th class="py-2 px-3.5 whitespace-nowrap border-r border-gray-200 bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">E ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">SCHEDULED FITTING</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>

                <!-- Column F -->
                <th class="py-2 px-3.5 whitespace-nowrap bg-[#f8fafc]">
                  <div class="flex items-center justify-between w-full">
                    <div class="flex items-center gap-1.5">
                      <span class="text-gray-400 font-medium text-[11px]">F ·</span>
                      <span class="tracking-wider uppercase text-gray-600 font-bold text-[11px]">STATUS</span>
                    </div>
                    <svg class="w-3 h-3 text-gray-400 shrink-0 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              @for (b of paginatedBookings(); track b.id; let idx = $index; let last = $last) {
                <tr
                  (click)="openBooking(b)"
                  class="hover:bg-[#f8fafc] transition-colors cursor-pointer group h-[50px]"
                >
                  <!-- Row Number Index (1, 2, 3...) -->
                  <td class="py-2.5 px-1 text-center text-gray-400 text-[13px] select-none font-medium border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    {{ (currentPage() - 1) * pageSize + idx + 1 }}
                  </td>

                  <!-- A · CLIENT NAME -->
                  <td class="py-2.5 px-3.5 font-bold text-[15px] text-gray-950 group-hover:text-[#0f9d58] transition-colors whitespace-nowrap truncate tracking-tight border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    {{ b.clientName }}
                  </td>

                  <!-- B · PHONE NUMBER -->
                  <td class="py-2.5 px-3.5 text-[14px] text-gray-900 whitespace-nowrap font-medium border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    {{ b.contactPhone }}
                  </td>

                  <!-- C · DISTRICT & AREA -->
                  <td class="py-2.5 px-3.5 text-[14px] text-gray-900 whitespace-nowrap font-medium truncate border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    {{ b.area }}, {{ b.districtName }} Hub
                  </td>

                  <!-- D · ASSIGNED HEAD -->
                  <td class="py-2.5 px-3.5 text-[14px] text-gray-900 whitespace-nowrap font-medium truncate border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    {{ b.branchHeadName || 'Rajesh Menon' }}
                  </td>

                  <!-- E · SCHEDULED FITTING -->
                  <td class="py-2.5 px-3.5 whitespace-nowrap border-r border-gray-200" [class.border-b]="!last" [class.border-gray-200]="!last">
                    @if (b.scheduledDate) {
                      <span class="text-[14px] text-gray-900 font-medium">{{ formatScheduledDate(b.scheduledDate) }}</span>
                    } @else {
                      <span class="text-[14px] text-[#94a3b8] italic font-medium">Pending</span>
                    }
                  </td>

                  <!-- F · STATUS (Soft rounded-rectangle badges matching Image 1) -->
                  <td class="py-2 px-3.5 whitespace-nowrap" [class.border-b]="!last" [class.border-gray-200]="!last">
                    <!-- Pending (Soft warm cream/amber rounded rectangle) -->
                    @if (b.status === 'Pending' && !b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#fef7e0] text-[#b45309]">
                        <span class="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                        <span>Pending</span>
                      </span>
                    }

                    <!-- Scheduled (Soft pale green rounded rectangle) -->
                    @if (b.status === 'Scheduled' && !b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span class="w-2 h-2 rounded-full bg-[#137333]"></span>
                        <span>Scheduled</span>
                      </span>
                    }

                    <!-- Accepted (Soft pale blue rounded rectangle) -->
                    @if (b.status === 'Accepted' && !b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e8f0fe] text-[#1967d2]">
                        <span class="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
                        <span>Accepted</span>
                      </span>
                    }

                    <!-- Delayed (Soft pale purple rounded rectangle) -->
                    @if (b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#f3e8fd] text-[#7e22ce]">
                        <span class="w-2 h-2 rounded-full bg-[#9333ea]"></span>
                        <span>Delayed</span>
                      </span>
                    }

                    <!-- Finished (Soft pale mint rounded rectangle) -->
                    @if (b.status === 'Finished') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span class="w-2 h-2 rounded-full bg-[#137333]"></span>
                        <span>Finished</span>
                      </span>
                    }

                    <!-- Rejected (Soft pale red rounded rectangle) -->
                    @if (b.status === 'Rejected') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#fce8e6] text-[#c5221f]">
                        <span class="w-2 h-2 rounded-full bg-[#d93025]"></span>
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
      </div>

      <!-- 4. Subtle Google Sheet Bottom Bar with record count & pagination (Matching Image 1) -->
      <div class="w-full px-7 sm:px-10 py-2.5 flex items-center justify-between text-[13px] text-gray-500 bg-white select-none">
        <div>
          Showing <strong class="text-gray-900 font-bold">{{ (currentPage() - 1) * pageSize + 1 }} to {{ getEndIndex() }}</strong> of
          <strong class="text-gray-900 font-bold">{{ filteredBookings().length }}</strong> orders
        </div>

        <div class="flex items-center gap-4 text-[13px]">
          <button
            type="button"
            (click)="prevPage()"
            [disabled]="currentPage() === 1"
            class="text-gray-400 hover:text-gray-700 disabled:opacity-40 disabled:hover:text-gray-400 cursor-pointer font-medium transition-colors"
          >
            Previous
          </button>
          <span class="text-gray-900 font-bold px-1">
            {{ currentPage() }}/{{ totalPages() || 1 }}
          </span>
          <button
            type="button"
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages()"
            class="text-gray-900 hover:text-[#0f9d58] disabled:opacity-40 disabled:hover:text-gray-900 cursor-pointer font-bold transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Quick Detail Slide-Over Drawer for Selected Booking -->
      @if (selectedBooking()) {
        <div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fadeIn" (click)="selectedBooking.set(null)">
          <div class="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col space-y-4 overflow-y-auto" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 class="text-base font-bold text-gray-900">{{ selectedBooking()?.clientName }}</h3>
                <p class="text-xs text-gray-500">{{ selectedBooking()?.id }}</p>
              </div>
              <button
                type="button"
                (click)="selectedBooking.set(null)"
                class="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-3 text-xs">
              <div class="bg-gray-50 rounded-xl p-3.5 space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-500">Contact Phone:</span>
                  <span class="font-semibold text-gray-800">{{ selectedBooking()?.contactPhone }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Email:</span>
                  <span class="font-medium text-gray-700">{{ selectedBooking()?.contactEmail || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">District & Hub:</span>
                  <span class="font-medium text-gray-800">{{ selectedBooking()?.area }}, {{ selectedBooking()?.districtName }} Hub</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Assigned Head:</span>
                  <span class="font-medium text-gray-800">{{ selectedBooking()?.branchHeadName || 'Rajesh Menon' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Scheduled Date:</span>
                  <span class="font-medium text-gray-800">
                    {{ selectedBooking()?.scheduledDate ? formatScheduledDate(selectedBooking()!.scheduledDate!) : 'Pending' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Current Status:</span>
                  <span class="font-semibold text-gray-900">{{ selectedBooking()?.status }}</span>
                </div>
              </div>

              <!-- Quick Status Actions -->
              <div class="space-y-1.5 pt-2">
                <label class="font-semibold text-gray-700 block">Change Status:</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="updateBookingStatus('Pending')"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#fef7e0] text-[#b45309] hover:opacity-90 cursor-pointer"
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    (click)="updateBookingStatus('Accepted')"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e8f0fe] text-[#1967d2] hover:opacity-90 cursor-pointer"
                  >
                    Accepted
                  </button>
                  <button
                    type="button"
                    (click)="updateBookingStatus('Scheduled')"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e6f4ea] text-[#137333] hover:opacity-90 cursor-pointer"
                  >
                    Scheduled
                  </button>
                  <button
                    type="button"
                    (click)="updateBookingStatus('Finished')"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e6f4ea] text-[#137333] hover:opacity-90 cursor-pointer"
                  >
                    Finished
                  </button>
                  <button
                    type="button"
                    (click)="updateBookingStatus('Rejected')"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#fce8e6] text-[#c5221f] hover:opacity-90 cursor-pointer"
                  >
                    Rejected
                  </button>
                  <button
                    type="button"
                    (click)="viewFullDetails()"
                    class="py-1.5 px-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Full Page →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- New Enquiry Slide-Over Modal -->
      @if (newEnquiryModalOpen()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn" (click)="newEnquiryModalOpen.set(false)">
          <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 class="text-base font-bold text-gray-900">+ New Door Enquiry</h3>
              <button
                type="button"
                (click)="newEnquiryModalOpen.set(false)"
                class="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form (submit)="submitNewEnquiry($event)" class="space-y-3 text-xs">
              <div>
                <label class="block font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  name="clientName"
                  required
                  [(ngModel)]="newClientName"
                  placeholder="e.g. Rahul Sharma"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    [(ngModel)]="newPhone"
                    placeholder="e.g. 9847012345"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  />
                </div>
                <div>
                  <label class="block font-medium text-gray-700 mb-1">District / Hub</label>
                  <select
                    name="district"
                    [(ngModel)]="newDistrict"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  >
                    @for (d of districts; track d.id) {
                      <option [value]="d.name">{{ d.name }} Hub</option>
                    }
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Area / Location *</label>
                  <input
                    type="text"
                    name="area"
                    required
                    [(ngModel)]="newArea"
                    placeholder="e.g. Edapally"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  />
                </div>
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Assigned Head</label>
                  <input
                    type="text"
                    name="head"
                    [(ngModel)]="newHead"
                    placeholder="e.g. Rajesh Menon"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  />
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  (click)="newEnquiryModalOpen.set(false)"
                  class="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg bg-[#246b3f] hover:bg-[#1e5834] text-white font-semibold cursor-pointer"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      }

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

  // Pagination (11 items per page to fill the screen cleanly without vertical overflow)
  currentPage = signal(1);
  pageSize = 11;

  // Modals / Drawers
  selectedBooking = signal<Booking | null>(null);
  newEnquiryModalOpen = signal(false);

  // New enquiry form fields
  newClientName = '';
  newPhone = '';
  newDistrict = 'Ernakulam';
  newArea = '';
  newHead = 'Rajesh Menon';

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
      list = list.filter(b => b.districtId === dist || b.districtName.toLowerCase() === dist.toLowerCase());
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
    // Fetch fresh bookings to ensure latest updates are reflected
    this.dataService.getBookings().subscribe(b => {
      if (b && b.length > 0) {
        this.bookings.set(b);
      }
    });

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

  formatDateDisplay(isoDate: string): string {
    if (!isoDate) return 'dd/mm/yyyy';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoDate;
    } catch {
      return isoDate;
    }
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
    this.selectedBooking.set(b);
  }

  viewFullDetails(): void {
    const b = this.selectedBooking();
    if (b) {
      this.router.navigate(['/bookings', b.id]);
    }
  }

  updateBookingStatus(newStatus: BookingStatus): void {
    const b = this.selectedBooking();
    if (!b) return;

    this.bookings.update(list =>
      list.map(item => item.id === b.id ? { ...item, status: newStatus, isDelayed: false } : item)
    );
    this.selectedBooking.update(item => item ? { ...item, status: newStatus, isDelayed: false } : null);
  }

  openNewEnquiryModal(): void {
    this.newEnquiryModalOpen.set(true);
  }

  submitNewEnquiry(event: Event): void {
    event.preventDefault();
    if (!this.newClientName || !this.newPhone) return;

    const newBooking: Booking = {
      id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: this.newClientName,
      clientType: 'customer',
      contactPhone: this.newPhone,
      contactEmail: `${this.newClientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      districtId: 'dist-ekm',
      districtName: this.newDistrict,
      area: this.newArea || 'Edapally',
      address: `${this.newArea}, ${this.newDistrict}`,
      pincode: '682024',
      doorDetails: {
        doorType: 'Standard Steel Door Installation',
        quantity: 1
      },
      status: 'Pending',
      branchHeadName: this.newHead || 'Rajesh Menon',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };

    this.bookings.update(prev => [newBooking, ...prev]);
    this.newEnquiryModalOpen.set(false);
    this.newClientName = '';
    this.newPhone = '';
    this.newArea = '';
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
