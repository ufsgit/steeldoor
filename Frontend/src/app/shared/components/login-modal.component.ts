import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../toast/toast.service';

export type SimpleLoginRole = 'coordinator' | 'customer' | 'company' | 'dealer';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    @if (isOpen) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-text/60 backdrop-blur-md transition-opacity animate-fadeIn"
        (click)="close()"
      ></div>

      <!-- Modal Dialog (Clean, Compact, max-w-md) -->
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <div
          class="relative w-full max-w-md bg-surface rounded-3xl border border-border shadow-elevated transition-all overflow-hidden flex flex-col animate-scaleUp"
          (click)="$event.stopPropagation()"
        >
          <!-- Header with Close Button -->
          <div class="p-5 sm:p-6 border-b border-border bg-surface-muted/30 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-accent shadow-soft shrink-0">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="4" y="2" width="16" height="20" rx="2"/>
                  <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h2 class="text-base sm:text-lg font-black text-text leading-tight">Sign In to SteelGuard</h2>
                <p class="text-xs text-text-muted">Enter credentials or select your role.</p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="w-9 h-9 rounded-xl border border-border text-text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center shrink-0 cursor-pointer"
              aria-label="Close login modal"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5">
            <!-- Simple Role Selector (Admin vs User) -->
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-muted border border-border">
                <button
                  type="button"
                  (click)="selectCategory('admin')"
                  class="py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="activeCategory() === 'admin'
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'"
                >
                  <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  (click)="selectCategory('user')"
                  class="py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  [ngClass]="activeCategory() === 'user'
                    ? 'bg-surface text-primary shadow-sm border border-border'
                    : 'text-text-muted hover:text-text'"
                >
                  <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <span>User</span>
                </button>
              </div>

              <!-- Sub-pills for User: Standard User | Company | Dealer -->
              @if (activeCategory() === 'user') {
                <div class="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-background border border-border animate-fadeIn">
                  <button
                    type="button"
                    (click)="selectUserType('customer')"
                    class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                    [ngClass]="activeUserType() === 'customer'
                      ? 'bg-primary text-text-inverted shadow-soft'
                      : 'text-text-muted hover:text-text hover:bg-surface'"
                  >
                    Customer
                  </button>

                  <button
                    type="button"
                    (click)="selectUserType('company')"
                    class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                    [ngClass]="activeUserType() === 'company'
                      ? 'bg-primary text-text-inverted shadow-soft'
                      : 'text-text-muted hover:text-text hover:bg-surface'"
                  >
                    Company
                  </button>

                  <button
                    type="button"
                    (click)="selectUserType('dealer')"
                    class="py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                    [ngClass]="activeUserType() === 'dealer'
                      ? 'bg-primary text-text-inverted shadow-soft'
                      : 'text-text-muted hover:text-text hover:bg-surface'"
                  >
                    Dealer
                  </button>
                </div>
              }
            </div>

            <!-- Login Form -->
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
              <!-- Username Field -->
              <div class="space-y-1.5">
                <label class="block text-xs font-bold text-text">Username</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    formControlName="username"
                    placeholder="Enter username"
                    class="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <!-- Password Field with Show/Hide Toggle -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="block text-xs font-bold text-text">Password</label>
                  <button
                    type="button"
                    (click)="togglePasswordVisibility()"
                    class="text-[11px] font-semibold text-text-muted hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    @if (showPassword()) {
                      <span>Hide</span>
                    } @else {
                      <span>Show</span>
                    }
                  </button>
                </div>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    placeholder="Enter password"
                    class="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
              </div>

              <!-- Sign In Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                @if (isLoading()) {
                  <span class="w-4 h-4 border-2 border-text-inverted border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing In...</span>
                } @else {
                  <span>Sign In</span>
                  <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                }
              </button>
            </form>

            <!-- Bottom Register Link -->
            <div class="pt-3 border-t border-border/60 text-center">
              <p class="text-xs text-text-muted">
                New customer or dealer partner?
                <a
                  routerLink="/register"
                  (click)="close()"
                  class="text-primary font-bold hover:underline ml-1"
                >
                  Self-Register
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class LoginModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  activeCategory = signal<'admin' | 'user'>('admin');
  activeUserType = signal<'customer' | 'company' | 'dealer'>('customer');
  isLoading = signal(false);
  showPassword = signal(false);

  loginForm!: FormGroup;

  private credentialsMap = {
    admin: { user: 'admin', pass: 'admin123' },
    coordinator: { user: 'admin', pass: 'admin123' },
    user: { user: 'user', pass: 'user123' },
    customer: { user: 'user', pass: 'user123' },
    company: { user: 'metro_builders', pass: 'company123' },
    dealer: { user: 'apex_dealer', pass: 'dealer123' }
  };

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [this.credentialsMap.admin.user, Validators.required],
      password: [this.credentialsMap.admin.pass, Validators.required]
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  selectCategory(category: 'admin' | 'user'): void {
    this.activeCategory.set(category);
    if (category === 'admin') {
      const creds = this.credentialsMap.admin;
      this.loginForm.patchValue({ username: creds.user, password: creds.pass });
    } else {
      this.selectUserType(this.activeUserType());
    }
  }

  selectUserType(userType: 'customer' | 'company' | 'dealer'): void {
    this.activeCategory.set('user');
    this.activeUserType.set(userType);
    const creds = this.credentialsMap[userType];
    this.loginForm.patchValue({ username: creds.user, password: creds.pass });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe({
      next: res => {
        this.isLoading.set(false);
        this.close();
        this.toast.success(`Welcome back, ${res.user.name}!`);
        const redirect = this.auth.getRedirectUrlForRole(res.user.role);
        this.router.navigate([redirect]);
      },
      error: err => {
        this.isLoading.set(false);
        this.toast.error(err?.error?.error || 'Invalid username or password.');
      }
    });
  }
}
