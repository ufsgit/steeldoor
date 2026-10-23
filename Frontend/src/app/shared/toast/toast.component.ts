import { Component, inject, ElementRef, viewChildren, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <!-- High z-index dialog container (z-[99999]) -->
      <div class="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4">
        <!-- Backdrop: Click outside closes ONLY IF NOT DANGER/ERROR -->
        <div
          class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
          (click)="onBackdropClick(toast)"
        ></div>

        <!-- Dialog Box -->
        <div
          role="dialog"
          aria-modal="true"
          class="relative w-full max-w-sm sm:max-w-md bg-surface text-text rounded-3xl border border-border shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col items-center text-center animate-scaleUp z-10"
          (click)="$event.stopPropagation()"
        >
          <!-- Close button in top-right -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="absolute top-4 right-4 w-8 h-8 rounded-full border border-border text-text-muted hover:text-text hover:bg-surface-muted transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close dialog"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Large Status Icon -->
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-soft"
            [ngClass]="{
              'bg-danger/10 text-danger border border-danger/20': toast.type === 'danger',
              'bg-success/10 text-success border border-success/20': toast.type === 'success',
              'bg-warning/10 text-warning border border-warning/20': toast.type === 'warning',
              'bg-info/10 text-info border border-info/20': toast.type === 'info'
            }"
          >
            @if (toast.type === 'danger') {
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            } @else if (toast.type === 'success') {
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            } @else if (toast.type === 'warning') {
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            } @else {
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          </div>

          <!-- Title & Message -->
          <h3 class="text-lg font-bold text-text mb-1">
            {{ toast.title || (toast.type === 'danger' ? 'Error' : 'Notice') }}
          </h3>
          <p class="text-sm text-text-muted leading-relaxed mb-6 max-w-xs sm:max-w-sm">
            {{ toast.message }}
          </p>

          <!-- Action OK Button (Focused) -->
          <button
            #okBtn
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="w-full py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-soft cursor-pointer flex items-center justify-center gap-2 focus:ring-4 focus:outline-none"
            [ngClass]="{
              'bg-danger text-white hover:bg-danger/90 focus:ring-danger/30': toast.type === 'danger',
              'bg-primary text-text-inverted hover:bg-primary-hover focus:ring-accent/40': toast.type === 'success',
              'bg-warning text-text-inverted hover:bg-warning/90 focus:ring-warning/30': toast.type === 'warning',
              'bg-info text-white hover:bg-info/90 focus:ring-info/30': toast.type === 'info'
            }"
          >
            OK
          </button>
        </div>
      </div>
    }
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
  okButtons = viewChildren<ElementRef<HTMLButtonElement>>('okBtn');

  constructor() {
    effect(() => {
      const btns = this.okButtons();
      if (btns && btns.length > 0) {
        // Focus the last active dialog button
        setTimeout(() => {
          btns[btns.length - 1].nativeElement?.focus();
        }, 50);
      }
    });
  }

  onBackdropClick(toast: ToastMessage): void {
    // For error/danger, user MUST click OK or the Close button
    if (toast.type === 'danger') {
      return;
    }
    // For success, info, warning, clicking outside closes it
    this.toastService.dismiss(toast.id);
  }
}
