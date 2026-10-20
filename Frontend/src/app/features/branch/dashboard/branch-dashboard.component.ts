import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { Booking } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';

@Component({
  selector: 'app-branch-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Welcome Header -->
      <div class="border-b border-border/80 pb-4">
        <h1 class="text-xl sm:text-2xl font-black text-text">Welcome, {{ auth.currentUser()?.name }}</h1>
      </div>

      <!-- COUNT METRIC CARDS FOR DISTRICT -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Pending Action Required -->
        <div class="p-4 rounded-2xl bg-surface border border-status-pending/30 shadow-soft space-y-1">
          <div class="text-xs font-bold uppercase tracking-wider text-status-pending">Pending</div>
          <div class="text-2xl font-black text-status-pending">{{ pendingCount }}</div>
        </div>

        <!-- Scheduled Fittings -->
        <div class="p-4 rounded-2xl bg-surface border border-status-scheduled/30 shadow-soft space-y-1">
          <div class="text-xs font-bold uppercase tracking-wider text-status-scheduled">Scheduled</div>
          <div class="text-2xl font-black text-status-scheduled">{{ scheduledCount }}</div>
        </div>

        <!-- Active Accepted -->
        <div class="p-4 rounded-2xl bg-surface border border-status-accepted/30 shadow-soft space-y-1">
          <div class="text-xs font-bold uppercase tracking-wider text-status-accepted">Accepted</div>
          <div class="text-2xl font-black text-status-accepted">{{ acceptedCount }}</div>
        </div>

        <!-- Finished & Signed Off -->
        <div class="p-4 rounded-2xl bg-surface border border-status-finished/30 shadow-soft space-y-1">
          <div class="text-xs font-bold uppercase tracking-wider text-status-finished">Finished</div>
          <div class="text-2xl font-black text-status-finished">{{ finishedCount }}</div>
        </div>
      </div>

      <!-- Delayed Urgent Alert if any -->
      @if (delayedCount > 0) {
        <div class="p-4 rounded-2xl bg-status-delayed/10 border border-status-delayed/30 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="w-3 h-3 rounded-full bg-status-delayed animate-ping"></span>
            <div>
              <div class="text-xs font-bold text-status-delayed">{{ delayedCount }} Delayed Requests</div>
              <div class="text-[10px] text-text-muted">>24 hours pending review</div>
            </div>
          </div>
          <a
            routerLink="/branch/bookings"
            [queryParams]="{ status: 'Delayed' }"
            class="px-3 py-1.5 rounded-lg bg-status-delayed text-text-inverted text-[11px] font-bold shadow-soft"
          >
            Review Now
          </a>
        </div>
      }

      <!-- Action Required Worksheet Table -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-sm sm:text-base font-black text-text">Action Required In {{ userDistrictName() }} Hub</h2>
            <p class="text-xs text-text-muted">High priority, pending, and delayed installation jobs requiring attention.</p>
          </div>
          <a
            routerLink="/branch/bookings"
            class="px-4 py-2 rounded-xl bg-primary text-text-inverted text-xs font-bold hover:bg-primary-hover shadow-soft transition-all flex items-center gap-1.5"
          >
            <span>Open District Worksheet</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div class="overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-card">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-muted border-b-2 border-border text-xs uppercase tracking-wider text-text font-black">
                  <th class="py-4 px-4">Job ID</th>
                  <th class="py-4 px-4">Client</th>
                  <th class="py-4 px-4">Door Model</th>
                  <th class="py-4 px-4 text-center">Qty</th>
                  <th class="py-4 px-4">Area / Address</th>
                  <th class="py-4 px-4">Status</th>
                  <th class="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border text-xs sm:text-sm font-medium">
                @for (b of pendingOrUrgentBookings(); track b.id; let idx = $index) {
                  <tr
                    [routerLink]="['/branch/bookings', b.id]"
                    class="cursor-pointer transition-colors"
                    [ngClass]="idx % 2 === 0 ? 'bg-surface hover:bg-surface-muted/60' : 'bg-surface-muted/30 hover:bg-surface-muted/60'"
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
                      <div class="text-[11px] text-text-muted truncate max-w-[200px]">{{ b.address }}</div>
                    </td>
                    <td class="py-4 px-4">
                      <app-status-chip [status]="b.status" [isDelayed]="b.isDelayed || false" size="sm"></app-status-chip>
                    </td>
                    <td class="py-4 px-4 text-right">
                      <a
                        [routerLink]="['/branch/bookings', b.id]"
                        class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-text-inverted text-xs font-bold transition-all shadow-xs inline-block"
                        (click)="$event.stopPropagation()"
                      >
                        Take Action
                      </a>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-8 text-center text-text-muted">
                      All jobs in {{ userDistrictName() }} are up to date! No pending actions required.
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
export class BranchDashboardComponent implements OnInit {
  auth = inject(AuthService);
  private dataService = inject(DataService);
  private titleService = inject(Title);

  districtBookings = signal<Booking[]>([]);

  userDistrictName = () => {
    const dId = this.auth.currentUser()?.districtId;
    if (!dId) return 'District';
    return dId.replace('dist-', '').toUpperCase();
  };

  get pendingCount(): number {
    return this.districtBookings().filter(b => b.status === 'Pending').length;
  }

  get scheduledCount(): number {
    return this.districtBookings().filter(b => b.status === 'Scheduled').length;
  }

  get acceptedCount(): number {
    return this.districtBookings().filter(b => b.status === 'Accepted').length;
  }

  get finishedCount(): number {
    return this.districtBookings().filter(b => b.status === 'Finished').length;
  }

  get delayedCount(): number {
    return this.districtBookings().filter(b => b.isDelayed).length;
  }

  pendingOrUrgentBookings = () => {
    return this.districtBookings().filter(b => b.status === 'Pending' || b.isDelayed || b.status === 'Accepted').slice(0, 5);
  };

  ngOnInit(): void {
    this.titleService.setTitle('Branch Dashboard | SteelGuard Mobile');

    const currentUser = this.auth.currentUser();
    const districtId = currentUser?.districtId || undefined;
    const branchHeadId = currentUser?.branchHeadId || undefined;

    this.dataService.getBookings({ districtId, branchHeadId }).subscribe(list => {
      this.districtBookings.set(list);
    });
  }
}
