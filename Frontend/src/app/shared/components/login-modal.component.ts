import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../toast/toast.service';

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
                <p class="text-xs text-text-muted">Enter your registered username and password.</p>
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
                    placeholder="Enter your username"
                    autocomplete="username"
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
                    placeholder="Enter your password"
                    autocomplete="current-password"
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

  isLoading = signal(false);
  showPassword = signal(false);

  loginForm!: FormGroup;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  close(): void {
    this.closeModal.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(prev => !prev);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    const { username, password } = this.loginForm.value;

    this.auth.login(username.trim(), password).subscribe({
      next: res => {
        this.isLoading.set(false);
        this.close();
        this.toast.success(`Welcome back, ${res.user.name}!`);
        const redirect = this.auth.getRedirectUrlForRole(res.user.role);
        this.router.navigate([redirect]);
      },
      error: err => {
        this.isLoading.set(false);
        const errMsg = err?.error?.error || err?.error?.message || 'Invalid username or password.';
        this.toast.error(errMsg);
      }
    });
  }
}
