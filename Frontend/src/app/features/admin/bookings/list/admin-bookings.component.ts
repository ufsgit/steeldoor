import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../../core/data.service';
import { AuthService } from '../../../../core/auth.service';
import { Booking, District, BookingStatus, BranchHead, User } from '../../../../core/models';
import { matchesDistrict } from '../../../../core/role-utils';
import { DistrictDropdownComponent, DropdownComponent, DropdownOption } from '../../../../shared/components';
import { ToastService } from '../../../../shared/toast/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DistrictDropdownComponent, DropdownComponent],
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
          <div class="w-44 sm:w-48 h-[36px] relative shrink-0">
            <app-district-dropdown
              [districts]="availableDistricts()"
              [ngModel]="selectedDistrict()"
              (ngModelChange)="selectedDistrict.set($event); currentPage.set(1)"
              valueField="id"
              suffix="Hub"
              [showAllOption]="!isBranchHead()"
              [allOptionLabel]="isBranchHead() ? 'My District Hub' : 'All Districts Hubs'"
              [placeholder]="isBranchHead() ? 'My District Hub' : 'All Districts Hubs'"
              searchPlaceholder="Search district..."
              size="sm"
            ></app-district-dropdown>
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
          <a
            routerLink="/admin/bookings/new"
            class="h-[36px] px-4 rounded-md bg-[#246b3f] hover:bg-[#1e5834] text-white font-semibold text-[13px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <svg class="w-4 h-4 fill-none shrink-0" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6" d="M12 4v16m8-8H4"/>
            </svg>
            <span>New Enquiry</span>
          </a>
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
                    <!-- NEW (Soft warm cream/emerald rounded rectangle) -->
                    @if (isStatus(b, 'NEW')) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span class="w-2 h-2 rounded-full bg-[#0f9d58]"></span>
                        <span>NEW</span>
                      </span>
                    }

                    <!-- Pending (Soft warm cream/amber rounded rectangle) -->
                    @if (isStatus(b, 'Pending') && !b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#fef7e0] text-[#b45309]">
                        <span class="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
                        <span>Pending</span>
                      </span>
                    }

                    <!-- Scheduled (Soft pale green rounded rectangle) -->
                    @if (isStatus(b, 'Scheduled') && !b.isDelayed) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span class="w-2 h-2 rounded-full bg-[#137333]"></span>
                        <span>Scheduled</span>
                      </span>
                    }

                    <!-- Accepted (Soft pale blue rounded rectangle) -->
                    @if (isStatus(b, 'Accepted') && !b.isDelayed) {
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
                    @if (isStatus(b, 'Finished')) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#e6f4ea] text-[#137333]">
                        <span class="w-2 h-2 rounded-full bg-[#137333]"></span>
                        <span>Finished</span>
                      </span>
                    }

                    <!-- Rejected (Soft pale red rounded rectangle) -->
                    @if (isStatus(b, 'Rejected')) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-[#fce8e6] text-[#c5221f]">
                        <span class="w-2 h-2 rounded-full bg-[#d93025]"></span>
                        <span>Rejected</span>
                      </span>
                    }

                    <!-- Fallback if any other custom status -->
                    @if (!isKnownStatus(b)) {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[13px] font-semibold bg-gray-100 text-gray-700">
                        <span class="w-2 h-2 rounded-full bg-gray-400"></span>
                        <span>{{ b.status || 'NEW' }}</span>
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
                <p class="text-xs text-gray-500">Booking #{{ selectedBooking()?.id }}</p>
              </div>
              <div class="flex items-center gap-2">
                @if (!isEditingSelected()) {
                  <button
                    type="button"
                    (click)="startEditingBooking()"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f9d58] text-white hover:bg-[#0c8248] shadow-sm transition-all cursor-pointer"
                    title="Edit booking details"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Booking</span>
                  </button>
                }
                <button
                  type="button"
                  (click)="selectedBooking.set(null)"
                  class="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
                  title="Close"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- EDIT MODE FORM -->
            @if (isEditingSelected()) {
              <div class="space-y-3.5 text-xs">
                <div class="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
                  <span class="font-medium">Editing Customer & Booking Info</span>
                  <span class="text-gray-400 text-[10px]">Changes will persist to database</span>
                </div>

                <div>
                  <label class="block font-semibold text-gray-700 mb-1">Client / Customer Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="editName"
                    placeholder="Enter customer name"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    [(ngModel)]="editMobile"
                    placeholder="Enter mobile number"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs"
                  />
                </div>

                <div>
                  <label class="block font-semibold text-gray-700 mb-1">Full Address *</label>
                  <textarea
                    rows="2"
                    [(ngModel)]="editAddress"
                    placeholder="Enter complete address"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs"
                  ></textarea>
                </div>

                <div>
                  <label class="block font-semibold text-gray-700 mb-1">Notes / Instructions</label>
                  <textarea
                    rows="2"
                    [(ngModel)]="editNotes"
                    placeholder="Fitting notes, measurements, delivery notes..."
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs"
                  ></textarea>
                </div>

                <!-- Editable Documents Section with Delete Button & Add New Doc -->
                <div class="pt-2 border-t border-gray-100 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="font-semibold text-gray-700">Documents & Attachments</label>
                    <span class="text-[11px] text-gray-400">{{ editDocuments().length }} file(s)</span>
                  </div>

                  <!-- Upload new doc inside edit -->
                  <div class="border border-dashed border-gray-300 rounded-lg p-2.5 bg-gray-50 text-center">
                    <input
                      type="file"
                      multiple
                      #editFileInput
                      (change)="onEditDocumentsSelected($event)"
                      class="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    @if (isUploadingEditDocs()) {
                      <div class="flex items-center justify-center gap-1.5 py-1 text-xs text-gray-600">
                        <svg class="animate-spin h-4 w-4 text-[#0f9d58]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Uploading document...</span>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="editFileInput.click()"
                        class="text-xs text-[#0f9d58] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Upload additional file / photo</span>
                      </button>
                    }
                  </div>

                  <!-- Existing docs with red DELETE button -->
                  @if (editDocuments().length > 0) {
                    <div class="space-y-1.5 pt-1">
                      @for (doc of editDocuments(); track $index) {
                        <div class="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                          <div class="flex items-center gap-2 min-w-0 pr-2">
                            @if (isImageFile(doc)) {
                              <svg class="w-4 h-4 text-[#0f9d58] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                            } @else {
                              <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                              </svg>
                            }
                            <span class="truncate font-medium text-gray-800" [title]="doc">{{ getDocumentName(doc) }}</span>
                          </div>

                          <!-- Red Delete Document Button -->
                          <button
                            type="button"
                            (click)="removeDocumentFromEdit($index)"
                            class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-red-600 hover:text-white hover:bg-red-600 border border-red-200 hover:border-red-600 rounded transition-colors cursor-pointer shrink-0"
                            title="Delete this document"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Form Save & Cancel Buttons -->
                <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    (click)="cancelEditingBooking()"
                    class="px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    (click)="saveEditedBooking()"
                    [disabled]="isSavingEdit() || !editName.trim() || !editMobile.trim() || !editAddress.trim()"
                    class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0c8248] disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                  >
                    @if (isSavingEdit()) {
                      <svg class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span>Saving...</span>
                    } @else {
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span>Update Booking</span>
                    }
                  </button>
                </div>
              </div>
            } @else {
              <!-- READONLY VIEW MODE -->
              <div class="space-y-3 text-xs">
                <div class="bg-gray-50 rounded-xl p-3.5 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-500">Contact Phone:</span>
                    <span class="font-semibold text-gray-800">{{ selectedBooking()?.contactPhone || selectedBooking()?.mobile }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Address:</span>
                    <span class="font-medium text-gray-700 max-w-[220px] text-right truncate" [title]="selectedBooking()?.address">{{ selectedBooking()?.address || 'N/A' }}</span>
                  </div>
                  @if (selectedBooking()?.notes) {
                    <div class="flex justify-between">
                      <span class="text-gray-500">Notes:</span>
                      <span class="font-medium text-gray-700 max-w-[220px] text-right truncate" [title]="selectedBooking()?.notes">{{ selectedBooking()?.notes }}</span>
                    </div>
                  }
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

              <!-- Quick Status Actions (Only Company role_id=1 can change status) -->
              @if (isCompany()) {
                <div class="space-y-1.5 pt-2">
                  <label class="font-semibold text-gray-700 block">Change Status:</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      (click)="promptStatusChange('New')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e6f4ea] text-[#137333] hover:bg-[#c9eed1] transition-colors cursor-pointer text-center"
                      [class.ring-2]="selectedBooking()?.status?.toLowerCase() === 'new'"
                      [class.ring-[#0f9d58]]="selectedBooking()?.status?.toLowerCase() === 'new'"
                    >
                      New
                    </button>
                    <button
                      type="button"
                      (click)="promptStatusChange('Scheduled')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e8f0fe] text-[#1967d2] hover:bg-[#d2e3fc] transition-colors cursor-pointer text-center"
                      [class.ring-2]="selectedBooking()?.status?.toLowerCase() === 'scheduled'"
                      [class.ring-[#1967d2]]="selectedBooking()?.status?.toLowerCase() === 'scheduled'"
                    >
                      Scheduled
                    </button>
                    <button
                      type="button"
                      (click)="promptStatusChange('Completed')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#e6f4ea] text-[#0f9d58] hover:bg-[#c9eed1] transition-colors cursor-pointer text-center"
                      [class.ring-2]="selectedBooking()?.status?.toLowerCase() === 'completed' || selectedBooking()?.status?.toLowerCase() === 'finished'"
                      [class.ring-[#0f9d58]]="selectedBooking()?.status?.toLowerCase() === 'completed' || selectedBooking()?.status?.toLowerCase() === 'finished'"
                    >
                      Completed
                    </button>
                    <button
                      type="button"
                      (click)="promptStatusChange('Cancelled')"
                      class="py-1.5 px-2 rounded-lg text-xs font-semibold bg-[#fce8e6] text-[#c5221f] hover:bg-[#fbd1cf] transition-colors cursor-pointer text-center"
                      [class.ring-2]="selectedBooking()?.status?.toLowerCase() === 'cancelled' || selectedBooking()?.status?.toLowerCase() === 'rejected'"
                      [class.ring-[#c5221f]]="selectedBooking()?.status?.toLowerCase() === 'cancelled' || selectedBooking()?.status?.toLowerCase() === 'rejected'"
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              }

              <!-- Documents & Attachments Section -->
              <div class="pt-3 border-t border-gray-100 space-y-2.5">
                <div class="flex items-center justify-between">
                  <label class="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Documents & Attachments
                  </label>
                  <span class="text-[11px] text-gray-500 font-medium">
                    {{ getBookingDocuments(selectedBooking()).length }} file{{ getBookingDocuments(selectedBooking()).length === 1 ? '' : 's' }}
                  </span>
                </div>

                @if (getBookingDocuments(selectedBooking()).length === 0) {
                  <div class="p-3 text-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-400 text-xs">
                    No documents or images attached to this booking.
                  </div>
                } @else {
                  <div class="space-y-3">
                    @for (doc of getBookingDocuments(selectedBooking()); track $index) {
                      <div class="bg-gray-50/80 hover:bg-gray-50 border border-gray-200 rounded-xl p-2.5 transition-all space-y-2">
                        
                        <!-- If Image: Show inline preview thumbnail -->
                        @if (isImageFile(doc)) {
                          <div class="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <a [href]="getFullFileUrl(doc)" target="_blank" rel="noopener noreferrer" class="block w-full max-h-56 p-2 flex items-center justify-center cursor-pointer">
                              <img
                                [src]="getFullFileUrl(doc)"
                                [alt]="getDocumentName(doc)"
                                class="max-w-full max-h-52 object-contain rounded transition-transform duration-200 group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            </a>
                            <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-xs font-medium pointer-events-none">
                              Click to expand
                            </div>
                          </div>
                        }

                        <!-- File Info Header & Actions -->
                        <div class="flex items-center justify-between gap-2 pt-0.5">
                          <div class="flex items-center gap-2 min-w-0">
                            <!-- File Icon -->
                            @if (isImageFile(doc)) {
                              <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#0f9d58] flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                              </div>
                            } @else {
                              <div class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                              </div>
                            }
                            <span class="truncate font-medium text-gray-800 text-xs" [title]="doc">
                              {{ getDocumentName(doc) }}
                            </span>
                          </div>

                          <!-- Action Buttons -->
                          <div class="flex items-center gap-1.5 shrink-0">
                            <!-- View Button (Only for Images) -->
                            @if (isImageFile(doc)) {
                              <a
                                [href]="getFullFileUrl(doc)"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#0f9d58] hover:border-[#0f9d58]/40 hover:bg-emerald-50/30 transition-colors shadow-2xs"
                                title="View image in new tab"
                              >
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                <span>View</span>
                              </a>
                            }

                            <!-- Download Button (For all files) -->
                            <button
                              type="button"
                              (click)="downloadFile(doc, $event)"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#0f9d58] text-white hover:bg-[#0c8248] transition-colors shadow-2xs cursor-pointer"
                              title="Download file"
                            >
                              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                              </svg>
                              <span>Download</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    }
                  </div>
                }

                <!-- Edit Action at Bottom of Drawer -->
                <div class="pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button
                    type="button"
                    (click)="startEditingBooking()"
                    class="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#0f9d58] text-white hover:bg-[#0c8248] shadow-sm transition-all cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Edit Booking Details & Documents</span>
                  </button>
                </div>
              </div>
            </div>
          }
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

            <form (submit)="submitNewEnquiry($event)" class="space-y-3.5 text-xs">
              <!-- p_name: Client Name -->
              <div>
                <label class="block font-medium text-gray-700 mb-1">Client Name  *</label>
                <input
                  type="text"
                  name="clientName"
                  required
                  maxlength="150"
                  [(ngModel)]="newClientName"
                  placeholder="e.g. Rahul Sharma"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                />
              </div>

              <!-- p_mobile & p_status in 2-col grid -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Phone Number  *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxlength="25"
                    [(ngModel)]="newPhone"
                    placeholder="e.g. 9847012345"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  />
                </div>
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Status </label>
                  <select
                    name="status"
                    [(ngModel)]="newStatus"
                    class="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Finished">Finished</option>
                    <option value="NEW">NEW</option>
                  </select>
                </div>
              </div>

              <!-- p_district_name & p_area_name in 2-col grid -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-medium text-gray-700 mb-1">District  *</label>
                  <app-district-dropdown
                    [(ngModel)]="newDistrict"
                    [districts]="districts"
                    valueField="name"
                    suffix="Hub"
                    placeholder="Select District / Hub"
                    searchPlaceholder="Search district or area..."
                    (districtChange)="onNewDistrictSelected($event)"
                  ></app-district-dropdown>
                </div>
                <div>
                  <label class="block font-medium text-gray-700 mb-1">Area / Location  *</label>
                  <app-dropdown
                    [options]="newAreaOptions()"
                    [(ngModel)]="newArea"
                    name="modalArea"
                    placeholder="Select Area"
                    searchPlaceholder="Search area or pincode..."
                    [searchable]="true"
                    [clearable]="false"
                    emptyMessage="No areas found for this district"
                  ></app-dropdown>
                </div>
              </div>

              <!-- p_address: Address -->
              <div>
                <label class="block font-medium text-gray-700 mb-1">Address  *</label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  [(ngModel)]="newAddress"
                  placeholder="e.g. Door No. 12/450, Civil Station Road, Near Metro"
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                ></textarea>
              </div>

              <!-- p_notes: Notes -->
              <div>
                <label class="block font-medium text-gray-700 mb-1">Notes / Instructions </label>
                <textarea
                  name="notes"
                  rows="2"
                  [(ngModel)]="newNotes"
                  placeholder="e.g. Frame measurement needed, double steel door specification..."
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                ></textarea>
              </div>

              <!-- Assigned Head -->
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

              <!-- p_documents: Documents (JSON) -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="font-medium text-gray-700">Documents / Attachments </label>
                  <span class="text-[11px] text-gray-400">PDF, JPG, PNG (JSON Array)</span>
                </div>
                
                <!-- Upload Dropzone / Button -->
                <div class="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-50 text-center transition-colors">
                  <input
                    type="file"
                    multiple
                    #docFileInput
                    (change)="onDocumentsSelected($event)"
                    class="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  @if (isUploadingDocuments()) {
                    <div class="flex flex-col items-center justify-center gap-1.5 py-1">
                      <svg class="animate-spin h-5 w-5 text-[#0f9d58]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                      </svg>
                      <span class="text-xs text-gray-600 font-medium">Uploading documents...</span>
                    </div>
                  } @else {
                    <div class="flex flex-col items-center justify-center gap-1 cursor-pointer" (click)="docFileInput.click()">
                      <svg class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span class="text-xs text-gray-600 font-medium">Click to upload documents or site photos</span>
                      <span class="text-[10px] text-gray-400">PDF, JPG, PNG, DOC</span>
                    </div>
                  }
                </div>

                <!-- Uploaded Document Chips List -->
                @if (newDocuments().length > 0) {
                  <div class="flex flex-wrap gap-2 mt-2">
                    @for (doc of newDocuments(); track $index) {
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200 text-[11px] text-gray-700">
                        <svg class="w-3.5 h-3.5 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <span class="truncate max-w-[140px]" [title]="doc">{{ getDocumentName(doc) }}</span>
                        <button
                          type="button"
                          (click)="removeDocument($index)"
                          class="p-0.5 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                          title="Remove document"
                        >
                          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                }
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
                  [disabled]="isSubmitting"
                  class="px-4 py-2 rounded-lg bg-[#246b3f] hover:bg-[#1e5834] text-white font-semibold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  @if (isSubmitting) {
                    <svg class="animate-spin w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Saving...</span>
                  } @else {
                    <span>Save Enquiry</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Status Change Confirmation & Date Picker Modal (Elevated z-index to appear directly above drawer) -->
      @if (pendingStatusChange()) {
        <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn" (click)="cancelStatusChange()">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-4 relative" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="flex items-center justify-between border-b border-gray-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-8 h-8 rounded-full flex items-center justify-center"
                  [ngClass]="{
                    'bg-blue-100 text-blue-700': pendingStatusChange() === 'Scheduled',
                    'bg-emerald-100 text-[#0f9d58]': pendingStatusChange() === 'Completed',
                    'bg-rose-100 text-rose-700': pendingStatusChange() === 'Cancelled',
                    'bg-gray-100 text-gray-700': pendingStatusChange() === 'New'
                  }"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </span>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">Confirm Status Change</h3>
                  <p class="text-[11px] text-gray-500">Booking #{{ selectedBooking()?.id }} · {{ selectedBooking()?.clientName }}</p>
                </div>
              </div>
              <button
                type="button"
                (click)="cancelStatusChange()"
                class="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Confirmation Message Body -->
            <div class="space-y-3.5 text-xs">
              <div class="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 leading-relaxed">
                Are you sure you want to change the status of this booking to
                <span class="font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-[11px]"
                  [ngClass]="{
                    'bg-blue-100 text-blue-800': pendingStatusChange() === 'Scheduled',
                    'bg-emerald-100 text-emerald-800': pendingStatusChange() === 'Completed',
                    'bg-rose-100 text-rose-800': pendingStatusChange() === 'Cancelled',
                    'bg-gray-200 text-gray-800': pendingStatusChange() === 'New'
                  }"
                >{{ pendingStatusChange() }}</span>?
              </div>

              <!-- 1. Branch Head & District Details (FIRST) -->
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-3">
                <div class="font-semibold text-gray-800 flex items-center justify-between pb-1 border-b border-gray-200/70 text-[11px] uppercase tracking-wider">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-[#0f9d58]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Branch Head & District Details</span>
                  </span>
                  <span class="text-gray-400 font-normal normal-case">Change assignment if needed</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- District Selection -->
                  <div>
                    <label class="block font-medium text-gray-700 mb-1">District / Hub *</label>
                    <select
                      [(ngModel)]="statusDistrictName"
                      (ngModelChange)="onStatusDistrictChange($event)"
                      class="w-full px-2.5 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs font-medium text-gray-800"
                    >
                      <option value="">Select District</option>
                      @for (d of districts; track d.id) {
                        <option [value]="d.name">{{ d.name }} Hub</option>
                      }
                    </select>
                  </div>

                  <!-- Branch Head Display (Disabled Text Field) -->
                  <div>
                    <label class="block font-medium text-gray-700 mb-1">Assigned Branch Head</label>
                    <div class="relative">
                      <input
                        type="text"
                        [value]="statusBranchHeadName || 'No Branch Head assigned'"
                        disabled
                        class="w-full px-2.5 py-2 bg-gray-100 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold cursor-not-allowed select-none"
                      />
                      <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">Auto-assigned</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Scheduled Date Picker: Shown when status is 'Scheduled' -->
              @if (pendingStatusChange() === 'Scheduled') {
                <div class="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 space-y-2">
                  <label class="block font-semibold text-blue-900 text-xs flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span>Pick Scheduled Appointment Date *</span>
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="statusScheduleDate"
                    class="w-full px-3 py-2 bg-white rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-gray-800"
                  />
                  <p class="text-[11px] text-blue-700">Select the date on which measurement or installation is scheduled.</p>
                </div>
              }

              <!-- Optional Notes/Reason -->
              <div>
                <label class="block font-semibold text-gray-700 mb-1">
                  {{ pendingStatusChange() === 'Cancelled' ? 'Cancellation Reason (Optional)' : 'Status Note / Remarks (Optional)' }}
                </label>
                <textarea
                  rows="2"
                  [(ngModel)]="statusNotes"
                  placeholder="Add any remarks or details regarding this status update..."
                  class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] text-xs"
                ></textarea>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                (click)="cancelStatusChange()"
                [disabled]="isSubmittingStatus()"
                class="px-4 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmStatusChange()"
                [disabled]="isSubmittingStatus() || (pendingStatusChange() === 'Scheduled' && !statusScheduleDate)"
                class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                [ngClass]="{
                  'bg-blue-600 hover:bg-blue-700': pendingStatusChange() === 'Scheduled',
                  'bg-[#0f9d58] hover:bg-[#0c8248]': pendingStatusChange() === 'Completed' || pendingStatusChange() === 'New',
                  'bg-rose-600 hover:bg-rose-700': pendingStatusChange() === 'Cancelled'
                }"
              >
                @if (isSubmittingStatus()) {
                  <svg class="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Updating...</span>
                } @else {
                  <span>Confirm & Update Status</span>
                }
              </button>
            </div>
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
  authService = inject(AuthService);
  toastService = inject(ToastService);

  bookings = signal<Booking[]>([]);
  districts: District[] = [];
  branchHeads: BranchHead[] = [];
  branchHeadUsers: any[] = [];

  isCompany = computed(() => {
    const u = this.authService.currentUser();
    const roleId = Number(u?.roleId ?? u?.dbRoleId);
    const r = (u?.role || '').toLowerCase();
    return roleId === 1 || r === 'company' || r === 'admin';
  });

  isBranchHead = computed(() => {
    const u = this.authService.currentUser();
    const roleId = Number(u?.roleId ?? u?.dbRoleId);
    return roleId === 3 || u?.role === 'branch_head';
  });

  availableDistricts = computed(() => {
    if (this.isBranchHead()) {
      const u = this.authService.currentUser();
      return this.districts.filter(d => matchesDistrict(d.id, d.name, u?.districtId, u?.districtName));
    }
    return this.districts;
  });

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

  // New enquiry form fields matching create_booking SP:
  newClientName = '';           // p_name (VARCHAR 150)
  newPhone = '';                // p_mobile (VARCHAR 25)
  newAddress = '';              // p_address (TEXT)
  newNotes = '';                // p_notes (TEXT)
  newStatus: BookingStatus = 'Pending'; // p_status (VARCHAR 50)
  newDistrict = 'Ernakulam';    // p_district_name (VARCHAR 100)
  newArea = '';                 // p_area_name (VARCHAR 100)
  newDistrictAreas = signal<any[]>([]);
  newAreaOptions = computed<DropdownOption[]>(() => {
    return this.newDistrictAreas().map(a => ({
      label: a.name,
      value: a.name,
      subtext: a.pincode ? a.pincode : undefined,
      raw: a
    }));
  });
  newDocuments = signal<string[]>([]);  // p_documents (JSON)
  isUploadingDocuments = signal(false);
  newHead = 'Rajesh Menon';
  isSubmitting = false;

  // Selected Booking Edit Mode state
  isEditingSelected = signal(false);
  isSavingEdit = signal(false);
  editName = '';
  editMobile = '';
  editAddress = '';
  editNotes = '';
  editDocuments = signal<string[]>([]);
  isUploadingEditDocs = signal(false);

  // Status Change Confirmation Modal State
  pendingStatusChange = signal<string | null>(null);
  statusDistrictName = '';
  statusBranchHeadName = '';
  statusScheduleDate = '';
  statusNotes = '';
  isSubmittingStatus = signal(false);

  autoAssignBranchHeadForDistrict(districtName: string): void {
    if (!districtName) {
      this.statusBranchHeadName = '';
      return;
    }
    const cleanDist = districtName.replace(/\s+hub$/i, '').trim().toLowerCase();
    const matchedDistObj = this.districts.find(d => d.name.toLowerCase() === cleanDist);
    const targetDistrictId = matchedDistObj ? String(matchedDistObj.id) : null;

    // 1. Search the user table for role 'branch_head' (role_id: 3) matching district_id or district_name
    let matchedUser = this.branchHeadUsers.find(u => {
      const uDistId = u.districtId != null ? String(u.districtId) : (u.district_id != null ? String(u.district_id) : '');
      const uDistName = (u.districtName || u.district_name || '').toLowerCase();
      
      if (targetDistrictId && uDistId === targetDistrictId) {
        return true;
      }
      return uDistName.includes(cleanDist) || cleanDist.includes(uDistName);
    });

    // 2. Fallback to branchHeads list if user table query is still populating
    if (!matchedUser && this.branchHeads.length > 0) {
      const fallbackHead = this.branchHeads.find(h => {
        const hDistId = String(h.districtId || '');
        const hDistName = (h.districtName || '').toLowerCase();
        if (targetDistrictId && hDistId === targetDistrictId) return true;
        return hDistName.includes(cleanDist) || cleanDist.includes(hDistName);
      });
      if (fallbackHead) {
        matchedUser = fallbackHead;
      }
    }

    if (matchedUser) {
      this.statusBranchHeadName = matchedUser.name;
    } else {
      // Default fallback
      this.statusBranchHeadName = cleanDist === 'trivandrum' ? 'Suresh Kumar' : 'Rajesh Menon';
    }
  }

  onStatusDistrictChange(newDist: string): void {
    this.statusDistrictName = newDist;
    this.autoAssignBranchHeadForDistrict(newDist);
  }

  setStatus(status: string): void {
    this.selectedStatus.set(status);
    this.currentPage.set(1);
  }

  filteredBookings = computed(() => {
    let list = [...this.bookings()];

    // 0. Enforce role-based scoping:
    // - Role 1 (Company) & Role 2 (Coordinator): list ALL clients
    // - Role 3 (Branch Head): display clients details by district_id
    // - Role 4 (Dealer) & Role 5 (Customer): take list by login_id
    const user = this.authService.currentUser();
    const roleId = Number(user?.roleId ?? user?.dbRoleId);
    const isRole1or2 = roleId === 1 || roleId === 2 || user?.role === 'admin' || user?.role === 'coordinator';
    const isRole3 = roleId === 3 || user?.role === 'branch_head';

    if (isRole3) {
      list = list.filter(b => matchesDistrict(b.districtId, b.districtName, user?.districtId, user?.districtName));
    } else if (!isRole1or2 && user) {
      const targetId = String(user.clientId || user.id);
      list = list.filter(b => {
        if (b.loginId != null && String(b.loginId) === String(user.id)) return true;
        if (b.clientId && (String(b.clientId) === targetId || String(b.clientId) === String(user.clientId))) return true;
        return false;
      });
    }

    // Search query
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(b => {
        const cName = (b.clientName || b.name || '').toLowerCase();
        const cPhone = (b.contactPhone || b.mobile || '').toLowerCase();
        const cArea = (b.area || b.areaName || '').toLowerCase();
        const cDist = (b.districtName || '').toLowerCase();
        const cHead = (b.branchHeadName || '').toLowerCase();
        const cDoor = (b.doorDetails?.doorType || '').toLowerCase();
        const cId = String(b.id || '').toLowerCase();

        return (
          cName.includes(q) ||
          cPhone.includes(q) ||
          cArea.includes(q) ||
          cDist.includes(q) ||
          cHead.includes(q) ||
          cDoor.includes(q) ||
          cId.includes(q)
        );
      });
    }

    // Status tab filter
    const status = this.selectedStatus();
    if (status) {
      if (status === 'Delayed') {
        list = list.filter(b => b.isDelayed);
      } else if (status === 'Pending') {
        list = list.filter(b => (b.status === 'Pending' || b.status === 'NEW') && !b.isDelayed);
      } else {
        list = list.filter(b => String(b.status || '').toLowerCase() === status.toLowerCase());
      }
    }

    // District
    const dist = this.selectedDistrict();
    if (dist) {
      list = list.filter(b => b.districtId === dist || (b.districtName && b.districtName.toLowerCase() === dist.toLowerCase()));
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
      list = list.filter(b => b.createdAt ? new Date(b.createdAt).getTime() >= fromTime : true);
    }
    const dTo = this.dateTo();
    if (dTo) {
      const toTime = new Date(dTo).setHours(23, 59, 59, 999);
      list = list.filter(b => b.createdAt ? new Date(b.createdAt).getTime() <= toTime : true);
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
    } else {
      this.dataService.getBookings().subscribe(b => {
        if (b && b.length > 0) {
          this.bookings.set(b);
        }
      });
    }

    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts) {
      this.districts = resolvedDistricts;
    } else {
      this.dataService.getDistricts().subscribe(d => this.districts = d);
    }

    this.dataService.getBranchHeads().subscribe(heads => {
      this.branchHeads = heads || [];
    });

    // Load branch head users from the user table to match by district_id
    this.dataService.getUsers({ role: 'branch_head', limit: 100 }).subscribe(res => {
      this.branchHeadUsers = res?.data || [];
      // If modal is open, re-run district match
      if (this.pendingStatusChange() && this.statusDistrictName) {
        this.autoAssignBranchHeadForDistrict(this.statusDistrictName);
      }
    });

    const initialStatus = this.route.snapshot.queryParamMap.get('status');
    if (initialStatus) {
      this.selectedStatus.set(initialStatus);
    }

    // If logged in as Branch Head, pre-configure their assigned district
    const u = this.authService.currentUser();
    const roleId = Number(u?.roleId ?? u?.dbRoleId);
    if (roleId === 3 || u?.role === 'branch_head') {
      if (u?.districtName) {
        const cleanName = u.districtName.replace(/\s+hub$/i, '').trim();
        this.newDistrict = cleanName;
        this.selectedDistrict.set(u.districtId || cleanName);
      }
      if (u?.name) {
        this.newHead = u.name;
      }
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

  isStatus(booking: Booking, target: string): boolean {
    if (!booking || !booking.status) return target.toUpperCase() === 'NEW';
    const s = String(booking.status).trim().toLowerCase();
    const t = target.trim().toLowerCase();
    if (t === 'pending') {
      return s === 'pending';
    }
    return s === t;
  }

  isKnownStatus(booking: Booking): boolean {
    if (!booking || !booking.status) return false;
    const s = String(booking.status).trim().toLowerCase();
    return ['new', 'pending', 'scheduled', 'accepted', 'finished', 'rejected'].includes(s);
  }

  openBooking(b: Booking): void {
    this.selectedBooking.set(b);
    this.isEditingSelected.set(false);
  }

  startEditingBooking(): void {
    const b = this.selectedBooking();
    if (!b) return;
    this.editName = b.clientName || b.name || '';
    this.editMobile = b.contactPhone || b.mobile || '';
    this.editAddress = b.address || '';
    this.editNotes = b.notes || '';
    this.editDocuments.set([...this.getBookingDocuments(b)]);
    this.isEditingSelected.set(true);
  }

  cancelEditingBooking(): void {
    this.isEditingSelected.set(false);
  }

  removeDocumentFromEdit(index: number): void {
    this.editDocuments.update(docs => docs.filter((_, i) => i !== index));
  }

  onEditDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isUploadingEditDocs.set(true);

    this.dataService.uploadDocuments(files).subscribe({
      next: res => {
        this.isUploadingEditDocs.set(false);
        if (res && res.urls && res.urls.length > 0) {
          this.editDocuments.update(prev => [...prev, ...res.urls]);
        } else {
          const fallbackUrls = files.map(f => `/uploads/${f.name}`);
          this.editDocuments.update(prev => [...prev, ...fallbackUrls]);
        }
      },
      error: () => {
        this.isUploadingEditDocs.set(false);
        const fallbackUrls = files.map(f => `/uploads/${f.name}`);
        this.editDocuments.update(prev => [...prev, ...fallbackUrls]);
      }
    });
    input.value = '';
  }

  saveEditedBooking(): void {
    const b = this.selectedBooking();
    if (!b) return;

    if (!this.editName.trim() || !this.editMobile.trim() || !this.editAddress.trim()) {
      this.toastService.error('Name, Mobile Number, and Address are required.');
      return;
    }

    this.isSavingEdit.set(true);
    const updatedDocs = this.editDocuments();

    const updatePayload: any = {
      name: this.editName.trim(),
      clientName: this.editName.trim(),
      mobile: this.editMobile.trim(),
      contactPhone: this.editMobile.trim(),
      address: this.editAddress.trim(),
      notes: this.editNotes.trim() || null,
      documents: updatedDocs
    };

    this.dataService.updateBooking(b.id, updatePayload).subscribe({
      next: (res) => {
        this.isSavingEdit.set(false);
        this.isEditingSelected.set(false);

        const updated: Booking = {
          ...b,
          ...updatePayload
        };

        // Update list and selectedBooking
        this.bookings.update(list =>
          list.map(item => item.id === b.id ? { ...item, ...updated } : item)
        );
        this.selectedBooking.set(updated);
        this.toastService.success(`Booking #${b.id} updated successfully!`);
      },
      error: (err) => {
        this.isSavingEdit.set(false);
        this.toastService.error(err?.error?.error || 'Failed to update booking. Please try again.');
      }
    });
  }

  viewFullDetails(): void {
    const b = this.selectedBooking();
    if (b) {
      this.router.navigate(['/bookings', b.id]);
    }
  }

  promptStatusChange(newStatus: string): void {
    if (!this.isCompany()) {
      this.toastService.error('Only Company administrators can change booking status.');
      return;
    }

    const b = this.selectedBooking();
    if (!b) return;

    this.pendingStatusChange.set(newStatus);
    
    // Pre-fill District from booking and auto-assign Branch Head by searching user table
    this.statusDistrictName = b.districtName ? b.districtName.replace(/\s+hub$/i, '').trim() : '';
    if (this.statusDistrictName) {
      this.autoAssignBranchHeadForDistrict(this.statusDistrictName);
    } else {
      this.statusBranchHeadName = b.branchHeadName || 'Rajesh Menon';
    }

    // If Scheduled, default to today's date formatted as YYYY-MM-DD
    if (newStatus === 'Scheduled') {
      const today = new Date().toISOString().slice(0, 10);
      this.statusScheduleDate = b.scheduledDate ? b.scheduledDate.slice(0, 10) : today;
    } else {
      this.statusScheduleDate = '';
    }
    this.statusNotes = '';
  }

  // Alias for backward compatibility if any cached templates call updateBookingStatus
  updateBookingStatus(newStatus: string): void {
    this.promptStatusChange(newStatus);
  }

  cancelStatusChange(): void {
    this.pendingStatusChange.set(null);
    this.statusDistrictName = '';
    this.statusBranchHeadName = '';
    this.statusScheduleDate = '';
    this.statusNotes = '';
  }

  confirmStatusChange(): void {
    const b = this.selectedBooking();
    const newStatus = this.pendingStatusChange();
    if (!b || !newStatus) return;

    if (newStatus === 'Scheduled' && !this.statusScheduleDate) {
      this.toastService.error('Please select a date for the scheduled appointment.');
      return;
    }

    this.isSubmittingStatus.set(true);
    const user = this.authService.currentUser();
    const scheduleDate = newStatus === 'Scheduled' ? this.statusScheduleDate : null;
    const notes = this.statusNotes.trim() || null;
    const chosenDistrict = this.statusDistrictName.trim() || b.districtName || '';
    const chosenBranchHead = this.statusBranchHeadName.trim() || b.branchHeadName || 'Rajesh Menon';

    // Find matched branch head ID if available
    const matchedHead = this.branchHeads.find(h => h.name.toLowerCase() === chosenBranchHead.toLowerCase());
    const matchedDist = this.districts.find(d => d.name.toLowerCase() === chosenDistrict.toLowerCase());

    const payload = {
      clientId: b.id,
      clientName: b.clientName || b.name,
      status: newStatus,
      scheduleDate: scheduleDate,
      notes: notes,
      createdBy: user?.id ? String(user.id) : null,
      createdByName: user?.name || null,
      branchHeadId: matchedHead?.id || b.branchHeadId || null,
      branchHeadName: chosenBranchHead,
      districtId: matchedDist?.id || b.districtId || null,
      districtName: chosenDistrict
    };

    // Save status using POST /api/status and sync booking details
    this.dataService.saveStatus(payload).subscribe({
      next: (res) => {
        // Also persist updated branchHeadName and districtName to the booking via updateBooking
        this.dataService.updateBooking(b.id, {
          status: newStatus,
          branchHeadName: chosenBranchHead,
          branchHeadId: matchedHead?.id ? String(matchedHead.id) : b.branchHeadId,
          districtName: chosenDistrict,
          districtId: matchedDist?.id ? String(matchedDist.id) : b.districtId,
          notes: notes || b.notes
        }).subscribe({
          next: () => {},
          error: () => {}
        });

        this.isSubmittingStatus.set(false);
        this.cancelStatusChange();

        // Update local state
        const updatedBooking: Booking = {
          ...b,
          status: newStatus,
          branchHeadName: chosenBranchHead,
          branchHeadId: matchedHead?.id ? String(matchedHead.id) : b.branchHeadId,
          districtName: chosenDistrict,
          districtId: matchedDist?.id ? String(matchedDist.id) : b.districtId,
          scheduledDate: scheduleDate || b.scheduledDate,
          notes: notes || b.notes,
          isDelayed: false
        };

        this.bookings.update(list =>
          list.map(item => item.id === b.id ? { ...item, ...updatedBooking } : item)
        );
        this.selectedBooking.set(updatedBooking);

        this.toastService.success(res?.message || `Status changed to ${newStatus} successfully!`);
      },
      error: (err) => {
        this.isSubmittingStatus.set(false);
        this.toastService.error(err?.error?.error || 'Failed to update status. Please try again.');
      }
    });
  }

  openNewEnquiryModal(): void {
    const u = this.authService.currentUser();
    const roleId = Number(u?.roleId ?? u?.dbRoleId);
    if (roleId === 3 || u?.role === 'branch_head') {
      if (u?.districtName) {
        this.newDistrict = u.districtName.replace(/\s+hub$/i, '').trim();
      }
      if (u?.name) {
        this.newHead = u.name;
      }
    }
    const targetDist = this.districts.find(d => d.name.toLowerCase() === this.newDistrict.toLowerCase());
    if (targetDist?.id) {
      this.loadNewDistrictAreas(targetDist.id);
    }
    this.newEnquiryModalOpen.set(true);
  }

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    this.isUploadingDocuments.set(true);

    this.dataService.uploadDocuments(files).subscribe({
      next: res => {
        this.isUploadingDocuments.set(false);
        if (res && res.urls && res.urls.length > 0) {
          this.newDocuments.update(prev => [...prev, ...res.urls]);
        } else {
          const fallbackUrls = files.map(f => `/uploads/${f.name}`);
          this.newDocuments.update(prev => [...prev, ...fallbackUrls]);
        }
      },
      error: () => {
        this.isUploadingDocuments.set(false);
        const fallbackUrls = files.map(f => `/uploads/${f.name}`);
        this.newDocuments.update(prev => [...prev, ...fallbackUrls]);
      }
    });
    input.value = '';
  }

  removeDocument(index: number): void {
    this.newDocuments.update(prev => prev.filter((_, i) => i !== index));
  }

  getDocumentName(docUrl: string): string {
    if (!docUrl) return '';
    try {
      const parts = docUrl.split('/');
      return parts[parts.length - 1] || docUrl;
    } catch {
      return docUrl;
    }
  }

  getBookingDocuments(booking: Booking | null): string[] {
    if (!booking) return [];
    let docs = booking.documents;
    if (typeof docs === 'string') {
      try {
        docs = JSON.parse(docs);
      } catch {
        docs = [docs];
      }
    }
    if (Array.isArray(docs)) {
      return docs.filter(d => typeof d === 'string' && d.trim().length > 0);
    }
    return [];
  }

  getFullFileUrl(filePath: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    const base = (environment.fileUrl || 'http://localhost:5000').replace(/\/$/, '');
    return `${base}${cleanPath}`;
  }

  isImageFile(filePath: string): boolean {
    if (!filePath) return false;
    const clean = filePath.split('?')[0].toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/.test(clean);
  }

  isPdfFile(filePath: string): boolean {
    if (!filePath) return false;
    const clean = filePath.split('?')[0].toLowerCase();
    return /\.pdf$/.test(clean);
  }

  isOfficeDocument(filePath: string): boolean {
    if (!filePath) return false;
    const clean = filePath.split('?')[0].toLowerCase();
    return /\.(doc|docx|xls|xlsx|ppt|pptx)$/.test(clean);
  }

  openDocumentViewer(filePath: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const fullUrl = this.getFullFileUrl(filePath);
    const clean = filePath.split('?')[0].toLowerCase();

    // Browser natively opens images, PDFs, text, and html directly in a new tab:
    if (this.isImageFile(filePath) || this.isPdfFile(filePath) || /\.(txt|html|svg)$/.test(clean)) {
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // For Office files (Word .doc, .docx, Excel, PowerPoint):
    // If running on a public domain (like steeldoorapi.ufstech.in), Office Online Viewer works directly.
    // If running on localhost/internal network, Microsoft servers cannot reach localhost, so we download and inform the user.
    const isLocalhost = fullUrl.includes('localhost') || fullUrl.includes('127.0.0.1');
    if (this.isOfficeDocument(filePath) && !isLocalhost) {
      const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}`;
      window.open(officeViewerUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Localhost Office doc or browser unsupported doc:
      // Browsers do not have a built-in DOCX renderer, so open it directly or download it
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      this.toastService.info('Word documents (.docx) cannot be viewed inside local offline servers. Opening / downloading document.');
    }
  }

  downloadFile(filePath: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const fullUrl = this.getFullFileUrl(filePath);
    const filename = this.getDocumentName(filePath) || 'download';
    
    // Fetch and download as blob to trigger automatic browser download prompt
    fetch(fullUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network error');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      })
      .catch(() => {
        // Fallback open in new window/tab
        window.open(fullUrl, '_blank');
      });
  }

  submitNewEnquiry(event: Event): void {
    event.preventDefault();
    if (!this.newClientName || !this.newPhone || !this.newAddress) return;

    this.isSubmitting = true;
    const matchedDist = this.districts.find(d => d.name === this.newDistrict);
    const districtId = matchedDist?.id || 'dist-ekm';

    const u = this.authService.currentUser();
    const roleId = Number(u?.roleId ?? u?.dbRoleId);
    const docs = this.newDocuments();

    const payload: any = {
      name: this.newClientName,
      clientName: this.newClientName,
      mobile: this.newPhone,
      contactPhone: this.newPhone,
      address: this.newAddress,
      notes: this.newNotes || null,
      status: this.newStatus || 'Pending',
      districtId,
      districtName: this.newDistrict,
      area: this.newArea || 'Edapally',
      areaName: this.newArea || 'Edapally',
      documents: docs,
      clientType: 'customer',
      contactEmail: `${this.newClientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      pincode: '682024',
      branchHeadName: this.newHead || 'Rajesh Menon',
      loginRoleId: roleId || (u?.role === 'admin' ? 1 : u?.role === 'coordinator' ? 2 : u?.role === 'branch_head' ? 3 : 4),
      loginId: u?.id || null,
      loginName: u?.name || null,
      doorDetails: {
        doorType: 'Standard Steel Door Installation',
        quantity: 1,
        notes: this.newNotes || '',
        images: docs,
        documents: docs
      }
    };

    this.dataService.createBooking(payload).subscribe({
      next: (created) => {
        const fullBooking: Booking = {
          ...payload,
          id: created?.id || `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          status: (this.newStatus as any) || 'Pending',
          createdAt: created?.createdAt || new Date().toISOString(),
          updatedAt: created?.updatedAt || new Date().toISOString(),
          history: created?.history || [
            {
              id: `hist-${Date.now().toString().slice(-4)}`,
              action: 'Created',
              status: (this.newStatus as any) || 'Pending',
              timestamp: new Date().toISOString(),
              performedBy: 'Admin',
              role: 'admin',
              notes: 'Booking created via New Enquiry modal'
            }
          ]
        };

        this.bookings.update(prev => [fullBooking, ...prev]);
        this.resetEnquiryForm();
        this.isSubmitting = false;
        this.newEnquiryModalOpen.set(false);
        this.toastService.success('Enquiry and booking created successfully!');
      },
      error: () => {
        const localBooking: Booking = {
          id: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          name: this.newClientName,
          clientName: this.newClientName,
          mobile: this.newPhone,
          contactPhone: this.newPhone,
          clientType: 'customer',
          contactEmail: `${this.newClientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
          districtId,
          districtName: this.newDistrict,
          area: this.newArea || 'Edapally',
          areaName: this.newArea || 'Edapally',
          address: this.newAddress,
          notes: this.newNotes,
          pincode: '682024',
          documents: docs,
          doorDetails: {
            doorType: 'Standard Steel Door Installation',
            quantity: 1,
            notes: this.newNotes || '',
            images: docs,
            documents: docs
          },
          status: (this.newStatus as any) || 'Pending',
          branchHeadName: this.newHead || 'Rajesh Menon',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          history: []
        };
        this.bookings.update(prev => [localBooking, ...prev]);
        this.resetEnquiryForm();
        this.isSubmitting = false;
        this.newEnquiryModalOpen.set(false);
        this.toastService.success('Enquiry saved successfully!');
      }
    });
  }

  private resetEnquiryForm(): void {
    this.newClientName = '';
    this.newPhone = '';
    this.newAddress = '';
    this.newNotes = '';
    this.newStatus = 'Pending';
    this.newArea = '';
    this.newDocuments.set([]);
  }

  onNewDistrictSelected(dist: District | null): void {
    if (!dist) return;
    const branchHeadMap: Record<string, string> = {
      'Ernakulam': 'Rajesh Menon',
      'Trivandrum': 'Suresh Kumar',
      'Kozhikode': 'Deepa Chandran',
      'Thrissur': 'Priya Nair',
      'Kannur': 'Manoj Varma'
    };
    if (branchHeadMap[dist.name]) {
      this.newHead = branchHeadMap[dist.name];
    }
    this.newArea = '';
    if (dist.id) {
      this.loadNewDistrictAreas(dist.id);
    }
  }

  loadNewDistrictAreas(districtId: number | string): void {
    this.dataService.getAreasByDistrict(districtId).subscribe({
      next: areas => {
        this.newDistrictAreas.set(areas);
      }
    });
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
