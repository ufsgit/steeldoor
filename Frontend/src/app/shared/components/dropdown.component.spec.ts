import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { DropdownComponent } from './dropdown.component';
import { DistrictDropdownComponent } from './district-dropdown.component';
import { of } from 'rxjs';
import { District } from '../../core/models';
import { ChangeDetectorRef, ElementRef } from '@angular/core';

describe('DropdownComponent Unit Tests', () => {
  let component: DropdownComponent;

  beforeEach(() => {
    component = new DropdownComponent();
  });

  it('should create the dropdown component instance', () => {
    expect(component).toBeTruthy();
    expect(component.isOpen).toBe(false);
  });

  it('should correctly normalize string options', () => {
    component.options = ['Ernakulam', 'Trivandrum', 'Kozhikode'];
    expect(component.normalizedItems.length).toBe(3);
    expect(component.normalizedItems[0].label).toBe('Ernakulam');
    expect(component.normalizedItems[0].value).toBe('Ernakulam');
  });

  it('should correctly normalize object options with bindLabel and bindValue', () => {
    component.options = [
      { id: 'dist-ekm', name: 'Ernakulam', code: 'EKM' },
      { id: 'dist-tvm', name: 'Trivandrum', code: 'TVM' }
    ];
    component.bindLabel = 'name';
    component.bindValue = 'id';

    expect(component.normalizedItems.length).toBe(2);
    expect(component.normalizedItems[0].label).toBe('Ernakulam');
    expect(component.normalizedItems[0].value).toBe('dist-ekm');
    expect(component.normalizedItems[0].subtext).toBe('EKM');
  });

  it('should toggle and close the dropdown', () => {
    expect(component.isOpen).toBe(false);
    // Directly close when open
    component.isOpen = true;
    component.close();
    expect(component.isOpen).toBe(false);
  });

  it('should filter items when searchQuery is set', () => {
    component.options = [
      { label: 'Ernakulam Hub', value: 'Ernakulam' },
      { label: 'Trivandrum Hub', value: 'Trivandrum' },
      { label: 'Thrissur Hub', value: 'Thrissur' }
    ];

    component.searchQuery = 'Tri';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].label).toBe('Trivandrum Hub');
  });

  it('should filter district options by district areas', () => {
    const districts: District[] = [
      {
        id: 'dist-ekm',
        name: 'Ernakulam',
        stateId: 'KL',
        code: 'EKM',
        areas: ['Edapally', 'Kakkanad', 'Aluva']
      },
      {
        id: 'dist-tvm',
        name: 'Trivandrum',
        stateId: 'KL',
        code: 'TVM',
        areas: ['Pattom', 'Kowdiar']
      }
    ];

    component.options = districts;
    component.bindLabel = 'name';
    component.bindValue = 'name';

    component.searchQuery = 'Edapally';
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].label).toBe('Ernakulam');
    expect(component.filteredItems[0].matchedArea).toBe('Edapally');
  });

  it('should select an item and emit value change', () => {
    let emittedValue: any = null;
    component.selectionChange.subscribe(val => (emittedValue = val));

    const item = { raw: 'Ernakulam', label: 'Ernakulam', value: 'Ernakulam' };
    component.selectItem(item);

    expect(component.value).toBe('Ernakulam');
    expect(emittedValue).toBe('Ernakulam');
    expect(component.isOpen).toBe(false);
  });

  it('should clear selection when clear is called', () => {
    component.value = 'Ernakulam';
    let emittedValue: any = 'initial';
    component.selectionChange.subscribe(val => (emittedValue = val));

    const mockEvent = { stopPropagation: () => {}, preventDefault: () => {} } as unknown as Event;
    component.clear(mockEvent);

    expect(component.value).toBe('');
    expect(emittedValue).toBe('');
  });
});

describe('DistrictDropdownComponent Unit Tests', () => {
  let component: DistrictDropdownComponent;
  const mockDistricts: District[] = [
    { id: 'dist-ekm', name: 'Ernakulam', stateId: 'KL', code: 'EKM', areas: ['Edapally'] },
    { id: 'dist-tvm', name: 'Trivandrum', stateId: 'KL', code: 'TVM', areas: ['Pattom'] }
  ];

  beforeEach(() => {
    component = new DistrictDropdownComponent();
  });

  it('should create DistrictDropdownComponent instance', () => {
    expect(component).toBeTruthy();
  });

  it('should format districts with suffix Hub', () => {
    component.districts = mockDistricts;
    component.suffix = 'Hub';

    const options = component.formattedOptions;
    expect(options.length).toBe(2);
    expect(options[0].label).toBe('Ernakulam Hub');
    expect(options[0].value).toBe('Ernakulam');
  });

  it('should format districts with id valueField', () => {
    component.districts = mockDistricts;
    component.valueField = 'id';
    component.suffix = 'District';

    const options = component.formattedOptions;
    expect(options.length).toBe(2);
    expect(options[0].label).toBe('Ernakulam District');
    expect(options[0].value).toBe('dist-ekm');
  });

  it('should include allOptionLabel if showAllOption is true', () => {
    component.districts = mockDistricts;
    component.showAllOption = true;
    component.allOptionLabel = 'All Districts Hubs';

    const options = component.formattedOptions;
    expect(options.length).toBe(3);
    expect(options[0].label).toBe('All Districts Hubs');
    expect(options[0].value).toBe('');
  });

  it('should emit districtChange when value is updated', () => {
    component.districts = mockDistricts;
    let emittedDistrict: District | null = null;
    component.districtChange.subscribe(d => (emittedDistrict = d));

    component.onValueChange('Ernakulam');
    expect(component.value).toBe('Ernakulam');
    expect(emittedDistrict).not.toBeNull();
    expect(emittedDistrict?.name).toBe('Ernakulam');
  });
});
