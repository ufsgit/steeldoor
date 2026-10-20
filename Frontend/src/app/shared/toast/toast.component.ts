import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-card transition-all duration-300 transform translate-y-0"
          [ngClass]="{
            'bg-surface border-success/30 text-text': toast.type === 'success',
            'bg-surface border-danger/30 text-text': toast.type === 'danger',
            'bg-surface border-warning/30 text-text': toast.type === 'warning',
            'bg-surface border-info/30 text-text': toast.type === 'info'
          }"
        >
          <!-- Status icon dot / indicator -->
          <div class="mt-0.5 shrink-0 rounded-full p-1.5"
            [ngClass]="{
              'bg-success/15 text-success': toast.type === 'success',
              'bg-danger/15 text-danger': toast.type === 'danger',
              'bg-warning/15 text-warning': toast.type === 'warning',
              'bg-info/15 text-info': toast.type === 'info'
            }"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (toast.type === 'success') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              } @else if (toast.type === 'danger') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              } @else if (toast.type === 'warning') {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
          </div>

          <div class="flex-1 min-w-0">
            @if (toast.title) {
              <h4 class="text-sm font-semibold text-text">{{ toast.title }}</h4>
            }
            <p class="text-xs text-text-muted mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>

          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="text-text-muted hover:text-text p-1 transition-colors rounded-lg"
            aria-label="Close toast"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}
