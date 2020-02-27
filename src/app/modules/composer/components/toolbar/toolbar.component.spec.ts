import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent } from '../../../../utils/mock';
import fileMock from '../../../../mocks/dom/file.mock';
import { ToolbarComponent } from './toolbar.component';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';

describe('Composer Toolbar', () => {
  let comp: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

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

  it('should emit on attachment select', () => {
    spyOn(comp.onAttachmentSelectEmitter, 'emit');
    fixture.detectChanges();

    const file = fileMock();
    comp.onAttachmentSelect(file);
    expect(comp.onAttachmentSelectEmitter.emit).toHaveBeenCalledWith(file);
  });

  it('should emit on delete attachment click', () => {
    spyOn(comp.onDeleteAttachmentEmitter, 'emit');
    fixture.detectChanges();

    comp.onDeleteAttachmentClick();
    expect(comp.onDeleteAttachmentEmitter.emit).toHaveBeenCalled();
    expect(comp.fileUploadComponent.reset).toHaveBeenCalled();
  });

  it('should emit on post', () => {
    spyOn(comp.onPostEmitter, 'emit');
    fixture.detectChanges();

    const action: ButtonComponentAction = { type: 'mock' };
    comp.onPost(action);
    expect(comp.onPostEmitter.emit).toHaveBeenCalledWith(action);
  });
});
