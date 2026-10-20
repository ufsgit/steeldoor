import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../core/auth.service';
import { DataService } from '../../../core/data.service';
import { District } from '../../../core/models';

@Component({
  selector: 'app-branch-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-5 animate-fadeIn">
      <div class="space-y-1">
        <h1 class="text-xl font-black text-text">Branch Profile</h1>
        <p class="text-xs text-text-muted">Account information and regional coverage area specifications.</p>
      </div>

      <!-- Profile Card -->
      <div class="p-5 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
        <div class="flex items-center gap-3 pb-3 border-b border-border">
          <div class="w-12 h-12 rounded-2xl bg-primary text-accent font-black text-lg flex items-center justify-center shadow-soft">
            BH
          </div>
          <div>
            <h2 class="text-base font-bold text-text">{{ user()?.name }}</h2>
            <span class="text-xs font-semibold text-primary">District Branch Director</span>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="flex items-center justify-between py-1.5 border-b border-border/40">
            <span class="text-text-muted">Assigned District</span>
            <strong class="text-text font-bold">{{ user()?.districtId?.replace('dist-', '')?.toUpperCase() }} District</strong>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-border/40">
            <span class="text-text-muted">Registered Email</span>
            <strong class="text-text">{{ user()?.email }}</strong>
          </div>
          <div class="flex items-center justify-between py-1.5 border-b border-border/40">
            <span class="text-text-muted">Direct Phone</span>
            <strong class="text-text">{{ user()?.phone || '+91 98470 12345' }}</strong>
          </div>
          <div class="flex items-center justify-between py-1.5">
            <span class="text-text-muted">Account Role</span>
            <strong class="text-accent uppercase font-bold">{{ user()?.role }}</strong>
          </div>
        </div>
      </div>

      <!-- District Operational Scope -->
      @if (district()) {
        <div class="p-5 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="flex items-center justify-between border-b border-border pb-2">
            <span class="text-xs font-bold text-text">Covered Areas ({{ district()?.areas?.length }})</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-muted text-text font-bold">
              {{ district()?.code }}
            </span>
          </div>

          <div class="flex flex-wrap gap-1.5">
            @for (area of district()?.areas; track area) {
              <span class="px-2.5 py-1 rounded-full bg-background border border-border text-[11px] text-text font-medium">
                {{ area }}
              </span>
            }
          </div>
        </div>
      }

      <div class="pt-2">
        <button
          type="button"
          (click)="auth.logout()"
          class="w-full py-3 rounded-2xl border border-danger/30 text-danger text-xs font-bold hover:bg-danger/10 transition-colors"
        >
          Sign Out of Branch Portal
        </button>
      </div>
    </div>
  `
})
export class BranchProfileComponent implements OnInit {
  auth = inject(AuthService);
  private dataService = inject(DataService);
  private titleService = inject(Title);

  user = this.auth.currentUser;
  district = signal<District | null>(null);

  ngOnInit(): void {
    this.titleService.setTitle('Branch Head Profile | SteelGuard');

    const distId = this.user()?.districtId;
    if (distId) {
      this.dataService.getDistricts().subscribe(dists => {
        const found = dists.find(d => d.id === distId);
        if (found) this.district.set(found);
      });
    }
  }
}
