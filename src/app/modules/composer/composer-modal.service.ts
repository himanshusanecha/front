import { Injectable, Injector } from '@angular/core';
import { OverlayModalService } from '../../services/ux/overlay-modal';
import { BaseComponent } from './components/base/base.component';

/**
 * Global service to open a composer modal
 */
@Injectable()
export class ComposerModalService {
  protected injector: Injector;

  constructor(protected overlayModal: OverlayModalService) {}

  /**
   * Sets the calling component's injector for DI.
   *
   * @param injector
   */
  setInjector(injector: Injector): ComposerModalService {
    this.injector = injector;
    return this;
  }

  /**
   * Presents the composer modal using the caller component's dependency injector. It returns
   * a promise which will hold the newly created entity, or null if cancelled.
   *
   * @param activity
   */
  present(activity?: any): Promise<any> {
    if (!this.injector) {
      throw new Error(
        "You need to set the caller component's dependency injector before calling .present()"
      );
    }

    return new Promise<any>((resolve, reject) => {
      let resolved = false;

      try {
        this.overlayModal
          .create(
            BaseComponent,
            {
              activity,
            },
            {
              wrapperClass: 'm-composer__modal',
              onPost: response => {
                this.injector = void 0;
                resolve(response);
                resolved = true;
                this.overlayModal.dismiss();
              },
            },
            this.injector
          )
          .onDidDismiss(() => {
            this.injector = void 0;

            if (!resolved) {
              resolve(null);
            }
          })
          .present();
      } catch (e) {
        this.injector = void 0;
        reject(e);
      }
    });
  }

  dismiss() {
    this.overlayModal.dismiss();
  }
}
