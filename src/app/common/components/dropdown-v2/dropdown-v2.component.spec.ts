import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownV2Component } from './dropdown-v2.component';

describe('DropdownV2Component', () => {
  let component: DropdownV2Component;
  let fixture: ComponentFixture<DropdownV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DropdownV2Component],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
