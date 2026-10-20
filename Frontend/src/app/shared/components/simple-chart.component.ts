import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ChartDatum {
  label: string;
  value: number;
  colorClass: string;
}

@Component({
  selector: 'app-simple-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      @if (type === 'donut') {
        <!-- Donut Chart -->
        <div class="flex flex-col sm:flex-row items-center gap-6 justify-center">
          <div class="relative w-44 h-44 shrink-0">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              @for (segment of donutSegments; track segment.label) {
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke-width="16"
                  class="transition-all duration-300"
                  [attr.stroke-dasharray]="segment.dashArray"
                  [attr.stroke-dashoffset]="segment.dashOffset"
                  [ngClass]="segment.colorClass"
                />
              }
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-2xl font-bold text-text">{{ totalValue }}</span>
              <span class="text-[11px] font-medium text-text-muted tracking-wider uppercase">Total</span>
            </div>
          </div>

          <!-- Legend -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 w-full max-w-xs">
            @for (item of data; track item.label) {
              <div class="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <div class="flex items-center gap-2 truncate">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" [ngClass]="item.colorClass"></span>
                  <span class="text-text-muted truncate">{{ item.label }}</span>
                </div>
                <span class="font-semibold text-text pl-2">{{ item.value }}</span>
              </div>
            }
          </div>
        </div>
      } @else if (type === 'bar') {
        <!-- Bar Chart -->
        <div class="flex flex-col gap-3 w-full">
          @for (item of data; track item.label) {
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-text">{{ item.label }}</span>
                <span class="text-text-muted font-semibold">{{ item.value }} jobs ({{ getPercentage(item.value) }}%)</span>
              </div>
              <div class="w-full h-3 rounded-full bg-surface-muted overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  [ngClass]="item.colorClass"
                  [style.width.%]="getBarWidth(item.value)"
                ></div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SimpleChartComponent {
  @Input() type: 'donut' | 'bar' = 'donut';
  @Input() data: ChartDatum[] = [];

  get totalValue(): number {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }

  get maxValue(): number {
    return Math.max(...this.data.map(d => d.value), 1);
  }

  get donutSegments() {
    const circumference = 2 * Math.PI * 38; // ~238.76
    const total = this.totalValue || 1;
    let accumulated = 0;

    return this.data.map(item => {
      const percentage = item.value / total;
      const strokeLength = percentage * circumference;
      const segment = {
        label: item.label,
        colorClass: item.colorClass.replace('bg-', 'stroke-'),
        dashArray: `${strokeLength} ${circumference}`,
        dashOffset: -accumulated
      };
      accumulated += strokeLength;
      return segment;
    });
  }

  getPercentage(val: number): number {
    if (!this.totalValue) return 0;
    return Math.round((val / this.totalValue) * 100);
  }

  getBarWidth(val: number): number {
    if (!this.maxValue) return 0;
    return Math.max(4, Math.round((val / this.maxValue) * 100));
  }
}
