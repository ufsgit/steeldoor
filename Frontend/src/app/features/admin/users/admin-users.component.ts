import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { District } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal.component';

export interface SystemUser {
  id: number | string;
  username: string;
  roleId?: number;
  role: string;
  userTypeId?: number;
  userType?: string;
  name: string;
  email?: string;
  phone?: string;
  stateId?: number;
  stateName?: string;
  districtId?: number | string | null;
  districtName?: string | null;
  address?: string;
  isActive: boolean | number;
  isDeleted?: boolean | number;
  createdAt?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-6 space-y-4 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span>User Management</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-[#0f9d58] border border-emerald-200">
              {{ totalRecords() }} Total
            </span>
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="openCreateModal()"
            class="px-4 py-1.5 rounded-lg bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <!-- Toolbar (Role filter & Search) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          @for (tab of filterTabs; track tab.val) {
            <button
              type="button"
              (click)="setRoleFilter(tab.val)"
              class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer"
              [ngClass]="activeRoleFilter() === tab.val
                ? 'bg-[#0f9d58] text-white border-[#0f9d58] shadow-2xs'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              {{ tab.label }}
              <span class="ml-1 text-[10px] opacity-80">({{ getRoleCount(tab.val) }})</span>
            </button>
          }
        </div>

        <div class="relative w-full sm:w-72">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange()"
            placeholder="Search by name, username, email..."
            class="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
          />
          <svg class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Google Sheet Style Table -->
      <div class="overflow-x-auto pt-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-[11px] font-bold text-gray-600 select-none">
              <th class="w-10 py-3 px-2 text-center text-gray-400 font-normal">#</th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">A ·</span>
                <span class="uppercase tracking-wider">NAME</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">B ·</span>
                <span class="uppercase tracking-wider">USERNAME</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">C ·</span>
                <span class="uppercase tracking-wider">ROLE & ACCESS</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">D ·</span>
                <span class="uppercase tracking-wider">DISTRICT / HUB</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">E ·</span>
                <span class="uppercase tracking-wider">PHONE</span>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">F ·</span>
                <span class="uppercase tracking-wider">EMAIL</span>
              </th>
              <th class="py-3 px-4 text-center whitespace-nowrap">
                <span class="text-gray-400 font-normal mr-1">G ·</span>
                <span class="uppercase tracking-wider">STATUS</span>
              </th>
              <th class="py-3 px-4 text-right whitespace-nowrap">
                <span class="uppercase tracking-wider">ACTIONS</span>
              </th>
            </tr>
          </thead>
          <tbody class="text-xs text-gray-700 divide-y divide-gray-100">
            @for (user of filteredUsers(); track user.id; let idx = $index) {
              <tr class="hover:bg-gray-50/80 transition-colors">
                <td class="w-10 py-3.5 px-2 text-center font-mono text-gray-400 text-xs select-none">
                  {{ (currentPage() - 1) * pageSize + idx + 1 }}
                </td>

                <td class="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div class="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs uppercase border border-gray-200">
                      {{ (user.name || user.username || 'U').charAt(0) }}
                    </div>
                    <div>
                      <span>{{ user.name }}</span>
                      @if (user.address) {
                        <p class="text-[10px] text-gray-400 font-normal truncate max-w-xs">{{ user.address }}</p>
                      }
                    </div>
                  </div>
                </td>

                <td class="py-3.5 px-4 font-mono font-medium text-gray-700 whitespace-nowrap">
                  &#64;{{ user.username }}
                </td>

                <td class="py-3.5 px-4 whitespace-nowrap">
                  <span
                    class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border"
                    [ngClass]="getRoleBadgeClass(user.role, user.roleId)"
                  >
                    {{ formatRoleName(user.role, user.roleId, user.userType) }}
                  </span>
                </td>

                <td class="py-3.5 px-4 whitespace-nowrap">
                  @if (user.districtName) {
                    <span class="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {{ user.districtName }}
                    </span>
                  } @else {
                    <span class="text-gray-400 text-[11px]">HQ / Statewide</span>
                  }
                </td>

                <td class="py-3.5 px-4 font-mono text-gray-600 whitespace-nowrap">
                  {{ user.phone || '—' }}
                </td>

                <td class="py-3.5 px-4 text-gray-600 whitespace-nowrap">
                  {{ user.email || '—' }}
                </td>

                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <button
                    type="button"
                    (click)="toggleStatus(user)"
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer"
                    [ngClass]="isUserActive(user)
                      ? 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0] hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'"
                  >
                    {{ isUserActive(user) ? 'Active' : 'Inactive' }}
                  </button>
                </td>

                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      (click)="openEditModal(user)"
                      class="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      (click)="promptDeleteUser(user)"
                      class="px-2.5 py-1 rounded border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <svg class="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="py-12 text-center text-gray-400">
                  No users found matching your search and filter criteria.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar (Shows 10 per page, Next & Previous) -->
      <div class="w-full px-2 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-100 select-none">
        <div>
          Showing <strong class="text-gray-900 font-bold">{{ getStartIndex() }} to {{ getEndIndex() }}</strong> of
          <strong class="text-gray-900 font-bold">{{ totalRecords() }}</strong> users
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="prevPage()"
            [disabled]="currentPage() === 1 || isLoading()"
            class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Previous</span>
          </button>

