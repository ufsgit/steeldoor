import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
      @for (i of countArray; track i) {
        <div class="p-5 rounded-2xl border border-border bg-surface shadow-soft space-y-4">
          <div class="flex items-center justify-between">
            <div class="h-4 bg-surface-muted rounded w-1/3"></div>
            <div class="h-5 bg-surface-muted rounded-full w-16"></div>
          </div>
          <div class="h-6 bg-surface-muted rounded w-3/4"></div>
          <div class="space-y-2">
            <div class="h-3 bg-surface-muted rounded w-full"></div>
            <div class="h-3 bg-surface-muted rounded w-5/6"></div>
          </div>
          <div class="pt-2 border-t border-border/50 flex justify-between">
            <div class="h-4 bg-surface-muted rounded w-20"></div>
            <div class="h-4 bg-surface-muted rounded w-24"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class SkeletonCardsComponent {
  @Input() count = 6;

  get countArray(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface rounded-2xl border border-dashed border-border p-8">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-text">{{ title }}</h3>
      <p class="text-xs text-text-muted max-w-sm mt-1 mb-4 leading-relaxed">{{ description }}</p>
      <ng-content></ng-content>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'No records found';
  @Input() description = 'There are currently no items matching your criteria.';
}
