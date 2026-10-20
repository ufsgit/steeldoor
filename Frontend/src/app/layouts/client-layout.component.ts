import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background text-text flex flex-col">
      <!-- Client Portal Header -->
      <header class="bg-surface/95 backdrop-blur-xl border-b border-border sticky top-0 z-40 shadow-xs transition-all">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/client" class="flex items-center gap-2.5 sm:gap-3 group">
              <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-text-inverted shadow-soft group-hover:scale-105 transition-transform shrink-0">
                <svg class="w-5.5 h-5.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <span class="text-lg sm:text-xl font-black tracking-tight text-primary">SteelGuard</span>
            </a>
          </div>

          <!-- Nav Items -->
          <nav class="hidden md:flex items-center gap-2 text-sm font-semibold">
            <a
              routerLink="/client"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="bg-primary/10 text-primary font-bold border-primary/20"
              class="h-10 px-4 rounded-xl border border-transparent text-text-muted hover:text-text hover:bg-surface-muted transition-all flex items-center gap-2"
            >
              @if (isCompany()) {
                <span>Dealers</span>
              } @else {
                <span>Orders</span>
              }
            </a>

            @if (!isCompany()) {
              <a
                routerLink="/book-now"
                class="h-10 px-4 rounded-xl text-primary hover:bg-primary/10 font-bold transition-all flex items-center gap-1.5"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                <span>{{ isDealer() ? 'New Order' : 'Book Door' }}</span>
              </a>
            }

            <a
              routerLink="/client/profile"
              routerLinkActive="bg-primary/10 text-primary font-bold border-primary/20"
              class="h-10 px-4 rounded-xl border border-transparent text-text-muted hover:text-text hover:bg-surface-muted transition-all flex items-center gap-2"
            >
              Profile
            </a>
          </nav>

          <!-- User Badge & Actions -->
          <div class="flex items-center gap-3">
            <a
              routerLink="/"
              class="hidden sm:flex h-11 px-4 rounded-xl text-xs sm:text-sm font-bold border border-border bg-surface hover:bg-surface-muted text-text hover:text-primary transition-all items-center gap-2 shadow-xs group cursor-pointer"
              title="Visit Public Website"
            >
              <svg class="w-4 h-4 text-accent group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Public Site</span>
            </a>

            <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-muted/60 border border-border">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-xs shrink-0"
                [ngClass]="{
                  'bg-purple-100 text-purple-800 border border-purple-200': isCompany(),
                  'bg-amber-100 text-amber-800 border border-amber-200': isDealer(),
                  'bg-accent/20 text-accent-dark border border-accent/30': isCustomer()
                }"
              >
                {{ (auth.currentUser()?.name || 'C').charAt(0) }}
              </div>
              <div class="hidden sm:block text-left leading-tight">
                <span class="text-xs font-bold text-text block truncate max-w-[120px]">{{ auth.currentUser()?.name }}</span>
                <span
                  class="text-[10px] uppercase font-bold block"
                  [ngClass]="{
                    'text-purple-600': isCompany(),
                    'text-amber-600': isDealer(),
                    'text-accent-dark': isCustomer()
                  }"
                >
                  {{ auth.currentUser()?.clientType || auth.currentUser()?.role || 'User' }}
                </span>
              </div>
            </div>

            <!-- Attractive Sign Out Button -->
            <button
              type="button"
              (click)="auth.logout()"
              class="h-11 px-4 sm:px-5 rounded-xl text-xs sm:text-sm font-bold bg-danger/10 hover:bg-danger text-danger hover:text-text-inverted border border-danger/30 hover:border-danger shadow-soft hover:shadow-card transition-all duration-200 flex items-center gap-2 cursor-pointer group transform hover:-translate-y-0.5 active:translate-y-0"
              title="Sign Out of Account"
            >
              <svg
                class="w-4 h-4 text-danger group-hover:text-text-inverted transition-colors transform group-hover:-translate-x-0.5 duration-200"
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
          </div>
        </div>
      </header>

      <!-- Main Body -->
      <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class ClientLayoutComponent {
  auth = inject(AuthService);

  isCompany = computed(() => this.auth.currentUser()?.clientType === 'company');
  isDealer = computed(() => this.auth.currentUser()?.clientType === 'dealer');
  isCustomer = computed(() => !this.isCompany() && !this.isDealer());

  portalSubtitle = computed(() => {
    if (this.isCompany()) return 'Enterprise Partner Portal';
    if (this.isDealer()) return 'Authorized Dealer Hub';
    return 'Customer Portal';
  });
}
