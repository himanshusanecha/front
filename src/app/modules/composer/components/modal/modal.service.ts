import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { OverlayModalService } from '../../../../services/ux/overlay-modal';
import { ModalComponent } from './modal.component';

/**
 * Composer data structure
 */
export type ComposerData = {
  activity?: any;
  containerGuid?: any;
};

/**
 * Global service to open a composer modal
 */
@Injectable()
export class ModalService {
  protected injector: Injector;

  constructor(protected overlayModal: OverlayModalService) {}

  /**
   * Sets the calling component's injector for DI.
   *
   * @param injector
   */
  setInjector(injector: Injector): ModalService {
    this.injector = injector;
    return this;
  }

  /**
   * Injects data onto Composer service, as it would be passed to the component itself
   *
   * @param data
   */
  setData(data: ComposerData) {
    // TODO: Inject data straight into injector's ComposerService instance
    throw new Error('Not implemented');
  }

  /**
   * Presents the composer modal with a custom injector tree
   */
  present(): Observable<any> {
    if (!this.injector) {
      throw new Error(
        "You need to set the caller component's dependency injector before calling .present()"
      );
    }

    return new Observable<any>(subscriber => {
      let modalOpen = true;

      try {
        this.overlayModal
          .create(
            ModalComponent,
            null,
            {
              wrapperClass: 'm-composer__modalWrapper',
              onPost: response => {
                subscriber.next(response);
                this.dismiss();
              },
              onDismissIntent: () => {
                this.dismiss();
              },
            },
            this.injector
          )
          .onDidDismiss(() => {
            modalOpen = false;
            subscriber.complete();
          })
          .present();
      } catch (e) {
        subscriber.error(e);
      }

      return () => {
        this.injector = void 0;

        if (modalOpen) {
          this.dismiss();
        }
      };
    });
  }

  /**
   * Dismisses the modal
   */
  dismiss() {
    this.overlayModal.dismiss();
  }
}
