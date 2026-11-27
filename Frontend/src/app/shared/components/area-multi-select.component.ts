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
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AreaItem, PaginatedAreasResponse } from '../../core/models';

@Component({
  selector: 'app-area-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AreaMultiSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full" [class.pointer-events-none]="disabled">
      <!-- Optional Label -->
      @if (label) {
        <label [for]="id" class="block font-medium text-gray-700 mb-1 text-xs">
          {{ label }}
          @if (required) {
            <span class="text-red-500">*</span>
          }
        </label>
      }

      <!-- Trigger Box / Button -->
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
        <!-- Selected Items Chips or Placeholder -->
        <div class="flex items-center gap-1.5 flex-wrap truncate pr-2 flex-1">
          @if (selectedAreas.length > 0) {
            <div class="flex items-center flex-wrap gap-1.5 py-0.5 max-h-24 overflow-y-auto">
              @for (area of selectedAreas; track area.id) {
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-red-50 text-[#c5161b] border border-red-200 max-w-full"
                  (click)="$event.stopPropagation()"
                >
                  <span class="max-w-[150px] sm:max-w-[190px] truncate">
                    {{ area.name }}@if (area.district_name) {<span class="text-[10px] font-normal text-red-700/80"> · {{ area.district_name }}</span>}
                  </span>
                  @if (!disabled) {
                    <button
                      type="button"
                      (click)="removeArea(area, $event)"
                      class="text-[#c5161b] hover:text-red-700 rounded p-0.5 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Remove area"
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

        <!-- Right Side Icons -->
        <div class="flex items-center gap-1.5 shrink-0 ml-1 text-gray-400">
          @if (isLoading || isLoadingPage) {
            <span class="inline-block w-3.5 h-3.5 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
          } @else {
            @if (clearable && selectedAreas.length > 0 && !disabled) {
              <span
                role="button"
                tabindex="0"
                (click)="clearAll($event)"
                class="p-0.5 rounded-full hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                title="Clear all selected areas"
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
          class="absolute left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[260px] flex flex-col"
          [style.max-height.px]="panelMaxHeight"
          [ngClass]="[
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
            panelClass
          ]"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input (Area Name, Pincode, or District Name) -->
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
                (ngModelChange)="onSearchInput($event)"
                [placeholder]="searchPlaceholder"
                class="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#ea1f25] focus:ring-1 focus:ring-[#ea1f25] text-gray-800 placeholder:text-gray-400"
              />
              @if (isSearching) {
                <span class="absolute right-2.5 inline-block w-3.5 h-3.5 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
              } @else if (searchQuery) {
                <button
                  type="button"
                  (click)="clearSearch()"
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

          <!-- Select All / Deselect All Toolbar with Counts -->
          @if (displayedAreas.length > 0) {
            <div class="px-3 py-1.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 select-none shrink-0">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="selectAll()"
                  class="font-semibold text-[#ea1f25] hover:text-[#c5161b] cursor-pointer hover:underline"
                >
                  Select Page
                </button>
                <span class="text-gray-300">|</span>
                <button
                  type="button"
                  (click)="deselectAll()"
                  class="font-semibold text-gray-500 hover:text-gray-700 cursor-pointer hover:underline"
                >
                  Deselect Page
                </button>
              </div>
              <div class="flex items-center gap-2 text-[10px]">
                <span class="text-emerald-700 font-semibold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-[#0f9d58]"></span>
                  {{ availableCount }} Available
                </span>
                @if (assignedCount > 0) {
                  <span class="text-gray-300">·</span>
                  <span class="text-red-600 font-semibold flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {{ assignedCount }} Assigned
                  </span>
                }
              </div>
            </div>
          }

          <!-- Scrollable Area Items List with Checkboxes -->
          <div
            #scrollContainer
            role="listbox"
            class="flex-1 min-h-0 overflow-y-auto py-1 divide-y divide-gray-100"
          >
            @if (isLoadingPage && displayedAreas.length === 0) {
              <div class="py-8 px-4 text-center text-xs text-gray-500">
                <div class="flex items-center justify-center gap-2 text-[#ea1f25]">
                  <span class="inline-block w-4 h-4 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
                  <span>Loading areas...</span>
                </div>
              </div>
            } @else {
              @for (area of displayedAreas; track area.id) {
                @if (isAreaAssignedToOther(area)) {
                  <!-- RED: Areas already assigned to another user (Disabled & cannot be selected) -->
                  <div
                    role="option"
                    [attr.aria-disabled]="true"
                    class="px-3 py-2 text-xs flex items-center justify-between gap-2 select-none cursor-not-allowed bg-red-50/70 border-l-2 border-red-500 transition-colors"
                    [title]="'Already assigned to ' + (area.assignedUserName || 'another user') + ' and cannot be selected'"
                  >
                    <!-- Red Disabled Indicator + Name + Pincode + District -->
                    <div class="flex items-center gap-2 truncate pr-2 min-w-0">
                      <div
                        class="w-4 h-4 rounded border border-red-300 bg-red-100 flex items-center justify-center shrink-0 text-red-500"
                      >
                        <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                        </svg>
                      </div>
                      <span class="truncate font-medium text-red-700 line-through decoration-red-300">{{ area.name }}</span>
                      @if (area.pincode) {
                        <span class="text-[10px] text-red-400 font-normal shrink-0">({{ area.pincode }})</span>
                      }
                      @if (showDistrictBadge && area.district_name) {
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-red-100/80 text-red-600 font-medium shrink-0">
                          {{ area.district_name }}
                        </span>
                      }
                    </div>

                    <!-- Red Status Badge -->
                    <span class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>Already Assigned{{ area.assignedUserName ? ' (' + area.assignedUserName + ')' : '' }}</span>
                    </span>
                  </div>
                } @else {
                  <!-- GREEN: Available areas (Selectable) -->
                  <div
                    role="option"
                    [attr.aria-selected]="isSelected(area.id)"
                    (click)="toggleArea(area)"
                    class="px-3 py-2 text-xs cursor-pointer flex items-center justify-between gap-2 transition-colors select-none hover:bg-red-50/40"
                    [ngClass]="{
                      'bg-[#ea1f25]/10 text-[#ea1f25] font-semibold border-l-2 border-[#ea1f25]': isSelected(area.id),
                      'text-gray-700 hover:text-gray-900': !isSelected(area.id)
                    }"
                  >
                    <!-- Checkbox + Name + Pincode + District -->
                    <div class="flex items-center gap-2 truncate pr-2 min-w-0">
                      <div
                        class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors"
                        [ngClass]="isSelected(area.id) ? 'bg-[#ea1f25] border-[#ea1f25] text-white' : 'border-emerald-500/80 bg-white hover:border-[#ea1f25]'"
                      >
                        @if (isSelected(area.id)) {
                          <svg class="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                          </svg>
                        }
                      </div>
                      <span class="truncate">{{ area.name }}</span>
                      @if (area.pincode) {
                        <span class="text-[10px] text-gray-400 font-normal shrink-0">({{ area.pincode }})</span>
                      }
                      @if (showDistrictBadge && area.district_name) {
                        <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80 font-medium shrink-0">
                          {{ area.district_name }}
                        </span>
                      }
                    </div>

                    <!-- Green Status Badge -->
                    <span
                      class="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors flex items-center gap-1"
                      [ngClass]="isSelected(area.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-emerald-50 text-[#0f9d58] border border-emerald-200/80'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-[#0f9d58]"></span>
                      <span>Available</span>
                    </span>
                  </div>
                }
              } @empty {
                <div class="py-6 px-4 text-center text-xs text-gray-500">
                  @if (isLoading || isLoadingPage) {
                    <div class="flex items-center justify-center gap-2 text-[#ea1f25]">
                      <span class="inline-block w-4 h-4 border-2 border-[#ea1f25] border-t-transparent rounded-full animate-spin"></span>
                      <span>Loading areas...</span>
                    </div>
                  } @else {
                    <p class="font-medium text-gray-700">{{ emptyMessage }}</p>
                    @if (searchQuery) {
                      <p class="text-[11px] text-gray-400 mt-0.5">No areas match "{{ searchQuery }}"</p>
                    }
                  }
                </div>
              }
            }
          </div>

          <!-- Pagination Footer Bar (shown when server-side pagination is active) -->
          @if (fetchFn && totalRecords > 0) {
            <div class="px-3 py-1.5 bg-white border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 select-none shrink-0">
              <span>
                Showing <strong class="text-gray-800">{{ getStartIndex() }}–{{ getEndIndex() }}</strong> of
                <strong class="text-gray-800">{{ totalRecords }}</strong> areas
              </span>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  (click)="prevPage()"
                  [disabled]="currentPage <= 1 || isLoadingPage"
                  class="px-2 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors"
                >
                  Previous
                </button>
                <span class="px-1.5 font-semibold text-gray-700 tabular-nums">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                  type="button"
                  (click)="nextPage()"
                  [disabled]="currentPage >= totalPages || isLoadingPage"
                  class="px-2 py-0.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-semibold transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          }

          <!-- Bottom Summary Bar with Done Button -->
          @if (displayedAreas.length > 0 || selectedAreas.length > 0 || fetchFn) {
            <div class="px-3 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 select-none shrink-0">
              <span class="font-medium text-gray-600">
                {{ selectedAreas.length }} {{ selectedAreas.length === 1 ? 'area' : 'areas' }} selected
              </span>
              <button
                type="button"
                (click)="close()"
                class="px-3 py-1 rounded-lg bg-[#ea1f25] hover:bg-[#c5161b] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class AreaMultiSelectComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  @Input() id = `area-select-${Math.random().toString(36).substring(2, 9)}`;
  @Input() label?: string;
  @Input() placeholder = 'Select Area(s)...';
  @Input() searchPlaceholder = 'Search area, pincode, or district...';
  @Input() emptyMessage = 'No areas found';
  @Input() disabled = false;
  @Input() required = false;
  @Input() clearable = true;
  @Input() showDistrictBadge = true;
  @Input() customClass = '';
  @Input() panelClass = '';
  @Input() pageSize = 20;

  /** Static list of areas (optional fallback when fetchFn is not provided) */
  @Input() areas: AreaItem[] = [];

  /** Server-side paginated loader: receives (search, page, pageSize) */
  @Input() fetchFn?: (search: string, page: number, pageSize: number) => Observable<PaginatedAreasResponse>;

  /** Preloaded selected area objects so chips render names across all pages immediately on edit */
  @Input() initialSelectedAreas: AreaItem[] = [];

  /** Loading state indicator */
  @Input() isLoading = false;

  /** Initial or bound selected area IDs */
  @Input() selectedIds: number[] = [];

  /** ID of the user currently being edited (so their own assigned areas remain selectable) */
  @Input() currentUserId?: number | string | null = null;

  /** Automatically load page 1 whenever fetchFn is updated (even before opening panel) */
  @Input() autoLoad = true;

  /** Emits the list of selected AreaItem objects */
  @Output() selectionChange = new EventEmitter<AreaItem[]>();

  /** Emits the list of selected area IDs (number[]) */
  @Output() selectedIdsChange = new EventEmitter<number[]>();

  @ViewChild('searchInput') searchInputElement?: ElementRef<HTMLInputElement>;
  @ViewChild('triggerBtn') triggerButtonElement?: ElementRef<HTMLButtonElement>;

  isOpen = false;
  openUpward = false;
  panelMaxHeight = 330;
  searchQuery = '';

  // Server pagination state
  pagedAreas: AreaItem[] = [];
  currentPage = 1;
  totalPages = 1;
  totalRecords = 0;
  isLoadingPage = false;
  isSearching = false;
  private hasLoadedCurrentFilter = false;

  // Internal cache & selection
  private knownAreasMap = new Map<number, AreaItem>();
  selectedAreaIds: number[] = [];
  selectedAreas: AreaItem[] = [];

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private activeRequest$?: Subscription;

  private onChange: (val: number[]) => void = () => {};
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
        if (this.fetchFn) {
          this.loadPage(1, query, true);
        } else {
          this.isSearching = false;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.activeRequest$?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialSelectedAreas'] && Array.isArray(this.initialSelectedAreas)) {
      this.cacheAreas(this.initialSelectedAreas);
      this.syncSelection();
    }
    if (changes['areas']) {
      this.cacheAreas(this.areas || []);
      this.syncSelection();
    }
    if (changes['selectedIds'] && this.selectedIds) {
      this.selectedAreaIds = this.selectedIds.map(Number).filter(id => !isNaN(id));
      this.syncSelection();
    }
    if (changes['fetchFn']) {
      this.resetPagedState();
      if (this.fetchFn && (this.isOpen || this.autoLoad)) {
        this.loadPage(1);
      }
    }
  }

  get filteredAreas(): AreaItem[] {
    const list = this.areas || [];
    if (!this.searchQuery.trim()) return list;
    const q = this.searchQuery.trim().toLowerCase();
    return list.filter(a => {
      const nameMatch = a.name && a.name.toLowerCase().includes(q);
      const pinMatch = a.pincode && a.pincode.toLowerCase().includes(q);
      const distMatch = a.district_name && a.district_name.toLowerCase().includes(q);
      return nameMatch || pinMatch || distMatch;
    });
  }

  get displayedAreas(): AreaItem[] {
    return this.fetchFn ? this.pagedAreas : this.filteredAreas;
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

    if (this.fetchFn && !this.hasLoadedCurrentFilter && !this.isLoadingPage) {
      this.loadPage(1, this.searchQuery);
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
    if (this.fetchFn) {
      this.isSearching = true;
      this.searchSubject.next((val || '').trim());
      this.cdr.markForCheck();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    if (this.fetchFn) {
      this.isSearching = false;
      this.loadPage(1, '');
    } else {
      this.cdr.markForCheck();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1 && !this.isLoadingPage && this.fetchFn) {
      this.loadPage(this.currentPage - 1, this.searchQuery);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages && !this.isLoadingPage && this.fetchFn) {
      this.loadPage(this.currentPage + 1, this.searchQuery);
    }
  }

  getStartIndex(): number {
    if (this.totalRecords === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalRecords);
  }

  private resetPagedState(): void {
    this.activeRequest$?.unsubscribe();
    this.pagedAreas = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.searchQuery = '';
    this.isLoadingPage = false;
    this.isSearching = false;
    this.hasLoadedCurrentFilter = false;
  }

  private loadPage(page: number, search: string = this.searchQuery, fromSearch: boolean = false): void {
    if (!this.fetchFn) return;

    this.activeRequest$?.unsubscribe();
    this.isLoadingPage = true;
    if (fromSearch) {
      this.isSearching = true;
    }
    this.cdr.markForCheck();

    this.activeRequest$ = this.fetchFn(search.trim(), page, this.pageSize).subscribe({
      next: (res) => {
        const rows = res?.data || [];
        this.cacheAreas(rows);
        this.pagedAreas = rows;
        this.currentPage = Number(res?.pagination?.page ?? page);
        this.totalRecords = Number(res?.pagination?.total ?? rows.length);
        this.totalPages = Number(res?.pagination?.totalPages ?? Math.max(1, Math.ceil(this.totalRecords / this.pageSize)));
        this.isLoadingPage = false;
        this.isSearching = false;
        this.hasLoadedCurrentFilter = true;
        this.syncSelection();
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingPage = false;
        this.isSearching = false;
        this.cdr.markForCheck();
      }
    });
  }

  private cacheAreas(items: AreaItem[]): void {
    for (const item of items) {
      if (item && item.id !== undefined && item.id !== null) {
        this.knownAreasMap.set(Number(item.id), item);
      }
    }
  }

  isAreaAssignedToOther(area: AreaItem): boolean {
    if (!area) return false;
    if (area.isAssignedToOther !== undefined) {
      return Boolean(area.isAssignedToOther);
    }
    if (!area.isAssigned) return false;
    if (this.currentUserId !== null && this.currentUserId !== undefined && this.currentUserId !== '') {
      return Number(area.assignedUserId) !== Number(this.currentUserId);
    }
    return true;
  }

  get availableCount(): number {
    return this.displayedAreas.filter(a => !this.isAreaAssignedToOther(a)).length;
  }

  get assignedCount(): number {
    return this.displayedAreas.filter(a => this.isAreaAssignedToOther(a)).length;
  }

  isSelected(areaId: number | string): boolean {
    const id = Number(areaId);
    return this.selectedAreaIds.includes(id);
  }

  toggleArea(area: AreaItem): void {
    if (this.disabled || this.isAreaAssignedToOther(area)) return;
    this.cacheAreas([area]);
    const id = Number(area.id);
    const idx = this.selectedAreaIds.indexOf(id);
    if (idx > -1) {
      this.selectedAreaIds.splice(idx, 1);
    } else {
      this.selectedAreaIds.push(id);
    }
    this.syncSelection();
    this.emitChanges();
  }

  removeArea(area: AreaItem, event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.disabled) return;
    const id = Number(area.id);
    this.selectedAreaIds = this.selectedAreaIds.filter(i => i !== id);
    this.syncSelection();
    this.emitChanges();
  }

  clearAll(event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedAreaIds = [];
    this.selectedAreas = [];
    this.emitChanges();
    this.cdr.markForCheck();
  }

  selectAll(): void {
    if (this.disabled) return;
    const currentList = this.displayedAreas;
    this.cacheAreas(currentList);
    for (const a of currentList) {
      if (this.isAreaAssignedToOther(a)) continue;
      const id = Number(a.id);
      if (!this.selectedAreaIds.includes(id)) {
        this.selectedAreaIds.push(id);
      }
    }
    this.syncSelection();
    this.emitChanges();
  }

  deselectAll(): void {
    const currentIds = new Set(this.displayedAreas.map(a => Number(a.id)));
    this.selectedAreaIds = this.selectedAreaIds.filter(id => !currentIds.has(id));
    this.syncSelection();
    this.emitChanges();
  }

  private syncSelection(): void {
    this.selectedAreas = this.selectedAreaIds.map(id => {
      const existing = this.selectedAreas.find(a => Number(a.id) === id);
      return this.knownAreasMap.get(id) || existing || { id, name: `Area #${id}`, district_id: 0 };
    });
    this.cdr.markForCheck();
  }

  private emitChanges(): void {
    this.onChange(this.selectedAreaIds);
    this.selectionChange.emit(this.selectedAreas);
    this.selectedIdsChange.emit(this.selectedAreaIds);
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

  // ControlValueAccessor
  writeValue(val: any): void {
    if (Array.isArray(val)) {
      this.selectedAreaIds = val.map(Number).filter(id => !isNaN(id));
    } else if (val !== null && val !== undefined && val !== '') {
      this.selectedAreaIds = [Number(val)].filter(id => !isNaN(id));
    } else {
      this.selectedAreaIds = [];
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
