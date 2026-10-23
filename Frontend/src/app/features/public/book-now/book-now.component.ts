import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DataService } from '../../../core/data.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { AuthService } from '../../../core/auth.service';
import { Booking, BranchHead, District, ClientType, UserRole, CreateBookingPayload } from '../../../core/models';
import { environment } from '../../../../environments/environment';

// Custom validator for 10-digit phone number
function phoneValidator(control: AbstractControl) {
  if (!control.value) return null;
  const clean = control.value.toString().trim().replace(/\D/g, '');
  const isValid = /^\d{10}$/.test(clean);
  return isValid ? null : { invalidPhone: true };
}

// Custom validator for pincode
function pincodeValidator(control: AbstractControl) {
  if (!control.value) return null;
  const clean = control.value.toString().trim();
  const isValid = /^\d{6}$/.test(clean);
  return isValid ? null : { invalidPincode: true };
}

@Component({
  selector: 'app-book-now',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      @if (submittedBooking()) {
        <!-- SUCCESS CONFIRMATION SCREEN -->
        <div class="bg-surface rounded-3xl border border-border shadow-elevated p-8 sm:p-12 text-center space-y-6">
          <div class="w-16 h-16 rounded-3xl bg-success/15 text-success mx-auto flex items-center justify-center shadow-soft">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="space-y-2">
            <span class="text-xs font-bold uppercase tracking-widest text-accent">Installation Request Registered</span>
            <h1 class="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">Installation Confirmed!</h1>
            <p class="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Your steel door installation request has been recorded. Our regional district branch team will contact you to confirm the installation schedule.
            </p>
          </div>

          <!-- Highlight Booking Summary Box -->
          <div class="max-w-md mx-auto p-5 rounded-2xl bg-surface-muted/60 border border-border space-y-3 text-left">
            <div class="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
              <span class="text-text-muted font-medium">Booking ID:</span>
              <span class="font-mono font-black text-sm text-primary">{{ submittedBooking()?.id }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
              <span class="text-text-muted font-medium">Name:</span>
              <span class="font-bold text-text">{{ submittedBooking()?.clientName }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
              <span class="text-text-muted font-medium">Contact Phone:</span>
              <span class="font-bold text-text">+91 {{ submittedBooking()?.contactPhone }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
              <span class="text-text-muted font-medium">Brand & Model:</span>
              <span class="font-bold text-text">{{ submittedBooking()?.doorDetails?.brand || 'SteelGuard' }} • {{ submittedBooking()?.doorDetails?.doorType }}</span>
            </div>
            <div class="flex items-center justify-between text-xs border-b border-border/50 pb-2.5">
              <span class="text-text-muted font-medium">Quantity:</span>
              <span class="font-bold text-primary">{{ submittedBooking()?.doorDetails?.quantity }} Unit(s)</span>
            </div>
            @if (submittedBooking()?.doorDetails?.images?.length) {
              <div class="space-y-1.5 border-b border-border/50 pb-2.5">
                <span class="text-text-muted font-medium text-xs">Site Photos ({{ submittedBooking()?.doorDetails?.images?.length }}):</span>
                <div class="flex flex-wrap gap-2 pt-1">
                  @for (pic of submittedBooking()?.doorDetails?.images; track $index) {
                    <img [src]="pic" class="w-12 h-12 rounded-lg object-cover border border-border shadow-2xs" alt="Site thumbnail" />
                  }
                </div>
              </div>
            }
            <div class="flex items-center justify-between text-xs">
              <span class="text-text-muted font-medium">Location:</span>
              <span class="font-bold text-text">{{ submittedBooking()?.area }}, {{ submittedBooking()?.districtName }}</span>
            </div>
          </div>

          <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              (click)="resetForm()"
              class="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-text-inverted text-xs font-bold shadow-soft hover:bg-primary-hover transition-colors"
            >
              Book Another Installation
            </button>
            <a
              routerLink="/"
              class="w-full sm:w-auto px-6 py-3 rounded-xl border border-border text-text text-xs font-semibold hover:bg-surface-muted transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      } @else {
        <!-- PAGE TITLE -->
        <div class="text-center max-w-xl mx-auto space-y-2">
          <h1 class="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Book Door Installation
          </h1>
          <p class="text-xs sm:text-sm text-text-muted leading-relaxed">
            Fill in your contact and location details to schedule an installation.
          </p>
        </div>

        <!-- SIMPLE SINGLE-STEP BOOKING FORM -->
        <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="bg-surface rounded-3xl border border-border shadow-elevated p-6 sm:p-10 space-y-6">

          <!-- Name & Contact Phone -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Name -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Name <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                formControlName="clientName"
                placeholder="e.g. John Mathew"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                [class.border-danger]="bookingForm.get('clientName')?.touched && bookingForm.get('clientName')?.invalid"
              />
              @if (bookingForm.get('clientName')?.touched && bookingForm.get('clientName')?.hasError('required')) {
                <p class="text-[11px] text-danger font-medium">Name is required</p>
              }
            </div>

            <!-- Contact Phone -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between min-h-[18px]">
                <label class="block text-xs font-semibold text-text">
                  Contact Phone <span class="text-danger">*</span>
                </label>
                <span class="text-[10px] font-mono text-text-muted">
                  {{ bookingForm.get('contactPhone')?.value?.length || 0 }}/10 digits
                </span>
              </div>
              <div class="relative flex items-center">
                <div class="absolute left-3 flex items-center gap-1.5 pointer-events-none text-xs font-semibold text-text-muted border-r border-border pr-2.5">
                  <span class="font-mono text-text font-bold">+91</span>
                </div>
                <input
                  type="tel"
                  formControlName="contactPhone"
                  placeholder="9847012345"
                  maxlength="10"
                  inputmode="numeric"
                  (keydown)="onPhoneKeyDown($event)"
                  (input)="onPhoneInput($event)"
                  class="w-full text-xs pl-16 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-medium tracking-wide"
                  [class.border-danger]="bookingForm.get('contactPhone')?.touched && bookingForm.get('contactPhone')?.invalid"
                />
              </div>
              @if (bookingForm.get('contactPhone')?.touched && (bookingForm.get('contactPhone')?.hasError('required') || bookingForm.get('contactPhone')?.hasError('invalidPhone'))) {
                <p class="text-[11px] text-danger font-medium">Enter a valid 10-digit phone number</p>
              }
            </div>
          </div>

          <!-- Brand & Quantity (2 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Brand Selection -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Door Brand <span class="text-danger">*</span>
              </label>
              <select
                formControlName="brand"
                class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-medium"
              >
                <option value="Tata Pravesh">Tata Pravesh</option>
                <option value="SteelGuard Signature">SteelGuard Signature</option>
                <option value="Godrej Security Doors">Godrej Security Doors</option>
                <option value="Dormakaba Architectural">Dormakaba Architectural</option>
                <option value="Kalpataru Doors">Kalpataru Doors</option>
                <option value="Custom / Other Brand">Custom / Other Brand</option>
              </select>
            </div>

            <!-- Quantity with +/- Buttons -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-text">
                Quantity (Doors to Install) <span class="text-danger">*</span>
              </label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="decrementQuantity()"
                  class="w-10 h-10 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text font-black text-sm flex items-center justify-center transition-colors cursor-pointer select-none"
                  title="Decrease quantity"
                >
                  −
                </button>
                <input
                  type="number"
                  formControlName="quantity"
                  min="1"
                  max="100"
                  class="w-full text-center text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-black"
                />
                <button
                  type="button"
                  (click)="incrementQuantity()"
                  class="w-10 h-10 rounded-xl border border-border bg-surface hover:bg-surface-muted text-text font-black text-sm flex items-center justify-center transition-colors cursor-pointer select-none"
                  title="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <!-- Requirement -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-text">
              Door Model / Specific Requirement <span class="text-danger">*</span>
            </label>
            <textarea
              formControlName="requirement"
              rows="2"
              placeholder="e.g. Main entrance double door, bedroom single door, flush fire door, old frame replacement..."
              class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              [class.border-danger]="bookingForm.get('requirement')?.touched && bookingForm.get('requirement')?.invalid"
            ></textarea>
            @if (bookingForm.get('requirement')?.touched && bookingForm.get('requirement')?.hasError('required')) {
              <p class="text-[11px] text-danger font-medium">Please enter your door installation requirement</p>
            }
          </div>

          <!-- Site / Door Photos Upload -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-text">
                Upload Site / Door Photos <span class="text-[11px] text-text-muted font-normal">(Optional, up to 5 photos)</span>
              </label>
              @if (uploadedImages().length > 0) {
                <span class="text-[11px] text-primary font-bold">{{ uploadedImages().length }}/5 added</span>
              }
            </div>

            <!-- Upload Dropzone -->
            <div
              (click)="fileInput.click()"
              class="border-2 border-dashed border-border hover:border-primary/50 bg-background hover:bg-surface-muted/50 rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
            >
              <input
                #fileInput
                type="file"
                accept="image/*"
                multiple
                (change)="onFileSelected($event)"
                class="hidden"
              />
              <svg class="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div class="text-xs font-semibold text-text">
                Click to attach site, wall or existing door photos
              </div>
              <p class="text-[10px] text-text-muted">PNG, JPG or WEBP (Max 5 photos)</p>
            </div>

            <!-- Image Thumbnail Previews -->
            @if (uploadedImages().length > 0) {
              <div class="flex flex-wrap gap-2.5 pt-1">
                @for (img of uploadedImages(); track $index; let i = $index) {
                  <div class="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-border group bg-surface shadow-xs">
                    <img [src]="getFileUrl(img)" alt="Site preview" class="w-full h-full object-cover" />
                    <button
                      type="button"
                      (click)="removeImage(i); $event.stopPropagation()"
                      class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-danger text-white text-[11px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove photo"
                    >
                      ✕
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Location Details Section -->
          <div class="pt-2 border-t border-border/70 space-y-4">
            <h2 class="text-xs font-bold uppercase tracking-wider text-text-muted">Location Details</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- District -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-text">District <span class="text-danger">*</span></label>
                <select
                  formControlName="districtId"
                  (change)="onDistrictChange()"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-medium"
                >
                  @for (d of districts; track d.id) {
                    <option [value]="d.id">{{ d.name }} District ({{ d.code }})</option>
                  }
                </select>
              </div>

              <!-- Area / Neighborhood -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-text">Area / Neighborhood <span class="text-danger">*</span></label>
                <select
                  formControlName="area"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-medium"
                >
                  @for (area of currentDistrictAreas; track area) {
                    <option [value]="area">{{ area }}</option>
                  }
                </select>
              </div>

              <!-- Site Address -->
              <div class="sm:col-span-2 space-y-1.5">
                <label class="block text-xs font-semibold text-text">Site Address / House Details <span class="text-danger">*</span></label>
                <textarea
                  formControlName="streetAddress"
                  rows="2"
                  placeholder="Building name, flat/house number, street name..."
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                  [class.border-danger]="bookingForm.get('streetAddress')?.touched && bookingForm.get('streetAddress')?.invalid"
                ></textarea>
                @if (bookingForm.get('streetAddress')?.touched && bookingForm.get('streetAddress')?.hasError('required')) {
                  <p class="text-[11px] text-danger font-medium">Site address is required</p>
                }
              </div>

              <!-- Landmark -->
              <div class="space-y-1.5">
                <label class="block text-xs font-medium text-text-muted">Landmark (Optional)</label>
                <input
                  type="text"
                  formControlName="landmark"
                  placeholder="Near temple, hospital, metro pillar..."
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
                />
              </div>

              <!-- PIN Code -->
              <div class="space-y-1.5">
                <label class="block text-xs font-semibold text-text">PIN Code (6 digits) <span class="text-danger">*</span></label>
                <input
                  type="text"
                  formControlName="pincode"
                  placeholder="e.g. 682030"
                  maxlength="6"
                  inputmode="numeric"
                  (input)="onPincodeInput($event)"
                  class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-medium tracking-wide"
                  [class.border-danger]="bookingForm.get('pincode')?.touched && bookingForm.get('pincode')?.invalid"
                />
                @if (bookingForm.get('pincode')?.touched && (bookingForm.get('pincode')?.hasError('required') || bookingForm.get('pincode')?.hasError('invalidPincode'))) {
                  <p class="text-[11px] text-danger font-medium">Enter a valid 6-digit postal code</p>
                }
              </div>
            </div>
          </div>

          <!-- CONFIRM & SCHEDULE INSTALLATION BUTTON (UNDER THESE DETAILS) -->
          <div class="pt-4 border-t border-border space-y-3">
            <button
              type="submit"
              [disabled]="isSubmitting()"
              class="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-text-inverted text-base font-extrabold shadow-soft transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              @if (isSubmitting()) {
                <span class="w-4 h-4 border-2 border-text-inverted border-t-transparent rounded-full animate-spin"></span>
                <span>Scheduling Installation...</span>
              } @else {
                <span>Confirm & Schedule Installation</span>
                <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              }
            </button>

            <p class="text-center text-[11px] text-text-muted">
              Zero wall damage guaranteed • Sub-millimeter laser calibration across Kerala districts.
            </p>
          </div>

        </form>
      }
    </div>
  `
})
export class BookNowComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  districts: District[] = [];
  branchHeads: BranchHead[] = [];

  isSubmitting = signal(false);
  submittedBooking = signal<Booking | null>(null);
  uploadedImages = signal<string[]>([]);

  bookingForm!: FormGroup;

  get currentDistrictAreas(): string[] {
    const selectedDistId = this.bookingForm?.get('districtId')?.value;
    const match = this.districts.find(d => d.id === selectedDistId);
    return match ? match.areas : [];
  }

  decrementQuantity(): void {
    const cur = Number(this.bookingForm.get('quantity')?.value) || 1;
    if (cur > 1) {
      this.bookingForm.get('quantity')?.setValue(cur - 1);
    }
  }

  incrementQuantity(): void {
    const cur = Number(this.bookingForm.get('quantity')?.value) || 1;
    if (cur < 100) {
      this.bookingForm.get('quantity')?.setValue(cur + 1);
    }
  }

  getFileUrl(img: string): string {
    if (!img) return '';
    if (img.startsWith('data:') || img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    const base = environment.fileUrl || 'http://localhost:5000';
    return `${base}${img.startsWith('/') ? '' : '/'}${img}`;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const remaining = 5 - this.uploadedImages().length;
    if (remaining <= 0) {
      this.toast.error('Maximum 5 photos allowed per booking');
      input.value = '';
      return;
    }

    const toProcess = files.slice(0, remaining);

    // Upload physical files directly to Backend /api/uploads
    this.dataService.uploadDocuments(toProcess).subscribe({
      next: (res) => {
        if (res && res.urls && res.urls.length > 0) {
          this.uploadedImages.update(prev => [...prev, ...res.urls]);
          this.toast.success(`${res.urls.length} photo(s) uploaded successfully!`);
        }
      },
      error: () => {
        // Fallback: local compression preview (backend will persist it to uploads directory on submit)
        for (const file of toProcess) {
          if (!file.type.startsWith('image/')) continue;
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) {
              this.compressImage(dataUrl, (compressed) => {
                this.uploadedImages.update(prev => [...prev, compressed]);
              });
            }
          };
          reader.readAsDataURL(file);
        }
      }
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.uploadedImages.update(prev => prev.filter((_, i) => i !== index));
  }

  private compressImage(dataUrl: string, callback: (compressed: string) => void): void {
    const img = new Image();
    img.onload = () => {
      const maxDim = 900;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.8));
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Schedule Steel Door Installation | SteelGuard Kerala');
    this.metaService.updateTag({
      name: 'description',
      content: 'Book professional steel door installation and precision frame mounting across Kerala with automated district branch routing.'
    });

    this.initForm();
    this.loadDistrictsAndBranchHeads();
    this.prefillQueryParamOrUser();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      contactPhone: ['', [Validators.required, phoneValidator]],
      brand: ['Tata Pravesh', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(100)]],
      requirement: ['', [Validators.required, Validators.minLength(3)]],
      districtId: ['dist-ekm', Validators.required],
      area: ['Kakkanad', Validators.required],
      streetAddress: ['', [Validators.required, Validators.minLength(5)]],
      landmark: [''],
      pincode: ['682030', [Validators.required, pincodeValidator]]
    });
  }

  private loadDistrictsAndBranchHeads(): void {
    const resolvedDistricts = this.route.snapshot.data['districts'];
    if (resolvedDistricts && resolvedDistricts.length) {
      this.districts = resolvedDistricts;
      this.updateAreasForSelectedDistrict();
    } else {
      this.dataService.getDistricts().subscribe(dists => {
        this.districts = dists;
        this.updateAreasForSelectedDistrict();
      });
    }

    const resolvedHeads = this.route.snapshot.data['branchHeads'];
    if (resolvedHeads && resolvedHeads.length) {
      this.branchHeads = resolvedHeads;
    } else {
      this.dataService.getBranchHeads().subscribe(heads => {
        this.branchHeads = heads;
      });
    }
  }

  private prefillQueryParamOrUser(): void {
    const currentUser = this.auth.currentUser();
    if (currentUser && currentUser.role === 'client') {
      let prefillPhone = (currentUser.phone || '').replace(/\D/g, '');
      if (prefillPhone.length > 10 && prefillPhone.startsWith('91')) {
        prefillPhone = prefillPhone.substring(2);
      }
      if (prefillPhone.startsWith('0')) {
        prefillPhone = prefillPhone.replace(/^0+/, '');
      }
      prefillPhone = prefillPhone.substring(0, 10);

      this.bookingForm.patchValue({
        clientName: currentUser.name,
        contactPhone: prefillPhone
      });
      if (currentUser.districtId) {
        this.bookingForm.patchValue({ districtId: currentUser.districtId });
        this.updateAreasForSelectedDistrict();
      }
    }

    this.route.queryParamMap.subscribe(params => {
      const typeParam = params.get('doorType') || params.get('service');
      if (typeParam) {
        this.bookingForm.patchValue({ requirement: typeParam });
      }
    });
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
    this.bookingForm.get('contactPhone')?.setValue(val, { emitEvent: true });
    this.bookingForm.get('contactPhone')?.markAsDirty();
  }

  onPincodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let clean = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = clean;
    this.bookingForm.get('pincode')?.setValue(clean, { emitEvent: true });
    this.bookingForm.get('pincode')?.markAsDirty();
  }

  onDistrictChange(): void {
    this.updateAreasForSelectedDistrict();
  }

  private updateAreasForSelectedDistrict(): void {
    const areas = this.currentDistrictAreas;
    if (areas.length > 0) {
      this.bookingForm.get('area')?.setValue(areas[0]);
    } else {
      this.bookingForm.get('area')?.setValue('');
    }
  }

  submitBooking(): void {
    this.bookingForm.markAllAsTouched();
    if (this.bookingForm.invalid) {
      this.toast.error('Please complete all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);

    const val = this.bookingForm.value;
    const cleanPhone = (val.contactPhone || '').replace(/\D/g, '').slice(0, 10);
    const currentUser = this.auth.currentUser();

    const payload: CreateBookingPayload = {
      clientId: currentUser?.clientId || undefined,
      clientName: (val.clientName || '').trim(),
      clientType: (currentUser?.clientType || 'customer') as ClientType,
      contactPhone: cleanPhone,
      contactEmail: currentUser?.email || `${cleanPhone}@customer.steelguard.in`,
      districtId: val.districtId,
      area: val.area,
      address: (val.streetAddress || '').trim(),
      landmark: val.landmark ? val.landmark.trim() : undefined,
      pincode: (val.pincode || '').trim(),
      doorDetails: {
        doorType: (val.requirement || 'Steel Door Installation').trim(),
        brand: (val.brand || 'Tata Pravesh').trim(),
        finish: 'Precision Alignment',
        dimensions: 'Site Clearance Survey',
        thickness: 'Standard Frame',
        quantity: Math.max(1, Number(val.quantity) || 1),
        isUrgent: false,
        notes: (val.requirement || '').trim(),
        images: this.uploadedImages()
      },
      performedBy: currentUser?.name || `${(val.clientName || '').trim()} (Customer)`,
      role: (currentUser?.role || 'client') as UserRole
    };

    this.dataService.createBooking(payload).subscribe({
      next: created => {
        this.isSubmitting.set(false);
        this.submittedBooking.set(created);
        this.toast.success(`Installation booking ${created.id} scheduled for ${created.districtName}!`);
      },
      error: err => {
        this.isSubmitting.set(false);
        this.toast.error(err?.error?.error || 'Failed to submit installation request. Please check inputs.');
      }
    });
  }

  resetForm(): void {
    this.submittedBooking.set(null);
    this.uploadedImages.set([]);
    this.bookingForm.reset({
      clientName: '',
      contactPhone: '',
      brand: 'Tata Pravesh',
      quantity: 1,
      requirement: '',
      districtId: 'dist-ekm',
      area: 'Kakkanad',
      streetAddress: '',
      landmark: '',
      pincode: '682030'
    });
    this.updateAreasForSelectedDistrict();
  }
}