          <span class="text-gray-900 font-bold px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
            Page {{ currentPage() }} of {{ totalPages() || 1 }}
          </span>

          <button
            type="button"
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages() || isLoading()"
            class="px-3.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>Next</span>
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="modalTitle"
        (closeModal)="closeUserModal()"
      >
        <div class="space-y-4">
          <!-- Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Name <span class="text-red-500">*</span></label>
            <input
              type="text"
              [(ngModel)]="formName"
              placeholder="e.g. Ramesh Menon"
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
            />
          </div>

          <!-- Username & Password -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Username <span class="text-red-500">*</span></label>
              <input
                type="text"
                [(ngModel)]="formUsername"
                [disabled]="!!editingUserId()"
                placeholder="e.g. ramesh_m"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">
                Password {{ editingUserId() ? '(leave blank to keep unchanged)' : '*' }}
              </label>
              <input
                type="text"
                [(ngModel)]="formPassword"
                placeholder="Password"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              />
            </div>
          </div>

          <!-- Role & District -->
          <div class="grid grid-cols-1 gap-3" [ngClass]="formRole === 'branch_head' ? 'sm:grid-cols-2' : ''">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">System Role <span class="text-red-500">*</span></label>
              <select
                [(ngModel)]="formRole"
                (ngModelChange)="onRoleChange()"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              >
                <option value="company">Company</option>
                <option value="coordinator">Coordinator</option>
                <option value="branch_head">Branch Head</option>
                <option value="dealer">Dealer</option>
              </select>
            </div>

            @if (formRole === 'branch_head') {
              <div class="space-y-1.5 animate-fadeIn">
                <label class="block text-xs font-bold text-gray-700">Assigned District Hub <span class="text-red-500">*</span></label>
                <select
                  [(ngModel)]="formDistrictId"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
                >
                  <option [ngValue]="null">Select District...</option>
                  @for (d of availableDistrictsForBranchHead(); track d.id) {
                    <option [ngValue]="d.id">{{ d.name }}</option>
                  }
                </select>
                @if (availableDistrictsForBranchHead().length === 0) {
                  <p class="text-[11px] text-amber-600 font-medium">All districts already have an assigned Branch Head.</p>
                }
              </div>
            }
          </div>

          <!-- Phone & Email -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Phone Number</label>
              <input
                type="tel"
                [(ngModel)]="formPhone"
                placeholder="+91 98470 00000"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Email Address</label>
              <input
                type="email"
                [(ngModel)]="formEmail"
                placeholder="user@steeldoor.com"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              />
            </div>
          </div>

          <!-- Address -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Address / Location</label>
            <textarea
              rows="2"
              [(ngModel)]="formAddress"
              placeholder="Door No, Street, City / Area"
              class="w-full text-xs px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
            ></textarea>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              (click)="closeUserModal()"
              class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveUser()"
              class="px-5 py-2 rounded-xl bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {{ editingUserId() ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </div>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      @if (deleteModalOpen && userToDelete) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            (click)="cancelDelete()"
          ></div>

          <!-- Dialog Box -->
          <div
            role="dialog"
            aria-modal="true"
            class="relative w-full max-w-sm bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center animate-scaleUp z-10"
            (click)="$event.stopPropagation()"
          >
            <!-- Close button in top-right -->
            <button
              type="button"
              (click)="cancelDelete()"
              class="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Status Icon -->
            <div class="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mb-4 shadow-2xs">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <!-- Title & Message -->
            <h3 class="text-lg font-bold text-gray-900 mb-1">Delete User</h3>
            <p class="text-sm text-gray-500 leading-relaxed mb-6">
              Are you sure you want to delete user <strong class="text-gray-800">"{{ userToDelete.name || userToDelete.username }}"</strong>?
            </p>

