import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8f9fa] text-text relative">
      <!-- Outside click dismissal backdrop -->
      @if (settingsOpen() || userMenuOpen()) {
        <div class="fixed inset-0 z-30" (click)="closeAllDropdowns()"></div>
      }

      <!-- TOP NAVIGATION BAR (Google Sheet Design from Screenshot) -->
      <header class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
        <div class="w-full px-4 sm:px-6 lg:px-8">
          <div class="h-16 flex items-center justify-between gap-4">
            
            <!-- Left: Google Sheets Green Icon + App Title + Top Menus -->
            <div class="flex items-center gap-5 sm:gap-8 shrink-0">
              <a routerLink="/admin/bookings" class="flex items-center gap-2.5 group cursor-pointer">
                <!-- Google Sheets Icon -->
                <div class="w-8 h-8 rounded-lg bg-[#0f9d58] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
                  <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-4h7v4zm0-6H5V7h7v4zm7 6h-5v-4h5v4zm0-6h-5V7h5v4z"/>
                  </svg>
                </div>
                <span class="text-base sm:text-lg font-bold tracking-tight text-gray-900">
                  SteelGuard Orders Sheet
                </span>
              </a>

              <!-- Top Menus: Orders, Settings, Reports (As given in screenshot) -->
              <nav class="hidden sm:flex items-center gap-5 text-xs sm:text-sm font-medium text-gray-600">
                <a
                  routerLink="/admin/bookings"
                  routerLinkActive="text-[#0f9d58] font-bold"
                  class="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Orders
                </a>

                <!-- Settings Dropdown -->
                <div class="relative group py-2">
                  <button
                    type="button"
                    class="flex items-center gap-1 hover:text-gray-900 transition-colors cursor-pointer focus:outline-none"
                    (click)="toggleSettings()"
                  >
                    <span
                      class="group-hover:text-[#0f9d58] transition-colors"
                      [class.text-[#0f9d58]]="settingsOpen()"
                      [class.font-bold]="settingsOpen()"
                    >Settings</span>
                    <svg
                      class="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0f9d58] group-hover:rotate-180 transition-all duration-200"
                      [class.rotate-180]="settingsOpen()"
                      [class.text-[#0f9d58]]="settingsOpen()"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <!-- Dropdown Menu with unbreakable pseudo-bridge, native hover, and click state -->
                  <div
                    class="absolute left-0 top-full pt-1.5 w-48 z-50 hidden group-hover:block hover:block before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                    [class.!block]="settingsOpen()"
                  >
                    <div class="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-xs overflow-hidden">
                      <a
                        routerLink="/admin/branch-heads"
                        (click)="closeAllDropdowns()"
                        class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0f9d58] font-medium transition-colors cursor-pointer"
                      >
                        Branch Heads
                      </a>
                      <a
                        routerLink="/admin/areas"
                        (click)="closeAllDropdowns()"
                        class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0f9d58] font-medium transition-colors cursor-pointer"
                      >
                        District Areas
                      </a>
                      <a
                        routerLink="/admin/clients"
                        (click)="closeAllDropdowns()"
                        class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0f9d58] font-medium transition-colors cursor-pointer"
                      >
                        Clients Directory
                      </a>
                    </div>
                  </div>
                </div>

                <!-- Reports (Overview Dashboard) -->
                <a
                  routerLink="/admin"
                  [routerLinkActiveOptions]="{ exact: true }"
                  routerLinkActive="text-[#0f9d58] font-bold"
                  (click)="closeAllDropdowns()"
                  class="hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Reports
                </a>
              </nav>
            </div>

            <!-- Right: User Avatar EA + Elena Vance + Dropdown Arrow -->
            <div class="relative flex items-center gap-3">
              <button
                type="button"
                (click)="userMenuOpen.set(!userMenuOpen())"
                class="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <!-- Avatar circle EA -->
                <div class="w-8 h-8 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  EA
                </div>
                <span class="text-xs sm:text-sm font-medium text-gray-800 hidden md:inline">
                  {{ auth.currentUser()?.name || 'Elena Vance' }}
                </span>
                <svg class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- User Dropdown Menu -->
              @if (userMenuOpen()) {
                <div
                  class="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn"
                  (click)="userMenuOpen.set(false)"
                >
                  <div class="px-4 py-2 border-b border-gray-100">
                    <p class="text-xs font-bold text-gray-900">{{ auth.currentUser()?.name || 'Elena Vance' }}</p>
                    <p class="text-[10px] text-gray-500">Super Admin (Operations)</p>
                  </div>

                  <a routerLink="/" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Public Website</span>
                  </a>

                  <a routerLink="/admin/branch-heads" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Branch Heads</span>
                  </a>

                  <a routerLink="/admin/areas" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>District Areas</span>
                  </a>

                  <div class="border-t border-gray-100 my-1"></div>

                  <button
                    type="button"
                    (click)="auth.logout()"
                    class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                  >
                    <svg class="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      </header>

      <!-- Main Admin Content Area (Centered Google Sheet Canvas) -->
      <main class="flex-1 w-full max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 py-5">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  userMenuOpen = signal(false);
  settingsOpen = signal(false);

  toggleSettings() {
    this.settingsOpen.set(!this.settingsOpen());
  }

  closeAllDropdowns() {
    this.settingsOpen.set(false);
    this.userMenuOpen.set(false);
  }
}
