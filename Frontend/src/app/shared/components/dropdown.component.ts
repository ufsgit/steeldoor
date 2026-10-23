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
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: any;
  subtext?: string;
  icon?: string;
  disabled?: boolean;
  areas?: string[];
  [key: string]: any;
}

export interface InternalDropdownItem {
  raw: any;
  label: string;
  value: any;
  subtext?: string;
  matchedArea?: string;
  disabled?: boolean;
}

function tryInject<T>(token: any): T | null {
  try {
    return inject(token);
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-dropdown, app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" [class.pointer-events-none]="disabled">
      <!-- Top Optional Label -->
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
        type="button"
        [id]="id"
        (click)="toggleOpen()"
        (keydown)="onTriggerKeydown($event)"
        [disabled]="disabled"
        class="w-full flex items-center justify-between text-left bg-white border transition-all cursor-pointer select-none focus:outline-none"
        [ngClass]="[
          sizeClasses,
          isOpen ? 'border-[#0f9d58] ring-1 ring-[#0f9d58] shadow-sm' : 'border-gray-200 hover:border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-75' : 'text-gray-800',
          customClass
        ]"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="'listbox'"
      >
        <!-- Selected Label / Placeholder -->
        <div class="flex items-center gap-2 truncate pr-2 flex-1">
          @if (selectedDisplayItem) {
            <span class="truncate font-medium text-gray-900">
              {{ displayLabel(selectedDisplayItem) }}
            </span>
            @if (selectedDisplayItem.subtext) {
              <span class="text-[11px] text-gray-400 truncate hidden sm:inline">
                ({{ selectedDisplayItem.subtext }})
              </span>
            }
          } @else {
            <span class="text-gray-400 font-normal truncate">
              {{ placeholder }}
            </span>
          }
        </div>

        <!-- Right Icons: Clear & Chevron -->
        <div class="flex items-center gap-1.5 shrink-0 ml-1 text-gray-400">
          @if (clearable && value !== null && value !== undefined && value !== '' && !disabled) {
            <span
              role="button"
              tabindex="0"
              (click)="clear($event)"
              (keydown.enter)="clear($event)"
              (keydown.space)="clear($event)"
              class="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="Clear selection"
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
        </div>
      </button>

      <!-- Dropdown Floating Panel -->
      @if (isOpen) {
        <div
          class="absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fadeIn min-w-[220px]"
          [ngClass]="[
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            panelClass
          ]"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input -->
          @if (searchable) {
            <div class="p-2 border-b border-gray-100 bg-gray-50/70 relative">
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
                  (input)="onSearchInput()"
                  (keydown)="onListKeydown($event)"
                  [placeholder]="searchPlaceholder"
                  class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0f9d58] focus:ring-1 focus:ring-[#0f9d58] text-gray-800 placeholder:text-gray-400"
                />
                @if (searchQuery) {
                  <button
                    type="button"
                    (click)="searchQuery = ''; onSearchInput()"
                    class="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                }
              </div>
            </div>
          }

          <!-- Items List -->
          <div
            #itemsList
            role="listbox"
            class="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50/50"
          >
            @for (item of filteredItems; track $index) {
              <div
                role="option"
                [attr.aria-selected]="isSelected(item)"
                (click)="selectItem(item)"
                (mouseenter)="highlightedIndex = $index"
                class="px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors select-none"
                [ngClass]="{
                  'bg-gray-100': highlightedIndex === $index && !isSelected(item),
                  'bg-[#0f9d58]/10 text-[#0f9d58] font-semibold': isSelected(item),
                  'text-gray-700': !isSelected(item),
                  'opacity-50 pointer-events-none': item.disabled
                }"
              >
                <div class="flex flex-col gap-0.5 truncate pr-2">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="truncate">{{ displayLabel(item) }}</span>
                    @if (item.subtext) {
                      <span class="text-[10px] text-gray-400 font-normal">({{ item.subtext }})</span>
                    }
                  </div>
                  @if (item.matchedArea) {
                    <span class="text-[10px] text-[#0f9d58] font-normal flex items-center gap-1">
                      <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Area: <strong class="font-semibold">{{ item.matchedArea }}</strong>
                    </span>
                  }
                </div>

                @if (isSelected(item)) {
                  <svg class="w-4 h-4 text-[#0f9d58] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                }
              </div>
            } @empty {
              <div class="py-6 px-4 text-center text-xs text-gray-500">
                <svg class="w-6 h-6 mx-auto mb-1.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p class="font-medium text-gray-700">{{ emptyMessage }}</p>
                @if (searchQuery) {
                  <p class="text-[11px] text-gray-400 mt-0.5">No match for "{{ searchQuery }}"</p>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DropdownComponent implements ControlValueAccessor {
  private elementRef: ElementRef;
  private cdr: ChangeDetectorRef;

  constructor(elementRef?: ElementRef, cdr?: ChangeDetectorRef) {
    const dummyElement =
      typeof document !== 'undefined'
        ? document.createElement('div')
        : { contains: () => false, getBoundingClientRect: () => ({ top: 0, bottom: 0 }) };
    this.elementRef = elementRef ?? tryInject(ElementRef) ?? new ElementRef(dummyElement);
    this.cdr = cdr ?? tryInject(ChangeDetectorRef) ?? ({ markForCheck: () => {} } as ChangeDetectorRef);
  }

  @Input() id = `dropdown-${Math.random().toString(36).substring(2, 9)}`;
  @Input() name = '';
  @Input() label = '';
  @Input() required = false;
  @Input() options: any[] = [];
  @Input() bindLabel = 'label';
  @Input() bindValue = 'value';
  @Input() bindSubtext = 'subtext';
  @Input() placeholder = 'Select an option';
  @Input() searchPlaceholder = 'Search...';
  @Input() searchable = true;
  @Input() clearable = false;
  @Input() disabled = false;
  @Input() suffix = '';
  @Input() prefix = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() customClass = '';
  @Input() panelClass = '';
  @Input() emptyMessage = 'No results found';

  @Output() selectionChange = new EventEmitter<any>();
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('itemsList') itemsListElement?: ElementRef<HTMLDivElement>;

  isOpen = false;
  openUpward = false;
  searchQuery = '';
  highlightedIndex = -1;
  value: any = null;

  // ControlValueAccessor callbacks
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  get sizeClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'h-[36px] px-3 text-[13px] rounded-md';
      case 'lg':
        return 'py-2.5 px-3.5 text-sm rounded-xl min-h-[44px]';
      case 'md':
      default:
        return 'py-2 px-3 text-xs rounded-lg min-h-[38px]';
    }
  }

  get normalizedItems(): InternalDropdownItem[] {
    if (!this.options || !Array.isArray(this.options)) return [];

    return this.options.map(opt => {
      if (opt === null || opt === undefined) {
        return { raw: opt, label: '', value: opt };
      }

      if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
        return {
          raw: opt,
          label: String(opt),
          value: opt
        };
      }

      // It is an object
      const label =
        opt[this.bindLabel] !== undefined
          ? String(opt[this.bindLabel])
          : opt.label ?? opt.name ?? opt.title ?? String(opt);

      const value =
        this.bindValue && opt[this.bindValue] !== undefined
          ? opt[this.bindValue]
          : opt.value !== undefined
          ? opt.value
          : opt.id !== undefined
          ? opt.id
          : opt;

      const subtext =
        opt[this.bindSubtext] !== undefined
          ? String(opt[this.bindSubtext])
          : opt.subtext ?? (opt.code ? opt.code : undefined);

      return {
        raw: opt,
        label,
        value,
        subtext,
        disabled: !!opt.disabled
      };
    });
  }

  get filteredItems(): InternalDropdownItem[] {
    const items = this.normalizedItems;
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      return items;
    }

    const results: InternalDropdownItem[] = [];
    for (const item of items) {
      let matched = false;
      let matchedArea: string | undefined;

      const labelMatch = item.label.toLowerCase().includes(q);
      const subtextMatch = item.subtext ? item.subtext.toLowerCase().includes(q) : false;
      const valueMatch = typeof item.value === 'string' ? item.value.toLowerCase().includes(q) : false;

      if (labelMatch || subtextMatch || valueMatch) {
        matched = true;
      }

      // Check if option is a District object with an 'areas' array
      if (!matched && item.raw && Array.isArray(item.raw.areas)) {
        const areaHit = item.raw.areas.find((a: string) => a.toLowerCase().includes(q));
        if (areaHit) {
          matched = true;
          matchedArea = areaHit;
        }
      }

      // Also check code if available on raw
      if (!matched && item.raw && item.raw.code && typeof item.raw.code === 'string') {
        if (item.raw.code.toLowerCase().includes(q)) {
          matched = true;
        }
      }

      if (matched) {
        results.push({
          ...item,
          matchedArea
        });
      }
    }

    return results;
  }

  get selectedDisplayItem(): InternalDropdownItem | null {
    if (this.value === null || this.value === undefined || this.value === '') {
      return null;
    }
    const match = this.normalizedItems.find(item => this.areValuesEqual(item.value, this.value));
    if (match) return match;

    // Fallback if current value is not in options list
    return {
      raw: this.value,
      label: String(this.value),
      value: this.value
    };
  }

  displayLabel(item: InternalDropdownItem): string {
    const pref = this.prefix ? `${this.prefix} ` : '';
    const suff = this.suffix ? ` ${this.suffix}` : '';
    return `${pref}${item.label}${suff}`;
  }

  isSelected(item: InternalDropdownItem): boolean {
    return this.areValuesEqual(item.value, this.value);
  }

  private areValuesEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    return String(a).toLowerCase() === String(b).toLowerCase();
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
    if (this.disabled || this.isOpen) return;

    // Determine if popup should open upward based on screen clearance
    const winHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const rect = this.elementRef.nativeElement?.getBoundingClientRect
      ? this.elementRef.nativeElement.getBoundingClientRect()
      : { top: 0, bottom: 0 };
    const spaceBelow = winHeight - rect.bottom;
    this.openUpward = spaceBelow < 260 && rect.top > 260;

    this.isOpen = true;
    this.searchQuery = '';
    this.highlightedIndex = this.filteredItems.findIndex(i => this.isSelected(i));
    this.opened.emit();
    this.cdr.markForCheck();

    // Focus search input after panel renders
    if (this.searchable) {
      setTimeout(() => {
        this.searchInputElement?.nativeElement.focus();
      }, 30);
    }
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.searchQuery = '';
    this.highlightedIndex = -1;
    this.onTouched();
    this.closed.emit();
    this.cdr.markForCheck();
  }

  selectItem(item: InternalDropdownItem): void {
    if (item.disabled) return;
    this.value = item.value;
    this.onChange(item.value);
    this.onTouched();
    this.selectionChange.emit(item.value);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.value = '';
    this.onChange('');
    this.onTouched();
    this.selectionChange.emit('');
    this.cdr.markForCheck();
  }

  onSearchInput(): void {
    this.searchChange.emit(this.searchQuery);
    this.highlightedIndex = this.filteredItems.length > 0 ? 0 : -1;
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    } else if (event.key === 'Escape') {
      this.close();
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const items = this.filteredItems;
    if (items.length === 0) {
      if (event.key === 'Escape') {
        this.close();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex + 1) % items.length;
      this.scrollHighlightedIntoView();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedIndex = (this.highlightedIndex - 1 + items.length) % items.length;
      this.scrollHighlightedIntoView();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.highlightedIndex >= 0 && this.highlightedIndex < items.length) {
        this.selectItem(items[this.highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Tab') {
      this.close();
    }
  }

  private scrollHighlightedIntoView(): void {
    if (!this.itemsListElement) return;
    const container = this.itemsListElement.nativeElement;
    const elements = container.querySelectorAll('[role="option"]');
    if (elements && elements[this.highlightedIndex]) {
      (elements[this.highlightedIndex] as HTMLElement).scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  // ControlValueAccessor methods
  writeValue(obj: any): void {
    this.value = obj;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
