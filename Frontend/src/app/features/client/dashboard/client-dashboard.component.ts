import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { Booking, Client, District } from '../../../core/models';
import { ToastService } from '../../../shared/toast/toast.service';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    StatusChipComponent
  ],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- ============================================================== -->
      <!-- 1. COMPANY LOGIN VIEW (All Dealers, Dealers Bookings, Creation) -->
      <!-- ============================================================== -->
      @if (isCompany()) {
        <div class="space-y-6">
          <!-- Company Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h1 class="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                Dealers & Operations
              </h1>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="activeCompanyTab.set('create-dealer')"
                class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs font-bold shadow-soft transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                <span>+ Onboard New Dealer</span>
              </button>
            </div>
          </div>

          <!-- Company KPI Metrics -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">All Dealers</span>
              <div class="text-2xl sm:text-3xl font-black text-primary">{{ allDealers().length }}</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Orders</span>
              <div class="text-2xl sm:text-3xl font-black text-text">{{ dealerBookings().length }}</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Pending</span>
              <div class="text-2xl sm:text-3xl font-black text-warning">{{ dealerPendingCount() }}</div>
            </div>
            <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Completed</span>
              <div class="text-2xl sm:text-3xl font-black text-success">{{ dealerFinishedCount() }}</div>
            </div>
          </div>

          <!-- Company Navigation Tabs -->
          <div class="flex items-center gap-2 border-b border-border text-xs font-bold">
            <button
              type="button"
              (click)="activeCompanyTab.set('dealers')"
              class="pb-3 px-3 transition-all border-b-2 flex items-center gap-2"
              [ngClass]="activeCompanyTab() === 'dealers'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text'"
            >
              <span>All Dealers ({{ allDealers().length }})</span>
            </button>

            <button
              type="button"
              (click)="activeCompanyTab.set('bookings')"
              class="pb-3 px-3 transition-all border-b-2 flex items-center gap-2"
              [ngClass]="activeCompanyTab() === 'bookings'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text'"
            >
              <span>Dealers Bookings ({{ dealerBookings().length }})</span>
            </button>

            <button
              type="button"
              (click)="activeCompanyTab.set('create-dealer')"
              class="pb-3 px-3 transition-all border-b-2 flex items-center gap-2"
              [ngClass]="activeCompanyTab() === 'create-dealer'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text'"
            >
              <span>+ Create Dealer</span>
            </button>
          </div>

          <!-- 1A. ALL DEALERS TAB (Worksheet Table) -->
          @if (activeCompanyTab() === 'dealers') {
            <div class="space-y-4 animate-fadeIn">
              <!-- Filter & Search Bar -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border-2 border-border shadow-xs">
                <div class="relative w-full sm:w-80">
                  <input
                    type="text"
                    [(ngModel)]="dealerSearchQuery"
                    placeholder="Search dealers by name, area or district..."
                    class="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                  <svg class="w-4 h-4 text-text-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>

                <button
                  type="button"
                  (click)="printWorksheet()"
                  class="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
                  title="Print or export dealers worksheet"
                >
                  <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  <span>Print Worksheet</span>
                </button>
              </div>

              <!-- Dealers Worksheet Table -->
              <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                        <th class="py-4 px-4">Dealership Name</th>
                        <th class="py-4 px-4">Contact Person</th>
                        <th class="py-4 px-4">Phone</th>
                        <th class="py-4 px-4">Email</th>
                        <th class="py-4 px-4">Area / Town</th>
                        <th class="py-4 px-4">District Hub</th>
                        <th class="py-4 px-4 text-center">Bookings</th>
                        <th class="py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                      @for (d of filteredDealers(); track d.id; let idx = $index) {
                        <tr
                          class="transition-colors"
                          [ngClass]="idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60' : 'bg-surface-muted/30 hover:bg-surface-muted/60'"
                        >
                          <td class="py-4 px-4 font-black text-text">{{ d.name }}</td>
                          <td class="py-4 px-4 text-text font-semibold">{{ d.contactPerson }}</td>
                          <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ d.phone }}</td>
                          <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ d.email }}</td>
                          <td class="py-4 px-4 font-semibold text-text">{{ d.area }}</td>
                          <td class="py-4 px-4 text-text-muted">{{ getDistrictName(d.districtId) }}</td>
                          <td class="py-4 px-4 text-center">
                            <span class="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-black text-xs">
                              {{ getDealerBookingsCount(d.name) }}
                            </span>
                          </td>
                          <td class="py-4 px-4 text-right">
                            <button
                              type="button"
                              (click)="filterByDealer(d.name)"
                              class="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-text-inverted text-xs font-bold transition-all cursor-pointer"
                            >
                              View Orders →
                            </button>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="8" class="p-8 text-center text-text-muted">
                            No dealers match the search query.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- 1B. DEALERS BOOKINGS TAB (Worksheet Table) -->
          @if (activeCompanyTab() === 'bookings') {
            <div class="space-y-4 animate-fadeIn">
              <!-- Filter Controls Toolbar -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border-2 border-border shadow-xs">
                <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
                  @for (tab of bookingStatusTabs; track tab.val) {
                    <button
                      type="button"
                      (click)="activeStatusFilter.set(tab.val)"
                      class="px-3 py-1.5 rounded-xl border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                      [ngClass]="activeStatusFilter() === tab.val
                        ? 'bg-primary text-text-inverted border-primary shadow-xs'
                        : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-primary/40'"
                    >
                      {{ tab.label }}
                    </button>
                  }
                </div>

                <div class="flex items-center gap-3">
                  <div class="relative w-full sm:w-64">
                    <input
                      type="text"
                      [(ngModel)]="bookingSearchQuery"
                      placeholder="Search dealer or order ID..."
                      class="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                    />
                    <svg class="w-4 h-4 text-text-muted absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>

                  <button
                    type="button"
                    (click)="printWorksheet()"
                    class="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    title="Print worksheet"
                  >
                    <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                    </svg>
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <!-- Bookings Worksheet Table -->
              <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                        <th class="py-4 px-4">Order ID</th>
                        <th class="py-4 px-4">Dealer / Client</th>
                        <th class="py-4 px-4">Door Model</th>
                        <th class="py-4 px-4 text-center">Qty</th>
                        <th class="py-4 px-4">Location / Town</th>
                        <th class="py-4 px-4">District Hub</th>
                        <th class="py-4 px-4">Order Date</th>
                        <th class="py-4 px-4">Scheduled Date</th>
                        <th class="py-4 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                      @for (b of filteredDealerBookings(); track b.id; let idx = $index) {
                        <tr
                          class="transition-colors"
                          [ngClass]="idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60' : 'bg-surface-muted/30 hover:bg-surface-muted/60'"
                        >
                          <td class="py-4 px-4 font-mono font-black text-primary">#{{ b.id }}</td>
                          <td class="py-4 px-4 font-bold text-text">{{ b.clientName }}</td>
                          <td class="py-4 px-4 font-bold text-text">{{ b.doorDetails.doorType }}</td>
                          <td class="py-4 px-4 text-center">
                            <span class="inline-block px-2.5 py-1 rounded-md bg-surface-muted border border-border font-black text-xs">
                              {{ b.doorDetails.quantity }}
                            </span>
                          </td>
                          <td class="py-4 px-4 font-semibold text-text">{{ b.area }}</td>
                          <td class="py-4 px-4 text-text-muted">{{ b.districtName }}</td>
                          <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ formatDate(b.createdAt) }}</td>
                          <td class="py-4 px-4 font-mono text-xs">
                            @if (b.scheduledDate) {
                              <span class="text-status-scheduled font-bold">{{ formatDate(b.scheduledDate) }}</span>
                            } @else {
                              <span class="text-text-muted italic">Pending</span>
                            }
                          </td>
                          <td class="py-4 px-4">
                            <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="sm"></app-status-chip>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="9" class="p-8 text-center text-text-muted">
                            No orders match the current filter.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          }

          <!-- 1C. DEALERS CREATION TAB -->
          @if (activeCompanyTab() === 'create-dealer') {
            <div class="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-surface border-2 border-border shadow-card space-y-6 animate-fadeIn">
              <div class="border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h2 class="text-xl sm:text-2xl font-black text-text">Onboard New Dealer</h2>
                  <p class="text-xs text-text-muted mt-0.5">Register a new authorized steel door dealership with operational portal access.</p>
                </div>
                <button
                  type="button"
                  (click)="activeCompanyTab.set('dealers')"
                  class="text-xs font-bold text-text-muted hover:text-text px-3 py-1.5 rounded-xl border border-border hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  ← Back to Ledger
                </button>
              </div>

              <form [formGroup]="dealerForm" (ngSubmit)="onCreateDealer()" class="space-y-5">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-text">Dealership Business Name <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      formControlName="name"
                      placeholder="e.g., Apex Hardware & Steel Depot"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-text">Contact Person / Manager <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      formControlName="contactPerson"
                      placeholder="e.g., Manoj Kumar"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-text">Contact Phone <span class="text-danger">*</span></label>
                    <input
                      type="tel"
                      formControlName="phone"
                      placeholder="e.g., +91 94470 12345"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-text">Official Email Address <span class="text-danger">*</span></label>
                    <input
                      type="email"
                      formControlName="email"
                      placeholder="e.g., orders@apexdealer.in"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-text">Assigned District Hub <span class="text-danger">*</span></label>
                    <select
                      formControlName="districtId"
                      (change)="onDistrictChange()"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    >
                      <option value="">-- Choose District Hub --</option>
                      @for (d of districts(); track d.id) {
                        <option [value]="d.id">{{ d.name }} District</option>
                      }
                    </select>
                  </div>

                  <div class="space-y-1.5">
                    <label class="block text-xs font-bold text-text">Area / Town <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      formControlName="area"
                      placeholder="e.g., Edapally, Aluva, etc."
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-text">Dealership Physical Address <span class="text-danger">*</span></label>
                    <input
                      type="text"
                      formControlName="address"
                      placeholder="Shop No. 12, Main Commercial Road..."
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>

                  <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-xs font-bold text-text">Dealer License or GSTIN (Optional)</label>
                    <input
                      type="text"
                      formControlName="dealerLicense"
                      placeholder="e.g., 32AAACA1234A1Z5 or DLR-KL-881"
                      class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>
                </div>

                <!-- Account Credentials for Dealer Login -->
                <div class="pt-5 border-t border-border space-y-3">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black uppercase tracking-wider text-primary block">Portal Login Credentials</span>
                    <span class="text-[11px] text-text-muted">Dealer will use these to log into the Dealership Orders portal</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-text">Login Username <span class="text-danger">*</span></label>
                      <input
                        type="text"
                        formControlName="username"
                        placeholder="e.g., apex_dealer"
                        class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-mono font-medium"
                      />
                    </div>
                    <div class="space-y-1.5">
                      <label class="block text-xs font-bold text-text">Initial Account Password <span class="text-danger">*</span></label>
                      <input
                        type="password"
                        formControlName="password"
                        placeholder="e.g., dealer123"
                        class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div class="pt-5 border-t border-border flex items-center justify-end gap-3">
                  <button
                    type="button"
                    (click)="activeCompanyTab.set('dealers')"
                    class="px-5 py-2.5 rounded-xl border border-border text-xs font-bold text-text-muted hover:text-text hover:bg-surface-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="dealerForm.invalid || isSubmittingDealer()"
                    class="px-7 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-black shadow-soft transition-all flex items-center gap-2 cursor-pointer"
                  >
                    @if (isSubmittingDealer()) {
                      <span>Saving & Onboarding...</span>
                    } @else {
                      <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span>Complete Dealer Onboarding</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      }

      <!-- ============================================================== -->
      <!-- 2. DEALER LOGIN VIEW (Direct Worksheet Table Ledger)           -->
      <!-- ============================================================== -->
      @else if (isDealer()) {
        <div class="space-y-6">
          <!-- Dealer Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-text tracking-tight">
                Dealership Orders Worksheet
              </h1>
              <p class="text-xs sm:text-sm text-text-muted mt-0.5 font-medium">
                Live worksheet ledger for door orders, schedules, and fittings.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <a
                routerLink="/book-now"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs sm:text-sm font-bold shadow-soft transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                <span>+ New Order</span>
              </a>
            </div>
          </div>

          <!-- Clean KPI Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Orders</span>
              <div class="text-3xl font-black text-primary">{{ myDealerBookings().length }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Pending</span>
              <div class="text-3xl font-black text-warning">{{ countByStatus(myDealerBookings(), 'Pending') }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Scheduled</span>
              <div class="text-3xl font-black text-status-scheduled">{{ countByStatus(myDealerBookings(), 'Scheduled') }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Completed</span>
              <div class="text-3xl font-black text-success">{{ countByStatus(myDealerBookings(), 'Finished') }}</div>
            </div>
          </div>

          <!-- Full Spreadsheet / Ledger Table Section -->
          <div class="space-y-4 animate-fadeIn">
            <!-- Table Toolbar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border-2 border-border shadow-xs">
              <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
                @for (tab of dealerFilterTabs; track tab.val) {
                  <button
                    type="button"
                    (click)="dealerActiveStatus.set(tab.val)"
                    class="px-3.5 py-2 rounded-xl border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
                    [ngClass]="dealerActiveStatus() === tab.val
                      ? 'bg-primary text-text-inverted border-primary shadow-xs'
                      : 'bg-surface border-border text-text hover:bg-surface-muted hover:border-primary/40'"
                  >
                    <span>{{ tab.label }}</span>
                    <span class="px-2 py-0.5 rounded-md text-[11px] font-black"
                      [ngClass]="dealerActiveStatus() === tab.val ? 'bg-text-inverted/20 text-text-inverted' : 'bg-surface-muted text-text-muted'">
                      {{ getDealerTabCount(tab.val) }}
                    </span>
                  </button>
                }
              </div>

              <div class="flex items-center gap-3">
                <div class="relative w-full sm:w-64">
                  <input
                    type="text"
                    [ngModel]="dealerOrderSearch()"
                    (ngModelChange)="dealerOrderSearch.set($event)"
                    placeholder="Search worksheet..."
                    class="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                  />
                  <svg class="w-4 h-4 text-text-muted absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>

                <button
                  type="button"
                  (click)="printWorksheet()"
                  class="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  title="Print or export worksheet"
                >
                  <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  <span>Print Worksheet</span>
                </button>
              </div>
            </div>

            <!-- Full Spreadsheet / Ledger Table -->
            <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                      <th class="py-4 px-4">Order ID</th>
                      <th class="py-4 px-4">Door Model</th>
                      <th class="py-4 px-4 text-center">Qty</th>
                      <th class="py-4 px-4">Location / Town</th>
                      <th class="py-4 px-4">District Hub</th>
                      <th class="py-4 px-4">Order Date</th>
                      <th class="py-4 px-4">Scheduled Date</th>
                      <th class="py-4 px-4">Status</th>
                      <th class="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                    @for (b of filteredMyDealerBookings(); track b.id; let idx = $index) {
                      <tr
                        (click)="selectedBooking.set(b)"
                        class="cursor-pointer transition-colors"
                        [ngClass]="selectedBooking()?.id === b.id
                          ? 'bg-primary/10 font-bold border-l-[8px] border-l-primary'
                          : (idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60 border-l-[8px] border-l-transparent' : 'bg-surface-muted/30 hover:bg-surface-muted/60 border-l-[8px] border-l-transparent')"
                      >
                        <td class="py-4 px-4 font-mono font-black text-primary">#{{ b.id }}</td>
                        <td class="py-4 px-4 font-bold text-text">{{ b.doorDetails.doorType }}</td>
                        <td class="py-4 px-4 text-center">
                          <span class="inline-block px-2.5 py-1 rounded-md bg-surface-muted border border-border font-black text-xs">
                            {{ b.doorDetails.quantity }}
                          </span>
                        </td>
                        <td class="py-4 px-4 text-text font-semibold">{{ b.area }}</td>
                        <td class="py-4 px-4 text-text-muted">{{ b.districtName }}</td>
                        <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ formatDate(b.createdAt) }}</td>
                        <td class="py-4 px-4 font-mono text-xs">
                          @if (b.scheduledDate) {
                            <span class="text-status-scheduled font-bold">{{ formatDate(b.scheduledDate) }}</span>
                          } @else {
                            <span class="text-text-muted italic">Pending</span>
                          }
                        </td>
                        <td class="py-4 px-4">
                          <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="sm"></app-status-chip>
                        </td>
                        <td class="py-4 px-4 text-right">
                          <button
                            type="button"
                            (click)="selectedBooking.set(b); $event.stopPropagation()"
                            class="px-3 py-1.5 rounded-lg border border-border text-xs font-bold transition-all cursor-pointer"
                            [ngClass]="selectedBooking()?.id === b.id ? 'bg-primary text-text-inverted' : 'bg-surface hover:bg-surface-muted text-text'"
                          >
                            {{ selectedBooking()?.id === b.id ? 'Viewing' : 'Inspect' }}
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="9" class="p-8 text-center text-text-muted">
                          No orders match the current filter.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Full Selected Order Details Drawer below the worksheet table -->
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
                      <span class="text-xs text-text-muted font-medium">Selected Order Details</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border text-text font-black text-xs sm:text-sm">
                      {{ b.doorDetails.quantity }} Unit(s)
                    </span>
                    <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="lg"></app-status-chip>
                  </div>
                </div>

                <!-- Scheduled Date Banner if present -->
                @if (b.scheduledDate) {
                  <div class="p-4 rounded-2xl bg-status-scheduled/10 border-2 border-status-scheduled/30 flex items-center justify-between">
                    <div>
                      <span class="font-black text-status-scheduled text-xs uppercase tracking-wider block">Scheduled Installation</span>
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

                <!-- Clean Order Specifications Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 rounded-2xl bg-background border border-border text-xs sm:text-sm">
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Brand</span>
                    <strong class="text-text font-black text-sm sm:text-base">{{ b.doorDetails.brand || 'Tata Pravesh' }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Door Model</span>
                    <strong class="text-text font-black text-sm sm:text-base">{{ b.doorDetails.doorType }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Quantity</span>
                    <strong class="text-primary font-black text-sm sm:text-base">{{ b.doorDetails.quantity }} Unit(s)</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Delivery Town</span>
                    <strong class="text-text font-black">{{ b.area }}, {{ b.districtName }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Assigned Branch Hub</span>
                    <strong class="text-text font-black">{{ b.branchHeadName || b.districtName + ' Hub' }}</strong>
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
      }

      <!-- ============================================================== -->
      <!-- 3. CUSTOMER LOGIN VIEW (Worksheet Table Format)               -->
      <!-- ============================================================== -->
      @else {
        <div class="space-y-6">
          <!-- Customer Welcome Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <h1 class="text-2xl sm:text-3xl font-black text-text tracking-tight">
                My Orders Worksheet
              </h1>
              <p class="text-xs sm:text-sm text-text-muted mt-0.5 font-medium">
                Live worksheet ledger for your door installation orders and schedules.
              </p>
            </div>

            <a
              routerLink="/book-now"
              class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs sm:text-sm font-bold shadow-soft transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              <span>+ Book a Door</span>
            </a>
          </div>

          <!-- Customer Clean Summary Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Orders</span>
              <div class="text-3xl font-black text-primary">{{ myCustomerBookings().length }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">In Progress</span>
              <div class="text-3xl font-black text-status-scheduled">{{ customerInProgressCount() }}</div>
            </div>
            <div class="p-5 rounded-2xl bg-surface border border-border shadow-soft space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Completed</span>
              <div class="text-3xl font-black text-success">{{ countByStatus(myCustomerBookings(), 'Finished') }}</div>
            </div>
          </div>

          <!-- Customer Worksheet Table Section -->
          <div class="space-y-4 animate-fadeIn">
            <!-- Table Toolbar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface border-2 border-border shadow-xs">
              <div class="relative w-full sm:w-80">
                <input
                  type="text"
                  [ngModel]="customerOrderSearch()"
                  (ngModelChange)="customerOrderSearch.set($event)"
                  placeholder="Search order ID, model, area..."
                  class="w-full text-xs sm:text-sm pl-8 pr-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
                <svg class="w-4 h-4 text-text-muted absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              <button
                type="button"
                (click)="printWorksheet()"
                class="px-3.5 py-2 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
                title="Print worksheet"
              >
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                <span>Print Worksheet</span>
              </button>
            </div>

            <!-- Customer Orders Worksheet Table -->
            <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                      <th class="py-4 px-4">Order ID</th>
                      <th class="py-4 px-4">Door Model</th>
                      <th class="py-4 px-4 text-center">Qty</th>
                      <th class="py-4 px-4">Installation Area</th>
                      <th class="py-4 px-4">District Branch</th>
                      <th class="py-4 px-4">Booking Date</th>
                      <th class="py-4 px-4">Scheduled Date</th>
                      <th class="py-4 px-4">Status</th>
                      <th class="py-4 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                    @for (b of filteredMyCustomerBookings(); track b.id; let idx = $index) {
                      <tr
                        (click)="selectedBooking.set(b)"
                        class="cursor-pointer transition-colors"
                        [ngClass]="selectedBooking()?.id === b.id
                          ? 'bg-primary/10 font-bold border-l-[8px] border-l-primary'
                          : (idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60 border-l-[8px] border-l-transparent' : 'bg-surface-muted/30 hover:bg-surface-muted/60 border-l-[8px] border-l-transparent')"
                      >
                        <td class="py-4 px-4 font-mono font-black text-primary">#{{ b.id }}</td>
                        <td class="py-4 px-4 font-bold text-text">{{ b.doorDetails.doorType }}</td>
                        <td class="py-4 px-4 text-center">
                          <span class="inline-block px-2.5 py-1 rounded-md bg-surface-muted border border-border font-black text-xs">
                            {{ b.doorDetails.quantity }}
                          </span>
                        </td>
                        <td class="py-4 px-4 text-text font-semibold">{{ b.area }}</td>
                        <td class="py-4 px-4 text-text-muted">{{ b.districtName }}</td>
                        <td class="py-4 px-4 text-text-muted font-mono text-xs">{{ formatDate(b.createdAt) }}</td>
                        <td class="py-4 px-4 font-mono text-xs">
                          @if (b.scheduledDate) {
                            <span class="text-status-scheduled font-bold">{{ formatDate(b.scheduledDate) }}</span>
                          } @else {
                            <span class="text-text-muted italic">Pending</span>
                          }
                        </td>
                        <td class="py-4 px-4">
                          <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="sm"></app-status-chip>
                        </td>
                        <td class="py-4 px-4 text-right">
                          <button
                            type="button"
                            (click)="selectedBooking.set(b); $event.stopPropagation()"
                            class="px-3 py-1.5 rounded-lg border border-border text-xs font-bold transition-all cursor-pointer"
                            [ngClass]="selectedBooking()?.id === b.id ? 'bg-primary text-text-inverted' : 'bg-surface hover:bg-surface-muted text-text'"
                          >
                            {{ selectedBooking()?.id === b.id ? 'Viewing' : 'Inspect' }}
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="9" class="p-8 text-center text-text-muted">
                          You haven't placed any steel door installation orders yet.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Full Selected Order Details Drawer below table for Customer -->
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
                      <span class="text-xs text-text-muted font-medium">Order Specifications & Status</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="px-3.5 py-1.5 rounded-xl bg-surface-muted border border-border text-text font-black text-xs sm:text-sm">
                      {{ b.doorDetails.quantity }} Unit(s)
                    </span>
                    <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="lg"></app-status-chip>
                  </div>
                </div>

                <!-- Rejection Notice if any -->
                @if (b.status === 'Rejected') {
                  <div class="p-4 rounded-2xl bg-status-rejected/10 border-2 border-status-rejected/30 text-xs sm:text-sm space-y-1">
                    <div class="font-black text-status-rejected uppercase text-xs">Fitting Request Rejected</div>
                    <p class="text-text font-medium">{{ b.rejectionReason }}</p>
                  </div>
                }

                <!-- Scheduled Date Banner -->
                @if (b.scheduledDate) {
                  <div class="p-4 rounded-2xl bg-status-scheduled/10 border-2 border-status-scheduled/30 flex items-center justify-between">
                    <div>
                      <span class="font-black text-status-scheduled text-xs uppercase tracking-wider block">Scheduled Installation Date</span>
                      <strong class="text-base text-text font-black">{{ formatFullDate(b.scheduledDate) }}</strong>
                    </div>
                    <span class="text-status-scheduled text-xs font-black px-3.5 py-1.5 rounded-xl bg-surface shadow-xs border border-status-scheduled/30">
                      Crew Dispatched
                    </span>
                  </div>
                }

                <!-- 4-Step Progress Stepper -->
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
                      <span class="block font-bold text-xs" [ngClass]="getStepTextClass(b, 2)">Confirmed</span>
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

                <!-- Clean Order Specifications Grid -->
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 p-5 rounded-2xl bg-background border border-border text-xs sm:text-sm">
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Brand</span>
                    <strong class="text-text font-black text-sm sm:text-base">{{ b.doorDetails.brand || 'Tata Pravesh' }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Door Model</span>
                    <strong class="text-text font-black text-sm sm:text-base">{{ b.doorDetails.doorType }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Units</span>
                    <strong class="text-primary font-black text-sm sm:text-base">{{ b.doorDetails.quantity }} Unit(s)</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">Installation Address</span>
                    <strong class="text-text font-black">{{ b.address }}, {{ b.area }}</strong>
                  </div>
                  <div>
                    <span class="text-text-muted block text-xs font-bold uppercase tracking-wider">District Branch</span>
                    <strong class="text-text font-black">{{ b.districtName }} Hub</strong>
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
      }
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private dataService = inject(DataService);
  private titleService = inject(Title);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  // User Type Identification
  isCompany = computed(() => this.auth.currentUser()?.clientType === 'company');
  isDealer = computed(() => this.auth.currentUser()?.clientType === 'dealer');
  isCustomer = computed(() => !this.isCompany() && !this.isDealer());

  // Company State
  activeCompanyTab = signal<'dealers' | 'bookings' | 'create-dealer'>('dealers');
  allDealers = signal<Client[]>([]);
  dealerBookings = signal<Booking[]>([]);
  dealerSearchQuery = '';
  bookingSearchQuery = '';
  activeStatusFilter = signal('');
  isSubmittingDealer = signal(false);

  // Dealer State
  myDealerBookings = signal<Booking[]>([]);
  dealerActiveStatus = signal('');
  dealerViewMode = signal<'cards' | 'worksheet'>('cards');
  dealerOrderSearch = signal('');

  // Customer State
  myCustomerBookings = signal<Booking[]>([]);
  customerOrderSearch = signal('');
  selectedBooking = signal<Booking | null>(null);

  // Metadata
  districts = signal<District[]>([]);

  // Status Tabs
  bookingStatusTabs = [
    { label: 'All Orders', val: '' },
    { label: 'Pending', val: 'Pending' },
    { label: 'Accepted', val: 'Accepted' },
    { label: 'Scheduled', val: 'Scheduled' },
    { label: 'Finished', val: 'Finished' },
    { label: 'Rejected', val: 'Rejected' }
  ];

  dealerFilterTabs = [
    { label: 'All Orders', val: '' },
    { label: 'Pending', val: 'Pending' },
    { label: 'Scheduled', val: 'Scheduled' },
    { label: 'Finished', val: 'Finished' },
    { label: 'Rejected', val: 'Rejected' }
  ];

  dealerForm!: FormGroup;

  customerInProgressCount = computed(() => {
    return this.myCustomerBookings().filter(b => b.status === 'Pending' || b.status === 'Accepted' || b.status === 'Scheduled').length;
  });

  // Filtered lists
  filteredDealers = computed(() => {
    const q = this.dealerSearchQuery.toLowerCase().trim();
    if (!q) return this.allDealers();
    return this.allDealers().filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        (d.contactPerson && d.contactPerson.toLowerCase().includes(q)) ||
        d.area.toLowerCase().includes(q) ||
        (d.dealerLicense && d.dealerLicense.toLowerCase().includes(q))
    );
  });

  filteredDealerBookings = computed(() => {
    const st = this.activeStatusFilter();
    const q = this.bookingSearchQuery.toLowerCase().trim();
    return this.dealerBookings().filter(b => {
      if (st && b.status !== st) return false;
      if (q) {
        return (
          b.id.toLowerCase().includes(q) ||
          b.clientName.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  filteredMyDealerBookings = computed(() => {
    const st = this.dealerActiveStatus();
    const q = this.dealerOrderSearch().toLowerCase().trim();
    return this.myDealerBookings().filter(b => {
      if (st && b.status !== st) return false;
      if (q) {
        return (
          b.id.toLowerCase().includes(q) ||
          b.doorDetails.doorType.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.districtName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  filteredMyCustomerBookings = computed(() => {
    const q = this.customerOrderSearch().toLowerCase().trim();
    return this.myCustomerBookings().filter(b => {
      if (q) {
        return (
          b.id.toLowerCase().includes(q) ||
          b.doorDetails.doorType.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.districtName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  });

  dealerPendingCount = computed(() => {
    return this.dealerBookings().filter(b => b.status === 'Pending').length;
  });

  dealerFinishedCount = computed(() => {
    return this.dealerBookings().filter(b => b.status === 'Finished').length;
  });

  getDealerTabCount(statusVal: string): number {
    if (!statusVal) return this.myDealerBookings().length;
    return this.myDealerBookings().filter(b => b.status === statusVal).length;
  }

  printWorksheet(): void {
    window.print();
  }

  ngOnInit(): void {
    const user = this.auth.currentUser();
    const clientType = user?.clientType || 'customer';

    if (clientType === 'company') {
      this.titleService.setTitle('Dealers & Operations | SteelGuard');
      this.loadCompanyData();
    } else if (clientType === 'dealer') {
      this.titleService.setTitle('Dealership Orders | SteelGuard');
      this.loadDealerData();
    } else {
      this.titleService.setTitle('My Orders | SteelGuard');
      this.loadCustomerData();
    }

    this.initDealerForm();
    this.dataService.getDistricts().subscribe(dist => this.districts.set(dist));
  }

  isStepComplete(b: Booking, step: number): boolean {
    if (b.status === 'Rejected') return step === 1;
    if (b.status === 'Finished') return true;
    if (b.status === 'Scheduled') return step <= 3;
    if (b.status === 'Accepted') return step <= 2;
    return step === 1;
  }

  getStepClass(b: Booking, step: number): string {
    if (b.status === 'Rejected') {
      if (step === 1) return 'bg-success text-text-inverted';
      if (step === 2) return 'bg-danger text-text-inverted';
      return 'bg-surface-muted text-text-muted';
    }
    const complete = this.isStepComplete(b, step);
    if (complete) return 'bg-primary text-text-inverted shadow-xs';
    return 'bg-surface-muted text-text-muted border border-border';
  }

  getStepTextClass(b: Booking, step: number): string {
    if (b.status === 'Rejected' && step === 2) return 'text-danger font-bold';
    const complete = this.isStepComplete(b, step);
    return complete ? 'text-primary font-bold' : 'text-text-muted';
  }

  private initDealerForm(): void {
    this.dealerForm = this.fb.group({
      name: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      districtId: ['', Validators.required],
      area: ['', Validators.required],
      address: ['', Validators.required],
      dealerLicense: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  private loadCompanyData(): void {
    this.dataService.getClients().subscribe(clients => {
      const dealers = clients.filter(c => c.clientType === 'dealer');
      this.allDealers.set(dealers);
    });

    this.dataService.getBookings({ clientType: 'dealer' }).subscribe(bookings => {
      this.dealerBookings.set(bookings);
    });
  }

  private loadDealerData(): void {
    const user = this.auth.currentUser();
    const clientId = user?.clientId;

    this.dataService.getBookings({ clientType: 'dealer' }).subscribe(list => {
      let myOrders = list;
      if (clientId) {
        myOrders = list.filter(b => b.clientId === clientId || b.clientName.toLowerCase() === user?.name.toLowerCase());
      }
      this.myDealerBookings.set(myOrders);
      if (myOrders.length > 0) {
        this.selectedBooking.set(myOrders[0]);
      }
    });
  }

  private loadCustomerData(): void {
    const user = this.auth.currentUser();
    const clientId = user?.clientId;

    this.dataService.getBookings({ clientId }).subscribe(list => {
      let filtered = list;
      if (user && !clientId) {
        filtered = list.filter(b => b.clientName.toLowerCase() === user.name.toLowerCase());
      }
      this.myCustomerBookings.set(filtered);
      if (filtered.length > 0) {
        this.selectedBooking.set(filtered[0]);
      }
    });
  }

  onDistrictChange(): void {
    const distId = this.dealerForm.get('districtId')?.value;
    const district = this.districts().find(d => d.id === distId);
    if (district && district.areas && district.areas.length > 0) {
      this.dealerForm.patchValue({ area: district.areas[0] });
    }
  }

  getDistrictName(districtId: string): string {
    const dist = this.districts().find(d => d.id === districtId);
    return dist ? dist.name : districtId.replace('dist-', '').toUpperCase();
  }

  getDealerBookingsCount(dealerName: string): number {
    return this.dealerBookings().filter(b => b.clientName.toLowerCase() === dealerName.toLowerCase()).length;
  }

  filterByDealer(dealerName: string): void {
    this.activeCompanyTab.set('bookings');
    this.bookingSearchQuery = dealerName;
  }

  countByStatus(list: Booking[], status: string): number {
    return list.filter(b => b.status === status).length;
  }

  onCreateDealer(): void {
    if (this.dealerForm.invalid) {
      this.dealerForm.markAllAsTouched();
      this.toast.error('Please fill in all required fields marked with *');
      return;
    }

    this.isSubmittingDealer.set(true);
    const val = this.dealerForm.value;

    const dealerPayload: Partial<Client> = {
      name: val.name?.trim(),
      contactPerson: val.contactPerson?.trim(),
      phone: val.phone?.trim(),
      email: val.email?.trim(),
      districtId: val.districtId,
      area: val.area?.trim(),
      address: val.address?.trim(),
      dealerLicense: val.dealerLicense?.trim() || undefined,
      clientType: 'dealer'
    };

    const credentials = {
      username: val.username.trim(),
      password: val.password
    };

    this.dataService.createClient(dealerPayload, credentials).subscribe({
      next: created => {
        this.isSubmittingDealer.set(false);
        this.toast.success(`Dealer "${created.name}" onboarded successfully! Login credentials saved.`);
        
        // Update local signal list
        this.allDealers.update(prev => {
          const exists = prev.some(d => d.id === created.id || d.name.toLowerCase() === created.name.toLowerCase());
          return exists ? prev : [created, ...prev];
        });

        this.dealerForm.reset();
        this.initDealerForm();
        this.activeCompanyTab.set('dealers');
        this.loadCompanyData();
      },
      error: err => {
        this.isSubmittingDealer.set(false);
        this.toast.error(err?.error?.error || 'Failed to onboard dealer. Please verify fields.');
      }
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
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
