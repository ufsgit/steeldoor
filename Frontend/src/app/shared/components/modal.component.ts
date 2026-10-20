import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-text/50 backdrop-blur-sm transition-opacity"
        (click)="close()"
      ></div>

      <!-- Modal Dialog -->
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div
          class="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-elevated transition-all overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-border bg-surface-muted/30">
            <h3 class="text-base font-bold text-text">{{ title }}</h3>
            <button
              type="button"
              (click)="close()"
              class="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
              aria-label="Close modal"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }
}
