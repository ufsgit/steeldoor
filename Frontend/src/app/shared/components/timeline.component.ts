import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingHistoryEntry } from '../../core/models';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      @for (item of history; track item.id) {
        <div class="relative group">
          <!-- Step node icon -->
          <div
            class="absolute -left-6 top-1 w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center transition-all"
            [ngClass]="{
              'bg-primary text-text-inverted ring-2 ring-primary/20': item.action === 'Created',
              'bg-status-accepted text-text-inverted ring-2 ring-status-accepted/20': item.action === 'Status Updated' && item.status === 'Accepted',
              'bg-status-scheduled text-text-inverted ring-2 ring-status-scheduled/20': item.action === 'Scheduled',
              'bg-status-finished text-text-inverted ring-2 ring-status-finished/20': item.action === 'Finished',
              'bg-status-rejected text-text-inverted ring-2 ring-status-rejected/20': item.action === 'Rejected',
              'bg-status-delayed text-text-inverted ring-2 ring-status-delayed/20': item.action === 'Reassigned'
            }"
          >
            <div class="w-1.5 h-1.5 rounded-full bg-surface"></div>
          </div>

          <!-- Content Card -->
          <div class="bg-surface rounded-xl border border-border p-3.5 shadow-sm hover:border-border-hover transition-colors">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  [ngClass]="{
                    'bg-primary/10 text-primary': item.action === 'Created',
                    'bg-status-accepted/10 text-status-accepted': item.action === 'Status Updated' && item.status === 'Accepted',
                    'bg-status-scheduled/10 text-status-scheduled': item.action === 'Scheduled',
                    'bg-status-finished/10 text-status-finished': item.action === 'Finished',
                    'bg-status-rejected/10 text-status-rejected': item.action === 'Rejected',
                    'bg-status-delayed/10 text-status-delayed': item.action === 'Reassigned'
                  }"
                >
                  {{ item.action }}
                </span>
                <span class="text-xs text-text-muted">by <strong class="text-text font-medium">{{ item.performedBy }}</strong></span>
              </div>
              <time class="text-[11px] text-text-muted font-mono">{{ formatDate(item.timestamp) }}</time>
            </div>

            <p class="text-xs text-text leading-relaxed mt-1">{{ item.notes }}</p>
          </div>
        </div>
      }
    </div>
  `
})
export class TimelineComponent {
  @Input() history: BookingHistoryEntry[] = [];

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
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
