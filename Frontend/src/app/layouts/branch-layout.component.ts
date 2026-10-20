import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-branch-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-background text-text flex flex-col">
      <!-- Top Navigation Bar -->
      <header class="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-xs">
        <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <!-- Logo & District Hub -->
          <div class="flex items-center gap-4 sm:gap-6">
            <a routerLink="/branch" class="flex items-center gap-2.5 sm:gap-3 group">
              <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-text-inverted shadow-soft group-hover:scale-105 transition-transform shrink-0">
                <svg class="w-5.5 h-5.5 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <span class="text-lg sm:text-xl font-black tracking-tight text-primary">SteelGuard</span>
            </a>

            <!-- Desktop Nav Links -->
            <nav class="hidden md:flex items-center gap-1.5 pl-4 border-l border-border text-xs sm:text-sm font-bold">
              <a
                routerLink="/branch"
                [routerLinkActiveOptions]="{ exact: true }"
                routerLinkActive="bg-surface-muted text-primary border-primary/20 shadow-xs"
                class="px-3.5 py-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted/60 transition-all border border-transparent"
              >
                Dashboard
              </a>
              <a
                routerLink="/branch/bookings"
                routerLinkActive="bg-surface-muted text-primary border-primary/20 shadow-xs"
                class="px-3.5 py-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted/60 transition-all border border-transparent"
              >
                Worksheet Jobs
              </a>
              <a
                routerLink="/branch/profile"
                routerLinkActive="bg-surface-muted text-primary border-primary/20 shadow-xs"
                class="px-3.5 py-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-muted/60 transition-all border border-transparent"
              >
                Branch Profile
              </a>
            </nav>
          </div>

          <!-- User Info & Actions -->
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-muted border border-border">
              <div class="w-7 h-7 rounded-lg bg-primary/10 text-primary font-black text-xs flex items-center justify-center">
                {{ (auth.currentUser()?.name || 'B').charAt(0) }}
              </div>
              <div class="text-left">
                <span class="text-xs font-bold text-text block leading-none">{{ auth.currentUser()?.name }}</span>
                <span class="text-[10px] font-black text-accent uppercase tracking-wider block mt-0.5">
                  {{ auth.currentUser()?.districtId?.replace('dist-', '')?.toUpperCase() || 'DISTRICT' }} HUB
                </span>
              </div>
            </div>

            <a
              routerLink="/"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-surface-muted text-text-muted hover:text-text text-xs font-semibold transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Public Site</span>
            </a>

            <button
              type="button"
              (click)="auth.logout()"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-danger/10 hover:bg-danger text-danger hover:text-text-inverted border border-danger/30 hover:border-danger transition-all duration-200 flex items-center gap-1.5 cursor-pointer group"
              title="Sign Out"
            >
              <svg class="w-3.5 h-3.5 text-danger group-hover:text-text-inverted transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Bar (only visible on small screens) -->
      <nav class="md:hidden fixed bottom-0 z-40 w-full bg-surface/95 backdrop-blur-md border-t border-border px-4 py-2 flex items-center justify-around shadow-2xl">
        <a
          routerLink="/branch"
          [routerLinkActiveOptions]="{ exact: true }"
          routerLinkActive="text-primary font-black"
          class="flex flex-col items-center gap-1 text-[11px] text-text-muted transition-colors py-1 px-3 rounded-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </a>

        <a
          routerLink="/branch/bookings"
          routerLinkActive="text-primary font-black"
          class="flex flex-col items-center gap-1 text-[11px] text-text-muted transition-colors py-1 px-3 rounded-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Worksheet</span>
        </a>

        <a
          routerLink="/branch/profile"
          routerLinkActive="text-primary font-black"
          class="flex flex-col items-center gap-1 text-[11px] text-text-muted transition-colors py-1 px-3 rounded-xl"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  `
})
export class BranchLayoutComponent {
  auth = inject(AuthService);
}

