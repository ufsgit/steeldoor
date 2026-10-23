import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  forwardRef,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { DropdownComponent, DropdownOption } from './dropdown.component';
import { DataService } from '../../core/data.service';
import { District } from '../../core/models';

function tryInject<T>(token: any): T | null {
  try {
    return inject(token);
  } catch {
    return null;
  }
}

@Component({
  selector: 'app-district-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DistrictDropdownComponent),
      multi: true
    }
  ],
  template: `
    <app-dropdown
      [options]="formattedOptions"
      [ngModel]="value"
      (ngModelChange)="onValueChange($event)"
      [placeholder]="placeholder"
      [searchPlaceholder]="searchPlaceholder"
      [searchable]="true"
      [clearable]="clearable"
      [disabled]="disabled"
      [size]="size"
      [customClass]="customClass"
      [label]="label"
      [required]="required"
      [emptyMessage]="'No districts or areas found'"
    ></app-dropdown>
  `
})
export class DistrictDropdownComponent implements OnInit, ControlValueAccessor {
  private dataService: DataService | null;
  private cdr: ChangeDetectorRef;

  constructor(dataService?: DataService, cdr?: ChangeDetectorRef) {
    this.dataService = dataService ?? tryInject(DataService);
    this.cdr = cdr ?? tryInject(ChangeDetectorRef) ?? ({ markForCheck: () => {} } as ChangeDetectorRef);
  }

  @Input() districts: District[] = [];
  @Input() valueField: 'name' | 'id' = 'name';
  @Input() suffix = 'Hub';
  @Input() placeholder = 'Select District / Hub';
  @Input() searchPlaceholder = 'Search district or area...';
  @Input() showAllOption = false;
  @Input() allOptionLabel = 'All Districts Hubs';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() customClass = '';
  @Input() clearable = false;
  @Input() disabled = false;
  @Input() label = '';
  @Input() required = false;

  @Output() selectionChange = new EventEmitter<any>();
  @Output() districtChange = new EventEmitter<District | null>();

  value: any = null;
  loadedDistricts: District[] = [];

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if ((!this.districts || this.districts.length === 0) && this.dataService) {
      this.dataService.getDistricts().subscribe(dists => {
        this.loadedDistricts = dists;
        this.cdr.markForCheck();
      });
    }
  }

  get activeDistricts(): District[] {
    return this.districts && this.districts.length > 0
      ? this.districts
      : this.loadedDistricts;
  }

  get formattedOptions(): DropdownOption[] {
    const list: DropdownOption[] = [];

    if (this.showAllOption) {
      list.push({
        label: this.allOptionLabel,
        value: '',
        subtext: undefined
      });
    }

    const items = this.activeDistricts.map(d => {
      const label = this.suffix ? `${d.name} ${this.suffix}` : d.name;
      const value = this.valueField === 'id' ? d.id : d.name;
      return {
        label,
        value,
        subtext: d.code ? d.code : undefined,
        areas: d.areas || [],
        raw: d
      };
    });

    return [...list, ...items];
  }

  onValueChange(val: any): void {
    this.value = val;
    this.onChange(val);
    this.onTouched();
    this.selectionChange.emit(val);

    const matched = this.activeDistricts.find(d =>
      this.valueField === 'id' ? d.id === val : d.name === val
    ) || null;
    this.districtChange.emit(matched);
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