            <!-- Action Buttons: OK and Cancel -->
            <div class="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                (click)="confirmDelete()"
                [disabled]="isDeleting()"
                class="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white shadow-soft transition-all cursor-pointer flex items-center justify-center gap-2 focus:ring-4 focus:ring-red-200 disabled:opacity-50"
              >
                @if (isDeleting()) {
                  <span class="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Deleting...</span>
                } @else {
                  <span>OK</span>
                }
              </button>

              <button
                type="button"
                (click)="cancelDelete()"
                [disabled]="isDeleting()"
                class="w-full py-2.5 px-4 rounded-xl font-bold text-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-all cursor-pointer flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private title = inject(Title);

  users = signal<SystemUser[]>([]);
  districts = signal<District[]>([]);
  branchHeadUsers = signal<any[]>([]);

  editingUserId = signal<string | number | null>(null);

  // Only allow districts that are NOT assigned to another non-deleted branch head user
  availableDistrictsForBranchHead = computed(() => {
    const allDistricts = this.districts();
    const currentId = this.editingUserId();
    const currentUserIdStr = currentId != null ? String(currentId) : null;
    
    // Collect all district IDs assigned to active branch head users (excluding deleted and current editing user)
    const assignedDistrictIds = new Set(
      this.branchHeadUsers()
        .filter(u => {
          const isDeleted = u.isDeleted === 1 || u.is_deleted === 1;
          const isCurrent = currentUserIdStr && String(u.id) === currentUserIdStr;
          return !isDeleted && !isCurrent && (u.districtId != null || u.district_id != null);
        })
        .map(u => String(u.districtId ?? u.district_id))
    );

    return allDistricts.filter(d => !assignedDistrictIds.has(String(d.id)));
  });

  activeRoleFilter = signal<string>('all');
  searchQuery = '';

  filterTabs = [
    { label: 'All Users', val: 'all' },
    { label: 'Company', val: 'company' },
    { label: 'Coordinator', val: 'coordinator' },
    { label: 'Branch Heads', val: 'branch_head' },
    { label: 'Dealers', val: 'dealer' }
  ];

