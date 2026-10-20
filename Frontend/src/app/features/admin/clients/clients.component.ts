import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Client, District } from '../../../core/models';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-text">Clients Directory</h1>
          <p class="text-xs text-text-muted mt-0.5">Manage Customer, Dealer, and Corporate Company accounts and portal login credentials.</p>
        </div>

        <button
          type="button"
          (click)="openCreateModal()"
          class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-text-inverted text-xs font-bold shadow-soft transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Register New Client</span>
        </button>
      </div>

      <!-- Filter Bar -->
      <div class="p-4 rounded-2xl bg-surface border border-border shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="typeFilter = ''"
            class="px-3 py-1.5 rounded-lg border font-bold transition-all"
            [ngClass]="typeFilter === '' ? 'bg-primary text-text-inverted border-primary' : 'bg-background border-border text-text-muted'"
          >
            All ({{ clients().length }})
          </button>
          <button
            type="button"
            (click)="typeFilter = 'customer'"
            class="px-3 py-1.5 rounded-lg border font-bold transition-all"
            [ngClass]="typeFilter === 'customer' ? 'bg-primary text-text-inverted border-primary' : 'bg-background border-border text-text-muted'"
          >
            Customers
          </button>
          <button
            type="button"
            (click)="typeFilter = 'dealer'"
            class="px-3 py-1.5 rounded-lg border font-bold transition-all"
            [ngClass]="typeFilter === 'dealer' ? 'bg-primary text-text-inverted border-primary' : 'bg-background border-border text-text-muted'"
          >
            Dealers
          </button>
          <button
            type="button"
            (click)="typeFilter = 'company'"
            class="px-3 py-1.5 rounded-lg border font-bold transition-all"
            [ngClass]="typeFilter === 'company' ? 'bg-primary text-text-inverted border-primary' : 'bg-background border-border text-text-muted'"
          >
            Companies
          </button>
        </div>

        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search client by name or phone..."
          class="text-xs px-3 py-1.5 rounded-lg border border-border bg-background text-text focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <!-- Clients Table -->
      <div class="bg-surface rounded-3xl border border-border shadow-soft overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-border bg-surface-muted/30 text-text-muted uppercase text-[10px] font-bold tracking-wider">
                <th class="py-3 px-4">Client Name</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Contact Info</th>
                <th class="py-3 px-4">District / Area</th>
                <th class="py-3 px-4">Portal Account</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border/60">
              @for (c of filteredClients(); track c.id) {
                <tr class="hover:bg-surface-muted/40 transition-colors">
                  <td class="py-3.5 px-4 font-bold text-text">
                    {{ c.name }}
                    @if (c.contactPerson) {
                      <span class="block text-[10px] text-text-muted font-normal">Attn: {{ c.contactPerson }}</span>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      [ngClass]="{
                        'bg-primary/10 text-primary': c.clientType === 'customer',
                        'bg-accent/15 text-accent-dark': c.clientType === 'dealer',
                        'bg-status-scheduled/10 text-status-scheduled': c.clientType === 'company'
                      }"
                    >
                      {{ c.clientType }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-text-muted">
                    <div>{{ c.phone }}</div>
                    <div class="text-[11px]">{{ c.email }}</div>
                  </td>
                  <td class="py-3.5 px-4 text-text font-medium">
                    <div>{{ getDistrictName(c.districtId) }}</div>
                    <div class="text-[11px] text-text-muted">{{ c.area }}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    @if (c.hasLogin) {
                      <span class="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                        <span class="w-1.5 h-1.5 rounded-full bg-success"></span>
                        <span>{{ c.username }}</span>
                      </span>
                    } @else {
                      <span class="text-[11px] text-text-muted italic">No Login Credentials</span>
                    }
                  </td>
                  <td class="py-3.5 px-4 text-right space-x-2">
                    @if (c.clientType === 'dealer' || c.clientType === 'company') {
                      <button
                        type="button"
                        (click)="openCredentialsModal(c)"
                        class="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-muted text-[11px] font-semibold text-primary transition-colors"
                      >
                        {{ c.hasLogin ? 'Update Pass' : 'Set Login' }}
                      </button>
                    }
                    <button
                      type="button"
                      (click)="openEditModal(c)"
                      class="px-2.5 py-1 rounded-lg border border-border hover:bg-surface-muted text-[11px] font-semibold text-text transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- CREATE / EDIT CLIENT MODAL -->
      <app-modal
        [isOpen]="clientModalOpen"
        [title]="editingClientId ? 'Edit Client Record' : 'Create New Client Profile'"
        (closeModal)="clientModalOpen = false"
      >
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Client Type</label>
            <div class="grid grid-cols-3 gap-2">
              @for (t of ['customer', 'dealer', 'company']; track t) {
                <button
                  type="button"
                  (click)="formClientType = t"
                  class="py-2 rounded-xl border text-xs font-bold capitalize transition-all"
                  [ngClass]="formClientType === t ? 'bg-primary text-text-inverted border-primary' : 'bg-background border-border text-text'"
                >
                  {{ t }}
                </button>
              }
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Name <span class="text-danger">*</span></label>
            <input
              type="text"
              [(ngModel)]="formName"
              placeholder="Client / Company Name"
              class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <div class="flex items-center justify-between min-h-[16px]">
                <label class="block text-xs font-bold text-text">Phone <span class="text-danger">*</span></label>
                <span class="text-[10px] font-mono text-text-muted">{{ formPhone.length }}/10</span>
              </div>
              <input
                type="tel"
                [(ngModel)]="formPhone"
                maxlength="10"
                inputmode="numeric"
                (input)="onPhoneInput($event)"
                placeholder="10-digit mobile number"
                class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Email <span class="text-danger">*</span></label>
              <input
                type="email"
                [(ngModel)]="formEmail"
                placeholder="Email address"
                class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">District</label>
              <select
                [(ngModel)]="formDistrictId"
                (change)="onModalDistrictChange()"
                class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text"
              >
                @for (d of districts; track d.id) {
                  <option [value]="d.id">{{ d.name }}</option>
                }
              </select>
            </div>
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Area</label>
              <select
                [(ngModel)]="formArea"
                class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text"
              >
                @for (a of modalDistrictAreas; track a) {
                  <option [value]="a">{{ a }}</option>
                }
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Address</label>
            <input
              type="text"
              [(ngModel)]="formAddress"
              placeholder="Street address"
              class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text"
            />
          </div>

          <div class="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="clientModalOpen = false"
              class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveClient()"
              [disabled]="!formName || !formPhone || !formEmail"
              class="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
            >
              Save Client
            </button>
          </div>
        </div>
      </app-modal>

      <!-- CREDENTIALS MODAL FOR DEALER / COMPANY -->
      <app-modal
        [isOpen]="credModalOpen"
        title="Set Portal Login Credentials"
        (closeModal)="credModalOpen = false"
      >
        <div class="space-y-4">
          <p class="text-xs text-text-muted">
            Provide login credentials for <strong class="text-text">{{ selectedClientForCreds?.name }}</strong> to access their portal dashboard.
          </p>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Login Username <span class="text-danger">*</span></label>
            <input
              type="text"
              [(ngModel)]="credUsername"
              placeholder="username"
              class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Password <span class="text-danger">*</span></label>
            <input
              type="password"
              [(ngModel)]="credPassword"
              placeholder="password"
              class="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="credModalOpen = false"
              class="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-text hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="saveCredentials()"
              [disabled]="!credUsername || !credPassword"
              class="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class AdminClientsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  private titleService = inject(Title);

  clients = signal<Client[]>([]);
  districts: District[] = [];

  typeFilter = '';
  searchQuery = '';

  // Client modal
  clientModalOpen = false;
  editingClientId: string | null = null;
  formClientType = 'customer';
  formName = '';
  formPhone = '';
  formEmail = '';
  formDistrictId = 'dist-ekm';
  formArea = 'Kakkanad';
  formAddress = '';
  modalDistrictAreas: string[] = [];

  // Creds modal
  credModalOpen = false;
  selectedClientForCreds: Client | null = null;
  credUsername = '';
  credPassword = '';

  filteredClients = () => {
    return this.clients().filter(c => {
      if (this.typeFilter && c.clientType !== this.typeFilter) return false;
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
      }
      return true;
    });
  };

  ngOnInit(): void {
    this.titleService.setTitle('Clients Directory | SteelGuard');

    const resolvedClients = this.route.snapshot.data['clients'];
    if (resolvedClients) {
      this.clients.set(resolvedClients);
    } else {
      this.dataService.getClients().subscribe(c => this.clients.set(c));
    }

    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts) {
      this.districts = resolvedDistricts;
      this.onModalDistrictChange();
    } else {
      this.dataService.getDistricts().subscribe(d => {
        this.districts = d;
        this.onModalDistrictChange();
      });
    }
  }

  getDistrictName(distId: string): string {
    const d = this.districts.find(item => item.id === distId);
    return d ? d.name : distId;
  }

  onModalDistrictChange(): void {
    const d = this.districts.find(item => item.id === this.formDistrictId);
    this.modalDistrictAreas = d ? d.areas : [];
    if (this.modalDistrictAreas.length > 0) {
      this.formArea = this.modalDistrictAreas[0];
    }
  }

  openCreateModal(): void {
    this.editingClientId = null;
    this.formClientType = 'customer';
    this.formName = '';
    this.formPhone = '';
    this.formEmail = '';
    this.formDistrictId = 'dist-ekm';
    this.onModalDistrictChange();
    this.formAddress = '';
    this.clientModalOpen = true;
  }

  openEditModal(c: Client): void {
    this.editingClientId = c.id;
    this.formClientType = c.clientType;
    this.formName = c.name;
    this.formPhone = c.phone;
    this.formEmail = c.email;
    this.formDistrictId = c.districtId;
    this.onModalDistrictChange();
    this.formArea = c.area;
    this.formAddress = c.address;
    this.clientModalOpen = true;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 10 && val.startsWith('91')) val = val.substring(2);
    if (val.startsWith('0')) val = val.replace(/^0+/, '');
    if (val.length > 10) val = val.substring(0, 10);
    this.formPhone = val;
    input.value = val;
  }

  saveClient(): void {
    const cleanPhone = (this.formPhone || '').replace(/\D/g, '').slice(0, 10);
    const payload = {
      name: this.formName.trim(),
      clientType: this.formClientType as any,
      phone: cleanPhone,
      email: this.formEmail.trim(),
      districtId: this.formDistrictId,
      area: this.formArea,
      address: this.formAddress.trim()
    };

    if (this.editingClientId) {
      this.dataService.updateClient(this.editingClientId, payload).subscribe({
        next: updated => {
          this.clients.update(list => list.map(c => c.id === updated.id ? updated : c));
          this.clientModalOpen = false;
          this.toast.success(`Client ${updated.name} updated!`);
        },
        error: err => this.toast.error(err?.error?.error || 'Failed to update client.')
      });
    } else {
      this.dataService.createClient(payload).subscribe({
        next: created => {
          this.clients.update(list => [...list, created]);
          this.clientModalOpen = false;
          this.toast.success(`Client ${created.name} registered!`);
        },
        error: err => this.toast.error(err?.error?.error || 'Failed to create client.')
      });
    }
  }

  openCredentialsModal(c: Client): void {
    this.selectedClientForCreds = c;
    this.credUsername = c.username || c.name.toLowerCase().replace(/\s+/g, '_');
    this.credPassword = '';
    this.credModalOpen = true;
  }

  saveCredentials(): void {
    if (!this.selectedClientForCreds || !this.credUsername || !this.credPassword) return;

    this.dataService.setClientCredentials(this.selectedClientForCreds.id, {
      username: this.credUsername.trim(),
      password: this.credPassword.trim()
    }).subscribe({
      next: () => {
        const cId = this.selectedClientForCreds!.id;
        this.clients.update(list => list.map(c => c.id === cId ? { ...c, hasLogin: true, username: this.credUsername } : c));
        this.credModalOpen = false;
        this.toast.success('Credentials saved successfully!');
      },
      error: err => this.toast.error(err?.error?.error || 'Failed to set credentials.')
    });
  }
}
