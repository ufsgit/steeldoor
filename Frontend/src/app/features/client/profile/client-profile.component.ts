import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div class="space-y-1">
        <h1 class="text-2xl font-black text-text">Account Profile</h1>
        <p class="text-xs text-text-muted">Personal and company verification information.</p>
      </div>

      <!-- Profile Card -->
      <div class="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-6">
        <div class="flex items-center gap-4 pb-4 border-b border-border">
          <div class="w-14 h-14 rounded-2xl bg-primary text-accent font-black text-xl flex items-center justify-center shadow-soft uppercase">
            {{ (user()?.name || 'C').charAt(0) }}
          </div>
          <div>
            <h2 class="text-lg font-bold text-text">{{ user()?.name }}</h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs uppercase font-bold text-accent-dark bg-accent/15 px-2.5 py-0.5 rounded-full">
                {{ user()?.clientType || 'Retail Client' }}
              </span>
              <span class="text-xs text-text-muted">Portal User</span>
            </div>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-text-muted font-medium">Username</span>
            <strong class="text-text font-mono">{{ user()?.username }}</strong>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-text-muted font-medium">Email Address</span>
            <strong class="text-text">{{ user()?.email }}</strong>
          </div>
          <div class="flex items-center justify-between py-2 border-b border-border/50">
            <span class="text-text-muted font-medium">Phone Number</span>
            <strong class="text-text">{{ user()?.phone || 'Not specified' }}</strong>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-text-muted font-medium">Account Access Role</span>
            <strong class="text-primary font-bold uppercase">{{ user()?.role }}</strong>
          </div>
        </div>

        <div class="pt-4 border-t border-border flex items-center justify-between">
          <button
            type="button"
            (click)="auth.logout()"
            class="px-4 py-2.5 rounded-xl border border-danger/30 text-danger text-xs font-bold hover:bg-danger/10 transition-colors"
          >
            Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  `
})
export class ClientProfileComponent implements OnInit {
  auth = inject(AuthService);
  private titleService = inject(Title);

  user = this.auth.currentUser;

  ngOnInit(): void {
    this.titleService.setTitle('Client Profile | SteelGuard');
  }
}
