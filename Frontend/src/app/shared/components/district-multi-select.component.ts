import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  ElementRef,
  HostListener,
  ViewChild,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { District } from '../../core/models';

@Component({
  selector: 'app-district-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DistrictMultiSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" [class.pointer-events-none]="disabled">
      @if (label) {
        <label [for]="id" class="block font-medium text-gray-700 mb-1 text-xs">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <!-- Trigger Button -->
      <button
        #triggerBtn
        type="button"
        [id]="id"
        (click)="toggleOpen()"
        [disabled]="disabled"
        class="w-full min-h-[42px] flex items-center justify-between text-left bg-white border rounded-xl px-3.5 py-2 text-xs transition-all cursor-pointer select-none focus:outline-none"
        [ngClass]="[
          isOpen ? 'border-[#ea1f25] ring-1 ring-[#ea1f25] shadow-xs' : 'border-gray-200 hover:border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-75' : 'text-gray-800',
          customClass
        ]"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="'listbox'"
      >
        <div class="flex items-center gap-1.5 flex-wrap truncate pr-2 flex-1">
          @if (selectedDistricts.length > 0) {
            <div class="flex items-center flex-wrap gap-1.5 py-0.5 max-h-24 overflow-y-auto">
              @for (dist of selectedDistricts; track dist.id) {
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-red-50 text-[#c5161b] border border-red-200 max-w-full"
                  (click)="$event.stopPropagation()"
                >
                  <span class="max-w-[130px] truncate">{{ dist.name }}</span>
                  @if (!disabled) {
                    <button
                      type="button"
                      (click)="removeDistrict(dist, $event)"
                      class="text-[#c5161b] hover:text-red-700 rounded p-0.5 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Remove district"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  }
                </span>
              }
            </div>
          } @else {
            <span class="text-gray-400 font-normal truncate">{{ placeholder }}</span>
          }
        </div>

        <div class="flex items-center gap-1.5 shrink-0 ml-1 text-gray-400">
          @if (isLoading) {
            <span class="inline-block w-3.5 h-3.5 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
          } @else {
            @if (clearable && selectedDistricts.length > 0 && !disabled) {
              <span
                role="button"
                tabindex="0"
                (click)="clearAll($event)"
                class="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                title="Clear selected districts"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </span>
            }
            <svg
              class="w-4 h-4 transition-transform duration-200"
              [class.rotate-180]="isOpen"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          }
        </div>
      </button>

      <!-- Dropdown Floating Panel -->
      @if (isOpen) {
        <div
          class="absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[230px] flex flex-col"
          [style.max-height.px]="panelMaxHeight"
          [ngClass]="[
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            panelClass
          ]"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Box -->
          <div class="p-2 border-b border-gray-100 bg-gray-50/70 shrink-0">
            <div class="relative flex items-center">
              <svg
                class="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="cdr.markForCheck()"
                [placeholder]="searchPlaceholder"
                class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#ea1f25] focus:ring-1 focus:ring-[#ea1f25] text-gray-800 placeholder:text-gray-400"
              />
              @if (searchQuery) {
                <button
                  type="button"
                  (click)="searchQuery = ''; cdr.markForCheck()"
                  class="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Select All / Deselect Toolbar -->
          @if (filteredDistricts.length > 0) {
            <div class="px-3 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 select-none shrink-0">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="selectAllFiltered()"
                  class="font-semibold text-[#ea1f25] hover:text-[#c5161b] cursor-pointer hover:underline"
                >
                  Select All
                </button>
                <span class="text-gray-300">|</span>
                <button
                  type="button"
                  (click)="deselectAllFiltered()"
                  class="font-semibold text-gray-500 hover:text-gray-700 cursor-pointer hover:underline"
                >
                  Clear
                </button>
              </div>
              <span class="text-[10px] font-medium text-gray-500">{{ filteredDistricts.length }} total</span>
            </div>
          }

          <!-- Scrollable Checkbox List -->
          <div
            role="listbox"
            class="flex-1 min-h-0 overflow-y-auto py-1 divide-y divide-gray-100"
          >
            @for (dist of filteredDistricts; track dist.id) {
              <div
                role="option"
                [attr.aria-selected]="isSelected(dist.id)"
                (click)="toggleDistrict(dist)"
                class="px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors select-none hover:bg-red-50/40"
                [ngClass]="{
                  'bg-[#ea1f25]/10 text-[#ea1f25] font-semibold border-l-2 border-[#ea1f25]': isSelected(dist.id),
                  'text-gray-700 hover:text-gray-900': !isSelected(dist.id)
                }"
              >
                <div class="flex items-center gap-2 truncate min-w-0">
                  <div
                    class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                    [ngClass]="isSelected(dist.id) ? 'bg-[#ea1f25] border-[#ea1f25] text-white' : 'border-gray-300 bg-white hover:border-[#ea1f25]'"
                  >
                    @if (isSelected(dist.id)) {
                      <svg class="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    }
                  </div>
                  <span class="truncate">{{ dist.name }}</span>
                </div>
                @if (dist.code) {
                  <span class="text-[10px] text-gray-400 font-normal shrink-0">{{ dist.code }}</span>
                }
              </div>
            } @empty {
              <div class="py-6 px-4 text-center text-xs text-gray-500">
                @if (isLoading) {
                  <div class="flex items-center justify-center gap-2 text-[#ea1f25]">
                    <span class="inline-block w-4 h-4 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
                    <span>Loading districts...</span>
                  </div>
                } @else {
                  <p class="font-medium text-gray-700">{{ emptyMessage }}</p>
                }
              </div>
            }
          </div>

          <!-- Bottom Summary Footer -->
          <div class="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 select-none shrink-0">
            <span class="font-medium text-gray-600">
              {{ selectedDistricts.length }} {{ selectedDistricts.length === 1 ? 'district' : 'districts' }} selected
            </span>
            <button
              type="button"
              (click)="close()"
              class="px-3 py-1 rounded-lg bg-[#ea1f25] hover:bg-[#c5161b] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Done
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class DistrictMultiSelectComponent implements ControlValueAccessor, OnChanges {
  @Input() id = `district-select-${Math.random().toString(36).substring(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = 'Select District(s)...';
  @Input() searchPlaceholder = 'Search district...';
  @Input() emptyMessage = 'No districts found';
  @Input() disabled = false;
  @Input() required = false;
  @Input() clearable = true;
  @Input() customClass = '';
  @Input() panelClass = '';
  @Input() districts: District[] = [];
  @Input() isLoading = false;

  @Output() selectionChange = new EventEmitter<District[]>();
  @Output() selectedIdsChange = new EventEmitter<number[]>();

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('triggerBtn') triggerButtonElement?: ElementRef<HTMLButtonElement>;

  isOpen = false;
  openUpward = false;
  panelMaxHeight = 330;
  searchQuery = '';

  selectedDistrictIds: number[] = [];
  selectedDistricts: District[] = [];
  private districtsMap = new Map<number, District>();

  private onChange: (val: number[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private elementRef: ElementRef,
    public cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['districts']) {
      this.cacheDistricts(this.districts || []);
      this.syncSelection();
    }
  }

  get filteredDistricts(): District[] {
    const list = this.districts || [];
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter(d =>
      (d.name && d.name.toLowerCase().includes(q)) ||
      (d.code && d.code.toLowerCase().includes(q))
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen) {
      this.calculatePlacement();
      this.cdr.markForCheck();
    }
  }

  toggleOpen(): void {
    if (this.disabled) return;
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.calculatePlacement();
    this.isOpen = true;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.searchInputElement?.nativeElement.focus();
    }, 50);
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  isSelected(districtId: number | string): boolean {
    return this.selectedDistrictIds.includes(Number(districtId));
  }

  toggleDistrict(dist: District): void {
    if (this.disabled) return;
    this.cacheDistricts([dist]);
    const id = Number(dist.id);
    const idx = this.selectedDistrictIds.indexOf(id);
    if (idx > -1) {
      this.selectedDistrictIds = this.selectedDistrictIds.filter(i => i !== id);
    } else {
      this.selectedDistrictIds = [...this.selectedDistrictIds, id];
    }
    this.syncSelection();
    this.emitChanges();
  }

  removeDistrict(dist: District, event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.disabled) return;
    const id = Number(dist.id);
    this.selectedDistrictIds = this.selectedDistrictIds.filter(i => i !== id);
    this.syncSelection();
    this.emitChanges();
  }

  clearAll(event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedDistrictIds = [];
    this.selectedDistricts = [];
    this.emitChanges();
    this.cdr.markForCheck();
  }

  selectAllFiltered(): void {
    if (this.disabled) return;
    const list = this.filteredDistricts;
    this.cacheDistricts(list);
    const merged = new Set(this.selectedDistrictIds);
    for (const d of list) {
      merged.add(Number(d.id));
    }
    this.selectedDistrictIds = Array.from(merged);
    this.syncSelection();
    this.emitChanges();
  }

  deselectAllFiltered(): void {
    const filteredIds = new Set(this.filteredDistricts.map(d => Number(d.id)));
    this.selectedDistrictIds = this.selectedDistrictIds.filter(id => !filteredIds.has(id));
    this.syncSelection();
    this.emitChanges();
  }

  private cacheDistricts(items: District[]): void {
    for (const d of items) {
      if (d && d.id !== undefined && d.id !== null) {
        this.districtsMap.set(Number(d.id), d);
      }
    }
  }

  private syncSelection(): void {
    this.selectedDistricts = this.selectedDistrictIds.map(id => {
      const existing = this.selectedDistricts.find(d => Number(d.id) === id);
      return this.districtsMap.get(id) || existing || { id: String(id), name: `District #${id}`, code: '', areas: [] };
    });
    this.cdr.markForCheck();
  }

  private emitChanges(): void {
    this.onChange(this.selectedDistrictIds);
    this.selectionChange.emit(this.selectedDistricts);
    this.selectedIdsChange.emit(this.selectedDistrictIds);
    this.cdr.markForCheck();
    if (this.isOpen) {
      setTimeout(() => {
        this.calculatePlacement();
        this.cdr.markForCheck();
      }, 0);
    }
  }

  private calculatePlacement(): void {
    if (typeof window === 'undefined') return;
    const hostEl = this.triggerButtonElement?.nativeElement || this.elementRef.nativeElement;
    const rect = hostEl.getBoundingClientRect();
    const margin = 16;
    const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - margin);
    const spaceAbove = Math.max(0, rect.top - margin);

    if (spaceBelow < 210 && spaceAbove > spaceBelow) {
      this.openUpward = true;
      this.panelMaxHeight = Math.min(285, Math.max(175, Math.floor(spaceAbove)));
    } else {
      this.openUpward = false;
      this.panelMaxHeight = Math.min(285, Math.max(175, Math.floor(spaceBelow)));
    }
  }

  writeValue(val: any): void {
    if (Array.isArray(val)) {
      this.selectedDistrictIds = val.map(Number).filter(id => !isNaN(id) && id > 0);
    } else if (val !== null && val !== undefined && val !== '' && Number(val) > 0) {
      this.selectedDistrictIds = [Number(val)];
    } else {
      this.selectedDistrictIds = [];
    }
    this.syncSelection();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
