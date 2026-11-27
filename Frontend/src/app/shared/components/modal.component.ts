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
        style="z-index: 100;"
        (click)="close()"
      ></div>

      <!-- Modal Dialog -->
      <div
        class="fixed inset-0 z-50 overflow-y-auto flex justify-center p-4"
        style="z-index: 101;"
        [ngClass]="alignTop ? 'items-start pt-4 sm:pt-6' : 'items-center'"
        (click)="close()"
      >
        <div
          class="relative w-full bg-surface rounded-2xl border border-border shadow-elevated transition-all"
          [ngClass]="[
            maxWidthClass || 'max-w-lg',
            overflowVisible ? 'overflow-visible' : 'overflow-hidden'
          ]"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-border bg-surface-muted/30 rounded-t-2xl"
            [ngClass]="compact ? 'px-5 py-3.5' : 'p-5'"
          >
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
          <div [ngClass]="compact ? 'p-4 sm:p-5' : 'p-6'">
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
  @Input() overflowVisible = false;
  @Input() alignTop = false;
  @Input() compact = false;
  @Input() maxWidthClass = 'max-w-lg';
  @Output() closeModal = new EventEmitter<void>();

  close(): void {
    this.closeModal.emit();
  }
}
