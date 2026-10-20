import { Component, inject, OnInit, OnDestroy, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BannerSlide, ServiceItem, SiteContent, TestimonialItem } from '../../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-16 lg:space-y-24 pb-20">
      <!-- HERO SECTION WITH EXPANDED BANNER SLIDER -->
      <section class="relative overflow-hidden pt-2 sm:pt-4 pb-12 lg:pt-4 lg:pb-16">
        <!-- Background decorative ambient glows -->
        <div class="absolute top-10 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-0 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            <!-- LEFT COLUMN: Value Proposition & Stats -->
            <div class="lg:col-span-5 space-y-6 text-left">
              <!-- Main Hero Headline -->
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text tracking-tight leading-tight">
                Steel Doors & Frames — <span class="text-primary block sm:inline">Installed Right.</span>
              </h1>

              <!-- Subtitle Description -->
              <p class="text-sm sm:text-base text-text-muted leading-relaxed">
                Expert steel door installation and precision frame mounting across Kerala. Fast booking and certified doorstep service.
              </p>

              <!-- Action CTA Button -->
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  routerLink="/book-now"
                  class="px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted font-bold text-sm shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <svg class="w-4 h-4 text-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Book Installation</span>
                </a>
              </div>

              <!-- Trust Stats Micro-Counter -->
              <div class="pt-6 grid grid-cols-3 gap-4 border-t border-border/80">
                <div>
                  <div class="text-2xl sm:text-3xl font-black text-primary">500+</div>
                  <div class="text-xs text-text-muted font-medium mt-1">Dealers</div>
                </div>
                <div>
                  <div class="text-2xl sm:text-3xl font-black text-primary">12,400+</div>
                  <div class="text-xs text-text-muted font-medium mt-1">Installed</div>
                </div>
                <div>
                  <div class="text-2xl sm:text-3xl font-black text-primary flex items-center gap-1">
                    4.9<span class="text-amber-500 text-xl leading-none">★</span>
                  </div>
                  <div class="text-xs text-text-muted font-medium mt-1">Rating</div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Enriched & Taller Interactive Banner Carousel -->
            <div class="lg:col-span-7 relative">
              <div
                class="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border/80 bg-slate-900 group h-[460px] sm:h-[520px] lg:h-[560px] xl:h-[600px] select-none"
                (mouseenter)="pauseAutoplay()"
                (mouseleave)="resumeAutoplay()"
              >
                <!-- Slides Container -->
                @for (slide of banners; track slide.id; let idx = $index) {
                  <div
                    class="absolute inset-0 transition-all duration-700 ease-in-out"
                    [class.opacity-100]="idx === currentSlideIndex()"
                    [class.opacity-0]="idx !== currentSlideIndex()"
                    [class.pointer-events-none]="idx !== currentSlideIndex()"
                    [class.scale-100]="idx === currentSlideIndex()"
                    [class.scale-105]="idx !== currentSlideIndex()"
                  >
                    <!-- Real High-Resolution Installation Banner Image -->
                    <img
                      [src]="slide.image"
                      [alt]="slide.title"
                      class="w-full h-full object-cover object-center"
                      loading="eager"
                    />

                    <!-- Rich Dual Gradient Overlay for Maximum Text Contrast -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25"></div>

                    <!-- Slide Content Overlay (Positioned exactly like the Porzivo screenshot) -->
                    <div class="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
                      <!-- Top Badge & Slide Counter -->
                      <div class="flex items-center justify-between">
                        <!-- Protocol / Verification Badge -->
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600/95 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg backdrop-blur-md border border-emerald-400/30">
                          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{{ slide.badge }}</span>
                        </div>

                        <!-- Slide Counter Indicator -->
                        <div class="text-[11px] font-bold text-white/80 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          0{{ idx + 1 }} / 0{{ banners.length }}
                        </div>
                      </div>

                      <!-- Bottom Headline and Description Text (Matching screenshot typography) -->
                      <div class="space-y-2 max-w-lg">
                        <h3 class="text-xl sm:text-2xl lg:text-[1.65rem] font-black text-white leading-tight drop-shadow-md">
                          {{ slide.title }}
                        </h3>
                        <p class="text-xs sm:text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                          {{ slide.description }}
                        </p>
                      </div>
                    </div>
                  </div>
                }

                <!-- Left Navigation Chevron Arrow -->
                <button
                  type="button"
                  (click)="prevSlide(); $event.stopPropagation()"
                  class="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white border border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 focus:outline-none shadow-md"
                  aria-label="Previous banner slide"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <!-- Right Navigation Chevron Arrow -->
                <button
                  type="button"
                  (click)="nextSlide(); $event.stopPropagation()"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white border border-white/25 backdrop-blur-md flex items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-105 active:scale-95 focus:outline-none shadow-md"
                  aria-label="Next banner slide"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <!-- Pagination Dots (Matching screenshot pill style) -->
                <div class="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  @for (slide of banners; track slide.id; let idx = $index) {
                    <button
                      type="button"
                      (click)="goToSlide(idx); $event.stopPropagation()"
                      [class.w-7]="idx === currentSlideIndex()"
                      [class.bg-accent]="idx === currentSlideIndex()"
                      [class.w-2.5]="idx !== currentSlideIndex()"
                      [class.bg-white/50]="idx !== currentSlideIndex()"
                      [class.hover:bg-white/80]="idx !== currentSlideIndex()"
                      class="h-2 rounded-full transition-all duration-300 focus:outline-none"
                      [attr.aria-label]="'Go to slide ' + (idx + 1)"
                    ></button>
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- HOW IT WORKS: 4-STEP WORKFLOW -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <h2 class="text-3xl font-extrabold text-text">How It Works</h2>
          <p class="text-sm text-text-muted leading-relaxed">
            Simple 4-step process from booking to completed installation.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (step of howItWorks; track step.step) {
            <div class="relative p-6 rounded-2xl bg-surface border border-border hover:border-primary/40 shadow-soft transition-all space-y-3">
              <div class="w-10 h-10 rounded-xl bg-primary text-text-inverted font-black text-sm flex items-center justify-center shadow-soft">
                0{{ step.step }}
              </div>
              <h3 class="text-base font-bold text-text">{{ step.title }}</h3>
              <p class="text-xs text-text-muted leading-relaxed">{{ step.description }}</p>
            </div>
          }
        </div>
      </section>

      <!-- INSTALLATION SERVICES PREVIEW -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-extrabold text-text">Popular Door Fittings</h2>
          </div>
          <a routerLink="/book-now" class="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1">
            <span>Book Installation</span>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (service of services.slice(0, 3); track service.id; let sIdx = $index) {
            <div class="rounded-3xl bg-surface border border-border hover:border-primary/40 shadow-soft transition-all flex flex-col justify-between overflow-hidden group">
              <!-- Service Preview Image -->
              <div class="relative h-44 overflow-hidden bg-slate-900">
                <img
                  [src]="banners[sIdx % banners.length].image"
                  [alt]="service.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
                <div class="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md">
                    {{ service.badge || 'Certified Service' }}
                  </span>
                  <span class="text-xs font-black">{{ service.startingPrice }}</span>
                </div>
              </div>

              <div class="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div class="space-y-3">
                  <h3 class="text-lg font-bold text-text">{{ service.title }}</h3>
                  <p class="text-xs text-text-muted leading-relaxed">{{ service.description }}</p>

                  <ul class="space-y-2 pt-2 border-t border-border/50">
                    @for (f of service.features; track f) {
                      <li class="flex items-center gap-2 text-xs text-text">
                        <svg class="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{{ f }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <a
                  routerLink="/book-now"
                  [queryParams]="{ service: service.doorType }"
                  class="w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-text-inverted text-xs font-bold text-center transition-colors block mt-4"
                >
                  Book This Installation
                </a>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-8 sm:p-12 rounded-3xl bg-surface border border-border shadow-soft space-y-8">
          <div class="text-center max-w-xl mx-auto space-y-1">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-text">Customer Reviews</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (t of testimonials; track t.id) {
              <div class="p-6 rounded-2xl bg-background border border-border space-y-3">
                <div class="flex items-center gap-1 text-warning">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  }
                </div>
                <p class="text-xs text-text italic leading-relaxed">"{{ t.text }}"</p>
                <div class="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-text block">{{ t.author }}</span>
                    <span class="text-text-muted text-[11px] block">{{ t.role }}</span>
                  </div>
                  <span class="text-[10px] text-accent font-semibold px-2 py-0.5 rounded bg-accent/10">
                    {{ t.doorModel }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- FINAL CTA BANNER -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-primary-hover text-text-inverted text-center space-y-6 shadow-elevated">
          <h2 class="text-3xl sm:text-4xl font-black max-w-2xl mx-auto leading-tight">
            Need Certified Steel Door Installation?
          </h2>
          <p class="text-sm text-text-inverted/80 max-w-xl mx-auto leading-relaxed">
            Book your installation in 1 minute. Your local district branch head will inspect the site and confirm measurements without delay.
          </p>
          <div class="pt-2">
            <a
              routerLink="/book-now"
              class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-accent hover:bg-accent-light text-primary-dark font-extrabold text-sm shadow-card transition-all transform hover:-translate-y-0.5"
            >
              <span>Book Door Installation Now</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  services: ServiceItem[] = [];
  testimonials: TestimonialItem[] = [];
  
  // Banner Carousel State
  currentSlideIndex = signal(0);
  private autoplayIntervalId: any = null;
  private isPaused = false;

  banners: BannerSlide[] = [
    {
      id: 'banner-1',
      badge: 'PROTOCOL VERIFIED',
      title: 'Engineering Checklists, Not Guesswork',
      description: 'Every job follows our strict multi-point protocol for structural integrity, millimeter laser alignment, and warranty protection.',
      image: '/images/banners/banner-laser-calibration.jpg',
      link: '/book-now'
    },
    {
      id: 'banner-2',
      badge: 'ZERO WALL DAMAGE',
      title: 'Laser-Calibrated Alignment, Zero Wall Damage',
      description: 'Sub-millimeter plumb line leveling and heavy-duty anchor bolt retrofitting without disturbing plaster or tiles.',
      image: '/images/banners/banner-frame-retrofit.jpg',
      link: '/book-now'
    },
    {
      id: 'banner-3',
      badge: 'FIRE & SECURITY COMPLIANT',
      title: 'Certified Multi-Point Locking & Panic Hardware',
      description: 'Heavy commercial fire doors and emergency exit hardware fitted to stringent safety & load-bearing standards.',
      image: '/images/banners/banner-fire-rated-door.jpg',
      link: '/book-now'
    },
    {
      id: 'banner-4',
      badge: 'ARCHITECTURAL FINISH',
      title: 'Luxury Grand Pivot & Custom Steel Entryways',
      description: 'High-capacity hidden pivot hinges calibrated for whisper-quiet glide and weatherproof airtight compression.',
      image: '/images/banners/banner-luxury-pivot-door.jpg',
      link: '/book-now'
    }
  ];

  stats = [
    { label: 'Doors Installed', value: '12,400+' },
    { label: 'Active Districts', value: '5 Districts' },
    { label: 'Certified Technicians', value: '45+ Crew' },
    { label: 'Average Turnaround', value: '48 Hours' }
  ];

  howItWorks = [
    { step: 1, title: 'Book Installation Online', description: 'Specify your doors count, installation type, and district in our streamlined online booking form.' },
    { step: 2, title: 'Instant District Routing', description: 'Your installation request is automatically assigned to your local District Branch Head.' },
    { step: 3, title: 'Laser Measurement & Survey', description: 'Our certified technician visits your site for sub-millimeter laser wall clearance measurement.' },
    { step: 4, title: 'Precision Fitting & Handover', description: 'Installation completed with zero wall damage and fitting warranty certificate.' }
  ];

  ngOnInit(): void {
    this.titleService.setTitle('SteelGuard | Precision Steel Door Installation & Fitting');
    this.metaService.updateTag({
      name: 'description',
      content: 'Kerala specialized steel door installation and precision frame mounting. Zero wall damage guaranteed across 5 regional districts.'
    });

    const resolvedServices = this.route.snapshot.data['services'];
    if (resolvedServices) this.services = resolvedServices;

    const resolvedTestimonials = this.route.snapshot.data['testimonials'];
    if (resolvedTestimonials) this.testimonials = resolvedTestimonials;

    const resolvedSiteContent = this.route.snapshot.data['siteContent'] as SiteContent | undefined;
    if (resolvedSiteContent?.banners && resolvedSiteContent.banners.length > 0) {
      this.banners = resolvedSiteContent.banners;
    }

    // Start auto-advancing carousel in browser
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  nextSlide(): void {
    const next = (this.currentSlideIndex() + 1) % this.banners.length;
    this.currentSlideIndex.set(next);
  }

  prevSlide(): void {
    const prev = (this.currentSlideIndex() - 1 + this.banners.length) % this.banners.length;
    this.currentSlideIndex.set(prev);
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.banners.length) {
      this.currentSlideIndex.set(index);
    }
  }

  pauseAutoplay(): void {
    this.isPaused = true;
  }

  resumeAutoplay(): void {
    this.isPaused = false;
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayIntervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 4500);
  }

  private stopAutoplay(): void {
    if (this.autoplayIntervalId) {
      clearInterval(this.autoplayIntervalId);
      this.autoplayIntervalId = null;
    }
  }
}