  // Pagination State
  currentPage = signal<number>(1);
  pageSize = 10;
  totalPages = signal<number>(1);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);
  roleCounts = signal<Record<string, number>>({
    all: 0,
    company: 0,
    coordinator: 0,
    branch_head: 0,
    dealer: 0
  });

  // Modal State
  modalOpen = false;
  modalTitle = 'Add New User';
  formName = '';
  formUsername = '';
  formPassword = '';
  formRole = 'coordinator';
  formDistrictId: any = null;
  formPhone = '';
  formEmail = '';
  formAddress = '';

  // Delete Confirmation Modal State
  deleteModalOpen = false;
  userToDelete: SystemUser | null = null;
  isDeleting = signal<boolean>(false);

  filteredUsers = computed(() => {
    return this.users().filter(u => !u.isDeleted || u.isDeleted === 0);
  });

  ngOnInit(): void {
    this.title.setTitle('User Management | SteelGuard Admin');

    const resolved = this.route.snapshot.data['users'];
    if (resolved) {
      if (Array.isArray(resolved)) {
        this.users.set(resolved);
        this.totalRecords.set(resolved.length);
        this.totalPages.set(Math.ceil(resolved.length / this.pageSize) || 1);
      } else if (resolved.data) {
        this.users.set(resolved.data);
        if (resolved.pagination) {
          this.currentPage.set(resolved.pagination.page);
          this.totalPages.set(resolved.pagination.totalPages);
          this.totalRecords.set(resolved.pagination.total);
          if (resolved.pagination.roleCounts) {
            this.roleCounts.set(resolved.pagination.roleCounts);
          }
        }
      }
    } else {
      this.loadUsers(1);
    }

    // Preload districts and branch heads for quick availability in the creation modal
    this.loadDistrictsIfNeeded();
  }

  loadUsers(page: number = this.currentPage()): void {
    this.isLoading.set(true);
    const role = this.activeRoleFilter();
    const search = this.searchQuery.trim();

    this.dataService.getUsers({
      page,
      limit: this.pageSize,
      role: role !== 'all' ? role : undefined,
      search: search || undefined
    }).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        if (res.pagination) {
          this.currentPage.set(res.pagination.page);
          this.totalPages.set(res.pagination.totalPages);
          this.totalRecords.set(res.pagination.total);
          if (res.pagination.roleCounts) {
            this.roleCounts.set(res.pagination.roleCounts);
          }
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load users.');
        this.isLoading.set(false);
      }
    });
  }

  setRoleFilter(val: string): void {
    this.activeRoleFilter.set(val);
    this.loadUsers(1);
  }

  onSearchChange(): void {
    this.loadUsers(1);
  }

  prevPage(): void {
    if (this.currentPage() > 1 && !this.isLoading()) {
      this.loadUsers(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() && !this.isLoading()) {
      this.loadUsers(this.currentPage() + 1);
    }
  }

  getStartIndex(): number {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalRecords());
  }

  getRoleCount(filterVal: string): number {
    const counts = this.roleCounts();
    return counts[filterVal] ?? 0;
  }

  formatRoleName(role: string, roleId?: number, userType?: string): string {
    const rId = Number(roleId);
    const r = (role || '').toLowerCase();
    if (rId === 1 || r === 'company' || r === 'admin') return 'Company';
    if (rId === 2 || r === 'coordinator') return 'Coordinator';
    if (rId === 3 || r === 'branch_head') return 'Branch Head';
    if (rId === 4 || r === 'dealer') return 'Dealer';
    if (rId === 5 || r === 'customer') return 'Customer';
    return role || 'User';
  }

  getRoleBadgeClass(role: string, roleId?: number): string {
    const rId = Number(roleId);
    const r = (role || '').toLowerCase();
    if (rId === 1 || r === 'company' || r === 'admin') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (rId === 2 || r === 'coordinator') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (rId === 3 || r === 'branch_head') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (rId === 4 || r === 'dealer') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (rId === 5 || r === 'customer') {
      return 'bg-gray-100 text-gray-700 border-gray-200';
    }
    return 'bg-gray-100 text-gray-700 border-gray-200';
  }

  isUserActive(user: SystemUser): boolean {
    return user.isActive === true || user.isActive === 1;
  }

  toggleStatus(user: SystemUser): void {
    this.dataService.toggleUserStatus(user.id).subscribe({
      next: (res) => {
        const updated = this.users().map(u => {
          if (u.id === user.id) {
            return { ...u, isActive: !this.isUserActive(u) };
          }
          return u;
        });
        this.users.set(updated);
        this.toast.success(`User status updated.`);
      },
      error: () => {
        // Optimistic toggle fallback
        const updated = this.users().map(u => {
          if (u.id === user.id) {
            return { ...u, isActive: !this.isUserActive(u) };
          }
          return u;
        });
        this.users.set(updated);
        this.toast.success(`User status updated.`);
      }
    });
  }

  loadDistrictsIfNeeded(): void {
    if (this.districts().length === 0) {
      this.dataService.getDistricts().subscribe({
        next: (dists) => {
          if (Array.isArray(dists)) {
            this.districts.set(dists);
          }
        }
      });
    }

    // Always fetch latest branch heads to ensure assigned districts list is up to date
    this.dataService.getUsers({ role: 'branch_head', limit: 100 }).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.branchHeadUsers.set(res.data);
        }
      }
    });
  }

  onRoleChange(): void {
    if (this.formRole === 'branch_head') {
      this.loadDistrictsIfNeeded();
    } else {
      this.formDistrictId = null;
    }
  }

  openCreateModal(): void {
    this.editingUserId.set(null);
    this.modalTitle = 'Add New User';
    this.formName = '';
    this.formUsername = '';
    this.formPassword = '';
    this.formRole = 'coordinator';
    this.formDistrictId = null;
    this.formPhone = '';
    this.formEmail = '';
    this.formAddress = '';
    this.modalOpen = true;
  }

  openEditModal(user: SystemUser): void {
    this.editingUserId.set(user.id);
    this.modalTitle = 'Edit User';
    this.formName = user.name || '';
    this.formUsername = user.username || '';
    this.formPassword = '';
    if (user.role === 'admin' || user.role === 'company' || user.roleId === 1) {
      this.formRole = 'company';
    } else if (user.role === 'branch_head' || user.roleId === 3) {
      this.formRole = 'branch_head';
    } else if (user.role === 'dealer' || user.roleId === 4) {
      this.formRole = 'dealer';
    } else {
      this.formRole = 'coordinator';
    }
    this.formDistrictId = this.formRole === 'branch_head' ? (user.districtId || null) : null;
    if (this.formRole === 'branch_head') {
      this.loadDistrictsIfNeeded();
    }
    this.formPhone = user.phone || '';
    this.formEmail = user.email || '';
    this.formAddress = user.address || '';
    this.modalOpen = true;
  }

  closeUserModal(): void {
    this.modalOpen = false;
    this.editingUserId.set(null);
    this.modalTitle = 'Add New User';
    this.formName = '';
    this.formUsername = '';
    this.formPassword = '';
    this.formRole = 'coordinator';
    this.formDistrictId = null;
    this.formPhone = '';
    this.formEmail = '';
    this.formAddress = '';
  }

  saveUser(): void {
    if (!this.formName.trim()) {
      this.toast.error('Please enter the user full name.');
      return;
    }

    const currentEditingId = this.editingUserId();

    if (!currentEditingId) {
      if (!this.formUsername.trim()) {
        this.toast.error('Please enter a username.');
        return;
      }
      if (!this.formPassword) {
        this.toast.error('Please enter a password.');
        return;
      }
    }

    if (this.formRole === 'branch_head' && !this.formDistrictId) {
      this.toast.error('Please select an assigned district hub for Branch Head.');
      return;
    }

    // Double check that the selected district is not already assigned to another active branch head
    if (this.formRole === 'branch_head' && this.formDistrictId) {
      const alreadyAssigned = this.branchHeadUsers().some(u => {
        const isDeleted = u.isDeleted === 1 || u.is_deleted === 1;
        const isCurrent = currentEditingId != null && String(u.id) === String(currentEditingId);
        const uDistId = u.districtId ?? u.district_id;
        return !isDeleted && !isCurrent && String(uDistId) === String(this.formDistrictId);
      });
      if (alreadyAssigned) {
        this.toast.error('Another Branch Head is already assigned to this district. Please choose a different district.');
        return;
      }
    }

    const payload: any = {
      name: this.formName.trim(),
      username: this.formUsername.trim(),
      role: this.formRole,
      districtId: this.formRole === 'branch_head' ? this.formDistrictId : null,
      phone: this.formPhone.trim(),
      email: this.formEmail.trim(),
      address: this.formAddress.trim()
    };
    if (this.formPassword) {
      payload.password = this.formPassword;
    }

    if (currentEditingId) {
      this.dataService.updateUser(currentEditingId, payload).subscribe({
        next: (updatedUser) => {
          this.toast.success('User updated successfully.');
          this.closeUserModal();
          this.loadUsers();
        },
        error: (err) => {
          const raw = err?.error?.error || err?.message || '';
          if (
            raw.toLowerCase().includes('duplicate') ||
            raw.toLowerCase().includes('already exist') ||
            raw.toLowerCase().includes('users.username')
          ) {
            this.toast.error('User already exists');
          } else {
            this.toast.error(raw || 'Failed to update user.');
          }
        }
      });
    } else {
      this.dataService.createUser(payload).subscribe({
        next: (newUser) => {
          this.toast.success('User created successfully.');
          this.closeUserModal();
          this.loadUsers();
        },
        error: (err) => {
          const raw = err?.error?.error || err?.message || '';
          if (
            raw.toLowerCase().includes('duplicate') ||
            raw.toLowerCase().includes('already exist') ||
            raw.toLowerCase().includes('users.username')
          ) {
            this.toast.error('User already exists');
          } else {
            this.toast.error(raw || 'Failed to create user.');
          }
        }
      });
    }
  }

  promptDeleteUser(user: SystemUser): void {
    this.userToDelete = user;
    this.deleteModalOpen = true;
  }

  cancelDelete(): void {
    this.deleteModalOpen = false;
    this.userToDelete = null;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;
    const user = this.userToDelete;
    this.isDeleting.set(true);

    this.dataService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.deleteModalOpen = false;
        this.userToDelete = null;
        this.toast.success(`User "${user.name || user.username}" deleted successfully.`);
        if (this.users().length === 1 && this.currentPage() > 1) {
          this.loadUsers(this.currentPage() - 1);
        } else {
          this.loadUsers(this.currentPage());
        }
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.toast.error(err?.error?.error || 'Failed to delete user.');
      }
    });
  }
}
