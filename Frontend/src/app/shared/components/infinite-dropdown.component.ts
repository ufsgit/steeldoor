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
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { Subject, Subscription, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface InfiniteDropdownOption {
  label: string;
  value: any;
  subtext?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-infinite-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InfiniteDropdownComponent),
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
        [disabled]="disabled"
        class="w-full flex items-center justify-between text-left bg-white border rounded-xl px-3.5 py-2.5 text-xs transition-all cursor-pointer select-none focus:outline-none"
        [ngClass]="[
          isOpen ? 'border-[#0f9d58] ring-1 ring-[#0f9d58] shadow-sm' : 'border-gray-200 hover:border-gray-300',
          disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-75' : 'text-gray-800',
          customClass
        ]"
        [attr.aria-expanded]="isOpen"
        [attr.aria-haspopup]="'listbox'"
      >
        <div class="flex items-center gap-2 truncate pr-2 flex-1">
          @if (selectedItem) {
            <span class="truncate font-medium text-gray-900">{{ selectedItem.label }}</span>
            @if (selectedItem.subtext) {
              <span class="text-[11px] text-gray-400 truncate hidden sm:inline">({{ selectedItem.subtext }})</span>
            }
          } @else {
            <span class="text-gray-400 font-normal truncate">{{ placeholder }}</span>
          }
        </div>

        <!-- Right icons: loading / clear / chevron -->
        <div class="flex items-center gap-1.5 shrink-0 ml-1 text-gray-400">
          @if (isLoadingInitial) {
            <span class="inline-block w-3.5 h-3.5 border-2 border-[#0f9d58] border-t-transparent rounded-full animate-spin"></span>
          } @else {
            @if (clearable && value !== null && value !== undefined && value !== '' && !disabled) {
              <span
                role="button"
                tabindex="0"
                (click)="clear($event)"
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
          }
        </div>
      </button>

      <!-- Dropdown Floating Panel -->
      @if (isOpen) {
        <div
          class="absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[220px]"
          [ngClass]="[
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            panelClass
          ]"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input (Always First Option) -->
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
                (input)="onSearchInput(searchQuery)"
                [placeholder]="searchPlaceholder"
                class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#0f9d58] focus:ring-1 focus:ring-[#0f9d58] text-gray-800 placeholder:text-gray-400"
              />
              @if (isSearching) {
                <span class="absolute right-2.5 inline-block w-3.5 h-3.5 border-2 border-[#0f9d58] border-t-transparent rounded-full animate-spin"></span>
              } @else if (searchQuery) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          </div>

          <!-- Items Scrollable List -->
          <div
            #scrollContainer
            role="listbox"
            (scroll)="onScroll($event)"
            class="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50/50"
          >
            @for (item of items; track item.value) {
              <div
                role="option"
                [attr.aria-selected]="isSelected(item)"
                (click)="selectItem(item)"
                class="px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors select-none hover:bg-gray-100"
                [ngClass]="{
                  'bg-[#0f9d58]/10 text-[#0f9d58] font-semibold': isSelected(item),
                  'text-gray-700': !isSelected(item)
                }"
              >
                <div class="flex flex-col gap-0.5 truncate pr-2">
                  <div class="flex items-center gap-1.5 truncate">
                    <span class="truncate">{{ item.label }}</span>
                    @if (item.subtext) {
                      <span class="text-[10px] text-gray-400 font-normal">({{ item.subtext }})</span>
                    }
                  </div>
                </div>

                @if (isSelected(item)) {
                  <svg class="w-4 h-4 text-[#0f9d58] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                }
              </div>
            } @empty {
              @if (!isLoadingInitial && !isSearching) {
                <div class="py-6 px-4 text-center text-xs text-gray-500">
                  <p class="font-medium text-gray-700">{{ emptyMessage }}</p>
                  @if (searchQuery) {
                    <p class="text-[11px] text-gray-400 mt-0.5">No match found for "{{ searchQuery }}"</p>
                  }
                </div>
              }
            }

            <!-- Bottom Spinner for Next Page API Call -->
            @if (isLoadingMore) {
              <div class="py-2.5 px-3 flex items-center justify-center gap-2 text-xs text-[#0f9d58] bg-gray-50/50 border-t border-gray-100">
                <span class="inline-block w-3.5 h-3.5 border-2 border-[#0f9d58] border-t-transparent rounded-full animate-spin"></span>
                <span class="font-medium">Loading more...</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class InfiniteDropdownComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  @Input() id = `inf-dropdown-${Math.random().toString(36).substring(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = 'Select an option...';
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No options available';
  @Input() disabled = false;
  @Input() required = false;
  @Input() clearable = true;
  @Input() customClass = '';
  @Input() panelClass = '';
  @Input() pageSize = 20;

  /**
   * The fetch function provided by parent.
   * Receives (search: string, page: number, pageSize: number)
   * Must return Observable<InfiniteDropdownOption[]>
   */
  @Input() fetchFn?: (search: string, page: number, pageSize: number) => Observable<InfiniteDropdownOption[]>;

  /**
   * Optional preselected item when value is set externally before list is loaded
   */
  @Input() initialSelectedItem?: InfiniteDropdownOption | null;

  @Output() selectionChange = new EventEmitter<any>();

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('scrollContainer') scrollContainerElement?: ElementRef<HTMLDivElement>;

  isOpen = false;
  openUpward = false;
  value: any = null;
  selectedItem: InfiniteDropdownOption | null = null;

  searchQuery = '';
  items: InfiniteDropdownOption[] = [];
  currentPage = 1;
  hasMore = true;

  isLoadingInitial = false;
  isSearching = false;
  isLoadingMore = false;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSelectedItem'] && this.initialSelectedItem) {
      this.selectedItem = this.initialSelectedItem;
      if (this.value === null || this.value === undefined) {
        this.value = this.initialSelectedItem.value;
      }
    }
    if (changes['fetchFn'] && !changes['fetchFn'].firstChange) {
      this.resetAndReload();
    }
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
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

    if (this.items.length === 0) {
      this.loadPage(1, true);
    }

    setTimeout(() => {
      this.searchInputElement?.nativeElement.focus();
    }, 50);
  }

  close(): void {
    this.isOpen = false;
    this.onTouched();
    this.cdr.markForCheck();
  }

  onSearchInput(val: string): void {
    this.isSearching = true;
    this.searchSubject.next(val.trim());
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.isSearching = false;
    this.performSearch('');
  }

  private performSearch(query: string): void {
    this.currentPage = 1;
    this.hasMore = true;
    this.loadPage(1, false, query);
  }

  resetAndReload(): void {
    this.items = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.searchQuery = '';
    if (this.isOpen) {
      this.loadPage(1, true);
    }
  }

  private loadPage(page: number, isInitial: boolean = false, search: string = this.searchQuery): void {
    if (!this.fetchFn) return;

    if (page === 1) {
      if (isInitial) this.isLoadingInitial = true;
      else this.isSearching = true;
    } else {
      this.isLoadingMore = true;
    }
    this.cdr.markForCheck();

    this.fetchFn(search, page, this.pageSize).subscribe({
      next: (data) => {
        const fetched = data || [];
        if (page === 1) {
          this.items = [...fetched];
        } else {
          // Prevent duplicates
          const existingIds = new Set(this.items.map(i => i.value));
          const newItems = fetched.filter(i => !existingIds.has(i.value));
          this.items = [...this.items, ...newItems];
        }

        this.currentPage = page;
        this.hasMore = fetched.length >= this.pageSize;

        // Keep selected label in sync if item present in loaded list
        if (this.value !== null && this.value !== undefined) {
          const match = this.items.find(i => String(i.value) === String(this.value));
          if (match) {
            this.selectedItem = match;
          }
        }

        this.isLoadingInitial = false;
        this.isSearching = false;
        this.isLoadingMore = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error in InfiniteDropdown loadPage:', err);
        if (page === 1) this.items = [];
        this.isLoadingInitial = false;
        this.isSearching = false;
        this.isLoadingMore = false;
        this.cdr.markForCheck();
      }
    });
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target || this.isLoadingMore || this.isLoadingInitial || this.isSearching || !this.hasMore) {
      return;
    }

    const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    // Trigger next page when within 40px of bottom
    if (scrollBottom < 40) {
      this.loadPage(this.currentPage + 1, false, this.searchQuery);
    }
  }

  selectItem(item: InfiniteDropdownOption): void {
    this.value = item.value;
    this.selectedItem = item;
    this.onChange(this.value);
    this.selectionChange.emit(item);
    this.close();
  }

  clear(event?: MouseEvent): void {
    event?.stopPropagation();
    this.value = null;
    this.selectedItem = null;
    this.onChange(null);
    this.selectionChange.emit(null);
    this.cdr.markForCheck();
  }

  isSelected(item: InfiniteDropdownOption): boolean {
    if (this.value === null || this.value === undefined) return false;
    return String(item.value) === String(this.value);
  }

  private calculatePlacement(): void {
    if (typeof window === 'undefined') return;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    this.openUpward = spaceBelow < 280 && rect.top > 280;
  }

  // ControlValueAccessor
  writeValue(val: any): void {
    this.value = val;
    if (val === null || val === undefined || val === '') {
      this.selectedItem = null;
    } else if (this.items.length > 0) {
      this.selectedItem = this.items.find(i => String(i.value) === String(val)) || null;
    }
    this.cdr.markForCheck();
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

