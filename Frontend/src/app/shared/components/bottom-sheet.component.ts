import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingStatus } from '../../core/models';

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-text/50 backdrop-blur-sm transition-opacity"
        (click)="close()"
      ></div>

      <!-- Bottom Sheet Drawer -->
      <div
        class="fixed inset-x-0 bottom-0 z-50 max-w-lg mx-auto bg-surface rounded-t-3xl border-t border-border shadow-2xl transition-transform duration-300 transform translate-y-0 p-5 max-h-[90vh] overflow-y-auto"
      >
        <!-- Pull Handle -->
        <div class="w-12 h-1.5 rounded-full bg-border-hover mx-auto mb-4"></div>

        <div class="flex items-center justify-between mb-4 pb-2 border-b border-border">
          <div>
            <h3 class="text-base font-bold text-text">{{ title }}</h3>
            <p class="text-xs text-text-muted mt-0.5">Booking ID: {{ bookingId }}</p>
          </div>
          <button
            type="button"
            (click)="close()"
            class="text-text-muted hover:text-text p-1.5 rounded-lg bg-surface-muted transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Action Selection -->
        <div class="space-y-4">
          <!-- Status Action Pills -->
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="selectedAction = 'Accepted'"
              class="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all"
              [ngClass]="selectedAction === 'Accepted'
                ? 'bg-status-accepted/15 border-status-accepted text-status-accepted'
                : 'bg-surface border-border text-text hover:border-border-hover'"
            >
              <span class="w-2 h-2 rounded-full bg-status-accepted"></span>
              Accept Job
            </button>

            <button
              type="button"
              (click)="selectedAction = 'Scheduled'"
              class="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all"
              [ngClass]="selectedAction === 'Scheduled'
                ? 'bg-status-scheduled/15 border-status-scheduled text-status-scheduled'
                : 'bg-surface border-border text-text hover:border-border-hover'"
            >
              <span class="w-2 h-2 rounded-full bg-status-scheduled"></span>
              Schedule Fitting
            </button>

            <button
              type="button"
              (click)="selectedAction = 'Finished'"
              class="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all"
              [ngClass]="selectedAction === 'Finished'
                ? 'bg-status-finished/15 border-status-finished text-status-finished'
                : 'bg-surface border-border text-text hover:border-border-hover'"
            >
              <span class="w-2 h-2 rounded-full bg-status-finished"></span>
              Mark Finished
            </button>

            <button
              type="button"
              (click)="selectedAction = 'Rejected'"
              class="flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all"
              [ngClass]="selectedAction === 'Rejected'
                ? 'bg-status-rejected/15 border-status-rejected text-status-rejected'
                : 'bg-surface border-border text-text hover:border-border-hover'"
            >
              <span class="w-2 h-2 rounded-full bg-status-rejected"></span>
              Reject Request
            </button>
          </div>

          <!-- Dynamic inputs based on action -->
          @if (selectedAction === 'Scheduled') {
            <div class="p-3.5 rounded-xl bg-surface-muted/60 border border-border space-y-2">
              <label class="block text-xs font-semibold text-text">Fitting Date & Time <span class="text-danger">*</span></label>
              <input
                type="datetime-local"
                [(ngModel)]="scheduledDateTime"
                class="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          }

          @if (selectedAction === 'Rejected') {
            <div class="p-3.5 rounded-xl bg-status-rejected/5 border border-status-rejected/20 space-y-2">
              <label class="block text-xs font-semibold text-danger">Rejection Reason <span class="text-danger">*</span></label>
              <textarea
                [(ngModel)]="rejectionReason"
                rows="3"
                placeholder="Explain why this request is rejected (e.g. wall structure inadequate, outside service range)..."
                class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-danger"
              ></textarea>
            </div>
          }

          <!-- General Notes -->
          <div class="space-y-1.5">
            <label class="block text-xs font-medium text-text-muted">Installation Notes / Remarks (Optional)</label>
            <input
              type="text"
              [(ngModel)]="notes"
              placeholder="e.g. client confirmed measurements, tools assigned..."
              class="w-full text-xs px-3 py-2.5 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <!-- Submit Button -->
          <div class="pt-2 flex gap-3">
            <button
              type="button"
              (click)="close()"
              class="flex-1 py-2.5 px-4 rounded-xl border border-border text-text text-xs font-semibold hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="submit()"
              [disabled]="!isValid()"
              class="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-semibold shadow-soft transition-all"
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class BottomSheetComponent {
  @Input() isOpen = false;
  @Input() title = 'Update Booking Status';
  @Input() bookingId = '';
  @Output() closeSheet = new EventEmitter<void>();
  @Output() statusUpdated = new EventEmitter<{
    status: BookingStatus;
    scheduledDate?: string;
    rejectionReason?: string;
    notes?: string;
  }>();

  selectedAction: BookingStatus = 'Accepted';
  scheduledDateTime = '';
  rejectionReason = '';
  notes = '';

  isValid(): boolean {
    if (this.selectedAction === 'Scheduled' && !this.scheduledDateTime) {
      return false;
    }
    if (this.selectedAction === 'Rejected' && !this.rejectionReason.trim()) {
      return false;
    }
    return true;
  }

  close(): void {
    this.closeSheet.emit();
  }

  submit(): void {
    if (!this.isValid()) return;

    this.statusUpdated.emit({
      status: this.selectedAction,
      scheduledDate: this.selectedAction === 'Scheduled' ? new Date(this.scheduledDateTime).toISOString() : undefined,
      rejectionReason: this.selectedAction === 'Rejected' ? this.rejectionReason.trim() : undefined,
      notes: this.notes.trim() || undefined
    });

    this.close();
  }
}
