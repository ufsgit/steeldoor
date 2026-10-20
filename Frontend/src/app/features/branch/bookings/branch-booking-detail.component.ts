import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Booking, BookingStatus } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';
import { TimelineComponent } from '../../../shared/components/timeline.component';
import { BottomSheetComponent } from '../../../shared/components/bottom-sheet.component';

@Component({
  selector: 'app-branch-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StatusChipComponent, TimelineComponent, BottomSheetComponent],
  template: `
    @if (booking()) {
      <div class="space-y-5 animate-fadeIn pb-12">
        <!-- Top Back Nav & Status -->
        <div class="flex items-center justify-between">
          <a
            routerLink="/branch/bookings"
            class="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text font-semibold"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Back to Jobs</span>
          </a>

          <app-status-chip
            [status]="booking()!.status"
            [isDelayed]="booking()!.isDelayed || false"
            [hoursSinceSubmitted]="booking()!.hoursSinceSubmitted"
          ></app-status-chip>
        </div>

        <!-- Main Job Header Card -->
        <div class="p-4 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="flex items-center justify-between border-b border-border pb-2.5">
            <span class="font-mono text-xs font-bold text-primary">{{ booking()!.id }}</span>
            <span class="text-[10px] text-text-muted">Registered: {{ formatDate(booking()!.createdAt) }}</span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between">
              <h1 class="text-base font-bold text-text">{{ booking()!.clientName }}</h1>
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-muted text-text-muted">
                {{ booking()!.clientType }}
              </span>
            </div>
            <div class="text-xs font-bold text-primary">{{ booking()!.doorDetails.doorType }} • {{ booking()!.doorDetails.brand || 'Tata Pravesh' }}</div>
            <div class="text-[11px] text-text-muted">
              {{ booking()!.doorDetails.quantity }} door unit(s) to install • Zero Wall Damage Guarantee
            </div>
          </div>

          <!-- PRIMARY ACTION BUTTON: OPEN BOTTOM SHEET OVERLAY -->
          <button
            type="button"
            (click)="bottomSheetOpen.set(true)"
            class="w-full py-3 rounded-2xl bg-primary hover:bg-primary-hover text-text-inverted text-xs font-bold shadow-soft transition-all flex items-center justify-center gap-2 mt-2"
          >
            <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Update Job Status</span>
          </button>
        </div>

        <!-- 1-TAP CONTACT ACTIONS (Tap to Call & Tap to WhatsApp) -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Tap to Call -->
          <a
            [href]="'tel:' + booking()!.contactPhone"
            class="p-3.5 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center gap-2 text-xs font-bold text-text hover:bg-surface-hover transition-colors"
          >
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <span>Tap to Call</span>
          </a>

          <!-- Tap to WhatsApp -->
          <a
            [href]="getWhatsAppUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="p-3.5 rounded-2xl bg-surface border border-border shadow-soft flex items-center justify-center gap-2 text-xs font-bold text-success hover:bg-surface-hover transition-colors"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>

        <!-- SITE ADDRESS & OPEN IN MAPS -->
        <div class="p-4 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
          <div class="flex items-center justify-between border-b border-border pb-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Site Location</span>
            <span class="text-xs font-bold text-primary">{{ booking()!.districtName }} • {{ booking()!.area }}</span>
          </div>

          <div class="text-xs text-text space-y-1">
            <p class="font-medium">{{ booking()!.address }}</p>
            @if (booking()!.landmark) {
              <p class="text-[11px] text-text-muted">Landmark: {{ booking()!.landmark }}</p>
            }
            <p class="text-[11px] text-text-muted font-mono">PIN: {{ booking()!.pincode }}</p>
          </div>

          <!-- Open in Maps Button -->
          <a
            [href]="getMapsUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full py-2.5 rounded-xl border border-border bg-background hover:bg-surface-muted text-xs font-bold text-text flex items-center justify-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Open in Google Maps</span>
          </a>
        </div>

        <!-- ATTACHED SITE / DOOR PHOTOS -->
        @if (booking()!.doorDetails.images; as imgs) {
          @if (imgs.length > 0) {
            <div class="p-4 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
              <div class="flex items-center justify-between border-b border-border pb-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Attached Site Photos</span>
                <span class="text-xs font-bold text-primary">{{ imgs.length }} Photo(s)</span>
              </div>
              <div class="flex flex-wrap gap-3 pt-1">
                @for (img of imgs; track $index) {
                  <a [href]="img" target="_blank" class="block w-20 h-20 rounded-2xl overflow-hidden border border-border hover:border-primary shadow-xs transition-all hover:scale-105 cursor-pointer group" title="Click to view full photo">
                    <img [src]="img" alt="Site photo" class="w-full h-full object-cover group-hover:opacity-90"/>
                  </a>
                }
              </div>
            </div>
          }
        }

        <!-- AUDIT LOG & STATUS TIMELINE -->
        <div class="p-4 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
          <div class="flex items-center justify-between border-b border-border pb-2">
            <span class="text-xs font-bold text-text">Job Timeline</span>
            <span class="text-[10px] text-text-muted font-mono">{{ booking()!.history.length }} Events</span>
          </div>

          <app-timeline [history]="booking()!.history"></app-timeline>
        </div>

        <!-- CDK OVERLAY BOTTOM SHEET FOR STATUS UPDATE -->
        <app-bottom-sheet
          [isOpen]="bottomSheetOpen()"
          [bookingId]="booking()!.id"
          (closeSheet)="bottomSheetOpen.set(false)"
          (statusUpdated)="onStatusUpdated($event)"
        ></app-bottom-sheet>
      </div>
    }
  `
})
export class BranchBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  booking = signal<Booking | null>(null);
  bottomSheetOpen = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getBookingById(id).subscribe(b => {
        this.booking.set(b);
        this.titleService.setTitle(`Job #${b.id} | Branch Head Console`);
      });
    }
  }

  getWhatsAppUrl(): string {
    const b = this.booking();
    if (!b) return '#';
    const cleanPhone = b.contactPhone.replace(/[^\d]/g, '');
    const text = encodeURIComponent(
      `Hello ${b.clientName}, this is ${this.auth.currentUser()?.name || 'Branch Head'} from SteelGuard regarding your door fitting booking #${b.id}.`
    );
    return `https://wa.me/${cleanPhone}?text=${text}`;
  }

  getMapsUrl(): string {
    const b = this.booking();
    if (!b) return '#';
    const query = encodeURIComponent(`${b.address}, ${b.area}, ${b.districtName}, Kerala, ${b.pincode}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  onStatusUpdated(event: {
    status: BookingStatus;
    scheduledDate?: string;
    rejectionReason?: string;
    notes?: string;
  }): void {
    const b = this.booking();
    if (!b) return;

    this.dataService.updateBookingStatus(b.id, {
      status: event.status,
      performedBy: this.auth.currentUser()?.name || 'Branch Head',
      role: 'branch_head',
      scheduledDate: event.scheduledDate,
      rejectionReason: event.rejectionReason,
      notes: event.notes
    }).subscribe({
      next: updated => {
        this.booking.set(updated);
        this.toast.success(`Job #${updated.id} marked as ${updated.status}!`);
      },
      error: err => {
        this.toast.error(err?.error?.error || 'Failed to update job status.');
      }
    });
  }
}
