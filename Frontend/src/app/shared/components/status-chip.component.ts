import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingStatus } from '../../core/models';

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center tracking-wide border transition-all font-bold"
      [ngClass]="{
        'gap-1 px-2 py-0.5 text-[11px] rounded-md': size === 'sm',
        'gap-1.5 px-3 py-1 text-xs rounded-full': size === 'md',
        'gap-2 px-3.5 py-1.5 text-xs sm:text-sm rounded-xl shadow-xs': size === 'lg',
        'bg-status-pending/10 text-status-pending border-status-pending/30': status === 'Pending' && !isDelayed,
        'bg-status-accepted/10 text-status-accepted border-status-accepted/30': status === 'Accepted',
        'bg-status-scheduled/10 text-status-scheduled border-status-scheduled/30': status === 'Scheduled',
        'bg-status-finished/10 text-status-finished border-status-finished/30': status === 'Finished',
        'bg-status-rejected/15 text-status-rejected border-status-rejected/30 ring-1 ring-status-rejected/20': status === 'Rejected',
        'bg-status-delayed/15 text-status-delayed border-status-delayed/30 ring-1 ring-status-delayed/20': isDelayed
      }"
    >
      <!-- Pulsing dot for active/pending/delayed -->
      <span class="rounded-full shrink-0"
        [ngClass]="{
          'w-1.5 h-1.5': size !== 'lg',
          'w-2.5 h-2.5': size === 'lg',
          'bg-status-pending': status === 'Pending' && !isDelayed,
          'bg-status-accepted': status === 'Accepted',
          'bg-status-scheduled': status === 'Scheduled',
          'bg-status-finished': status === 'Finished',
          'bg-status-rejected': status === 'Rejected',
          'bg-status-delayed animate-pulse': isDelayed
        }"
      ></span>

      <span>
        @if (isDelayed) {
          Delayed
          @if (hoursSinceSubmitted && hoursSinceSubmitted > 0) {
            <span class="opacity-80 text-[10px] sm:text-xs">({{ hoursSinceSubmitted }}h)</span>
          }
        } @else {
          {{ status }}
        }
      </span>
    </div>
  `
})
export class StatusChipComponent {
  @Input() status: BookingStatus | string = 'Pending';
  @Input() isDelayed = false;
  @Input() hoursSinceSubmitted?: number;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
