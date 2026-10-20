import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { BranchHead, District } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-admin-branch-heads',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">
          Branch Heads
        </h1>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="printWorksheet()"
            class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            <span>Print</span>
          </button>

          <button
            type="button"
            (click)="openCreateModal()"
            class="px-4 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>+ Add Branch Head</span>
          </button>
        </div>
      </div>

      <!-- Toolbar (Status filter & Search) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          @for (tab of activeFilterTabs; track tab.val) {
            <button
              type="button"
              (click)="activeStatusFilter = tab.val"
              class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
              [ngClass]="activeStatusFilter === tab.val
                ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              {{ tab.label }}
            </button>
          }
        </div>

        <div class="relative w-full sm:w-72">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by name, district, email..."
            class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
          />
          <svg class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Google Sheet Table -->
      <div class="overflow-x-auto pt-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-[11px] font-bold text-gray-600 select-none">
              <th class="w-10 py-3 px-2 text-center text-gray-400 font-normal"></th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">A ·</span>
                <span class="uppercase tracking-wider">BRANCH HEAD NAME</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">B ·</span>
                <span class="uppercase tracking-wider">DISTRICT HUB</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">C ·</span>
                <span class="uppercase tracking-wider">PHONE NUMBER</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">D ·</span>
                <span class="uppercase tracking-wider">EMAIL ADDRESS</span>
              </th>
              <th class="py-3 px-4 text-center whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">E ·</span>
                <span class="uppercase tracking-wider">EXPERIENCE</span>
              </th>
              <th class="py-3 px-4 text-center whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">F ·</span>
                <span class="uppercase tracking-wider">STATUS</span>
              </th>
              <th class="py-3 px-4 text-right whitespace-nowrap">
                <span class="uppercase tracking-wider">ACTIONS</span>
              </th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
            @for (head of filteredHeads(); track head.id; let idx = $index) {
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="w-10 py-3.5 px-2 text-center font-mono text-gray-400 text-xs select-none">
                  {{ idx + 1 }}
                </td>
                <td class="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                  {{ head.name }}
                </td>
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {{ head.districtName }} Hub
                  </span>
                </td>
                <td class="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                  {{ head.phone }}
                </td>
                <td class="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                  {{ head.email }}
                </td>
                <td class="py-3.5 px-4 text-center text-gray-800 font-medium whitespace-nowrap">
                  {{ head.experienceYears || 0 }} Yrs
                </td>
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    (click)="toggleStatus(head)"
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer"
                    [ngClass]="head.active
                      ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
                      : 'bg-gray-100 text-gray-500 border-gray-200'"
                  >
                    {{ head.active ? 'Active' : 'Inactive' }}
                  </button>
                </td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    (click)="openEditModal(head)"
                    class="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="py-12 text-center text-gray-400">
                  No branch heads match your filter criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="editingHeadId ? 'Edit Branch Head' : 'Add New Branch Head (Strict 1:1 District Rule)'"
        (closeModal)="modalOpen = false"
      >
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Full Name <span class="text-danger">*</span></label>
            <input
              type="text"
              [(ngModel)]="formName"
              placeholder="e.g. Ramesh Menon"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Email Address <span class="text-danger">*</span></label>
              <input
                type="email"
                [(ngModel)]="formEmail"
                placeholder="branch@steeldoor.com"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Phone Number <span class="text-danger">*</span></label>
              <input
                type="tel"
                [(ngModel)]="formPhone"
                placeholder="+91 98470 00000"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <!-- District Selection with 1:1 constraint validation -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">
              Assigned District (Strict 1 District = 1 Head) <span class="text-danger">*</span>
            </label>
            <select
              [(ngModel)]="formDistrictId"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">-- Choose District --</option>
              @for (d of districts; track d.id) {
                <option [value]="d.id" [disabled]="isDistrictOccupied(d.id)">
                  {{ d.name }} District {{ isDistrictOccupied(d.id) ? '(Occupied)' : '(Available)' }}
                </option>
              }
            </select>
            @if (formDistrictId && isDistrictOccupied(formDistrictId)) {
              <p class="text-[11px] text-danger font-semibold">
                District already has an assigned Branch Head. The 1:1 rule strictly blocks duplicate assignment.
              </p>
            }
          </div>

          @if (!editingHeadId) {
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Initial Account Password</label>
              <input
                type="password"
                [(ngModel)]="formPassword"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          }

          <div class="pt-4 border-t border-border flex justify-end gap-3">
            <button
              type="button"
              (click)="modalOpen = false"
              class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-text hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveBranchHead()"
              [disabled]="!isFormValid()"
              class="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
            >
              {{ editingHeadId ? 'Update Branch Head' : 'Create Branch Head' }}
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class AdminBranchHeadsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  branchHeads = signal<BranchHead[]>([]);
  districts: District[] = [];
  selectedHead = signal<BranchHead | null>(null);

  searchQuery = '';
  activeStatusFilter = '';

  activeFilterTabs = [
    { label: 'All Heads', val: '' },
    { label: 'Active', val: 'active' },
    { label: 'Deactivated', val: 'inactive' }
  ];

  modalOpen = false;
  editingHeadId: string | null = null;

  formName = '';
  formEmail = '';
  formPhone = '';
  formDistrictId = '';
  formPassword = 'branch123';

  get activeCount(): number {
    return this.branchHeads().filter(h => h.active).length;
  }

  get inactiveCount(): number {
    return this.branchHeads().filter(h => !h.active).length;
  }

  get coveredDistrictsCount(): number {
    const assignedDistrictIds = new Set(this.branchHeads().filter(h => h.active).map(h => h.districtId));
    return assignedDistrictIds.size;
  }

  getTabCount(tabVal: string): number {
    if (!tabVal) return this.branchHeads().length;
    if (tabVal === 'active') return this.activeCount;
    if (tabVal === 'inactive') return this.inactiveCount;
    return 0;
  }

  filteredHeads = () => {
    return this.branchHeads().filter(head => {
      if (this.activeStatusFilter === 'active' && !head.active) return false;
      if (this.activeStatusFilter === 'inactive' && head.active) return false;

      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        return (
          head.name.toLowerCase().includes(q) ||
          head.districtName.toLowerCase().includes(q) ||
          head.email.toLowerCase().includes(q) ||
          head.phone.toLowerCase().includes(q) ||
          head.id.toLowerCase().includes(q)
        );
      }

      return true;
    });
  };

  ngOnInit(): void {
    this.titleService.setTitle('Branch Heads Worksheet | SteelGuard');

    const resolvedHeads = this.route.snapshot.data['branchHeads'];
    if (resolvedHeads) {
      this.branchHeads.set(resolvedHeads);
      if (resolvedHeads.length > 0) this.selectedHead.set(resolvedHeads[0]);
    } else {
      this.dataService.getBranchHeads().subscribe(heads => {
        this.branchHeads.set(heads);
        if (heads.length > 0) this.selectedHead.set(heads[0]);
      });
    }

    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts) {
      this.districts = resolvedDistricts;
    } else {
      this.dataService.getDistricts().subscribe(dists => this.districts = dists);
    }
  }

  printWorksheet(): void {
    window.print();
  }

  isDistrictOccupied(distId: string): boolean {
    const existing = this.branchHeads().find(h => h.districtId === distId);
    if (!existing) return false;
    return existing.id !== this.editingHeadId;
  }

  isFormValid(): boolean {
    if (!this.formName.trim() || !this.formEmail.trim() || !this.formPhone.trim() || !this.formDistrictId) {
      return false;
    }
    return !this.isDistrictOccupied(this.formDistrictId);
  }

  openCreateModal(): void {
    this.editingHeadId = null;
    this.formName = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formDistrictId = '';
    this.formPassword = 'branch123';
    this.modalOpen = true;
  }

  openEditModal(head: BranchHead): void {
    this.editingHeadId = head.id;
    this.formName = head.name;
    this.formEmail = head.email;
    this.formPhone = head.phone;
    this.formDistrictId = head.districtId;
    this.modalOpen = true;
  }

  saveBranchHead(): void {
    if (!this.isFormValid()) return;

    const district = this.districts.find(d => d.id === this.formDistrictId);
    const districtName = district ? district.name : this.formDistrictId;

    if (this.editingHeadId) {
      this.dataService.updateBranchHead(this.editingHeadId, {
        name: this.formName.trim(),
        email: this.formEmail.trim(),
        phone: this.formPhone.trim(),
        districtId: this.formDistrictId,
        districtName: districtName
      }).subscribe({
        next: updated => {
          this.branchHeads.update(list => list.map(h => h.id === updated.id ? updated : h));
          if (this.selectedHead()?.id === updated.id) {
            this.selectedHead.set(updated);
          }
          this.modalOpen = false;
          this.toast.success(`Branch head ${updated.name} updated!`);
        },
        error: err => {
          this.toast.error(err?.error?.error || 'Failed to update branch head.');
        }
      });
    } else {
      this.dataService.createBranchHead({
        name: this.formName.trim(),
        email: this.formEmail.trim(),
        phone: this.formPhone.trim(),
        districtId: this.formDistrictId,
        districtName: districtName,
        active: true,
        password: this.formPassword
      }).subscribe({
        next: created => {
          this.branchHeads.update(list => [...list, created]);
          this.selectedHead.set(created);
          this.modalOpen = false;
          this.toast.success(`Branch head ${created.name} registered for ${districtName}!`);
        },
        error: err => {
          this.toast.error(err?.error?.error || 'Failed to create branch head.');
        }
      });
    }
  }

  toggleStatus(head: BranchHead): void {
    const newStatus = !head.active;
    this.dataService.toggleBranchHead(head.id, newStatus).subscribe({
      next: updated => {
        this.branchHeads.update(list => list.map(h => h.id === updated.id ? updated : h));
        if (this.selectedHead()?.id === updated.id) {
          this.selectedHead.set(updated);
        }
        this.toast.info(`Branch head ${updated.name} is now ${newStatus ? 'Active' : 'Deactivated'}.`);
      },
      error: err => {
        this.toast.error(err?.error?.error || 'Failed to toggle status.');
      }
    });
  }
}
