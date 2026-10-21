
import { Component, PLATFORM_ID, inject, signal, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { LoginModalComponent } from '../shared/components/login-modal.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModalComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-background text-text selection:bg-accent/20 relative">
      <!-- Navigation Bar (Directly aligned with page content: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8) -->
      <header
        class="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-xl border-b border-border shadow-xs transition-all duration-300"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          <!-- Logo (Left) -->
          <a routerLink="/" class="flex items-center gap-3 group shrink-0">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary flex items-center justify-center text-text-inverted shadow-soft group-hover:scale-105 transition-transform">
              <svg class="w-5.5 sm:w-6 h-5.5 sm:h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor"/>
                <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <span class="text-xl sm:text-2xl font-black tracking-tight text-primary">SteelGuard</span>
          </a>

          <!-- Desktop Navigation Links (Centered) -->
          <nav class="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-semibold">
            <a
              routerLink="/"
              routerLinkActive="bg-primary/10 text-primary font-bold"
              [routerLinkActiveOptions]="{ exact: true }"
              class="h-10 px-4 rounded-xl text-text-muted hover:text-primary hover:bg-surface-muted transition-all inline-flex items-center justify-center"
            >
              Home
            </a>
            <a
              routerLink="/about"
              routerLinkActive="bg-primary/10 text-primary font-bold"
              class="h-10 px-4 rounded-xl text-text-muted hover:text-primary hover:bg-surface-muted transition-all inline-flex items-center justify-center"
            >
              About
            </a>
            <a
              routerLink="/contact"
              routerLinkActive="bg-primary/10 text-primary font-bold"
              class="h-10 px-4 rounded-xl text-text-muted hover:text-primary hover:bg-surface-muted transition-all inline-flex items-center justify-center"
            >
              Contact Us
            </a>
          </nav>

          <!-- Right Action CTA Buttons -->
          <div class="hidden md:flex items-center gap-2.5 sm:gap-3 shrink-0">
            <!-- Book Installation CTA Button -->
            <a
              routerLink="/book-now"
              class="h-10 px-5 rounded-xl text-xs sm:text-sm font-bold bg-primary hover:bg-primary-hover text-text-inverted shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Book Installation</span>
              <svg class="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </a>

            <!-- Login Button & Portal Access -->
            @if (!auth.isAuthenticated()) {
              <button
                type="button"
                (click)="isLoginModalOpen.set(true)"
                class="h-10 px-5 rounded-xl text-xs sm:text-sm font-bold border border-primary/30 hover:border-primary text-primary hover:text-primary-hover bg-surface hover:bg-primary/5 shadow-xs hover:shadow-soft transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 inline-flex items-center justify-center gap-2 group cursor-pointer"
                id="nav-login-button"
                title="Sign in to Admin, Branch Head, Customer, Company, or Dealer Portal"
              >
                <svg class="w-4 h-4 text-primary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Login</span>
              </button>
            } @else {
              <!-- Authenticated Portal Link & Logout Button -->
              <a
                [routerLink]="getPortalLink()"
                class="h-10 px-4 rounded-xl text-xs font-bold bg-surface-muted hover:bg-border text-text border border-border shadow-soft transition-all inline-flex items-center justify-center gap-2"
                title="Go to your portal"
              >
                <span>Portal</span>
              </a>
              <button
                type="button"
                (click)="auth.logout()"
                class="h-10 px-4 rounded-xl text-xs sm:text-sm font-bold bg-danger/10 hover:bg-danger text-danger hover:text-text-inverted border border-danger/20 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Sign Out"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign Out</span>
              </button>
            }
          </div>

          <!-- Mobile Hamburger Toggle -->
          <button
            type="button"
            (click)="mobileMenuOpen.set(!mobileMenuOpen())"
            class="md:hidden w-11 h-11 rounded-xl text-text hover:bg-surface-muted border border-border transition-colors flex items-center justify-center cursor-pointer"
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
                routerLink="/book-now"
                routerLinkActive="bg-primary/10 text-primary font-bold"
                (click)="mobileMenuOpen.set(false)"
                class="px-4 py-2.5 rounded-xl border border-transparent text-text hover:bg-surface-muted transition-colors flex items-center justify-between font-bold text-primary"
              >
                <span>Book Installation</span>
              </a>
            </nav>

            <!-- Mobile Auth Section -->
            <div class="pt-3 border-t border-border">
              @if (!auth.isAuthenticated()) {
                <button
                  type="button"
                  (click)="isLoginModalOpen.set(true); mobileMenuOpen.set(false)"
                  class="w-full text-center py-2.5 rounded-xl bg-primary text-text-inverted text-xs font-bold shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg class="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <span>Portal Login</span>
                </button>
              } @else {
                <div class="flex flex-col gap-2">
                  <a
                    [routerLink]="getPortalLink()"
                    (click)="mobileMenuOpen.set(false)"
                    class="w-full text-center py-2.5 rounded-xl bg-surface-muted text-text text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span class="w-2 h-2 rounded-full bg-accent"></span>
                    <span>Go to Portal ({{ auth.currentUser()?.role }})</span>
                  </a>
                  <button
                    type="button"
                    (click)="auth.logout(); mobileMenuOpen.set(false)"
                    class="w-full text-center py-2 text-xs text-danger font-medium cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              }
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
                <div class="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-accent">
                  <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="2" width="16" height="20" rx="2"/>
                    <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <span class="text-lg font-bold tracking-tight text-text-inverted">SteelGuard</span>
              </div>
              <p class="text-xs text-text-inverted/70 leading-relaxed">
                Precision steel door installation, frame retrofitting, and certified fire & security door structural mounting across Kerala districts.
              </p>
              <div class="flex items-center gap-2 text-xs text-accent">
                <span class="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                <span>Active in 5 Regional Districts</span>
              </div>
            </div>

            <!-- Col 2: Quick Links -->
            <div class="space-y-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-accent">Quick Navigation</h4>
              <ul class="space-y-2 text-xs text-text-inverted/75">
                <li><a routerLink="/" class="hover:text-accent transition-colors">Home Portal</a></li>
                <li><a routerLink="/about" class="hover:text-accent transition-colors">About Our Network</a></li>
                <li><a routerLink="/contact" class="hover:text-accent transition-colors">Contact Us</a></li>
                <li><a routerLink="/book-now" class="hover:text-accent transition-colors">Schedule Installation</a></li>
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
                <div class="text-xs font-bold text-accent">+91 1800-425-DOOR</div>
                <div class="text-[10px] text-text-inverted/60">Mon - Sat: 8:00 AM - 7:00 PM</div>
              </div>
            </div>
          </div>

          <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-inverted/60">
            <p>© {{ currentYear }} SteelGuard. All rights reserved.</p>
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

  getPortalLink(): string {
    const role = this.auth.userRole();
    if (role === 'admin' || role === 'coordinator') return '/admin';
    if (role === 'branch_head') return '/branch';
    if (role === 'user' || role === 'client') return '/client';
    return '/';
  }
}
