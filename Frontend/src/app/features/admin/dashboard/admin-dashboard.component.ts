import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { Booking, BranchHead, District } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';
import { SimpleChartComponent, ChartDatum } from '../../../shared/components/simple-chart.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent, SimpleChartComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Title & Quick Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-text tracking-tight">
            Admin Overview
          </h1>
        </div>

        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/bookings/new"
            class="h-11 px-5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs sm:text-sm font-bold shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>+ Create Booking</span>
          </a>
        </div>
      </div>

      <!-- KPI METRIC CARDS (Clean, Clear, Main Numbers Only) -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <!-- 1. Total Orders -->
        <div class="p-5 rounded-2xl bg-surface border border-border shadow-card hover:shadow-elevated transition-all space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-text-muted">Total Orders</span>
            <div class="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-text tracking-tight">{{ totalCount }}</div>
        </div>

        <!-- 2. Pending Review -->
        <div class="p-5 rounded-2xl bg-surface border border-amber-200/80 shadow-card hover:shadow-elevated transition-all space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Pending</span>
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">{{ pendingCount }}</div>
        </div>

        <!-- 3. Delayed Alerts -->
        <div class="p-5 rounded-2xl bg-surface border border-orange-300 ring-1 ring-orange-100 shadow-card hover:shadow-elevated transition-all space-y-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-orange-600">Delayed</span>
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
            </div>
            <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-orange-600 tracking-tight">{{ delayedCount }}</div>
        </div>

        <!-- 4. Rejected Orders -->
        <div class="p-5 rounded-2xl bg-surface border border-red-200 ring-1 ring-red-100 shadow-card hover:shadow-elevated transition-all space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-red-600">Rejected</span>
            <div class="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">{{ rejectedCount }}</div>
        </div>

        <!-- 5. Completed -->
        <div class="col-span-2 lg:col-span-1 p-5 rounded-2xl bg-surface border border-emerald-200 ring-1 ring-emerald-100 shadow-card hover:shadow-elevated transition-all space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-emerald-700">Completed</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">{{ finishedCount }}</div>
        </div>
      </div>

      <!-- CHARTS SECTION -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Status Breakdown -->
        <div class="lg:col-span-6 p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-sm font-bold text-text">Order Status Distribution</h3>
            <span class="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
              {{ totalCount }} Orders
            </span>
          </div>
          <app-simple-chart type="donut" [data]="statusChartData"></app-simple-chart>
        </div>

        <!-- District Distribution -->
        <div class="lg:col-span-6 p-6 rounded-3xl bg-surface border border-border shadow-card space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-3">
            <h3 class="text-sm font-bold text-text">Orders by District</h3>
            <span class="text-xs font-mono font-bold text-accent-dark px-2.5 py-1 rounded-full bg-accent/15">
              Districts
            </span>
          </div>
          <app-simple-chart type="bar" [data]="districtChartData"></app-simple-chart>
        </div>
      </div>

      <!-- RECENT BOOKINGS WORKSHEET TABLE -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base sm:text-lg font-black text-text">Recent Orders Worksheet</h3>
            <p class="text-xs text-text-muted">Live snapshot of the newest door bookings across all district hubs.</p>
          </div>
          <a
            routerLink="/admin/bookings"
            class="h-10 px-4 rounded-xl bg-primary text-text-inverted text-xs font-bold hover:bg-primary-hover shadow-soft transition-all flex items-center gap-1.5"
          >
            <span>Open Bookings Worksheet</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                  <th class="py-4 px-4">Order ID</th>
                  <th class="py-4 px-4">Client</th>
                  <th class="py-4 px-4">Door Type</th>
                  <th class="py-4 px-4 text-center">Qty</th>
                  <th class="py-4 px-4">Location</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                @for (b of recentBookings; track b.id; let idx = $index) {
                  <tr
                    class="transition-colors hover:bg-surface-muted/60 cursor-pointer"
                    [ngClass]="idx % 2 === 0 ? 'bg-surface' : 'bg-surface-muted/30'"
                    [routerLink]="['/admin/bookings', b.id]"
                  >
                    <td class="py-4 px-4 font-mono font-black text-primary">#{{ b.id }}</td>
                    <td class="py-4 px-4">
                      <div class="font-bold text-text">{{ b.clientName }}</div>
                      <div class="text-[11px] text-text-muted capitalize">{{ b.clientType }}</div>
                    </td>
                    <td class="py-4 px-4 font-bold text-text">{{ b.doorDetails.doorType }}</td>
                    <td class="py-4 px-4 text-center">
                      <span class="inline-block px-2.5 py-1 rounded-md bg-surface-muted border border-border font-black text-xs">
                        {{ b.doorDetails.quantity }}
                      </span>
                    </td>
                    <td class="py-4 px-4">
                      <div class="text-text font-semibold">{{ b.area }}</div>
                      <div class="text-[11px] text-text-muted">{{ b.districtName }} Hub</div>
                    </td>
                    <td class="py-4 px-4">
                      <app-status-chip
                        [status]="b.status"
                        [isDelayed]="b.isDelayed || false"
                        [hoursSinceSubmitted]="b.hoursSinceSubmitted"
                        size="sm"
                      ></app-status-chip>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <a
                        [routerLink]="['/admin/bookings', b.id]"
                        class="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold transition-all shadow-xs inline-block"
                        (click)="$event.stopPropagation()"
                      >
                        Inspect
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private titleService = inject(Title);

  bookings: Booking[] = [];
  districts: District[] = [];
  branchHeads: BranchHead[] = [];

  get totalCount(): number {
    return this.bookings.length;
  }

  get pendingCount(): number {
    return this.bookings.filter(b => b.status === 'Pending' && !b.isDelayed).length;
  }

  get delayedCount(): number {
    return this.bookings.filter(b => b.isDelayed).length;
  }

  get rejectedCount(): number {
    return this.bookings.filter(b => b.status === 'Rejected').length;
  }

  get finishedCount(): number {
    return this.bookings.filter(b => b.status === 'Finished').length;
  }

  get scheduledCount(): number {
    return this.bookings.filter(b => b.status === 'Scheduled').length;
  }

  get acceptedCount(): number {
    return this.bookings.filter(b => b.status === 'Accepted').length;
  }

  get recentBookings(): Booking[] {
    return this.bookings.slice(0, 8);
  }

  get statusChartData(): ChartDatum[] {
    return [
      { label: 'Finished', value: this.finishedCount, colorClass: 'bg-status-finished' },
      { label: 'Scheduled', value: this.scheduledCount, colorClass: 'bg-status-scheduled' },
      { label: 'Accepted', value: this.acceptedCount, colorClass: 'bg-status-accepted' },
      { label: 'Delayed', value: this.delayedCount, colorClass: 'bg-status-delayed' },
      { label: 'Pending', value: this.pendingCount, colorClass: 'bg-status-pending' },
      { label: 'Rejected', value: this.rejectedCount, colorClass: 'bg-status-rejected' }
    ].filter(d => d.value > 0);
  }

  get districtChartData(): ChartDatum[] {
    const counts: Record<string, number> = {};
    this.districts.forEach(d => { counts[d.name] = 0; });

    this.bookings.forEach(b => {
      counts[b.districtName] = (counts[b.districtName] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      label: name,
      value: count,
      colorClass: 'bg-primary'
    }));
  }

  ngOnInit(): void {
    this.titleService.setTitle('Admin Overview | SteelGuard');

    const resolvedBookings = this.route.snapshot.data['bookings'];
    if (resolvedBookings) {
      this.bookings = resolvedBookings;
    } else {
      this.dataService.getBookings().subscribe(b => { this.bookings = b; });
    }

    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts) {
      this.districts = resolvedDistricts;
    } else {
      this.dataService.getDistricts().subscribe(d => { this.districts = d; });
    }
  }
}
