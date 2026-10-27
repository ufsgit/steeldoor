import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { State, District, AreaItem } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-admin-areas',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-5 animate-fadeIn">
      
      <!-- Top Header: State display on the left (replaces old "Manage Areas" title), Action on the right -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        
        <!-- Left: Current State Header -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#0f9d58] border border-emerald-100 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Current State:</span>
              
              <!-- If only 1 state, display clean title text directly without dropdown -->
              @if (states().length <= 1) {
                <span class="text-xl font-bold text-gray-900 tracking-tight">{{ currentStateName() }}</span>
                @if (currentStateCode()) {
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#0f9d58] border border-emerald-200">
                    {{ currentStateCode() }}
                  </span>
                }
              } @else {
                <!-- Multiple states: compact dropdown selector -->
                <select
                  [ngModel]="selectedStateId()"
                  (ngModelChange)="onStateChange($event)"
                  class="text-base font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#0f9d58] cursor-pointer"
                >
                  @for (st of states(); track st.id) {
                    <option [value]="st.id">{{ st.name }} ({{ st.code }})</option>
                  }
                </select>
              }
            </div>

            <p class="text-xs text-gray-500 mt-0.5">
              {{ districts().length }} operational districts under {{ currentStateName() }}
            </p>
          </div>
        </div>

        <!-- Right: Add Area button -->
        @if (selectedDistrict()) {
          <button
            type="button"
            (click)="openAddModal()"
            class="px-4 py-2 rounded-xl bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add New Area</span>
          </button>
        }
      </div>

      <!-- Districts Tabs (Horizontal Pills) -->
      <div class="space-y-2">
        <div class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Select District:</div>
        <div class="flex flex-wrap gap-2 p-1.5 rounded-xl bg-gray-100/70 border border-gray-200">
          @for (d of districts(); track d.id) {
            <button
              type="button"
              (click)="selectDistrict(d)"
              [disabled]="loadingAreas() && selectedDistrictId() === d.id"
              class="px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer disabled:cursor-wait"
              [ngClass]="selectedDistrictId() === d.id
                ? 'bg-[#0f9d58] text-white shadow-xs'
                : 'text-gray-700 bg-white/70 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200'"
            >
              @if (loadingAreas() && selectedDistrictId() === d.id) {
                <svg class="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              }
              <span>{{ d.name }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-mono"
                [ngClass]="selectedDistrictId() === d.id ? 'bg-white/20 text-white font-bold' : 'bg-gray-200/80 text-gray-600'"
              >
                {{ d.area_count ?? (selectedDistrictId() === d.id ? areas().length : 0) }}
              </span>
            </button>
          }
        </div>
      </div>

      <!-- Search and Area List Section -->
      @if (selectedDistrict(); as district) {
        <div class="space-y-4 pt-1">
          
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div class="flex items-center gap-2">
              <h2 class="text-sm font-bold text-gray-900">{{ district.name }} District Coverage</h2>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                {{ filteredAreas().length }} Localities Listed
              </span>
            </div>

            <!-- Search Area Input & Action -->
            <div class="relative w-full sm:w-72 flex items-center gap-1.5">
              <div class="relative flex-1">
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (keyup.enter)="onSearch()"
                  (input)="onSearchInput()"
                  placeholder="Search area or pincode..."
                  class="w-full text-xs pl-8 pr-7 py-1.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f9d58] text-gray-800 placeholder-gray-400"
                />
                <button
                  type="button"
                  (click)="onSearch()"
                  class="absolute left-2.5 top-2 text-gray-400 hover:text-[#0f9d58] transition-colors cursor-pointer"
                  title="Search"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
                @if (searchQuery.trim()) {
                  <button
                    type="button"
                    (click)="clearSearch()"
                    class="absolute right-2 top-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                }
              </div>
              <button
                type="button"
                (click)="onSearch()"
                class="px-3 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Search</span>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          @if (loadingAreas()) {
            <div class="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <svg class="w-6 h-6 animate-spin text-[#0f9d58]" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span class="text-xs">Loading areas for {{ district.name }}...</span>
            </div>
          } @else if (filteredAreas().length === 0) {
            <!-- Empty State -->
            <div class="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <p class="text-xs font-semibold text-gray-600">No areas found for {{ district.name }}</p>
              <p class="text-[11px] text-gray-400 mt-1">Click "Add New Area" above to register localities in this district.</p>
            </div>
          } @else {
            <!-- Areas Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              @for (area of filteredAreas(); track area.id) {
                <div class="p-3.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:shadow-xs flex items-center justify-between group transition-all">
                  <div class="flex flex-col truncate pr-2">
                    <span class="text-xs font-bold text-gray-800 truncate">{{ area.name }}</span>
                    @if (area.pincode) {
                      <span class="text-[10px] font-mono text-gray-400 font-medium">PIN: {{ area.pincode }}</span>
                    } @else {
                      <span class="text-[10px] text-gray-300 italic">No pincode set</span>
                    }
                  </div>

                  <div class="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      (click)="openEditModal(area)"
                      class="p-1 rounded text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Area"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      (click)="deleteArea(area)"
                      class="p-1 rounded text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
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
          }

        </div>
      }

      <!-- ADD / EDIT AREA MODAL -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="editingArea ? 'Edit Area' : 'Add Area to ' + (selectedDistrict()?.name || '')"
        (closeModal)="modalOpen = false"
      >
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Area / Locality Name <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="formName"
              placeholder="e.g. Infopark South or Marine Drive"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Postal Pincode <span class="text-gray-400 font-normal">(Optional)</span></label>
            <input
              type="text"
              [(ngModel)]="formPincode"
              placeholder="e.g. 682030"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0f9d58]"
            />
          </div>

          <div class="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              (click)="modalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveArea()"
              [disabled]="!formName.trim() || saving()"
              class="px-5 py-2 rounded-xl bg-[#0f9d58] hover:bg-[#0b8043] disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              @if (saving()) {
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              }
              <span>{{ editingArea ? 'Save Changes' : 'Add Area' }}</span>
            </button>
          </div>
        </div>
      </app-modal>

      <!-- DELETE CONFIRMATION MODAL (Replaces browser window alert/confirm) -->
      <app-modal
        [isOpen]="deleteModalOpen"
        title="Confirm Area Deletion"
        (closeModal)="deleteModalOpen = false"
      >
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 bg-red-50/60 rounded-xl border border-red-100">
            <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-900">Are you sure you want to delete this area?</p>
              <p class="text-xs text-gray-600 mt-0.5">
                Locality: <span class="font-bold text-gray-800">"{{ areaToDelete?.name }}"</span>
                @if (areaToDelete?.pincode; as pin) {
                  (PIN: {{ pin }})
                }
              </p>
              <p class="text-[11px] text-red-600 mt-1">This action cannot be undone.</p>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              (click)="deleteModalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmDeleteArea()"
              [disabled]="deleting()"
              class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              @if (deleting()) {
                <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              }
              <span>Delete Area</span>
            </button>
          </div>
        </div>
      </app-modal>

    </div>
  `
})
export class AdminAreasComponent implements OnInit {
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  states = signal<State[]>([]);
  selectedStateId = signal<number | string>(1);

  districts = signal<Array<District & { area_count?: number }>>([]);
  selectedDistrictId = signal<string>('');

  areas = signal<AreaItem[]>([]);
  loadingAreas = signal<boolean>(false);
  saving = signal<boolean>(false);
  deleting = signal<boolean>(false);

  searchQuery = '';

  modalOpen = false;
  editingArea: AreaItem | null = null;
  formName = '';
  formPincode = '';

  deleteModalOpen = false;
  areaToDelete: AreaItem | null = null;

  currentStateName = computed(() => {
    const st = this.states().find(s => String(s.id) === String(this.selectedStateId()));
    return st ? st.name : 'Kerala';
  });

  currentStateCode = computed(() => {
    const st = this.states().find(s => String(s.id) === String(this.selectedStateId()));
    return st ? st.code : '';
  });

  selectedDistrict = computed(() => {
    return this.districts().find(d => String(d.id) === String(this.selectedDistrictId()));
  });

  searchTimeout: any;

  filteredAreas = computed(() => this.areas());

  onSearch(): void {
    const distId = this.selectedDistrictId();
    if (!distId) return;
    this.loadAreas(distId, this.searchQuery);
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.onSearch();
    }, 350);
  }

  clearSearch(): void {
    this.searchQuery = '';
    const distId = this.selectedDistrictId();
    if (!distId) return;
    this.loadAreas(distId);
  }

  ngOnInit(): void {
    this.titleService.setTitle('Manage Areas & Coverage | SteelGuard');
    this.loadInitialHierarchy();
  }

  /**
   * 1 unified API call on page load: fetches states, districts, and first district's areas
   */
  loadInitialHierarchy(): void {
    this.loadingAreas.set(true);
    this.dataService.getAreaHierarchy().subscribe({
      next: res => {
        if (!res) {
          this.loadingAreas.set(false);
          return;
        }

        this.states.set(res.states || []);
        if (res.states && res.states.length > 0) {
          this.selectedStateId.set(res.states[0].id);
        }

        const mappedDistricts = (res.districts || []).map(d => ({
          id: String(d.id),
          name: d.name,
          code: d.code,
          stateId: d.state_id,
          areas: [],
          area_count: Number(d.area_count || 0)
        }));
        this.districts.set(mappedDistricts);

        if (res.selectedDistrictId) {
          this.selectedDistrictId.set(String(res.selectedDistrictId));
        } else if (mappedDistricts.length > 0) {
          this.selectedDistrictId.set(mappedDistricts[0].id);
        }

        this.areas.set(res.areas || []);
        this.loadingAreas.set(false);
      },
      error: () => {
        this.toast.error('Failed to load area data.');
        this.loadingAreas.set(false);
      }
    });
  }

  onStateChange(stateId: number | string): void {
    this.selectedStateId.set(stateId);
    this.dataService.getDistrictsByState(stateId).subscribe({
      next: dists => {
        this.districts.set(dists);
        if (dists.length > 0) {
          this.selectDistrict(dists[0]);
        } else {
          this.selectedDistrictId.set('');
          this.areas.set([]);
        }
      }
    });
  }

  selectDistrict(district: District): void {
    if (this.selectedDistrictId() === String(district.id)) return;
    this.selectedDistrictId.set(String(district.id));
    this.searchQuery = '';
    this.loadAreas(district.id);
  }

  loadAreas(districtId: number | string, search?: string): void {
    this.loadingAreas.set(true);
    this.dataService.getAreasByDistrict(districtId, search).subscribe({
      next: areas => {
        this.areas.set(areas);
        if (!search || !search.trim()) {
          this.districts.update(list => list.map(d => {
            if (String(d.id) === String(districtId)) {
              return { ...d, area_count: areas.length };
            }
            return d;
          }));
        }
        this.loadingAreas.set(false);
      },
      error: () => {
        this.toast.error('Failed to load areas for this district.');
        this.loadingAreas.set(false);
      }
    });
  }

  openAddModal(): void {
    this.editingArea = null;
    this.formName = '';
    this.formPincode = '';
    this.modalOpen = true;
  }

  openEditModal(area: AreaItem): void {
    this.editingArea = area;
    this.formName = area.name;
    this.formPincode = area.pincode || '';
    this.modalOpen = true;
  }

  saveArea(): void {
    const name = this.formName.trim();
    const pincode = this.formPincode.trim();
    const districtId = this.selectedDistrictId();
    if (!name || !districtId) return;

    this.saving.set(true);

    if (this.editingArea) {
      this.dataService.updateAreaItem(this.editingArea.id, { name, pincode, districtId }).subscribe({
        next: updated => {
          this.areas.update(list => list.map(a => a.id === updated.id ? updated : a));
          this.saving.set(false);
          this.modalOpen = false;
          this.toast.success(`Area "${name}" updated successfully!`);
        },
        error: err => {
          this.saving.set(false);
          this.toast.error(err?.error?.error || 'Failed to update area.');
        }
      });
    } else {
      this.dataService.createAreaItem({ districtId, name, pincode }).subscribe({
        next: created => {
          this.areas.update(list => [created, ...list]);
          this.districts.update(list => list.map(d => {
            if (String(d.id) === String(districtId)) {
              return { ...d, area_count: (d.area_count || 0) + 1 };
            }
            return d;
          }));
          this.saving.set(false);
          this.modalOpen = false;
          this.toast.success(`Area "${name}" added to ${this.selectedDistrict()?.name}!`);
        },
        error: err => {
          this.saving.set(false);
          this.toast.error(err?.error?.error || 'Failed to add area.');
        }
      });
    }
  }

  deleteArea(area: AreaItem): void {
    this.areaToDelete = area;
    this.deleteModalOpen = true;
  }

  confirmDeleteArea(): void {
    if (!this.areaToDelete) return;
    const area = this.areaToDelete;
    this.deleting.set(true);

    this.dataService.deleteAreaItem(area.id).subscribe({
      next: () => {
        this.areas.update(list => list.filter(a => a.id !== area.id));
        const districtId = this.selectedDistrictId();
        this.districts.update(list => list.map(d => {
          if (String(d.id) === String(districtId)) {
            return { ...d, area_count: Math.max(0, (d.area_count || 1) - 1) };
          }
          return d;
        }));
        this.deleting.set(false);
        this.deleteModalOpen = false;
        this.areaToDelete = null;
        this.toast.info(`Area "${area.name}" deleted.`);
      },
      error: err => {
        this.deleting.set(false);
        this.toast.error(err?.error?.error || 'Failed to delete area.');
      }
    });
  }
}
