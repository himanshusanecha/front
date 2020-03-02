import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '../../../../utils/mock';
import { TitleBarComponent } from './title-bar.component';

describe('Composer Title Bar', () => {
  let comp: TitleBarComponent;
  let fixture: ComponentFixture<TitleBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        TitleBarComponent,
        MockComponent({
          selector: 'm-dropdownMenu',
          inputs: ['menu', 'triggerClass', 'menuClass'],
        }),
        MockComponent({
          selector: 'm-icon',
          inputs: ['iconId'],
        }),
      ],
    }).compileComponents();
  }));

  beforeEach(done => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;
    fixture = TestBed.createComponent(TitleBarComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();

    if (fixture.isStable()) {
      done();
    } else {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
        done();
      });
    }
  });

  it('should emit on visibility change', () => {
    comp.canChangeVisibility = true;
    spyOn(comp.onVisibilityEmitter, 'emit');
    fixture.detectChanges();

    comp.onVisibilityClick('2');
    expect(comp.onVisibilityEmitter.emit).toHaveBeenCalledWith('2');
  });

  it('should not emit visibility change if disabled', () => {
    comp.canChangeVisibility = false;
    spyOn(comp.onVisibilityEmitter, 'emit');
    fixture.detectChanges();

    comp.onVisibilityClick('2');
    expect(comp.onVisibilityEmitter.emit).not.toHaveBeenCalled();
  });

  it('should emit on license change', () => {
    spyOn(comp.onLicenseEmitter, 'emit');
    fixture.detectChanges();

    comp.onLicenseClick('spec-test');
    expect(comp.onLicenseEmitter.emit).toHaveBeenCalledWith('spec-test');
  });
});
