import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WireEvent, WireEventType } from './wire-v2.service';
import { OverlayModalService } from '../../../services/ux/overlay-modal';
import { WireCreatorComponent } from '../creator/creator.component';
import { FeaturesService } from '../../../services/features.service';
import { WireV2CreatorComponent } from './creator/wire-v2-creator.component';

/**
 * WireModal.present() options.default interface
 */
interface WireModalPresentDefaultOptions {
  type: string;
  min: number;
}

/**
 * WireModal.present options interface
 */
interface WireModalPresentOptions {
  default?: WireModalPresentDefaultOptions;
  disableThresholdCheck?: boolean;
}

/**
 * Handles Wire modal display
 */
@Injectable()
export class WireModalService {
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
   * Presents the modal and returns an Observable
   * @param entity
   * @param options
   */
  present(
    entity,
    options: WireModalPresentOptions = {}
  ): Observable<WireEvent> {
    const isV2 = this.features.has('pay');

    const component = isV2 ? WireV2CreatorComponent : WireCreatorComponent;
    const wrapperClass = isV2 ? 'm-modalV2__wrapper' : '';

    return new Observable<WireEvent>(subscriber => {
      let completed = false;

      this.overlayModal
        .create(component, entity, {
          ...options,
          onComplete: wire => {
            completed = true;

            subscriber.next({
              type: WireEventType.Completed,
              payload: wire,
            });

            subscriber.complete();
          },
          onDidDismiss: () => {
            if (!completed) {
              completed = true;

              subscriber.next({
                type: WireEventType.Cancelled,
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
            console.error('WireModalService.present', component, e);
          }
        }
      };
    });
  }
}
