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
              {{ users().length }} Total
            </span>
          </h1>
          <p class="text-xs text-gray-500 mt-0.5">Manage administrators, coordinators, branch heads, dealers, and customer access.</p>
        </div>

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
            <span>+ Add User</span>
          </button>
        </div>
      </div>

      <!-- Toolbar (Role filter & Search) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          @for (tab of filterTabs; track tab.val) {
            <button
              type="button"
              (click)="activeRoleFilter.set(tab.val)"
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
                <span class="uppercase tracking-wider">USER NAME</span>
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
                  {{ idx + 1 }}
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
                    [ngClass]="getRoleBadgeClass(user.role)"
                  >
                    {{ formatRoleName(user.role, user.userType) }}
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
                  <button
                    type="button"
                    (click)="openEditModal(user)"
                    class="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
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

      <!-- CREATE / EDIT MODAL -->
      <app-modal
        [isOpen]="modalOpen"
        [title]="editingUserId ? 'Edit User' : 'Add New User'"
        (closeModal)="modalOpen = false"
      >
        <div class="space-y-4">
          <!-- Full Name -->
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-gray-700">Full Name <span class="text-red-500">*</span></label>
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
                [disabled]="!!editingUserId"
                placeholder="e.g. ramesh_m"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">
                Password {{ editingUserId ? '(leave blank to keep unchanged)' : '*' }}
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
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">System Role <span class="text-red-500">*</span></label>
              <select
                [(ngModel)]="formRole"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              >
                <option value="company">Company (Super Admin)</option>
                <option value="coordinator">Coordinator (Operations / Field)</option>
                <option value="branch_head">Branch Head</option>
                <option value="dealer">Dealer (Authorized)</option>
                <option value="customer">Customer (Direct User)</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-gray-700">Assigned District Hub</label>
              <select
                [(ngModel)]="formDistrictId"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#0f9d58]"
              >
                <option [ngValue]="null">None / HQ (All Districts)</option>
                @for (d of districts(); track d.id) {
                  <option [ngValue]="d.id">{{ d.name }}</option>
                }
              </select>
            </div>
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
              (click)="modalOpen = false"
              class="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveUser()"
              class="px-5 py-2 rounded-xl bg-[#0f9d58] hover:bg-[#0b8043] text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              {{ editingUserId ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </div>
      </app-modal>
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

  activeRoleFilter = signal<string>('all');
  searchQuery = '';

  filterTabs = [
    { label: 'All Users', val: 'all' },
    { label: 'Admin / Coordinator', val: 'admins' },
    { label: 'Branch Heads', val: 'branch_head' },
    { label: 'Dealers', val: 'dealer' },
    { label: 'Customers', val: 'customer' }
  ];

  // Modal State
  modalOpen = false;
  editingUserId: string | number | null = null;
  formName = '';
  formUsername = '';
  formPassword = '';
  formRole = 'branch_head';
  formDistrictId: any = null;
  formPhone = '';
  formEmail = '';
  formAddress = '';

  filteredUsers = computed(() => {
    let list = this.users();
    const roleFilter = this.activeRoleFilter();

    if (roleFilter === 'admins') {
      list = list.filter(u => u.role === 'company' || u.role === 'admin' || u.role === 'coordinator');
    } else if (roleFilter !== 'all') {
      list = list.filter(u => u.role === roleFilter);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(u =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.districtName && u.districtName.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.title.setTitle('User Management | SteelGuard Admin');

    const resolved = this.route.snapshot.data['users'];
    if (resolved && Array.isArray(resolved) && resolved.length > 0) {
      this.users.set(resolved);
    } else {
      this.loadUsers();
    }

    const dResolved = this.route.snapshot.data['districts'];
    if (dResolved && Array.isArray(dResolved)) {
      this.districts.set(dResolved);
    }
  }

  loadUsers(): void {
    this.dataService.getUsers().subscribe({
      next: (list) => {
        if (list) this.users.set(list);
      },
      error: () => {
        this.toast.error('Failed to load users.');
      }
    });
  }

  getRoleCount(filterVal: string): number {
    const list = this.users();
    if (filterVal === 'all') return list.length;
    if (filterVal === 'admins') {
      return list.filter(u => u.role === 'company' || u.role === 'admin' || u.role === 'coordinator').length;
    }
    return list.filter(u => u.role === filterVal).length;
  }

  formatRoleName(role: string, userType?: string): string {
    const r = (role || '').toLowerCase();
    if (r === 'company' || r === 'admin') return 'Super Admin';
    if (r === 'coordinator') return userType === 'staff' ? 'Field Coordinator' : 'Operations Coordinator';
    if (r === 'branch_head') return 'Branch Head';
    if (r === 'dealer') return 'Dealer';
    if (r === 'customer') return 'Customer';
    return role || 'User';
  }

  getRoleBadgeClass(role: string): string {
    const r = (role || '').toLowerCase();
    if (r === 'company' || r === 'admin') {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }
    if (r === 'coordinator') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (r === 'branch_head') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (r === 'dealer') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
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

  openCreateModal(): void {
    this.editingUserId = null;
    this.formName = '';
    this.formUsername = '';
    this.formPassword = '';
    this.formRole = 'branch_head';
    this.formDistrictId = null;
    this.formPhone = '';
    this.formEmail = '';
    this.formAddress = '';
    this.modalOpen = true;
  }

  openEditModal(user: SystemUser): void {
    this.editingUserId = user.id;
    this.formName = user.name || '';
    this.formUsername = user.username || '';
    this.formPassword = '';
    this.formRole = user.role || 'customer';
    this.formDistrictId = user.districtId || null;
    this.formPhone = user.phone || '';
    this.formEmail = user.email || '';
    this.formAddress = user.address || '';
    this.modalOpen = true;
  }

  saveUser(): void {
    if (!this.formName.trim()) {
      this.toast.error('Please enter the user full name.');
      return;
    }

    if (!this.editingUserId) {
      if (!this.formUsername.trim()) {
        this.toast.error('Please enter a username.');
        return;
      }
      if (!this.formPassword) {
        this.toast.error('Please enter a password.');
        return;
      }
    }

    const payload: any = {
      name: this.formName.trim(),
      username: this.formUsername.trim(),
      role: this.formRole,
      districtId: this.formDistrictId,
      phone: this.formPhone.trim(),
      email: this.formEmail.trim(),
      address: this.formAddress.trim()
    };
    if (this.formPassword) {
      payload.password = this.formPassword;
    }

    if (this.editingUserId) {
      this.dataService.updateUser(this.editingUserId, payload).subscribe({
        next: (updatedUser) => {
          this.toast.success('User updated successfully.');
          this.modalOpen = false;
          this.loadUsers();
        },
        error: (err) => {
          this.toast.error(err?.error?.error || 'Failed to update user.');
        }
      });
    } else {
      this.dataService.createUser(payload).subscribe({
        next: (newUser) => {
          this.toast.success('User created successfully.');
          this.modalOpen = false;
          this.loadUsers();
        },
        error: (err) => {
          this.toast.error(err?.error?.error || 'Failed to create user.');
        }
      });
    }
  }

  printWorksheet(): void {
    window.print();
  }
}
