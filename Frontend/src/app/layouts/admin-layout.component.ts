import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { SITE_CONFIG } from '../core/site-config';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styles: [`
    .admin-nav-link {
      color: var(--nav-text);
      opacity: 0.85;
      transition: all 0.2s ease;
    }
    .admin-nav-link:hover {
      color: var(--nav-text-hover);
      opacity: 1;
    }
    .admin-nav-link.admin-active {
      color: var(--nav-text);
      font-weight: 700;
      opacity: 1;
    }
    .admin-profile-btn {
      background-color: var(--profile-btn-bg);
      color: var(--profile-btn-text);
      border-color: var(--profile-btn-border);
      transition: all 0.2s ease;
    }
    .admin-profile-btn:hover {
      background-color: var(--profile-btn-hover-bg);
    }
    .admin-profile-badge {
      background-color: var(--profile-badge-bg);
      color: var(--profile-badge-text);
    }
  `],
  template: `
    <div class="min-h-screen w-full bg-white text-gray-900 flex flex-col select-none font-sans">
      <!-- Outside click dismissal backdrop -->
      @if (settingsOpen() || userDropdownOpen()) {
        <div class="fixed inset-0 z-30" (click)="closeAllDropdowns()"></div>
      }

      <!-- Top Header Row (Full Screen Edge-to-Edge) -->
      <header
        class="w-full border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-40 transition-colors"
        [style.backgroundColor]="siteConfig.navbarColor"
        [style.--nav-text]="siteConfig.navbarTextColor"
        [style.--nav-text-hover]="siteConfig.navbarTextHoverColor"
        [style.--profile-btn-bg]="siteConfig.adminProfileBtnBg"
        [style.--profile-btn-hover-bg]="siteConfig.adminProfileBtnHoverBg"
        [style.--profile-btn-text]="siteConfig.adminProfileBtnText"
        [style.--profile-btn-border]="siteConfig.adminProfileBtnBorder"
        [style.--profile-badge-bg]="siteConfig.adminProfileBadgeBg"
        [style.--profile-badge-text]="siteConfig.adminProfileBadgeText"
      >
        
        <!-- Left: Logo in Left Corner + App Title + Top Menus -->
        <div class="flex items-center gap-4 sm:gap-5 shrink-0">
          <a routerLink="/admin" class="flex items-center gap-2.5 group cursor-pointer">
            <img [src]="siteConfig.logo" [alt]="siteConfig.brandName" class="w-8 h-8 rounded-[6px] object-cover shadow-2xs group-hover:scale-105 transition-transform shrink-0" />
            <span class="text-[18px] font-bold tracking-tight" [style.color]="siteConfig.navbarTextColor">
              {{ siteConfig.adminTitle }}
            </span>
          </a>

          <!-- Subtle Vertical Divider -->
          <div class="h-4 w-px bg-current/20 hidden sm:block"></div>

          <!-- Top Navigation: Orders, Settings, History -->
          <nav class="hidden sm:flex items-center gap-6 text-[14px] font-medium">
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="admin-active"
              class="admin-nav-link cursor-pointer"
            >
              Orders
            </a>

            <!-- Settings Dropdown: Only visible for Company Admin (role_id === 1) -->
            @if (canAccessSettings()) {
              <div class="relative group py-1">
                <button
                  type="button"
                  class="admin-nav-link flex items-center cursor-pointer focus:outline-none"
                  (click)="toggleSettings()"
                >
                  <span
                    class="transition-colors"
                    [class.font-bold]="settingsOpen()"
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
                      class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ea1f25] font-medium transition-colors cursor-pointer"
                    >
                      Users
                    </a>
                    <a
                      routerLink="/admin/areas"
                      (click)="closeAllDropdowns()"
                      class="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#ea1f25] font-medium transition-colors cursor-pointer"
                    >
                      District Areas
                    </a>
                  </div>
                </div>
              </div>
            }

            <!-- History Link: Only visible for Company Admin (role_id === 1) -->
            @if (canAccessHistory()) {
              <a
                routerLink="/admin/history"
                routerLinkActive="admin-active"
                (click)="closeAllDropdowns()"
                class="admin-nav-link cursor-pointer"
              >
                History
              </a>
            }

            <!-- Brochure Docs Link: Only visible for Company Admin (role_id === 1) -->
            @if (canAccessBrochures()) {
              <a
                routerLink="/admin/brochures"
                routerLinkActive="admin-active"
                (click)="closeAllDropdowns()"
                class="admin-nav-link cursor-pointer"
              >
                Brochure Docs
              </a>
            }
          </nav>
        </div>

        <!-- Right: Home Portal link + Username dropdown with Logout -->
        <div class="relative flex items-center gap-2.5 sm:gap-3">
          <!-- Home Portal Pill (opens Home page in a new tab, keeping session active) -->
          <a
            routerLink="/"
            target="_blank"
            rel="noopener noreferrer"
            (click)="closeAllDropdowns()"
            class="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-red-50 hover:border-[#ea1f25]/40 text-gray-700 hover:text-[#ea1f25] text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
            title="Open public Home page in a new tab without logging out"
          >
            <svg class="w-4 h-4 text-[#ea1f25] group-hover:scale-105 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="hidden sm:inline">Home Portal</span>
          </a>

          <!-- User Profile Pill -->
          <button
            type="button"
            (click)="toggleUserDropdown()"
            class="admin-profile-btn flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border shadow-2xs transition-all cursor-pointer focus:outline-none"
          >
            <!-- User initial badge -->
            <div class="admin-profile-badge w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">
              {{ userName().charAt(0).toUpperCase() }}
            </div>
            <span class="text-xs font-semibold max-w-[120px] truncate" [style.color]="siteConfig.adminProfileBtnText">{{ userName() }}</span>
            <svg
              class="w-3.5 h-3.5 transition-transform duration-200"
              [style.color]="siteConfig.adminProfileBtnText"
              [class.rotate-180]="userDropdownOpen()"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          @if (userDropdownOpen()) {
            <div class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 text-xs z-50 overflow-hidden divide-y divide-gray-100">
              <!-- User Info Header -->
              <div class="px-3.5 py-2">
                <p class="font-bold text-gray-900 truncate">{{ userName() }}</p>
                @if (userRoleDisplay()) {
                  <p class="text-[11px] text-gray-500 font-medium capitalize mt-0.5">{{ userRoleDisplay() }}</p>
                }
              </div>

              <!-- Logout Action -->
              <div class="pt-1">
                <button
                  type="button"
                  (click)="logout()"
                  class="w-full text-left px-3.5 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors flex items-center gap-2 cursor-pointer group"
                >
                  <svg
                    class="w-4 h-4 text-red-500 group-hover:text-red-700 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
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
  readonly siteConfig = SITE_CONFIG;
  settingsOpen = signal(false);
  userDropdownOpen = signal(false);

  // User display name & role
  userName = computed(() => {
    const user = this.auth.currentUser();
    return user?.username || user?.name || 'Admin';
  });

  userRoleDisplay = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '';
    return (user as any).roleName || user.role || '';
  });

  // Allow Company Admin (role_id === 1) to see Settings
  canAccessSettings = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const roleId = Number(user.roleId ?? user.dbRoleId ?? null);
    // Role 1 is company_admin (Company)
    return roleId === 1;
  });

  // Allow only role_id === 1 to access History
  canAccessHistory = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const roleId = Number(user.roleId ?? user.dbRoleId ?? null);
    return roleId === 1;
  });

  // Allow only role_id === 1 to access Brochure Docs
  canAccessBrochures = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return false;
    const roleId = Number(user.roleId ?? user.dbRoleId ?? null);
    return roleId === 1;
  });

  toggleSettings() {
    this.settingsOpen.set(!this.settingsOpen());
    if (this.settingsOpen()) {
      this.userDropdownOpen.set(false);
    }
  }

  toggleUserDropdown() {
    this.userDropdownOpen.set(!this.userDropdownOpen());
    if (this.userDropdownOpen()) {
      this.settingsOpen.set(false);
    }
  }

  closeAllDropdowns() {
    this.settingsOpen.set(false);
    this.userDropdownOpen.set(false);
  }

  logout() {
    this.closeAllDropdowns();
    this.auth.logout();
  }
}
