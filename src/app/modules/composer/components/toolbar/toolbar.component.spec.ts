import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockService } from '../../../../utils/mock';
import { ToolbarComponent } from './toolbar.component';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';
import { ComposerService } from '../../composer.service';

describe('Composer Title Bar', () => {
  let comp: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  const composerServiceMock: any = MockService(ComposerService, {});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ToolbarComponent,
        MockComponent(
          {
            selector: 'm-file-upload',
            outputs: ['onSelect'],
          },
          ['reset']
        ),
        MockComponent({
          selector: 'm-icon',
          inputs: ['iconId'],
        }),
        MockComponent({
          selector: 'm-button',
          inputs: ['disabled', 'dropdown'],
          outputs: ['onAction'],
        }),
      ],
      providers: [
        {
          provide: ComposerService,
          useValue: composerServiceMock,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(done => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;
    fixture = TestBed.createComponent(ToolbarComponent);
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

  it('should emit on post', () => {
    spyOn(comp.onPostEmitter, 'emit');
    fixture.detectChanges();

    const action: ButtonComponentAction = { type: 'mock' };
    comp.onPost(action);
    expect(comp.onPostEmitter.emit).toHaveBeenCalledWith(action);
  });
});
