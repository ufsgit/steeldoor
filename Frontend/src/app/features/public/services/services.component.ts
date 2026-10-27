import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ServiceItem } from '../../../core/models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <!-- Header -->
      <div class="text-center max-w-3xl mx-auto space-y-4">
        <div class="inline-block text-xs font-bold uppercase tracking-widest text-accent">Certified Fitting Scope</div>
        <h1 class="text-4xl sm:text-5xl font-black text-text tracking-tight">
          Steel Door Precision Installation Services
        </h1>
        <p class="text-base text-text-muted leading-relaxed">
          We provide specialized installation and precision frame mounting for any steel door. Handled by certified district technicians with 100% zero wall damage.
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        @for (service of services; track service.id) {
          <div class="p-8 rounded-3xl bg-surface border border-border hover:border-primary shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {{ service.badge || 'Certified Service' }}
                </span>
                <span class="text-xs font-bold text-accent-dark bg-accent/10 px-2.5 py-0.5 rounded-full">
                  {{ service.warrantyYears }} Yr Guarantee
                </span>
              </div>

              <div>
                <h3 class="text-xl font-bold text-text">{{ service.title }}</h3>
                <div class="text-xs font-semibold text-text-muted mt-0.5">{{ service.tagline }}</div>
              </div>

              <p class="text-xs text-text-muted leading-relaxed">{{ service.description }}</p>

              <!-- Feature Bullet list -->
              <div class="pt-3 border-t border-border/60 space-y-2">
                <div class="text-[11px] font-bold uppercase tracking-wider text-text-muted">Installation Standards</div>
                <ul class="space-y-2">
                  @for (feat of service.features; track feat) {
                    <li class="flex items-start gap-2 text-xs text-text">
                      <svg class="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{{ feat }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Price & Action -->
            <div class="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <div class="text-[10px] text-text-muted uppercase">Fitting Charge</div>
                <div class="text-base font-extrabold text-primary">{{ service.startingPrice }}</div>
              </div>

              <a
                routerLink="/bookings/new"
                [queryParams]="{ service: service.doorType }"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs font-bold shadow-soft transition-all"
              >
                Book Installation
              </a>
            </div>
          </div>
        }
      </div>

      <!-- Installation & Retrofit Note -->
      <div class="p-8 sm:p-12 rounded-3xl bg-surface-muted border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-text">Zero-Damage Replacement Guarantee</h3>
          <p class="text-xs text-text-muted max-w-xl leading-relaxed">
            Replacing older wooden frames? Our certified technicians use expandable anchor clamping systems that preserve your existing interior paintwork and tile sills.
          </p>
        </div>
        <a
          routerLink="/bookings/new"
          class="px-6 py-3 rounded-xl bg-primary text-text-inverted text-xs font-bold shrink-0 hover:bg-primary-hover transition-colors"
        >
          Book Installation
        </a>
      </div>
    </div>
  `
})
export class ServicesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  services: ServiceItem[] = [];

  ngOnInit(): void {
    this.titleService.setTitle('Steel Door Installation & Fitting Services | SteelGuard');
    this.metaService.updateTag({
      name: 'description',
      content: 'Kerala certified steel door installation services. Zero wall damage guaranteed for residential, commercial fire doors, and pivot assemblies.'
    });

    const resolved = this.route.snapshot.data['services'];
    if (resolved) this.services = resolved;
  }
}
