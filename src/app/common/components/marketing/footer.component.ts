import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
  OnInit,
  HostListener,
  Injector,
  SkipSelf,
} from '@angular/core';
import { ConfigsService } from '../../services/configs.service';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { LanguageModalComponent } from '../language-modal/language-modal.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'm-marketing__footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'footer.component.html',
})
export class MarketingFooterComponent implements OnInit {
  //TODO: Replace for property of service.
  readonly languages = [
    'Español',
    'English (US)',
    'Deutsch',
    'Français',
    'Português',
    'العربية',
    'Tiếng Việt',
    'Polski',
    'абаза бызшва (abaza bəzš˚a)',
    'Alnôba',
    'аҧсуа бызшәа (aṗsua byzš˚a)',
    'адыгэбзэ (adəgăbză)',
    'ʿAfár af',
    'Afrikaans',
    'アイヌ イタク/Aynu itak',
    'akan',
    'shqip / gjuha shqipe',
    'Unangam tunuu',
    'ኣማርኛ (amarəñña)',
    'Ndéé',
    'Fabla / l’Aragonés',
    'Aranés',
    'Basa Bali',
    'بلوچی',
  ];

  // TODO: Replace with value from service.
  readonly currentLanguage$: BehaviorSubject<string> = new BehaviorSubject<
    string
  >('English (US)');

  readonly year: number = new Date().getFullYear();

  readonly cdnAssetsUrl: string;
  isMobile: boolean;

  constructor(
    private configs: ConfigsService,
    protected cd: ChangeDetectorRef,
    private overlayModal: OverlayModalService,
    @SkipSelf() private injector: Injector
  ) {
    this.cdnAssetsUrl = configs.get('cdn_assets_url');
  }

  ngOnInit() {
    this.onResize();
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 480;

    this.detectChanges();
  }

  detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  /**
   * Opens language selection modal.
   */
  openLanguageModal(): void {
    this.overlayModal
      .create(
        LanguageModalComponent,
        null,
        {
          wrapperClass: 'm-modalV2__wrapper',
          onSave: language => {
            this.onLanguageSelect(language);
            this.overlayModal.dismiss();
          },
          onDismissIntent: () => {
            this.overlayModal.dismiss();
          },
        },
        this.injector
      )
      .onDidDismiss(() => {
        console.log('closed tag settings');
      })
      .present();
  }

  /**
   * Called on language selection.
   * @param language - language to pass to currentLanguage$
   */
  onLanguageSelect(language: string): void {
    this.currentLanguage$.next(language);
  }
}
