import { Component, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LoginModalComponent } from '../shared/components/login-modal.component';
import { SITE_CONFIG } from '../core/site-config';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModalComponent],
  styles: [`
    .nav-link {
      color: var(--nav-text);
    }
    .nav-link:hover {
      color: var(--nav-text-hover);
      background-color: color-mix(in srgb, var(--nav-text-hover) 12%, transparent);
    }
    .nav-link.active-link {
      color: var(--nav-text-hover);
      font-weight: 700;
      background-color: color-mix(in srgb, var(--nav-text-hover) 14%, transparent);
    }
    .nav-book-btn {
      background-color: var(--book-btn-bg);
      color: var(--book-btn-text);
      transition: all 0.2s ease;
    }
    .nav-book-btn:hover {
      background-color: var(--book-btn-hover-bg);
    }
    .nav-login-btn {
      background-color: var(--login-btn-bg);
      color: var(--login-btn-text);
      border-color: var(--login-btn-border);
      transition: all 0.2s ease;
    }
    .nav-login-btn:hover {
      background-color: var(--login-btn-hover-bg);
    }
  `],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-text selection:bg-accent/20 relative">
      <!-- Navigation Bar (Directly aligned with page content: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8) -->
      <header
        class="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border shadow-xs transition-all duration-300"
        [style.backgroundColor]="siteConfig.navbarColor"
        [style.--nav-text]="siteConfig.navbarTextColor"
        [style.--nav-text-hover]="siteConfig.navbarTextHoverColor"
        [style.--book-btn-bg]="siteConfig.bookBtnBg"
        [style.--book-btn-hover-bg]="siteConfig.bookBtnHoverBg"
        [style.--book-btn-text]="siteConfig.bookBtnText"
        [style.--login-btn-bg]="siteConfig.loginBtnBg"
        [style.--login-btn-hover-bg]="siteConfig.loginBtnHoverBg"
        [style.--login-btn-text]="siteConfig.loginBtnText"
        [style.--login-btn-border]="siteConfig.loginBtnBorder"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          <!-- Logo (Left) -->
          <a routerLink="/" class="flex items-center gap-3 group shrink-0">
            <img [src]="siteConfig.logo" [alt]="siteConfig.brandName" class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shadow-soft group-hover:scale-105 transition-transform" />
            <span class="text-xl sm:text-2xl font-black tracking-tight" [style.color]="siteConfig.navbarTextColor">{{ siteConfig.brandName }}</span>
          </a>

          <!-- Desktop Navigation Links (Centered) -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold">
            <a
              routerLink="/"
              routerLinkActive="active-link"
              [routerLinkActiveOptions]="{ exact: true }"
              class="h-10 px-4 rounded-xl transition-all inline-flex items-center justify-center nav-link"
            >
              Home
            </a>
            <a
              routerLink="/about"
              routerLinkActive="active-link"
              class="h-10 px-4 rounded-xl transition-all inline-flex items-center justify-center nav-link"
            >
              About
            </a>
            <a
              routerLink="/contact"
              routerLinkActive="active-link"
              class="h-10 px-4 rounded-xl transition-all inline-flex items-center justify-center nav-link"
            >
              Contact Us
            </a>
          </nav>

          <!-- Right Action CTA Buttons -->
          <div class="hidden md:flex items-center gap-2.5 sm:gap-3 shrink-0">
            <!-- Book Installation CTA Button -->
            <a
              routerLink="/bookings/new"
              class="nav-book-btn h-10 px-5 rounded-xl text-xs sm:text-sm font-bold shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book Installation</span>
              <svg class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>

            <!-- Login Button -->
            <button
              type="button"
              (click)="isLoginModalOpen.set(true)"
              class="nav-login-btn h-10 px-5 rounded-xl text-xs sm:text-sm font-bold border shadow-xs hover:shadow-soft transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 group cursor-pointer"
              id="nav-login-button"
              title="Sign in to Admin, Branch Head, Customer, Company, or Dealer Portal"
            >
              <svg class="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>Login</span>
            </button>
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="md:hidden w-11 h-11 rounded-xl border border-current/20 transition-colors flex items-center justify-center cursor-pointer"
            [style.color]="siteConfig.navbarTextColor"
            aria-label="Toggle navigation menu"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              @if (mobileMenuOpen()) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        @if (mobileMenuOpen()) {
          <div class="border-t border-border bg-surface px-4 py-4 space-y-3 shadow-lg md:hidden animate-fadeIn">
            <nav class="flex flex-col gap-1.5 text-sm font-medium">
              <a
                routerLink="/"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="mobileMenuOpen.set(false)"
                class="px-4 py-2.5 rounded-xl border border-transparent text-text hover:bg-surface-muted transition-colors flex items-center justify-between"
              >
                <span>Home</span>
              </a>
              <a
                routerLink="/about"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                (click)="mobileMenuOpen.set(false)"
                class="px-4 py-2.5 rounded-xl border border-transparent text-text hover:bg-surface-muted transition-colors flex items-center justify-between"
              >
                <span>About</span>
              </a>
              <a
                routerLink="/contact"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                (click)="mobileMenuOpen.set(false)"
                class="px-4 py-2.5 rounded-xl border border-transparent text-text hover:bg-surface-muted transition-colors flex items-center justify-between"
              >
                <span>Contact Us</span>
              </a>
              <a
                routerLink="/bookings/new"
                (click)="mobileMenuOpen.set(false)"
                class="nav-book-btn px-4 py-2.5 rounded-xl font-bold flex items-center justify-between text-xs"
              >
                <span>Book Installation</span>
              </a>
            </nav>

            <!-- Mobile Auth Section -->
            <div class="pt-3 border-t border-border">
              <button
                type="button"
                (click)="isLoginModalOpen.set(true); mobileMenuOpen.set(false)"
                class="nav-login-btn w-full text-center py-2.5 rounded-xl border text-xs font-bold shadow-soft flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg class="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Portal Login</span>
              </button>
            </div>
          </div>
        }
      </header>

      <!-- Main Body Router Content -->
      <main class="flex-1 pt-6 sm:pt-10">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-primary-dark text-text-inverted border-t border-border/20 pt-14 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-surface/10">
            <!-- Col 1: Brand & Tagline -->
            <div class="space-y-4">
              <div class="flex items-center gap-2.5">
                <img [src]="siteConfig.logo" [alt]="siteConfig.brandName" class="w-9 h-9 rounded-xl object-cover shadow-soft" />
                <span class="text-xl font-black text-text-inverted tracking-tight">{{ siteConfig.brandName }}</span>
              </div>
              <p class="text-xs text-text-inverted/70 leading-relaxed">
                {{ siteConfig.footerAbout }}
              </p>
            </div>

            <!-- Col 2: Quick Links -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-accent">Quick Navigation</h4>
              <ul class="space-y-2 text-xs text-text-inverted/75">
                <li><a routerLink="/" class="hover:text-accent transition-colors">Home Portal</a></li>
                <li><a routerLink="/about" class="hover:text-accent transition-colors">About Our Network</a></li>
                <li><a routerLink="/contact" class="hover:text-accent transition-colors">Contact Us</a></li>
                <li><a routerLink="/bookings/new" class="hover:text-accent transition-colors">Schedule Installation</a></li>
                <li>
                  <button
                    type="button"
                    (click)="isLoginModalOpen.set(true)"
                    class="hover:text-accent transition-colors text-left cursor-pointer"
                  >
                    Staff & Client Login
                  </button>
                </li>
              </ul>
            </div>

            <!-- Col 3: Installation Services -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-accent">Installation Services</h4>
              <ul class="space-y-2 text-xs text-text-inverted/75">
                <li>Residential Steel Door Mounting</li>
                <li>Certified Fire Door Fitting</li>
                <li>Old Frame Retrofit & Replacement</li>
                <li>Luxury Pivot Door Heavy Mounting</li>
                <li>Sub-Millimeter Laser Alignment</li>
              </ul>
            </div>

            <!-- Col 4: Coverage & Support -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-accent">District Hubs</h4>
              <p class="text-xs text-text-inverted/70">
                Ernakulam • Trivandrum • Kozhikode • Thrissur • Kannur
              </p>
              <div class="p-3 rounded-xl bg-surface/5 border border-surface/10 space-y-1">
                <div class="text-[11px] text-text-inverted/60 font-medium">Customer Support Desk</div>
                <div class="text-xs font-bold text-accent">{{ siteConfig.phone }}</div>
                <div class="text-[10px] text-text-inverted/60">{{ siteConfig.workingHours }}</div>
              </div>
            </div>
          </div>

          <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-inverted/60">
            <p>© {{ currentYear }} {{ siteConfig.copyright }}</p>
            <div class="flex items-center gap-4 text-xs">
              <span class="hover:text-text-inverted transition-colors cursor-pointer">Privacy Policy</span>
              <span class="hover:text-text-inverted transition-colors cursor-pointer">Terms of Service</span>
              <span class="hover:text-text-inverted transition-colors cursor-pointer">Warranty Standards</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- IN-NAVBAR LOGIN MODAL POPUP -->
      <app-login-modal
        [isOpen]="isLoginModalOpen()"
        (closeModal)="isLoginModalOpen.set(false)"
      ></app-login-modal>
    </div>
  `
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  readonly siteConfig = SITE_CONFIG;
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  auth = inject(AuthService);

  mobileMenuOpen = signal(false);
  isHeaderHidden = signal(false);
  isLoginModalOpen = signal(false);

  private lastScrollY = 0;
  private scrollListenerRemover?: () => void;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const handleScroll = () => {
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

        // Near top of page: always reveal
        if (currentScroll <= 50) {
          if (this.isHeaderHidden()) {
            this.ngZone.run(() => {
              this.isHeaderHidden.set(false);
              this.cdr.markForCheck();
            });
          }
          this.lastScrollY = currentScroll;
          return;
        }

        const delta = currentScroll - this.lastScrollY;

        // Scrolling down by more than 5px
        if (delta > 5 && currentScroll > 80) {
          if (!this.isHeaderHidden()) {
            this.ngZone.run(() => {
              this.isHeaderHidden.set(true);
              if (this.mobileMenuOpen()) {
                this.mobileMenuOpen.set(false);
              }
              this.cdr.markForCheck();
            });
          }
          this.lastScrollY = currentScroll;
        }
        // Scrolling up by more than 5px
        else if (delta < -5) {
          if (this.isHeaderHidden()) {
            this.ngZone.run(() => {
              this.isHeaderHidden.set(false);
              this.cdr.markForCheck();
            });
          }
          this.lastScrollY = currentScroll;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      this.scrollListenerRemover = () => window.removeEventListener('scroll', handleScroll);
    }
  }

  ngOnDestroy(): void {
    if (this.scrollListenerRemover) {
      this.scrollListenerRemover();
    }
  }
}
