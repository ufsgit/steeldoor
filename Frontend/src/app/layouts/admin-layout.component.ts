import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen w-full bg-white text-gray-900 flex flex-col select-none font-sans">
      <!-- Outside click dismissal backdrop -->
      @if (settingsOpen() || userMenuOpen()) {
        <div class="fixed inset-0 z-30" (click)="closeAllDropdowns()"></div>
      }

      <!-- Top Header Row (Full Screen Edge-to-Edge) -->
      <header class="w-full bg-white border-b border-gray-200 px-7 sm:px-10 py-3.5 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-40">
        
        <!-- Left: Google Sheets Green Icon + App Title + Top Menus -->
        <div class="flex items-center gap-6 shrink-0">
          <a routerLink="/admin" class="flex items-center gap-2.5 group cursor-pointer">
            <!-- Google Sheets Icon -->
            <div class="w-8 h-8 rounded-[6px] bg-[#0f9d58] flex items-center justify-center text-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <svg class="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-4h7v4zm0-6H5V7h7v4zm7 6h-5v-4h5v4zm0-6h-5V7h5v4z"/>
              </svg>
            </div>
            <span class="text-[18px] font-bold tracking-tight text-gray-900">
              SteelGuard Orders Sheet
            </span>
          </a>

          <!-- Subtle Vertical Divider -->
          <div class="h-4 w-px bg-gray-200 hidden sm:block"></div>

          <!-- Top Navigation: Orders, Settings, Reports -->
          <nav class="hidden sm:flex items-center gap-6 text-[14px] font-medium text-gray-600">
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="font-bold text-gray-900"
              class="hover:text-gray-900 transition-colors cursor-pointer"
            >
              Orders
            </a>

            <!-- Settings Dropdown -->
            <div class="relative group py-1">
              <button
                type="button"
                class="flex items-center hover:text-gray-900 transition-colors cursor-pointer focus:outline-none"
                (click)="toggleSettings()"
              >
                <span
                  class="group-hover:text-gray-900 transition-colors"
                  [class.font-bold]="settingsOpen()"
                  [class.text-gray-900]="settingsOpen()"
                >Settings</span>
              </button>

              <!-- Dropdown Menu -->
              <div
                class="absolute left-0 top-full pt-2 w-48 z-50 hidden group-hover:block hover:block"
                [class.!block]="settingsOpen()"
              >
                <div class="bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-xs overflow-hidden">
                  <a
                    routerLink="/admin/users"
                    (click)="closeAllDropdowns()"
                    class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0f9d58] font-medium transition-colors cursor-pointer"
                  >
                    Users
                  </a>
                  <a
                    routerLink="/admin/areas"
                    (click)="closeAllDropdowns()"
                    class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#0f9d58] font-medium transition-colors cursor-pointer"
                  >
                    District Areas
                  </a>
                </div>
              </div>
            </div>

            <!-- Reports Link -->
            <a
              routerLink="/admin/reports"
              routerLinkActive="font-bold text-gray-900"
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
            class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <!-- Avatar circle EA -->
            <div class="w-7 h-7 rounded-full bg-[#0f9d58] text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
              EA
            </div>
            <span class="text-sm font-semibold text-gray-900 hidden md:inline">
              {{ displayName() }}
            </span>
            <svg class="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          @if (userMenuOpen()) {
            <div
              class="absolute right-0 top-11 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-fadeIn"
              (click)="userMenuOpen.set(false)"
            >
              <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs font-bold text-gray-900">{{ displayName() }}</p>
                <p class="text-[10px] text-gray-500">Super Admin (Operations)</p>
              </div>

              <a routerLink="/admin/users" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <span>Users</span>
              </a>
              <a routerLink="/admin/areas" class="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <span>District Areas</span>
              </a>

              <div class="border-t border-gray-100 my-1"></div>

              <button
                type="button"
                (click)="auth.logout()"
                class="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold cursor-pointer"
              >
                <span>Sign Out</span>
              </button>
            </div>
          }
        </div>
      </header>

      <!-- Main Content Area (Full Width) -->
      <main class="w-full flex-1 flex flex-col bg-white">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  userMenuOpen = signal(false);
  settingsOpen = signal(false);

  displayName = computed(() => {
    const raw = this.auth.currentUser()?.name;
    if (!raw) return 'Elena Vance';
    return raw.replace(/\s*\(Super Admin\)/i, '').trim();
  });

  toggleSettings() {
    this.settingsOpen.set(!this.settingsOpen());
  }

  closeAllDropdowns() {
    this.settingsOpen.set(false);
    this.userMenuOpen.set(false);
  }
}
