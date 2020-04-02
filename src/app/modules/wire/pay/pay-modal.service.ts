import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PayEvent, PayEventType } from './pay.service';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { WireCreatorComponent } from '../creator/creator.component';
import { FeaturesService } from '../../../services/features.service';
import { PayComponent } from './pay.component';

/**
 * PayModal.present() options.default interface
 */
interface PayModalPresentDefaultOptions {
  type: string;
  min: number;
}

/**
 * PayModal.present options interface
 */
interface PayModalPresentOptions {
  default?: PayModalPresentDefaultOptions;
  disableThresholdCheck?: boolean;
}

/**
 * Handles Pay modal display
 */
@Injectable()
export class PayModalService {
  /**
   * Constructor
   * @param features
   * @param overlayModal
   */
  constructor(
    protected features: FeaturesService,
    protected overlayModal: OverlayModalService
  ) {}

  /**
   * Presents the Pay modal and returns an Observable
   * @param entity
   * @param options
   */
  present(entity, options: PayModalPresentOptions = {}): Observable<PayEvent> {
    const isPay = this.features.has('pay');

    const component = isPay ? PayComponent : WireCreatorComponent;
    const wrapperClass = isPay ? 'm-modalV2__wrapper' : '';

    return new Observable<PayEvent>(subscriber => {
      let completed = false;

      this.overlayModal
        .create(component, entity, {
          ...options,
          onComplete: wire => {
            completed = true;

            subscriber.next({
              type: PayEventType.Completed,
              payload: wire,
            });

            subscriber.complete();
          },
          onDidDismiss: () => {
            if (!completed) {
              completed = true;

              subscriber.next({
                type: PayEventType.Cancelled,
              });

              subscriber.complete();
            }
          },
          wrapperClass,
        })
        .present();

      return () => {
        if (!completed) {
          try {
            this.overlayModal.dismiss();
          } catch (e) {
            console.error('PayModalService.present', component, e);
          }
        }
      };
    });
  }
}
