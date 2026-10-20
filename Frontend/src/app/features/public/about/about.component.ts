import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { District } from '../../../core/models';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16 animate-fadeIn">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto space-y-3">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          About SteelGuard
        </h1>
        <p class="text-sm sm:text-base text-text-muted leading-relaxed">
          We specialize in expert steel door installation, frame mounting, and certified doorstep fittings across 5 districts in Kerala.
        </p>
      </div>

      <!-- Core Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            01
          </div>
          <h2 class="text-lg font-bold text-text">Precision Fitting</h2>
          <p class="text-xs text-text-muted leading-relaxed">
            Every door frame is accurately aligned to ensure smooth, silent swing, perfect latching, and direct fit.
          </p>
        </div>

        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            02
          </div>
          <h2 class="text-lg font-bold text-text">Dedicated Regional Heads</h2>
          <p class="text-xs text-text-muted leading-relaxed">
            Each district has a dedicated branch head overseeing surveys, quality checks, and installation schedules.
          </p>
        </div>

        <div class="p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            03
          </div>
          <h2 class="text-lg font-bold text-text">Wall-Safe Installation</h2>
          <p class="text-xs text-text-muted leading-relaxed">
            Specialized anchor bolting techniques secure rigid steel assemblies cleanly without damaging plaster or tiles.
          </p>
        </div>
      </div>

      <!-- Coverage Network -->
      <div class="p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-soft space-y-6">
        <div>
          <h2 class="text-2xl font-extrabold text-text">5 Operational District Hubs</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (dist of districts; track dist.id) {
            <div class="p-5 rounded-2xl bg-background border border-border space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-primary">{{ dist.name }} District</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border font-bold">
                  {{ dist.code }}
                </span>
              </div>
              <div class="text-[11px] text-text-muted">
                {{ dist.areas.slice(0, 4).join(', ') }}...
              </div>
            </div>
          }
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center pt-4">
        <a
          routerLink="/book-now"
          class="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted font-bold text-sm shadow-soft transition-all cursor-pointer"
        >
          <span>Book Installation</span>
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </a>
      </div>
    </div>
  `
})
export class AboutComponent implements OnInit {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private route = inject(ActivatedRoute);

  districts: District[] = [];

  ngOnInit(): void {
    this.titleService.setTitle('About | SteelGuard');
    this.metaService.updateTag({
      name: 'description',
      content: 'Learn about SteelGuard precision steel door installations and dedicated district hubs.'
    });

    const d = this.route.snapshot.data['districts'];
    if (d) {
      this.districts = d;
    }
  }
}
