import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { BookingHistoryEntry } from '../../../core/models';
import { EmptyStateComponent } from '../../../shared/components/skeletons.component';

export interface AuditHistoryRow extends BookingHistoryEntry {
  bookingId: string;
  clientName: string;
  districtName: string;
}

@Component({
  selector: 'app-admin-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-text">Global Audit Trail</h1>
          <p class="text-xs text-text-muted mt-0.5">
            Tamper-proof event logs recording every booking creation, status progression, rejection reason, and branch reassignment.
          </p>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          <select
            [(ngModel)]="roleFilter"
            class="px-3 py-1.5 rounded-lg border border-border bg-background text-text text-xs"
          >
            <option value="">All Roles</option>
            <option value="coordinator">Super Admin</option>
            <option value="branch_head">Branch Head</option>
            <option value="client">Client</option>
          </select>

          <select
            [(ngModel)]="actionFilter"
            class="px-3 py-1.5 rounded-lg border border-border bg-background text-text text-xs"
          >
            <option value="">All Actions</option>
            <option value="Created">Created</option>
            <option value="Status Updated">Status Updated</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Finished">Finished</option>
            <option value="Rejected">Rejected</option>
            <option value="Reassigned">Reassigned</option>
          </select>
        </div>

        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search by booking ID or performer..."
          class="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <!-- Event Log Stream Table -->
      <div class="bg-surface rounded-3xl border border-border shadow-soft overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-border bg-surface-muted/30 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th class="py-3 px-4">Timestamp</th>
                <th class="py-3 px-4">Booking ID</th>
                <th class="py-3 px-4">Action</th>
                <th class="py-3 px-4">Performed By</th>
                <th class="py-3 px-4">Event Notes</th>
                <th class="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/60">
              @for (entry of filteredHistory(); track entry.id) {
                <tr class="hover:bg-surface-muted/40 transition-colors">
                  <td class="py-3.5 px-4 font-mono text-[11px] text-text-muted whitespace-nowrap">
                    {{ formatDate(entry.timestamp) }}
                  </td>
                  <td class="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                    <a [routerLink]="['/admin/bookings', entry.bookingId]" class="hover:underline">
                      {{ entry.bookingId }}
                    </a>
                  </td>
                  <td class="py-3.5 px-4 whitespace-nowrap">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      [ngClass]="{
                        'bg-primary/10 text-primary': entry.action === 'Created',
                        'bg-status-accepted/10 text-status-accepted': entry.action === 'Status Updated',
                        'bg-status-scheduled/10 text-status-scheduled': entry.action === 'Scheduled',
                        'bg-status-finished/10 text-status-finished': entry.action === 'Finished',
                        'bg-status-rejected/15 text-status-rejected font-bold': entry.action === 'Rejected',
                        'bg-status-delayed/15 text-status-delayed font-bold': entry.action === 'Reassigned'
                      }"
                    >
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-medium text-text whitespace-nowrap">
                    <div>{{ entry.performedBy }}</div>
                    <div class="text-[10px] text-text-muted uppercase">{{ entry.role === 'coordinator' ? 'admin' : entry.role }}</div>
                  </td>
                  <td class="py-3.5 px-4 text-text leading-relaxed max-w-md">
                    {{ entry.notes }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <a
                      [routerLink]="['/admin/bookings', entry.bookingId]"
                      class="px-2.5 py-1 rounded-lg border border-border text-text hover:bg-surface text-[11px] font-semibold transition-colors"
                    >
                      View
                    </a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="py-12">
                    <app-empty-state
                      title="No history logs found"
                      description="No audit records match the selected action and role filters."
                    ></app-empty-state>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminHistoryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private titleService = inject(Title);

  historyEntries = signal<AuditHistoryRow[]>([]);

  roleFilter = '';
  actionFilter = '';
  searchQuery = '';

  filteredHistory = () => {
    return this.historyEntries().filter(e => {
      if (this.roleFilter && e.role !== this.roleFilter) return false;
      if (this.actionFilter && e.action !== this.actionFilter) return false;
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        const bId = (e.bookingId || '').toLowerCase();
        const perf = e.performedBy.toLowerCase();
        const notes = e.notes.toLowerCase();
        return bId.includes(q) || perf.includes(q) || notes.includes(q);
      }
      return true;
    });
  };

  ngOnInit(): void {
    this.titleService.setTitle('Global Audit Trail & History | SteelGuard');

    const resolved = this.route.snapshot.data['history'];
    if (resolved) {
      this.historyEntries.set(resolved as AuditHistoryRow[]);
    } else {
      this.dataService.getHistory().subscribe(h => this.historyEntries.set(h as AuditHistoryRow[]));
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
