import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockService } from '../../../../utils/mock';
import { ComposerService } from '../../services/composer.service';
import { PreviewComponent } from './preview.component';
import { ConfigsService } from '../../../../common/services/configs.service';

describe('Composer Preview', () => {
  let comp: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  const composerServiceMock: any = MockService(ComposerService, {
    removeAttachment: true,
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PreviewComponent,
        MockComponent({
          selector: 'm-icon',
          inputs: ['from', 'iconId', 'sizeFactor'],
        }),
      ],
      providers: [
        {
          provide: ComposerService,
          useValue: composerServiceMock,
        },
        {
          provide: ConfigsService,
          useValue: MockService(ConfigsService),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(done => {
    jasmine.MAX_PRETTY_PRINT_DEPTH = 2;
    fixture = TestBed.createComponent(PreviewComponent);
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

  it('should set portrait for an image', () => {
    const img = document.createElement('img');
    spyOnProperty(img, 'naturalWidth').and.returnValue(1000);
    spyOnProperty(img, 'naturalHeight').and.returnValue(2000);
    fixture.detectChanges();

    comp.fitForImage(img);
    expect(comp.portrait).toBe(true);
  });

  it('should set landscape for an image', () => {
    const img = document.createElement('img');
    spyOnProperty(img, 'naturalWidth').and.returnValue(2000);
    spyOnProperty(img, 'naturalHeight').and.returnValue(1000);
    fixture.detectChanges();

    comp.fitForImage(img);
    expect(comp.portrait).toBe(false);
  });

  it('should set portrait for an video', () => {
    const video = document.createElement('video');
    spyOnProperty(video, 'videoWidth').and.returnValue(1000);
    spyOnProperty(video, 'videoHeight').and.returnValue(2000);
    fixture.detectChanges();

    comp.fitForVideo(video);
    expect(comp.portrait).toBe(true);
  });

  it('should set landscape for an video', () => {
    const video = document.createElement('video');
    spyOnProperty(video, 'videoWidth').and.returnValue(2000);
    spyOnProperty(video, 'videoHeight').and.returnValue(1000);
    fixture.detectChanges();

    comp.fitForVideo(video);
    expect(comp.portrait).toBe(false);
  });

  it('should remove an attachment', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    fixture.detectChanges();
    comp.remove();
    expect(window.confirm).toHaveBeenCalled();
    expect(composerServiceMock.removeAttachment).toHaveBeenCalled();
  });
});
