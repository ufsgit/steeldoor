import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { District } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">District Areas</h1>
      </div>

      <!-- District Selector Tabs -->
      <div class="flex flex-wrap gap-2 p-1.5 rounded-xl bg-gray-50 border border-gray-200">
        @for (d of districts(); track d.id) {
          <button
            type="button"
            (click)="selectedDistrictId = d.id"
            class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            [ngClass]="selectedDistrictId === d.id
              ? 'bg-[#0f9d58] text-white shadow-xs'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          >
            <span>{{ d.name }}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded font-mono"
              [ngClass]="selectedDistrictId === d.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'"
            >
              {{ d.areas.length }}
            </span>
          </button>
        }
      </div>

      <!-- Current District Areas Card -->
      @if (currentDistrict(); as district) {
        <div class="space-y-4 pt-2">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-gray-900">{{ district.name }} District</h2>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                {{ district.areas.length }} Areas
              </span>
            </div>

            <button
              type="button"
              (click)="openAddModal()"
              class="px-3.5 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Add New Area</span>
            </button>
          </div>

          <!-- Areas Chips Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (area of district.areas; track area) {
              <div class="p-3.5 rounded-2xl bg-background border border-border hover:border-border-hover flex items-center justify-between group transition-all">
                <div class="flex items-center gap-2.5 truncate">
                  <span class="w-2 h-2 rounded-full bg-accent shrink-0"></span>
                  <span class="text-xs font-bold text-text truncate">{{ area }}</span>
                </div>

                <div class="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    (click)="openEditModal(area)"
                    class="p-1 rounded text-text-muted hover:text-primary transition-colors"
                    title="Edit Area Name"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    (click)="deleteArea(area)"
                    class="p-1 rounded text-text-muted hover:text-danger transition-colors"
                    title="Delete Area"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ADD / EDIT AREA MODAL -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="editingOldName ? 'Edit Area Name' : 'Add Area to ' + (currentDistrict()?.name || '')"
        (closeModal)="modalOpen = false"
      >
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Area / Neighborhood Name <span class="text-danger">*</span></label>
            <input
              type="text"
              [(ngModel)]="areaInputName"
              placeholder="e.g. Infopark South or Marine Drive"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="modalOpen = false"
              class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveArea()"
              [disabled]="!areaInputName.trim()"
              class="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
            >
              {{ editingOldName ? 'Save Changes' : 'Add Area' }}
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class AdminAreasComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  districts = signal<District[]>([]);
  selectedDistrictId = 'dist-ekm';

  modalOpen = false;
  editingOldName: string | null = null;
  areaInputName = '';

  currentDistrict = () => {
    return this.districts().find(d => d.id === this.selectedDistrictId);
  };

  ngOnInit(): void {
    this.titleService.setTitle('District Areas Management | SteelGuard');

    const resolved = this.route.snapshot.data['districts'];
    if (resolved && resolved.length > 0) {
      this.districts.set(resolved);
      this.selectedDistrictId = resolved[0].id;
    } else {
      this.dataService.getDistricts().subscribe(dists => {
        this.districts.set(dists);
        if (dists.length > 0) this.selectedDistrictId = dists[0].id;
      });
    }
  }

  openAddModal(): void {
    this.editingOldName = null;
    this.areaInputName = '';
    this.modalOpen = true;
  }

  openEditModal(area: string): void {
    this.editingOldName = area;
    this.areaInputName = area;
    this.modalOpen = true;
  }

  saveArea(): void {
    const val = this.areaInputName.trim();
    if (!val) return;

    if (this.editingOldName) {
      this.dataService.updateArea(this.selectedDistrictId, this.editingOldName, val).subscribe({
        next: updated => {
          this.districts.update(list => list.map(d => d.id === updated.id ? updated : d));
          this.modalOpen = false;
          this.toast.success(`Area renamed to ${val}!`);
        },
        error: err => this.toast.error(err?.error?.error || 'Failed to update area.')
      });
    } else {
      this.dataService.addArea(this.selectedDistrictId, val).subscribe({
        next: updated => {
          this.districts.update(list => list.map(d => d.id === updated.id ? updated : d));
          this.modalOpen = false;
          this.toast.success(`Area ${val} added to ${updated.name}!`);
        },
        error: err => this.toast.error(err?.error?.error || 'Failed to add area.')
      });
    }
  }

  deleteArea(area: string): void {
    if (!confirm(`Are you sure you want to remove ${area} from this district?`)) return;

    this.dataService.deleteArea(this.selectedDistrictId, area).subscribe({
      next: updated => {
        this.districts.update(list => list.map(d => d.id === updated.id ? updated : d));
        this.toast.info(`Area ${area} removed.`);
      },
      error: err => this.toast.error(err?.error?.error || 'Failed to delete area.')
    });
  }
}
