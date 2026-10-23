import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Booking, BranchHead } from '../../../core/models';
import { StatusChipComponent } from '../../../shared/components/status-chip.component';
import { TimelineComponent } from '../../../shared/components/timeline.component';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-admin-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StatusChipComponent, TimelineComponent, ModalComponent],
  template: `
    @if (booking()) {
      <div class="space-y-8 animate-fadeIn">
        <!-- TOP BREADCRUMB & HEADER -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 text-xs text-text-muted mb-1">
              <a routerLink="/admin/bookings" class="hover:text-primary">Bookings</a>
              <span>/</span>
              <span class="font-mono font-bold text-text">{{ booking()?.id }}</span>
            </div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-black text-text">Fitting Request #{{ booking()?.id }}</h1>
              <app-status-chip
                [status]="booking()!.status"
                [isDelayed]="booking()!.isDelayed || false"
                [hoursSinceSubmitted]="booking()!.hoursSinceSubmitted"
              ></app-status-chip>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="openReassignModal()"
              class="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border text-xs font-bold text-text shadow-sm transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Reassign Branch Head</span>
            </button>
          </div>
        </div>

        <!-- REJECTION / DELAYED NOTICE BANNER -->
        @if (booking()!.status === 'Rejected') {
          <div class="p-5 rounded-2xl bg-status-rejected/10 border border-status-rejected/30 flex items-start gap-3.5">
            <div class="w-8 h-8 rounded-full bg-status-rejected text-text-inverted flex items-center justify-center font-bold text-sm shrink-0">
              !
            </div>
            <div class="space-y-1">
              <h4 class="text-xs font-bold text-status-rejected uppercase tracking-wider">Booking Was Rejected by Branch</h4>
              <p class="text-xs text-text font-medium leading-relaxed">
                <strong>Stated Reason:</strong> {{ booking()!.rejectionReason }}
              </p>
              <p class="text-[11px] text-text-muted">
                Action needed: Reassign to an alternate branch head or resolve structural specifications with client.
              </p>
            </div>
          </div>
        }

        @if (booking()!.isDelayed && booking()!.status !== 'Rejected') {
          <div class="p-5 rounded-2xl bg-status-delayed/10 border border-status-delayed/30 flex items-start gap-3.5">
            <div class="w-8 h-8 rounded-full bg-status-delayed text-text-inverted flex items-center justify-center font-bold text-sm shrink-0">
              ⏱
            </div>
            <div class="space-y-1">
              <h4 class="text-xs font-bold text-status-delayed uppercase tracking-wider">Pending Delay Flag</h4>
              <p class="text-xs text-text leading-relaxed">
                This request has been pending response for <strong>{{ booking()!.hoursSinceSubmitted }} hours</strong> without branch status updates. Prompt branch contact recommended.
              </p>
            </div>
          </div>
        }

        <!-- 3-COL SPECIFICATIONS GRID -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Client Card -->
          <div class="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
            <div class="flex items-center justify-between border-b border-border pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Client Information</span>
              <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-surface-muted text-text">
                {{ booking()!.clientType || 'customer' }}
              </span>
            </div>
            <div class="text-base font-bold text-text">{{ booking()!.clientName || booking()!.name }}</div>
            <div class="space-y-1 text-xs text-text-muted">
              <div>Phone: <a href="tel:{{ booking()!.contactPhone || booking()!.mobile }}" class="text-text font-semibold hover:text-primary">{{ booking()!.contactPhone || booking()!.mobile }}</a></div>
              <div>Email: <a href="mailto:{{ booking()!.contactEmail }}" class="text-text font-semibold hover:text-primary">{{ booking()!.contactEmail || 'N/A' }}</a></div>
            </div>
          </div>

          <!-- Installation Scope & Details -->
          <div class="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
            <div class="border-b border-border pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Door Details</span>
            </div>
            <div class="text-base font-bold text-primary">{{ booking()!.doorDetails.doorType || 'Standard Steel Door' }}</div>
            <div class="grid grid-cols-2 gap-2 text-xs text-text-muted">
              <div>Brand: <strong class="text-text block font-bold">{{ booking()!.doorDetails.brand || 'Tata Pravesh' }}</strong></div>
              <div>Quantity: <strong class="text-text block font-bold">{{ booking()!.doorDetails.quantity || 1 }} Unit(s)</strong></div>
              <div>Finish: <strong class="text-text block">{{ booking()!.doorDetails.finish || 'Standard' }}</strong></div>
              <div>Thickness: <strong class="text-text block">{{ booking()!.doorDetails.thickness || '1.2mm' }}</strong></div>
            </div>
            @if (booking()!.notes || booking()!.doorDetails.notes) {
              <div class="text-[11px] text-text-muted bg-surface-muted p-2 rounded-lg italic">
                Site Notes: {{ booking()!.notes || booking()!.doorDetails.notes }}
              </div>
            }
          </div>

          <!-- Location & Routing -->
          <div class="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
            <div class="border-b border-border pb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assigned Hub & Address</span>
            </div>
            <div>
              <div class="text-sm font-bold text-text">{{ booking()!.districtName }} District</div>
              <div class="text-xs text-accent font-semibold">{{ booking()!.area || booking()!.areaName }} Area</div>
            </div>
            <div class="text-xs text-text-muted">
              <p>{{ booking()!.address }}</p>
              @if (booking()!.landmark) {
                <p class="text-[11px] mt-0.5">Landmark: {{ booking()!.landmark }}</p>
              }
              <p class="mt-0.5 font-mono">PIN: {{ booking()!.pincode || '682024' }}</p>
            </div>
            <div class="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span class="text-text-muted">Branch Head:</span>
              <strong class="text-primary font-bold">{{ booking()!.branchHeadName || 'Unassigned' }}</strong>
            </div>
          </div>
        </div>

        <!-- ATTACHED SITE / DOOR PHOTOS & DOCUMENTS (p_documents) -->
        @if (getAttachedDocuments(); as docs) {
          @if (docs.length > 0) {
            <div class="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-3">
              <div class="flex items-center justify-between border-b border-border pb-2">
                <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Attached Documents & Site Photos</span>
                <span class="text-xs font-bold text-primary">{{ docs.length }} File(s)</span>
              </div>
              <div class="flex flex-wrap gap-3 pt-1">
                @for (doc of docs; track $index) {
                  @if (isImage(doc)) {
                    <a [href]="doc" target="_blank" class="block w-24 h-24 rounded-2xl overflow-hidden border border-border hover:border-primary shadow-xs transition-all hover:scale-105 cursor-pointer group" title="Click to view full photo">
                      <img [src]="doc" alt="Site photo" class="w-full h-full object-cover group-hover:opacity-90"/>
                    </a>
                  } @else {
                    <a [href]="doc" target="_blank" class="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border hover:border-primary bg-surface-muted hover:bg-surface-hover text-xs font-medium text-text shadow-xs transition-all">
                      <svg class="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                      <span class="truncate max-w-[150px]">{{ getFileName(doc) }}</span>
                    </a>
                  }
                }
              </div>
            </div>
          }
        }

        <!-- COMPLETE AUDIT TRAIL & STATUS TIMELINE -->
        <div class="p-6 sm:p-8 rounded-3xl bg-surface border border-border shadow-soft space-y-6">
          <div class="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 class="text-base font-bold text-text">Audit Trail & Event Log</h2>
              <p class="text-xs text-text-muted">Chronological timeline of every creation, rejection, status update, and reassignment.</p>
            </div>
            <span class="text-xs font-mono text-text-muted">{{ booking()!.history.length }} Events Logged</span>
          </div>

          <app-timeline [history]="booking()!.history"></app-timeline>
        </div>

        <!-- REASSIGN BRANCH HEAD MODAL -->
        <app-modal
          [isOpen]="reassignModalOpen"
          title="Reassign Booking to Branch Head"
          (closeModal)="reassignModalOpen = false"
        >
          <div class="space-y-4">
            <p class="text-xs text-text-muted leading-relaxed">
              Select an available branch head. As per business rules, reassigning changes the designated branch head, resets booking status to <strong>Pending</strong>, and records an audit log entry.
            </p>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Select Branch Head <span class="text-danger">*</span></label>
              <select
                [(ngModel)]="selectedNewBranchHeadId"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">-- Choose Branch Head --</option>
                @for (head of availableBranchHeads(); track head.id) {
                  <option [value]="head.id">
                    {{ head.name }} ({{ head.districtName }})
                  </option>
                }
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Reassignment Reason <span class="text-danger">*</span></label>
              <textarea
                [(ngModel)]="reassignReason"
                rows="3"
                placeholder="Reason is strictly mandatory for the compliance audit trail (e.g. Previous branch reported structural constraints, re-routing for immediate capacity)..."
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              ></textarea>
            </div>

            <div class="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="reassignModalOpen = false"
                class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmReassign()"
                [disabled]="!selectedNewBranchHeadId || !reassignReason.trim() || isReassigning"
                class="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
              >
                {{ isReassigning ? 'Reassigning...' : 'Confirm Reassignment' }}
              </button>
            </div>
          </div>
        </app-modal>
      </div>
    }
  `
})
export class AdminBookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  booking = signal<Booking | null>(null);
  branchHeads: BranchHead[] = [];

  reassignModalOpen = false;
  selectedNewBranchHeadId = '';
  reassignReason = '';
  isReassigning = false;

  availableBranchHeads = () => {
    // Show all active branch heads (or exclude current)
    const currentHeadId = this.booking()?.branchHeadId;
    return this.branchHeads.filter(h => h.active && h.id !== currentHeadId);
  };

  ngOnInit(): void {
    const resolvedBooking = this.route.snapshot.data['booking'];
    if (resolvedBooking) {
      this.booking.set(resolvedBooking);
      this.titleService.setTitle(`Booking #${resolvedBooking.id} | SteelGuard`);
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.dataService.getBookingById(id).subscribe(b => {
          this.booking.set(b);
          this.titleService.setTitle(`Booking #${b.id} | SteelGuard`);
        });
      }
    }

    this.dataService.getBranchHeads().subscribe(heads => {
      this.branchHeads = heads;
    });
  }

  openReassignModal(): void {
    this.selectedNewBranchHeadId = '';
    this.reassignReason = '';
    this.reassignModalOpen = true;
  }

  confirmReassign(): void {
    const bId = this.booking()?.id;
    if (!bId || !this.selectedNewBranchHeadId || !this.reassignReason.trim()) return;

    this.isReassigning = true;
    this.dataService.reassignBooking(bId, {
      newBranchHeadId: this.selectedNewBranchHeadId,
      reason: this.reassignReason.trim(),
      performedBy: 'Elena Vance (Super Admin)',
      role: 'coordinator'
    }).subscribe({
      next: updated => {
        this.isReassigning = false;
        this.reassignModalOpen = false;
        this.booking.set(updated);
        this.toast.success(`Booking ${updated.id} reassigned to ${updated.branchHeadName}!`);
      },
      error: err => {
        this.isReassigning = false;
        this.toast.error(err?.error?.error || 'Failed to reassign booking.');
      }
    });
  }

  getAttachedDocuments(): string[] {
    const b = this.booking();
    if (!b) return [];
    const fromDocs = b.documents || [];
    const fromImages = b.doorDetails?.images || [];
    const fromDetailsDocs = b.doorDetails?.documents || [];
    return Array.from(new Set([...fromDocs, ...fromImages, ...fromDetailsDocs])).filter(Boolean);
  }

  isImage(url: string): boolean {
    if (!url) return false;
    return /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.startsWith('data:image/');
  }

  getFileName(url: string): string {
    if (!url) return '';
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || url;
    } catch {
      return url;
    }
  }
}
