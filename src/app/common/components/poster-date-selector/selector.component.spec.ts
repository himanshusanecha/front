import {
  async,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { PosterDateSelectorComponent } from './selector.component';
import { MaterialDateTimePickerDirective } from '../../directives/material/datetimepicker.directive';
import { FormsModule } from '@angular/forms';
import { MockComponent } from '../../../utils/mock';

describe('PosterDateSelectorComponent', () => {
  let comp: PosterDateSelectorComponent;
  let fixture: ComponentFixture<PosterDateSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PosterDateSelectorComponent,
        MaterialDateTimePickerDirective,
        MockComponent({
          selector: 'm-tooltip',
          template: '<ng-content></ng-content>',
          inputs: ['icon'],
        }),
      ],
      imports: [FormsModule],
    }).compileComponents(); // compile template and css
  }));

  // synchronous beforeEach
  beforeEach(done => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 10;
    jasmine.clock().uninstall();
    jasmine.clock().install();
    fixture = TestBed.createComponent(PosterDateSelectorComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();

    if (fixture.isStable()) {
      done();
    } else {
      fixture.whenStable().then(() => {
        done();
      });
    }
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should emit when onDateChange is called', fakeAsync(() => {
    spyOn(comp.dateChange, 'emit');
    comp.onDateChange('8/1/19, 11:00 AM');
    let newDate = new Date('8/1/19, 11:00 AM').getTime();
    newDate = Math.floor(+newDate / 1000);
    expect(comp.dateChange.emit).toHaveBeenCalledWith(newDate);
  }));
});
