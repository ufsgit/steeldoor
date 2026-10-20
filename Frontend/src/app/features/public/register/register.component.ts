import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { AuthService } from '../../../core/auth.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { ClientType, District } from '../../../core/models';

function phoneValidator(control: AbstractControl) {
  if (!control.value) return null;
  const clean = control.value.toString().trim().replace(/\D/g, '');
  const isValid = /^\d{10}$/.test(clean);
  return isValid ? null : { invalidPhone: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-xl mx-auto px-4 py-12 space-y-8 animate-fadeIn">
      <div class="text-center space-y-2">
        <span class="text-xs font-bold uppercase tracking-widest text-accent">Client Self-Registration</span>
        <h1 class="text-3xl font-black text-text">Create Account</h1>
        <p class="text-xs text-text-muted">Register as a retail customer, hardware dealer, or corporate construction builder.</p>
      </div>

      <div class="bg-surface rounded-3xl border border-border shadow-card p-6 sm:p-8 space-y-6">
        <!-- Client Type Switcher -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-text">Select Account Type</label>
          <div class="grid grid-cols-3 gap-2">
            @for (t of ['customer', 'dealer', 'company']; track t) {
              <button
                type="button"
                (click)="onTypeChange(t)"
                class="py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all"
                [ngClass]="registerForm.get('clientType')?.value === t
                  ? 'bg-primary text-text-inverted border-primary shadow-soft'
                  : 'bg-background border-border text-text hover:border-border-hover'"
              >
                {{ t }}
              </button>
            }
          </div>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">
              {{ registerForm.get('clientType')?.value === 'company' ? 'Enterprise / Firm Name' : 'Full Name' }}
              <span class="text-danger">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              placeholder="e.g. Acme Builders or John Mathew"
              class="w-full text-xs px-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Email Address <span class="text-danger">*</span></label>
              <input
                type="email"
                formControlName="email"
                placeholder="email@example.com"
                class="w-full text-xs px-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div class="space-y-1.5">
              <div class="flex items-center justify-between min-h-[18px]">
                <label class="block text-xs font-bold text-text">Phone Number <span class="text-danger">*</span></label>
                <span
                  class="text-[10px] font-mono transition-colors"
                  [ngClass]="registerForm.get('phone')?.value?.length === 10 ? 'text-primary font-bold' : 'text-text-muted'"
                >
                  {{ registerForm.get('phone')?.value?.length || 0 }}/10 digits
                </span>
              </div>
              <div class="relative flex items-center">
                <div class="absolute left-3 flex items-center gap-1.5 pointer-events-none text-xs font-semibold text-text-muted border-r border-border pr-2.5">
                  <span class="text-sm">🇮🇳</span>
                  <span class="font-mono text-text font-bold">+91</span>
                </div>
                <input
                  type="tel"
                  formControlName="phone"
                  placeholder="9847012345"
                  maxlength="10"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  (keydown)="onPhoneKeyDown($event)"
                  (input)="onPhoneInput($event)"
                  class="w-full text-xs pl-20 pr-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent font-medium tracking-wide"
                  [class.border-danger]="registerForm.get('phone')?.touched && registerForm.get('phone')?.invalid"
                />
              </div>
              @if (registerForm.get('phone')?.touched && registerForm.get('phone')?.hasError('required')) {
                <p class="text-[11px] text-danger font-medium flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  Phone number is required
                </p>
              } @else if (registerForm.get('phone')?.touched && registerForm.get('phone')?.hasError('invalidPhone')) {
                <p class="text-[11px] text-danger font-medium flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  Must be exactly 10 digits
                </p>
              }
            </div>
          </div>

          <!-- CONDITIONAL DEALER FIELDS -->
          @if (registerForm.get('clientType')?.value === 'dealer') {
            <div class="p-4 rounded-2xl bg-surface-muted/50 border border-border space-y-3 animate-fadeIn">
              <div class="text-[11px] font-bold text-primary uppercase">Dealer Verification Details</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block text-[11px] font-medium text-text">GST Identification Number <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    formControlName="gstNumber"
                    placeholder="32AAAAA0000A1Z5"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                  />
                </div>
                <div class="space-y-1">
                  <label class="block text-[11px] font-medium text-text">Dealer Trade License</label>
                  <input
                    type="text"
                    formControlName="dealerLicense"
                    placeholder="DLR-KL-000"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                  />
                </div>
              </div>
            </div>
          }

          <!-- CONDITIONAL COMPANY FIELDS -->
          @if (registerForm.get('clientType')?.value === 'company') {
            <div class="p-4 rounded-2xl bg-surface-muted/50 border border-border space-y-3 animate-fadeIn">
              <div class="text-[11px] font-bold text-primary uppercase">Company Registration Details</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block text-[11px] font-medium text-text">GSTIN <span class="text-danger">*</span></label>
                  <input
                    type="text"
                    formControlName="gstNumber"
                    placeholder="32AAAAA0000A1Z5"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                  />
                </div>
                <div class="space-y-1">
                  <label class="block text-[11px] font-medium text-text">Company Reg. / CIN Number</label>
                  <input
                    type="text"
                    formControlName="companyRegNumber"
                    placeholder="CIN-U00000KL0000"
                    class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                  />
                </div>
              </div>
            </div>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">District <span class="text-danger">*</span></label>
              <select
                formControlName="districtId"
                (change)="onDistrictChange()"
                class="w-full text-xs px-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                @for (d of districts; track d.id) {
                  <option [value]="d.id">{{ d.name }}</option>
                }
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-text">Area / Neighborhood <span class="text-danger">*</span></label>
              <select
                formControlName="area"
                class="w-full text-xs px-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                @for (a of currentDistrictAreas; track a) {
                  <option [value]="a">{{ a }}</option>
                }
              </select>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-text">Office / Residential Address <span class="text-danger">*</span></label>
            <input
              type="text"
              formControlName="address"
              placeholder="Full address"
              class="w-full text-xs px-3.5 py-3 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <!-- Login Credentials Setup -->
          <div class="p-4 rounded-2xl bg-surface-muted/30 border border-border space-y-3">
            <div class="text-xs font-bold text-text">Portal Login Password</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="block text-[11px] font-medium text-text">Username <span class="text-danger">*</span></label>
                <input
                  type="text"
                  formControlName="username"
                  placeholder="username"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                />
              </div>
              <div class="space-y-1">
                <label class="block text-[11px] font-medium text-text">Password <span class="text-danger">*</span></label>
                <input
                  type="password"
                  formControlName="password"
                  placeholder="min 6 characters"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-border bg-surface text-text"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="registerForm.invalid || isSubmitting()"
            class="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-xs font-bold shadow-soft transition-all"
          >
            @if (isSubmitting()) {
              <span>Creating Account...</span>
            } @else {
              <span>Complete Registration</span>
            }
          </button>
        </form>

        <div class="pt-2 text-center text-xs text-text-muted">
          Already registered?
          <a routerLink="/" class="text-primary font-bold hover:underline">Sign in here</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  districts: District[] = [];
  currentDistrictAreas: string[] = [];
  isSubmitting = signal(false);

  registerForm!: FormGroup;

  ngOnInit(): void {
    this.titleService.setTitle('Register Client Account | SteelGuard');
    this.metaService.updateTag({
      name: 'description',
      content: 'Customer and dealer self registration for Steel Door Management System.'
    });

    this.registerForm = this.fb.group({
      clientType: ['customer', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, phoneValidator]],
      districtId: ['dist-ekm', Validators.required],
      area: ['Kakkanad', Validators.required],
      address: ['', Validators.required],
      gstNumber: [''],
      dealerLicense: [''],
      companyRegNumber: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });

    this.dataService.getDistricts().subscribe(dists => {
      this.districts = dists;
      this.onDistrictChange();
    });
  }

  onTypeChange(type: string): void {
    this.registerForm.get('clientType')?.setValue(type);
    if (type === 'dealer' || type === 'company') {
      this.registerForm.get('gstNumber')?.setValidators([Validators.required]);
    } else {
      this.registerForm.get('gstNumber')?.clearValidators();
    }
    this.registerForm.get('gstNumber')?.updateValueAndValidity();
  }

  onDistrictChange(): void {
    const distId = this.registerForm.get('districtId')?.value;
    const match = this.districts.find(d => d.id === distId);
    this.currentDistrictAreas = match ? match.areas : [];
    if (this.currentDistrictAreas.length > 0) {
      this.registerForm.get('area')?.setValue(this.currentDistrictAreas[0]);
    }
  }

  onPhoneKeyDown(event: KeyboardEvent): void {
    const allowedNav = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Home', 'End'];
    if (allowedNav.includes(event.key)) {
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }
    const input = event.target as HTMLInputElement;
    const currentVal = input.value;
    const selStart = input.selectionStart ?? 0;
    const selEnd = input.selectionEnd ?? 0;
    const selectionLength = selEnd - selStart;

    // Strictly block typing past 10 digits
    if (currentVal.length >= 10 && selectionLength === 0) {
      event.preventDefault();
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');

    if (val.length > 10 && val.startsWith('91')) {
      val = val.substring(2);
    }
    if (val.length > 10) {
      val = val.substring(0, 10);
    }

    input.value = val;
    this.registerForm.get('phone')?.setValue(val, { emitEvent: true });
    this.registerForm.get('phone')?.markAsDirty();
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isSubmitting.set(true);
    const formVal = this.registerForm.value;

    const clientPayload = {
      name: formVal.name,
      clientType: formVal.clientType,
      email: formVal.email,
      phone: (formVal.phone || '').replace(/\D/g, '').slice(0, 10),
      address: formVal.address,
      districtId: formVal.districtId,
      area: formVal.area,
      gstNumber: formVal.gstNumber || undefined,
      dealerLicense: formVal.dealerLicense || undefined,
      companyRegNumber: formVal.companyRegNumber || undefined
    };

    const credentials = {
      username: formVal.username,
      password: formVal.password
    };

    this.dataService.createClient(clientPayload, credentials).subscribe({
      next: () => {
        this.toast.success('Registration successful! Logging in...');
        this.auth.login(credentials.username, credentials.password).subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/client']);
          },
          error: () => {
            this.isSubmitting.set(false);
            this.router.navigate(['/']);
          }
        });
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toast.error(err?.error?.error || 'Registration failed. Username may already be in use.');
      }
    });
  }
}
